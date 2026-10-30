# LostLink — Viva & Final Evaluation Presentation Script (`presentation.md`)

**Project Title**: LostLink — Smart Campus Lost & Found Management System  
**Course**: Cloud Computing & Distributed Systems / Digital Assignment 3  
**Presenter**: Student Presentation Script for Evaluator ("Sir")  
**Target Duration**: 5 – 7 Minutes  
**Live Stack**: Docker Compose on `http://localhost:8080` | Frontend on `http://localhost:5173` / Vercel  

---

## ⏱️ Recommended Presentation Agenda (5–7 Minutes)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION FLOWCHART                           │
├─────────┬───────────────────────────────┬───────────────────────────────────┤
│ 1. 0:00 │ The Hook & Problem Statement  │ Why campus lost & found is broken │
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ 2. 1:00 │ Question 1: Cloud Scalability │ Nginx, 50k benchmark, failover    │
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ 3. 3:00 │ Live Website User Flow        │ Lost item report, image & claims  │
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ 4. 4:00 │ Question 2: Security & RBAC   │ Bcrypt 12, TOTP 2FA, Trivy scan   │
├─────────┼───────────────────────────────┼───────────────────────────────────┤
│ 5. 6:00 │ Regulations & Conclusion      │ GDPR, DPDP Act 2023 & Q&A Defense │
└─────────┴───────────────────────────────┴───────────────────────────────────┘
```

---

## 🎙️ Step-by-Step Spoken Script & Demonstration

---

### Step 1: Introduction & The Problem (0:00 – 1:00)

#### 🗣️ What to Say:
> *"Good morning / afternoon, Sir.*  
> *Today I am presenting **LostLink**, a production-grade, distributed web platform designed to solve a major everyday challenge across our campus: lost and found property recovery.*
>
> *Traditionally, students rely on cluttered WhatsApp groups or physical security desks where lost student IDs, laptops, wallets, and keys are rarely reunited with their rightful owners.*  
> *LostLink solves this with a centralized, secure, cloud-enabled web platform featuring real-time claims, photo verification, role-based access control, and high-concurrency scaling.*
>
> *For Digital Assignment 3, I have completely implemented both **Question 1: Scalability, Load Balancing & Cloud Bursting** and **Question 2: Enterprise Security Hardening**.*  
> *Allow me to demonstrate the architecture."*

---

### Step 2: Question 1 — Scalability & High Availability (1:00 – 3:00)

#### 🖥️ Action:
Open your PowerShell terminal and show the running Docker containers:
```powershell
docker compose ps
```

#### 🗣️ What to Say:
> *"Sir, to ensure LostLink can withstand traffic spikes during peak campus hours—such as semester move-out or final exams—the application does not run on a single server.*  
> *As you can see on screen, we have a multi-tier microservice architecture with **6 containers running** behind an **Nginx reverse proxy** exposed on host port `8080`.*
>
> *Our baseline traffic is handled by three Express backend instances: `lostlink-backend1`, `backend2`, and `backend3`, backed by an elastic cloud-burst instance and a containerized database.*

---

#### 2.1 Demonstrate Q1(a): Round-Robin Load Distribution

#### 🖥️ Action:
Execute the round-robin verification command:
```powershell
powershell -Command "
for ($i = 1; $i -le 6; $i++) {
    $res = Invoke-WebRequest -Uri 'http://localhost:8080/api/health' -UseBasicParsing
    Write-Host ('Request {0} -> Handled by: {1}' -f $i, $res.Headers['X-LostLink-Instance']) -ForegroundColor Cyan
}
"
```

#### 🗣️ What to Say:
> *"Here, Sir, as I fire HTTP requests at `http://localhost:8080/api/health`, each backend instance stamps an `X-LostLink-Instance` response header.*  
> *Notice how Nginx distributes the load in strict round-robin order: `backend1`, then `backend2`, then `backend3`, and repeats.*  
> *This ensures no single server becomes a bottleneck."*

---

#### 2.2 Demonstrate Q1(b): High-Concurrency Benchmarking (50,000 Requests)

#### 🗣️ What to Say:
> *"In Part 1(b), we benchmarked a single backend instance against our three load-balanced instances under **50,000 concurrent HTTP requests**.*  
> *The results were dramatic:*
> - *Throughput increased by **296%**—from ~160.75 requests per second on a single instance up to **636.57 requests per second** across the three instances.*
> - *Average response time dropped by **75.37%**—from 121 ms down to just **30 ms**.*
> *This empirically proves horizontal scalability."*

