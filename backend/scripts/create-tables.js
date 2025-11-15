#!/usr/bin/env node

/**
 * Script to create DynamoDB tables for local development
 * Uses AWS SDK directly (no AWS CLI required)
 */

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
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
  
  console.log('✓ Loaded environment variables from .env file');
} else {
  console.log('⚠ No .env file found, using system environment variables');
}

// Get configuration from environment
const region = process.env.AWS_REGION || process.env.REGION || 'eu-north-1';
const stage = process.env.STAGE || 'dev';

const tasksTable = `tasks-${stage}`;
const projectsTable = `projects-${stage}`;

// Initialize DynamoDB Client
const getDynamoDBClient = () => {
  const clientConfig = {
    region: region,
  };

  // Support for DynamoDB Local
  if (process.env.AWS_ENDPOINT_URL) {
    clientConfig.endpoint = process.env.AWS_ENDPOINT_URL;
    clientConfig.credentials = {
      accessKeyId: 'local',
      secretAccessKey: 'local',
    };
  } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }

  return new DynamoDBClient(clientConfig);
};

// Check if table exists
const tableExists = async (client, tableName) => {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
};

// Create a table
const createTable = async (client, tableName, params) => {
  try {
    const command = new CreateTableCommand({
      TableName: tableName,
      ...params,
    });
    
    await client.send(command);
    console.log(`✅ Table ${tableName} created successfully!`);
    return true;
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Table ${tableName} already exists (skipping)`);
      return true;
    } else {
      console.error(`❌ Error creating table ${tableName}:`, error.message);
      return false;
    }
  }
};

// Main function
const main = async () => {
  console.log('Creating DynamoDB tables for stage:', stage);
  console.log('Region:', region);
  console.log('');

  const client = getDynamoDBClient();

  let allSuccess = true;

  // Create Projects Table
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Creating Projects Table');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const projectsExists = await tableExists(client, projectsTable);
  if (!projectsExists) {
    const success = await createTable(client, projectsTable, {
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'userId-index',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
    });
    if (!success) allSuccess = false;
  } else {
    console.log(`⚠️  Table ${projectsTable} already exists (skipping)`);
  }

  console.log('');

  // Create Tasks Table
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Creating Tasks Table');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const tasksExists = await tableExists(client, tasksTable);
  if (!tasksExists) {
    const success = await createTable(client, tasksTable, {
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'projectId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'projectId-index',
          KeySchema: [
            { AttributeName: 'projectId', KeyType: 'HASH' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
        {
          IndexName: 'userId-index',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
    });
    if (!success) allSuccess = false;
  } else {
    console.log(`⚠️  Table ${tasksTable} already exists (skipping)`);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (allSuccess) {
    console.log('✅ All tables created successfully!');
    console.log('');
    console.log('Tables:');
    console.log(`  - ${projectsTable} (with userId-index GSI)`);
    console.log(`  - ${tasksTable} (with projectId-index and userId-index GSIs)`);
    console.log('');
    console.log('You can now use \'npm run dev\' to start the local server.');
    process.exit(0);
  } else {
    console.log('❌ Some tables failed to create. Please check the errors above.');
    process.exit(1);
  }
};

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  console.error(error);
  process.exit(1);
});

