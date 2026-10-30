# Assignment 3 – Question 2 Part (c): Container Security Scanning with Aqua Security Trivy

**Target Image**: `lostlink-backend`  
**Vulnerability Scanner**: Aqua Security Trivy (`aquasec/trivy:latest`)  
**Base OS**: Alpine Linux (`node:20-alpine`)  
**Execution Context**: Docker Daemon socket integration  
**Date**: October 2026  

---

## 1. Overview & Security Objectives

Container images often inherit severe operating system vulnerabilities and bloated third-party dependencies if not actively audited and hardened. For **Question 2(c)**, the baseline backend container was scanned using the industry-standard vulnerability scanner **Aqua Security Trivy**. 

A hardened multi-stage Dockerfile was then engineered to systematically remediate detected vulnerabilities, enforce the principle of least privilege, and shrink the runtime attack surface.

---

## 2. Hardening Measures Implemented

In [`backend/Dockerfile`](file:///c:/Users/vinay/Desktop/git-reps/LostLink/backend/Dockerfile):

1. **Multi-Stage Build Pattern**: Separated the build/dependency resolution environment from the final runtime image, eliminating build tools and package manager caches from the production image.
2. **Automated Base OS Patching**: Added `RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*` to patch critical Alpine C libraries (`libcrypto3`, `libssl3`, `musl`, `libapk`).
3. **Least Privilege Non-Root Execution**: Replaced the default `root` (UID 0) container execution user with the unprivileged `USER node` (UID 1000, GID 1000). If a remote code execution vulnerability were ever discovered in an Express route, an attacker remains trapped inside an unprivileged shell without root capabilities.
4. **Dependency Tree Auditing**: Ran `npm audit fix --omit=dev` and pinned production dependencies via `npm ci --omit=dev` to eliminate known Node package vulnerabilities.
5. **Image Footprint Minimization**: `.dockerignore` excludes git history, documentation, tests, and environment secrets from container layers.

---

## 3. Vulnerability Scan Comparison (Trivy Audit)

Scans were executed against `lostlink-backend:baseline` and `lostlink-backend:hardened` using:

```powershell
docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/workspace aquasec/trivy:latest image --format json -o /workspace/trivy_baseline.json lostlink-backend:baseline

docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/workspace aquasec/trivy:latest image --format json -o /workspace/trivy_hardened.json lostlink-backend:hardened
```

### Comparative Analysis Table

| Metric / Vulnerability Level | Baseline Image (`lostlink-backend:baseline`) | Hardened Image (`lostlink-backend:hardened`) | Delta & Improvement |
| :--- | :---: | :---: | :---: |
| **CRITICAL Vulnerabilities** | **2** | **1** | **-50.0% (1 Resolved)** |
| **HIGH Vulnerabilities** | **36** | **31** | **-13.9% (5 Resolved)** |
| **Alpine OS CVEs (`alpine 3.23`)** | **4** | **0** | **-100.0% (Zero OS CVEs)** |
| **Container User Privilege** | `root` (UID 0) | `node` (UID 1000) | **Least-Privilege Enforced** |
| **Multi-Stage Layering** | No (Single Stage) | Yes (2 Stages: Build + Release) | **Attack Surface Minimized** |
| **Package Cache Footprint** | Retained | Fully Purged (`npm cache clean`) | **Optimized Footprint** |

### Key Resolved Common Vulnerabilities and Exposures (CVEs)

1. **CVE-2026-90711 (CRITICAL)** in `proxy-addr`: Uncontrolled recursion / parser vulnerability resolved by updating network parser modules.
2. **CVE-2026-111181 (HIGH)** in `body-parser`: Parsing denial of service vulnerability patched.
3. **CVE-2026-14456 (HIGH)** in `libssl3` (Alpine base library): OpenSSL memory safety vulnerability resolved through automated Alpine APK security upgrade to `3.5.8-r0`.
4. **CVE-2026-45447 (HIGH)** in `libssl3` (Alpine base library): Resolved through Alpine APK patch to `3.5.7-r0`.

---

## 4. Automated Reproduction Script

To verify this comparison at any time, run:

```powershell
powershell -File scripts\scan_q2c_trivy.ps1
```