---

#### 2.3 Demonstrate Q1(c): Zero-Downtime Failover & Fault Tolerance

#### 🖥️ Action:
Run Option 3 in the interactive test suite:
```powershell
powershell -File scripts\run_da3_tests.ps1
# Select Option 3
```

#### 🗣️ What to Say:
> *"In Part 1(c), we tested fault tolerance. During an active stream of HTTP requests, the script forcefully terminates `lostlink-backend2` with `docker stop`.*  
> *Notice the result on the terminal: **0 failed requests / 100% success rate**.*  
> *Nginx automatically detected the dead node via passive health checks, removed it from the active upstream pool, and rerouted traffic seamlessly to `backend1` and `backend3` without dropping a single packet."*

---

#### 2.4 Explain Q1(d): Cloud Bursting & Edge Computing Architecture

#### 🖥️ Action:
Open [`docs/lostlink-assignment-3-q1d-architecture.mmd`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/docs/lostlink-assignment-3-q1d-architecture.mmd) or the generated diagram.

#### 🗣️ What to Say:
> *"For Part 1(d), we designed a hybrid Cloud Bursting and Edge/Fog architecture.*  
> *Static assets and uploaded photos are served from edge CDNs via Cloudinary.*  
> *When local campus server load exceeds 80% CPU or 500 requests/sec, Nginx dynamically bursts excess traffic to `lostlink-backend-burst`.*  
> *Both pools synchronize state against our MongoDB Atlas multi-region cloud database with automated failover."*

---

### Step 3: Question 2 — Enterprise Security Hardening (3:00 – 5:30)

#### 🗣️ What to Say:
> *"Now turning to **Question 2 (Secure Your Application)**, we implemented defense-in-depth across credentials, authentication, container runtime, and regulatory compliance."*

---

#### 3.1 Demonstrate Q2(a): Bcrypt Password Security (Work Factor 12) & Legacy Migration

#### 🖥️ Action:
Run the automated password test:
```powershell
powershell -File scripts\test_q2a_password.ps1
```

#### 🗣️ What to Say:
> *"In Part 2(a), we implemented **Bcrypt Work Factor 12** ($2^{12} = 4,096$ iterations), exceeding standard 10-round requirements to defend against GPU-accelerated hash cracking.*  
> *We enforce a strict minimum 8-character policy and protect hashes using Mongoose `select: false`.*
>
> *Most importantly, we implemented **Transparent Legacy Migration**.*  
> *If an existing legacy database user with an unhashed plaintext password logs in, our custom `matchPassword()` method validates the password and immediately upgrades the record to a Bcrypt work factor 12 hash on the fly without interrupting the user or forcing a reset."*

---

#### 3.2 Demonstrate Q2(b): TOTP Two-Factor Authentication & RBAC

#### 🖥️ Action:
Run the automated MFA & RBAC test suite:
```powershell
powershell -File scripts\test_q2b_security.ps1
```

#### 🗣️ What to Say:
> *"In Part 2(b), we implemented **Time-Based One-Time Password (TOTP) MFA** adhering to RFC 6238, fully compatible with Google Authenticator and Microsoft Authenticator.*  
> *To adhere to NIST guidelines, TOTP shared secrets are **encrypted at rest using AES-256-GCM** with unique initialization vectors.*
>
> *Furthermore, we implemented a 3-tier Role-Based Access Control matrix:*
> - *Students can only modify or delete their own items.*
> - *Moderators can review claims and update status.*
> - *Admins have full administrative rights.*
> *As shown in our live test terminal: when Student Bob tries to tamper with Student Alice's lost item, the API immediately rejects the request with **403 Forbidden**."*

---

#### 3.3 Demonstrate Q2(c): Container Vulnerability Scanning with Trivy

#### 🖥️ Action:
Run the automated Trivy scan comparison:
```powershell
powershell -File scripts\scan_q2c_trivy.ps1
```

#### 🗣️ What to Say:
> *"For Part 2(c), we audited our container image using **Aqua Security Trivy**.*  
> *We then engineered a hardened multi-stage Dockerfile:*
> 1. *We added automated Alpine OS security upgrades (`apk upgrade --no-cache`).*
> 2. *We dropped `root` privileges: the container runs strictly as unprivileged `USER node` (UID 1000).*
> 3. *We purged npm caches and removed development tooling.*
>
> *As the comparative table on screen demonstrates: **we reduced Alpine OS CVEs by 100%—bringing OS package vulnerabilities down to exactly zero**.*  
> *Critical vulnerabilities like CVE-2026-90711 in `proxy-addr` and CVE-2026-111181 in `body-parser` were completely remediated."*

