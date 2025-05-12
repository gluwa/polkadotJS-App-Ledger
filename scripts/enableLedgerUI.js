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
  
  // Check for getState function and modify it to force enable ledger for our chain
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
      console.log('Modified useLedger.ts to force enable Ledger for Creditcoin3');
    } else {
      console.log('No changes needed in useLedger.ts');
    }
  } else {
    console.log('Could not find getState function in useLedger.ts');
  }
} catch (error) {
  console.error(`Error updating useLedger.ts: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

console.log('Successfully enabled Ledger UI for Creditcoin3!');
console.log('Please rebuild the app using: yarn build && yarn start'); 