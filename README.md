# Samjho AI

> **Understand the information. Know what to do next.**

Samjho AI helps people understand complex documents (college notices, circulars, scholarship announcements, application forms, and public notices) in plain language and turns them into reliable, actionable next steps.

---

## Repository Structure

The project is structured into frontend and backend applications with documentation at the root:

```text
Hacktoberfest2026_AetherElevateX/
├── docs/                   # Specifications, architecture, contracts, and implementation plan
├── server/                 # Backend API (Node.js, Express, MVC architecture)
│   ├── src/
│   │   ├── config/         # Database and environment configurations
│   │   ├── controllers/    # Request controllers
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── models/         # Database models and schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Core business logic services
│   │   ├── utils/          # Shared utilities and helpers
│   │   ├── app.js          # Express app configuration
│   │   └── server.js       # Server entry point
│   ├── .env.example        # Environment variable template
│   ├── package.json        # Backend dependencies and scripts
│   └── README.md           # Backend documentation
├── client/                 # Frontend application (React + Vite)
├── AGENTS.md               # Antigravity coding guidelines and rules
└── README.md               # Project root documentation
```

---

## Tech Stack

- **Backend**: Node.js (ES Modules), Express.js, Mongoose, dotenv, cors, nodemon
- **Frontend**: React, Vite
- **Architecture**: MVC (Model-View-Controller) / Service separation
- **AI Engine (Upcoming)**: Gemma 4 inference adapter for document summarization and grounded Q&A

---

## Integration Guide for Frontend Developers

A comprehensive, ready-to-use guide with copy-paste client code, payload formats, and sample responses is available here:
👉 **[Backend Connection Guide](docs/BACKEND_CONNECTION_GUIDE.md)**

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (local daemon or MongoDB Atlas cluster)

### 2. Backend Setup (`server/`)
```bash
cd server
npm install
cp .env.example .env
```
Configure your `.env` with:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Run in development mode:
```bash
npm run dev
```

Run in production mode:
```bash
npm start
```

Health check:
```bash
curl http://localhost:5000/api/health
```

### 3. Frontend Setup (`client/`)
```bash
cd client
npm install
npm run dev
```

---

## Implementation Status

- **Phase 0 (Baseline Setup & Inspection)**: Completed.
- **Phase 1 (UI Shell & Mock Data)**: Managed on frontend client.
- **Phase 2 (API Foundation)**: Completed (Request ID, CORS, centralized errors, rate limiting, Multer PDF & text extraction, validation).
- **Phase 3 (Gemma Provider Adapter & Validation)**: Completed (Adapter for Gemma inference, versioned prompt template, Zod schema validation, safe JSON repair, mock provider).
- **Phase 4 (End-to-End Analysis)**: In progress / Frontend integration.
- **Phase 5 (Grounded Q&A & Sessions)**: Ready for implementation.

