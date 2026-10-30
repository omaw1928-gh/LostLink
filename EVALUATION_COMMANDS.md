# LostLink — 8-Step Evaluator Commands (Exact Match)

Here are the exact 8 presentation commands formatted specifically for your **LostLink** project, matching your evaluator's structure line-for-line.

Run these directly in **PowerShell**:

---

### # 1. Show Running Containers (Q1a)
```powershell
docker ps
```

---

### # 2. Show Round-Robin Distribution (Q1a)
```powershell
for ($i=1; $i -le 6; $i++) { (Invoke-RestMethod "http://localhost:8080/api/health").instanceId }
```

---

### # 3. 1-Instance Benchmark (Q1b)
```powershell
docker stop lostlink-backend2 lostlink-backend3 lostlink-backend-burst
node scripts/load_test.js --url=http://localhost:8080/api/health --requests=1000 --concurrency=20
```

---

### # 4. 3-Instance Benchmark (Q1b)
```powershell
docker start lostlink-backend2 lostlink-backend3 lostlink-backend-burst
Start-Sleep -Seconds 3
node scripts/load_test.js --url=http://localhost:8080/api/health --requests=1000 --concurrency=20
```

---

### # 5. Zero-Downtime Failover Test (Q1c)
```powershell
$job = Start-Job -ScriptBlock { Set-Location C:\Users\vinay\Desktop\git-reps\LostLink; node scripts/load_test.js --url=http://localhost:8080/api/health --requests=1000 --concurrency=20 }
Start-Sleep -Milliseconds 300
docker stop lostlink-backend2
Receive-Job $job -Wait
Remove-Job $job -Force
docker start lostlink-backend2
```

---

### # 6. Database Password bcrypt Table (Q2a)
```powershell
(Invoke-RestMethod "http://localhost:8080/api/security/password-comparison").demonstrationData | Format-Table -AutoSize
```

---

### # 7. TOTP MFA & RBAC 401/403/200 Rejection Proofs (Q2b)
```powershell
node scripts/test_security.js
```

---

### # 8. Trivy Scan Comparison Table (Q2c)
```powershell
python scripts/compare_trivy.py
```
*(Or run `powershell -File scripts/scan_q2c_trivy.ps1`)*
