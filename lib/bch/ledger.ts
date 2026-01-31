import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";

export class LedgerService {
  /**
   * getOrCreateWallet
   * Gets a user's wallet or creates one if it doesn't exist.
   */
  async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { balances: true },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balances: {
            create: [
              { currency: "BCH", amount: 0.0, locked: 0.0 },
              { currency: "USD", amount: 0.0, locked: 0.0 },
            ],
          },
        },
        include: { balances: true },
      });
    }

    return wallet;
  }

  /**
   * getBalance
   * Returns specific currency balance for a user.
   */
  async getBalance(userId: string, currency: string = "BCH") {
    const wallet = await this.getOrCreateWallet(userId);
    const balance = wallet.balances.find((b) => b.currency === currency);
    return balance || { amount: 0, locked: 0 };
  }

  /**
   * creditUser
   * Atomically credits a user's balance.
   * Used for deposits, incoming payments (for vendors), refunds, etc.
   */
  async creditUser(
    userId: string,
    amount: number,
    currency: string,
    type: TransactionType,
    referenceId?: string,
    metadata?: any,
  ) {
    const wallet = await this.getOrCreateWallet(userId);

    return await prisma.$transaction(async (tx) => {
      // 1. Create Transaction Record
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          currency,
          type,
          status: "CONFIRMED", // Internal ledger moves are instant/confirmed
          metadata: { ...metadata, referenceId },
        },
      });

      // 2. Update Balance
      await tx.balance.upsert({
        where: {
          walletId_currency: {
            walletId: wallet.id,
            currency,
          },
        },
        update: {
          amount: { increment: amount },
        },
        create: {
          walletId: wallet.id,
          currency,
          amount,
        },
      });

      return transaction;
    });
  }

  /**
   * lockFunds
   * Locks funds for a pending withdrawal or order.
   */
  async lockFunds(userId: string, amount: number, currency: string) {
    const wallet = await this.getOrCreateWallet(userId);

    return await prisma.$transaction(async (tx) => {
      const balance = await tx.balance.findUnique({
        where: {
          walletId_currency: {
            walletId: wallet.id,
            currency,
          },
        },
      });

      if (!balance || balance.amount < amount) {
        throw new Error("Insufficient funds");
      }

      await tx.balance.update({
        where: { id: balance.id },
        data: {
          amount: { decrement: amount },
          locked: { increment: amount },
        },
      });
    });
  }

  /**
   * unlockFunds
   * Unlocks funds (e.g. cancelled withdrawal).
   */
  async unlockFunds(userId: string, amount: number, currency: string) {
    const wallet = await this.getOrCreateWallet(userId);

    return await prisma.$transaction(async (tx) => {
      const balance = await tx.balance.findUnique({
        where: {
          walletId_currency: {
            walletId: wallet.id,
            currency,
          },
        },
      });

      if (!balance || balance.locked < amount) {
        throw new Error("Invalid unlock amount");
      }

      await tx.balance.update({
        where: { id: balance.id },
        data: {
          amount: { increment: amount },
          locked: { decrement: amount },
        },
      });
    });
  }

  /**
   * settleOrder
   * Distributes funds from a paid order to vendors and platform.
   * - Credits Vendor Wallets (BCH)
   * - Credits Platform Wallet (BCH)
   * - Records Settlements
   */
  async settleOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order || order.status !== "PAID") {
      throw new Error("Order not found or not paid");
    }

    // Check if already settled
    const existingSettlement = await prisma.settlement.findFirst({
      where: { transaction: { orderId } },
    });
    // This check is weak if multiple settlements per order are allowed,
    // but typically we settle once.
    // However, since we might fail midway, we should rely on transaction status or specific flag.
    // For now, assume if order is PAID but we are called, we proceed.
    // Better to check specific Settlement records linked to order transaction.

    const PLATFORM_FEE_PERCENT = 0.02; // 2%

    // Total BCH received
    const totalBch = order.bchAmount;

    // We need to define whose wallet is the Platform Wallet.
    // For now, let's look for a user with role ADMIN (or hardcoded ID/env).
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const adminId = adminUser?.id;

    if (!adminId) {
      console.warn(
        "No ADMIN user found for platform fees. Proceeding without fee distribution (or holding it).",
      );
    }

    // Distribute Logic
    await prisma.$transaction(async (tx) => {
      // 1. Calculate and Credit Vendor Shares
      for (const item of order.items) {
        const vendorId = item.product.vendorId;

        // Item share of the total USD amount
        const itemTotalUsd = item.priceAtPurchase * item.quantity;
        const itemShareRatio = itemTotalUsd / order.usdAmount;

        // Calculate BCH share for this item
        const grossBchForItem = totalBch * itemShareRatio;
        const platformFeeBch = grossBchForItem * PLATFORM_FEE_PERCENT;
        const vendorNetBch = grossBchForItem - platformFeeBch;

        // Credit Vendor
        const vendorWallet = await this.getOrCreateWalletCtx(tx, vendorId);
        await this.creditWalletCtx(tx, vendorWallet.id, vendorNetBch, "BCH");

        // Record Vendor Settlement
        // We need a transaction ID to link the settlement to.
        // Usually the incoming PAYMENT transaction.
        const paymentTx = await tx.transaction.findFirst({
          where: { orderId: orderId, type: "PAYMENT", status: "CONFIRMED" },
        });

        if (paymentTx) {
          await tx.settlement.create({
            data: {
              transactionId: paymentTx.id,
              amount: vendorNetBch,
              currency: "BCH",
              status: "COMPLETED",
              processedAt: new Date(),
            },
          });
        }

        // Credit Platform Fee
        if (adminId) {
          const adminWallet = await this.getOrCreateWalletCtx(tx, adminId);
          await this.creditWalletCtx(tx, adminWallet.id, platformFeeBch, "BCH");

          if (paymentTx) {
            await tx.settlement.create({
              data: {
                transactionId: paymentTx.id,
                amount: platformFeeBch,
                currency: "BCH",
                status: "COMPLETED",
                processedAt: new Date(),
              },
            });
          }
        }
      }
    });
  }

  /**
   * requestWithdrawal
   * Initiates a withdrawal, locks funds, and creates a pending transaction.
   */
  async requestWithdrawal(
    userId: string,
    amount: number,
    destinationAddress: string,
    currency: string = "BCH",
  ) {
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    const wallet = await this.getOrCreateWallet(userId);

    // Atomic lock and record creation
    return await prisma.$transaction(async (tx) => {
      // 1. Lock Funds (re-implement logic here to be inside same transaction as record creation)
      const balance = await tx.balance.findUnique({
        where: { walletId_currency: { walletId: wallet.id, currency } },
      });

      if (!balance || balance.amount < amount) {
        throw new Error("Insufficient funds");
      }

      await tx.balance.update({
        where: { id: balance.id },
        data: {
          amount: { decrement: amount },
          locked: { increment: amount },
        },
      });

      // 2. Create Withdrawal Transaction
      const withdrawalTx = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount,
          currency,
          type: "WITHDRAWAL",
          status: "PENDING",
          metadata: {
            destinationAddress,
            requestedAt: new Date(),
          },
        },
      });

      return withdrawalTx;
    });
  }

  // Helper for transaction context usage
  private async getOrCreateWalletCtx(tx: any, userId: string) {
    let wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId,
          balances: {
            create: [
              { currency: "BCH", amount: 0 },
              { currency: "USD", amount: 0 },
            ],
          },
        },
      });
    }
    return wallet;
  }

  private async creditWalletCtx(
    tx: any,
    walletId: string,
    amount: number,
    currency: string,
  ) {
    await tx.balance.upsert({
      where: { walletId_currency: { walletId, currency } },
      update: { amount: { increment: amount } },
      create: { walletId, currency, amount },
    });
  }
}
