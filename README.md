# SmartSeason — Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season. Built as a technical assessment for Shamba Records.

---
## Deployment
Frontend: Hosted on Vercel ([[Link](https://smartseason-eight.vercel.app)])

Backend: Hosted on Render ([Link](https://smartseason-acq9.onrender.com))

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Node.js + Express |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt |
| Frontend | React + Vite |
| HTTP | Axios |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (or any PostgreSQL instance)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd smartseason
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_long_random_secret
```

Set up the database tables by running the SQL in `backend/schema.sql` against your Supabase instance (SQL editor in the Supabase dashboard works fine).

Seed demo data:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

API runs on `http://localhost:5000`

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | alice@smartseason.com | admin123 |
| Agent | bob@smartseason.com | agent123 |


---

## Database Setup

This project uses Supabase (PostgreSQL) for data storage.

1. Create a new project on [Supabase](https://supabase.com)
2. Navigate to the **SQL Editor** in your Supabase dashboard
3. Paste and run the following SQL to set up the tables, custom types, and triggers:

```sql
-- 1. Custom types
CREATE TYPE user_role AS ENUM ('admin', 'agent');
CREATE TYPE field_stage AS ENUM ('Planted', 'Growing', 'Ready', 'Harvested');

-- 2. Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'agent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fields
CREATE TABLE fields (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  planting_date DATE NOT NULL,
  stage field_stage NOT NULL DEFAULT 'Planted',
  assigned_agent_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_by INT NOT NULL REFERENCES users(id),
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Field updates (audit log)
CREATE TABLE field_updates (
  id SERIAL PRIMARY KEY,
  field_id INT NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  agent_id INT NOT NULL REFERENCES users(id),
  stage field_stage NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Trigger to keep last_updated_at current on fields
CREATE OR REPLACE FUNCTION update_last_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fields_last_updated
  BEFORE UPDATE ON fields
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated_at();
```

4. Copy your **connection string** from Supabase → Settings → Database → Connection string (URI mode) and paste it as `DATABASE_URL` in your `backend/.env`

---

## Database Schema & Logic

The system uses a relational PostgreSQL schema with three core tables:

- `users` — stores authentication details and roles (`admin` vs `agent`). Roles are enforced as a PostgreSQL ENUM so invalid values are rejected at the database level.
- `fields` — core field data including crop type, planting date, and the current stage. `last_updated_at` is automatically maintained by a database trigger on every update — this is what the "At Risk" status logic reads from.
- `field_updates` — an append-only audit log of every stage change made by agents, including the note left at the time. The `fields` table holds current state; this table holds the full history.

---

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
```

### Fields
```
GET  /api/fields/dashboard     → summary + fields (role-aware)
GET  /api/fields               → all fields (admin only)
GET  /api/fields/mine          → assigned fields (agent only)
GET  /api/fields/agents        → list of agents (admin only)
POST /api/fields               → create field (admin only)
PUT  /api/fields/:id           → update field (admin only)
```

### Updates
```
POST /api/updates              → post a field update (agent)
GET  /api/updates/:field_id    → get update history for a field
```

All routes except `/api/auth/*` require a `Authorization: Bearer <token>` header.

---
## Use of AI 
I used an AI tool to help brainstorm standard, clean UI patterns to ensure a good user experience, but all the architectural decisions, component structuring, and logic implementation are my own.

## Design Decisions

### Field status logic

Each field has a computed status derived from two data points its current stage and when it was last updated:

```
Completed → stage is 'Harvested'
At Risk   → stage is not 'Harvested' AND no update in the last 7 days
Active    → everything else
```

Status is computed at query time in a pure function (`computeStatus`) rather than stored in the database. This keeps the DB as a source of truth for raw data only, and means status always reflects reality without needing triggers or scheduled jobs. The 7-day threshold is a reasonable default for a crop monitoring system a field with no activity for a week warrants attention.

The same function is duplicated in both the backend (for API responses) and the frontend (for the detail page) to avoid an extra network round trip. In a production system this logic would live in a shared package.

### Role separation

Two roles with distinct access patterns:

- **Admin** can create fields, assign agents, view all fields across all agents, and monitor updates. They cannot post field updates themselves.
- **Agent** can only see fields assigned to them, post stage updates and notes. They cannot create fields or see other agents' work.
Access control is enforced at the API layer. For example, when fetching a field by ID, the backend verifies that either the user is an admin or the field is assigned to them. This prevents unauthorized access even if a user attempts to call the API directly.
Role is embedded in the JWT payload so every request carries its own permission context no extra DB lookup needed per request.

### Audit log vs current state

Field updates are stored in a separate `field_updates` table rather than just overwriting the field record. This gives a full audit trail who changed what, when, and what note they left. The `fields` table holds current state; `field_updates` holds history. These are separate concerns and kept separate.

### Dashboard is role-aware at the API level

A single `/api/fields/dashboard` endpoint serves both roles. The controller checks `req.user.role` and queries accordingly admins get all fields, agents get their assigned fields. Same endpoint, same response shape, different data. This keeps the frontend simple — both dashboards hit the same URL.

---

### Validation & Error Handling

Basic validation is applied at the API layer (e.g., required fields, valid stages). 
Unauthorized access attempts return appropriate HTTP status codes (403/401). 
Errors are handled consistently to provide predictable API responses.


## Assumptions Made

- Agents are created by the system administrator (via the `/register` endpoint or seed script) there is no self-signup flow.
- A field can only be assigned to one agent at a time.
- Admins can view field detail and update history but do not post field updates themselves that is the agent's responsibility.
- The 7-day "At Risk" threshold is a sensible default for the Kenyan growing season context but could be made configurable per crop type in a future iteration.
- Stage progression is not strictly enforced an agent can set any stage on any update. This was a deliberate choice to keep the system flexible (a field might need to be corrected, or stages might not always progress linearly in practice).

---

The backend follows a layered structure:
- controllers handle request/response
- routes define API structure
- middleware handles cross-cutting concerns like auth

This keeps concerns separated and makes the codebase easier to extend.


## Project Structure

```
smartseason/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── fieldsController.js
│   │   │   └── updatesController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── fields.js
│   │   │   └── updates.js
│   │   ├── app.js
│   │   ├── db.js
│   │   └── seed.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── FieldCard.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── StatusBadge.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AgentDashboard.jsx
    │   │   ├── FieldDetail.jsx
    │   │   └── Login.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```
