
const fs = require('fs');
const path = require('path');
const bip39 = require('bip39');
const bip32 = require('bip32');
const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');

const factory = BIP32Factory(ecc);

function setupEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  
  // Generate
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = factory.fromSeed(seed);
  const nodePath = "m/44'/145'/0'";
  const account = root.derivePath(nodePath);
  const xpub = account.neutered().toBase58();

  console.log('Generated XPUB:', xpub);

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or Append BCH_XPUB
  if (envContent.includes('BCH_XPUB=')) {
    envContent = envContent.replace(/BCH_XPUB=.*/g, `BCH_XPUB=${xpub}`);
  } else {
    envContent += `\nBCH_XPUB=${xpub}`;
  }

  // Update or Append BCH_MNEMONIC (optional but good for backup)
  if (envContent.includes('BCH_MNEMONIC=')) {
    envContent = envContent.replace(/BCH_MNEMONIC=.*/g, `BCH_MNEMONIC="${mnemonic}"`);
  } else {
    envContent += `\nBCH_MNEMONIC="${mnemonic}"`;
  }

  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('Successfully updated .env with new BCH credentials.');
}

setupEnv();
