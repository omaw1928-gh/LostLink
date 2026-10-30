# ==============================================================================
#  LostLink - Question 2 Part (c): Automated Docker Security Scan with Trivy
#  Compares baseline vs hardened Docker image security posture
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   LostLink DA3 Q2(c) - Automated Docker Security Scan (Trivy)   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Verify Docker daemon is accessible
try {
    docker version | Out-Null
    Write-Host "[OK] Docker daemon is running." -ForegroundColor Green
} catch {
    Write-Error "Docker daemon is not running or accessible. Please start Docker Desktop."
    exit 1
}

# 2. Check or build baseline image
Write-Host "`n[Step 1/4] Ensuring baseline image 'lostlink-backend:baseline' exists..." -ForegroundColor Yellow
if (-not (docker images -q lostlink-backend:baseline)) {
    if (Test-Path "backend\Dockerfile.baseline") {
        Write-Host "Building baseline image from backend\Dockerfile.baseline..." -ForegroundColor Gray
        docker build -f backend\Dockerfile.baseline -t lostlink-backend:baseline ./backend
    } else {
        docker tag lostlink-backend:latest lostlink-backend:baseline
    }
}
Write-Host "[OK] Baseline image ready." -ForegroundColor Green

# 3. Check or build hardened image
Write-Host "`n[Step 2/4] Ensuring hardened image 'lostlink-backend:hardened' exists..." -ForegroundColor Yellow
docker build -f backend\Dockerfile -t lostlink-backend:hardened -t lostlink-backend:latest ./backend
Write-Host "[OK] Hardened image built." -ForegroundColor Green

# 4. Run Trivy scans
Write-Host "`n[Step 3/4] Executing Trivy vulnerability scanner on both images..." -ForegroundColor Yellow

$baselineJson = Join-Path $PWD "trivy_baseline.json"
$hardenedJson = Join-Path $PWD "trivy_hardened.json"

Write-Host "-> Scanning lostlink-backend:baseline..." -ForegroundColor Gray
docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/workspace aquasec/trivy:latest image --format json -o /workspace/trivy_baseline.json lostlink-backend:baseline

Write-Host "-> Scanning lostlink-backend:hardened..." -ForegroundColor Gray
docker run --rm -v //var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/workspace aquasec/trivy:latest image --format json -o /workspace/trivy_hardened.json lostlink-backend:hardened

# 5. Parse and display comparative analysis
Write-Host "`n[Step 4/4] Security Posture Comparison Analysis" -ForegroundColor Cyan
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

python scripts\compare_trivy.py

Write-Host "`n[SUCCESS] Trivy container security scanning completed successfully." -ForegroundColor Green
Write-Host "Detailed JSON reports saved to trivy_baseline.json and trivy_hardened.json" -ForegroundColor Gray

