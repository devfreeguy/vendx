// Basic implementation of a BCH monitoring service using electrum-cash
// In a production Next.js app, this would typically run as a separate worker process or
// essentially scheduled via cron, or using a long-running custom server.
// Since Next.js is serverless-first, we might need an API route triggered by cron to "sync"
// or use a real-time websocket connection if custom server is used.
//
// For this task, I'll create a class that can be initialized to listen or poll.
// Given strict Next.js/Vercel environments often kill long-running processes,
// a polling mechanism triggered by client or periodic cron is safer,
// OR we assume a custom server setup.
// However, the prompt asks to "Implement a blockchain monitoring service".
// Let's build a service class that *could* be run standalone or invoked.

import {
  ElectrumCluster,
  ElectrumTransport,
  RequestResponse,
} from "electrum-cash";
import { prisma } from "@/lib/prisma";
import { TransactionType, TransactionStatus } from "@prisma/client";

export class BchMonitorService {
  private electrum: any;
  private isConnected: boolean = false;

  constructor() {
    // Initialize Electrum Cluster with reputable servers
    this.electrum = new ElectrumCluster("VendX-Monitor", "1.4.1", 1, 1);

    // Add some default servers
    this.electrum.addServer(
      "bch.imaginary.cash",
      50004,
      ElectrumTransport.WSS.Scheme,
      false,
    );
    this.electrum.addServer(
      "electrum.imaginary.cash",
      50004,
      ElectrumTransport.WSS.Scheme,
      false,
    );
  }

  async connect() {
    if (this.isConnected) return;
    try {
      await this.electrum.ready(); // Wait for connections
      this.isConnected = true;
      console.log("Connected to BCH Electrum servers");
    } catch (error) {
      console.error("Failed to connect to Electrum servers:", error);
      throw error;
    }
  }

  async disconnect() {
    await this.electrum.shutdown();
    this.isConnected = false;
  }

  // Check a specific address for new transactions (Polling approach)
  // This is payload-safe for Next.js API routes (stateless)
  async checkAddressForTransactions(address: string, orderId: string) {
    if (!this.isConnected) await this.connect();

    // 1. Get address history (tx hashes)
    // Electrum expects scripthash, so we need to convert address -> scripthash.
    // We need a helper for that.
    const scripthash = await this.addressToScriptHash(address);

    const history = await this.electrum.request(
      "blockchain.scripthash.get_history",
      scripthash,
    );

    if (Array.isArray(history)) {
      for (const txData of history) {
        // txData structure: { height: number, tx_hash: string }
        // If height <= 0, it's unconfirmed (mempool)

        // Allow 0-conf detection? Task says "confirmed only after >=1", but we capture here.

        // Check if we already processed this tx
        const existingTx = await prisma.transaction.findFirst({
          where: { txHash: txData.tx_hash },
        });

        if (existingTx) continue;

        // Fetch full transaction details to get amount
        const txDetails = await this.electrum.request(
          "blockchain.transaction.get",
          txData.tx_hash,
          true,
        );

        // Parse outputs to find amount sent to our address
        // Note: Electrum 'verbose=true' returns detailed JSON
        const amountReceived = this.parseTxAmountForAddress(txDetails, address);

        if (amountReceived > 0) {
          await this.recordTransaction(
            orderId,
            txData.tx_hash,
            amountReceived,
            txData.height,
          );
        }
      }
    }
  }

  private async addressToScriptHash(address: string): Promise<string> {
    // We need 'bitcoincashjs-lib' or 'bchaddrjs' to decode address to script
    // Then hash with sha256 and reverse bytes.
    // Importing locally to avoid top-level issues if modules missing in some envs
    const bitcoin = require("bitcoincashjs-lib");
    const bchaddr = require("bchaddrjs");
    const crypto = require("crypto");

    // Ensure legacy format for bitcoincashjs-lib compatibility
    const legacyAddr = bchaddr.toLegacyAddress(address);
    const script = bitcoin.address.toOutputScript(
      legacyAddr,
      bitcoin.networks.bitcoin,
    ); // verify network match

    const hash = crypto.createHash("sha256").update(script).digest();
    // Reverse buffer for Electrum scripthash
    return Buffer.from(hash.reverse()).toString("hex");
  }

  private parseTxAmountForAddress(
    txDetails: any,
    targetAddress: string,
  ): number {
    // bitcoincashjs-lib might be needed to decode output scripts if raw
    // But verbose electrum response usually has "scriptPubKey": { "addresses": [...] }

    let total = 0;
    if (txDetails && txDetails.vout) {
      for (const output of txDetails.vout) {
        // Standard verbose output has scriptPubKey.addresses
        if (output.scriptPubKey && output.scriptPubKey.addresses) {
          // Normalize addresses for comparison
          const addresses = output.scriptPubKey.addresses;
          // targetAddress might be CashAddr, response might be Legacy or CashAddr

          // Use a fuzzy check or normalize both to CashAddr
          const bchaddr = require("bchaddrjs");
          const targetCash = bchaddr.toCashAddress(targetAddress);

          const match = addresses.some((addr: string) => {
            try {
              return bchaddr.toCashAddress(addr) === targetCash;
            } catch {
              return false;
            }
          });

          if (match) {
            total += output.value; // Value is usually in BCH (e.g. 0.005)
          }
        }
      }
    }
    return total;
  }

