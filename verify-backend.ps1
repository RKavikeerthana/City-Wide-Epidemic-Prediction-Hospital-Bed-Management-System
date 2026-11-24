# Run from the folder that contains backend\, frontend\, admin\   (backend must be running: cd backend; npm start)
# Usage:  powershell -ExecutionPolicy Bypass -File .\verify-backend.ps1
$ErrorActionPreference = 'Stop'
$base = 'http://localhost:4000'
function EnvVal($name) {
  $line = Get-Content .\backend\.env | Where-Object { $_ -match "^\s*$name\s*=" } | Select-Object -First 1
  return ($line -replace "^\s*$name\s*=\s*", '').Trim().Trim('"').Trim("'")
}
function Count($x) { if ($null -eq $x) { return 0 } else { return @($x).Count } }
function Step($label, [scriptblock]$code) {
  try { $r = & $code; Write-Host "[PASS] $label  $r" -ForegroundColor Green }
  catch { Write-Host "[FAIL] $label  -> $($_.Exception.Message)" -ForegroundColor Red }
}
$script:token = $null
Step 'Admin login returns a token' {
  $body = @{ email = (EnvVal 'ADMIN_EMAIL'); password = (EnvVal 'ADMIN_PASSWORD') } | ConvertTo-Json
  $r = Invoke-RestMethod "$base/api/admin/login" -Method Post -ContentType 'application/json' -Body $body
  if (-not $r.success) { throw $r.message }
  $script:token = $r.token; 'token received'
}
Step 'Admin token accepted by a protected route (all-doctors)' {
  $r = Invoke-RestMethod "$base/api/admin/all-doctors" -Headers @{ Authorization = "Bearer $script:token" }
  if (-not $r.success) { throw $r.message }; "$($r.doctors.Count) hospital(s) in database"
}
Step 'Public hospital list (patient site)' {
  $r = Invoke-RestMethod "$base/api/doctor/list"; "$($r.doctors.Count) hospital(s)"
}
Step 'Alerts endpoint' {
  $r = Invoke-RestMethod "$base/api/alerts"; "$(Count $r) alert(s)"
}
Step 'Patients endpoint' {
  $r = Invoke-RestMethod "$base/api/patients"; "$(Count $r) patient(s)"
}
Step 'LSTM train (same toy payload the admin ML page sends)' {
  $body = @{ inputs = @( @(0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0), @(1.0,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1) ); outputs = @(1,0) } | ConvertTo-Json -Depth 5
  $r = Invoke-RestMethod "$base/api/lstm/train" -Method Post -ContentType 'application/json' -Body $body; $r.message
}
Step 'LSTM predict' {
  $body = @{ input = @(0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0) } | ConvertTo-Json
  $r = Invoke-RestMethod "$base/api/lstm/predict" -Method Post -ContentType 'application/json' -Body $body; "prediction = $($r.prediction | ConvertTo-Json -Compress)"
}
