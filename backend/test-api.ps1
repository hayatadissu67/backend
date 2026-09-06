$baseUrl = "http://localhost:5000/api"

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )

    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
        ContentType = "application/json"
    }

    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }

    $response = Invoke-WebRequest @params
    return ($response.Content | ConvertFrom-Json)
}

# Login
$login = Invoke-ApiRequest `
    -Method "POST" `
    -Uri "$baseUrl/auth/login" `
    -Body @{
        email = "admin@pmo.com"
        password = "admin123"
    }

if (-not $login.token) {
    throw "Login failed: $($login | ConvertTo-Json -Depth 10)"
}

$token = $login.token
$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "Login successful."
Write-Host "Token received."

# Get rooms
$rooms = Invoke-ApiRequest `
    -Method "GET" `
    -Uri "$baseUrl/chat/rooms" `
    -Headers $headers

Write-Host "`nGET /api/chat/rooms"
$rooms | ConvertTo-Json -Depth 10

# Create a room
$newRoom = Invoke-ApiRequest `
    -Method "POST" `
    -Uri "$baseUrl/chat/rooms" `
    -Headers $headers `
    -Body @{
        name = "PowerShell Test Room"
        type = "public"
    }

Write-Host "`nPOST /api/chat/rooms"
$newRoom | ConvertTo-Json -Depth 10

# Send a message to room 1
$message = Invoke-ApiRequest `
    -Method "POST" `
    -Uri "$baseUrl/chat/rooms/1/messages" `
    -Headers $headers `
    -Body @{
        content = "Hello from PowerShell"
    }

Write-Host "`nPOST /api/chat/rooms/1/messages"
$message | ConvertTo-Json -Depth 10