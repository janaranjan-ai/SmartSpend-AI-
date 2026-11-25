# SmartSpend AI 💰

### Smart Expense Tracker & Financial Insights Platform

SmartSpend AI is a full-stack expense tracking application that helps users manage income, monitor expenses, set monthly budgets, and understand their spending habits through visual financial insights.

**Live Demo:** https://smart-spend-ai-eta.vercel.app

**Backend API:** https://smartspend-ai-backend-n6u6.onrender.com/api/health

## ✨ Features

- User registration and secure login with JWT authentication
- Add, edit, and delete income and expense transactions
- Track total balance, income, and expenses
- Create and manage monthly category budgets
- Visualize cash flow using interactive charts
- Analyze spending by category
- View financial insights based on recorded transactions
- Export transaction records as CSV
- User-specific data stored in MongoDB

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Styling | CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JSON Web Token (JWT) |
| API Requests | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

## 📁 Project Structure

```text
SmartSpend-AI/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/janaranjan-ai/SmartSpend-AI-.git
cd SmartSpend-AI-
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 🔐 Security

- Password-based authentication
- JWT-protected API routes
- User-specific transaction and budget access
- Environment variables for sensitive configuration
- `.env` files excluded from version control

## 🌐 Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## 👨‍💻 Developer

**Janaranjan K**

B.Tech – Artificial Intelligence and Data Science

GitHub: https://github.com/janaranjan-ai

LinkedIn: https://www.linkedin.com/in/janaranjan-k/

---

⭐ If you find this project useful, consider giving the repository a star!

**SmartSpend AI — Track smarter. Spend better. Save more.**
