# Policy Task Tracker Architecture

## System Architecture

Policy Task Tracker is a three-tier application:

- `client/` is a React + Vite frontend written in TypeScript.
- `api/` is an Express + TypeScript REST API built on Mongoose.
- MongoDB stores users, projects, tasks, and related records.

The client talks to the API over `/api` routes. The API handles authentication, validation, business rules, and persistence. The database is accessed only from the API layer.

### Request Flow

1. A user opens the client in the browser.
2. The client sends requests to the API using Axios.
3. The API authenticates the request with JWT middleware where needed.
4. Routes validate input, read or update MongoDB models, and return JSON responses.
5. The client renders the returned data and keeps UI state in sync with the server.

## API Design

The API is organized by resource under `api/src/routes/`:

- `auth.ts` handles register, login, session lookup, and user listing.
- `projects.ts` handles project CRUD.
- `tasks.ts` handles task CRUD and filtering.
- `dashboard.ts` returns aggregate counts and recent records for the dashboard.

### Cross-Cutting Concerns

- Authentication uses JWT bearer tokens.
- `authenticate` middleware protects private routes.
- `validate` middleware wraps `express-validator` rules before handlers run.
- `errorHandler` provides centralized API error responses.

### Route Shape

Most resources follow the same pattern:

- `GET /api/<resource>` for list views, often with pagination or filters.
- `GET /api/<resource>/:id` for detail views.
- `POST /api/<resource>` for creation.
- `PUT /api/<resource>/:id` and `PATCH /api/<resource>/:id` for updates.
- `DELETE /api/<resource>/:id` for removal.

The task list supports server-side `search`, `status`, pagination, and task number lookup. Search matches `taskNumber`, `title`, and `description`.

## Database Models

The application uses three primary Mongoose models.

### User

Location: `api/src/models/User.ts`

Fields:

- `name`
- `email`
- `password`
- `role`
- `createdAt`

Behavior:

- Passwords are hashed before save.
- Passwords are removed from JSON output.
- `comparePassword()` is used during login.

### Project

Location: `api/src/models/Project.ts`

Fields:

- `projectNumber`
- `name`
- `status`
- `projectType`
- `owner`
- `startDate`
- `completionDate`
- `createdAt`
- `updatedAt`

Behavior:

- `projectNumber` is unique.
- `owner` references a `User`.
- `projectType` and `status` are constrained enums.

### Task

Location: `api/src/models/Task.ts`

Fields:

- `taskNumber`
- `title`
- `description`
- `status`
- `assignedTo`
- `project`
- `createdAt`
- `updatedAt`

Behavior:

- `taskNumber` is generated automatically on validation when it is missing.
- `project` references a `Project`.
- `assignedTo` references a `User`.
- `status` is constrained to the same lifecycle values used by projects.

## Docker Configuration

The repository supports a local Docker Compose workflow in [docker-compose.yaml](docker-compose.yaml).

### Services

- `mongo` runs `mongo:7` and exposes `27017`.
- `api` builds from `./api` and exposes `4000` in the container.
- `client` builds from `./client` and serves the web app on port `3000` in the Compose setup.

### Local Compose Notes

- Mongo data is persisted in the `mongo-data` named volume.
- The API container uses `MONGO_URI=mongodb://mongo:27017/project-task-tracker`.
- The client depends on the API service.

### Image Builds

- The API Dockerfile installs dependencies, builds TypeScript into `dist/`, and runs `node dist/server.js`.
- The client Dockerfile installs dependencies, builds the Vite app, and serves the static output with Nginx.

## Deployment Topology

The repo includes Kubernetes manifests under `k8s/` for a cluster-based deployment.

### Kubernetes Layout

- `namespace.yaml` defines the `task-tracker` namespace.
- `mongo.yaml` deploys MongoDB with a persistent volume claim.
- `api.yaml` deploys the API as a replicated workload behind a ClusterIP service.
- `client.yaml` deploys the frontend behind a NodePort service.
- `secrets.yaml` centralizes runtime configuration such as `MONGO_URI`, `JWT_SECRET`, `PORT`, and `NODE_ENV`.

### Runtime Topology

- MongoDB runs as its own stateful storage-backed service.
- The API runs as a horizontally scalable stateless service.
- The client is a static web service exposed through a cluster node port.
- The API is the only component that talks directly to MongoDB.

### Health and Resilience

- The API exposes `/api/health` for readiness and liveness checks in Kubernetes.
- The API deployment uses two replicas in the current manifest.
- MongoDB uses a persistent volume so data survives pod restarts.

## Summary

The architecture is intentionally simple: the client renders the UI, the API owns business logic and persistence, and MongoDB stores the data. Docker Compose is used for local containerized runs, while the Kubernetes manifests describe the deployment topology used for cluster-style hosting.
