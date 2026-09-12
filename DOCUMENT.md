# BACE344 — Cloud Infrastructure and Architecture
## Digital Assignment — Technical Documentation

| | |
|:---|:---|
| **Course** | BACE344 — Cloud Infrastructure and Architecture |
| **Slot** | C1 |
| **Faculty** | Dr. P. Anandan |
| **Application Name** | LostLink — Smart Campus Lost & Found Management System |
| **Live Application URL** | https://lost-link-ten.vercel.app |
| **Source Code (GitHub)** | https://github.com/omaw1928-gh/LostLink |
| **Backend API URL** | https://lostlink-6ree.onrender.com |

---

## Table of Contents

1. [Problem Selection & System Architecture](#1-problem-selection--system-architecture)
2. [Application Development](#2-application-development)
3. [Database & REST API Integration](#3-database--rest-api-integration)
4. [Cloud Deployment & Integration](#4-cloud-deployment--integration)
5. [Documentation & Demonstration](#5-documentation--demonstration)

---

## 1. Problem Selection & System Architecture

### 1.1 Problem Statement

Every semester, hundreds of students across university campuses lose valuable belongings — laptops, student ID cards, dorm keys, wallets, and headphones. The current process for recovering lost items is fragmented:

- Physical notice boards become outdated and are rarely checked.
- There is no photo-based verification of lost items.
- No structured ownership claim or verification process exists.
- Contact information is exposed publicly, creating privacy concerns.

**LostLink** solves this by providing a centralized, cloud-hosted digital platform where students can report lost and found items, submit verified ownership claims, and coordinate item returns — entirely online.

---

### 1.2 System Architecture

LostLink follows a **three-tier cloud architecture** — Presentation Tier (Frontend), Logic Tier (Backend API), and Data Tier (Database + Media Storage) — deployed across four separate cloud services.

```
+-----------------------------------------------------------------------------+
|                         TIER 1: PRESENTATION                                |
|                                                                             |
|                  React.js Single Page Application                           |
|                  Hosted on: Vercel (CDN Edge Network)                       |
|                  URL: https://lost-link-ten.vercel.app                      |
+-----------------------------------+-----------------------------------------+
                                    |
                    HTTPS (Axios + JWT Bearer Token)
                                    |
                                    v
+-----------------------------------------------------------------------------+
|                         TIER 2: APPLICATION LOGIC                           |
|                                                                             |
|             Node.js + Express.js RESTful API Server                         |
|             Architecture Pattern: MVC (Model-View-Controller)               |
|             Hosted on: Render Web Service                                   |
|             URL: https://lostlink-6ree.onrender.com                         |
|                                                                             |
|  +-------------+  +-------------+  +-------------+  +-----------------+    |
|  |  /api/auth  |  | /api/items  |  | /api/claims |  |   /api/admin    |    |
|  |   (Auth)    |  |   (CRUD)    |  | (Workflow)  |  |  (Moderation)   |    |
|  +-------------+  +-------------+  +-------------+  +-----------------+    |
|                                                                             |
|  Middleware: Helmet > CORS > Rate Limiter > JWT Auth > Controllers          |
+------------+--------------------------------------------------+-------------+
             |                                                  |
             v                                                  v
+---------------------------+                   +---------------------------+
|      TIER 3A: DATA        |                   |      TIER 3B: MEDIA       |
|                           |                   |                           |
|      MongoDB Atlas        |                   |      Cloudinary CDN       |
|   (Cloud NoSQL Database)  |                   | (Image Storage & CDN)     |
|                           |                   |                           |
|  Collections:             |                   |  Folder: lostlink/        |
|  - users                  |                   |  Auto-resize: 1200x1200   |
|  - items                  |                   |  Format: auto (WebP)      |
|  - claims                 |                   |  Quality: auto            |
|                           |                   |                           |
|  Cluster: Atlas M0 Free   |                   |  Cloud Name: v6e9uxyo     |
+---------------------------+                   +---------------------------+

  CI/CD: GitHub -> auto-deploys to Vercel and Render on every push to main
```

### 1.3 Cloud Services Summary

| Cloud Service | Provider | Role |
|:---|:---|:---|
| Frontend Hosting | **Vercel** | Deploys and serves the React SPA via global CDN edge nodes |
| Backend Hosting | **Render** | Runs the Node.js Express API as a Web Service with auto-deploy |
| Database | **MongoDB Atlas** | Managed cloud NoSQL database cluster (M0 free tier) |
| Media Storage | **Cloudinary** | Stores, transforms, and delivers item/profile images via CDN |
| Version Control & CI/CD | **GitHub** | Source of truth; triggers Vercel + Render deploy pipelines |

---

## 2. Application Development

### 2.1 Features Implemented

| Feature | Description |
|:---|:---|
| **User Registration & Login** | Multi-field registration with name, email, password, phone, department, and academic year |
| **JWT Authentication** | Stateless auth using JSON Web Tokens with 30-day expiry |
| **Report Lost Item** | Students submit lost item reports with title, category, location, date, description, and image |
| **Report Found Item** | Students submit found item reports with full details |
| **Browse & Search** | Filterable marketplace by type, category, status, and keyword full-text search |
| **Item Detail View** | Full item page with reporter card, status badge, and ownership claim button |
| **Claim Workflow** | Claimants submit a proof message; reporters can approve or reject |
| **Student Dashboard** | Personal hub showing the student's own reports and claims |
| **Profile Management** | Edit name, phone, department, year, and upload profile picture |
| **Admin Console** | System analytics, user management, global item moderation |
| **Image Upload** | Instant preview via FileReader + background upload to Cloudinary |
| **One-Click Demo Login** | Login page has autofill buttons for demo student and admin accounts |

---

### 2.2 Frontend Architecture

The frontend is a **React.js 18** Single Page Application (SPA) built with **Vite**.

**Key Libraries:**
- `react-router-dom v6` — Client-side routing with protected routes
- `axios` — HTTP client with JWT Bearer Token interceptor
- `tailwindcss` — Utility-first CSS for styling
- `lucide-react` — Icon library

**State Management via React Context API:**
- `AuthContext` — Stores the logged-in user object and JWT token (persisted in `localStorage`)
- `ToastContext` — Global notification system for success/error alerts

**Folder Structure:**
```
frontend/src/
├── components/     <- Reusable UI (Navbar, ItemCard, ItemForm, ClaimModal...)
├── pages/          <- Route-level components (Home, Browse, Dashboard, Admin...)
├── layouts/        <- MainLayout (public) and DashboardLayout (authenticated)
├── services/       <- Axios API service modules (authService, itemService...)
├── context/        <- AuthContext, ToastContext providers
├── App.jsx         <- Route definitions and protected route guards
└── index.css       <- Tailwind + custom global styles
```

**Protected Route Guard Pattern:**
```jsx
// Routes wrapped with <PrivateRoute> require a valid JWT in AuthContext
// Routes wrapped with <AdminRoute> additionally require user.role === 'admin'
<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
```

---

### 2.3 Backend Architecture

The backend is a **Node.js + Express.js** REST API following the **MVC (Model-View-Controller)** pattern.

**Middleware Chain (in order):**
```
Incoming Request
    -> Helmet (security headers)
    -> CORS (origin validation)
    -> express.json / express.urlencoded (body parsing, 10mb limit)
    -> Rate Limiter (auth routes only — 300 req / 15 min)
    -> Route Handler
        -> authMiddleware.protect() (JWT verification)
        -> Controller Function
            -> Mongoose (database operations)
            -> Cloudinary SDK (media upload)
        -> JSON Response
    -> errorMiddleware (centralized error handler)
```

**Folder Structure:**
```
backend/
├── config/        <- db.js (MongoDB Atlas connection), cloudinary.js (SDK config + upload helper)
├── controllers/   <- authController, itemController, claimController, adminController, uploadController
├── middleware/    <- authMiddleware (protect/adminOnly), uploadMiddleware (Multer), errorMiddleware
├── models/        <- User.js, Item.js, Claim.js (Mongoose schemas with validation)
├── routes/        <- authRoutes, itemRoutes, claimRoutes, adminRoutes, uploadRoutes
├── utils/         <- seed.js (database seeder with demo data)
└── server.js      <- App entry point, middleware chain, route mounting
```

---

### 2.4 Security Implementation

| Security Measure | Library / Technique | Purpose |
|:---|:---|:---|
| Password Hashing | bcryptjs (salt rounds: 10) | Passwords are never stored in plaintext |
| JWT Token Auth | jsonwebtoken (30-day expiry) | Stateless, cryptographically signed auth tokens |
| HTTP Security Headers | helmet.js | Prevents XSS, clickjacking, MIME sniffing attacks |
| Rate Limiting | express-rate-limit (300 req / 15 min) | Brute-force protection on auth endpoints |
| CORS Origin Control | cors npm package | Only allows requests from approved frontend origins |
| Role-Based Access Control | Custom adminOnly() middleware | Restricts `/api/admin/*` to users with `role: "admin"` |
| Environment Variables | Platform environment dashboards | All secrets kept out of source code and Git history |
| Reverse Proxy Trust | `app.set('trust proxy', 1)` | Correct client IP detection behind Render's proxy |

---

## 3. Database & REST API Integration

### 3.1 Database Design (MongoDB Atlas)

The database uses **three Mongoose collections** with defined schemas, validation rules, and compound indexes.

#### Collection: `users`

| Field | Type | Constraints |
|:---|:---|:---|
| `_id` | ObjectId | Auto-generated primary key |
| `name` | String | Required, max 60 chars |
| `email` | String | Required, unique, lowercase, regex validated |
| `password` | String | Required, min 6 chars, bcrypt hashed, `select: false` |
| `phone` | String | Optional |
| `department` | String | Default: "General" |
| `year` | String | Default: "1st Year" |
| `role` | String | Enum: `student` or `admin`, default: `student` |
| `profileImage` | String | Cloudinary CDN URL |
| `createdAt` | Date | Auto (Mongoose timestamps) |
| `updatedAt` | Date | Auto (Mongoose timestamps) |

#### Collection: `items`

| Field | Type | Constraints |
|:---|:---|:---|
| `_id` | ObjectId | Auto-generated primary key |
| `title` | String | Required, max 100 chars |
| `description` | String | Required, max 1000 chars |
| `type` | String | Required, Enum: `lost` or `found` |
| `category` | String | Required, Enum: Electronics, ID Card, Wallet, Keys, Books, Clothing, Accessories, Documents, Other |
| `location` | String | Required, max 120 chars |
| `date` | String | Required |
| `time` | String | Optional |
| `image` | String | Cloudinary CDN URL |
| `status` | String | Enum: `active`, `claimed`, `resolved` — default: `active` |
| `reportedBy` | ObjectId | Required, Foreign Key -> `users._id` |
| `createdAt` | Date | Auto (Mongoose timestamps) |

#### Collection: `claims`

| Field | Type | Constraints |
|:---|:---|:---|
| `_id` | ObjectId | Auto-generated primary key |
| `item` | ObjectId | Required, Foreign Key -> `items._id` |
| `claimant` | ObjectId | Required, Foreign Key -> `users._id` |
| `message` | String | Required, max 1000 chars (ownership proof) |
| `status` | String | Enum: `pending`, `approved`, `rejected` — default: `pending` |
| `createdAt` | Date | Auto (Mongoose timestamps) |

#### Entity Relationship Diagram

```
+----------------+          +----------------+          +----------------+
|     users      |          |     items      |          |    claims      |
|----------------|          |----------------|          |----------------|
| _id (PK)       |<----+    | _id (PK)       |<----+    | _id (PK)       |
| name           |     +----| reportedBy(FK) |     +----| item (FK)      |
| email          |          | title          |          | claimant (FK)  |--+
| password       |          | description    |          | message        |  |
| phone          |          | type           |          | status         |  |
| department     |          | category       |          | createdAt      |  |
| year           |          | location       |          +----------------+  |
| role           |<---------+----------------+------------ claimant -------+
| profileImage   |          | date, time     |   (claimant references users._id)
| createdAt      |          | image, status  |
+----------------+          | createdAt      |
                            +----------------+
```

#### Database Indexes

```javascript
// items collection
itemSchema.index({ title: 'text', description: 'text', location: 'text' }); // Full-text search
itemSchema.index({ type: 1, status: 1, category: 1 });                       // Compound filter index
itemSchema.index({ reportedBy: 1 });                                          // User's own items

// claims collection
claimSchema.index({ item: 1, claimant: 1 }); // Unique claim per user per item
claimSchema.index({ claimant: 1 });           // Fetch all of a user's claims
```

---

### 3.2 REST API Documentation

**Base URL:** `https://lostlink-6ree.onrender.com`

---

#### 3.2.1 Authentication — `/api/auth`

**POST `/api/auth/register`** — Register a new user (Public)

Request Body:
```json
{
  "name": "Tanua Sharma",
  "email": "tanua@campus.edu",
  "password": "MyPassword123",
  "phone": "9876543210",
  "department": "Computer Science",
  "year": "3rd Year"
}
```
Response `201 Created`:
```json
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": { "_id": "...", "name": "Tanua Sharma", "role": "student" }
}
```

---

**POST `/api/auth/login`** — Login and receive JWT (Public)

Request Body:
```json
{ "email": "tanua@campus.edu", "password": "MyPassword123" }
```
Response `200 OK`:
```json
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": { "_id": "...", "name": "Tanua Sharma", "email": "tanua@campus.edu", "role": "student" }
}
```

---

**GET `/api/auth/me`** — Get current user profile (JWT Required)

Response `200 OK`:
```json
{
  "success": true,
  "user": { "_id": "...", "name": "...", "email": "...", "department": "...", "profileImage": "..." }
}
```

---

**PUT `/api/auth/profile`** — Update user profile (JWT Required)

Request Body: Any subset of `name`, `phone`, `department`, `year`, `profileImage`

Response `200 OK`: Updated user object

---

#### 3.2.2 Items (Full CRUD) — `/api/items`

**GET `/api/items`** — List all items with filtering (Public)

Query Parameters:
| Parameter | Type | Example | Description |
|:---|:---|:---|:---|
| `type` | string | `lost` | Filter by `lost` or `found` |
| `category` | string | `Electronics` | Filter by item category |
| `status` | string | `active` | Filter by `active`, `claimed`, `resolved` |
| `search` | string | `laptop` | Full-text keyword search |
| `page` | number | `1` | Pagination page number |
| `limit` | number | `12` | Results per page |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | Sort direction |

Response `200 OK`:
```json
{
  "success": true,
  "count": 12,
  "total": 45,
  "page": 1,
  "pages": 4,
  "items": [ { "_id": "...", "title": "...", "type": "lost", "status": "active" } ]
}
```

---

**GET `/api/items/:id`** — Get single item detail (Public)

Response `200 OK`: Full item object with `reportedBy` populated (name, email, department)

---

**POST `/api/items`** — Create item report — CREATE (JWT Required)

Request Body:
```json
{
  "title": "Sony WH-1000XM4 Headphones",
  "description": "Black headphones found near library entrance",
  "type": "found",
  "category": "Electronics",
  "location": "Central Library",
  "date": "2025-09-10",
  "time": "14:30",
  "image": "https://res.cloudinary.com/v6e9uxyo/..."
}
```
Response `201 Created`: Created item object

---

**PUT `/api/items/:id`** — Edit item report — UPDATE (JWT Required, owner only)

Request Body: Any subset of item fields

Response `200 OK`: Updated item object

---

**DELETE `/api/items/:id`** — Delete item report — DELETE (JWT Required, owner or admin)

Response `200 OK`: `{ "success": true, "message": "Item deleted" }`

---

**PATCH `/api/items/:id/status`** — Update item lifecycle status (JWT Required, owner)

Request Body: `{ "status": "resolved" }` — valid values: `active`, `claimed`, `resolved`

Response `200 OK`: Updated item object

---

#### 3.2.3 Claims — `/api/claims`

**POST `/api/claims`** — Submit an ownership claim (JWT Required)

Request Body:
```json
{
  "item": "<itemId>",
  "message": "I can identify it by the scratch on the left ear cup and my name sticker inside"
}
```
Response `201 Created`: Created claim object

---

**GET `/api/claims/my`** — Get current user's claims (JWT Required)

Response `200 OK`: Array of claims with `item` and `claimant` populated

---

**PUT `/api/claims/:id`** — Approve or reject a claim (JWT Required, item reporter only)

Request Body: `{ "status": "approved" }` or `{ "status": "rejected" }`

Response `200 OK`: Updated claim; if approved, item status auto-updates to `claimed`

---

#### 3.2.4 Image Upload — `/api/upload`

**POST `/api/upload`** — Upload image to Cloudinary (JWT Required)

Content-Type: `multipart/form-data`
Fields: `image` (file), `folder` (optional — e.g. `"lost"`, `"found"`, `"profiles"`)

Response `200 OK`:
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/v6e9uxyo/image/upload/v.../lostlink/found/abc123.jpg",
  "publicId": "lostlink/found/abc123"
}
```

---

#### 3.2.5 Admin — `/api/admin` (JWT + Admin Role Required)

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/admin/stats` | Total users, items, claims, resolution rate |
| `GET` | `/api/admin/users` | List all registered users |
| `DELETE` | `/api/admin/users/:id` | Delete a user account |
| `GET` | `/api/admin/items` | List all items across the platform |
| `DELETE` | `/api/admin/items/:id` | Delete any item report |
| `GET` | `/api/admin/claims` | List all claim records |

---

#### 3.2.6 Health & Diagnostics

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | Server info and endpoint directory |
| `GET` | `/api/health` | Health check — `{ "status": "Healthy & Operational" }` |
| `GET` | `/api/debug/cloudinary-status` | Verify Cloudinary API connectivity |

---

#### 3.2.7 HTTP Status Codes Reference

| Status Code | Meaning | When Used |
|:---|:---|:---|
| `200 OK` | Success | GET, PUT, PATCH, DELETE |
| `201 Created` | Resource created | POST register, item, claim, upload |
| `400 Bad Request` | Validation failed | Missing fields, invalid data |
| `401 Unauthorized` | Auth failed | Missing / invalid / expired JWT |
| `403 Forbidden` | Permission denied | Non-admin accessing admin routes |
| `404 Not Found` | Resource not found | Unknown item / claim / user ID |
| `409 Conflict` | Duplicate resource | Email already registered |
| `429 Too Many Requests` | Rate limit exceeded | Brute-force on auth endpoints |
| `500 Internal Server Error` | Server fault | Unhandled exceptions |

---

## 4. Cloud Deployment & Integration

### 4.1 Frontend Deployment — Vercel

**Platform:** Vercel (https://vercel.com)

Vercel is a cloud platform for frontend frameworks with global CDN edge deployment and automatic CI/CD from GitHub.

**How It Is Deployed:**
- The `frontend/` directory is configured as the Vercel project root.
- On every push to the `main` branch, Vercel automatically triggers a build and deploy.
- The compiled output from `dist/` is deployed to Vercel's global edge network.

**Vercel Routing Config (`frontend/vercel.json`):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This ensures React Router handles all routes client-side — prevents 404 on direct URL access.

**Environment Variable (Vercel Dashboard):**
```
VITE_API_URL = https://lostlink-6ree.onrender.com/api
```

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

### 4.2 Backend Deployment — Render

**Platform:** Render (https://render.com)

Render is a cloud platform for hosting server-side applications with GitHub-triggered auto-deployments.

**How It Is Deployed:**
- The `backend/` directory is connected to Render as a Web Service.
- On every push to `main`, Render pulls the latest code and restarts the service.
- Render provides a persistent URL: `https://lostlink-6ree.onrender.com`

**Start Command:** `node server.js`

**Environment Variables (Render Dashboard):**
```
NODE_ENV       = production
PORT           = 10000
MONGODB_URI    = mongodb+srv://<user>:<pass>@cluster0.zaz1fdw.mongodb.net/lostlink
JWT_SECRET     = <secret_key>
CLOUDINARY_URL = cloudinary://<api_key>:<api_secret>@v6e9uxyo
CLIENT_URL     = https://lost-link-ten.vercel.app
```

All secrets are stored in the Render environment dashboard — never committed to Git.

**Production Reliability Measures:**
- `app.set('trust proxy', 1)` — Correct client IP detection behind Render's proxy
- DNS overridden to `8.8.8.8` and `1.1.1.1` — Stable MongoDB Atlas SRV resolution
- Global unhandled promise rejection handler prevents server crashes

---

### 4.3 Database — MongoDB Atlas

**Platform:** MongoDB Atlas (https://cloud.mongodb.com)

MongoDB Atlas is a fully managed cloud NoSQL database service.

**How It Is Configured:**
- Free M0 cluster on AWS `ap-south-1` (Mumbai) region
- Database name: `lostlink`
- IP Access List: `0.0.0.0/0` — required because Render uses dynamic IPs
- Dedicated database user with read/write permissions created
- Connection string injected via `MONGODB_URI` environment variable

**Connection Code (`backend/config/db.js`):**
```javascript
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
```

---

### 4.4 Media Storage — Cloudinary

**Platform:** Cloudinary (https://cloudinary.com)

Cloudinary is a cloud-based digital media management platform with image transformation and CDN delivery.

**Image Upload Flow:**
```
Browser -> FileReader (instant base64 preview in UI)
        -> POST /api/upload (multipart form-data)
        -> Multer (in-memory buffer)
        -> Base64 Data URI conversion
        -> cloudinary.uploader.upload()
        -> Secure CDN URL returned
        -> Stored in MongoDB (items.image or users.profileImage)
```

**Cloudinary SDK Configuration:**
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // v6e9uxyo
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
```

**Cloudinary Folder Organization:**
- `lostlink/lost/` — Lost item report images
- `lostlink/found/` — Found item report images
- `lostlink/items/` — General item images
- `lostlink/profiles/` — User profile pictures

**Auto-transformations on every upload:**
- Max dimensions: 1200 x 1200 px (crop: limit)
- Quality: auto-optimized
- Format: auto (serves WebP to supporting browsers)

---

### 4.5 CI/CD Pipeline

```
Developer: git push origin main
                |
                v
        GitHub Repository
        /               \
       v                 v
    Vercel             Render
  (Frontend)         (Backend)
   Detects push       Detects push
   npm run build      Pulls latest code
   Deploy to CDN      node server.js
       |                   |
       v                   v
  Live SPA at         Live API at
  vercel.app          onrender.com
```

---

## 5. Documentation & Demonstration

### 5.1 Complete CRUD Operations Coverage

| Operation | Entity | HTTP Method | Endpoint | Description |
|:---|:---|:---|:---|:---|
| **C**reate | User | `POST` | `/api/auth/register` | Register a new student account |
| **R**ead | User | `GET` | `/api/auth/me` | Fetch the authenticated user's profile |
| **U**pdate | User | `PUT` | `/api/auth/profile` | Edit name, department, year, avatar |
| **D**elete | User | `DELETE` | `/api/admin/users/:id` | Admin deletes a user account |
| **C**reate | Item | `POST` | `/api/items` | Report a lost or found item |
| **R**ead | Item | `GET` | `/api/items`, `/api/items/:id` | Browse all items or view one item |
| **U**pdate | Item | `PUT` | `/api/items/:id` | Edit own item report |
| **D**elete | Item | `DELETE` | `/api/items/:id` | Delete an item report |
| **C**reate | Claim | `POST` | `/api/claims` | Submit an ownership claim |
| **R**ead | Claim | `GET` | `/api/claims/my` | View all of the user's submitted claims |
| **U**pdate | Claim | `PUT` | `/api/claims/:id` | Approve or reject a claim |
| **C**reate | Image | `POST` | `/api/upload` | Upload item image to Cloudinary |

---

### 5.2 Application Pages Reference

| Screen | Live URL |
|:---|:---|
| Home / Landing Page | https://lost-link-ten.vercel.app/ |
| Register | https://lost-link-ten.vercel.app/register |
| Login (with 1-click demo buttons) | https://lost-link-ten.vercel.app/login |
| Browse Items Feed | https://lost-link-ten.vercel.app/browse |
| Report Item Form | https://lost-link-ten.vercel.app/report |
| Student Dashboard | https://lost-link-ten.vercel.app/dashboard |
| Admin Console | https://lost-link-ten.vercel.app/admin |
| Backend Health Check | https://lostlink-6ree.onrender.com/api/health |

---

### 5.3 Demo Credentials

| Role | Email | Password |
|:---|:---|:---|
| **Student** | `alex.rivera@campus.edu` | `StudentPassword123!` |
| **Admin** | `admin@campus.edu` | `AdminPassword123!` |

---

### 5.4 Cloud Computing Concepts Demonstrated

| Concept | How It Is Applied in LostLink |
|:---|:---|
| **PaaS (Platform as a Service)** | Render and Vercel abstract away all server infrastructure; only application code is managed |
| **DBaaS (Database as a Service)** | MongoDB Atlas handles database provisioning, replication, backups, and scaling automatically |
| **CDN (Content Delivery Network)** | Vercel edge nodes serve the SPA globally; Cloudinary CDN delivers images from the nearest PoP |
| **Auto-scaling** | Render and Vercel scale compute resources horizontally on demand |
| **CI/CD Pipeline** | GitHub pushes trigger automatic builds and zero-downtime deployments to both Vercel and Render |
| **Serverless Image Processing** | Cloudinary auto-resizes, compresses, and converts images to WebP without custom server code |
| **12-Factor App Config** | All secrets injected as environment variables via platform dashboards — never hardcoded |
| **Stateless Authentication** | JWT tokens allow horizontal scaling since no server-side session state is maintained |
| **DNS & Cross-Cloud Networking** | Custom DNS resolvers configured to reliably resolve MongoDB Atlas SRV records from Render |
| **RESTful API Design** | Decoupled frontend and backend communicate over stateless HTTP with standard verbs and status codes |

---

### 5.5 Summary

**LostLink** is a fully functional, cloud-native MERN stack web application that:

1. **Addresses a real-world problem** — digitalizing the campus lost & found process with photo evidence and verified claims.
2. **Implements complete CRUD** — on Users, Items, and Claims entities via a RESTful API.
3. **Integrates a cloud database** — MongoDB Atlas with structured schemas, compound indexes, and document references.
4. **Uses cloud media storage** — Cloudinary CDN for resilient image upload, auto-transformation, and global delivery.
5. **Is deployed across cloud platforms** — Frontend on Vercel, Backend on Render, with automated CI/CD from GitHub.
6. **Demonstrates cloud computing principles** — PaaS, DBaaS, CDN, auto-scaling, CI/CD, stateless authentication, and environment-based configuration management.

---

*Prepared as part of the BACE344 — Cloud Infrastructure and Architecture Digital Assignment.*
*GitHub Repository: https://github.com/omaw1928-gh/LostLink*
*Live Application: https://lost-link-ten.vercel.app*
