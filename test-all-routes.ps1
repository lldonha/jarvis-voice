# PowerShell version of test-all-routes.sh
# Test script for all 5 JARVIS v4 routes

$BASE_URL = "http://localhost:5000/api/chat"
$SESSION = "test-session-" + [int](Get-Date -UFormat %s)

Write-Host "=== JARVIS v4 Route Testing Script (PowerShell) ==="
Write-Host "Session: $SESSION"
Write-Host ""

# Test 1: Chat Route (default)
Write-Host "=== TEST 1: Chat Route (default) ==="
$BODY = @{
  message = "olá JARVIS"
  sessionId = $SESSION
} | ConvertTo-Json

$RESPONSE = Invoke-RestMethod -Uri $BASE_URL -Method POST -Body $BODY -ContentType "application/json" | ConvertFrom-Json
$RESPONSE | ConvertTo-Json -Depth 100 | Write-Host

if ($RESPONSE.success) {
  Write-Host "✅ Test 1 PASSED - Tool: $($RESPONSE.tool_used), Time: $($RESPONSE.execution_time_ms)ms" -ForegroundColor Green
} else {
  Write-Host "❌ Test 1 FAILED" -ForegroundColor Red
}
Write-Host ""

# Test 2: Debug Route
Write-Host "=== TEST 2: Debug Route ==="
$BODY = @{
  message = "debug: meu código não funciona"
  sessionId = $SESSION
} | ConvertTo-Json

$RESPONSE = Invoke-RestMethod -Uri $BASE_URL -Method POST -Body $BODY -ContentType "application/json" | ConvertFrom-Json
$RESPONSE | ConvertTo-Json -Depth 100 | Write-Host

if ($RESPONSE.success -and $RESPONSE.tool_used -eq "claude") {
  Write-Host "✅ Test 2 PASSED - Tool: $($RESPONSE.tool_used), Model: $($RESPONSE.model_used)" -ForegroundColor Green
} else {
  Write-Host "❌ Test 2 FAILED" -ForegroundColor Red
}
Write-Host ""

# Test 3: Docs Route
Write-Host "=== TEST 3: Docs Route ==="
$BODY = @{
  message = "docs: como usar React hooks"
  sessionId = $SESSION
} | ConvertTo-Json

$RESPONSE = Invoke-RestMethod -Uri $BASE_URL -Method POST -Body $BODY -ContentType "application/json" | ConvertFrom-Json
$RESPONSE | ConvertTo-Json -Depth 100 | Write-Host

if ($RESPONSE.success -and $RESPONSE.tool_used -eq "openCode") {
  Write-Host "✅ Test 3 PASSED - Tool: $($RESPONSE.tool_used), Model: $($RESPONSE.model_used)" -ForegroundColor Green
} else {
  Write-Host "❌ Test 3 FAILED" -ForegroundColor Red
}
Write-Host ""

# Test 4: Ultrawork Route
Write-Host "=== TEST 4: Ultrawork Route ==="
$BODY = @{
  message = "ulw: criar API RESTful"
  sessionId = $SESSION
} | ConvertTo-Json

$RESPONSE = Invoke-RestMethod -Uri $BASE_URL -Method POST -Body $BODY -ContentType "application/json" | ConvertFrom-Json
$RESPONSE | ConvertTo-Json -Depth 100 | Write-Host

if ($RESPONSE.success -and $RESPONSE.tool_used -eq "openCode") {
  Write-Host "✅ Test 4 PASSED - Tool: $($RESPONSE.tool_used), Model: $($RESPONSE.model_used)" -ForegroundColor Green
} else {
  Write-Host "❌ Test 4 FAILED" -ForegroundColor Red
}
Write-Host ""

# Test 5: Create Workflow Route
Write-Host "=== TEST 5: Create Workflow Route ==="
$BODY = @{
  message = "crie workflow de email"
  sessionId = $SESSION
} | ConvertTo-Json

$RESPONSE = Invoke-RestMethod -Uri $BASE_URL -Method POST -Body $BODY -ContentType "application/json" | ConvertFrom-Json
$RESPONSE | ConvertTo-Json -Depth 100 | Write-Host

if ($RESPONSE.success -and $RESPONSE.tool_used -eq "openCode") {
  Write-Host "✅ Test 5 PASSED - Tool: $($RESPONSE.tool_used), Model: $($RESPONSE.model_used), Workflow ID: $($RESPONSE.workflowId)" -ForegroundColor Green
} else {
  Write-Host "❌ Test 5 FAILED" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=== TEST SUMMARY ==="
Write-Host "All 5 routes tested"
Write-Host "Check responses above for detailed results"
Write-Host ""
