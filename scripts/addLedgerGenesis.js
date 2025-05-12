#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const CREDITCOIN3_GENESIS = '0xfc4ec97a1c1f119c4353aecb4a17c7c0cf7b40d5d660143d8bad9117e9866572';
const CREDITCOIN3_NAME = 'creditcoin3';

// Paths to the network files
const networkPath = path.join(__dirname, '..', 'node_modules', '@polkadot', 'networks');
const genesisPath = path.join(networkPath, 'defaults', 'genesis.js');
const ledgerPath = path.join(networkPath, 'defaults', 'ledger.js');

// Update the genesis file
try {
  let genesisContent = fs.readFileSync(genesisPath, 'utf8');
  
  // Check if Creditcoin3 is already in the file
  if (!genesisContent.includes(CREDITCOIN3_NAME)) {
    // Find the last entry and add our entry before the closing }
    const newEntry = `    ${CREDITCOIN3_NAME}: [\n        '${CREDITCOIN3_GENESIS}'\n    ],\n`;
    
    // Insert before the last closing brace
    genesisContent = genesisContent.replace(/}[\s]*$/, `${newEntry}}`);
    
    fs.writeFileSync(genesisPath, genesisContent);
    console.log(`Added ${CREDITCOIN3_NAME} to genesis.js`);
  } else {
    console.log(`${CREDITCOIN3_NAME} already exists in genesis.js`);
  }
} catch (error) {
  console.error(`Error updating genesis.js: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

// Update the ledger file - we'll use the same SLIP-44 as Polkadot (0x00000162)
try {
  let ledgerContent = fs.readFileSync(ledgerPath, 'utf8');
  
  // Check if Creditcoin3 is already in the file
  if (!ledgerContent.includes(CREDITCOIN3_NAME)) {
    // Find the Polkadot entry
    const polkadotSlip44Match = ledgerContent.match(/polkadot:\s*0x[\da-fA-F]{8}/);
    
    if (!polkadotSlip44Match) {
      console.error('Could not find Polkadot SLIP-44 value');
      process.exit(1);
    }
    
    const polkadotSlip44 = polkadotSlip44Match[0].split(':')[1].trim();
    
    // Add our entry before the closing brace
    const newEntry = `    ${CREDITCOIN3_NAME}: ${polkadotSlip44},\n`;
    
    // Insert before the last closing brace
    ledgerContent = ledgerContent.replace(/}[\s]*$/, `${newEntry}}`);
    
    fs.writeFileSync(ledgerPath, ledgerContent);
    console.log(`Added ${CREDITCOIN3_NAME} to ledger.js with SLIP-44 value ${polkadotSlip44}`);
  } else {
    console.log(`${CREDITCOIN3_NAME} already exists in ledger.js`);
  }
} catch (error) {
  console.error(`Error updating ledger.js: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

console.log('Successfully added Creditcoin3 Ledger support!');
console.log('Please rebuild the app using: yarn build && yarn start'); 
