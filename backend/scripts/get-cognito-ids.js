#!/usr/bin/env node

/**
 * Script to get Cognito User Pool ID and Client ID after deployment
 * This helps you find the IDs to add to your .env file for local development
 */

const { CognitoIdentityProviderClient, ListUserPoolsCommand, ListUserPoolClientsCommand } = require('@aws-sdk/client-cognito-identity-provider');
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

const region = process.env.AWS_REGION || process.env.REGION || 'eu-north-1';
const stage = process.env.STAGE || 'dev';
const serviceName = 'project-task-management-api';

console.log('\n🔍 Searching for Cognito User Pool...');
console.log(`Region: ${region}`);
console.log(`Stage: ${stage}`);
console.log(`Service: ${serviceName}\n`);

const client = new CognitoIdentityProviderClient({
  region: region,
});

async function getCognitoIds() {
  try {
    // List all user pools
    const listPoolsCommand = new ListUserPoolsCommand({
      MaxResults: 60,
    });
    
    const poolsResponse = await client.send(listPoolsCommand);
    
    if (!poolsResponse.UserPools || poolsResponse.UserPools.length === 0) {
      console.log('❌ No Cognito User Pools found.');
      console.log('\n💡 You need to deploy first to create Cognito resources:');
      console.log('   npm run deploy:dev');
      process.exit(1);
    }
    
    // Find the pool matching our service name
    const poolName = `${serviceName}-${stage}`;
    const matchingPool = poolsResponse.UserPools.find(
      pool => pool.Name === poolName
    );
    
    if (!matchingPool) {
      console.log('⚠️  User Pool not found with expected name:', poolName);
      console.log('\n📋 Available User Pools:');
      poolsResponse.UserPools.forEach((pool, index) => {
        console.log(`   ${index + 1}. ${pool.Name} (${pool.Id})`);
      });
      console.log('\n💡 If you see your pool above, you can use its ID manually.');
      process.exit(1);
    }
    
    const userPoolId = matchingPool.Id;
    console.log('✅ Found User Pool:', matchingPool.Name);
    console.log('   User Pool ID:', userPoolId);
    
    // List clients for this pool
    const listClientsCommand = new ListUserPoolClientsCommand({
      UserPoolId: userPoolId,
      MaxResults: 60,
    });
    
    const clientsResponse = await client.send(listClientsCommand);
    
    if (!clientsResponse.UserPoolClients || clientsResponse.UserPoolClients.length === 0) {
      console.log('❌ No clients found for this User Pool.');
      process.exit(1);
    }
    
    // Find the client matching our service name
    const clientName = `${serviceName}-${stage}-client`;
    const matchingClient = clientsResponse.UserPoolClients.find(
      client => client.ClientName === clientName
    );
    
    if (!matchingClient) {
      console.log('⚠️  Client not found with expected name:', clientName);
      console.log('\n📋 Available Clients:');
      clientsResponse.UserPoolClients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.ClientName} (${client.ClientId})`);
      });
      console.log('\n💡 If you see your client above, you can use its ID manually.');
      process.exit(1);
    }
    
    const clientId = matchingClient.ClientId;
    console.log('✅ Found Client:', matchingClient.ClientName);
    console.log('   Client ID:', clientId);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Add these to your .env file:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`COGNITO_USER_POOL_ID=${userPoolId}`);
    console.log(`COGNITO_CLIENT_ID=${clientId}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'CredentialsProviderError' || error.message.includes('credentials')) {
      console.error('\n💡 Please check your AWS credentials:');
      console.error('   - AWS_ACCESS_KEY_ID is set');
      console.error('   - AWS_SECRET_ACCESS_KEY is set');
      console.error('   - Credentials are valid');
    }
    process.exit(1);
  }
}

getCognitoIds();

