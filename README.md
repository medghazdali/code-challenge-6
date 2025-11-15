# Project Task Management System

A full-stack serverless task management application built with Next.js frontend and AWS serverless backend. Users can create projects, manage tasks with a Kanban board interface, and collaborate securely with JWT authentication.

## 🚀 Live Demo

- **Frontend**: [https://code-challenge-6-lnuqbbjbc-mohameds-projects-b65fe955.vercel.app](https://code-challenge-6-lnuqbbjbc-mohameds-projects-b65fe955.vercel.app)
- **API**: `https://xflosrl4qb.execute-api.eu-north-1.amazonaws.com/dev`
- **Video Demo**: [Watch the application walkthrough](https://www.loom.com/share/9cf1c1a6b1c4400c885b5d93e6eef7df)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Use Cases & User Stories](#use-cases--user-stories)
- [Testing](#testing)

## ✨ Features

### 🔐 Authentication & Security
- **User Registration & Login** with email verification
- **JWT Token Authentication** using AWS Cognito
- **Secure API endpoints** with Cognito authorizers
- **User data isolation** - users only see their own data

### 📊 Project Management
- **Create, Read, Update, Delete** projects
- **Project dashboard** with overview statistics
- **User-specific projects** with secure access control

### 📝 Task Management
- **Full CRUD operations** for tasks within projects
- **Kanban Board Interface** with drag-and-drop functionality
- **Task Status Management**: Pending, In Progress, Completed
- **Task filtering and search** capabilities
- **Real-time updates** and responsive UI

### 🎨 User Experience
- **Modern, responsive design** with Tailwind CSS
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Mobile-friendly interface**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Lambda        │
│   (Next.js)     │───▶│   (REST API)    │───▶│   Functions     │
│   Vercel        │    │   + Cognito     │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   AWS Cognito   │◀────────────┘
                       │   (Auth)        │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   DynamoDB      │
                       │   (Database)    │
                       └─────────────────┘
```

### Key Architectural Decisions

1. **Serverless Architecture**: Zero server management, automatic scaling
2. **JWT Authentication**: Secure, stateless authentication with AWS Cognito
3. **NoSQL Database**: DynamoDB for flexible, scalable data storage
4. **API Gateway Integration**: Built-in CORS, throttling, and monitoring
5. **Infrastructure as Code**: Serverless Framework for reproducible deployments

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context
- **HTTP Client**: Axios with interceptors
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Serverless Framework
- **Authentication**: AWS Cognito User Pools
- **Database**: AWS DynamoDB
- **API**: AWS API Gateway (REST)
- **Functions**: AWS Lambda
- **Testing**: Jest + Supertest
- **Deployment**: AWS CloudFormation

### DevOps & Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Infrastructure**: AWS CloudFormation
- **Monitoring**: AWS CloudWatch
- **Documentation**: OpenAPI/Swagger

## 📁 Project Structure

```
code-challenge-6/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js 13+ app directory
│   ├── components/          # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities (API, auth)
│   ├── types/              # TypeScript type definitions
│   └── __tests__/          # Frontend tests
├── backend/                 # Serverless backend
│   ├── handlers/           # Lambda function handlers
│   ├── lib/                # Shared utilities
│   ├── tests/              # Backend tests
│   ├── swagger/            # API documentation
│   └── serverless.yml      # Serverless configuration
├── .github/                # GitHub Actions workflows
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn**
- **AWS Account** with appropriate permissions
- **Git** for version control

### 1. Clone Repository
```bash
git clone https://github.com/medghazdali/code-challenge-6.git
cd code-challenge-6
```

### 2. Setup Backend
```bash
cd backend
npm install

# Configure AWS credentials (choose one method):
# Method 1: AWS CLI
aws configure

# Method 2: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=eu-north-1

# Deploy backend
npm run deploy:dev
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API URL and Cognito details

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **API**: Your deployed API Gateway URL

## 💻 Local Development

### Backend Development
```bash
cd backend

# Install dependencies
npm install

# Run tests
npm test
npm run test:watch

# Local development with serverless-offline
npm run dev

# Deploy to AWS
npm run deploy:dev
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
npm run test:watch

# Build for production
npm run build
```

### Environment Variables

#### Backend (.env)
```env
AWS_REGION=eu-north-1
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.com/dev
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id
```

## 🚢 Deployment

### Backend Deployment (AWS)
```bash
cd backend
npm run deploy:dev    # Deploy to dev environment
npm run deploy:prod   # Deploy to production
```

### Frontend Deployment (Vercel)
```bash
cd frontend
npm run build
npm run start

# Or deploy to Vercel
vercel --prod
```

### CI/CD Pipeline
The project includes GitHub Actions for automated deployment:
- **Backend**: Deploys to AWS on push to main branch
- **Frontend**: Auto-deploys to Vercel on push

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/confirm` - Email confirmation
- `POST /auth/refresh` - Token refresh

### Project Endpoints
- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Task Endpoints
- `GET /projects/{projectId}/tasks` - List project tasks
- `POST /projects/{projectId}/tasks` - Create new task
- `GET /tasks/{id}` - Get task details
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

**Full API Documentation**: Available at `/swagger` endpoint when deployed

## 🎯 Use Cases & User Stories

### Primary Use Cases Implemented

#### 1. **User Authentication & Onboarding**
- **As a new user**, I want to register with my email and password
- **As a registered user**, I want to log in securely
- **As a user**, I want to receive email verification for security

#### 2. **Project Management**
- **As a user**, I want to create multiple projects to organize my work
- **As a project owner**, I want to view all my projects in a dashboard
- **As a user**, I want to edit project details and descriptions
- **As a user**, I want to delete projects I no longer need

#### 3. **Task Management & Kanban Board**
- **As a project manager**, I want to create tasks within my projects
- **As a team member**, I want to view tasks in a Kanban board layout
- **As a user**, I want to drag and drop tasks between status columns
- **As a task owner**, I want to update task details and status
- **As a user**, I want to filter and search through tasks

#### 4. **Data Security & Privacy**
- **As a user**, I want my data to be secure and private
- **As a system**, I want to ensure users only access their own data
- **As an admin**, I want all API endpoints to be properly authenticated

### User Journey Example
1. **Registration**: User signs up with email/password
2. **Verification**: User confirms email address
3. **Login**: User authenticates and receives JWT tokens
4. **Project Creation**: User creates their first project
5. **Task Management**: User adds tasks and organizes them on Kanban board
6. **Collaboration**: User manages multiple projects with different task statuses

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run load tests
npm run test:load
```

### Frontend Testing
```bash
cd frontend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

### Test Coverage
- **Backend**: Unit tests for all handlers and utilities
- **Frontend**: Component tests and integration tests
- **API**: Integration tests for all endpoints
- **Authentication**: Security and token validation tests

### Manual Testing Checklist
- [ ] User registration and email verification
- [ ] User login and logout
- [ ] Project CRUD operations
- [ ] Task CRUD operations
- [ ] Kanban board drag and drop
- [ ] Responsive design on mobile
- [ ] Error handling and edge cases

## 👨‍💻 Author

**Mohamed Ghazdali**
- GitHub: [@medghazdali](https://github.com/medghazdali)
- Email: med.ghazdali@gmail.com
