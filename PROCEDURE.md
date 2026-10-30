# LostLink — Complete Digital Assignment 3 Presentation & Demonstration Guide (PROCEDURE.md)

**Project**: LostLink (Smart Campus Lost & Found Management System)  
**Course**: Cloud Computing & Distributed Systems / Digital Assignment 3  
**Coverage**: Complete Walkthrough for **Question 1 (10 Marks)** and **Question 2 (5 Marks)**  
**Target Environment**: Load-Balanced Docker Stack at `http://localhost:8080`  

---

## 📋 Table of Contents

1. [Quick Start & Environment Verification](#1-quick-start--environment-verification)
2. [Demonstration Walkthrough: Question 1 — Scalability & High Availability (10 Marks)](#2-demonstration-walkthrough-question-1--scalability--high-availability)
   - [Q1(a): Round-Robin Load Balancing](#q1a-round-robin-load-balancing)
   - [Q1(b): High-Concurrency Benchmarking (50,000 Requests)](#q1b-high-concurrency-benchmarking)
   - [Q1(c): Zero-Downtime Failover & Fault Tolerance](#q1c-zero-downtime-failover)
   - [Q1(d): Cloud Bursting Architecture Diagram & Edge Computing](#q1d-cloud-bursting-architecture)
3. [Demonstration Walkthrough: Question 2 — Secure Your Application (5 Marks)](#3-demonstration-walkthrough-question-2--secure-your-application)
   - [Q2(a): Bcrypt Password Security (Work Factor 12) & Legacy Migration](#q2a-bcrypt-password-security)
   - [Q2(b): TOTP Two-Factor Authentication & Role-Based Access Control](#q2b-totp-mfa--rbac)
   - [Q2(c): Docker Security Auditing with Aqua Security Trivy](#q2c-docker-security-trivy)
   - [Q2(d): Threat Modeling & Data Protection Compliance (GDPR & DPDP Act)](#q2d-threat-modeling--regulations)
4. [Master Verification Scripts Cheatsheet](#4-master-verification-scripts-cheatsheet)
5. [Pre-Configured Demo Accounts for Evaluators](#5-pre-configured-demo-accounts)
6. [Complete Screenshot Checklist for Lab Record / Report](#6-complete-screenshot-checklist)

---

## 1. Quick Start & Environment Verification

Before presenting or taking screenshots, ensure the Docker stack is active and healthy.

### Command to Start the Full Application Stack

Open PowerShell in the repository root (`LostLink`):

```powershell
docker compose up -d
```

### Verify Container Status

```powershell
docker compose ps
```

You should see 6 containers running and healthy:
1. `lostlink-nginx` (`0.0.0.0:8080->80/tcp`) — Nginx reverse proxy load balancer.
2. `lostlink-backend1` (`5000/tcp`) — Primary Node.js Express backend #1.
3. `lostlink-backend2` (`5000/tcp`) — Primary Node.js Express backend #2.
4. `lostlink-backend3` (`5000/tcp`) — Primary Node.js Express backend #3.
5. `lostlink-backend-burst` (`5000/tcp`) — Elastic Cloud Bursting backend.
6. `lostlink-mongo` (`27017/tcp`) — High-availability containerized database.

### Test Health Endpoint via Nginx

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/health"
```

Expected output:
```json
{
  "success": true,
  "service": "LostLink Campus API",
  "status": "Healthy & Operational"
}
```

---

## 2. Demonstration Walkthrough: Question 1 — Scalability & High Availability

---

### Q1(a): Round-Robin Load Balancing

#### What to Explain:
- Explain that traffic enters through **Nginx on port 8080**, which distributes incoming HTTP requests across three stateless backend instances (`backend1`, `backend2`, `backend3`) in strict round-robin order.
- Each backend instance injects a custom HTTP response header `X-LostLink-Instance` identifying which replica served the request.

#### How to Demonstrate:
Run the automated Part (a) test in PowerShell:

```powershell
powershell -Command "
$counts = @{}
for ($i = 1; $i -le 15; $i++) {
    $res = Invoke-WebRequest -Uri 'http://localhost:8080/api/health' -UseBasicParsing
    $inst = $res.Headers['X-LostLink-Instance']
    $counts[$inst] = [int]$counts[$inst] + 1
    Write-Host ('Request {0:D2} -> Handled by: {1}' -f $i, $inst) -ForegroundColor Cyan
}
Write-Host '`nDistribution Summary:' -ForegroundColor Green
$counts.GetEnumerator() | ForEach-Object { Write-Host ('  {0}: {1} requests' -f $_.Key, $_.Value) }
"
```

#### What to Show the Evaluator:
- The requests cycling cleanly: `backend1` -> `backend2` -> `backend3` -> `backend1`...
- Equal request distribution (33.3% per instance).

---

### Q1(b): High-Concurrency Benchmarking

#### What to Explain:
- Benchmarking evaluates horizontal scaling performance comparing **1 single backend instance** against **3 load-balanced instances** behind Nginx.
- LostLink was rigorously tested with **50,000 HTTP requests** at a concurrency level of 50.
- Key Results:
  - Throughput increased by **~296%** (from ~160.75 req/s to ~636.57 req/s).
  - Average latency decreased by **~75.37%** (from 121.86 ms down to 30.01 ms).

#### How to Demonstrate:
Run the interactive test suite and choose Option 2:

```powershell
powershell -File scripts\run_da3_tests.ps1
```
*(Select Option `2`, and enter `500` or `1000` for a quick live demo, or reference the 50,000-request report in `docs/assignment-3-q1-report.md`)*.

---

### Q1(c): Zero-Downtime Failover & Fault Tolerance

#### What to Explain:
- High availability ensures that if one backend node crashes during active request processing, Nginx detects the failure immediately, removes the dead node from the active upstream pool, and retries the request against a surviving replica.
- Zero requests are dropped or failed (`0 failures / 100% success rate`).

#### How to Demonstrate:
Run Option 3 in the test suite:

```powershell
powershell -File scripts\run_da3_tests.ps1
# Select Option 3
```

#### What Happens in the Live Test:
1. The script launches a continuous stream of requests against `http://localhost:8080/api/health`.
2. Halfway through the test, `docker stop lostlink-backend2` forcefully kills instance 2.
3. Requests seamlessly shift to `backend1` and `backend3`.
4. Final tally shows: **0 failed requests**, proving full fault tolerance.
5. The script automatically restarts `backend2` after the test finishes.

---

### Q1(d): Cloud Bursting Architecture Diagram & Edge Computing

#### What to Explain:
- Walk the evaluator through the architecture diagram in [`docs/lostlink-assignment-3-q1d-architecture.mmd`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/docs/lostlink-assignment-3-q1d-architecture.mmd) and [`docs/assignment-3-q1d-cloud-bursting-architecture.md`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/docs/assignment-3-q1d-cloud-bursting-architecture.md).
- Explain the **Cloud Bursting Topology**:
  - **Tier 1 (Edge & Baseline)**: Campus Users -> Nginx Gateway (Port 8080) -> Baseline pool (`backend1`, `backend2`, `backend3`).
  - **Tier 2 (Cloud Bursting Pool)**: During campus peak hours (exam week, semester move-out), when request volume surges above 80% capacity, traffic dynamically bursts into `backend-burst`.
  - **Tier 3 (Edge Storage & CDN)**: Static assets & images delivered via Cloudinary Edge CDN.
  - **Tier 4 (Multi-AZ Database)**: Primary MongoDB Atlas multi-region cluster with automated failover.

#### How to Demonstrate:
Show the Cloud Bursting test using Option 4 in `run_da3_tests.ps1`:

```powershell
powershell -File scripts\run_da3_tests.ps1
# Select Option 4
```

---

## 3. Demonstration Walkthrough: Question 2 — Secure Your Application

---

### Q2(a): Bcrypt Password Security (Work Factor 12) & Legacy Migration

#### What to Explain:
1. **Work Factor 12**: Passwords are encrypted using `bcryptjs` with **12 salt rounds** ($2^{12} = 4,096$ iterations), exceeding basic 10-round requirements.
2. **Policy Enforcement**: Passwords must be at least 8 characters and non-empty (returns `400 Bad Request`).
3. **No Credential Leakage**: `select: false` guarantees password hashes and TOTP keys are stripped from all API outputs and logs.
4. **Transparent Legacy Plaintext Migration**: If a legacy user account with an unhashed password logs in, the system validates the plaintext and instantly migrates the record to a Bcrypt work factor 12 hash without forcing a password reset.

#### How to Demonstrate:
Run the automated Part (a) security test:

```powershell
powershell -File scripts\test_q2a_password.ps1
```

#### What to Point Out in the Output:
- Verification of prefix `$2b$12$` and cost `12`.
- The legacy plaintext migration test passing with 100% success.
- Clean summary: `13 Passed, 0 Failed`.

---

### Q2(b): TOTP Two-Factor Authentication & Role-Based Access Control

#### What to Explain:
1. **RFC 6238 TOTP Standard**: Compatible with Google Authenticator, Microsoft Authenticator, and Authy.
2. **Encrypted at Rest (AES-256-GCM)**: Shared TOTP base32 secrets are never stored in plaintext in the database. They are encrypted at rest using AES-256-GCM with unique 16-byte initialization vectors and auth tags.
3. **MFA Challenge Flow**: Login returns `mfaRequired: true` and a temporary challenge token (`mfaChallengeToken`). The auth middleware strictly blocks challenge tokens from accessing protected application endpoints (returns `401 Unauthorized`) until the 6-digit TOTP code is verified.
4. **Three-Tier RBAC & Ownership**:
   - `student`: Can only view items and modify/delete their own reported property.
   - `moderator`: Can update status and review claims on all items, but cannot delete items or access admin tools.
   - `admin`: Has full override capabilities (can delete any item and manage user roles).
   - Any attempt by Student Bob to modify Student Alice's report returns `403 Forbidden`.

#### How to Demonstrate:
Run the automated Part (b) security test:

```powershell
powershell -File scripts\test_q2b_security.ps1
```

#### What to Point Out in the Output:
- QR code generation and enrollment.
- 401 response when attempting to use a challenge token on protected endpoints.
- 403 Forbidden response when Student Bob tries to tamper with Student Alice's item.
- 200 OK when Alice updates her own item.
- 200 OK when Admin deletes Alice's item as an administrative override.
- Clean summary: `19 Passed, 0 Failed`.

---

### Q2(c): Docker Security Auditing with Aqua Security Trivy

#### What to Explain:
- Show that container images were audited using the industry-standard scanner **Aqua Security Trivy** (`aquasec/trivy:latest`).
- Explain the hardening implemented in `backend/Dockerfile`:
  1. Multi-stage build separating dependencies from the release stage.
  2. Automatic OS patch upgrade (`apk update && apk upgrade --no-cache`).
  3. Dropping `root` privileges: Container runs as unprivileged `USER node` (UID 1000).
  4. Pruning production dependencies and cleaning npm caches.
- **Real Authentic Scan Numbers**:
  - Baseline: 2 CRITICAL, 36 HIGH, 4 Alpine OS CVEs, running as `root`.
  - Hardened: 1 CRITICAL, 31 HIGH, **0 Alpine OS CVEs (100% resolved)**, running as `node`.

#### How to Demonstrate:
Run the automated Trivy comparison script:

```powershell
powershell -File scripts\scan_q2c_trivy.ps1
```

#### What to Show the Evaluator:
Show the comparative analysis table printed directly in the terminal:
```text
Metric / Vulnerability Level        | Baseline Image  | Hardened Image  | Delta       
-------------------------------------------------------------------------------------
CRITICAL Vulnerabilities            |        2        |        1        |      -1     
HIGH Vulnerabilities                |       36        |       31        |      -5     
OS Package CVEs (Alpine)            |        4        |        0        |      -4     
Application Package CVEs (Node)     |       34        |       48        |      14     
Container User Privilege            |  root (UID 0)   | node (UID 1000) | Least-Priv  
Multi-Stage Layering                |   No (Single)   | Yes (2 Stages)  |  Optimized  
-------------------------------------------------------------------------------------
```

---

### Q2(d): Threat Modeling & Data Protection Compliance

#### What to Explain:
- **Threat Agent 1 (External Attacker)**: Mitigated by Nginx rate limiting, Bcrypt work factor 12, TOTP 2FA, and non-root Docker execution.
- **Threat Agent 2 (Malicious Student / Insider)**: Mitigated by Mongoose object ownership verification, signed JWT roles, and `select: false`.
- **GDPR Compliance**: Evaluated against Articles 5 (Data minimisation, storage limitation), 25 (Privacy by Design), and 32 (Security of processing).
- **India's DPDP Act, 2023**: Evaluated against Section 4/6 (Notice & Consent), Section 8 (Reasonable security safeguards & erasure upon property return), and Sections 11/12 (Rights of Data Principals to access and erase personal records).
- Refer to [`docs/assignment-3-q2d-threat-model-and-regulations.md`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/docs/assignment-3-q2d-threat-model-and-regulations.md).

---

## 4. Master Verification Scripts Cheatsheet

| Purpose | Command | Expected Result |
| :--- | :--- | :--- |
| **Run All Q2 Security Tests** | `powershell -File scripts\run_da3_q2_tests.ps1` | **ALL QUESTION 2 SECURITY TESTS PASSED (100% OK)** |
| **Run Q2(a) Password Suite** | `powershell -File scripts\test_q2a_password.ps1` | `13 Passed, 0 Failed` |
| **Run Q2(b) MFA & RBAC Suite**| `powershell -File scripts\test_q2b_security.ps1` | `19 Passed, 0 Failed` |
| **Run Q2(c) Trivy Scan Suite** | `powershell -File scripts\scan_q2c_trivy.ps1` | Comparison table printed |
| **Run Q1 Load & Failover** | `powershell -File scripts\run_da3_tests.ps1` | Interactive test menu |

---

## 5. Pre-Configured Demo Accounts

For manual evaluation or Postman / Swagger testing:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Student** | `student.alice@campus.edu` | `StudentAlice12!` | Manage own lost/found reports |
| **Moderator** | `moderator.carol@campus.edu` | `ModeratorCarol12!` | Review claims, update item status |
| **Admin** | `admin.dave@campus.edu` | `AdminDave12!` | Full access, delete any report, user directory |

---

## 6. Complete Screenshot Checklist for Lab Record / Report

Capture and include the following screenshots in your final submission document:

### Question 1 Screenshots:
1. `docker compose ps` showing 6 healthy running containers (`lostlink-nginx`, 3 backends, burst backend, mongo).
2. Terminal output of `Q1(a)` showing the 15-request round-robin distribution cycling across `backend1`, `backend2`, and `backend3`.
3. Terminal output of `Q1(b)` benchmarking comparison (1 instance vs 3 instances throughput and response time).
4. Terminal output of `Q1(c)` failover test showing zero dropped requests while one container is killed.
5. Mermaid architecture diagram rendered from `docs/lostlink-assignment-3-q1d-architecture.mmd`.

### Question 2 Screenshots:
6. Terminal output of `powershell -File scripts\test_q2a_password.ps1` showing 13 passed tests and Bcrypt work factor 12.
7. Terminal output of `powershell -File scripts\test_q2b_security.ps1` showing 19 passed tests (TOTP QR code generation, 401 challenge token block, 403 non-owner block).
8. Mobile Authenticator App screenshot showing "LostLink Campus" with the 6-digit rolling code (or the base64 QR code output from `/api/auth/mfa/setup`).
9. Terminal output of `powershell -File scripts\scan_q2c_trivy.ps1` showing the Trivy vulnerability comparison table (0 Alpine OS CVEs).
10. Terminal output of `powershell -File scripts\run_da3_q2_tests.ps1` showing the master test suite passing with 100% success.
