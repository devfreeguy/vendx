import { prisma } from "@/lib/prisma";
import { TransactionStatus } from "@prisma/client";
import { nanoid } from "nanoid";
import axios from "axios";

interface TransactionMetadata {
  blockHeight: number;
  confirmedAt: Date | null;
  isSufficient: boolean;
  isOverpaid: boolean;
  confirmations?: number;
}

interface ParsedTransaction {
  txHash: string;
  amount?: number;
  confirmations?: number;
}

function isTransactionMetadata(value: unknown): value is TransactionMetadata {
  if (!value || typeof value !== "object") return false;
  const obj = value as any;
  return (
    typeof obj.blockHeight === "number" &&
    typeof obj.isSufficient === "boolean" &&
    typeof obj.isOverpaid === "boolean" &&
    (obj.confirmedAt === null ||
      obj.confirmedAt instanceof Date ||
      typeof obj.confirmedAt === "string")
  );
}

export class BchMonitorServiceAPI {
  // Multiple API endpoints as fallbacks
  // Prioritize Blockchain.info as it returns amount/details in the list view
  private apis = [
    {
      name: "Blockchain.info (BCH)",
      getAddress: (addr: string) =>
        `https://api.blockchain.info/bch/multiaddr?active=${addr}`,
      getTx: (txid: string) => `https://api.blockchain.info/bch/rawtx/${txid}`,
    },
    {
      name: "FullStack.cash",
      getAddress: (addr: string) =>
        `https://api.fullstack.cash/v5/electrumx/transactions/${addr}`,
      getTx: (txid: string) =>
        `https://api.fullstack.cash/v5/electrumx/tx/data/${txid}`,
    },
    {
      name: "Bitcoin.com",
      getAddress: (addr: string) =>
        `https://rest.bitcoin.com/v2/address/transactions/${addr}`,
      getTx: (txid: string) =>
        `https://rest.bitcoin.com/v2/transaction/details/${txid}`,
    },
  ];

  private currentApiIndex = 0;

  // Clean BCH address (remove prefix)
  private cleanAddress(address: string): string {
    return address.replace("bitcoincash:", "");
  }

  // Convert legacy address to CashAddr if needed
  private toCashAddress(address: string): string {
    try {
      const bchaddr = require("bchaddrjs");
      return bchaddr.toCashAddress(address);
    } catch {
      return address;
    }
  }

  // Fetch with fallback to next API
  private async fetchWithFallback<T>(
    urlGetter: (api: (typeof this.apis)[0]) => string,
    parser: (data: any, apiName: string) => T,
  ): Promise<T> {
    const errors: Error[] = [];

    for (let i = 0; i < this.apis.length; i++) {
      const apiIndex = (this.currentApiIndex + i) % this.apis.length;
      const api = this.apis[apiIndex];

      try {
        console.log(`🔍 Trying ${api.name}...`);
        const url = urlGetter(api);
        // Reduced timeout to 3.5s to allow failover within global limit
        const response = await axios.get(url, {
          timeout: 3500,
          headers: {
            "User-Agent": "VendX-Monitor/1.0",
          },
        });

        const result = parser(response.data, api.name);
        console.log(`✅ Success with ${api.name}`);
        this.currentApiIndex = apiIndex; // Remember successful API
        return result;
      } catch (error: any) {
        console.warn(
          `⚠️ ${api.name} failed:`,
          error.response?.status || error.message,
        );
        errors.push(error);
      }
    }

    // All APIs failed
    throw new Error(
      `All APIs failed: ${errors.map((e) => e.message).join(", ")}`,
    );
  }

