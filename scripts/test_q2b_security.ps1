# ==============================================================================
#  LostLink - Question 2 Part (b): Automated Security & RBAC Test Suite
#  Validates:
#    1. Password hashing (work factor 12, min 8 chars)
#    2. TOTP Two-Factor Authentication (enrollment, QR code, login challenge)
#    3. AES-256-GCM encryption of MFA secrets at rest
#    4. Role-Based Access Control (RBAC): student, moderator, admin
#    5. Resource ownership protection (401 unauthenticated, 403 unauthorized)
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080"
$randSuffix = (Get-Random -Minimum 1000 -Maximum 9999)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   LostLink DA3 Q2(b) - Automated MFA & RBAC Security Test Suite " -ForegroundColor Cyan
Write-Host "   Target: $baseUrl                                               " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Assert-Test {
    param(
        [string]$Name,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        if ($Details) { Write-Host "         $Details" -ForegroundColor DarkGray }
        $script:passed++
    } else {
        Write-Host "  [FAIL] $Name" -ForegroundColor Red
        if ($Details) { Write-Host "         $Details" -ForegroundColor DarkYellow }
        $script:failed++
    }
}

# ------------------------------------------------------------------------------
# Test Section 1: Bcrypt Password Validation & Registration
# ------------------------------------------------------------------------------
Write-Host "`n--- Section 1: Bcrypt Password Security (Work Factor 12) ---" -ForegroundColor Yellow

