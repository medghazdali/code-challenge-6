# Project Task Manager - Frontend

A modern Next.js frontend application for managing projects and tasks, built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ **Full CRUD Operations** - Create, Read, Update, Delete for both Projects and Tasks
- ✅ **Authentication** - Sign up and login with AWS Cognito
- ✅ **Responsive Design** - Optimized for 4+ device sizes (mobile, tablet, desktop, large desktop)
- ✅ **Modern UI** - Built with Tailwind CSS for a clean, modern design
- ✅ **Dark Mode Support** - Automatic dark mode based on system preferences
- ✅ **Protected Routes** - Authentication required for accessing projects and tasks

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

## Responsive Breakpoints

The application is fully responsive with support for:

1. **Mobile** (< 640px) - Single column layout, stacked navigation
2. **Tablet** (640px - 1024px) - 2 column grid for projects/tasks
3. **Desktop** (1024px - 1280px) - 3 column grid
4. **Large Desktop** (> 1280px) - 4 column grid for optimal space usage

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
# Or for deployed backend:
# NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.eu-north-1.amazonaws.com/dev
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Sign up page
│   ├── projects/       # Projects list page
│   │   └── [id]/       # Project detail with tasks
│   ├── layout.tsx      # Root layout with Navbar
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/
│   ├── Navbar.tsx      # Navigation bar
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── lib/
│   ├── api.ts          # API client and endpoints
│   └── auth.ts         # Authentication utilities
└── package.json
```

## API Integration

The frontend connects to the backend API endpoints:

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/confirm` - Email confirmation
- `POST /auth/refresh` - Token refresh

### Projects
- `GET /projects` - List all projects
- `GET /projects/{id}` - Get project details
- `POST /projects` - Create project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Tasks
- `GET /projects/{projectId}/tasks` - List tasks in project
- `GET /tasks/{id}` - Get task details
- `POST /projects/{projectId}/tasks` - Create task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (required)
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID` - Cognito User Pool ID (optional, if using direct Cognito)
- `NEXT_PUBLIC_COGNITO_CLIENT_ID` - Cognito Client ID (optional)
- `NEXT_PUBLIC_AWS_REGION` - AWS Region (default: eu-north-1)

## Features Implementation

### CRUD Operations

✅ **Create**: 
- Create new projects with name and description
- Create new tasks within projects with title, description, and status

✅ **Read**: 
- List all projects in a responsive grid
- View project details and all associated tasks
- Task cards show status with color coding

✅ **Update**: 
- Edit task details (title, description, status)
- Update task status (pending → in-progress → completed)

✅ **Delete**: 
- Delete projects (with confirmation)
- Delete tasks (with confirmation)

### Responsive Design

The application uses Tailwind CSS responsive utilities:
- `sm:` - Small devices (640px+)
- `md:` - Medium devices (768px+)
- `lg:` - Large devices (1024px+)
- `xl:` - Extra large devices (1280px+)

All pages are optimized for mobile-first responsive design.

## Authentication Flow

1. User signs up → Account created and auto-confirmed
2. User logs in → Receives access token, ID token, refresh token
3. Tokens stored in localStorage
4. All API requests include Bearer token in Authorization header
5. On 401 error → User redirected to login

## Next Steps

- [ ] Add task filtering and sorting
- [ ] Add project search functionality
- [ ] Add task due dates and reminders
- [ ] Add drag-and-drop task reordering
- [ ] Add project sharing (future feature)