  // Parse transaction list from different APIs
  // Returns ParsedTransaction[] which may contain amount if available
  private parseAddressTransactions(
    data: any,
    apiName: string,
    targetAddress: string,
  ): ParsedTransaction[] {
    switch (apiName) {
      case "FullStack.cash":
        // FullStack returns { success: true, transactions: [...] }
        // Transactions only contain tx_hash and height, no value
        return (
          data.transactions?.map((tx: any) => ({
            txHash: tx.tx_hash,
            confirmations: tx.height > 0 ? 1 : 0, // Approximate
          })) || []
        );

      case "Bitcoin.com":
        // Bitcoin.com returns array of transactions with details
        const txs = Array.isArray(data) ? data : data.txs || [];
        return txs.map((tx: any) => {
          // Calculate amount for our address
          // Note: Bitcoin.com V2 might not return value in address calls depending on endpoint
          // But assuming it does similar to details:
          return {
            txHash: tx.txid,
            confirmations: tx.confirmations,
          };
        });

      case "Blockchain.info (BCH)":
        // Blockchain.info returns { txs: [...] } with full details
        return (
          data.txs?.map((tx: any) => {
            let amount = 0;
            // Parse outputs for our address
            const bchaddr = require("bchaddrjs");
            let targetCash = targetAddress;
            try {
              targetCash = bchaddr.toCashAddress(targetAddress);
            } catch (e) {
              // keep as is if conversion fails
            }

            for (const output of tx.out || []) {
              if (output.addr) {
                try {
                  const outputCash = bchaddr.toCashAddress(output.addr);
                  if (outputCash === targetCash) {
                    amount += output.value / 100000000; // Satoshis to BCH
                  }
                } catch (e) {
                  // Fallback to strict comparison if conversion fails
                  if (output.addr === targetAddress) {
                    amount += output.value / 100000000;
                  }
                }
              }
            }
            return {
              txHash: tx.hash,
              confirmations: tx.block_height ? 1 : 0,
              amount: amount,
            };
          }) || []
        );

      default:
        return [];
    }
  }

  async checkAddressForTransactions(address: string, orderId: string) {
    try {
      const cleanAddr = this.cleanAddress(address);

      // Fetch transaction list
      const txList = await this.fetchWithFallback(
        (api) => api.getAddress(cleanAddr),
        (data, apiName) =>
          this.parseAddressTransactions(data, apiName, cleanAddr),
      );

      console.log(`Found ${txList.length} transactions for ${cleanAddr}`);

      for (const tx of txList) {
        // Check if already processed
        // We check using txHash
        const existingTx = await prisma.transaction.findFirst({
          where: { txHash: tx.txHash },
        });

        if (existingTx) {
          // If existing tx is PENDING but now has confirmations, we might want to update it?
          // The checkConfirmations method handles this usually.
          // But if we have info here, we can optimize.
          continue;
        }

        let amount = tx.amount;
        let confirmations = tx.confirmations || 0;

        // If amount is missing (e.g. from FullStack), we must fetch details
        if (amount === undefined) {
          console.log(`Fetching details for ${tx.txHash}...`);
          try {
            const txDetails = await this.fetchWithFallback(
              (api) => api.getTx(tx.txHash),
              (data, apiName) =>
                this.parseTransactionDetails(data, apiName, cleanAddr),
            );
            amount = txDetails.amount;
            confirmations = txDetails.confirmations;
          } catch (e) {
            console.error(`Failed to fetch details for ${tx.txHash}`, e);
            continue;
          }
        }

        if (amount && amount > 0) {
          await this.recordTransaction(
            orderId,
            tx.txHash,
            amount,
            confirmations,
          );
        }
      }
    } catch (error) {
      console.error(`Error checking transactions for ${address}:`, error);
      throw error;
    }
  }

  // Parse transaction details from different APIs
  private parseTransactionDetails(
    data: any,
    apiName: string,
    targetAddress: string,
  ): { amount: number; confirmations: number } {
    let amount = 0;
    let confirmations = 0;

    switch (apiName) {
      case "FullStack.cash":
        confirmations = data.confirmations || 0;
        // Parse outputs
        for (const output of data.vout || []) {
          if (output.scriptPubKey?.addresses?.includes(targetAddress)) {
            amount += output.value;
          }
        }
        break;

      case "Bitcoin.com":
        confirmations = data.confirmations || 0;
        // Parse outputs
        for (const output of data.vout || []) {
          const addresses = output.scriptPubKey?.addresses || [];
          if (addresses.some((addr: string) => addr.includes(targetAddress))) {
            amount += parseFloat(output.value || "0");
          }
        }
        break;

      case "Blockchain.info (BCH)":
        confirmations = data.block_height ? 1 : 0; // Simplified
        // Parse outputs
        for (const output of data.out || []) {
          if (output.addr === targetAddress) {
            amount += output.value / 100000000; // Satoshis to BCH
          }
        }
        break;
    }

    return { amount, confirmations };
  }

