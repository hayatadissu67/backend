# Complete Technical Architecture & Code Flow Documentation

This document explains the technical architecture, code flow, and technologies used in this PMO application. It is written to help developers understand exactly how everything connects and works together. 

## 1. The Big Picture

The application is built using a modern **Client-Server Architecture**. 

Here is what happens when someone uses the app:

USER
 ↓ (clicks a button on the screen)
FRONTEND (React app handles the click and needs data)
 ↓ (sends an HTTP Request)
AXIOS (Packages the request and sends it over the internet)
 ↓
BACKEND (Express server receives the request)
 ↓
MIDDLEWARE (Checks if the user's ID card/token is valid)
 ↓
CONTROLLER (The brain of the backend, applies business rules)
 ↓
SEQUELIZE (Translates the controller's request into a database question)
 ↓
MYSQL DATABASE (Finds or saves the data)
 ↓
BACKEND RESPONSE (Sends the data back as JSON)
 ↓
FRONTEND (React receives the data and updates the screen)
 ↓
USER SEES RESULT

**Simple Explanation:**
- **The Frontend** is what you see (buttons, forms, charts). It runs in the user's browser.
- **The Backend** is the worker behind the scenes. It checks rules, handles security, and talks to the database.
- **The Database** is the massive filing cabinet where all permanent information is stored.

---

## 2. Technology Stack

This section lists the actual technologies installed and used in the project.

### Frontend
- **React 19**: Builds the user interface using components.
- **TypeScript**: Adds strict typing to JavaScript to prevent errors.
- **Vite**: The build tool that runs the development server and bundles the code.
- **Tailwind CSS**: A utility-first CSS framework used for styling the app beautifully.
- **Axios**: A library used to send API requests to the backend.
- **Lucide React**: Provides the icons used throughout the UI.
- **Framer Motion**: Adds smooth animations (used via `motion`).

*(Note: React Router and React Query are **not** used in this project. Routing is handled manually via URL hashes, and data is fetched manually via Axios and `useEffect`.)*

### Backend
- **Node.js**: The environment that runs the backend JavaScript code.
- **Express**: The framework used to create the web server and API routes.
- **Sequelize**: The ORM (Object-Relational Mapper) that translates JavaScript into SQL.
- **MySQL (via `mysql2`)**: The relational database used to store data.
- **JSON Web Token (JWT)**: Used for creating secure authentication tokens (ID cards) for users.
- **bcryptjs**: Used to securely hash and verify user passwords.
- **dotenv**: Loads secret configuration variables from the `.env` file.
- **cors**: Allows the frontend to communicate with the backend on a different port securely.
- **multer**: Handles file uploads (used for templates/reports/documents).

### Database
- **MySQL Database**: Stores tables with relations.
- **Sequelize ORM**: Connects the backend to the database.
- **Primary Keys**: Every table uses an `id` (some are Integers, like Users, and some use UUIDs, like Projects).
- **Foreign Keys**: Used to link tables (e.g., `userId` in the ProjectTeam table).
- **Join Tables**: `project_team` is used to link many Users to many Projects.

### Development Tools
- **Git / GitHub**: Used for version control.
- **Vite**: Runs the frontend locally.
- **nodemon**: Automatically restarts the backend server when code changes are saved.
- **Environment Variables**: Keeps sensitive data out of the source code.

---

## 3. Folder Structure

Here is how the real code is organized:

```text
project/
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React UI elements and specific views (like ProjectsView, RisksView)
│   │   ├── services/      # Contains api.ts for all Axios API calls to the backend
│   │   ├── types.ts       # TypeScript interfaces (Project, UserItem, RiskItem, etc.)
│   │   ├── App.tsx        # The main frontend file containing state and manual routing logic
│   │   └── main.tsx       # Mounts the React app to the HTML
│   └── package.json       # Lists frontend dependencies (React, Tailwind, Axios)
│
├── backend/
│   ├── app/
│   │   └── app.js         # Configures Express, CORS, JSON parsing, and connects routes
│   ├── config/
│   │   ├── db.js          # Defines the Sequelize connection to MySQL
│   │   └── db.initials.js # Sets up database relationships (Foreign keys, associations)
│   ├── controllers/       # Contains the business logic for features (e.g., riskcontroller.js)
│   ├── middleware/        # Contains authMiddleware.js to protect routes
│   ├── models/            # Defines Sequelize schemas for database tables
│   ├── routes/            # Connects API URLs to Controllers (e.g., /api/projects -> projectController)
│   ├── server.js          # The entry point that starts the Express server listening on a port
│   └── package.json       # Lists backend dependencies (Express, Sequelize, JWT)
```

---

## 4. Frontend Architecture

The frontend starts in the browser and flows like this:

Browser loads `index.html`
 ↓
Vite runs `frontend/src/main.tsx`
 ↓
`App.tsx` loads
 ↓
`App.tsx` checks `window.location.hash` to see what page the user wants (e.g., `#projects`)
 ↓
React renders the correct View Component (e.g., `<ProjectsView />`)
 ↓
The View Component uses `useEffect` to call `frontend/src/services/api.ts`
 ↓
Axios sends an HTTP Request to the Backend

---

## 5. React

- **What React is:** A library for building user interfaces out of reusable pieces called components.
- **Why we use it:** It makes it easy to build complex, interactive web apps efficiently.
- **Components:** Found in `frontend/src/components/`. For example, `<NewProjectModal />` is a reusable popup.
- **State (`useState`):** Remembers things. `const [currentTab, setCurrentTab] = useState('dashboard')` in `App.tsx` remembers which page you are on.
- **Effects (`useEffect`):** Runs code when something happens. Used to fetch data when a component first loads.
- **Conditional Rendering:** Showing things only if rules are met. For example, in `App.tsx`, `if (currentTab === 'projects') return <ProjectsView />`.

---

## 6. Routing (Hash-Based)

This project **does not** use React Router. It uses manual hash-based routing.

**How it works:**
1. The user clicks a sidebar link.
2. The URL changes to something like `http://localhost:3000/#risks`.
3. Inside `frontend/src/App.tsx`, a `useEffect` listens for `hashchange` events:
   ```javascript
   const hash = window.location.hash.replace('#', '');
   setCurrentTab(hash);
   ```
4. `App.tsx` conditionally renders the correct component based on `currentTab`:
   ```javascript
   {currentTab === 'risks' && <RisksView />}
   ```

**Protected Routes:** 
If `currentUser` is null, `App.tsx` forces the `<LoginView />` to render, protecting the rest of the app.

---

## 7. Authentication

The authentication system uses JWT (JSON Web Tokens).

**The Complete Login Flow:**
1. **User enters email/password** on `<LoginView />` (Frontend).
2. **Frontend sends request:** `loginApi()` inside `frontend/src/services/api.ts` sends a POST request to `/api/auth/login`.
3. **Backend receives credentials:** `backend/controllers/authController/authController.js` handles it.
4. **Database checks user:** The controller uses `User.findOne()` to find the email in MySQL.
5. **Password is verified:** `bcrypt.compare()` checks if the typed password matches the hashed password in the DB.
6. **JWT is created:** `jwt.sign()` generates a token containing the user's ID and Role.
7. **JWT is returned:** The backend sends the token and user data back to React as JSON.
8. **Frontend stores token:** React saves the token using `localStorage.setItem('token', ...)`.
9. **Axios Interceptor:** Every future Axios request automatically attaches this token to the `Authorization: Bearer <token>` header.
10. **User is authenticated:** React updates `currentUser` state, skipping the login screen and showing the dashboard.

**What is a JWT?** 
JWT is like a temporary digital ID card. After login, the server gives the browser this ID card. The browser automatically shows it on every future API request so the server knows exactly who is making the request without asking for a password again.

---

## 8. Role-Based Access Control

The app relies heavily on roles to restrict access.

| Role | What they can do |
|---|---|
| **TEAM_MEMBER** | View assigned projects, report risks, complete tasks. Cannot edit projects. |
| **PROJECT_MANAGER** | Create projects, assign team members, solve or escalate risks. |
| **RISK_MANAGER** | Resolve escalated risks. |
| **EXECUTIVE_MANAGER** | Approve or reject new projects. |

**Frontend Protection:**
Components check the user's role before rendering buttons. (e.g., hiding the "Create Project" button for Team Members).

**Backend Protection (The Real Security):**
File: `backend/middleware/authMiddleware.js`
The `authorize(...roles)` middleware stops unauthorized API requests. If a Team Member tries to hit an Executive API route using a tool like Postman, the backend blocks it with a `403 Forbidden` error because their JWT token says they are a `TEAM_MEMBER`.

---

## 9. Axios and API Communication

File: `frontend/src/services/api.ts`

- **Axios Instance:** An Axios client is configured with a base URL (e.g., `http://localhost:5000/api`).
- **Request Interceptor:** Before any request leaves the browser, Axios runs a function to check `localStorage` for the JWT token and attaches it.
- **Example API Call:**
  React page `fetchRisksFromApi()` 
  → Axios `api.get('/risks')` 
  → Express route `router.get('/risks')` 
  → Controller `getAllRisks()` 
  → Sequelize `Risk.findAll()` 
  → MySQL
  → Returns JSON to React.

---

## 10. Data Fetching (No React Query)

*React Query is not used in this project.* 
Instead, data is fetched using standard React Hooks.

**Flow:**
1. User opens a page (e.g., `<RisksView />`).
2. A `useEffect` hook runs on mount.
3. It sets a loading state (`setIsLoading(true)`).
4. It calls a function from `api.ts` (e.g., `fetchRisksFromApi()`).
5. When the data returns, it saves it to a React state (`setRisks(data)`).
6. The component re-renders and displays the data.

---

## 11. Backend Architecture

**Flow:**
HTTP Request (from frontend)
 ↓
Express Server (`server.js`)
 ↓
Middleware (`cors`, `express.json`) (`app/app.js`)
 ↓
API Router (`routes/routes.js`)
 ↓
Auth Middleware (`middleware/authMiddleware.js` - verifies token)
 ↓
Feature Routes (e.g., `routes/projectRoutes/projectRoutes.js`)
 ↓
Controller (`controllers/projectcontroller/projectcontroller.js` - contains logic)
 ↓
Service (`services/...`) (If used to separate database logic)
 ↓
Sequelize Model (`models/projectModel/projectModel.js`)
 ↓
MySQL Database

---

## 12. Express

- **What Express is:** A framework for Node.js that makes it easy to create web APIs.
- **Why we use it:** Without Express, handling HTTP requests, headers, and URLs in raw Node.js is very difficult.
- **Server Startup:** Found in `backend/server.js`. It imports the app, listens on a port (usually 5000), and handles uncaught errors.
- **Middleware:** Found in `backend/app/app.js`. Things like `app.use(express.json())` allow the server to read JSON data sent from React.

---

## 13. Routes

Routes connect URLs to specific Controller functions. 
File: `backend/routes/routes.js` connects major sections. Specific files handle exact endpoints.

| Method | Endpoint | Purpose | Controller Function | Database Models Used |
|---|---|---|---|---|
| POST | `/api/auth/login` | Login | `authController.login` | `User` |
| POST | `/api/projects` | Create a project | `projectcontroller.createProject` | `Project`, `ProjectTeam` |
| PATCH | `/api/projects/:id/approve` | Exec approves project | `projectcontroller.approveProject` | `Project` |
| POST | `/api/risks` | Report a risk | `riskcontroller.createRisk` | `Risk`, `ProjectTeam` |

---

## 14. Controllers

Controllers are the "brains" of the backend. They receive the request, enforce business logic, talk to the database, and send the response.

**Analogy:** 
The Route is the address of the office. The Controller is the employee inside the office who actually handles your paperwork.

**Example File:** `backend/controllers/riskcontroller/riskcontroller.js`
**Function:** `createRisk(req, res)`
- Checks if the user is a `TEAM_MEMBER`.
- Automatically sets the risk status to `REPORTED`.
- Verifies that the Team Member is actually assigned to the project they are reporting a risk for.
- Calls the database to save the risk.
- Returns `res.status(201)` (Created) on success.

---

## 15. Sequelize ORM

- **What ORM means:** Object-Relational Mapping. It lets developers write JavaScript code instead of raw SQL queries (like `SELECT * FROM users`).
- **Why it's used:** It is safer (prevents SQL injection) and much easier to read.
- **Models:** Definitions of database tables. 
  Example: `backend/models/projectModel/projectModel.js` defines fields like `name`, `budget`, `status`.
- **Common commands:**
  - `Model.findOne()`: Finds one record.
  - `Model.findAll()`: Finds all matching records.
  - `Model.create()`: Inserts a new row.
  - `Model.bulkCreate()`: Inserts multiple rows at once (used for assigning team members).

---

## 16. Database Architecture

**Models & Tables:**
- **User:** (`models/authModel/userModel.js`) Stores `email`, `password` (hashed), `role`. Primary key: `id` (Integer).
- **Project:** (`models/projectModel/projectModel.js`) Stores project details. Primary key: `id` (UUIDV4). Important fields: `code`, `owner`, `approvalStatus`.
- **ProjectTeam:** (`models/projectModel/ProjectTeam.js`) This is a **Join Table**. It connects Users to Projects. It holds `userId` and `projectCode`.
- **Risk:** (`models/riskModel/riskModel.js`) Stores risks linked to projects. Fields: `submittedBy`, `owner` (PM), `assignedRiskManager`.

**Relationships Setup (`backend/config/db.initials.js`):**
- `User.belongsToMany(Project, { through: ProjectTeam })`
- `Project.belongsToMany(User, { through: ProjectTeam })`

**Simple Diagram:**
```text
      USER 
       │ 
    (Many-to-Many via ProjectTeam)
       │
       ▼
    PROJECT
       │
    (One-to-Many)
       │
       ▼
     RISK
```

---

## 17. Project Workflow (Code Flow)

1. **PM** creates a project on Frontend (`createProjectApi`).
2. **Backend Controller** (`createProject`) sets `approvalStatus: 'PENDING'`. It saves to the `Project` table.
3. **Executive** sees the project and clicks Approve (`approveProjectApi`).
4. **Backend Controller** (`approveProject`) updates `Project` table: `approvalStatus: 'APPROVED'`, `status: 'ACTIVE'`.
5. **PM** assigns Team Members. 
6. **Backend Controller** (`assignProjectTeam`) uses `ProjectTeam.bulkCreate()` to link the Users to the Project in the database.
7. **Team Member** logs in. The backend queries `ProjectTeam` and returns only the projects assigned to them.

---

## 18. Team Member Assignment

**How it works technically:**
File: `backend/controllers/projectcontroller/projectcontroller.js` (Function: `assignProjectTeam`)
1. Frontend sends a Project ID and an array of User IDs.
2. The Backend verifies the project exists.
3. The Backend destroys any old assignments for that project: `ProjectTeam.destroy({ where: { projectCode: ... } })`.
4. It creates new links in the join table using `ProjectTeam.bulkCreate(assignments)`.

---

## 19. Risk Management Workflow

**1. Team Member (Creates Risk)**
- File: `riskcontroller.js` -> `createRisk`
- Backend automatically sets `submittedBy` to the Team Member's email.
- Backend looks up the Project's PM and sets them as the `owner` of the risk.
- Risk is saved as `REPORTED`.

**2. Project Manager (Solves or Escalates)**
- File: `riskcontroller.js` -> `updateRisk`
- If PM solves it (`status === 'RESOLVED'`), backend records `resolvedBy` as the PM's ID.
- If PM escalates (`status === 'ESCALATED'`), backend clears the solver, sets `escalatedAt` timestamp, finds the `RISK_MANAGER` user in the DB, and sets `assignedRiskManager` to the RM's email.

**3. Risk Manager (Solves)**
- File: `riskcontroller.js` -> `updateRisk`
- RM updates status to `RESOLVED`. Backend records `resolvedBy` as RM's ID.

---

## 20. Why an Unassigned Project Cannot Be Used for a Risk

This is a critical security business rule enforced in the backend.

**Technical Flow:**
File: `backend/controllers/riskcontroller/riskcontroller.js` (Function: `createRisk`)
When a TEAM_MEMBER attempts to create a risk for a `projectRef`, the code executes:
```javascript
const assignment = await ProjectTeam.findOne({
  where: { userId: req.user.id, projectCode: req.body.projectRef }
});
if (!assignment) {
  return res.status(403).json({ success: false, message: "You are not assigned to this project." });
}
```
**Why this matters:** Even if a user manipulates the frontend HTML to send a risk to a different project, the backend directly checks the MySQL `project_team` table. If the relationship does not exist, the database rejects the request with a `403 Forbidden` error.

---

## 21. Executive Approval Workflow

File: `backend/controllers/projectcontroller/projectcontroller.js`
When a PM creates a project, the controller explicitly forces `req.body.approvalStatus = 'PENDING'`.

When an Executive calls `approveProject(req, res)`:
The backend updates the database using `updateProjectService`:
```javascript
approvalStatus: 'APPROVED',
status: 'ACTIVE',
approvedBy: req.user.name
```
If rejected (`rejectProject`), it updates to:
```javascript
approvalStatus: 'REJECTED',
status: 'DELAYED',
rejectionReason: req.body.rejectionReason
```

---

## 22. Environment Variables

`.env` files act like a locked safe for configuration values that should never be hardcoded into the source code (to prevent hackers from reading them on GitHub).

**Important variables used in this project:**
- `DB_HOST`: Where the database lives.
- `DB_USER`: Database username.
- `DB_PASSWORD`: Database password.
- `DB_NAME`: Database name (`project_db`).
- `PORT`: Backend server port (5000).
- `JWT_SECRET`: The secret password used to digitally sign authentication ID cards (tokens).
- `VITE_API_BASE_URL`: Frontend variable pointing to the backend API.

---

## 23. Error Handling

**How errors travel:**
1. **Backend Crash:** If a Sequelize query fails, the Controller catches it in a `try/catch` block.
2. **HTTP Status:** The backend responds with `res.status(500).json({ success: false, message: error.message })`.
3. **Axios Interceptor:** The frontend Axios setup (`api.ts`) detects the `500` status.
4. **React Catch:** The React component's `catch(err)` block runs, showing a UI alert to the user.

**Common HTTP Statuses used in this project:**
- `200 OK`: Request succeeded.
- `201 Created`: Data was successfully inserted into the database.
- `400 Bad Request`: Missing data (e.g., forgot email in login).
- `401 Unauthorized`: Missing or invalid JWT token (not logged in).
- `403 Forbidden`: Logged in, but wrong role (e.g., Team Member trying to approve a project).
- `404 Not Found`: Trying to get a project ID that doesn't exist.
- `500 Internal Server Error`: Backend crashed or database failed.

---

## 24. One Complete Request Explained Like a Story

**Scenario: Team Member clicks "Submit Risk"**

1. **The Button Click:** The user clicks the button. React notices this and collects all the text typed into the `<NewRiskModal />` form.
2. **Axios Package:** React calls `createRiskApi(riskData)` in `api.ts`. Axios packages this data as JSON, takes the JWT token from `localStorage`, tapes it to the package's header (`Authorization: Bearer <token>`), and sends it to `http://localhost:5000/api/risks`.
3. **Express Receives:** The backend Express server gets the package. 
4. **The Guard (Auth Middleware):** `protect` middleware in `authMiddleware.js` stops the package, opens the header, reads the JWT token, and checks the signature using `JWT_SECRET`. It confirms the user is who they say they are.
5. **The Worker (Controller):** The package is handed to `riskcontroller.js`. The worker realizes the user is a `TEAM_MEMBER`. 
6. **The Check:** The worker looks at the database (`ProjectTeam.findOne`) to guarantee this team member is actually allowed to work on this specific project.
7. **The Filing Cabinet (Sequelize/MySQL):** The worker translates the data into a SQL query and tells MySQL to save it. MySQL saves it and hands back the new row's data.
8. **The Reply:** Express packages the new data into a `201 Created` JSON response and sends it back across the internet.
9. **React Updates:** Axios receives the response, hands it back to the React component, which then updates its list of risks and closes the modal on the screen.

---

## 25. Security

**Security mechanisms actively verified in this code:**
- **Password Hashing:** Uses `bcryptjs` in `authController.js`. Plain text passwords are NEVER stored in the database.
- **Token Authorization:** Uses `jsonwebtoken`. 
- **Middleware Protection:** `authMiddleware.js` prevents non-logged in users from accessing APIs.
- **Role Checking:** `authorize(...roles)` in routes ensures users cannot access endpoints meant for other roles.
- **Ownership Validation:** `riskcontroller.js` explicitly verifies that team members are assigned to the project before letting them create risks. It also prevents Team Members from editing risks entirely.
- **SQL Injection Protection:** Because the app uses Sequelize ORM, user input is automatically sanitized before hitting MySQL.
- **CORS:** Controlled via `app.use(cors())` to prevent unauthorized websites from making requests to the API.

---

## 26. Developer Debugging Guide

**If the frontend cannot reach the backend at all:**
- Check if the backend terminal is running (`npm run dev` in backend).
- Check `frontend/src/services/api.ts` to ensure `API_BASE_URL` is correct.
- Check browser console for `Network Error` or `CORS` errors.

**If an API returns 404 Not Found:**
- Check the backend `routes.js`. Is the route exactly the same as what Axios is calling?
- Are you passing the correct `ID` in the URL?

**If an API returns 401 Unauthorized:**
- Check Application tab in browser DevTools. Is `token` in `localStorage`?
- Did the backend JWT expire? Try logging out and back in.

**If an API returns 403 Forbidden:**
- The Auth Middleware blocked you. Check your user's `role` in the database. You are trying to do something your role is not allowed to do.

**If data is missing from the screen:**
- Open browser Network tab. Look at the API response. Is the JSON returning empty `[]`? 
- If yes, the issue is in the backend Controller or the Sequelize query (maybe a missing relationship). 
- If no (data is there but not showing), the issue is in the React component's state or rendering logic.

---

## 27. Important Files Reference

| Layer | File Path | Purpose |
|---|---|---|
| **Frontend State** | `frontend/src/App.tsx` | Main file handling conditional rendering, routing, and UI layout. |
| **Frontend API** | `frontend/src/services/api.ts` | All Axios calls to the backend are centralized here. |
| **Backend Auth** | `backend/controllers/authController/authController.js` | Handles login, password hashing, and JWT creation. |
| **Backend Guard**| `backend/middleware/authMiddleware.js` | Verifies JWT tokens and checks user roles. |
| **Backend Setup**| `backend/config/db.initials.js` | Sets up Sequelize associations and foreign keys. |
| **Project Logic**| `backend/controllers/projectcontroller/projectcontroller.js` | Project creation, approval, and team assignment logic. |
| **Risk Logic**   | `backend/controllers/riskcontroller/riskcontroller.js` | Risk creation, PM escalation, and security checks. |

---

## 28. Technology → Function Mapping

| Technology | What it does in this exact project |
|---|---|
| **React** | Builds the UI views (ProjectsView, RisksView). |
| **Window Hash** | Moves between pages (no React Router installed). |
| **Axios** | Sends HTTP requests to the Express API. |
| **Express** | Creates the backend API routes and handles requests. |
| **Sequelize** | Talks to MySQL using JavaScript instead of SQL. |
| **MySQL** | Stores all permanent application data. |
| **JWT** | Authenticates users securely via tokens. |
| **bcryptjs** | Protects user passwords by hashing them in the DB. |
| **Tailwind CSS** | Styles the buttons, layouts, and text on the frontend. |
| **Vite** | Runs the frontend development server rapidly. |

---

## 29. Simple Glossary

- **Frontend:** The visual part of the app running in the browser.
- **Backend:** The invisible server that processes rules and data.
- **API:** The bridge allowing the frontend to talk to the backend.
- **HTTP POST:** Sending new data to the server (e.g., creating a project).
- **HTTP GET:** Asking the server for data (e.g., getting a list of risks).
- **JSON:** A simple text format for sending data between frontend and backend.
- **ORM (Sequelize):** A tool that translates JavaScript code into database language (SQL).
- **Controller:** The backend code that makes the decisions for a specific feature.
- **Route:** The URL address assigned to a specific Controller function.
- **Middleware:** A checkpoint that inspects a request before it reaches the Controller (used for security).
- **JWT / Token:** A temporary digital ID card that proves who is logged in.
- **Primary Key:** A unique ID for a row in a database table.
- **Foreign Key:** An ID used to link one table to another.
- **State:** React's memory. When State changes, the screen updates automatically.
- **Hook (useEffect):** React code that triggers automatically, often used to fetch data when a page opens.

---

## 30. Final Architecture Diagram

```text
                    USER
                     │ (Clicks button)
                     ▼
              ┌─────────────┐
              │   REACT     │ (App.tsx & Views)
              │  FRONTEND   │ (Tailwind CSS)
              └──────┬──────┘
                     │
                  Axios (JSON over HTTP, with JWT Bearer Token)
                     │
                     ▼
              ┌─────────────┐
              │   EXPRESS   │ (server.js & routes.js)
              │   BACKEND   │ 
              └──────┬──────┘
                     │
         AuthMiddleware (Verifies JWT & Roles)
                     │
                     ▼
              ┌─────────────┐
              │ Controllers │ (Business Logic: riskcontroller, projectcontroller)
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  Sequelize  │ (ORM translating JS to SQL)
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │    MySQL    │ (project_db, Tables: users, projects, risks, project_team)
              │  DATABASE   │
              └─────────────┘
```

---

## 31. If I Remember Only 10 Things

1. **React** is the frontend, and it manages pages manually using the URL hash instead of React Router.
2. **Express** is the backend API that processes data and enforces business rules.
3. **MySQL** stores the data, and **Sequelize** is the ORM connecting the backend code to MySQL.
4. **Axios** is the bridge connecting the frontend to the backend API.
5. **JSON Web Tokens (JWT)** identify logged-in users; the token is stored in the browser and sent with every request.
6. **Middleware (`authMiddleware.js`)** is the absolute security barrier preventing unauthorized users from bypassing the frontend to access APIs.
7. **Controllers** contain the actual business logic (like escalating a risk or approving a project).
8. The **ProjectTeam** database table acts as a bridge, allowing multiple Team Members to be assigned to multiple Projects.
9. **Team Member security is absolute:** The backend checks the `ProjectTeam` database directly to prevent Team Members from creating risks for unassigned projects.
10. **Environment Variables (`.env`)** protect all sensitive configuration data, like database passwords and JWT secrets, from being exposed in the source code.
