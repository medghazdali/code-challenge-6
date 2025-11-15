# Frontend Setup Guide

## Quick Start

1. **Install dependencies** (fix npm permissions if needed):
   ```bash
   # If you get permission errors, run:
   sudo chown -R $(whoami) ~/.npm
   
   # Then install:
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Update `.env.local`** with your backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   # Or for deployed backend:
   # NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.eu-north-1.amazonaws.com/dev
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**: http://localhost:3001

## Features Implemented

✅ **Full CRUD Operations**
- Projects: Create, Read (List/Get), Update, Delete
- Tasks: Create, Read (List/Get), Update, Delete

✅ **Authentication**
- Sign up page
- Login page
- Auto-redirect to login if not authenticated
- Token management in localStorage

✅ **Responsive Design** (4+ breakpoints)
- Mobile (< 640px): Single column
- Tablet (640px - 1024px): 2 columns
- Desktop (1024px - 1280px): 3 columns
- Large Desktop (> 1280px): 4 columns

✅ **Modern UI with Tailwind CSS**
- Clean, modern design
- Dark mode support
- Smooth transitions
- Modal dialogs for create/edit

## Pages

- `/` - Home page
- `/login` - Login page
- `/signup` - Sign up page
- `/projects` - Projects list (protected)
- `/projects/[id]` - Project detail with tasks (protected)

## API Integration

All API calls go through `lib/api.ts` which:
- Automatically adds auth tokens
- Handles 401 errors (redirects to login)
- Provides typed API methods

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

The app will be available at: `https://your-app.vercel.app`

