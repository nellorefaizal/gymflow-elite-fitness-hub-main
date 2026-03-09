# GymFlow Pro - Smart Gym Management System

## Project Overview

A complete gym management solution with member tracking, payments, attendance, and QR-based check-in system.

## Features

- Member Management
- Payment Tracking
- QR Code Check-in
- GPS Location Verification
- Real-time Reports & Analytics
- Trainer Management
- Workout Plans
- WhatsApp Integration (planned)

## Tech Stack

- React + TypeScript
- Vite
- Supabase (Database & Auth)
- Tailwind CSS + shadcn/ui
- Framer Motion

## Getting Started

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Deployment

You can deploy this project to any hosting platform that supports Node.js applications:

- Vercel
- Netlify
- Railway
- Render
- Your own server

Make sure to configure your Supabase environment variables before deployment.

## Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT
