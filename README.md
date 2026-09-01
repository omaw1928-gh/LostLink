# LostLink – Smart Campus Lost & Found Management System

![LostLink Banner](https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80)

> **Find it. Report it. Return it.**
> A modern, full-stack cloud web application that solves the real-world campus problem of losing and finding personal belongings.

---

## 📌 Problem Statement

Every semester, thousands of college students lose valuable items across university campuses—including laptops, dorm keys, student ID cards, headphones, and wallets. Traditional physical lost & found desks suffer from fragmented logs, lack of photo proof, delayed notifications, and zero privacy protection.

## 💡 The LostLink Solution

**LostLink** modernizes campus asset recovery with an intuitive, cloud-hosted platform:
1. **Instant Reporting**: Students can report lost or found belongings with campus location tags, high-resolution photo uploads, and timestamps in under 60 seconds.
2. **Interactive Marketplace Feed**: Full-text search and smart filtering by category, location, status, and report type.
3. **Verified Claims Workflow**: Students submit proof of ownership to item finders/reporters. Upon approval, contact details are securely shared to coordinate a safe hand-off.
4. **Administrative Console**: Campus security and administration staff can monitor activity, review analytics, moderate duplicate/inappropriate listings, and manage user accounts.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS (Custom emerald & navy theme)
- **Icons**: Lucide React
- **HTTP Client**: Axios (with JWT interceptors)

### Backend
- **Runtime**: Node.js & Express.js
- **Architecture**: RESTful API with MVC pattern
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **Security**: Helmet, CORS origin control, express-rate-limit

### Database & Cloud
- **Database**: MongoDB Atlas via Mongoose ODM
- **Media Storage**: Cloudinary SDK (Image streaming & CDN delivery with local Data-URI fallback)
- **Deployment Readiness**: Vercel (Frontend) + Render (Backend)

---

## 📁 Repository Structure

```text
lostlink/
├── frontend/
│   ├── src/
│   │   ├── components/       # ItemCard, ItemForm, ClaimModal, ConfirmModal, StatCard, Navbar...
│   │   ├── pages/            # Home, Browse, ItemDetails, Login, Register, Dashboard, Admin...
│   │   ├── layouts/          # MainLayout, DashboardLayout
│   │   ├── services/         # Axios API clients for Auth, Items, Claims, Admin, Upload
│   │   ├── context/          # AuthContext (JWT state), ToastContext (Alerts)
│   │   ├── App.jsx           # Master route configuration
│   │   ├── main.jsx          # Entry point with context providers
│   │   └── index.css         # Tailwind & custom glassmorphism styles
│   ├── public/               # Favicon & assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/
│   ├── config/               # db.js (MongoDB Atlas), cloudinary.js
│   ├── controllers/          # authController, itemController, claimController, adminController, uploadController
│   ├── middleware/           # authMiddleware (JWT + Admin role), uploadMiddleware (Multer), errorMiddleware
│   ├── models/               # User.js, Item.js, Claim.js
│   ├── routes/               # authRoutes, itemRoutes, claimRoutes, adminRoutes, uploadRoutes
│   ├── utils/                # seed.js (Pre-populated sample data)
│   ├── server.js             # Express app setup & route mounting
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── API_DOCUMENTATION.md  # Complete REST API reference
│   ├── DATABASE_DESIGN.md    # Schemas, ERD diagram & index strategies
│   └── CLOUD_ARCHITECTURE.md # Cloud hosting & security documentation
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB installed locally OR a MongoDB Atlas cluster URI

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/lostlink.git
cd lostlink
```

---

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env` (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/lostlink
JWT_SECRET=lostlink_super_secret_jwt_key_campus_2025_secure_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

*(Note: If Cloudinary credentials are not set, LostLink automatically falls back to local Data-URI uploads for instant development).*

#### (Optional) Seed Sample Database Data
Populate realistic campus users, lost/found items, and sample claims:
```bash
npm run seed
```

#### Start Backend Server
```bash
npm run dev
# Server running at http://localhost:5000
```

---

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=/api
```

