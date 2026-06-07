# Pravesh Mitra

Phase 0 monorepo scaffold for the `Pravesh Mitra` application.

## Structure

```text
pravesh-mitra/
├── frontend/
└── backend/
```

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router DOM
- Backend: Node.js, Express, MongoDB, Mongoose, dotenv, cors, nodemon

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string

## Installation

Run from the project root:

```bash
npm install
npm run install:all
```

Or install per package:

```bash
cd frontend
npm install

cd ../backend
npm install
```

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pravesh-mitra
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run Commands

### Frontend

```bash
cd frontend
npm run dev
```

### Backend

```bash
cd backend
npm run dev
```

### Root workspace shortcuts

```bash
npm run dev:frontend
npm run dev:backend
```

## Phase 0 Included

- Monorepo structure
- React + Vite frontend scaffold
- Tailwind CSS configuration
- React Router setup
- Express server scaffold
- MongoDB connection setup with Mongoose
- Health check endpoint

## Notes

- ES Modules are enabled in both frontend and backend.
- No AI integration, authentication, business logic, or database models are included in this phase.
