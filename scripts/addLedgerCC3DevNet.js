#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const CC3_DEVNET_GENESIS = '0xfc9df99a665f964aed6649f275055e54df5e3420489538ed31d7788f53d11ef6';
const CC3_DEVNET_NAME = 'creditcoin3-devnet';

// Paths to the network files
const networkPath = path.join(__dirname, '..', 'node_modules', '@polkadot', 'networks');
const genesisPath = path.join(networkPath, 'defaults', 'genesis.js');
const ledgerPath = path.join(networkPath, 'defaults', 'ledger.js');
const useLedgerPath = path.join(__dirname, '..', 'packages', 'react-hooks', 'src', 'useLedger.ts');

// Update the genesis file
try {
  let genesisContent = fs.readFileSync(genesisPath, 'utf8');
  
  // Check if DevNet is already in the file
  if (!genesisContent.includes(CC3_DEVNET_NAME)) {
    // Find the last entry and add our entry before the closing }
    const newEntry = `    ${CC3_DEVNET_NAME}: [\n        '${CC3_DEVNET_GENESIS}'\n    ],\n`;
    
    // Insert before the last closing brace
    genesisContent = genesisContent.replace(/}[\s]*$/, `${newEntry}}`);
    
    fs.writeFileSync(genesisPath, genesisContent);
    console.log(`Added ${CC3_DEVNET_NAME} to genesis.js`);
  } else {
    console.log(`${CC3_DEVNET_NAME} already exists in genesis.js`);
  }
} catch (error) {
  console.error(`Error updating genesis.js: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

// Update the ledger file - we'll use the same SLIP-44 as Polkadot
try {
  let ledgerContent = fs.readFileSync(ledgerPath, 'utf8');
  
  // Check if DevNet is already in the file
  if (!ledgerContent.includes(CC3_DEVNET_NAME)) {
    // Find the Polkadot entry
    const polkadotSlip44Match = ledgerContent.match(/polkadot:\s*0x[\da-fA-F]{8}/);
    
    if (!polkadotSlip44Match) {
      console.error('Could not find Polkadot SLIP-44 value');
      process.exit(1);
    }
    
    const polkadotSlip44 = polkadotSlip44Match[0].split(':')[1].trim();
    
    // Add our entry before the closing brace
    const newEntry = `    ${CC3_DEVNET_NAME}: ${polkadotSlip44},\n`;
    
    // Insert before the last closing brace
    ledgerContent = ledgerContent.replace(/}[\s]*$/, `${newEntry}}`);
    
    fs.writeFileSync(ledgerPath, ledgerContent);
    console.log(`Added ${CC3_DEVNET_NAME} to ledger.js with SLIP-44 value ${polkadotSlip44}`);
  } else {
    console.log(`${CC3_DEVNET_NAME} already exists in ledger.js`);
  }
} catch (error) {
  console.error(`Error updating ledger.js: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

// Modify the useLedger.ts file to handle our chain
try {
  let useLedgerContent = fs.readFileSync(useLedgerPath, 'utf8');
  
  // Check if the file already includes support for our chain
  if (!useLedgerContent.includes(CC3_DEVNET_GENESIS)) {
    // Modify the retrieveLedger function to handle CC3 DevNet
    let modifiedContent = useLedgerContent.replace(
      // Look for a pattern that includes the special case for Creditcoin3 (if it exists) 
      // or the default case
      /\/\/ Special case for Creditcoin3\s*let network;\s*if \(genesisHex === '[^']+'\) \{\s*network = 'polkadot';[\s\S]*?\} else \{\s*network = ledgerChains\.find\(\(network\) => knownGenesis\[network\]\.includes\(genesisHex\)\);/,
      `// Special case for Creditcoin3 and DevNet
    let network;
    if (genesisHex === '0xfc4ec97a1c1f119c4353aecb4a17c7c0cf7b40d5d660143d8bad9117e9866572' || 
        genesisHex === '${CC3_DEVNET_GENESIS}') {
      network = 'polkadot'; // Use Polkadot's config for Creditcoin3
      console.log('📱 Using Polkadot Ledger config for Creditcoin3');
    } else {
      network = ledgerChains.find((network) => knownGenesis[network].includes(genesisHex));`
    );
    
    // If the previous replacement didn't work (because our chain wasn't patched before),
    // we'll try a more general pattern
    if (modifiedContent === useLedgerContent) {
      modifiedContent = useLedgerContent.replace(
        /const genesisHex = api\.genesisHash\.toHex\(\);\s*const network = ledgerChains\.find\(\(network\) => knownGenesis\[network\]\.includes\(genesisHex\)\);/,
        `const genesisHex = api.genesisHash.toHex();
    
    // Special case for Creditcoin3 and DevNet
    let network;
    if (genesisHex === '0xfc4ec97a1c1f119c4353aecb4a17c7c0cf7b40d5d660143d8bad9117e9866572' || 
        genesisHex === '${CC3_DEVNET_GENESIS}') {
      network = 'polkadot'; // Use Polkadot's config for Creditcoin chains
      console.log('📱 Using Polkadot Ledger config for Creditcoin chain');
    } else {
      network = ledgerChains.find((network) => knownGenesis[network].includes(genesisHex));`
      );
    }
    
    // Modify the getState function to include CC3 DevNet as well
    if (modifiedContent !== useLedgerContent) {
      modifiedContent = modifiedContent.replace(
        /const isCreditcoin3 = genesisHash === '[^']+';/,
        `const isCreditcoin3 = genesisHash === '0xfc4ec97a1c1f119c4353aecb4a17c7c0cf7b40d5d660143d8bad9117e9866572' || 
      genesisHash === '${CC3_DEVNET_GENESIS}';`
      );
      
      fs.writeFileSync(useLedgerPath, modifiedContent);
      console.log('Modified useLedger.ts to support CC3 DevNet');
    } else {
      console.log('Could not find appropriate patterns to modify in useLedger.ts');
    }
  } else {
    console.log(`CC3 DevNet support already exists in useLedger.ts`);
  }
} catch (error) {
  console.error(`Error updating useLedger.ts: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

// Add the chain to testing.ts if it doesn't exist
try {
  const endpointsPath = path.join(__dirname, '..', 'packages', 'apps-config', 'src', 'endpoints', 'testing.ts');
  let endpointsContent = fs.readFileSync(endpointsPath, 'utf8');
  
  if (!endpointsContent.includes('cc3-devnet.creditcoin.network')) {
    // Find where the creditcoin3 entry is
    const existingCreditcoinEntry = endpointsContent.match(/info: 'creditcoin3'[\s\S]*?,\s*\{/m);
    
    if (existingCreditcoinEntry) {
      // Clone and adapt the entry for CC3 DevNet
      const newEntry = `  {
    info: 'creditcoin3-devnet',
    providers: {
      'Creditcoin Foundation': 'wss://rpc.cc3-devnet.creditcoin.network/ws'
    },
    text: 'Creditcoin DevNet',
    ui: {
      color: '#9cffaa',
      logo: chainsCreditcoinTestPNG
    }
  },`;
      
      // Insert the new entry after the existing one
      const insertPoint = endpointsContent.indexOf(existingCreditcoinEntry[0]);
      const entryEnd = endpointsContent.indexOf('},', insertPoint) + 2;
      
      endpointsContent = 
        endpointsContent.substring(0, entryEnd) + 
        '\n' + newEntry + 
        endpointsContent.substring(entryEnd);
      
      fs.writeFileSync(endpointsPath, endpointsContent);
      console.log('Added CC3 DevNet endpoint to testing.ts');
    } else {
      console.log('Could not find existing creditcoin3 entry to clone');
    }
  } else {
    console.log('CC3 DevNet endpoint already exists');
  }
} catch (error) {
  console.error(`Error updating endpoints: ${error instanceof Error ? error.message : String(error)}`);
  // Non-fatal, continue
}

console.log('Successfully added CC3 DevNet Ledger support!');
console.log('Please rebuild the app using: yarn build && yarn start'); 