# Assignment 3 – Question 2 Part (a): Password Security & Storage Architecture

**Application**: LostLink (Smart Campus Lost & Found Management System)  
**Component**: Authentication & Credential Storage Subsystem  
**Work Factor**: Bcrypt Cost Factor 12 ($2^{12} = 4,096$ key derivation iterations)  
**Date**: October 2026  

---

## 1. Executive Summary

Password security is the first line of defense against unauthorized account compromise. For the **LostLink** application, where students, faculty, and campus administrators manage sensitive personal property records and ownership claims, robust password handling is critical.

This implementation meets and exceeds the requirements for **Question 2(a)**:
1. **Cryptographic Algorithm**: Upgraded password hashing to `bcryptjs` with **Work Factor 12** ($2^{12} = 4,096$ rounds), adhering to OWASP Password Storage Cheat Sheet recommendations.
2. **Input Validation Policy**: Rejects empty passwords and enforces a strict minimum length of **at least 8 characters** prior to hash computation.
3. **Data Confidentiality**: Model-level protection (`select: false`) guarantees password hashes and sensitive authentication fields are never returned in JSON API responses or emitted in server log files.
4. **Seamless Legacy Account Migration**: Implements an in-flight, transparent migration mechanism. If an existing or legacy database account contains an unhashed/plaintext password, the system validates the plaintext on the user's next login and immediately upgrades the record to a Bcrypt Work Factor 12 hash without forcing a disruptive password reset.
5. **Pre-Configured Demo Accounts**: Includes pre-seeded accounts across all three RBAC roles for rapid evaluation and grading.

---

## 2. Technical Implementation Details

### 2.1 Mongoose User Schema & Bcrypt Work Factor 12

In [`backend/models/User.js`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/backend/models/User.js), the Mongoose pre-save middleware calculates the cryptographic salt using 12 rounds:

```javascript
// backend/models/User.js
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide your name'], trim: true },
  email: { type: String, required: [true, 'Please provide your email'], unique: true, lowercase: true },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Prevents accidental exposure in queries
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'moderator'],
    default: 'student',
  },
  // ...
});

// Enforce Bcrypt Work Factor 12
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12); // Work factor 12 (4,096 iterations)
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### 2.2 Transparent Legacy Plaintext Migration

To guarantee zero downtime and zero user friction during a security migration from legacy systems:

```javascript
// backend/models/User.js
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;

  // 1. Standard Bcrypt verification ($2a$, $2b$, or $2y$)
  if (
    this.password.startsWith('$2a$') ||
    this.password.startsWith('$2b$') ||
    this.password.startsWith('$2y$')
  ) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // 2. Safe Legacy Migration:
  // If plain-text matches, immediately upgrade account to Bcrypt work factor 12
  const isPlainMatch = enteredPassword === this.password;
  if (isPlainMatch) {
    const salt = await bcrypt.genSalt(12);
    const upgradedHash = await bcrypt.hash(enteredPassword, salt);
    await this.constructor.updateOne({ _id: this._id }, { password: upgradedHash });
  }
  return isPlainMatch;
};
```

---

## 3. Pre-Configured Demo Accounts for Evaluation

| Role | Email | Password | Department | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student.alice@campus.edu` | `StudentAlice12!` | Computer Science | Manage own lost/found reports |
| **Moderator** | `moderator.carol@campus.edu` | `ModeratorCarol12!` | Student Affairs | Review & update status of all items |
| **Admin** | `admin.dave@campus.edu` | `AdminDave12!` | IT Infrastructure | Full administrative rights & deletion |

---

## 4. Automated Verification & Test Results

Run the automated test suite for Part (a):

```powershell
powershell -File scripts\test_q2a_password.ps1
```

### Test Output Log

```text
=================================================================
   LostLink DA3 Q2(a) - Bcrypt Password Security & Migration     
   Target: http://localhost:8080                                               
=================================================================

--- 1. Password Policy Enforcement ---
  [PASS] Reject empty password (400 Bad Request)
  [PASS] Reject password < 8 chars (400 Bad Request)

--- 2. Bcrypt Work Factor 12 Verification ---
  [PASS] Bcrypt hash algorithm prefix ($2b$12$)
  [PASS] Bcrypt work factor cost = 12
         Work Factor: 2^12 = 4,096 cryptographic hashing iterations

--- 3. Confidentiality (No Password Leakage) ---
  [PASS] Password hash omitted from /api/auth/me
  [PASS] MFA Secret omitted from /api/auth/me

--- 4. Safe Legacy Plaintext Migration Demonstration ---
  -> Inserted legacy user with plaintext password in database.
  [PASS] Pre-migration: Raw plaintext in database
  [PASS] Legacy user login succeeds
  [PASS] Post-migration: Upgraded to bcrypt work factor 12 ($2b$12$)
  [PASS] Subsequent login succeeds with upgraded bcrypt hash

--- 5. Provisioning Demo Test Accounts for Grading ---
  [PASS] Demo account: student.alice@campus.edu
  [PASS] Demo account: moderator.carol@campus.edu
  [PASS] Demo account: admin.dave@campus.edu

=================================================================
   Q2(a) Password Test Summary: 13 Passed, 0 Failed (100% OK)
=================================================================
```