  private async recordTransaction(
    orderId: string,
    txHash: string,
    amount: number,
    confirmations: number,
  ) {
    const status: TransactionStatus =
      confirmations > 0 ? "CONFIRMED" : "PENDING";

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`Order ${orderId} not found for tx ${txHash}`);
      return;
    }

    const epsilon = 0.00000001;
    const isSufficient = amount >= order.bchAmount - epsilon;
    const isOverpaid = amount > order.bchAmount + epsilon;

    const metadata: TransactionMetadata = {
      blockHeight: confirmations > 0 ? confirmations : 0,
      confirmedAt: confirmations > 0 ? new Date() : null,
      isSufficient,
      isOverpaid,
      confirmations,
    };

    await prisma.transaction.create({
      data: {
        orderId,
        txHash,
        amount,
        currency: "BCH",
        type: "PAYMENT",
        status,
        metadata: metadata as any,
      },
    });

    console.log(
      `✅ Recorded tx ${txHash} for order ${orderId}: ${amount} BCH (${status}) [Sufficient: ${isSufficient}]`,
    );

    if (!isSufficient) {
      console.warn(
        `⚠️ Underpayment: Expected ${order.bchAmount}, got ${amount}`,
      );
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "UNDERPAID" },
      });
    } else {
      if (isOverpaid) {
        const excess = amount - order.bchAmount;
        console.log(`💰 Overpayment: ${excess} BCH excess`);

        let wallet = await prisma.wallet.findUnique({
          where: { userId: order.buyerId },
        });

        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: {
              id: nanoid(),
              userId: order.buyerId,
            },
          });
        }

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
      }

      // If confirmed, mark order as PAID
      if (confirmations > 0) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });
        console.log(`✅ Order ${orderId} marked as PAID`);
      } else {
        // 0-conf: Just recorded as PENDING (which saves it from expiration), do NOT mark order as PAID yet.
        console.log(
          `⏳ Tx records as PENDING (0-conf). Order logic will wait for confirmation.`,
        );
      }
    }
  }

  async checkConfirmations(orderId: string) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: { orderId, type: "PAYMENT" },
        orderBy: { createdAt: "desc" },
      });

      if (!transaction || !transaction.txHash) return;

      // Fetch latest transaction data
      const txDetails = await this.fetchWithFallback(
        (api) => api.getTx(transaction.txHash as string),
        (data, apiName) => {
          switch (apiName) {
            case "FullStack.cash":
            case "Bitcoin.com":
              return { confirmations: data.confirmations || 0 };
            case "Blockchain.info (BCH)":
              return { confirmations: data.block_height ? 1 : 0 };
            default:
              return { confirmations: 0 };
          }
        },
      );

      const confirmations = txDetails.confirmations;

      if (confirmations >= 1 && transaction.status !== "CONFIRMED") {
        const existingMetadata = isTransactionMetadata(transaction.metadata)
          ? transaction.metadata
          : ({} as TransactionMetadata);

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "CONFIRMED",
            metadata: {
              ...existingMetadata,
              confirmations,
              confirmedAt: new Date(),
            } as any,
          },
        });

        if (
          isTransactionMetadata(transaction.metadata) &&
          transaction.metadata.isSufficient === true
        ) {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
          });

          if (
            order &&
            order.status !== "PAID" &&
            order.status !== "COMPLETED"
          ) {
            await prisma.order.update({
              where: { id: orderId },
              data: { status: "PAID" },
            });
            console.log(
              `✅ Order ${orderId} finalized (PAID) with ${confirmations} confirmations`,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `Error checking confirmations for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }

  async disconnect() {
    // No persistent connection for REST APIs
    console.log("✅ API monitor disconnected");
  }

  async checkExpiredOrders() {
    const now = new Date();

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        rateExpiresAt: { lt: now },
      },
      include: {
        items: true,
      },
    });

    for (const order of expiredOrders) {
      const tx = await prisma.transaction.findFirst({
        where: { orderId: order.id },
      });

      if (!tx) {
        try {
          await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }

            await tx.order.update({
              where: { id: order.id },
              data: { status: "EXPIRED" },
            });
          });

          console.log(
            `✅ Order ${order.id} marked as EXPIRED and stock returned`,
          );
        } catch (error) {
          console.error(`❌ Failed to expire order ${order.id}:`, error);
        }
      }
    }
  }
}
