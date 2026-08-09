# Monitor deployment progress
# Runs every 30 seconds until deployment completes

$API = "https://futrix-node-api.onrender.com"
$maxAttempts = 20  # 10 minutes max
$attempt = 0

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Monitoring Node API Deployment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Waiting for Render to deploy commit cd3e2ce..." -ForegroundColor Yellow
Write-Host "This usually takes 5-10 minutes." -ForegroundColor Gray
Write-Host ""

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    Write-Host "[$attempt/$maxAttempts] Checking..." -NoNewline
    
    try {
        # Check health endpoint for new version
        $health = Invoke-RestMethod "$API/health" -TimeoutSec 10
        
        if ($health.version -eq "2.0.1") {
            Write-Host " ✅ NEW VERSION DETECTED!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Version: $($health.version)" -ForegroundColor Green
            Write-Host "Uptime: $([math]::Round($health.uptime, 2))s" -ForegroundColor Gray
            Write-Host ""
            
            # Test logout endpoint
            Write-Host "Testing logout endpoint..." -NoNewline
            try {
                $logout = Invoke-RestMethod "$API/api/auth/logout" -Method POST -Body '{"refreshToken":"test"}' -ContentType "application/json"
                if ($logout.status -eq "logged_out") {
                    Write-Host " ✅ WORKING!" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
                    Write-Host "  🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "Next steps:" -ForegroundColor Cyan
                    Write-Host "  1. Run full test suite:" -ForegroundColor White
                    Write-Host "     node test-production.mjs" -ForegroundColor Gray
                    Write-Host ""
                    Write-Host "  2. Test frontend:" -ForegroundColor White
                    Write-Host "     https://futrixai.netlify.app" -ForegroundColor Gray
                    Write-Host ""
                    exit 0
                }
            } catch {
                Write-Host " ❌ Still returning error" -ForegroundColor Red
                Write-Host "   Version updated but logout still broken - investigating..." -ForegroundColor Yellow
            }
        } else {
            Write-Host " Version still $($health.version) (waiting for 2.0.1)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host " ⚠️ API not responding" -ForegroundColor Yellow
    }
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "   Checking again in 30 seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds 30
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  ⏱️ Timeout reached" -ForegroundColor Red
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""
Write-Host "Deployment is taking longer than expected." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please check manually:" -ForegroundColor White
Write-Host "  1. Render Dashboard: https://dashboard.render.com" -ForegroundColor Gray
Write-Host "  2. Check build logs for errors" -ForegroundColor Gray
Write-Host "  3. Run: .\check-deployment.ps1" -ForegroundColor Gray
Write-Host ""
