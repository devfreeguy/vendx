import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import bchaddr from "bchaddrjs";

const factory = BIP32Factory(ecc);

export function deriveAddress(index: number): string {
  const xpub = process.env.BCH_XPUB;

  if (!xpub) {
    throw new Error("BCH_XPUB not found in environment variables");
  }

  const node = factory.fromBase58(xpub);
  // Derive external chain (0) and then index
  const child = node.derive(0).derive(index);

  // Create legacy address first (P2PKH)
  // Use bitcoin network as base, conversion handles the rest for BCH specific format
  const { address } = bitcoin.payments.p2pkh({
    pubkey: child.publicKey,
  });

  if (!address) {
    throw new Error("Failed to generate address");
  }

  // Convert to CashAddr format
  try {
    return bchaddr.toCashAddress(address);
  } catch (e) {
    console.error("Address conversion error", e);
    throw e;
  }
}
