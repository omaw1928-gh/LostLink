# Assignment 3 – Question 2 Part (b): Multi-Factor Authentication (TOTP) & Role-Based Access Control (RBAC)

**Application**: LostLink (Smart Campus Lost & Found Management System)  
**Standard**: RFC 6238 Time-Based One-Time Password (TOTP)  
**Encryption Standard**: AES-256-GCM (Authenticated Encryption at Rest)  
**RBAC Model**: Least-Privilege Role Hierarchy (`student`, `moderator`, `admin`)  
**Date**: October 2026  

---

## 1. System Overview

To defend the campus community against credential stuffing, phishing, and session hijacking, **LostLink** implements an enterprise-grade security architecture:
1. **Time-Based One-Time Password (TOTP) MFA**: Fully compatible with standard mobile authenticator apps (Google Authenticator, Microsoft Authenticator, Apple Passwords, Authy).
2. **Encrypted Key Storage**: In accordance with NIST SP 800-63B guidelines, TOTP base32 shared secrets are never stored in plaintext in MongoDB; they are protected using **AES-256-GCM authenticated encryption** with unique initialization vectors (IV) and authentication tags.
3. **MFA Challenge Flow**: Login for MFA-enrolled accounts returns a short-lived `mfaChallengeToken` with an explicit claim `purpose: 'mfa-challenge'`. The auth middleware strictly blocks challenge tokens from accessing protected application APIs until the 6-digit TOTP code is verified.
4. **Role-Based Access Control (RBAC) & Ownership**: Enforces least privilege across three distinct roles (`student`, `moderator`, `admin`). Unauthenticated calls return `401 Unauthorized`. Unauthorized cross-account modifications return `403 Forbidden`.

---

## 2. Cryptographic Secret Encryption at Rest (AES-256-GCM)

All TOTP secrets are encrypted before persistence in [`backend/utils/cryptoUtil.js`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/backend/utils/cryptoUtil.js):

```javascript
// backend/utils/cryptoUtil.js
const crypto = require('crypto');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(ciphertext) {
  const parts = ciphertext.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 3. TOTP MFA Endpoints & Protocol Flow

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/mfa/setup` | Private (`Bearer`) | Generates base32 secret, builds `otpauth://` URI, and returns base64 PNG QR code data URI. |
| `POST` | `/api/auth/mfa/verify` | Private (`Bearer`) | Verifies initial 6-digit code to confirm user enrollment before permanently enabling `mfaEnabled: true`. |
| `POST` | `/api/auth/login` | Public | If `mfaEnabled: true`, returns `mfaRequired: true` and temporary `mfaChallengeToken`. |
| `POST` | `/api/auth/mfa/login-verify`| Public | Validates `mfaChallengeToken` + 6-digit TOTP code, then issues permanent 30-day session JWT. |
| `POST` | `/api/auth/mfa/disable` | Private (`Bearer`) | Allows disabling 2FA upon verifying current TOTP token. |

---

## 4. Role-Based Access Control (RBAC) Matrix

| Resource & Operation | HTTP Method & Path | Student (Owner) | Student (Non-Owner) | Moderator | Admin | Unauthenticated |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Search / Browse Items** | `GET /api/items` | 200 OK | 200 OK | 200 OK | 200 OK | 200 OK |
| **Create Item Report** | `POST /api/items` | 201 Created | 201 Created | 201 Created | 201 Created | 401 Unauthorized |
| **Update Own Item** | `PUT /api/items/:id` | 200 OK | 403 Forbidden | 200 OK | 200 OK | 401 Unauthorized |
| **Delete Item Report** | `DELETE /api/items/:id` | 200 OK | 403 Forbidden | 403 Forbidden | 200 OK | 401 Unauthorized |
| **Update Claim Status** | `PATCH /api/items/:id/status`| 200 OK | 403 Forbidden | 200 OK | 200 OK | 401 Unauthorized |
| **User Directory** | `GET /api/auth/admin/users` | 403 Forbidden | 403 Forbidden | 403 Forbidden | 200 OK | 401 Unauthorized |
| **Change User Role** | `PATCH /api/auth/admin/users/:id/role`| 403 Forbidden | 403 Forbidden | 403 Forbidden | 200 OK | 401 Unauthorized |

---

## 5. Automated Verification & Test Results

Run the automated test suite for Part (b):

```powershell
powershell -File scripts\test_q2b_security.ps1
```

### Execution Log

```text
=================================================================
   LostLink DA3 Q2(b) - Automated MFA & RBAC Security Test Suite 
   Target: http://localhost:8080                                               
=================================================================

--- Section 1: Bcrypt Password Security (Work Factor 12) ---
  [PASS] Reject password < 8 characters (Status 400)
  [PASS] Register Student Alice (Bcrypt work factor 12)
  [PASS] Password hash omitted from response
  [PASS] Register Student Bob
  [PASS] Register Campus Admin

--- Section 2: Two-Factor Authentication (TOTP & Encryption) ---
  [PASS] Initiate MFA Setup (/api/auth/mfa/setup)
         Base32 Secret: K7Y75LZ2SOJKCVKCJMW5OJF43VEDP4CH
  [PASS] Generate Authenticator QR Code (base64 PNG)
  [PASS] Verify TOTP code & enable MFA (/api/auth/mfa/verify)
  [PASS] Login challenge triggered (mfaRequired=true)
  [PASS] Block challenge token from protected endpoints (Status 401)
  [PASS] Complete MFA Login with TOTP code (/api/auth/mfa/login-verify)

--- Section 3: RBAC & Resource Ownership Security ---
  [PASS] Reject unauthenticated DELETE (401 Unauthorized)
  [PASS] Student Alice creates item report
  [PASS] Reject non-owner update (403 Forbidden - Bob cannot edit Alice's item)
  [PASS] Reject non-owner delete (403 Forbidden - Bob cannot delete Alice's item)
  [PASS] Owner (Alice) updates own item (200 OK)
  [PASS] Student blocked from Admin endpoints (403 Forbidden)
  [PASS] Admin accesses Admin User Directory (200 OK)
  [PASS] Admin deletes item (Administrative override 200 OK)

=================================================================
   Q2(b) Security Test Summary: 19 Passed, 0 Failed (100% OK)
=================================================================
```
