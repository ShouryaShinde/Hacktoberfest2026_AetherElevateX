# Backend Server

A scalable Node.js and Express backend boilerplate following the Model-View-Controller (MVC) architecture with MongoDB and Mongoose.

## Folder Structure

```text
server/
├── src/
│   ├── config/          # Configuration files (database, environment, etc.)
│   │   └── db.js
│   ├── controllers/     # Request handlers and business logic controllers
│   │   └── .gitkeep
│   ├── models/          # Mongoose database models and schemas
│   │   └── .gitkeep
│   ├── routes/          # API route definitions
│   │   └── index.js
│   ├── middlewares/     # Custom Express middlewares
│   │   └── .gitkeep
│   ├── services/        # Business and database query services
│   │   └── .gitkeep
│   ├── utils/           # Utility and helper functions
│   │   └── .gitkeep
│   ├── app.js           # Express app setup and middleware configuration
│   └── server.js        # Server bootstrap and database connection
├── .env.example         # Template for environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Project metadata and dependencies
└── README.md            # Backend documentation
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas URI)

## Getting Started

### 1. Installation

Navigate to the `server/` directory and install dependencies:

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your environment values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/my_database
```

### 3. Running the Server

#### Development Mode (with hot-reloading via Nodemon)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

### 4. Health Check Endpoint

Verify that the server is running properly by calling the health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```
