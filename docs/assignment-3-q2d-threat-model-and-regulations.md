# Assignment 3 – Question 2 Part (d): Threat Modeling & Data Protection Compliance

**Application**: LostLink (Smart Campus Lost & Found Management System)  
**Scope**: Threat Agent Analysis, Attack Surface Defense, GDPR & DPDP Act 2023 Evaluation  
**Date**: October 2026  

---

## 1. Threat Modeling: Threat Agents & Countermeasures

Threat modeling systematically identifies adversarial capabilities and aligns targeted security controls with real-world risks.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          LOSTLINK THREAT MODEL OVERVIEW                         │
└─────────────────────────────────────────────────────────────────────────────────┘
           │                                                    │
   [ Threat Agent 1 ]                                   [ Threat Agent 2 ]
External Unauthenticated Attacker                   Authenticated Malicious Student / Insider
   - Credential stuffing / brute force                 - Unauthorized item tampering (IDOR)
   - API scraping & denial of service                  - Privilege escalation to Admin
   - Container breakout / OS exploit                   - PII harvesting of claimant phone numbers
           │                                                    │
           ▼                                                    ▼
   [ DEFENSIVE CONTROLS ]                              [ DEFENSIVE CONTROLS ]
   • Nginx Reverse Proxy Rate Limiter                  • RBAC Middleware (`authorizeRoles`)
   • Bcrypt Cost Factor 12 Key Derivation              • Object-Level Ownership Checks (`item.reportedBy`)
   • RFC 6238 TOTP Two-Factor Authentication           • Cryptographic JWT signing with HMAC-SHA256
   • Non-root Docker execution (`USER node`)           • AES-256-GCM Encryption of Secrets at Rest
