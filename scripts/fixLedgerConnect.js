#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const CREDITCOIN3_GENESIS = '0xfc4ec97a1c1f119c4353aecb4a17c7c0cf7b40d5d660143d8bad9117e9866572';

// Path to the react-hooks folder
const useLedgerPath = path.join(__dirname, '..', 'packages', 'react-hooks', 'src', 'useLedger.ts');

// Read the useLedger.ts file
console.log(`Reading ${useLedgerPath}`);
try {
  let useLedgerContent = fs.readFileSync(useLedgerPath, 'utf8');
  
  // First, modify the retrieveLedger function to handle our Creditcoin3 network
  if (useLedgerContent.includes('function retrieveLedger')) {
    let modifiedContent = useLedgerContent.replace(
      /function retrieveLedger \(api: ApiPromise\): LedgerGeneric \| Ledger \{[\s\S]*?const genesisHex = api\.genesisHash\.toHex\(\);[\s\S]*?const network = ledgerChains\.find\(\(network\) => knownGenesis\[network\]\.includes\(genesisHex\)\);[\s\S]*?assert\(network, `Unable to find a known Ledger config for genesisHash \${genesisHex}`\);/,
      `function retrieveLedger (api: ApiPromise): LedgerGeneric | Ledger {
  const currType = settings.get().ledgerConn as TransportType;
  const currApp = settings.get().ledgerApp;

  if (!ledger || ledgerType !== currType || currApp !== ledgerApp) {
    const genesisHex = api.genesisHash.toHex();
    
    // Special case for Creditcoin3
    let network;
    if (genesisHex === '${CREDITCOIN3_GENESIS}') {
      network = 'polkadot'; // Use Polkadot's config for Creditcoin3
      console.log('📱 Using Polkadot Ledger config for Creditcoin3');
    } else {
      network = ledgerChains.find((network) => knownGenesis[network].includes(genesisHex));
      assert(network, \`Unable to find a known Ledger config for genesisHash \${genesisHex}\`);
    }`
    );
    
    // Save the file if modified
    if (modifiedContent !== useLedgerContent) {
      fs.writeFileSync(useLedgerPath, modifiedContent);
      console.log('Modified retrieveLedger function to handle Creditcoin3');
      useLedgerContent = modifiedContent; // Update the content for further modifications
    } else {
      console.log('No changes needed in retrieveLedger function');
    }
  } else {
    console.log('Could not find retrieveLedger function');
  }
  
  // Also make sure the getState function is properly handling our chain
  if (useLedgerContent.includes('function getState')) {
    let modifiedContent = useLedgerContent.replace(
      /function getState \(api: ApiPromise\): StateBase \{[\s\S]*?const hasLedgerChain = ledgerHashes\.includes\(api\.genesisHash\.toHex\(\)\);/,
      `function getState (api: ApiPromise): StateBase {
  // Force enable Ledger for Creditcoin3
  const genesisHash = api.genesisHash.toHex();
  const isCreditcoin3 = genesisHash === '${CREDITCOIN3_GENESIS}';
  const hasLedgerChain = ledgerHashes.includes(genesisHash) || isCreditcoin3;`
    );
    
    // Save the file if modified
    if (modifiedContent !== useLedgerContent) {
      fs.writeFileSync(useLedgerPath, modifiedContent);
      console.log('Modified getState function to force enable Ledger for Creditcoin3');
    } else {
      console.log('No changes needed in getState function');
    }
  } else {
    console.log('Could not find getState function');
  }
} catch (error) {
  console.error(`Error updating useLedger.ts: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

console.log('Successfully fixed Ledger connection for Creditcoin3!');
console.log('Please rebuild the app using: yarn build && yarn start'); 