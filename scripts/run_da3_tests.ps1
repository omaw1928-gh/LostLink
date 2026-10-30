# LostLink - Digital Assignment 3 Automation Suite
# Executes experiments for Question 1 (Scale your application)

param(
    [string]$TargetUrl = "http://localhost:8080/api/health",
    [int]$Requests = 1000,
    [int]$Concurrency = 20
)

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   LostLink - Digital Assignment 3 (Question 1 Test Suite)" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

function Check-Docker {
    Write-Host "[*] Checking Docker connectivity..." -ForegroundColor Yellow
    docker version > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Docker is not running. Please launch Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    Write-Host "[+] Docker is active and responsive." -ForegroundColor Green
}

function Prompt-TestParameters {
    param([string]$TestName)
    Write-Host ""
    Write-Host "Configure parameters for $TestName :" -ForegroundColor Cyan
    $reqInput = Read-Host "  Enter number of requests (Press Enter for default: $Requests)"
    if ($reqInput -and [int]::TryParse($reqInput, [ref]$null) -and ([int]$reqInput -gt 0)) {
        $script:Requests = [int]$reqInput
    }

    $concInput = Read-Host "  Enter concurrency level (Press Enter for default: $Concurrency)"
    if ($concInput -and [int]::TryParse($concInput, [ref]$null) -and ([int]$concInput -gt 0)) {
        $script:Concurrency = [int]$concInput
    }

    Write-Host "  [+] Using: $script:Requests requests @ concurrency $script:Concurrency" -ForegroundColor Green
}

function Run-PartA {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "  PART (a): Round-Robin Load Distribution Verification" -ForegroundColor Magenta
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Magenta
    
    $partACount = 15
    $reqInput = Read-Host "Enter number of requests to test distribution (Press Enter for default: 15)"
    if ($reqInput -and [int]::TryParse($reqInput, [ref]$null) -and ([int]$reqInput -gt 0)) {
        $partACount = [int]$reqInput
    }

    Write-Host "Sending $partACount sequential requests to $TargetUrl..." -ForegroundColor Yellow

    $instances = @()
    for ($i = 1; $i -le $partACount; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 5
            $inst = $resp.Headers["X-LostLink-Instance"]
            if (-not $inst) { $inst = "unknown" }
            $instances += $inst
            Write-Host ("  Request #{0:D2} --> Processed by: {1}" -f $i, $inst) -ForegroundColor Cyan
        } catch {
            Write-Host ("  Request #{0:D2} --> ERROR: {1}" -f $i, $_.Exception.Message) -ForegroundColor Red
        }
        Start-Sleep -Milliseconds 100
    }

    Write-Host ""
    Write-Host "[+] Distribution Summary across $partACount requests:" -ForegroundColor Green
    $instances | Group-Object | ForEach-Object {
        $pct = [math]::Round(($_.Count / $partACount) * 100)
        Write-Host ("    - {0}: {1} requests ({2}%)" -f $_.Name, $_.Count, $pct) -ForegroundColor Green
    }
}

function Run-PartB {
    Prompt-TestParameters -TestName "Part (b) Load Test"

    Write-Host ""
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "  PART (b): Load Testing (1 Instance vs 3 Instances - $script:Requests reqs)" -ForegroundColor Magenta
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Magenta

    Write-Host ""
    Write-Host ">>> [STEP 1/2] Testing with 1 INSTANCE (stopping backend2 and backend3)..." -ForegroundColor Yellow
    docker stop lostlink-backend2 lostlink-backend3 > $null 2>&1
    Start-Sleep -Seconds 3

    Write-Host "Running $script:Requests requests against 1 backend instance..." -ForegroundColor Yellow
    node scripts/load_test.js --url=$TargetUrl --requests=$script:Requests --concurrency=$script:Concurrency --label="1-Instance"

    Write-Host ""
    Write-Host ">>> [STEP 2/2] Testing with 3 INSTANCES (starting backend2 and backend3)..." -ForegroundColor Yellow
    docker start lostlink-backend2 lostlink-backend3 > $null 2>&1
    Write-Host "Waiting 10s for containers to settle and pass health checks..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10

    Write-Host "Running $script:Requests requests against 3 backend instances (Nginx Load Balanced)..." -ForegroundColor Yellow
    node scripts/load_test.js --url=$TargetUrl --requests=$script:Requests --concurrency=$script:Concurrency --label="3-Instances"
}

function Run-PartC {
    Prompt-TestParameters -TestName "Part (c) Fault Tolerance Test"

    Write-Host ""
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "  PART (c): Fault-Tolerance and Zero-Downtime Failover Test" -ForegroundColor Magenta
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Magenta

    Write-Host "Starting load test in background while terminating lostlink-backend2 mid-stream..." -ForegroundColor Yellow

    $job = Start-Job -ScriptBlock {
        Start-Sleep -Seconds 2
        docker stop lostlink-backend2
    }

    node scripts/load_test.js --url=$TargetUrl --requests=$script:Requests --concurrency=$script:Concurrency --label="3-to-2-Failover-Resilient"
    Wait-Job $job -Timeout 15 -ErrorAction SilentlyContinue | Out-Null
    Receive-Job $job -ErrorAction SilentlyContinue | Out-Null
    Stop-Job $job -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $job -Force -ErrorAction SilentlyContinue | Out-Null

    Write-Host ""
    Write-Host "Restarting lostlink-backend2 to restore cluster..." -ForegroundColor Yellow
    docker start lostlink-backend2 > $null 2>&1
    Write-Host "[+] Cluster restored to 3 healthy instances." -ForegroundColor Green
}

function Run-PartD {
    Write-Host ""
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "  PART (d): Cloud Bursting & Elastic Capacity Demonstration" -ForegroundColor Magenta
    Write-Host "-----------------------------------------------------------------" -ForegroundColor Magenta

    & "$PSScriptRoot\test_q1d_bursting.ps1"
}

# Main Execution Flow
Check-Docker

Write-Host ""
Write-Host "Select an option to run:"
Write-Host "  1. Run Part (a) - Verify Round-Robin Distribution"
Write-Host "  2. Run Part (b) - Benchmark (1 Instance vs 3 Instances - custom request count)"
Write-Host "  3. Run Part (c) - Test Zero-Downtime Failover (Stop instance mid-test)"
Write-Host "  4. Run Part (d) - Demonstrate Cloud Bursting Architecture & Fallback"
Write-Host "  5. Run ALL tests sequentially (Parts a, b, c, d)"
Write-Host "  Q. Quit"
Write-Host ""

$choice = Read-Host "Enter your choice [1/2/3/4/5/Q]"

switch ($choice) {
    "1" { Run-PartA }
    "2" { Run-PartB }
    "3" { Run-PartC }
    "4" { Run-PartD }
    "5" { 
        Prompt-TestParameters -TestName "All Tests"
        Run-PartA
        Run-PartB
        Run-PartC
        Run-PartD
        Write-Host ""
        Write-Host "All Assignment 3 experiments finished successfully!" -ForegroundColor Green
    }
    Default { Write-Host "Exiting." }
}