```

### 1.1 Threat Agent 1: External Unauthenticated Attacker

- **Motivation & Profile**: Opportunistic cybercriminals, script kiddies, or botnets seeking unauthorized access to student databases, credential lists, or disrupting campus operations during peak exam/move-out periods.
- **Attack Vectors**:
  1. *Credential Stuffing & Password Spraying*: Testing breached password lists against `/api/auth/login`.
  2. *API Exploitation & Scraping*: Harvesting item photos, student email addresses, and location traces.
  3. *Denial of Service (DoS)*: Flooding HTTP request handlers to exhaust Node.js event-loop workers.
  4. *Container Exploitation*: Targeting known CVEs in Alpine libraries or NPM packages to escape the container.
- **Implemented Controls in LostLink**:
  - **Bcrypt Work Factor 12**: Requires 4,096 cryptographic hashing iterations, making offline hash cracking via GPU clusters mathematically and financially infeasible.
  - **TOTP Two-Factor Authentication**: Even if an attacker obtains a valid password through phishing or credential stuffing, login is halted by the mandatory 6-digit TOTP challenge (`/api/auth/mfa/login-verify`).
  - **Reverse Proxy Filtering & Rate Limiting**: Nginx buffers client connections and drops malicious HTTP floods before reaching Node.js instances.
  - **Hardened Multi-Stage Container**: Running as unprivileged `USER node` (UID 1000) prevents root-level container escapes; Trivy auditing resolved 100% of Alpine OS CVEs.

---

### 1.2 Threat Agent 2: Authenticated Malicious Student or Campus Insider

- **Motivation & Profile**: A registered student who legitimately logs into the platform but attempts to steal found items, fraudulently approve claims, sabotage another student's report, or access administrator directories.
- **Attack Vectors**:
  1. *Insecure Direct Object References (IDOR)*: Changing URL parameters (e.g. `PUT /api/items/:id` or `DELETE /api/items/:id`) to modify or delete another student's lost MacBook report.
  2. *Vertical Privilege Escalation*: Invoking admin management endpoints (e.g., `GET /api/auth/admin/users`) to inspect other users' personal records or elevate their role.
  3. *Claim Fraud*: Submitting fraudulent claims and using insider access to mark them as "approved".
- **Implemented Controls in LostLink**:
  - **Granular Ownership Enforcement**: Every item modification endpoint verifies that `item.reportedBy.toString() === req.user._id.toString()`. Unauthorized requests are blocked with `403 Forbidden`.
  - **Role-Based Access Control (RBAC)**: The `authorizeRoles('admin')` middleware blocks regular students and moderators from administrative APIs, verifying cryptographic claims encoded inside the signed JWT.
  - **Data Minimization on Read**: Sensitive fields like `password`, `mfaSecret`, and `mfaTempSecret` are tagged `select: false` in Mongoose, ensuring authenticated users cannot view cryptographic materials under any circumstances.

---

## 2. Regulatory Compliance: GDPR & India's DPDP Act, 2023

Campus lost & found applications handle sensitive Personal Identifiable Information (PII), including student names, institutional emails, personal phone numbers, departments, academic years, and photographs of personal belongings (wallets, driver's licenses, student ID cards).

### 2.1 General Data Protection Regulation (GDPR) Evaluation

| GDPR Article | Core Regulatory Mandate | LostLink Technical & Architectural Implementation |
| :--- | :--- | :--- |
| **Article 5(1)(a)** *Lawfulness & Transparency* | Personal data must be processed lawfully, fairly, and transparently. | Clear purpose specification: user data is collected strictly for property identification, return coordination, and claim dispute resolution. |
| **Article 5(1)(c)** *Data Minimisation* | Data collected must be adequate, relevant, and limited to what is necessary. | Registration collects only operational attributes (name, email, phone, department, year). Financial or sensitive biometric data is never solicited. |
| **Article 5(1)(e)** *Storage Limitation* | Data must be kept in an identifiable form for no longer than necessary. | Items marked as `resolved` or `claimed` can be permanently purged along with all associated claim records using `DELETE /api/items/:id`. |
| **Article 25** *Data Protection by Design & Default* | Security measures must be embedded into the system architecture from inception. | `select: false` prevents default leakage of credentials; TOTP secrets are encrypted with AES-256-GCM before database write; passwords hashed with work factor 12. |
| **Article 32** *Security of Processing* | Implementation of appropriate technical and organizational security measures. | End-to-end TLS encryption in transit; AES-256-GCM encryption at rest; least-privilege RBAC; container hardening with automated Trivy CVE scans. |

---

### 2.2 India's Digital Personal Data Protection Act, 2023 (DPDP Act)

| DPDP Act Provision | Statutory Requirement | Application in LostLink |
| :--- | :--- | :--- |
| **Section 4 & 6** *(Notice & Consent)* | Data Fiduciary must give clear notice accompanied by a request for consent before collecting personal data. | LostLink requires student consent during registration and item reporting. Clear UI notices inform students that contact details will only be visible to verified claimants/owners. |
| **Section 8(4)** *(Data Security Safeguards)* | Obligation on Data Fiduciary to implement reasonable security safeguards to prevent personal data breaches. | Multi-tier defense: Nginx load balancer filtering, non-root Docker execution, bcrypt work factor 12, TOTP multi-factor authentication, and AES-256-GCM encryption. |
| **Section 8(7)** *(Erasure of Personal Data)* | Fiduciary must erase personal data as soon as the purpose for which it was collected is no longer being served. | When a lost item is successfully returned and marked `resolved`, the owner or administrator can delete the item report and its associated claim history, completely wiping the data from MongoDB. |
| **Section 11 & 12** *(Rights of Data Principal)* | Data Principals (students) have the right to access summaries, seek correction, and request erasure of their personal data. | - **Access**: `GET /api/auth/me` and `GET /api/items?reportedBy=<id>` provide complete visibility into all personal data held.<br/>- **Correction**: `PUT /api/auth/profile` and `PUT /api/items/:id` enable real-time profile and report corrections.<br/>- **Erasure**: `DELETE /api/items/:id` gives users the right to delete their listings. |
| **Section 9** *(Processing of Children's Data)* | Heightened obligations if data principals include minors under 18 years of age. | First-year university students under 18 have their personal phone numbers hidden by default until a verified student identity match is established. |