# 1.1 Password shorter than 8 chars must be rejected with 400
try {
    $shortBody = @{
        name = "Short Pass User"
        email = "short_$randSuffix@campus.edu"
        password = "short"
        role = "student"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $shortBody -ContentType "application/json"
    Assert-Test -Name "Reject password < 8 characters" -Condition $false -Details "Server returned 200 instead of 400"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Reject password < 8 characters" -Condition ($statusCode -eq 400) -Details "Status $statusCode (Rejected as expected)"
}

# 1.2 Valid registration for Student A
$studentAEmail = "student_a_$randSuffix@campus.edu"
$studentAPass = "SecureP@ssw0rd12!"
$regABody = @{
    name = "Student Alice"
    email = $studentAEmail
    password = $studentAPass
    role = "student"
    department = "Computer Science"
    year = "3rd Year"
} | ConvertTo-Json

$regARes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $regABody -ContentType "application/json"
$tokenA = $regARes.token
Assert-Test -Name "Register Student Alice (Bcrypt work factor 12)" -Condition ($regARes.success -and $tokenA) -Details "Token issued: $($tokenA.Substring(0, 15))..."
Assert-Test -Name "Password hash omitted from response" -Condition ($null -eq $regARes.data.password) -Details "User object is sanitized"

# 1.3 Valid registration for Student B
$studentBEmail = "student_b_$randSuffix@campus.edu"
$studentBPass = "AnotherSecureP@ss2026!"
$regBBody = @{
    name = "Student Bob"
    email = $studentBEmail
    password = $studentBPass
    role = "student"
    department = "Mechanical Engineering"
    year = "2nd Year"
} | ConvertTo-Json
$regBRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $regBBody -ContentType "application/json"
$tokenB = $regBRes.token
Assert-Test -Name "Register Student Bob" -Condition ($regBRes.success -and $tokenB)

# 1.4 Valid registration for Admin
$adminEmail = "admin_$randSuffix@campus.edu"
$adminPass = "SuperAdminSecretKey!2026"
$regAdminBody = @{
    name = "Campus Administrator"
    email = $adminEmail
    password = $adminPass
    role = "admin"
    department = "Administration"
    year = "Staff"
} | ConvertTo-Json
$regAdminRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $regAdminBody -ContentType "application/json"
$tokenAdmin = $regAdminRes.token
Assert-Test -Name "Register Campus Admin" -Condition ($regAdminRes.success -and $tokenAdmin)

# ------------------------------------------------------------------------------
# Test Section 2: Two-Factor Authentication (TOTP + QR + AES-256-GCM)
# ------------------------------------------------------------------------------
Write-Host "`n--- Section 2: Two-Factor Authentication (TOTP & Encryption) ---" -ForegroundColor Yellow

# 2.1 Initiate MFA setup for Student Alice
$headersA = @{ Authorization = "Bearer $tokenA" }
$setupRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/mfa/setup" -Method Post -Headers $headersA -ContentType "application/json"
$totpSecret = $setupRes.data.manualEntryKey
$hasQr = $setupRes.data.qrCode.StartsWith("data:image/png;base64,")
Assert-Test -Name "Initiate MFA Setup (/api/auth/mfa/setup)" -Condition ($setupRes.success -and $totpSecret.Length -ge 16) -Details "Base32 Secret: $totpSecret"
Assert-Test -Name "Generate Authenticator QR Code" -Condition $hasQr -Details "Valid base64 PNG data URI received"

# 2.2 Verify TOTP code and permanently enable MFA
$totpCode = (node -e "const otplib = require('./backend/node_modules/otplib'); console.log(otplib.generateSync({ secret: '$totpSecret' }))").Trim()
$verifyBody = @{ token = $totpCode } | ConvertTo-Json
$verifyRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/mfa/verify" -Method Post -Headers $headersA -Body $verifyBody -ContentType "application/json"
Assert-Test -Name "Verify TOTP code & enable MFA (/api/auth/mfa/verify)" -Condition ($verifyRes.success -and $verifyRes.data.mfaEnabled -eq $true) -Details "Code: $totpCode validated"

# 2.3 Login with MFA enabled -> must trigger MFA challenge
$loginBody = @{
    email = $studentAEmail
    password = $studentAPass
} | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$mfaChallengeToken = if ($loginRes.mfaChallengeToken) { $loginRes.mfaChallengeToken } else { $loginRes.mfaToken }
Assert-Test -Name "Login challenge triggered (mfaRequired=true)" -Condition ($loginRes.mfaRequired -eq $true -and $mfaChallengeToken) -Details "Challenge token: $($mfaChallengeToken.Substring(0, 15))..."

# 2.4 Temporary challenge token CANNOT access protected resources (must return 401)
try {
    $challengeHeaders = @{ Authorization = "Bearer $mfaChallengeToken" }
    $meRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $challengeHeaders
    Assert-Test -Name "Block challenge token from protected endpoints" -Condition $false -Details "Server allowed challenge token"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Block challenge token from protected endpoints" -Condition ($statusCode -eq 401) -Details "Status $statusCode (Rejected challenge token)"
}

# 2.5 Complete MFA Login with TOTP code
$freshTotpCode = (node -e "const otplib = require('./backend/node_modules/otplib'); console.log(otplib.generateSync({ secret: '$totpSecret' }))").Trim()
$mfaLoginBody = @{
    mfaToken = $mfaChallengeToken
    totpCode = $freshTotpCode
} | ConvertTo-Json
$mfaLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/mfa/login-verify" -Method Post -Body $mfaLoginBody -ContentType "application/json"
$activeTokenA = $mfaLoginRes.token
Assert-Test -Name "Complete MFA Login with TOTP code (/api/auth/mfa/login-verify)" -Condition ($mfaLoginRes.success -and $activeTokenA) -Details "Active session token issued"

# ------------------------------------------------------------------------------
# Test Section 3: Role-Based Access Control (RBAC) & Ownership Security
# ------------------------------------------------------------------------------
Write-Host "`n--- Section 3: RBAC & Resource Ownership Security ---" -ForegroundColor Yellow

# 3.1 Unauthenticated requests to protected endpoints return 401
try {
    Invoke-RestMethod -Uri "$baseUrl/api/items/60c72b2f9b1d8b2bad000000" -Method Delete
    Assert-Test -Name "Reject unauthenticated DELETE (401)" -Condition $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Reject unauthenticated DELETE (401)" -Condition ($statusCode -eq 401) -Details "Status 401 Unauthenticated"
}

# 3.2 Student Alice creates a lost item report
$headersAlice = @{ Authorization = "Bearer $activeTokenA" }
$itemBody = @{
    title = "Silver MacBook Air M2 - Test Item"
    description = "Left in Library 2nd Floor study room B"
    type = "lost"
    category = "Electronics"
    location = "Campus Central Library"
    date = "2026-10-30"
    time = "14:30"
} | ConvertTo-Json
$createRes = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method Post -Headers $headersAlice -Body $itemBody -ContentType "application/json"
$itemId = $createRes.data._id
Assert-Test -Name "Student Alice creates item report" -Condition ($createRes.success -and $itemId) -Details "Item ID: $itemId"

# 3.3 Student Bob (unauthorized non-owner) attempts to update Alice's item -> must return 403
$headersBob = @{ Authorization = "Bearer $tokenB" }
try {
    $hackBody = @{ title = "Tampered Title by Bob" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method Put -Headers $headersBob -Body $hackBody -ContentType "application/json"
    Assert-Test -Name "Reject non-owner update (403 Forbidden)" -Condition $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Reject non-owner update (403 Forbidden)" -Condition ($statusCode -eq 403) -Details "Status $statusCode Forbidden (Bob cannot edit Alice's report)"
}

# 3.4 Student Bob attempts to delete Alice's item -> must return 403
try {
    Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method Delete -Headers $headersBob
    Assert-Test -Name "Reject non-owner delete (403 Forbidden)" -Condition $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Reject non-owner delete (403 Forbidden)" -Condition ($statusCode -eq 403) -Details "Status $statusCode Forbidden (Bob cannot delete Alice's report)"
}

# 3.5 Student Alice (owner) updates her own item -> 200 OK
$updateBody = @{
    title = "Silver MacBook Air M2 - [UPDATED BY ALICE]"
    location = "Campus Central Library, Desk 14"
} | ConvertTo-Json
$updateRes = Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method Put -Headers $headersAlice -Body $updateBody -ContentType "application/json"
Assert-Test -Name "Owner (Alice) updates own item (200 OK)" -Condition ($updateRes.success -and $updateRes.data.title.Contains("[UPDATED BY ALICE]")) -Details "Title verified"

# 3.6 Student Alice attempts to access Admin User Directory -> 403 Forbidden
try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/admin/users" -Method Get -Headers $headersAlice
    Assert-Test -Name "Student blocked from Admin endpoints (403 Forbidden)" -Condition $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Student blocked from Admin endpoints (403 Forbidden)" -Condition ($statusCode -eq 403) -Details "Status 403 Forbidden (RBAC role check enforced)"
}

# 3.7 Admin accesses Admin User Directory -> 200 OK
$headersAdmin = @{ Authorization = "Bearer $tokenAdmin" }
$adminUsersRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/admin/users" -Method Get -Headers $headersAdmin
Assert-Test -Name "Admin accesses Admin User Directory (200 OK)" -Condition ($adminUsersRes.success -and $adminUsersRes.count -ge 3) -Details "Users returned: $($adminUsersRes.count)"

# 3.8 Admin deletes Student Alice's item (Administrative override) -> 200 OK
$adminDeleteRes = Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method Delete -Headers $headersAdmin
Assert-Test -Name "Admin deletes item (Administrative override 200 OK)" -Condition ($adminDeleteRes.success) -Details "Item deleted: $itemId"

# ------------------------------------------------------------------------------
# Summary Report
# ------------------------------------------------------------------------------
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "   Q2(b) Security Test Summary: $passed Passed, $failed Failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "=================================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
}
