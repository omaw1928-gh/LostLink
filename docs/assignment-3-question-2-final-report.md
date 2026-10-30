# Assignment 3 – Question 2: Secure Your Application (Master Final Report)

**Course**: Digital Assignment 3 – Application Security & Scalability  
**Project**: LostLink (Smart Campus Lost & Found Management System)  
**Total Marks**: 5 Marks  
**Date**: October 2026  

---

## 1. Executive Summary

This master final report documents the end-to-end security architecture, implementation, automated testing, and regulatory analysis executed for **Assignment 3 Question 2 (Secure Your Application)** on the **LostLink** campus management system.

All four parts have been implemented, tested on the live load-balanced container stack (`http://localhost:8080`), and validated with 100% automated test pass rates without regressing any Question 1 load-balancing, failover, or cloud-bursting features.

---

## 2. Part-by-Part Accomplishments

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ASSIGNMENT 3 QUESTION 2 ARCHITECTURE                  │
├──────────────────────┬──────────────────────────────────────────────────────┤
│ Part (a)             │ Bcrypt Work Factor 12 ($2^{12} = 4,096$ rounds)      │
│ Password Security    │ Min length >= 8, transparent legacy migration        │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ Part (b)             │ RFC 6238 TOTP Two-Factor Authentication              │
│ MFA & RBAC           │ AES-256-GCM secret encryption at rest, 3-tier RBAC   │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ Part (c)             │ Aqua Security Trivy Container Scanning               │
│ Docker Security      │ Multi-stage build, unprivileged USER node, 0 OS CVEs │
├──────────────────────┼──────────────────────────────────────────────────────┤
│ Part (d)             │ Threat Modeling (External Attacker vs Malicious User)│
│ Threat & Compliance  │ GDPR (Articles 5, 25, 32) & India DPDP Act 2023      │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

### Part (a): Password Security & Storage Architecture
- **Work Factor 12**: Upgraded Mongoose pre-save hook in [`backend/models/User.js`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/backend/models/User.js) to derive salts with cost factor 12 ($2^{12} = 4,096$ iterations).
- **Validation**: Strict validation rejects passwords under 8 characters or empty strings with `400 Bad Request`.
- **Confidentiality**: `select: false` ensures password hashes and TOTP keys are never sent over API payloads or printed in logs.
- **Legacy Migration**: Implemented transparent in-flight upgrade: if a legacy user with plaintext credentials logs in, the plaintext is validated and immediately upgraded to a Bcrypt work factor 12 hash without user interruption.
- **Automated Test**: `scripts/test_q2a_password.ps1` -> **13 Passed, 0 Failed**.

### Part (b): Multi-Factor Authentication (TOTP) & Role-Based Access Control (RBAC)
- **TOTP Standard**: Integrated `otplib` and `qrcode` to generate standard RFC 6238 time-based tokens compatible with Google Authenticator and Microsoft Authenticator.
- **AES-256-GCM Encryption**: TOTP shared secrets are encrypted at rest with unique IVs and authenticated tags via [`backend/utils/cryptoUtil.js`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/backend/utils/cryptoUtil.js).
- **MFA Challenge Flow**: Login for 2FA-enabled accounts returns a temporary `mfaChallengeToken`. Protected APIs reject challenge tokens with `401 Unauthorized` until the 6-digit TOTP code is verified.
- **RBAC Matrix**: Enforced least-privilege roles (`student`, `moderator`, `admin`) in [`backend/middleware/authMiddleware.js`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/backend/middleware/authMiddleware.js) and ownership checks in [`backend/controllers/itemController.js`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/backend/controllers/itemController.js).
- **Automated Test**: `scripts/test_q2b_security.ps1` -> **19 Passed, 0 Failed**.

### Part (c): Container Security Scanning with Aqua Security Trivy
- **Auditing**: Scanned baseline vs hardened Docker images using `aquasec/trivy:latest`.
- **Results**:
  - Baseline image: 2 CRITICAL, 36 HIGH (4 in Alpine OS). Ran as `root` (UID 0).
  - Hardened image: 1 CRITICAL, 31 HIGH (**0 in Alpine OS**). Ran as unprivileged `USER node` (UID 1000).
  - Remediated CVEs include CVE-2026-90711 (CRITICAL), CVE-2026-111181 (HIGH), CVE-2026-14456 (HIGH), and CVE-2026-45447 (HIGH).
- **Automated Script**: `scripts/scan_q2c_trivy.ps1`.

### Part (d): Threat Modeling & Data Protection Compliance
- **Threat Agent 1 (External Attacker)**: Targeted credential stuffing, DDoS, and container breakouts. Countered by Bcrypt work factor 12, TOTP MFA, Nginx rate limiting, and non-root execution.
- **Threat Agent 2 (Malicious Student / Insider)**: Targeted IDOR report tampering, privilege escalation, and PII scraping. Countered by Mongoose ownership verification, signed JWT roles, and `select: false`.
- **GDPR Compliance**: Evaluated against Articles 5 (Data minimization, purpose limitation, storage limitation), 25 (Privacy by Design), and 32 (Security of processing).
- **India's DPDP Act, 2023 Compliance**: Evaluated against Section 4/6 (Notice & Consent), Section 8 (Reasonable security safeguards & erasure upon resolution), and Sections 11/12 (Data Principal rights).

---

## 3. Demonstration & Grading Accounts

The following test accounts are pre-seeded in the database for evaluation:

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student.alice@campus.edu` | `StudentAlice12!` | Create, view, update own lost/found reports |
| **Moderator** | `moderator.carol@campus.edu` | `ModeratorCarol12!` | View all reports, review claims, update status |
| **Admin** | `admin.dave@campus.edu` | `AdminDave12!` | Full system control, delete any report, user directory |

---

## 4. Master Automated Verification Command

To run the complete automated test suite across all Question 2 deliverables in one command:

```powershell
powershell -File scripts\run_da3_q2_tests.ps1
```
