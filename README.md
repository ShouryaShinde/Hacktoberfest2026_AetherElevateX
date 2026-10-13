# Samjho AI — Plain-Language Document Assistant

> **"Understand the information. Know what to do next."**

Samjho AI turns complex official documents—such as college notices, circulars, scholarship announcements, fee notices, and public forms—into clear, plain-language explanations and actionable next steps.

---

## 1. Project Overview

- **Problem:** Official documents often bury critical details (eligibility rules, mandatory documents, deadlines, fees, and next steps) in dense, bureaucratic prose.
- **Target Audience:** College students, parents, and citizens navigating administrative paperwork.
- **Primary Journey:** **Upload → Understand → Take Action** (with document-grounded follow-up Q&A).
- **Core Principles:** Grounded answers over guesses, privacy by default (no permanent document retention for MVP), and clean structured outputs.

---

## 2. Repository Structure

The repository is structured into frontend (`client/`), backend (`server/`), and specification documentation (`docs/`):

```text
Hacktoberfest2026_AetherElevateX/
├── AGENTS.md                  # Instructions and guardrails for coding agents
├── README.md                  # Project overview and developer instructions
├── client/                    # Frontend application (React + Vite)
│   ├── src/
│   │   ├── assets/            # Static assets
│   │   ├── App.jsx            # Application shell
│   │   ├── App.css            # Component styles
│   │   ├── index.css          # Global styling entrypoint
│   │   └── main.jsx           # React DOM root
│   ├── index.html             # Vite entry HTML
│   ├── package.json           # Client dependencies and scripts
│   └── vite.config.js         # Vite configuration
├── server/                    # Backend API (Express.js)
│   ├── src/
│   │   ├── config/            # Server & database configuration
│   │   ├── controllers/       # Route controllers (MVC pattern)
│   │   ├── middlewares/       # Custom middleware
│   │   ├── models/            # Data models
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Helper utilities
│   │   ├── app.js             # Express app definition
│   │   └── server.js          # Server entry point
│   ├── .env.example           # Backend environment template
│   └── package.json           # Server dependencies and scripts
└── docs/                      # Architectural specifications and contracts
    ├── README.md              # Documentation index
    ├── PRD.md                 # Product requirements document
    ├── ARCHITECTURE.md        # Monorepo and design architecture
    ├── API_CONTRACT.md        # API endpoints and error envelopes
    ├── AI_PIPELINE.md         # Gemma prompt, schema, and validation
    ├── DATABASE.md            # Persistence and retention guidelines
    ├── UI_UX.md               # User interface design and components
    ├── IMPLEMENTATION_PLAN.md # Phased delivery plan (Phases 0–6)
    ├── SECURITY_AND_PRIVACY.md# Security, privacy, and injection defense
    ├── TESTING.md             # Test fixtures and verification strategy
    └── ENVIRONMENT.md         # Environment variables & local configuration
```

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Client Setup (Frontend)
```bash
cd client
npm install
npm run dev
```
The client dev server runs at `http://localhost:5173/`.

Available client scripts:
- `npm run dev`: Starts the Vite local development server.
- `npm run build`: Bundles the client for production.
- `npm run lint`: Runs ESLint over client files.
- `npm run preview`: Previews the production build locally.

### Server Setup (Backend)
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
The server runs on the port specified in `.env` (default: `5000` or `4000`).

Available server scripts:
- `npm start`: Runs the server with Node.js.
- `npm run dev`: Runs the server with `nodemon` for auto-reloading.

---

## 4. Phase Status & Roadmap

| Phase | Description | Status | Notes |
|---|---|---|---|
| **Phase 0** | Repository inspection and baseline | **Completed** | Baseline verified, gaps documented, checks executed |
| **Phase 1** | UI shell and mock data | Pending | Upload/paste UI, selectors, responsive layout, mock response |
| **Phase 2** | API foundation | Pending | Express app, health check, PDF extraction, validation |
| **Phase 3** | Gemma provider adapter | Pending | Provider adapter, system prompt, Zod validation |
| **Phase 4** | End-to-end analysis | Pending | Wire UI to `POST /api/v1/documents/analyze` |
| **Phase 5** | Grounded follow-up Q&A | Pending | Temporary session Q&A, evidence references |
| **Phase 6** | Quality, security, & evaluation | Pending | Evaluation suite, rate limiting, production hardening |

---

## 5. Current Baseline & Known Blockers (Phase 0 Findings)

1. **Client Styling / Tailwind Dependency:**
   - `client/src/index.css` and `client/src/App.css` include `@import "tailwindcss";`.
   - `tailwindcss` and `@tailwindcss/vite` are currently missing from `client/package.json`, causing `npm run build` to fail until installed and registered.
2. **Client Language Stack:**
   - Currently configured in JavaScript (`.jsx`), whereas `docs/ARCHITECTURE.md` specifies TypeScript (`.tsx`).
3. **Server Dependencies & Database Requirement:**
   - Dependencies in `server/` have not been installed yet (`node_modules` missing).
   - `server/src/server.js` requires an active MongoDB connection (`connectDB()`), whereas `docs/DATABASE.md` specifies an in-memory/TTL session store without mandatory database persistence for the initial MVP.
4. **API Contract & Routing:**
   - Current server routes are mounted at `/api/health`, whereas `docs/API_CONTRACT.md` specifies `/api/v1` base path with `/health` returning `{ success: true, status: "ok" }`.
