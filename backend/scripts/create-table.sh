#!/bin/bash

# Script to create DynamoDB table for local development
# This creates the table directly without needing full deployment

TABLE_NAME="tasks-dev"
REGION="us-east-1"

echo "Creating DynamoDB table: $TABLE_NAME"

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it or create the table manually via AWS Console."
    echo ""
    echo "Manual steps:"
    echo "1. Go to AWS Console → DynamoDB"
    echo "2. Click 'Create table'"
    echo "3. Table name: $TABLE_NAME"
    echo "4. Partition key: id (String)"
    echo "5. Settings: Use default settings (On-demand)"
    echo "6. Click 'Create table'"
    exit 1
fi

# Create the table
aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" \
  2>&1 | grep -q "TableDescription" && echo "✅ Table created successfully!" || echo "⚠️  Table may already exist or there was an error. Check AWS Console."

echo ""
echo "Table name: $TABLE_NAME"
echo "You can now use 'npm run dev' to start the local server."

