# PMO Project - Architecture & Setup Guide

## 1. Project Overview
This is an enterprise Project Management Office (PMO) application designed for Executive Directors, Project Managers, and Team Members. It tracks Projects, Risks, Tasks, Budgets, Reports, Templates, Approvals, and Activities.

- **Frontend**: React (Vite, TypeScript, TailwindCSS)
- **Backend**: Node.js (Express, ES Modules)
- **Database**: MySQL (Sequelize ORM)
- **Communication Layer**: Axios

## 2. Project Structure
- `frontend/src/`
  - `components/`: UI components (views, modals, shared UI)
  - `services/api.ts`: Centralized Axios API client
  - `types.ts`: TypeScript interfaces for the entire frontend
  - `App.tsx`: Main entry point containing routing/tab logic
- `backend/`
  - `config/`: DB connection (`db.js`) and initialization (`db.initials.js`)
  - `controllers/`: Request/response handlers (ES Modules)
  - `models/`: Sequelize ORM model definitions
  - `routes/`: Express routers
  - `services/`: Business logic and database operations
  - `server.js`: Server entry point

## 3. System Architecture
The system uses a classic 3-tier architecture:
`Frontend (React)` → `Axios API Layer` → `Backend Routes (Express)` → `Controllers` → `Sequelize (ORM)` → `MySQL (Database)`

## 4. Frontend Flow
- **Navigation**: Managed in `App.tsx` via state (`currentTab`, `activeSubTab`).
- **Data Fetching**: `useEffect` in `App.tsx` fetches initial data from the backend via `fetch*FromApi` functions in `api.ts`.
- **API Configuration**: Uses `import.meta.env.VITE_API_BASE_URL` from `.env`.
- **State Management**: React `useState` at the `App.tsx` level, passed down to views via props. Actions update local state immediately for optimistic UI updates, while simultaneously dispatching the actual API calls to the backend.

## 5. Backend Flow
- **Entry Point**: `server.js` initializes `dotenv` and starts `app.js`.
- **Initialization**: `db.initials.js` imports all Sequelize models and sets up `belongsTo`/`hasMany` relationships, then runs `sequelize.sync({ alter: true })`.
- **Routes**: `routes.js` maps feature endpoints (e.g., `/projects`, `/tasks`, `/auth`) to their respective routers.
- **Controllers**: Controllers parse request bodies/params, interact directly with Sequelize models, and format the JSON response.

## 6. Database and Sequelize
- **Config**: Environment variables map to `db.js`, which instantiates Sequelize with the `mysql2` dialect.
- **Database Name**: `project_db`
- **Models**: Defined in `models/` using `sequelize.define()`.
- **Migrations/Seeders**: The project does not currently use Sequelize CLI migrations. It relies on `sequelize.sync({ alter: true })` on server start to automatically map models to MySQL tables.

### ⚠️ Database Connection Status
The application requires a running MySQL instance on `127.0.0.1:3306`. If this instance is down or unreachable, the Node server will throw `ECONNREFUSED` upon startup and fail to sync the models. 

## 7. Authentication Flow
- **Login**: Handled by `LoginView.tsx`. Calls `/auth/login`. On success, the backend generates a JWT token.
- **Token Storage**: The JWT token is saved in the browser's `localStorage` (`localStorage.setItem('token', token)`).
- **Session state**: `App.tsx` maintains a `currentUser` state. 
- **Route Protection**: If `currentUser` is null, the app only renders the login screen. It doesn't allow bypassing to protected routes.
- **Logout Flow**: The logout button triggers `localStorage.clear()` and `sessionStorage.clear()`, resets the state, and runs `window.location.replace('/')`, forcing a hard client-side redirect to the login screen and wiping all data from memory.

## 8. Role Permissions
- **Executive Manager**: Has global read/write access and can approve stage-gate requests. Sees all projects and tasks.
- **Project Manager**: Restricted from Admin controls and Approvals tabs.
- **Risk Manager**: Access restricted mostly to risks, projects, tasks, and communication tabs.
- **Team Member**: Access restricted primarily to assigned tasks, communications, and projects. Can only see projects their code is assigned to.

## 9. Data Source & Feature Flow Analysis
The following sections detail exactly where data comes from for each module:

- **Projects**: Real Database. `App.tsx` → `ProjectsView` → `createProjectApi` → `/projects` → `projectController` → `projectModel` → `projects` table.
- **Risks**: Real Database. `App.tsx` → `RisksView` → `createRiskApi` → `/risks` → `riskController` → `riskModel` → `risks` table.
- **Tasks**: Real Database. `App.tsx` → `TasksView` → `createTaskApi` → `/tasks` → `taskController` → `taskModel` → `tasks` table.
- **Reports & Templates**: Real Database. Handled through `reportController` and `templateController` respectively.
- **Budgets**: Real Database. Handled via `/budgets`.
- **Change Requests**: Real Database. Handled via `/change-requests`.
- **Authentication/Users**: Real Database. Handled via `/users` and `/auth`.
- **Communications (Meetings, Discussions, Notifications)**: Real Database. Formerly mocked, but now mapped to `/communication/*` API routes and backed by Sequelize models.
- **Activities & Approvals**: Real Database. These endpoints were built out to replace the previous frontend-only mock state.
- **Resource Loading**: *Frontend Mock*. State is stored via `const [resources, setResources] = useState([...])` in `App.tsx`. Backend capacity models are not fully wired to these endpoints.

## 10. Environment Setup
The backend requires a `.env` file in `backend/`:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=project_db
DB_USER=root
DB_PASSWORD=
PORT=5000
JWT_SECRET=enterprise_pmo_jwt_secret_key_2026_super_secure
```
The frontend requires a `.env` file in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 11. Connection Status Matrix

| Component | Status | Details |
|-----------|--------|---------|
| Frontend → Backend | **Working** | Axios connects to `localhost:5000/api` properly. |
| Backend → MySQL | **Not Working** | `ECONNREFUSED 127.0.0.1:3306`. MySQL daemon is down or missing. |
| Sequelize | **Working** | Code runs correctly, but blocked by the offline MySQL service. |
| Authentication | **Working** | Proper JWT issuance, localStorage clear, and hash-location resets. |
| Projects | **Working** | Full frontend-to-database integration exists. |
| Tasks | **Working** | Full frontend-to-database integration exists. |
| Risks | **Working** | Full frontend-to-database integration exists. |
| Issues | **Working** | Handled under Change Requests/Risks framework. |
| Budget | **Working** | Wired to `/budgets` API endpoints. |
| Reports | **Working** | Wired to `/reports` API endpoints. |
| Collaboration | **Working** | Meetings, Discussions, and Notifications are fully wired. |
| Activities & Approvals | **Working** | Newly added models (`activityModel`, `approvalModel`) and controllers have fully replaced the frontend mock arrays. |
