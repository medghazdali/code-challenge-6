#!/usr/bin/env node

/**
 * Script to deploy with .env file loaded
 * Loads .env file and then runs serverless deploy
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const lines = envFile.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value.trim();
      }
    }
  });
  
  console.log('✓ Loaded environment variables from .env file');
} else {
  console.log('⚠ No .env file found, using system environment variables');
}

// Get stage from command line args
const args = process.argv.slice(2);
const stageIndex = args.findIndex(arg => arg === '--stage' || arg.startsWith('--stage='));
let stage = 'dev';
if (stageIndex !== -1) {
  if (args[stageIndex].includes('=')) {
    stage = args[stageIndex].split('=')[1];
  } else if (args[stageIndex + 1]) {
    stage = args[stageIndex + 1];
  }
}

console.log(`\n🚀 Deploying to stage: ${stage}`);
console.log(`Region: ${process.env.AWS_REGION || 'eu-north-1'}\n`);

// Run serverless deploy with all args
const serverlessArgs = ['deploy', ...args];
const serverless = spawn('npx', ['serverless', ...serverlessArgs], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

serverless.on('close', (code) => {
  process.exit(code);
});

