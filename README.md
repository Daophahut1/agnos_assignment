# Agnos Healthcare Portal

A modern, real-time patient intake and staff dashboard application built with Next.js, Tailwind CSS, and Socket.io.

## Features

- **Patient Portal**: Responsive intake form with real-time validation.
- **Staff Dashboard**: Live monitoring of patient inputs and submissions.
- **Real-time Sync**: Instant updates using Socket.io.
- **Modern UI**: Clean, professional healthcare aesthetic with Glassmorphism design.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Since we're using a custom server for the real-time features (Socket.io), this app needs a home that supports long-running Node.js processes. **Render** is a perfect choice for this!

**Why not Vercel?**
Vercel is amazing for standard Next.js apps, but because we need a persistent WebSocket connection for the live dashboard, their serverless environment isn't the best fit here.

**How to Deploy on Render:**

1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repo.
4. Render will automatically detect the settings, but just in case, double-check these:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Click **Create Web Service** and watch it go live! 🚀

## Development Planning Documentation

For a detailed breakdown of the project structure, design decisions, component architecture, and real-time synchronization flow, please refer to the [PLANNING.md](./PLANNING.md) file.

### Project Structure Overview

The project follows a standard Next.js App Router structure:

- `src/app/`: Contains the main application routes and global styles.
- `src/components/`: Reusable UI components (`PatientForm`, `StaffDashboard`).
- `src/lib/`: Utility functions and configurations (`socket.ts`).
- `src/pages/api/socket.ts`: The custom Socket.io server handler.

- **PatientForm**: Manages local state for form inputs. Emits `input-change` events via Socket.io on every keystroke to ensure real-time synchronization. Handles final submission via `form-submit` event.
- **StaffDashboard**: Listens for `update-dashboard` events to update the live view and `new-submission` events to add to the history log. Manages connection state and "typing" indicators based on data frequency.

### Real-Time Synchronization Flow

1. **Connection**: Both Client (Patient) and Staff connect to the Socket.io server hosted at `/api/socket`.
2. **Input**: When a patient types in `PatientForm`, the data is sent to the server via the `input-change` event.
3. **Broadcast**: The server broadcasts this data to all connected clients (specifically targeting the staff view) via the `update-dashboard` event.
4. **Display**: `StaffDashboard` receives the data and updates the `currentPatient` state, triggering a re-render of the live monitor.
5. **Submission**: Upon form submission, the data is sent via `form-submit`, which the server broadcasts as `new-submission`, moving the data from the live view to the submission history list.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Real-time**: Socket.io
- **Language**: TypeScript

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
