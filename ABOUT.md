# CMS Core Admin Panel — Full-Stack MERN Workspace

Welcome to the **CMS Core Admin Panel** workspace. This repository contains a production-ready, highly optimized Content Management System built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and styled with **Tailwind CSS**.

---

## 1. Full-Stack Architecture

The project is structured as a clean, modular monorepo dividing concerns between the user client and API services:

```
CMS/
├── frontend/           # React.js Client Workspace
└── backend/            # Node.js & Express.js REST API Server
```

### Frontend Client (`/frontend`)
*   **Framework**: React.js configured via Vite.
*   **Styling**: Tailwind CSS v4 featuring premium glassmorphism styles and transitions.
*   **Routing**: React Router with protected paths using custom `ProtectedRoute` components.
*   **State Management**: Context-based global hooks (`useAuth` for RBAC checks, `useNotification` for toast alerts).
*   **Key Optimizations**:
    *   **Debounced Search**: Delayed API trigger hook (`useDebounce`) to optimize server bandwidth during typing.
    *   **30s Autosaving Drafts**: Interval auto-save listener (`useAutosave`) writing editor states to local storage backups.
    *   **SVG Dashboards**: Responsive SVG charts representing publications frequency, media bandwidth consumption, and log splits.

### Backend API Server (`/backend`)
*   **Server Framework**: Express.js with Node.js using modern ES Modules.
*   **ORM Database**: MongoDB via Mongoose Schemas.
*   **Security & Auth**: Password encryption via `bcryptjs` and request validation via `jsonwebtoken` (JWT).
*   **Input Sanitation**: **Zod** schema validations matching payloads before controllers execute.
*   **Activity Auditing**: Automatic database logging hooks writing critical CRUD operations to the `AuditLog` collection. Includes a 90-day Mongoose TTL expiration index.
*   **Hybrid Storage**: Multer storage parser uploading directly to **Cloudinary** if keys are present; falls back silently to local directory uploads.

---

## 2. Directory Layout Sitemap

```
CMS/
├── frontend/                 # React frontend application
│   ├── public/               # Static icons and branding assets
│   ├── src/                  # React source files
│   │   ├── components/       # Visual elements
│   │   │   ├── auth/         # Protected routes and role guards
│   │   │   ├── common/       # Custom buttons, badges, modals, sidebars, navbars
│   │   │   ├── content/      # Editor inputs and columns
│   │   │   └── media/        # Asset grids and drag-and-drop zones
│   │   ├── context/          # Context states (Authentication, Toast notifications)
│   │   ├── hooks/            # Custom hooks (useAuth, useAutosave, useDebounce)
│   │   ├── pages/            # View pages mapped to routes
│   │   ├── services/         # Client-side API mock fetch services
│   │   ├── App.jsx           # Routes wiring and layout shell
│   │   ├── index.css         # Tailwind compiler and custom scrollbars
│   │   └── main.jsx          # Entry point mounting context providers
│   ├── index.html            # Core HTML template with SEO meta tags
│   └── package.json          # Frontend build scripts
│
└── backend/                  # Node/Express API server
    ├── config/               # MongoDB Mongoose configurations
    ├── controllers/          # Business logic handlers (Auth, Pages, Banners, Media)
    ├── middleware/           # Express hooks (Authentication JWT, Zod validations, error loggers)
    ├── models/               # MongoDB collection schemas (User, Page, Banner, Media, AuditLog)
    ├── routes/               # API routes mappings
    ├── scratch/              # Standalone unit tests execution scripts
    ├── utils/                # Sanitation utilities (slugify converter)
    ├── .env.example          # Blueprint template for environment settings
    └── README.md             # Backend setup & API documentation guide
```

---

## 3. Getting Started

### Step 1: Clone and Configure Environment Settings
Create a `.env` file inside the `/backend` folder matching the variables in `backend/.env.example`.

### Step 2: Launch the API Server
Ensure a local MongoDB server is active.
```bash
cd backend
npm install
npm start
```
The server starts listening on `http://localhost:5000`.

### Step 3: Launch the React Client
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser to interact with the dashboard.

---

## 4. Role-Based Access Control (RBAC) Simulation

To facilitate fast, zero-password interface testing, we have pre-seeded two user credentials. You can swap identities instantly using the profile dropdown in the top-right corner of the navigation bar:

1.  **Jane Doe (Admin)**: Has full access. Can view the "User Management" page, upload/delete images, edit pages, and publish items instantly.
2.  **Alex Rivera (Editor)**: Restricted access.
    *   Cannot access the "User Management" page (redirects to a 403 screen).
    *   Cannot delete pages or media files (delete buttons are replaced by locks or disabled).
    *   Cannot directly publish content (the publish switch automatically requests approval, flagging items as "Pending Approval" in the database).
