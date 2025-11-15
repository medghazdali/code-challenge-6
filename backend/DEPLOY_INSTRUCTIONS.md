# Quick Deploy Instructions

## Fix Permission Issues

If you're getting permission errors with `.serverless` directory:

```bash
# Option 1: Remove with sudo (if you have sudo access)
sudo rm -rf backend/.serverless

# Option 2: Change ownership
sudo chown -R $(whoami) backend/.serverless

# Option 3: Change permissions
chmod -R u+w backend/.serverless
```

Then deploy:
```bash
cd backend
npm run deploy:dev
```

## Option 2: Create Table Manually via AWS Console

1. Go to AWS Console → DynamoDB
2. Click "Create table"
3. Table name: `tasks-dev`
4. Partition key: `id` (String)
5. Settings: Use default settings (On-demand)
6. Click "Create table"

## Option 3: Create Table via AWS CLI

```bash
aws dynamodb create-table \
  --table-name tasks-dev \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Verify Table Exists

After creating the table, your local server should work. The table name `tasks-dev` matches what the code expects.

