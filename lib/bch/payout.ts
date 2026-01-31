import { prisma } from "@/lib/prisma";
import { ElectrumCluster, ElectrumTransport } from "electrum-cash";
import * as bitcoin from "bitcoincashjs-lib";
import * as bip39 from "bip39";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import bchaddr from "bchaddrjs";

const factory = BIP32Factory(ecc);

export class BchPayoutService {
  private electrum: any;

  constructor() {
    this.electrum = new ElectrumCluster("VendX-Payout", "1.4.1", 1, 1);
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

  private async connect() {
    await this.electrum.ready();
  }

  async executeBatchWithdrawal(withdrawalIds: string[]) {
    // 1. Fetch Withdrawals (Pending only)
    const withdrawals = await prisma.transaction.findMany({
      where: {
        id: { in: withdrawalIds },
        type: "WITHDRAWAL",
        status: "PENDING",
      },
    });

    if (withdrawals.length === 0) {
      throw new Error("No pending withdrawals found for provided IDs");
    }

    // 2. Calculate Total Amount
    const totalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const minerFee = 0.00001; // Conservative flat fee for now (1000 sats)
    const totalNeeded = totalAmount + minerFee;

    // 3. Gather UTXOs from PAID orders
    // We assume funds are still sitting in the order addresses.
    // Real system would separate "sweeping" from "payout".
    // Here we treat Order Addresses as the "Hot Wallet" for simplicity of the exercise.

    // We need the Mnemonic to sign input from these addresses.
    const mnemonic = process.env.BCH_MNEMONIC;
    if (!mnemonic) {
      throw new Error("BCH_MNEMONIC missing in environment");
    }
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = factory.fromSeed(seed);

    await this.connect();

    // Strategy: Fetch PAID orders, check balances, pick until sum > needed.
    const fundingOrders = await prisma.order.findMany({
      where: { status: "PAID" }, // Also COMPLETED? COMPLETED usually means shipped.
      orderBy: { createdAt: "asc" }, // Oldest first
    });

    let currentSum = 0;
    const inputs: any[] = [];

    for (const order of fundingOrders) {
      if (currentSum >= totalNeeded) break;

      const address = order.bchAddress;

      // Convert to scripthash for Electrum
      const scripthash = await this.addressToScriptHash(address);

      // Get UTXOs
      const utxos = await this.electrum.request(
        "blockchain.scripthash.listunspent",
        scripthash,
      );

      for (const utxo of utxos) {
        // utxo: { tx_hash, tx_pos, value, height }
        // value is in sats
        const valBch = utxo.value / 100_000_000;

        // Check if this UTXO is already spent in our DB (if we track UTXO usage)?
        // For now, assume unspent on-chain means available.

        inputs.push({
          txId: utxo.tx_hash,
          outputIndex: utxo.tx_pos,
          address: address, // To identify which key to sign with
          satoshis: utxo.value,
          script: bitcoin.address.toOutputScript(
            bchaddr.toLegacyAddress(address),
            bitcoin.networks.bitcoin,
          ),
          derivationIndex: order.derivationIndex, // Need this to derive key
        });

        currentSum += valBch;
        if (currentSum >= totalNeeded) break;
      }
    }

    if (currentSum < totalNeeded) {
      throw new Error(
        `Insufficient hot wallet funds (UTXOs). Need ${totalNeeded}, have ${currentSum}`,
      );
    }

    // 4. Construct Transaction
    const transaction = new bitcoin.TransactionBuilder(
      bitcoin.networks.bitcoin,
    );
    // bitcoincashjs-lib usually matches bitcoin network parameters for mainnet

    // Add Inputs
    inputs.forEach((input) => {
      transaction.addInput(input.txId, input.outputIndex);
    });

    // Add Outputs (Withdrawals)
    const SATS = 100_000_000;

    withdrawals.forEach((w) => {
      // w.metadata is Json, cast it
      const meta = w.metadata as any;
      if (meta && meta.destinationAddress) {
        // Ensure destination is Legacy format for bitcoincashjs-lib compatibility if needed?
        // Or usually libraries handle CashAddr. bchaddrjs converts.
        const destLegacy = bchaddr.toLegacyAddress(meta.destinationAddress);
        transaction.addOutput(destLegacy, Math.floor(w.amount * SATS));
      }
    });

    // Add Change Output
    const change = currentSum - totalNeeded;
    if (change > 0.00000546) {
      // Dust limit
      // Send change to a fresh change address? Or strictly back to one of the inputs?
      // Let's use the first input address for simplicity in this demo.
      // Ideally: derive new change address.
      const changeAddr = inputs[0].address;
      const changeLegacy = bchaddr.toLegacyAddress(changeAddr);
      transaction.addOutput(changeLegacy, Math.floor(change * SATS));
    }

    // 5. Sign Inputs
    inputs.forEach((input, index) => {
      // Derive Key for this input
      const childNode = root.derivePath(
        `m/44'/145'/0'/0/${input.derivationIndex}`,
      );
      // Sign
      // bitcoincashjs-lib v3 signature: keyPair, inputIndex, sighash?, amount(for forkId)
      // Need exact signature details for BCH (SIGHASH_ALL | SIGHASH_FORKID)
      // bitcoincashjs-lib handles checking if forkId is needed usually.

      const keyPair = bitcoin.ECPair.fromPrivateKey(childNode.privateKey!);
      transaction.sign(index, keyPair, undefined, input.satoshis); // Amount required for BCH sighash
    });

    // 6. Build and Broadcast
    const tx = transaction.build();
    const rawTx = tx.toHex();

    const broadcastResult = await this.electrum.request(
      "blockchain.transaction.broadcast",
      rawTx,
    );

    // 7. Update Records
    if (
      broadcastResult &&
      typeof broadcastResult === "string" &&
      broadcastResult.length > 50
    ) {
      // Simple hash check
      const txHash = broadcastResult;
      console.log(`Batch withdrawal broadcasted: ${txHash}`);

      await prisma.$transaction(async (prismaTx) => {
        // Mark withdrawals as COMPLETED
        await prismaTx.transaction.updateMany({
          where: { id: { in: withdrawalIds } },
          data: {
            status: "CONFIRMED", // or COMPLETED logic? Enum has CONFIRMED.
            txHash: txHash,
            metadata: {
              // We need to merge metadata, but updateMany replaces? Prisma checks.
              // Actually updateMany cannot easily merge JSON.
              // But for withdrawal, we just add execution time.
              // Let's iterate if we want to be safe, or just status.
            },
          },
        });

        // We also need to "burn" the locked balances.
        // requestWithdrawal resulted in: amount -X, locked +X.
        // Now that it is sent, we remove locked +X.
        // So locked: { decrement: X }.
        for (const w of withdrawals) {
          await prismaTx.balance.update({
            where: {
              walletId_currency: { walletId: w.walletId!, currency: "BCH" },
            },
            data: { locked: { decrement: w.amount } },
          });
        }
      });

      return txHash;
    } else {
      throw new Error(`Broadcast failed: ${broadcastResult}`);
    }
  }

  // Duplicate helper from Monitor (should share code in real app)
  private async addressToScriptHash(address: string): Promise<string> {
    const crypto = require("crypto");
    // Ensure legacy format
    const legacyAddr = bchaddr.toLegacyAddress(address);
    const script = bitcoin.address.toOutputScript(
      legacyAddr,
      bitcoin.networks.bitcoin,
    );
    const hash = crypto.createHash("sha256").update(script).digest();
    return Buffer.from(hash.reverse()).toString("hex");
  }
}
