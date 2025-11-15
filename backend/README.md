# Project Task Management API - Backend

A serverless REST API built with Serverless Framework, AWS Lambda, API Gateway, DynamoDB, and AWS Cognito for managing projects and tasks. Features full user authentication and user-specific data isolation.

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
- **OpenAPI/Swagger Documentation**: Auto-generated API documentation

## Features

- ✅ **AWS Cognito Authentication** - User signup, login, and token management
- ✅ **Projects Management** - Full CRUD operations for user projects
- ✅ **Tasks Management** - Full CRUD operations for tasks within projects
- ✅ **User Data Isolation** - Users can only access their own projects and tasks
- ✅ **Protected Routes** - All endpoints require authentication except signup/login
- ✅ **Input validation and error handling**
- ✅ **CORS enabled** for frontend integration
- ✅ **Multi-stage deployment** (dev/prod)
- ✅ **Local development support** with serverless-offline
- ✅ **CI/CD pipeline** with GitHub Actions
- ✅ **Automated infrastructure as code**
- ✅ **OpenAPI/Swagger documentation**

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

**Note**: All endpoints except authentication require a valid Cognito JWT token in the `Authorization` header:
```
Authorization: Bearer <access-token>
```

### Authentication Endpoints (Public)

#### Sign Up
**POST** `/auth/signup`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

Response (201 Created):
```json
{
  "message": "User registered successfully. Please check your email for confirmation code.",
  "userSub": "uuid",
  "codeDeliveryDetails": { ... }
}
```

#### Login
**POST** `/auth/login`

Request Body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response (200 OK):
```json
{
  "accessToken": "eyJraWQ...",
  "idToken": "eyJraWQ...",
  "refreshToken": "eyJjdHk...",
  "expiresIn": 3600
}
```

#### Confirm Signup
**POST** `/auth/confirm`

Request Body:
```json
{
  "email": "user@example.com",
  "confirmationCode": "123456"
}
```

#### Refresh Token
**POST** `/auth/refresh`

Request Body:
```json
{
  "refreshToken": "eyJjdHk..."
}
```

### Projects Endpoints (Protected - Requires Authentication)

#### Create Project
**POST** `/projects`

Request Body:
```json
{
  "name": "My Project",
  "description": "Project description"
}
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "cognito-user-id",
  "name": "My Project",
  "description": "Project description",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Get Project
**GET** `/projects/{id}`

#### List Projects
**GET** `/projects?limit=10&lastEvaluatedKey={key}`

Returns only projects belonging to the authenticated user.

#### Update Project
**PUT** `/projects/{id}`

#### Delete Project
**DELETE** `/projects/{id}`

### Tasks Endpoints (Protected - Requires Authentication)

#### Create Task
**POST** `/projects/{projectId}/tasks`

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
  "projectId": "project-uuid",
  "userId": "cognito-user-id",
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Get Task
**GET** `/tasks/{id}`

#### List Tasks
**GET** `/projects/{projectId}/tasks?limit=10&lastEvaluatedKey={key}`

Returns only tasks belonging to the specified project (which must belong to the authenticated user).

#### Update Task
**PUT** `/tasks/{id}`

#### Delete Task
**DELETE** `/tasks/{id}`

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

## API Documentation (Swagger/OpenAPI)

After deployment, the API documentation is automatically generated and available:

- **API Gateway Console**: Go to your API Gateway → Documentation
- **OpenAPI Spec**: Available at `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/documentation`
- **Import to Postman/Insomnia**: Use the OpenAPI spec URL

The documentation includes:
- All endpoints with descriptions
- Request/response schemas
- Example values
- Error responses
- Query parameters and path parameters

## Business Case: Project Task Management System

This API implements a **Project Task Management System** where:

- **Users** authenticate via AWS Cognito
- **Users** create and manage their own **Projects**
- Each **Project** contains multiple **Tasks**
- **Tasks** have status workflow: `pending` → `in-progress` → `completed`
- All data is **user-specific** - users can only access their own projects and tasks
- **Authentication required** for all operations except signup/login

### Data Model

```
Users (Cognito)
  └── Projects (user owns)
      └── Tasks (belong to project)
```

### Task Status Values

- `pending`: Task is not yet started
- `in-progress`: Task is currently being worked on
- `completed`: Task is finished

## Authentication Flow

1. **Sign Up**: User creates account → receives confirmation code via email
2. **Confirm**: User confirms email with code
3. **Login**: User logs in → receives access token, ID token, and refresh token
4. **API Calls**: Include access token in `Authorization: Bearer <token>` header
5. **Refresh**: Use refresh token to get new access token when expired

## Local Development with Authentication

**⚠️ IMPORTANT:** `serverless-offline` does NOT enforce Cognito authorizers. Authentication is still enforced at the handler level, but you need to provide a test user ID for local testing.

### Option 1: Use Test User ID Header (Development Only)

For local testing with `serverless-offline`, add this header to your requests:

```
X-Test-User-Id: test-user-id-123
```

**In Swagger UI:**
1. Click "Try it out" on any protected endpoint
2. Scroll down to see the request parameters
3. Add a new header: `X-Test-User-Id` with value `test-user-123`
4. Execute the request

**Using curl:**
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "X-Test-User-Id: test-user-123" \
  -d '{"name": "My Project", "description": "Test"}'
```

