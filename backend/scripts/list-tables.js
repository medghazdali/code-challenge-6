#!/usr/bin/env node

// Script to list DynamoDB tables and verify configuration

const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const fs = require('fs');
const path = require('path');

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
}

const region = process.env.AWS_REGION || 'eu-north-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

console.log('\n=== DynamoDB Configuration ===');
console.log('Region:', region);
console.log('Access Key ID:', accessKeyId ? `${accessKeyId.substring(0, 8)}...` : 'NOT SET');
console.log('Secret Access Key:', secretAccessKey ? 'SET' : 'NOT SET');
console.log('');

const clientConfig = {
  region: region,
};

if (accessKeyId && secretAccessKey) {
  clientConfig.credentials = {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  };
}

const client = new DynamoDBClient(clientConfig);

async function listTables() {
  try {
    console.log('Fetching DynamoDB tables...\n');
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    
    if (response.TableNames && response.TableNames.length > 0) {
      console.log('✅ Found', response.TableNames.length, 'table(s):');
      response.TableNames.forEach((tableName, index) => {
        const isExpected = tableName === 'tasks-dev';
        console.log(`  ${index + 1}. ${tableName}${isExpected ? ' ✅ (matches expected name)' : ''}`);
      });
      
      const hasTasksDev = response.TableNames.includes('tasks-dev');
      if (!hasTasksDev) {
        console.log('\n⚠️  WARNING: Table "tasks-dev" not found!');
        console.log('   Please create a table named exactly "tasks-dev" in region', region);
        console.log('   Or update your .env file with: TASKS_TABLE=<your-table-name>');
      } else {
        console.log('\n✅ Table "tasks-dev" exists!');
      }
    } else {
      console.log('⚠️  No tables found in this region.');
      console.log('   Please create a table named "tasks-dev" in region', region);
    }
  } catch (error) {
    console.error('❌ Error listing tables:', error.message);
    if (error.name === 'CredentialsProviderError' || error.message.includes('credentials')) {
      console.error('\n   Credentials issue. Please check:');
      console.error('   - AWS_ACCESS_KEY_ID is set in .env');
      console.error('   - AWS_SECRET_ACCESS_KEY is set in .env');
      console.error('   - Credentials are valid and have DynamoDB permissions');
    } else if (error.name === 'UnknownEndpoint') {
      console.error('\n   Region issue. Please check:');
      console.error('   - AWS_REGION is set correctly in .env');
      console.error('   - Region is valid (e.g., us-east-1, us-west-2, etc.)');
    }
    process.exit(1);
  }
}

listTables();

