# PMO Project - Architecture & Setup Guide

## 1. Project Overview
This is an enterprise Project Management Office (PMO) application designed for Executive Directors, Project Managers, and Team Members. It tracks Projects, Risks, Tasks, Budgets, Reports, Templates, and Approvals.

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

## 3. Architecture
The system uses a classic 3-tier architecture:
`Frontend (React)` → `Axios API Layer` → `Backend Routes (Express)` → `Controllers` → `Services (Business Logic)` → `Sequelize (ORM)` → `MySQL (Database)`

## 4. Frontend Flow
- **Navigation**: Managed in `App.tsx` via state (`currentTab`, `activeSubTab`).
- **Data Fetching**: `useEffect` in `App.tsx` fetches initial data from the backend via `fetch*FromApi` functions in `api.ts`.
- **API Configuration**: Uses `import.meta.env.VITE_API_BASE_URL` from `.env`.
- **State Management**: React `useState` at the `App.tsx` level, passed down to views via props. Actions like creating a task update the local state immediately for optimistic UI updates, while dispatching the API call in the background.

## 5. Backend Flow
- **Entry Point**: `server.js` initializes `dotenv` and starts `app.js`.
- **Initialization**: `db.initials.js` imports all Sequelize models and sets up `belongsTo`/`hasMany` relationships, then runs `sequelize.sync({ alter: true })`.
- **Routes**: `routes.js` maps feature endpoints (e.g., `/projects`, `/tasks`, `/auth`) to their respective routers.
- **Controllers & Services**: Controllers parse request bodies/params, pass data to services, and format the JSON response. Services interact directly with Sequelize models or repositories.

## 6. Database and Sequelize
- **Config**: Environment variables map to `db.js`, which instantiates Sequelize with the `mysql2` dialect.
- **Models**: Defined in `models/` using `sequelize.define()`.
- **Relationships**: Aggregated and defined globally inside `db.initials.js` (e.g., `Template.hasMany(TemplateVersion)`).
- **Migrations/Seeders**: The project does not currently use Sequelize CLI migrations. It relies on `sequelize.sync({ alter: true })` on server start to automatically map models to MySQL tables.

## 7. Feature-by-Feature Flow
- **Projects**: `App.tsx` → `ProjectsView` → `createProjectApi` → `/projects` → `projectController` → `projectService` → `projectModel` → `projects` table.
- **Risks**: `App.tsx` → `RisksView` → `createRiskApi` → `/risks` → `riskController` → `riskService` → `riskModel` → `risks` table.
- **Tasks**: `App.tsx` → `TasksView` → `createTaskApi` → `/tasks` → `taskController` → `taskService` → `taskRepository` → `taskModel` → `tasks` table.
- **Reports**: `App.tsx` → `ReportsView` → `createReportApi` → `/reports` → `reportController` → `reportModel` → `reports` table.
- **Templates**: `App.tsx` → `TemplatesView` → `createTemplateApi` → `/templates` → `templateController` → `templateModel` → `templates` table.
- **Authentication**: `authRouts.js` → `/auth/login` → `authController.js` → JWT token generation. (Frontend UI currently uses mocked personas).

## 8. Environment Setup
The backend requires a `.env` file in `backend/`:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=project_db
DB_USER=your_db_user
DB_PASSWORD=your_mysql_password
PORT=5000
JWT_SECRET=your_jwt_secret
```
The frontend requires a `.env` file in `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 9. How to Run the Project
1. **Database**: Start MySQL (e.g., via XAMPP) and create the `project_db` database.
2. **Backend**:
   - `cd backend`
   - `npm install`
   - Create `.env` using the template above.
   - `npm run dev` (This will automatically sync Sequelize models to MySQL).
3. **Frontend**:
   - `cd frontend`
   - `npm install`
   - Create `.env` using the template above.
   - `npm run dev`

## 10. API and Integration Notes
- **Base URL**: `/api` (Backend running on port 5000 by default).
- **Response Format**: All successful responses return `{ success: true, data: [...] }`.
- **CORS**: Configured in `app.js` to allow `http://localhost:5173`.
- **Module System**: The backend heavily relies on ES Modules (`type: "module"`). Avoid using `require()`.

## 11. Known Issues & Missing Functionality
The following frontend features exist only as mocked UI elements and **do not** currently have backend models or routes:
- **Meetings**: Mocked local state in `MeetingsView`.
- **Discussions / Chat**: Mocked local state in `CommunicationView`.
- **Notifications & Activity Feed**: Generated dynamically in frontend state, but not persisted to a database.
- **Approvals (Stage-Gate)**: Mocked local state in `ApprovalsView`.
- **Resource Loading**: Models exist but no endpoints or capacity calculation logic is implemented.
