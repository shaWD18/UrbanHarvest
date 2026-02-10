
# 1. Login as Admin to get token
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body (@{email="admin@urban.com"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"
$token = $adminLogin.token
Write-Host "Admin Token obtained."

# 2. Get all workshops to find one with bookings (or just pick first one)
$workshops = Invoke-RestMethod -Uri "http://localhost:3000/api/workshops" -Method Get
$workshopId = $workshops[0].id
Write-Host "Checking bookings for Workshop ID: $workshopId"

# 3. Call the new bookings endpoint
try {
    $bookings = Invoke-RestMethod -Uri "http://localhost:3000/api/workshops/$workshopId/bookings" -Method Get -Headers @{Authorization="Bearer $token"}
    Write-Host "Bookings Count: $($bookings.Count)"
    if ($bookings.Count -gt 0) {
        Write-Host "First Booking User: $($bookings[0].user_name)"
        Write-Host "VERIFICATION PASSED: Endpoint returned data."
    } else {
        Write-Host "No bookings found (this is expected if none made yet, but endpoint works)."
        Write-Host "VERIFICATION PASSED: Endpoint accessible."
    }
} catch {
    Write-Host "VERIFICATION FAILED: $($_.Exception.Message)"
}