#### Start Frontend Development Server
```bash
npm run dev
# Application running at http://localhost:5173
```

---

## 🔑 Demo Login Credentials

The seed script (`npm run seed`) creates the following pre-configured accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Campus Admin** | `admin@campus.edu` | `AdminPassword123!` | Full System Analytics, User Management, Global Item Moderation |
| **Student 1** | `alex.rivera@campus.edu` | `StudentPassword123!` | Create Reports, Submit Claims, Student Workspace |
| **Student 2** | `sarah.chen@campus.edu` | `StudentPassword123!` | Create Reports, Submit Claims, Student Workspace |
| **Student 3** | `michael.davis@campus.edu`| `StudentPassword123!` | Create Reports, Submit Claims, Student Workspace |

*(Tip: The Login page includes **1-Click Demo Buttons** to automatically autofill Student and Admin credentials).*

---

## 🔄 Claims & Verification Workflow

```text
Student reports Found Item (e.g. Sony Headphones)
                  ↓
Student who lost the item browses marketplace
                  ↓
Submits Claim with Verification Proof (e.g. Bluetooth ID / Serial)
                  ↓
Item Reporter receives notification on Dashboard & My Claims
                  ↓
Reporter reviews details → [ Approve / Reject ]
                  ↓
[Approve] → Item status transitions to 'Claimed' / 'Resolved'
          → Contact details shared for hand-off
```

---

## 📡 REST API Summary

| Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT |
| `GET` | `/api/auth/me` | Private | Current user profile |
| `GET` | `/api/items` | Public | Filterable list of campus items |
| `GET` | `/api/items/:id` | Public | Detailed view of an item |
| `POST` | `/api/items` | Private | Report lost or found item |
| `PUT` | `/api/items/:id` | Private | Edit own item report |
| `DELETE` | `/api/items/:id` | Private | Delete item report |
| `PATCH`| `/api/items/:id/status` | Private | Update status (`active`/`claimed`/`resolved`)|
| `POST` | `/api/claims` | Private | Submit ownership claim |
| `GET` | `/api/claims/my` | Private | Current user's claims |
| `PUT` | `/api/claims/:id` | Private | Approve/reject claim |
| `GET` | `/api/admin/stats` | Admin | Dashboard analytics & counts |
| `GET` | `/api/admin/users` | Admin | Manage all campus users |
| `GET` | `/api/admin/items` | Admin | Moderate all campus items |
| `POST` | `/api/upload` | Private | Upload image to Cloudinary |

*Full documentation with request and response payloads can be found in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).*

---

## 🧪 Testing Checklist

- [x] **Registration**: Register a new student account with department and phone.
- [x] **Authentication**: Login with valid and invalid credentials; verify JWT storage and route guards.
- [x] **Report Lost Item**: Submit a lost report with category, location, date, description, and image.
- [x] **Report Found Item**: Submit a found item report.
- [x] **Search & Filter**: Search items by keyword ("MacBook", "Library") and filter by category and status.
- [x] **Item Detail View**: Open item page; verify status badge, location details, and reporter card.
- [x] **Submit Claim**: Submit ownership verification message on another student's item.
- [x] **Approve / Reject Claim**: Reporter logs in, views claim in Dashboard, and approves it.
- [x] **Status Update**: Verify item status updates to `claimed` or `resolved`.
- [x] **Admin Role Guard**: Access `/admin` as student (denied) and as admin (granted).
- [x] **Admin Moderation**: Search users, delete inappropriate items, and review system stats.

---

## 🌐 Production Cloud Deployment

### 1. Backend (Render)
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `CLIENT_URL`

### 2. Frontend (Vercel)
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL`

### 3. Database (MongoDB Atlas)
- Provision M0 free cluster.
- Whitelist IP `0.0.0.0/0`.
- Connect via Mongoose URI in backend environment variables.

---

## 📄 License
This project is licensed under the MIT License. Built for university campus communities.
