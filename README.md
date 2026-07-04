# CMS Admin Panel REST API Backend

This is the backend REST API service for the **CMS Admin Panel** built using **Node.js, Express.js, and MongoDB (via Mongoose)**. The application implements secure JWT authentication, client-side role validation (RBAC), Zod body validations, automated database audit logging, and hybrid media asset storage (Cloudinary with local filesystem fallback).

---

## Technical Stack & Features

*   **REST API Layer**: Node.js & Express.js with ES Modules syntax.
*   **Database & ORM**: MongoDB via Mongoose.
*   **Security & RBAC**: Password-salting via `bcryptjs`, token-verification via `jsonwebtoken` (JWT), and authorization route guards.
*   **Input Schema Validation**: **Zod** schema assertions verifying payload parameters, producing detailed validation errors list responses.
*   **Audit Logging**: Mongoose `AuditLog` schema storing administrative action details, utilizing automated TTL index database cleanups (expires logs after 90 days).
*   **Hybrid Media Storage**: Integrates **Cloudinary** with silent local file uploads fallback when cloud credentials are not supplied in `.env`.
*   **Pagination & Filters**: Server-side pagination parameters (`page`, `limit`) and regex-based database search indices.

---

## Directory Layout

```
backend/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   ├── authController.js     # User registration and token generation
│   ├── pageController.js     # Page CRUD actions, pagination, search, and audit logs
│   ├── bannerController.js   # Banner CRUD actions and display order indexing
│   └── mediaController.js    # Multer files processing (Cloudinary vs disk uploads)
├── middleware/
│   ├── authMiddleware.js     # JWT extraction and authorizeRoles middleware
│   ├── errorMiddleware.js    # Global formatting Express error handler
│   └── validationMiddleware.js # Core Zod payload schema validation middleware
├── models/
│   ├── AuditLog.js            # Admin activity schema (TTL 90 days)
│   ├── Banner.js             # Banner display prioritizations schema
│   ├── Media.js              # Media assets details schema (URL, size, publicId)
│   ├── Page.js               # Page templates schema containing SEO metadata
│   └── User.js               # User credentials and access role schema
├── routes/
│   ├── authRoutes.js         # User registration and login paths
│   ├── bannerRoutes.js       # Banner CRUD and prioritizations reorder paths
│   ├── mediaRoutes.js        # File upload multipart interceptor paths
│   └── pageRoutes.js         # Content CRUD paths
├── scratch/
│   └── test_endpoints.js     # Standalone logic and validations unit tests runner
├── utils/
│   └── slugify.js            # URL sanitization helper
├── .env                      # Application environment configurations
├── .env.example              # Blueprint template for environment settings
├── .gitignore                # Source control filters
├── index.js                  # Main server initialization entrypoint
└── package.json              # Server dependencies listing
```

---

## Installation & Configuration

### Prerequisites
Make sure a local instance of **MongoDB** is running on your system (defaulting to `mongodb://localhost:27017/cms_database`).

### Step 1: Install Dependencies
Open a terminal in the `/backend` folder and run:
```bash
npm install
```

### Step 2: Configure Environment Settings
Create a `.env` file inside the `/backend` directory matching the keys shown in `.env.example`:
```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cms_database
JWT_SECRET=your_jwt_secret_token_here

# Cloudinary Integration (Optional)
# If left empty, files are stored locally under /backend/uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Run Instructions

### Start Dev Server
Launch the Express application:
```bash
npm start
```
The server will run on `http://localhost:5000` (or your configured `PORT`).

---

## API Endpoints Index

All API endpoints are prefixed with `/api` and require a `Authorization: Bearer <jwt_token>` header, except for registration and login.

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Registers a new account, returns JWT. |
| **POST** | `/api/auth/login` | Public | Authenticates credentials, returns JWT. |
| **GET** | `/api/pages` | Admin, Editor | Fetch pages/banners. Supports query params: `page`, `limit`, `search`, `type`, `status`. |
| **GET** | `/api/pages/:id` | Admin, Editor | Fetch content details by document ID. |
| **POST** | `/api/pages` | Admin, Editor | Create content. Validates payload via Zod and autogenerates slug. |
| **PUT** | `/api/pages/:id` | Admin, Editor | Update content. Zod validated (Editors trigger "Pending Approval"). |
| **DELETE** | `/api/pages/:id` | **Admin Only** | Deletes page template. Triggers audit logging. |
| **GET** | `/api/banners` | Admin, Editor | Fetch all banners sorted by `displayOrder`. |
| **POST** | `/api/banners` | Admin, Editor | Create promotional banner. |
| **PUT** | `/api/banners/reorder` | Admin, Editor | Reorders banners display priority order in bulk. |
| **GET** | `/api/media` | Admin, Editor | Fetch media items catalog. |
| **POST** | `/api/media/upload` | Admin, Editor | Upload file to server/cloud storage. Intercepts 'file' parameter. |
| **DELETE** | `/api/media/:id` | **Admin Only** | Deletes media asset from storage and removes DB index. |

---

## Automated Logic Tests

Verify the core backend units (password encrypting, token generating, Zod inputs validations, pagination start calculations) without requiring a database connection:
```bash
node scratch/test_endpoints.js
```
