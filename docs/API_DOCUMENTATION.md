# LostLink API Documentation

Comprehensive RESTful API reference for **LostLink – Smart Campus Lost & Found Management System**.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Base URL (Production)**: `https://your-lostlink-api.onrender.com/api`
- **Content-Type**: `application/json` (or `multipart/form-data` for uploads)
- **Authentication**: JWT Bearer Token (`Authorization: Bearer <token>`)

---

## Summary of All Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Public | System health check and service status |
| **POST** | `/api/auth/register` | Public | Register a new student/campus user |
| **POST** | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| **GET** | `/api/auth/me` | Private | Get profile of logged-in user |
| **PUT** | `/api/auth/profile` | Private | Update user profile & contact details |
| **GET** | `/api/items` | Public | Browse, filter, search, & paginate items |
| **GET** | `/api/items/:id` | Public | Get single item details (with claims if owner) |
| **POST** | `/api/items` | Private | Report a new lost or found item |
| **PUT** | `/api/items/:id` | Private (Owner/Admin) | Update item details |
| **DELETE** | `/api/items/:id` | Private (Owner/Admin) | Delete item and attached claims |
| **PATCH** | `/api/items/:id/status` | Private (Owner/Admin) | Change status (`active`, `claimed`, `resolved`) |
| **POST** | `/api/claims` | Private | Submit ownership claim with proof |
| **GET** | `/api/claims/my` | Private | Get claims submitted and received by user |
| **GET** | `/api/claims/:id` | Private (Parties/Admin)| Get specific claim details |
| **PUT** | `/api/claims/:id` | Private (Owner/Admin) | Update claim status (`approved`/`rejected`) |
| **DELETE** | `/api/claims/:id` | Private (Claimant/Admin)| Withdraw/cancel claim |
| **GET** | `/api/admin/stats` | Admin Only | System counts, breakdown, & analytics |
| **GET** | `/api/admin/users` | Admin Only | List, filter, & search all campus users |
| **DELETE** | `/api/admin/users/:id` | Admin Only | Delete user account & cascade items |
| **GET** | `/api/admin/items` | Admin Only | List all campus items for moderation |
| **PUT** | `/api/admin/items/:id/status`| Admin Only | Force update item status |
| **DELETE** | `/api/admin/items/:id` | Admin Only | Force delete inappropriate item |
| **GET** | `/api/admin/claims` | Admin Only | Moderate all claims across campus |
| **POST** | `/api/upload` | Private | Upload image to Cloudinary / CDN |

---

## 1. Authentication Endpoints

### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
  "name": "Alex Rivera",
  "email": "alex.rivera@campus.edu",
  "password": "StudentPassword123!",
  "phone": "+1 (555) 234-5678",
  "department": "Computer Science & Engineering",
  "year": "3rd Year",
  "role": "student"
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "65e23f9a7d32c001a1b2c3d4",
    "name": "Alex Rivera",
    "email": "alex.rivera@campus.edu",
    "phone": "+1 (555) 234-5678",
    "department": "Computer Science & Engineering",
    "year": "3rd Year",
    "role": "student",
    "profileImage": "",
    "createdAt": "2025-03-01T12:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "A user with this email already exists"
}
```

---

### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
  "email": "alex.rivera@campus.edu",
  "password": "StudentPassword123!"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "65e23f9a7d32c001a1b2c3d4",
    "name": "Alex Rivera",
    "email": "alex.rivera@campus.edu",
    "role": "student"
  }
}
```

---

