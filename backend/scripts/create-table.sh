#!/bin/bash

# Script to create DynamoDB tables for local development
# This creates both tasks and projects tables with proper indexes

# Get region from environment or use default
REGION="${AWS_REGION:-us-east-1}"
STAGE="${STAGE:-dev}"

TASKS_TABLE="tasks-${STAGE}"
PROJECTS_TABLE="projects-${STAGE}"

echo "Creating DynamoDB tables for stage: ${STAGE}"
echo "Region: ${REGION}"
echo ""

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it or create the tables manually via AWS Console."
    exit 1
fi

# Function to create a table
create_table() {
    local TABLE_NAME=$1
    local ATTRIBUTE_DEFS=$2
    local KEY_SCHEMA=$3
    local GSI_FILE=$4
    
    echo "Creating table: $TABLE_NAME"
    
    local CMD="aws dynamodb create-table \
      --table-name \"$TABLE_NAME\" \
      --attribute-definitions $ATTRIBUTE_DEFS \
      --key-schema $KEY_SCHEMA \
      --billing-mode PAY_PER_REQUEST \
      --region \"$REGION\""
    
    if [ -n "$GSI_FILE" ] && [ -f "$GSI_FILE" ]; then
        CMD="$CMD --global-secondary-indexes file://$GSI_FILE"
    fi
    
    local OUTPUT=$(eval $CMD 2>&1)
    if echo "$OUTPUT" | grep -q "TableDescription"; then
        echo "✅ Table $TABLE_NAME created successfully!"
        return 0
    else
        if echo "$OUTPUT" | grep -q "ResourceInUseException"; then
            echo "⚠️  Table $TABLE_NAME already exists (skipping)"
            return 0
        else
            echo "❌ Error creating table $TABLE_NAME:"
            echo "$OUTPUT"
            return 1
        fi
    fi
}

# Create temporary GSI files
TEMP_DIR=$(mktemp -d)
PROJECTS_GSI_FILE="$TEMP_DIR/projects-gsi.json"
TASKS_GSI_FILE="$TEMP_DIR/tasks-gsi.json"

# Create Projects GSI file
cat > "$PROJECTS_GSI_FILE" << 'EOF'
[
  {
    "IndexName": "userId-index",
    "KeySchema": [
      {
        "AttributeName": "userId",
        "KeyType": "HASH"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    }
  }
]
EOF

# Create Tasks GSI file
cat > "$TASKS_GSI_FILE" << 'EOF'
[
  {
    "IndexName": "projectId-index",
    "KeySchema": [
      {
        "AttributeName": "projectId",
        "KeyType": "HASH"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    }
  },
  {
    "IndexName": "userId-index",
    "KeySchema": [
      {
        "AttributeName": "userId",
        "KeyType": "HASH"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    }
  }
]
EOF

# Create Projects Table
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Creating Projects Table"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PROJECTS_ATTRS="AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S"
PROJECTS_KEY="AttributeName=id,KeyType=HASH"

create_table "$PROJECTS_TABLE" "$PROJECTS_ATTRS" "$PROJECTS_KEY" "$PROJECTS_GSI_FILE"
PROJECTS_RESULT=$?

echo ""

# Create Tasks Table
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Creating Tasks Table"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TASKS_ATTRS="AttributeName=id,AttributeType=S AttributeName=projectId,AttributeType=S AttributeName=userId,AttributeType=S"
TASKS_KEY="AttributeName=id,KeyType=HASH"

create_table "$TASKS_TABLE" "$TASKS_ATTRS" "$TASKS_KEY" "$TASKS_GSI_FILE"
TASKS_RESULT=$?

# Cleanup temp files
rm -rf "$TEMP_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $PROJECTS_RESULT -eq 0 ] && [ $TASKS_RESULT -eq 0 ]; then
    echo "✅ All tables created successfully!"
    echo ""
    echo "Tables created:"
    echo "  - $PROJECTS_TABLE (with userId-index GSI)"
    echo "  - $TASKS_TABLE (with projectId-index and userId-index GSIs)"
    echo ""
    echo "You can now use 'npm run dev' to start the local server."
    exit 0
else
    echo "❌ Some tables failed to create. Please check the errors above."
    exit 1
fi

