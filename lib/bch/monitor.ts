import { prisma } from "@/lib/prisma";
import { TransactionStatus } from "@prisma/client";
import { ElectrumCluster, ElectrumTransport } from "electrum-cash";
import { nanoid } from "nanoid";

interface ElectrumTransaction {
  confirmations?: number;
  blockhash?: string;
  blocktime?: number;
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: any[];
  vout: Array<{
    value: number;
    n: number;
    scriptPubKey: {
      asm: string;
      hex: string;
      type: string;
      addresses?: string[];
    };
  }>;
}

interface ElectrumHistoryItem {
  height: number;
  tx_hash: string;
  fee?: number;
}

interface TransactionMetadata {
  blockHeight: number;
  confirmedAt: Date | null;
  isSufficient: boolean;
  isOverpaid: boolean;
  confirmations?: number;
}

// Type guard function for runtime validation
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

export class BchMonitorService {
  private electrum: any;
  private isConnected: boolean = false;
  private connectionTimeout: number = 8000; // 8 seconds

  constructor() {
    // Initialize Electrum Cluster with reputable servers
    this.electrum = new ElectrumCluster("VendX-Monitor", "1.4.1", 1, 1);

    // Add multiple backup servers for redundancy
    // this.electrum.addServer(
    //   "bch.imaginary.cash",
    //   50004,
    //   ElectrumTransport.WSS.Scheme,
    //   false,
    // );
    // this.electrum.addServer(
    //   "electroncash.de",
    //   50004,
    //   ElectrumTransport.WSS.Scheme,
    //   false,
    // );
    // this.electrum.addServer(
    //   "bch0.kister.net",
    //   50004,
    //   ElectrumTransport.WSS.Scheme,
    //   false,
    // );

    // Use TCP (more reliable for server-side)
    this.electrum.addServer(
      "electroncash.de",
      ElectrumTransport.TCP.Port,
      ElectrumTransport.TCP.Scheme,
      false,
    );
    this.electrum.addServer(
      "bch.loping.net",
      ElectrumTransport.TCP.Port,
      ElectrumTransport.TCP.Scheme,
      false,
    );
  }

