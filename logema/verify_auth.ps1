$baseUrl = "http://127.0.0.1:8001/api/auth"

Write-Host "Testing Registration..."
$registerBody = @{
    username   = "testuser_verif_ps"
    email      = "testuser_verif_ps@example.com"
    password   = "VerifyPassword123!"
    role       = "LOCATAIRE"
    first_name = "Test"
    last_name  = "User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Method Post -Uri "$baseUrl/register/" -Body $registerBody -ContentType "application/json"
    Write-Host "Registration Successful: $($response | ConvertTo-Json -Depth 2)"
}
catch {
    $err = $_.Exception.Response
    if ($err.StatusCode.value__ -eq 400) {
        Write-Host "User likely exists, proceeding..."
    }
    else {
        Write-Host "Registration Failed: $($_.Exception.Message)"
        exit
    }
}

Write-Host "`nTesting Login..."
$loginBody = @{
    username = "testuser_verif_ps"
    password = "VerifyPassword123!"
} | ConvertTo-Json

try {
    $tokens = Invoke-RestMethod -Method Post -Uri "$baseUrl/token/" -Body $loginBody -ContentType "application/json"
    Write-Host "Login Successful"
    $access = $tokens.access
    Write-Host "Access Token retrieved"
}
catch {
    Write-Host "Login Failed: $($_.Exception.Message)"
    exit
}

Write-Host "`nTesting Get Profile..."
$headers = @{
    Authorization = "Bearer $access"
}

try {
    $profile = Invoke-RestMethod -Method Get -Uri "$baseUrl/profile/" -Headers $headers
    Write-Host "Profile Retrieved: $($profile | ConvertTo-Json -Depth 2)"
}
catch {
    Write-Host "Get Profile Failed: $($_.Exception.Message)"
    exit
}

Write-Host "`nTesting Update Profile..."
$updateBody = @{
    first_name = "UpdatedNamePS"
} | ConvertTo-Json

try {
    $updatedProfile = Invoke-RestMethod -Method Patch -Uri "$baseUrl/profile/" -Body $updateBody -Headers $headers -ContentType "application/json"
    if ($updatedProfile.first_name -eq "UpdatedNamePS") {
        Write-Host "Verification PASSED! Name updated to UpdatedNamePS"
    }
    else {
        Write-Host "Verification FAILED: Name not updated."
    }
}
catch {
    Write-Host "Update Profile Failed: $($_.Exception.Message)"
    exit
}
