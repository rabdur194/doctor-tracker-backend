# Doctor Tracker

A secure administrative web application that allows authenticated users to manage doctors and their corresponding patients. The system focuses on performance optimization, clean UX, and data visualization.

## Description

Doctor Tracker is a full-stack admin portal built for healthcare administrators. It provides secure login, complete CRUD operations for doctors and patients, powerful search/filter/pagination, and a rich analytics dashboard with charts. The architecture uses a separate Next.js frontend communicating with a standalone Express + MongoDB backend over a RESTful API, following industry best practices for code structure, query optimization, and responsive UI.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB (Mongoose ODM)             |
| Auth      | JWT (JSON Web Tokens) + bcrypt      |
| API       | RESTful design principles           |
| Local Dev | Docker + Docker Compose (optional but recommended) |

## Features

### Authentication
- Secure login with JWT
- All routes protected (frontend + backend)
- Password hashing with bcrypt

### Doctor Management
- Create doctors (name, specialization, hospital, phone, email)
- List with search, specialization filter, date-wise filter
- Pagination
- View patients belonging to a doctor
- Add / remove patients under a doctor

### Patient Management
- Dedicated Patients page
- List, edit, delete patients
- Search, condition filter, date-wise filter
- Pagination

### Dashboard & Data Visualization
- Total doctors & total patients
- Patients per doctor (bar chart)
- Top conditions (pie chart)
- Activity over last 30 days (line chart)
- Optimized MongoDB aggregation queries

## Project Structure

```
doctor-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth + error handling
│   │   ├── models/          # Mongoose schemas (with indexes)
│   │   ├── routes/          # Express routes
│   │   ├── seed.js          # Demo data seeder
│   │   └── server.js        # Entry point
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext (state management)
│   │   ├── lib/             # API client
│   │   └── types/           # TypeScript interfaces
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Local Setup (Recommended for Interview)

You have **two options**. Docker is recommended because it guarantees MongoDB works the same on any machine.

### Option A — Docker (Recommended)

**Prerequisites:** Docker Desktop installed and running.

```bash
# From the project root
docker compose up --build -d

# Seed the database (run once)
docker compose exec backend node src/seed.js
```

- Backend API → http://localhost:5000  
- MongoDB → localhost:27017  

Then start the frontend **locally** (faster for development):

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev          # → http://localhost:3000
```

**Login credentials (after seeding):**
- Email: `admin@doctortracker.com`
- Password: `admin123`

To stop everything:
```bash
docker compose down
```

### Option B — Without Docker

**Prerequisites:** Node.js 18+, MongoDB running locally.

#### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit MONGODB_URI if your MongoDB is not on localhost:27017

npm install
npm run seed
npm run dev          # → http://localhost:5000
```

#### 2. Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev          # → http://localhost:3000
```

---

## System Architecture

```
┌─────────────────┐         REST API          ┌─────────────────┐
│                 │  ──────────────────────►  │                 │
│  Next.js        │  Authorization: Bearer    │  Express.js     │
│  Frontend       │  ◄──────────────────────  │  Backend        │
│  (Port 3000)    │         JSON              │  (Port 5000)    │
│                 │                           │                 │
└────────┬────────┘                           └────────┬────────┘
         │                                             │
         │  localStorage (JWT)                         │  Mongoose
         │                                             ▼
         │                                    ┌─────────────────┐
         │                                    │    MongoDB      │
         │                                    │  - Users        │
         │                                    │  - Doctors      │
         │                                    │  - Patients     │
         │                                    └─────────────────┘
```

**Data flow:**
1. User logs in → Backend validates credentials → returns JWT
2. Frontend stores JWT in localStorage
3. Every subsequent request includes `Authorization: Bearer <token>`
4. Backend middleware verifies JWT and attaches user to request
5. Controllers perform optimized MongoDB queries (indexes, aggregation, lean())
6. Frontend renders data with React state + Recharts for visualization

---

## Technical Decisions

### 1. Why separate Express backend instead of Next.js API routes?

The specification explicitly required a **separate standalone Express server** communicating over REST endpoints. This separation:
- Makes the API reusable by other clients (mobile apps, etc.)
- Keeps concerns clearly divided
- Allows independent scaling of frontend and backend
- Matches the evaluation criteria around RESTful API design

### 2. Why React Context for auth instead of Redux?

For this application the auth state is simple (user object + token). React Context + a custom hook (`useAuth`) provides:
- Zero extra dependency weight
- Easy to understand for junior developers
- Sufficient performance (auth changes are rare)
- Clean integration with Next.js client components

If the app grew to have complex global state, Redux Toolkit or Zustand would be considered.

### Additional optimizations implemented:
- MongoDB indexes on searchable/filterable fields (`name`, `specialization`, `condition`, `createdAt`, compound indexes)
- `Promise.all` for parallel queries
- `.lean()` for faster read queries
- Server-side pagination (never load all records)
- Avoided unnecessary re-renders with proper `useCallback` dependencies

---

## Deployment Guide (Required for Submission)

You need **two separate GitHub repositories** and live URLs.

### 1. Backend → Render (Free Tier) — Recommended

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your **backend** GitHub repo.
3. Settings:
   - **Runtime:** Node (or Docker if you prefer the Dockerfile)
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add Environment Variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=a_long_random_secret
   JWT_EXPIRE=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   PORT=10000
   ```
5. For MongoDB: create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and paste the connection string into `MONGODB_URI`.
6. After deploy, run the seed once (via Render Shell or a one-time script):
   ```
   node src/seed.js
   ```
7. Your backend URL will look like: `https://doctor-tracker-api.onrender.com`

### 2. Frontend → Vercel (Recommended for Next.js)

1. Push the **frontend** folder as its own GitHub repo.
2. Go to [Vercel](https://vercel.com) → New Project → Import the frontend repo.
3. Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy. Your frontend URL will look like: `https://doctor-tracker.vercel.app`

### Important CORS note
Make sure the backend `.env` / Render env has:
```
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```
so CORS allows the live frontend.

---

## Submission Checklist

- [ ] Frontend GitHub repository link
- [ ] Backend GitHub repository link
- [ ] Live frontend website URL (Vercel / Netlify)
- [ ] Live backend API URL (Render)
- [ ] Local environment works (test with `docker compose up` or manual setup before the interview)

---

## API Endpoints Summary

| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| POST   | /api/auth/login                       | Login                          |
| GET    | /api/auth/me                          | Current user                   |
| GET    | /api/doctors                          | List doctors (search/filter/page) |
| POST   | /api/doctors                          | Create doctor                  |
| GET    | /api/doctors/:id                      | Get doctor                     |
| GET    | /api/doctors/:id/patients             | Patients of a doctor           |
| POST   | /api/doctors/:id/patients             | Add patient under doctor       |
| DELETE | /api/doctors/:doctorId/patients/:id   | Remove patient from doctor     |
| GET    | /api/patients                         | List all patients              |
| PUT    | /api/patients/:id                     | Update patient                 |
| DELETE | /api/patients/:id                     | Delete patient                 |
| GET    | /api/dashboard                        | Analytics stats                |
| GET    | /api/health                           | Health check                   |

## Visual Evidence

> After running the app, take screenshots of:
> - Login page (desktop + mobile)
> - Dashboard with charts
> - Doctors list with filters
> - Doctor detail (patients list)
> - Patients page with edit modal
>
> Place them in a `/screenshots` folder and reference them here.

## License

This project was created as a technical assessment submission.
