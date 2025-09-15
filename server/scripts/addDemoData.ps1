# PowerShell script to add demo data
Write-Host "🚀 Adding demo data to QR Events..." -ForegroundColor Green

$baseUrl = "https://nscc-backend.vercel.app/api/participants/register"
$participants = @(
    @{ name = "Ram Kumar"; email = "ram.kumar@example.com" },
    @{ name = "Priya Sharma"; email = "priya.sharma@example.com" },
    @{ name = "Amit Singh"; email = "amit.singh@example.com" },
    @{ name = "Sita Patel"; email = "sita.patel@example.com" },
    @{ name = "Rajesh Gupta"; email = "rajesh.gupta@example.com" },
    @{ name = "Kavya Reddy"; email = "kavya.reddy@example.com" },
    @{ name = "Vikram Joshi"; email = "vikram.joshi@example.com" },
    @{ name = "Anita Desai"; email = "anita.desai@example.com" },
    @{ name = "Suresh Kumar"; email = "suresh.kumar@example.com" },
    @{ name = "Meera Iyer"; email = "meera.iyer@example.com" }
)

foreach ($participant in $participants) {
    try {
        $body = @{
            name = $participant.name
            email = $participant.email
        } | ConvertTo-Json
        
        Write-Host "📝 Registering: $($participant.name) - $($participant.email)" -ForegroundColor Yellow
        
        $response = Invoke-WebRequest -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body
        
        if ($response.StatusCode -eq 201) {
            Write-Host "✅ Successfully registered: $($participant.name)" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to register: $($participant.name)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error registering $($participant.name): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1  # Wait 1 second between requests
}

Write-Host "🎉 Demo data addition completed!" -ForegroundColor Green
Write-Host "📊 Check your admin dashboard to see the new participants" -ForegroundColor Cyan