**Note:** Without this header, you will get `401 Unauthorized` - authentication is enforced even in local development.

### Option 2: Deploy to AWS and Test

Deploy to dev stage and test with real Cognito tokens from the login endpoint. In production, API Gateway validates JWT tokens automatically.

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
├── swagger/                 # OpenAPI/Swagger models
│   └── models/
│       ├── Task.json
│       ├── TaskInput.json
│       ├── TaskList.json
│       └── Error.json
├── tests/                   # Unit tests
│   └── handlers/
├── scripts/                 # Deployment scripts
│   ├── load-env-and-start.js
│   ├── list-tables.js
│   └── create-table.sh
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Environment Variables

- `STAGE`: Deployment stage (dev, prod)
- `TASKS_TABLE`: DynamoDB table name (automatically set by serverless.yml)
- `PROJECTS_TABLE`: DynamoDB table name (automatically set by serverless.yml)
- `COGNITO_USER_POOL_ID`: Cognito User Pool ID (automatically set by serverless.yml)
- `COGNITO_CLIENT_ID`: Cognito Client ID (automatically set by serverless.yml)
- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS access key (for local development)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (for local development)

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

## Utility Scripts

**List DynamoDB tables:**
```bash
npm run list-tables
```

**Create DynamoDB table:**
```bash
npm run create-table
```

## DynamoDB Table Schemas

### Projects Table
**Table Name**: `projects-{stage}` (e.g., `projects-dev`, `projects-prod`)

**Attributes**:
- `id` (String, Partition Key): UUID
- `userId` (String): Cognito User ID (GSI: userId-index)
- `name` (String): Project name
- `description` (String): Project description
- `createdAt` (String): ISO timestamp
- `updatedAt` (String): ISO timestamp

**Global Secondary Indexes**:
- `userId-index`: Query projects by user

**Billing Mode**: Pay-per-request (on-demand)

### Tasks Table
**Table Name**: `tasks-{stage}` (e.g., `tasks-dev`, `tasks-prod`)

**Attributes**:
- `id` (String, Partition Key): UUID
- `projectId` (String): Project ID (GSI: projectId-index)
- `userId` (String): Cognito User ID (GSI: userId-index)
- `title` (String): Task title
- `description` (String): Task description
- `status` (String): Task status (pending, in-progress, completed)
- `createdAt` (String): ISO timestamp
- `updatedAt` (String): ISO timestamp

**Global Secondary Indexes**:
- `projectId-index`: Query tasks by project
- `userId-index`: Query tasks by user

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

**Issue**: ResourceNotFoundException - Table not found
- **Solution**: 
  1. Verify table exists: `npm run list-tables`
  2. Check table name matches exactly: `tasks-dev` (case-sensitive)
  3. Verify region matches: Check `AWS_REGION` in `.env` file
  4. Create table if missing: `npm run create-table` or via AWS Console

**Issue**: CORS errors
- **Solution**: Ensure CORS is enabled in serverless.yml (already configured)

### Deployment Issues

**Issue**: Permission denied errors
- **Solution**: Check IAM permissions for Lambda, API Gateway, and DynamoDB

**Issue**: Table already exists
- **Solution**: Delete the existing table or use a different stage name

**Issue**: Swagger documentation not showing
- **Solution**: 
  1. Ensure `serverless-openapi-documentation` plugin is installed: `npm install`
  2. Check plugin is listed in `serverless.yml` plugins section
  3. Verify model files exist in `swagger/models/` directory

## Security Considerations

- ✅ **AWS Cognito Authentication** - All endpoints protected except signup/login
- ✅ **User Data Isolation** - Users can only access their own data
- ✅ **JWT Token Validation** - API Gateway validates Cognito tokens
- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Use IAM roles with least privilege principle
- ✅ Enable CloudWatch logging for monitoring
- ⚠️ Consider adding API rate limiting
- ⚠️ Consider adding request validation middleware

## Next Steps

- [x] Add AWS Cognito for authentication
- [ ] Implement unit and integration tests
- [ ] Add API rate limiting
- [ ] Set up CloudWatch alarms
- [ ] Add request/response logging
- [ ] Implement API versioning

## License

MIT

## Author

Created as part of a code challenge demonstrating serverless architecture best practices.