### Get Authenticated User Profile
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes (`Bearer <token>`)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "65e23f9a7d32c001a1b2c3d4",
    "name": "Alex Rivera",
    "email": "alex.rivera@campus.edu",
    "department": "Computer Science & Engineering",
    "year": "3rd Year",
    "role": "student"
  }
}
```

---

## 2. Items Endpoints

### Browse & Search Items
- **URL**: `/api/items`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `type` (`lost` | `found`)
  - `category` (`Electronics`, `ID Card`, `Wallet`, `Keys`, `Books`, `Clothing`, `Accessories`, `Documents`, `Other`)
  - `location` (string query)
  - `status` (`active`, `claimed`, `resolved`, `all`)
  - `search` (keywords matching title, description, category, location)
  - `sortBy` (`createdAt`, `date`, `title`)
  - `sortOrder` (`asc`, `desc`)
  - `page` (integer, default: 1)
  - `limit` (integer, default: 12)

**Example Request**:
`GET /api/items?type=lost&category=Electronics&search=MacBook&page=1`

**Success Response (200 OK)**:
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "65e24a1b7d32c001a1b2c3d5",
      "title": "Space Gray MacBook Air M2",
      "description": "Left on 3rd floor quiet study desk in Library.",
      "type": "lost",
      "category": "Electronics",
      "location": "Central Library - 3rd Floor Quiet Zone",
      "date": "2025-02-28",
      "time": "14:30",
      "image": "https://images.unsplash.com/...",
      "status": "active",
      "reportedBy": {
        "_id": "65e23f9a7d32c001a1b2c3d4",
        "name": "Alex Rivera",
        "department": "Computer Science & Engineering"
      },
      "createdAt": "2025-03-01T12:30:00.000Z"
    }
  ]
}
```

---

### Create Item Report
- **URL**: `/api/items`
- **Method**: `POST`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "title": "Sony WH-1000XM4 Headphones",
  "description": "Found in black zipper case near gym.",
  "type": "found",
  "category": "Electronics",
  "location": "Campus Recreation Center",
  "date": "2025-03-01",
  "time": "11:15",
  "image": "https://res.cloudinary.com/..."
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Found item reported successfully",
  "data": {
    "_id": "65e24b5c7d32c001a1b2c3d6",
    "title": "Sony WH-1000XM4 Headphones",
    "status": "active"
  }
}
```

---

## 3. Claims Endpoints

### Submit Claim Request
- **URL**: `/api/claims`
- **Method**: `POST`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "itemId": "65e24b5c7d32c001a1b2c3d6",
  "message": "The case has a scratch near the zipper and the Bluetooth name matches Alex-XM4."
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Claim request submitted successfully",
  "data": {
    "_id": "65e24c2d7d32c001a1b2c3d7",
    "item": "65e24b5c7d32c001a1b2c3d6",
    "claimant": "65e23f9a7d32c001a1b2c3d4",
    "message": "The case has a scratch...",
    "status": "pending"
  }
}
```

---

### Update Claim Status (Approve / Reject)
- **URL**: `/api/claims/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Item Reporter or Admin)

**Request Body**:
```json
{
  "status": "approved"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Claim status updated to approved",
  "data": {
    "_id": "65e24c2d7d32c001a1b2c3d7",
    "status": "approved"
  }
}
```

---

## 4. Admin Endpoints

### Get Admin Statistics
- **URL**: `/api/admin/stats`
- **Method**: `GET`
- **Auth Required**: Yes (`admin` role)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "users": { "total": 45, "students": 42, "admins": 3 },
    "items": { "total": 128, "lost": 68, "found": 60, "resolved": 42, "claimed": 15, "active": 71 },
    "claims": { "total": 38, "pending": 7, "approved": 24, "rejected": 7 },
    "categoryBreakdown": [
      { "category": "Electronics", "count": 45 },
      { "category": "Wallet", "count": 22 }
    ]
  }
}
```

---

## 5. Image Upload Endpoint

### Upload Image
- **URL**: `/api/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Header**: `Content-Type: multipart/form-data`
- **Form Key**: `image` (File up to 5MB, format JPG/PNG/WEBP/GIF)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Image uploaded successfully to Cloudinary",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v12345/lostlink/items/sample.jpg",
    "public_id": "lostlink/items/sample"
  }
}
```
