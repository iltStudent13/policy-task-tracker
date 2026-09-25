# Policy Task Tracker

A full-stack project management application for tracking policy-related projects, tasks, and team assignments. The app includes authentication, protected routes, project/task management, dashboard reporting, and MongoDB-backed persistence.

## Overview

This repository contains:

- API: Express + TypeScript + MongoDB
- Client: React + Vite + TypeScript
- Local database and deployment configuration via Docker Compose
- Kubernetes manifests for deployment to a cluster

## Tech stack

- Backend: Node.js, Express, TypeScript, Mongoose
- Frontend: React, Vite, TypeScript, Axios
- Database: MongoDB
- Authentication: JWT with bcrypt password hashing
- Containerization: Docker and Docker Compose

## Project structure

- `api/` — backend server, routes, middleware, models, and utility code
- `client/` — frontend application
- `k8s/` — Kubernetes manifests
- `docker-compose.yaml` — local containerized stack for MongoDB, API, and client
- `docker-compose.prod.yaml` — production-style compose configuration

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 18+ or newer
- npm
- MongoDB running locally or Docker installed
- Git

## Local setup

### 1. Install dependencies

From the repository root:

```bash
cd api && npm install
cd ../client && npm install
```

### 2. Start MongoDB

You can either run MongoDB locally or use Docker Compose.

#### Option A: Local MongoDB

Make sure MongoDB is installed and running on the default port:

```bash
mongod
```

Then confirm it is listening on port 27017.

#### Option B: Docker Compose

From the project root:

```bash
docker compose up -d mongo
```

This starts MongoDB in a container with port 27017 exposed.

### 3. Configure environment variables

Create a `.env` file in the `api/` directory if you want to run the backend outside Docker:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/policy-task-tracker
JWT_SECRET=development-secret
```

For Docker Compose, the API container is preconfigured with:

```env
MONGO_URI=mongodb://mongo:27017/project-task-tracker
JWT_SECRET=dev-secret-change-in-production
PORT=4000
```

### 4. Run the API

From `api/`:

```bash
npm run dev
```

The backend will run on:

- http://localhost:3000

Health check endpoint:

- http://localhost:3000/api/health

### 5. Run the frontend

From `client/`:

```bash
npm run dev
```

The Vite dev server runs on:

- http://localhost:5173

The frontend is configured to proxy `/api` requests to the backend at `http://localhost:3000`.

## Docker Compose workflow

To run the full stack with containers:

```bash
docker compose up --build
```

This starts:

- MongoDB on localhost:27017
- API on localhost:4000
- Client on localhost:3000

To stop the stack:

```bash
docker compose down
```

## Seed data

The project includes a database seeding script for demo data.

From `api/`:

```bash
npm run seed:dev
```

This creates sample users, projects, and tasks including login accounts such as:

- admin@example.com
- user1@example.com
- user2@example.com

All seeded users use the password:

```text
Password123!
```

## Main application flows

The app supports:

- User registration and login
- JWT-based auth on protected routes
- Project creation, listing, updating, and deletion
- Task creation, assignment, filtering, and status updates
- Dashboard summaries for issues and work tracking
- Role-based access patterns with admin/user roles

## Main API routes

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/users`

Projects:

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Tasks:

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

Dashboard:

- `GET /api/dashboard`

## Useful commands

Backend:

```bash
cd api
npm install
npm run dev
npm run build
npm run type-check
npm test
```

Frontend:

```bash
cd client
npm install
npm run dev
npm run build
npm run lint
npm run type-check
```

## Production notes

- The project includes Kubernetes manifests under `k8s/` for API, client, MongoDB, and secret configuration.
- Production secrets should never be committed in plain text.
- The `JWT_SECRET` value should be changed before deployment to a real environment.

## Branching and team workflow

- `main` is the production branch.
- Protect `main` so nobody commits directly to it.
- Require pull requests before merging to `main`.
- Require at least 1 approval from another team member before merge.

### Team workflow

1. Create a short-lived branch from `main` for each task or fix.
2. Push commits to that branch as work progresses.
3. Open a pull request back into `main`.
4. Have another team member review and approve the pull request.
5. Merge only after approval and all required checks pass.

## Troubleshooting

If the app does not start correctly:

- verify MongoDB is running and reachable on port 27017
- check that `MONGO_URI` matches your environment
- confirm `JWT_SECRET` is set for the API
- ensure both frontend and backend dependencies are installed with `npm install`
- check logs with `docker compose logs -f` when using containers

## License

This project is currently distributed under the ISC license as defined in the package metadata.
