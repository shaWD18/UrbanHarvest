
# 1. Login as Admin to get token
$adminLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body (@{email="admin@urban.com"; password="admin123"} | ConvertTo-Json) -ContentType "application/json"
$token = $adminLogin.token
Write-Host "Admin Token obtained."

# 2. Create a Workshop with 10 slots
$workshop = Invoke-RestMethod -Uri "http://localhost:3000/api/workshops" -Method Post -Headers @{Authorization="Bearer $token"} -Body (@{
    title="Test API Workshop";
    description="Testing slots";
    date="2025-12-31";
    duration="1 hour";
    location="Test Loc";
    price=1000;
    category="Testing";
    image="/assets/test.jpg";
    slots=10;
    instructor_id=1
} | ConvertTo-Json) -ContentType "application/json"
$workshopId = $workshop.id
Write-Host "Workshop created with ID: $workshopId"

# 3. Check initial slots
$check1 = Invoke-RestMethod -Uri "http://localhost:3000/api/workshops/$workshopId" -Method Get
Write-Host "Initial Slots: $($check1.slots)"

# 4. Book 3 tickets as user (using admin token for simplicity as it's a valid user token too)
$booking = Invoke-RestMethod -Uri "http://localhost:3000/api/workshops/$workshopId/book" -Method Post -Headers @{Authorization="Bearer $token"} -Body (@{
    tickets=3;
    totalPrice=3000
} | ConvertTo-Json) -ContentType "application/json"
Write-Host "Booking response: $($booking.message)"

# 5. Check slots after booking
$check2 = Invoke-RestMethod -Uri "http://localhost:3000/api/workshops/$workshopId" -Method Get
Write-Host "Slots after booking 3: $($check2.slots)"

if ($check2.slots -eq 7) {
    Write-Host "VERIFICATION PASSED: Slots reduced correctly."
} else {
    Write-Host "VERIFICATION FAILED: Slots incorrect."
}

# 6. Clean up (Delete workshop)
Invoke-RestMethod -Uri "http://localhost:3000/api/workshops/$workshopId" -Method Delete -Headers @{Authorization="Bearer $token"}
Write-Host "Cleanup complete."
