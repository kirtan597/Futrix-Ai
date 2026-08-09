# Quick deployment verification script
# Run this after Render deployment completes

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FUTRIX AI - Deployment Verification" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$API = "https://futrix-node-api.onrender.com"
$PYTHON = "https://futrix-python-ai.onrender.com"

# 1. Backend Health
Write-Host "[1] Checking Node API Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "$API/health" -TimeoutSec 30
    if ($health.status -eq "ok") {
        Write-Host "    ✅ Node API is healthy" -ForegroundColor Green
        Write-Host "       Version: $($health.version)" -ForegroundColor Gray
        Write-Host "       MongoDB: $($health.mongodb)" -ForegroundColor Gray
        Write-Host "       Uptime: $([math]::Round($health.uptime, 2))s" -ForegroundColor Gray
    } else {
        Write-Host "    ❌ Node API returned unexpected status" -ForegroundColor Red
    }
} catch {
    Write-Host "    ❌ Node API is not responding" -ForegroundColor Red
    Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Python AI Health  
Write-Host "[2] Checking Python AI Health..." -ForegroundColor Yellow
try {
    $pyHealth = Invoke-RestMethod "$PYTHON/health" -TimeoutSec 30
    if ($pyHealth.status -eq "ok") {
        Write-Host "    ✅ Python AI is healthy" -ForegroundColor Green
    } else {
        Write-Host "    ❌ Python AI returned unexpected status" -ForegroundColor Red
    }
} catch {
    Write-Host "    ❌ Python AI is not responding" -ForegroundColor Red
    Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Test Logout Endpoint (the one that was failing)
Write-Host "[3] Testing Logout Endpoint..." -ForegroundColor Yellow
try {
    $logout = Invoke-RestMethod "$API/api/auth/logout" -Method POST -Body '{"refreshToken":"test"}' -ContentType "application/json"
    if ($logout.status -eq "logged_out") {
        Write-Host "    ✅ Logout endpoint is working correctly!" -ForegroundColor Green
        Write-Host "       DEPLOYMENT FIX CONFIRMED" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  Logout returned unexpected response" -ForegroundColor Yellow
        Write-Host "       Response: $($logout | ConvertTo-Json)" -ForegroundColor Gray
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "    ❌ Logout still returning 401 - deployment not updated yet" -ForegroundColor Red
        Write-Host "       Wait a few minutes and try again" -ForegroundColor Yellow
    } else {
        Write-Host "    ⚠️  Unexpected error: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""

# 4. Quick Auth Flow Test
Write-Host "[4] Testing Auth Flow..." -ForegroundColor Yellow
try {
    $login = Invoke-RestMethod "$API/api/login" -Method POST -Body '{"email":"deployment-test@futrixai.com"}' -ContentType "application/json"
    if ($login.status -eq "logged_in" -and $login.accessToken) {
        Write-Host "    ✅ Email login works" -ForegroundColor Green
        Write-Host "    ✅ Tokens generated successfully" -ForegroundColor Green
        
        # Test token verification
        $headers = @{ Authorization = "Bearer $($login.accessToken)" }
        $verify = Invoke-RestMethod "$API/api/auth/verify" -Headers $headers
        if ($verify.valid -eq $true) {
            Write-Host "    ✅ Token verification works" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "    ❌ Auth flow test failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "  1. If logout shows ✅, run full test suite:" -ForegroundColor White
Write-Host "     node test-production.mjs" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. If logout shows ❌, wait for Render to deploy:" -ForegroundColor White
Write-Host "     https://dashboard.render.com" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Once all ✅, test frontend:" -ForegroundColor White
Write-Host "     https://futrixai.netlify.app" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