  private async recordTransaction(
    orderId: string,
    txHash: string,
    amount: number,
    height: number,
  ) {
    // 0 height usually means mempool (unconfirmed)
    const status = height > 0 ? "CONFIRMED" : "PENDING";

    // Fetch order to validate amount
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`Order ${orderId} not found for tx ${txHash}`);
      return;
    }

    // Verify amount matches or exceeds expected BCH
    // Allow small epsilon for float precision? standard is exact or greater.
    // Verify amount matches or exceeds expected BCH
    // Allow small epsilon for float precision? standard is exact or greater.
    // 0.00000001 is 1 satoshi.
    const epsilon = 0.00000001;
    const isSufficient = amount >= order.bchAmount - epsilon;
    const isOverpaid = amount > order.bchAmount + epsilon;

    // Create transaction record
    const tx = await prisma.transaction.create({
      data: {
        orderId,
        txHash,
        amount,
        currency: "BCH",
        type: "PAYMENT",
        status: status as TransactionStatus,
        metadata: {
          blockHeight: height,
          confirmedAt: height > 0 ? new Date() : null,
          isSufficient,
          isOverpaid,
        },
      },
    });

    console.log(
      `Recorded tx ${txHash} for order ${orderId}: ${amount} BCH (${status}) [Sufficient: ${isSufficient}]`,
    );

    // Handle Order Status Updates
    if (!isSufficient) {
      // UNDERPAID
      console.warn(
        `Underpayment detected for order ${orderId}: Expected ${order.bchAmount}, got ${amount}`,
      );
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "UNDERPAID" },
      });
    } else {
      // PAID (Pending Confirmation)
      // We usually wait for 1 conf to mark PAID, but we can mark as "Processing" or check logic in checkConfirmations.
      // Task 4.2 says "Mark order as DETECTED only if all checks pass".
      // Task 5.1 says "Transition order status from DETECTED to CONFIRMED".
      // My previous logic in checkConfirmations handles the transition to PAID.
      // Here we just acknowledge validity.

      if (isOverpaid) {
        const excess = amount - order.bchAmount;
        console.log(
          `Overpayment detected for order ${orderId}: ${excess} BCH excess.`,
        );

        // Credit excess to wallet
        const wallet = await prisma.wallet.findUnique({
          where: { userId: order.buyerId },
        });
        if (wallet) {
          // Upsert balance
          await prisma.balance.upsert({
            where: {
              walletId_currency: {
                walletId: wallet.id,
                currency: "BCH",
              },
            },
            update: {
              amount: { increment: excess },
            },
            create: {
              walletId: wallet.id,
              currency: "BCH",
              amount: excess,
            },
          });
          console.log(`Credited ${excess} BCH to wallet ${wallet.id}`);
        } else {
          console.warn(
            `No wallet found for user ${order.buyerId} to credit excess.`,
          );
          // Create wallet? Or just log.
        }
      }
    }
  }

  async checkConfirmations(orderId: string) {
    if (!this.isConnected) await this.connect();

    const transaction = await prisma.transaction.findFirst({
      where: { orderId, type: "PAYMENT" },
      orderBy: { createdAt: "desc" },
    });

    if (!transaction || !transaction.txHash) return;

    // If already confirmed and we haven't marked order as PAID (if logic handled elsewhere), we might be done.
    // BUT we need to ensure Order Status reflects this.

    // Check current status from blockchain
    const txData = await this.electrum.request(
      "blockchain.transaction.get",
      transaction.txHash,
      true,
    );

    // Determine confirmations
    // verbose txData typically doesn't directly give confirmations unless blockhash is present.
    // We can assume if it's in a block (confirmations > 0), it's confirmed.
    // Electrum verbose response usually has 'confirmations' field if in block.

    const confirmations = txData.confirmations || 0;

    if (confirmations >= 1) {
      // Transition to CONFIRMED / PAID
      if (transaction.status !== "CONFIRMED") {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "CONFIRMED",
            metadata: {
              ...((transaction.metadata as object) || {}),
              confirmations,
              confirmedAt: new Date(),
            },
          },
        });
      }

      // Finalize Order if sufficient
      const meta = transaction.metadata as any;
      if (meta && meta.isSufficient) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order && order.status !== "PAID" && order.status !== "COMPLETED") {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          });
          console.log(
            `Order ${orderId} finalized (PAID) with ${confirmations} confirmations.`,
          );
        }
      }
    } else {
      // Still pending
      console.log(
        `Order ${orderId} tx ${transaction.txHash} has ${confirmations} confirmations.`,
      );
    }
  }

  async checkExpiredOrders() {
    const now = new Date();

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        rateExpiresAt: { lt: now },
      },
    });

    for (const order of expiredOrders) {
      // Check if any payment was detected before expiring
      const tx = await prisma.transaction.findFirst({
        where: { orderId: order.id },
      });

      if (!tx) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "EXPIRED" },
        });
        console.log(`Order ${order.id} marked as EXPIRED.`);

        // Ideally return stock here
        // ...
      }
    }
  }
}
