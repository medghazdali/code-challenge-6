#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Load .env file if it exists
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

// Set default TASKS_TABLE if not set
if (!process.env.TASKS_TABLE) {
  process.env.TASKS_TABLE = 'tasks-dev';
  console.log('✓ Set default TASKS_TABLE to: tasks-dev');
}

// Start serverless offline
const serverless = spawn('serverless', ['offline', 'start'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

serverless.on('error', (error) => {
  console.error('Error starting serverless:', error);
  process.exit(1);
});

serverless.on('exit', (code) => {
  process.exit(code);
});

