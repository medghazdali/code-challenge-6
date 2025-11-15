# Project Task Management API - Backend

A serverless REST API built with Serverless Framework, AWS Lambda, API Gateway, and DynamoDB for managing projects and tasks.

## Architecture Overview

```
┌─────────────────┐
│   API Gateway   │
│   (REST API)    │
└────────┬────────┘
         │
         │ Invokes Lambda Functions
         ▼
┌─────────────────┐
│ Lambda Function │
│ (Business Logic)│
└────────┬────────┘
         │ AWS SDK
         ▼
┌─────────────────┐
│    DynamoDB     │
│    (Database)   │
└─────────────────┘
```

### Key Components

- **API Gateway**: REST API endpoint that receives HTTP requests
- **Lambda Functions**: Serverless functions that handle business logic and data processing
- **DynamoDB**: NoSQL database for storing tasks
- **No Service Proxy**: All requests go through Lambda functions (no direct API Gateway → DynamoDB integration)

## Features

- ✅ Full CRUD operations for tasks
- ✅ Input validation and error handling
- ✅ CORS enabled for frontend integration
- ✅ Multi-stage deployment (dev/prod)
- ✅ Local development support with serverless-offline
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Automated infrastructure as code

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- AWS Account with appropriate permissions
- AWS CLI configured (for local deployment and testing)
- Serverless Framework CLI: `npm install -g serverless`
- AWS credentials configured (required even for local development)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure AWS Credentials

You can configure AWS credentials in one of the following ways:

**Option A: AWS CLI**
```bash
aws configure
```

**Option B: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

**Option C: Create `.env` file** (for local development)
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Local Development

**Important**: Before running locally, you must configure AWS credentials (see Step 2 above). The local server still needs AWS credentials to connect to DynamoDB.

Start the local development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

**For Local Development, you have two options:**

**Option 1: Use Remote DynamoDB (Recommended for quick start)**
- Ensure AWS credentials are configured (see Step 2)
- Deploy the DynamoDB table first: `npm run deploy:dev`
- The local server will connect to the remote DynamoDB table
- Set `TASKS_TABLE` environment variable if needed: `export TASKS_TABLE=tasks-dev`

**Option 2: Use DynamoDB Local**
- Install DynamoDB Local: Download from [AWS](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- Run DynamoDB Local: `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`
- Configure endpoint: Set `AWS_ENDPOINT_URL=http://localhost:8000` before running `npm run dev`
- Note: You'll need Java installed for DynamoDB Local

**Troubleshooting Credentials:**
If you see "Missing credentials" errors:
1. Verify credentials are set: `aws sts get-caller-identity`
2. Check environment variables: `echo $AWS_ACCESS_KEY_ID`
3. Ensure `.env` file exists and is properly formatted (if using Option C)

## API Endpoints

Base URL (after deployment): `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}`

### Create Task

**POST** `/tasks`

Request Body:
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "pending"
}
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Get Task

**GET** `/tasks/{id}`

Response (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### List Tasks

**GET** `/tasks?limit=10&lastEvaluatedKey={key}`

Query Parameters:
- `limit` (optional): Number of items to return (1-1000, default: 100)
- `lastEvaluatedKey` (optional): Pagination token from previous response

Response (200 OK):
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Task 1",
      "description": "Description 1",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1,
  "hasMore": false,
  "lastEvaluatedKey": null
}
```

### Update Task

**PUT** `/tasks/{id}`

Request Body (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress"
}
```

Response (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### Delete Task

**DELETE** `/tasks/{id}`

Response (204 No Content)

## Task Status Values

- `pending`: Task is not yet started
- `in-progress`: Task is currently being worked on
- `completed`: Task is finished

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP Status Codes:
- `400 Bad Request`: Invalid input or validation error
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Deployment

### Manual Deployment

**Deploy to Dev:**
```bash
npm run deploy:dev
```

**Deploy to Prod:**
```bash
npm run deploy:prod
```

### CI/CD Pipeline

The project includes a GitHub Actions workflow that automatically deploys on push to `main` or `master` branch.

#### Setup GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to Repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: AWS region (e.g., `us-east-1`)

#### Workflow Behavior

- **Dev Deployment**: Automatically deploys on push to main/master
- **Prod Deployment**: Requires manual approval (configured via GitHub Environments)

#### CI/CD Screenshots

_Note: Add screenshots of your CI/CD pipeline after first successful deployment_

1. GitHub Actions workflow run
2. Deployment logs
3. Successful deployment confirmation

## Project Structure

```
backend/
├── serverless.yml           # Main Serverless configuration
├── package.json             # Dependencies and scripts
├── handlers/                # Lambda function handlers
│   ├── createTask.js
│   ├── getTask.js
│   ├── listTasks.js
│   ├── updateTask.js
│   └── deleteTask.js
├── lib/                     # Shared utilities
│   ├── dynamodb.js          # DynamoDB client and helper functions
│   └── response.js          # Standardized API responses
├── tests/                   # Unit tests
│   └── handlers/
├── scripts/                 # Deployment scripts
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Environment Variables

- `STAGE`: Deployment stage (dev, prod)
- `TASKS_TABLE`: DynamoDB table name (automatically set by serverless.yml)
- `AWS_REGION`: AWS region (default: us-east-1)

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## DynamoDB Table Schema

**Table Name**: `tasks-{stage}` (e.g., `tasks-dev`, `tasks-prod`)

**Attributes**:
- `id` (String, Partition Key): UUID
- `title` (String): Task title
- `description` (String): Task description
- `status` (String): Task status (pending, in-progress, completed)
- `createdAt` (String): ISO timestamp
- `updatedAt` (String): ISO timestamp

**Billing Mode**: Pay-per-request (on-demand)

## Troubleshooting

### Local Development Issues

**Issue**: Cannot connect to DynamoDB locally / Missing credentials error
- **Solution**: 
  1. Ensure AWS credentials are configured (see Setup Step 2)
  2. Verify credentials: `aws sts get-caller-identity`
  3. For local-only development, install and run DynamoDB Local
  4. Or deploy to AWS first: `npm run deploy:dev`, then use the deployed table

**Issue**: AWS SDK v2 deprecation warning
- **Solution**: The project now uses AWS SDK v3. Run `npm install` to update dependencies

**Issue**: CORS errors
- **Solution**: Ensure CORS is enabled in serverless.yml (already configured)

### Deployment Issues

**Issue**: Permission denied errors
- **Solution**: Check IAM permissions for Lambda, API Gateway, and DynamoDB

**Issue**: Table already exists
- **Solution**: Delete the existing table or use a different stage name

## Security Considerations

- Never commit `.env` files (already in `.gitignore`)
- Use IAM roles with least privilege principle
- Enable CloudWatch logging for monitoring
- Consider adding API rate limiting
- Implement authentication/authorization (Cognito) for production

## Next Steps

- [ ] Add AWS Cognito for authentication
- [ ] Implement unit and integration tests
- [ ] Add API rate limiting
- [ ] Set up CloudWatch alarms
- [ ] Add request/response logging
- [ ] Implement API versioning

## License

MIT

## Author

Created as part of a code challenge demonstrating serverless architecture best practices.