  async connect() {
    if (this.isConnected) return;

    try {
      // Add timeout to connection attempt
      await Promise.race([
        this.electrum.ready(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Connection timeout")),
            this.connectionTimeout,
          ),
        ),
      ]);

      this.isConnected = true;
      console.log("✅ Connected to BCH Electrum servers");
    } catch (error) {
      console.error("❌ Failed to connect to Electrum servers:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await this.electrum.shutdown();
        this.isConnected = false;
        console.log("🔌 Disconnected from Electrum servers");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  }

  // Wrap all operations with timeout
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 5000,
    errorMessage: string = "Operation timed out",
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
      ),
    ]);
  }

  // Retry logic with exponential backoff
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries exceeded");
  }

  // Check a specific address for new transactions (Polling approach)
  async checkAddressForTransactions(address: string, orderId: string) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const scripthash = await this.withTimeout(
        this.addressToScriptHash(address),
        3000,
        "Address conversion timeout",
      );

      const history = (await this.withTimeout(
        this.electrum.request("blockchain.scripthash.get_history", scripthash),
        5000,
        "Get history timeout",
      )) as ElectrumHistoryItem[];

      if (Array.isArray(history)) {
        for (const txData of history) {
          const existingTx = await prisma.transaction.findFirst({
            where: { txHash: txData.tx_hash },
          });

          if (existingTx) continue;

          const txDetails = (await this.withTimeout(
            this.electrum.request(
              "blockchain.transaction.get",
              txData.tx_hash,
              true,
            ),
            5000,
            "Get transaction timeout",
          )) as ElectrumTransaction;

          const amountReceived = this.parseTxAmountForAddress(
            txDetails,
            address,
          );

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
    } catch (error) {
      console.error(`Error checking transactions for ${address}:`, error);
      throw error;
    }
  }

  private async addressToScriptHash(address: string): Promise<string> {
    const bitcoin = require("bitcoincashjs-lib");
    const bchaddr = require("bchaddrjs");
    const crypto = require("crypto");

    // Ensure legacy format for bitcoincashjs-lib compatibility
    const legacyAddr = bchaddr.toLegacyAddress(address);
    const script = bitcoin.address.toOutputScript(
      legacyAddr,
      bitcoin.networks.bitcoin,
    );

    const hash = crypto.createHash("sha256").update(script).digest();
    // Reverse buffer for Electrum scripthash
    return Buffer.from(hash.reverse()).toString("hex");
  }

  private parseTxAmountForAddress(
    txDetails: ElectrumTransaction,
    targetAddress: string,
  ): number {
    let total = 0;
    if (txDetails && txDetails.vout) {
      for (const output of txDetails.vout) {
        if (output.scriptPubKey && output.scriptPubKey.addresses) {
          const addresses = output.scriptPubKey.addresses;
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
            total += output.value;
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
    // FIX: Properly type the status variable
    const status: TransactionStatus = height > 0 ? "CONFIRMED" : "PENDING";

    // Fetch order to validate amount
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`Order ${orderId} not found for tx ${txHash}`);
      return;
    }

    // Verify amount matches or exceeds expected BCH
    const epsilon = 0.00000001; // 1 satoshi
    const isSufficient = amount >= order.bchAmount - epsilon;
    const isOverpaid = amount > order.bchAmount + epsilon;

    // FIX: Properly typed metadata
    const metadata: TransactionMetadata = {
      blockHeight: height,
      confirmedAt: height > 0 ? new Date() : null,
      isSufficient,
      isOverpaid,
    };

    // Create transaction record
    await prisma.transaction.create({
      data: {
        orderId,
        txHash,
        amount,
        currency: "BCH",
        type: "PAYMENT",
        status,
        metadata: metadata as any, // Prisma Json type
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
      // Handle overpayment
      if (isOverpaid) {
        const excess = amount - order.bchAmount;
        console.log(
          `Overpayment detected for order ${orderId}: ${excess} BCH excess.`,
        );

        // FIX: Auto-create wallet if it doesn't exist
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
          console.log(`Created wallet ${wallet.id} for user ${order.buyerId}`);
        }

        // Credit excess to wallet
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
      }
    }
  }

  async checkConfirmations(orderId: string) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const transaction = await prisma.transaction.findFirst({
        where: { orderId, type: "PAYMENT" },
        orderBy: { createdAt: "desc" },
      });

      if (!transaction || !transaction.txHash) return;

      const txData = (await this.withTimeout(
        this.electrum.request(
          "blockchain.transaction.get",
          transaction.txHash,
          true,
        ),
        5000,
        "Get transaction confirmation timeout",
      )) as ElectrumTransaction;

      const confirmations = txData.confirmations || 0;

      if (confirmations >= 1) {
        if (transaction.status !== "CONFIRMED") {
          // FIX: Use type guard for safe metadata access
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
        }

        // FIX: Use type guard for safe checking
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
              `Order ${orderId} finalized (PAID) with ${confirmations} confirmations.`,
            );
          }
        }
      } else {
        console.log(
          `Order ${orderId} tx ${transaction.txHash} has ${confirmations} confirmations.`,
        );
      }
    } catch (error) {
      console.error(
        `Error checking confirmations for order ${orderId}:`,
        error,
      );
      throw error;
    }
  }

  // FIX: Implement stock return for expired orders
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
      // Check if any payment was detected before expiring
      const tx = await prisma.transaction.findFirst({
        where: { orderId: order.id },
      });

      if (!tx) {
        try {
          // Use transaction to ensure atomicity
          await prisma.$transaction(async (tx) => {
            // Return stock to products
            for (const item of order.items) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            }

            // Mark order as expired
            await tx.order.update({
              where: { id: order.id },
              data: { status: "EXPIRED" },
            });
          });

          console.log(
            `✅ Order ${order.id} marked as EXPIRED and stock returned.`,
          );
        } catch (error) {
          console.error(
            `❌ Failed to expire order ${order.id} and return stock:`,
            error,
          );
        }
      }
    }
  }
}
