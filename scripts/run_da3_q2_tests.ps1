# ==============================================================================
#  LostLink - Assignment 3 Question 2: Master Automated Security Test Suite
#  Executes all automated security tests for Parts (a), (b), and (c)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "      LostLink DA3 Question 2: Master Security Test Suite       " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Target Environment: Load-balanced Docker Compose on http://localhost:8080" -ForegroundColor Gray
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

$overallSuccess = $true

# 1. Run Question 2 Part (a): Password Security & Migration
Write-Host "[1/3] Executing Q2(a) Bcrypt Password Security Suite..." -ForegroundColor Yellow
try {
    & powershell -File "scripts\test_q2a_password.ps1"
    if ($LASTEXITCODE -ne 0) { $overallSuccess = $false }
} catch {
    Write-Host "[ERROR] Q2(a) failed: $_" -ForegroundColor Red
    $overallSuccess = $false
}

# 2. Run Question 2 Part (b): MFA & RBAC Suite
Write-Host "`n[2/3] Executing Q2(b) TOTP MFA & RBAC Access Control Suite..." -ForegroundColor Yellow
try {
    & powershell -File "scripts\test_q2b_security.ps1"
    if ($LASTEXITCODE -ne 0) { $overallSuccess = $false }
} catch {
    Write-Host "[ERROR] Q2(b) failed: $_" -ForegroundColor Red
    $overallSuccess = $false
}

# 3. Run Question 2 Part (c): Docker Container Security Posture
Write-Host "`n[3/3] Executing Q2(c) Docker Security Comparison..." -ForegroundColor Yellow
try {
    & powershell -File "scripts\scan_q2c_trivy.ps1"
    if ($LASTEXITCODE -ne 0) { $overallSuccess = $false }
} catch {
    Write-Host "[ERROR] Q2(c) failed: $_" -ForegroundColor Red
    $overallSuccess = $false
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
if ($overallSuccess) {
    Write-Host "   [SUCCESS] ALL QUESTION 2 SECURITY TESTS PASSED (100% OK)     " -ForegroundColor Green
} else {
    Write-Host "   [FAILURE] ONE OR MORE SECURITY TESTS FAILED                  " -ForegroundColor Red
}
Write-Host "=================================================================" -ForegroundColor Cyan

if (-not $overallSuccess) { exit 1 }
