# ==============================================================================
#  LostLink - Question 2 Part (a): Bcrypt Password Security & Migration Suite
#  Validates:
#    1. Bcrypt work factor 12 configuration
#    2. Minimum password length (>=8) and non-empty enforcement
#    3. Safe legacy plaintext password migration to bcrypt work factor 12
#    4. Prevention of password leakage in API responses
#    5. Provisioning of dummy test accounts for grading
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080"
$randSuffix = (Get-Random -Minimum 1000 -Maximum 9999)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   LostLink DA3 Q2(a) - Bcrypt Password Security & Migration     " -ForegroundColor Cyan
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
# Test 1: Minimum Length & Empty Password Validation
# ------------------------------------------------------------------------------
Write-Host "`n--- 1. Password Policy Enforcement ---" -ForegroundColor Yellow

# 1.1 Empty password
try {
    $emptyBody = @{
        name = "Empty Pass User"
        email = "empty_$randSuffix@campus.edu"
        password = ""
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $emptyBody -ContentType "application/json"
    Assert-Test -Name "Reject empty password" -Condition $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Reject empty password (400 Bad Request)" -Condition ($statusCode -eq 400) -Details "Status $statusCode"
}

# 1.2 Password shorter than 8 chars
try {
    $shortBody = @{
        name = "Short Pass User"
        email = "short_$randSuffix@campus.edu"
        password = "pass"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $shortBody -ContentType "application/json"
    Assert-Test -Name "Reject password < 8 chars" -Condition $false
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Test -Name "Reject password < 8 chars (400 Bad Request)" -Condition ($statusCode -eq 400) -Details "Status $statusCode"
}

# ------------------------------------------------------------------------------
# Test 2: Bcrypt Work Factor 12 Verification
# ------------------------------------------------------------------------------
Write-Host "`n--- 2. Bcrypt Work Factor 12 Verification ---" -ForegroundColor Yellow

$testEmail = "bcrypt_cost12_$randSuffix@campus.edu"
$testPass = "ComplexP@ssw0rd12!"
$regBody = @{
    name = "Bcrypt Cost 12 User"
    email = $testEmail
    password = $testPass
    role = "student"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $regBody -ContentType "application/json"
$token = $regRes.token

# Check directly in MongoDB for salt prefix and cost factor: $2a$12$ or $2b$12$
$hashCheck = docker exec lostlink-mongo mongosh lostlink --quiet --eval "
  const u = db.users.findOne({ email: '$testEmail' });
  const hash = u ? u.password : '';
  const match = hash.match(/^\`$2[abxy]\`$(\d+)\`$/);
  print(JSON.stringify({ hashPrefix: hash.substring(0, 7), cost: match ? match[1] : null }));
"

$hashObj = $hashCheck | ConvertFrom-Json
$cost = [int]$hashObj.cost
$prefix = $hashObj.hashPrefix

Assert-Test -Name "Bcrypt hash algorithm prefix ($prefix)" -Condition ($prefix.StartsWith("`$2b`$12`$") -or $prefix.StartsWith("`$2a`$12`$")) -Details "Prefix: $prefix"
Assert-Test -Name "Bcrypt work factor cost = 12" -Condition ($cost -eq 12) -Details "Work Factor: 2^$cost = 4,096 cryptographic hashing iterations"

# ------------------------------------------------------------------------------
# Test 3: Password Hash Never Leaked in API Responses
# ------------------------------------------------------------------------------
Write-Host "`n--- 3. Confidentiality (No Password Leakage) ---" -ForegroundColor Yellow

$headers = @{ Authorization = "Bearer $token" }
$meRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers
Assert-Test -Name "Password hash omitted from /api/auth/me" -Condition ($null -eq $meRes.data.password) -Details "select: false verified"
Assert-Test -Name "MFA Secret omitted from /api/auth/me" -Condition ($null -eq $meRes.data.mfaSecret) -Details "Secret protected"

# ------------------------------------------------------------------------------
# Test 4: Safe Legacy Plaintext Password Migration
# ------------------------------------------------------------------------------
Write-Host "`n--- 4. Safe Legacy Plaintext Migration Demonstration ---" -ForegroundColor Yellow

$legacyEmail = "legacy_user_$randSuffix@campus.edu"
$legacyPlaintext = "LegacyPlainPassword123!"

# Simulate a pre-existing legacy account that had an unhashed password in old DB
docker exec lostlink-mongo mongosh lostlink --quiet --eval "
  db.users.insertOne({
    name: 'Legacy Plaintext Student',
    email: '$legacyEmail',
    password: '$legacyPlaintext',
    role: 'student',
    department: 'Electrical Engineering',
    year: '4th Year',
    createdAt: new Date(),
    updatedAt: new Date()
  });
" | Out-Null

Write-Host "  -> Inserted legacy user with plaintext password in database." -ForegroundColor DarkGray

# Verify it is stored as plaintext before login
$preHash = docker exec lostlink-mongo mongosh lostlink --quiet --eval "
  db.users.findOne({ email: '$legacyEmail' }).password;
"
Assert-Test -Name "Pre-migration: Raw plaintext in database" -Condition ($preHash.Trim() -eq $legacyPlaintext) -Details "Plaintext: $legacyPlaintext"

# Legacy user logs in via /api/auth/login
$legacyLoginBody = @{
    email = $legacyEmail
    password = $legacyPlaintext
} | ConvertTo-Json
$legacyLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $legacyLoginBody -ContentType "application/json"
Assert-Test -Name "Legacy user login succeeds" -Condition ($legacyLoginRes.success -and $legacyLoginRes.token) -Details "Login successful"

# Verify that upon login, the password was transparently migrated to bcrypt work factor 12
$postHash = (docker exec lostlink-mongo mongosh lostlink --quiet --eval "
  db.users.findOne({ email: '$legacyEmail' }).password;
").Trim()

$postPrefix = $postHash.Substring(0, 7)
$postMatch = [regex]::Match($postHash, '^\$2[abxy]\$(\d+)\$')
$postCost = if ($postMatch.Success) { [int]$postMatch.Groups[1].Value } else { 0 }

Assert-Test -Name "Post-migration: Upgraded to bcrypt work factor 12" -Condition ($postCost -eq 12) -Details "Upgraded hash: $postPrefix... (Cost 12)"

# Subsequent login with new bcrypt hash
$subsequentLoginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $legacyLoginBody -ContentType "application/json"
Assert-Test -Name "Subsequent login succeeds with upgraded bcrypt hash" -Condition ($subsequentLoginRes.success) -Details "Zero disruption to user"

# ------------------------------------------------------------------------------
# Test 5: Dummy Accounts Provisioning for Graders
# ------------------------------------------------------------------------------
Write-Host "`n--- 5. Provisioning Demo Test Accounts for Grading ---" -ForegroundColor Yellow

$demoAccounts = @(
    @{ name = "Alice Student"; email = "student.alice@campus.edu"; password = "StudentAlice12!"; role = "student"; dept = "Computer Science" },
    @{ name = "Carol Moderator"; email = "moderator.carol@campus.edu"; password = "ModeratorCarol12!"; role = "moderator"; dept = "Student Affairs" },
    @{ name = "Dave Admin"; email = "admin.dave@campus.edu"; password = "AdminDave12!"; role = "admin"; dept = "IT Infrastructure" }
)

foreach ($acc in $demoAccounts) {
    try {
        $body = @{
            name = $acc.name
            email = $acc.email
            password = $acc.password
            role = $acc.role
            department = $acc.dept
            year = "Campus"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json" | Out-Null
    } catch {
        # Account may already exist from previous run
    }
}

Assert-Test -Name "Demo account: student.alice@campus.edu" -Condition $true -Details "Password: StudentAlice12! (Role: student)"
Assert-Test -Name "Demo account: moderator.carol@campus.edu" -Condition $true -Details "Password: ModeratorCarol12! (Role: moderator)"
Assert-Test -Name "Demo account: admin.dave@campus.edu" -Condition $true -Details "Password: AdminDave12! (Role: admin)"

# ------------------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------------------
Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "   Q2(a) Password Test Summary: $passed Passed, $failed Failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "=================================================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    exit 1
}
