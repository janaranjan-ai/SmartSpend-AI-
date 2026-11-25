# SmartSpend AI

A full-stack personal finance tracker built with React, Express, and MongoDB.

## Features
- Branded green fintech interface with responsive sidebar
- Signup, login, JWT authentication
- Dashboard with income, expenses, balance and savings summaries
- Create, edit, delete and filter transactions
- Monthly budgets with progress tracking
- Spending insights and category breakdown
- CSV export
- Demo mode: frontend works with local browser storage if the backend is not configured

## Requirements
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

## 1. Start the backend
```bash
cd backend
cp .env.example .env
# Add your MongoDB connection string and a strong JWT_SECRET to .env
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

## 2. Start the frontend
Open a second terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

The frontend uses demo mode automatically if the API cannot be reached. Demo data is stored in the current browser only. For real accounts and persistent data, configure and run the backend.

## Deployment
### Backend (Render)
- Create a Web Service from the GitHub repository.
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL), `NODE_ENV=production`.

### Frontend (Vercel)
- Import the same GitHub repository.
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL` with your Render backend URL, ending in `/api`.

### MongoDB Atlas
Create a database user, allow network access for your deployment (prefer restricting access where possible), and copy the driver connection string into `MONGO_URI`. Never commit `.env` files or secrets.

## Important
- The included insights are rule-based financial observations, not personalized investment advice.
- Do not enter bank credentials or card numbers. This app is a manual expense tracker, not a banking integration.
