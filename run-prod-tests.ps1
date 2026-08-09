$API = "https://futrix-node-api.onrender.com"
$PASS = 0; $FAIL = 0

function T($name, $ok) {
    if ($ok) {
        Write-Host "  PASS  $name"
        $script:PASS++
    } else {
        Write-Host "  FAIL  $name"
        $script:FAIL++
    }
}

Write-Host ""
Write-Host "==================================================="
Write-Host "  CAREER TWIN AI — PRODUCTION TEST SUITE"
Write-Host "  API: $API"
Write-Host "==================================================="

# 1. Health
Write-Host "`n[1] BACKEND HEALTH"
$h = Invoke-RestMethod "$API/health" -TimeoutSec 20
T "status=ok"             ($h.status -eq "ok")
T "mongodb=connected"     ($h.mongodb -eq "connected")
T "env=production"        ($h.environment -eq "production")
T "auth=operational"      ($h.services.auth -eq "operational")
T "database=operational"  ($h.services.database -eq "operational")

# 2. Input validation
Write-Host "`n[2] INPUT VALIDATION"
try {
    Invoke-RestMethod "$API/api/login" -Method POST -Body '{"email":"bad"}' -ContentType "application/json"
    T "reject bad email" $false
} catch {
    T "reject bad email -> 400" ($_.Exception.Response.StatusCode.value__ -eq 400)
}

try {
    Invoke-RestMethod "$API/api/login" -Method POST -Body '{}' -ContentType "application/json"
    T "reject empty body" $false
} catch {
    T "reject empty body -> 400" ($_.Exception.Response.StatusCode.value__ -eq 400)
}

# 3. Email login
Write-Host "`n[3] EMAIL LOGIN"
$login = Invoke-RestMethod "$API/api/login" -Method POST -Body '{"email":"prodtest@futrixai.com"}' -ContentType "application/json"
T "status=logged_in"     ($login.status -eq "logged_in")
T "has accessToken"      ($login.accessToken.Length -gt 20)
T "has refreshToken"     ($login.refreshToken.Length -gt 20)
T "user.email matches"   ($login.user.email -eq "prodtest@futrixai.com")
$tok = $login.accessToken
$ref = $login.refreshToken

# 4. Protected routes without token
Write-Host "`n[4] PROTECTED ROUTES — NO TOKEN"
try {
    Invoke-RestMethod "$API/api/auth/verify"
    T "verify blocked no-token" $false
} catch {
    T "verify blocked no-token -> 401" ($_.Exception.Response.StatusCode.value__ -eq 401)
}

try {
    Invoke-RestMethod "$API/api/history"
    T "history blocked no-token" $false
} catch {
    T "history blocked no-token -> 401" ($_.Exception.Response.StatusCode.value__ -eq 401)
}

try {
    Invoke-RestMethod "$API/api/upload-resume" -Method POST -Body '{"text":"test"}' -ContentType "application/json"
    T "upload blocked no-token" $false
} catch {
    T "upload blocked no-token -> 401" ($_.Exception.Response.StatusCode.value__ -eq 401)
}

# 5. Token verify
Write-Host "`n[5] TOKEN VERIFY"
$hdr = @{ Authorization = "Bearer $tok" }
$v = Invoke-RestMethod "$API/api/auth/verify" -Headers $hdr
T "verify valid=true"    ($v.valid -eq $true)
T "verify has email"     ($null -ne $v.user.email)
T "verify email correct" ($v.user.email -eq "prodtest@futrixai.com")

# 6. Token refresh
Write-Host "`n[6] TOKEN REFRESH"
$rb = "{`"refreshToken`":`"$ref`"}"
$newTok = Invoke-RestMethod "$API/api/auth/refresh" -Method POST -Body $rb -ContentType "application/json"
T "refresh new accessToken"  ($newTok.accessToken.Length -gt 20)
T "refresh new refreshToken" ($newTok.refreshToken.Length -gt 20)
T "tokens rotated"           ($newTok.accessToken -ne $tok)
$tok = $newTok.accessToken

# 7. Invalid token
Write-Host "`n[7] INVALID TOKEN REJECTION"
try {
    Invoke-RestMethod "$API/api/auth/verify" -Headers @{ Authorization = "Bearer fake.bad.token" }
    T "reject fake token" $false
} catch {
    $c = $_.Exception.Response.StatusCode.value__
    T "reject fake token -> 401/403" ($c -eq 401 -or $c -eq 403)
}

# 8. Google OAuth validation
Write-Host "`n[8] GOOGLE OAUTH VALIDATION"
try {
    Invoke-RestMethod "$API/api/auth/google" -Method POST -Body '{}' -ContentType "application/json"
    T "reject missing credential" $false
} catch {
    T "reject missing credential -> 400" ($_.Exception.Response.StatusCode.value__ -eq 400)
}

try {
    Invoke-RestMethod "$API/api/auth/google" -Method POST -Body '{"credential":"fake.token.here"}' -ContentType "application/json"
    T "reject fake credential" $false
} catch {
    $c = $_.Exception.Response.StatusCode.value__
    T "reject fake credential -> 4xx/5xx" ($c -ge 400)
}

# 9. History
Write-Host "`n[9] HISTORY ENDPOINT"
$hdr2 = @{ Authorization = "Bearer $tok" }
$hist = Invoke-RestMethod "$API/api/history?email=prodtest@futrixai.com" -Headers $hdr2
T "history returns array" ($hist -is [array])

# 10. Job matching
Write-Host "`n[10] JOB MATCHING"
$jb   = '{"skills":["React","TypeScript","Node.js","Docker","MongoDB"]}'
$jobs = Invoke-RestMethod "$API/api/jobs/match" -Method POST -Body $jb -ContentType "application/json" -Headers $hdr2
T "returns array"     ($jobs -is [array])
T "returns 7 roles"   ($jobs.Count -eq 7)
T "sorted correctly"  ($jobs[0].matchPercent -ge $jobs[-1].matchPercent)
T "has matchedSkills" ($null -ne $jobs[0].matchedSkills)
T "has salary"        ($null -ne $jobs[0].salary)

# 11. Logout
Write-Host "`n[11] LOGOUT"
$logoutBody = "{`"refreshToken`":`"$($newTok.refreshToken)`"}"
$out = Invoke-RestMethod "$API/api/auth/logout" -Method POST -Body $logoutBody -ContentType "application/json"
T "logout -> logged_out" ($out.status -eq "logged_out")

# 12. 404 handler
Write-Host "`n[12] 404 HANDLER"
try {
    Invoke-RestMethod "$API/api/doesnotexist"
    T "404 handler" $false
} catch {
    T "404 handler correct" ($_.Exception.Response.StatusCode.value__ -eq 404)
}

# 13. Post-logout token invalidated
Write-Host "`n[13] POST-LOGOUT TOKEN INVALIDATION"
try {
    $rb2 = "{`"refreshToken`":`"$($newTok.refreshToken)`"}"
    Invoke-RestMethod "$API/api/auth/refresh" -Method POST -Body $rb2 -ContentType "application/json"
    T "old refresh token still works after logout" $false
} catch {
    T "old refresh token invalidated after logout" $true
}

# Summary
Write-Host ""
Write-Host "==================================================="
$total = $PASS + $FAIL
Write-Host "  RESULTS: $PASS passed / $FAIL failed / $total total"
if ($FAIL -eq 0) {
    Write-Host "  ALL TESTS PASSED - PRODUCTION READY"
} else {
    Write-Host "  $FAIL TESTS NEED ATTENTION"
}
Write-Host "==================================================="