---

#### 3.4 Explain Q2(d): Threat Modeling & Data Protection (GDPR & DPDP Act 2023)

#### 🗣️ What to Say:
> *"Finally, in Part 2(d), we conducted formal threat modeling and legal compliance analysis:*
> - *We modeled **Threat Agent 1 (External Attacker)** attempting credential stuffing and DDoS, mitigated by rate limiting, Bcrypt cost 12, TOTP 2FA, and non-root Docker execution.*
> - *We modeled **Threat Agent 2 (Malicious Student)** attempting IDOR property tampering and phone number scraping, mitigated by Mongoose ownership verification and RBAC.*
>
> *In terms of legal compliance:*
> - *Under **GDPR (Articles 5, 25, 32)**, we implement Privacy by Design, data minimization, and AES-256 encryption at rest.*
> - *Under India's **Digital Personal Data Protection Act, 2023 (DPDP Act)**, we fulfill Section 4/6 (Notice & Consent), Section 8 (Security safeguards & prompt erasure once property is returned), and Section 11/12 (Student rights to access and delete personal records)."*

---

### Step 4: Master Verification & Conclusion (5:30 – 6:30)

#### 🖥️ Action:
Run the master test runner to show everything green in one terminal:
```powershell
powershell -File scripts\run_da3_q2_tests.ps1
```

#### 🗣️ What to Say:
> *"To conclude, Sir, here is our master verification runner `run_da3_q2_tests.ps1`.*  
> *Every single test across Bcrypt hashing, TOTP 2FA, RBAC permissions, and Docker Trivy auditing passes with 100% success.*
>
> *All deliverables, scripts, and comprehensive markdown reports are documented and committed in the repository.*  
> *Thank you, Sir. I am now ready for your questions."*

---

## 🛡️ Anticipated Professor Questions & Exact Answers (Q&A Defense)

### Q1: *"Why did you use Bcrypt work factor 12 instead of the default 10?"*
> **Answer**: *"Sir, each increment in work factor doubles the computational effort required ($2^{12} = 4,096$ rounds vs $2^{10} = 1,024$ rounds). With modern GPU clusters capable of billions of hash evaluations per second, cost factor 10 is increasingly vulnerable to offline brute-force attacks. Cost factor 12 provides a ~250 ms calculation window on our backend, which is imperceptible to a human student during login, but exponentially increases the cost of an attack to infeasible levels."*

---

### Q2: *"How do you protect TOTP shared secrets from being leaked if the database is breached?"*
> **Answer**: *"Sir, TOTP shared secrets are never stored in plaintext. In `backend/utils/cryptoUtil.js`, we use **AES-256-GCM** authenticated encryption. Each secret is encrypted using a unique 16-byte initialization vector (IV) and generates an authentication tag that prevents tampering. Even if an adversary gains direct access to MongoDB, the secrets cannot be used without the encryption key stored securely in environment variables."*

---

### Q3: *"How does your system prevent Student A from deleting Student B's lost iPhone report?"*
> **Answer**: *"Sir, we enforce object-level authorization in `backend/controllers/itemController.js`. Before executing any `PUT` or `DELETE` operation, the controller compares the item's `reportedBy` foreign key against the authenticated user's ID extracted from the cryptographically verified JWT (`req.user._id`). If they do not match, and the user is not an administrator, the API immediately aborts and returns `403 Forbidden`."*

---

### Q4: *"Why is running a container as `USER node` instead of `root` important?"*
> **Answer**: *"Sir, by default, Docker containers execute processes as the `root` user (UID 0). If an unpatched remote code execution vulnerability is exploited inside the Node.js process, an attacker inherits root capabilities and can potentially break out to the host system. By declaring `USER node` (UID 1000) in our multi-stage Dockerfile, we enforce the principle of least privilege: the process cannot write to system directories, mount devices, or escape into the host kernel."*

---

### Q5: *"How does LostLink comply with India's DPDP Act, 2023 regarding student privacy?"*
> **Answer**: *"Sir, under Section 8(7) of the DPDP Act, a Data Fiduciary must erase personal data once the specified purpose is fulfilled. When a lost item is returned and marked `resolved`, our API allows the owner or administrator to permanently delete the listing and its associated claims. Additionally, students can exercise their Section 11/12 rights to view, correct, or erase their contact details at any time."*
