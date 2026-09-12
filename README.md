# LostLink — Smart Campus Lost & Found Management System

> **Find it. Report it. Return it.**
> A full-stack, cloud-deployed web application that solves the real-world campus problem of lost and found belongings.

🌐 **Live Application:** [https://lost-link-ten.vercel.app/](https://lost-link-ten.vercel.app/)
🔗 **Backend API:** [https://lostlink-6ree.onrender.com/api/health](https://lostlink-6ree.onrender.com/api/health)

---

## 📌 Problem Statement

Every semester, thousands of college students lose valuable items across university campuses — laptops, dorm keys, student ID cards, headphones, and wallets. Traditional physical lost & found desks suffer from:
- Fragmented, paper-based logs
- No photo evidence or visual verification
- No structured claim or verification workflow
- No privacy protection between reporter and claimant

**LostLink** modernizes campus asset recovery through a structured, cloud-hosted platform with full CRUD operations, image uploads, verified ownership claims, and an admin moderation console — all deployed across three cloud services.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                           │
│                React.js SPA on Vercel                       │
│         https://lost-link-ten.vercel.app                    │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTPS Requests (Axios + JWT Bearer)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND REST API — Render                      │
│         https://lostlink-6ree.onrender.com                  │
│                                                             │
│  Node.js + Express.js   │  MVC Architecture                 │
│  JWT Authentication     │  express-rate-limit               │
│  Helmet Security        │  CORS Origin Control              │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌─────────────────────────────┐
│   MongoDB Atlas      │   │      Cloudinary CDN          │
│   (Cloud Database)   │   │   (Image Storage & Delivery) │
│                      │   │                              │
│  Collections:        │   │  Folder: lostlink/           │
│  • users             │   │  • lostlink/lost/            │
│  • items             │   │  • lostlink/found/           │
│  • claims            │   │  • lostlink/items/           │
│                      │   │  • lostlink/profiles/        │
│  Cluster: Atlas M0   │   │  Auto-transforms to 1200×1200│
└──────────────────────┘   └─────────────────────────────┘
```

---

## ☁️ Cloud Services Used

| Service | Provider | Purpose |
| :--- | :--- | :--- |
| **Frontend Hosting** | Vercel | Deploys the React/Vite SPA with automatic CI/CD on every push to `main` |
| **Backend Hosting** | Render | Hosts the Node.js/Express REST API server with auto-deploys from GitHub |
| **Cloud Database** | MongoDB Atlas | Manages all structured data (users, items, claims) via Mongoose ODM |
| **Image Storage & CDN** | Cloudinary | Stores item and profile images; delivers them via global CDN with auto-optimization |
| **Source Control** | GitHub | Triggers CI/CD pipelines to both Vercel and Render on every commit |

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js 18 with Vite (SPA)
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS with custom design system
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT Bearer Token interceptors
- **State Management:** React Context API (Auth + Toast)

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js with MVC architecture
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs password hashing
- **File Upload:** Multer (multipart/form-data → buffer → Cloudinary)
- **Security:** Helmet, CORS, express-rate-limit, trust proxy
- **DNS:** Overridden to use Google DNS (8.8.8.8) for reliable MongoDB Atlas SRV resolution

### Database
- **Database:** MongoDB Atlas (Cluster M0 free tier)
- **ODM:** Mongoose with schema validation, compound indexing, and text search
- **Collections:** `users`, `items`, `claims`

### Media
- **Image Upload:** Cloudinary SDK v2
- **Pattern:** FileReader → Base64 preview (instant) → Background upload to Cloudinary CDN → Secure URL stored in MongoDB
- **Fallback:** If Cloudinary is unavailable, Base64 Data URI is stored directly

---

## 📁 Repository Structure

```
LostLink/
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB Atlas connection with DNS override
│   │   └── cloudinary.js            # Cloudinary config + uploadToCloudinary() helper
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, GetMe, UpdateProfile
│   │   ├── itemController.js        # CRUD for lost/found items + auto Cloudinary upload
│   │   ├── claimController.js       # Submit, list, approve/reject claims
│   │   ├── adminController.js       # Admin stats, user/item management
│   │   └── uploadController.js      # Standalone image upload endpoint
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT protect() + adminOnly() guards
│   │   ├── uploadMiddleware.js      # Multer in-memory buffer configuration
│   │   └── errorMiddleware.js       # Centralized error handler (CastError, E11000, ValidationError)
│   ├── models/
│   │   ├── User.js                  # Schema: name, email, password, phone, department, year, role, profileImage
│   │   ├── Item.js                  # Schema: title, description, type, category, location, date, time, image, status, reportedBy
│   │   └── Claim.js                 # Schema: item (ref), claimant (ref), message, status
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── itemRoutes.js            # /api/items/*
│   │   ├── claimRoutes.js           # /api/claims/*
│   │   ├── adminRoutes.js           # /api/admin/*
│   │   ├── uploadRoutes.js          # /api/upload
│   │   └── debugRoutes.js           # /api/debug/cloudinary-status
│   ├── utils/
│   │   └── seed.js                  # Database seeder with demo users, items, claims
│   ├── server.js                    # Express app, middleware chain, route mounting
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation with auth state
│   │   │   ├── ItemCard.jsx         # Browse feed item card
│   │   │   ├── ItemForm.jsx         # Create/edit report form with image upload
│   │   │   ├── ClaimModal.jsx       # Claim submission modal
│   │   │   ├── ConfirmModal.jsx     # Danger action confirmation dialog
│   │   │   ├── LoadingSpinner.jsx   # Loading state component
│   │   │   └── StatCard.jsx         # Admin dashboard metric card
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page with hero and features
│   │   │   ├── Browse.jsx           # Searchable/filterable item marketplace
│   │   │   ├── ItemDetails.jsx      # Full item view with claim workflow
│   │   │   ├── Dashboard.jsx        # Student's personal hub
│   │   │   ├── MyReports.jsx        # Student's submitted item reports
│   │   │   ├── MyClaims.jsx         # Student's submitted claims
│   │   │   ├── Profile.jsx          # Edit profile & avatar upload
│   │   │   ├── ReportItem.jsx       # Report lost/found item form page
│   │   │   ├── Login.jsx            # Login with demo credential buttons
│   │   │   ├── Register.jsx         # Multi-field registration form
│   │   │   ├── AdminDashboard.jsx   # Admin analytics & stats
│   │   │   ├── AdminItems.jsx       # Admin: Manage all items
│   │   │   ├── AdminUsers.jsx       # Admin: Manage all users
│   │   │   └── AdminClaims.jsx      # Admin: Review all claims
│   │   ├── services/
│   │   │   ├── api.js               # Axios base instance (env-aware URL + JWT interceptor)
│   │   │   ├── authService.js       # Auth API calls
│   │   │   ├── itemService.js       # Item CRUD API calls
│   │   │   ├── claimService.js      # Claims API calls
│   │   │   ├── adminService.js      # Admin API calls
│   │   │   └── uploadService.js     # Image upload API call
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # JWT + user state provider
│   │   │   └── ToastContext.jsx     # Global notification system
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx       # Public layout with Navbar
│   │   │   └── DashboardLayout.jsx  # Authenticated layout with sidebar
│   │   ├── App.jsx                  # Router config with protected routes
│   │   └── index.css                # Tailwind + custom CSS
│   ├── public/
│   ├── vercel.json                  # Vercel SPA rewrites + API proxy config
│   ├── vite.config.js               # Vite dev proxy to localhost:5000
│   └── package.json
│
├── vercel.json                      # Root Vercel rewrite rules
├── README.md
└── .gitignore
```

---

## 🗄️ Database Design

### Collections in MongoDB Atlas

#### `users` Collection
```json
{
  "_id": "ObjectId",
  "name": "String (required, max 60)",
  "email": "String (unique, lowercase)",
  "password": "String (bcrypt hashed, select: false)",
  "phone": "String",
  "department": "String",
  "year": "String",
  "role": "String (enum: student | admin)",
  "profileImage": "String (Cloudinary URL)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### `items` Collection
```json
{
  "_id": "ObjectId",
  "title": "String (required, max 100)",
  "description": "String (required, max 1000)",
  "type": "String (enum: lost | found)",
  "category": "String (enum: Electronics | ID Card | Wallet | Keys | Books | Clothing | Accessories | Documents | Other)",
  "location": "String (required, max 120)",
  "date": "String",
  "time": "String",
  "image": "String (Cloudinary CDN URL)",
  "status": "String (enum: active | claimed | resolved)",
  "reportedBy": "ObjectId → users",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

#### `claims` Collection
```json
{
  "_id": "ObjectId",
  "item": "ObjectId → items",
  "claimant": "ObjectId → users",
  "message": "String (required, max 1000 — ownership proof)",
  "status": "String (enum: pending | approved | rejected)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Indexes
- `items`: Text index on `title + description + location` (full-text search), compound index on `type + status + category`, index on `reportedBy`
- `claims`: Compound index on `item + claimant`, index on `claimant`

### Entity Relationships
```
users ──< items (one-to-many, reportedBy)
users ──< claims (one-to-many, claimant)
items ──< claims (one-to-many, item)
```

---

## 📡 REST API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new student/admin account |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/auth/me` | 🔒 JWT | Get currently authenticated user profile |
| `PUT` | `/api/auth/profile` | 🔒 JWT | Update name, phone, department, year, avatar |

### Items — `/api/items`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/items` | Public | List items with search, filter, sort & pagination |
| `GET` | `/api/items/:id` | Public | Get full details of one item |
| `POST` | `/api/items` | 🔒 JWT | Create a new lost or found item report |
| `PUT` | `/api/items/:id` | 🔒 JWT (owner) | Edit an existing item report |
| `DELETE` | `/api/items/:id` | 🔒 JWT (owner/admin) | Delete an item report |
| `PATCH` | `/api/items/:id/status` | 🔒 JWT (owner) | Update status: `active → claimed → resolved` |

**Query Parameters for `GET /api/items`:**
```
?type=lost|found
?category=Electronics|Keys|...
?status=active|claimed|resolved
?search=keyword
?sortBy=createdAt&sortOrder=desc
?page=1&limit=12
```

### Claims — `/api/claims`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/claims` | 🔒 JWT | Submit an ownership claim on an item |
| `GET` | `/api/claims/my` | 🔒 JWT | Get all claims submitted by current user |
| `PUT` | `/api/claims/:id` | 🔒 JWT (reporter) | Approve or reject a claim |

### Image Upload — `/api/upload`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | 🔒 JWT | Upload image → Cloudinary; returns CDN URL |

**Multipart form-data:** field name `image`, optional `folder` or `type` body field for Cloudinary subfolder routing.

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | 🔒 Admin | Total users, items, claims, resolution rate |
| `GET` | `/api/admin/users` | 🔒 Admin | List all registered users |
| `DELETE` | `/api/admin/users/:id` | 🔒 Admin | Delete a user account |
| `GET` | `/api/admin/items` | 🔒 Admin | List all items across the platform |
| `DELETE` | `/api/admin/items/:id` | 🔒 Admin | Delete any item report |
| `GET` | `/api/admin/claims` | 🔒 Admin | List all claims |

### Health & Debug

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Server welcome + endpoint directory |
| `GET` | `/api` | Public | API endpoint index |
| `GET` | `/api/health` | Public | Server health check (status + timestamp) |
| `GET` | `/api/debug/cloudinary-status` | Public | Verify Cloudinary API connectivity |

---

## 🔄 Core Workflows

### Image Upload Flow (Cloudinary)
```
User selects image file
        ↓
FileReader.readAsDataURL() — instant base64 preview in UI
        ↓
POST /api/upload (multipart file → Multer buffer)
        ↓
Buffer → Base64 Data URI → cloudinary.uploader.upload()
        ↓
Cloudinary processes, resizes (max 1200×1200), optimizes
        ↓
Secure CDN URL returned → stored in MongoDB items.image
```

### Claims Verification Workflow
```
User A reports found item → POST /api/items (status: active)
        ↓
User B (lost owner) browses → finds item in feed
        ↓
User B submits claim with proof → POST /api/claims
        ↓
User A (reporter) reviews claim in Dashboard
        ↓
User A approves → PUT /api/claims/:id { status: "approved" }
        ↓
Item status updates to "claimed" → Contact details shared
        ↓
Physical item returned → User A marks → status: "resolved"
```

### Authentication Flow (JWT)
```
POST /api/auth/register or /api/auth/login
        ↓
Server validates credentials → signs JWT (30 day expiry)
        ↓
Token stored in localStorage (lostlink_token)
        ↓
All subsequent requests include Authorization: Bearer <token>
        ↓
authMiddleware.js verifies token → attaches user to req.user
        ↓
On 401 response → localStorage cleared → redirect to /login
```

---

## 🚀 Deployment — How It Is Deployed

### Frontend → Vercel
- The React/Vite frontend is deployed on **Vercel** with automatic CI/CD.
- Every push to the `main` branch on GitHub triggers an automatic build and deploy.
- **Build command:** `npm run build` (Vite compiles to `dist/`)
- **Output directory:** `frontend/dist`
- **Environment variable set in Vercel dashboard:**
  ```
  VITE_API_URL = https://lostlink-6ree.onrender.com/api
  ```
- `frontend/vercel.json` handles SPA routing (all routes → `index.html`) and API proxy.

### Backend → Render
- The Node.js/Express server is deployed on **Render** as a Web Service.
- Auto-deploys on every push to `main` from GitHub.
- **Start command:** `node server.js`
- **Environment variables set in Render dashboard:**
  ```
  NODE_ENV = production
  PORT = 10000
  MONGODB_URI = mongodb+srv://...@cluster0.zaz1fdw.mongodb.net/...
  JWT_SECRET = <secret>
  CLOUDINARY_URL = cloudinary://<api_key>:<api_secret>@v6e9uxyo
  CLIENT_URL = https://lost-link-ten.vercel.app
  ```
- Render free tier: server spins down after 15 min of inactivity (first request may be slow).

### Database → MongoDB Atlas
- A free-tier **M0 cluster** is provisioned on MongoDB Atlas.
- IP whitelist is set to `0.0.0.0/0` to allow connections from Render (dynamic IP).
- The backend overrides Node.js DNS to use `8.8.8.8` (Google DNS) to reliably resolve MongoDB Atlas SRV records on all hosting platforms.
- Connection string is injected via `MONGODB_URI` environment variable — never committed to source code.

### Images → Cloudinary
- Cloudinary account with cloud name `v6e9uxyo`.
- Images are uploaded to the `lostlink/` folder, organized by subfolder (`lost/`, `found/`, `items/`, `profiles/`).
- All uploaded images are auto-transformed: max `1200×1200`, quality `auto`.
- Delivered via Cloudinary's global CDN using `res.cloudinary.com` secure URLs.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `AdminPassword123!` | Full admin console, analytics, user management |
| **Student** | `alex.rivera@campus.edu` | `StudentPassword123!` | Create reports, submit and manage claims |

---

## ✅ CRUD Operations Demonstrated

| Operation | Entity | Endpoint |
| :--- | :--- | :--- |
| **Create** | User (Register) | `POST /api/auth/register` |
| **Read** | User Profile | `GET /api/auth/me` |
| **Update** | User Profile | `PUT /api/auth/profile` |
| — | — | — |
| **Create** | Item Report | `POST /api/items` |
| **Read** | Item List + Detail | `GET /api/items`, `GET /api/items/:id` |
| **Update** | Item Report + Status | `PUT /api/items/:id`, `PATCH /api/items/:id/status` |
| **Delete** | Item Report | `DELETE /api/items/:id` |
| — | — | — |
| **Create** | Claim | `POST /api/claims` |
| **Read** | My Claims | `GET /api/claims/my` |
| **Update** | Claim Status (approve/reject) | `PUT /api/claims/:id` |
| — | — | — |
| **Create** | Upload Image | `POST /api/upload` |

---

## 🔒 Security Implementation

- **JWT Authentication:** All private routes protected by `protect()` middleware; tokens signed with a secret key and expire in 30 days.
- **Password Hashing:** bcryptjs with salt rounds (10) — passwords never stored in plaintext.
- **Role-Based Access:** `adminOnly()` middleware guards all `/api/admin/*` routes.
- **Rate Limiting:** `express-rate-limit` on `/api/auth/*` — 300 max attempts per 15 minutes.
- **Helmet:** Security HTTP headers including XSS protection, content type sniffing prevention.
- **CORS:** Configured to only allow requests from the deployed Vercel frontend and localhost origins.
- **Environment Variables:** All secrets (`JWT_SECRET`, `MONGODB_URI`, `CLOUDINARY_*`) stored in platform environment dashboards — never committed to Git.

---

## 📄 License
MIT License — Built for university campus communities.
