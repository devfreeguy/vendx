
const bip39 = require('bip39');
const bip32 = require('bip32');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');

const factory = BIP32Factory(ecc);

function generateWallet() {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = factory.fromSeed(seed);
  
  // Derivation path for Bitcoin Cash (Coin Type 145)
  // m / purpose' / coin_type' / account'
  const path = "m/44'/145'/0'";
  const account = root.derivePath(path);
  const xpub = account.neutered().toBase58();

  console.log('--- GENERATED BCH WALLET CREDENTIALS ---');
  console.log('MNEMONIC:', mnemonic);
  console.log('XPUB:', xpub);
  console.log('----------------------------------------');
}

generateWallet();
