$apiUrl = "http://localhost:5183/api/assistant/chat"

function Test-Intent {
    param (
        [string]$Message,
        [string]$ExpectedIntent
    )
    
    $payload = @{
        Message = $Message
        History = @()
    } | ConvertTo-Json -Depth 5

    Write-Host "Testing query: `"$Message`"" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $payload -ContentType "application/json"
        
        if ($response.intent -eq $ExpectedIntent) {
            Write-Host "[PASS] Intent classified correctly as: $($response.intent)" -ForegroundColor Green
        } else {
            Write-Host "[FAIL] Expected intent: $ExpectedIntent, but got: $($response.intent)" -ForegroundColor Red
        }
        
        if ($response.query) { Write-Host "       Query extracted: $($response.query)" }
        if ($response.reply) { Write-Host "       Reply: $($response.reply)" }
        Write-Host "---------------------------------------------------"
    } catch {
        Write-Host "[ERROR] Failed to connect to API or bad response. Make sure the API is running at $apiUrl and GEMINI_API_KEY is configured in your environment or appsettings." -ForegroundColor Red
        Write-Host $_.Exception.Message
        Write-Host "---------------------------------------------------"
    }
}

Write-Host "Testing Intent Classification..." -ForegroundColor Yellow
Write-Host "================================"

Test-Intent "Find a 2-bedroom apartment in KL under RM1500" "search"
Test-Intent "Is unit 101 a good investment property right now?" "analyze"
Test-Intent "The sink is leaking heavily in unit 304, please send someone" "maintenance"
Test-Intent "Has the tenant for unit 202 paid their rent this month?" "tenant"
Test-Intent "Hi, thanks for your help" "chat"

Write-Host "`nTesting Chat Context Persistence..." -ForegroundColor Yellow
Write-Host "==================================="

$payloadContext = @{
    Message = "What about unit 105?"
    History = @(
        @{ Role = "user"; Content = "Did unit 101 pay rent?" },
        @{ Role = "model"; Content = "Yes, rent was paid on the 1st." }
    )
} | ConvertTo-Json -Depth 5

Write-Host "Testing query with history: `"What about unit 105?`"" -ForegroundColor Cyan
try {
    $responseContext = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $payloadContext -ContentType "application/json"
    
    if ($responseContext.intent -eq "tenant") {
        Write-Host "[PASS] Intent correctly preserved as tenant" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Intent was: $($responseContext.intent)" -ForegroundColor Red
    }
    Write-Host "       Reply: $($responseContext.reply)"
} catch {
    Write-Host "[ERROR] Failed to connect." -ForegroundColor Red
}

Write-Host "`nDone!"
