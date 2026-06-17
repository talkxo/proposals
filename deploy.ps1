# deploy.ps1
# Sakura Quest Proposal Deployment Script

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "SAKURA QUEST 2026 — GITHUB PAGES DEPLOYMENT HELPER" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check if Git is installed
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCheck) {
    Write-Host "[!] Git is not installed on your system." -ForegroundColor Yellow
    Write-Host "[*] Proposing installation via winget. A Windows UAC Administrator prompt will appear..." -ForegroundColor Yellow
    
    try {
        Start-Process winget -ArgumentList "install --id Git.Git --source winget --accept-source-agreements --accept-package-agreements" -NoNewWindow -Wait
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        $gitCheck = Get-Command git -ErrorAction SilentlyContinue
    } catch {
        Write-Host "[X] winget installation failed or was cancelled." -ForegroundColor Red
    }

    if (-not $gitCheck) {
        Write-Host "[X] Git could not be installed automatically. Please install Git manually from https://git-scm.com/ and re-run this script." -ForegroundColor Red
        Exit
    }
    Write-Host "[+] Git successfully installed!" -ForegroundColor Green
} else {
    Write-Host "[+] Git verified: $($gitCheck.Source)" -ForegroundColor Green
}

# 2. Check Git configuration
$gitUser = git config --global user.name
if (-not $gitUser) {
    Write-Host ""
    $name = Read-Host "Please enter your Git Name (for commit author)"
    git config --global user.name "$name"
}
$gitEmail = git config --global user.email
if (-not $gitEmail) {
    $email = Read-Host "Please enter your Git Email (for commit author)"
    git config --global user.email "$email"
}

# 3. Initialize Git Repository
Write-Host ""
Write-Host "[*] Initializing local Git repository..." -ForegroundColor Cyan
if (-not (Test-Path .git)) {
    git init
    git checkout -b main
} else {
    Write-Host "[+] Git repository already initialized." -ForegroundColor Green
}

# 4. Stage and Commit Proposal Files
Write-Host "[*] Staging files (index.html, style.css, app.js)..." -ForegroundColor Cyan
git add index.html style.css app.js

Write-Host "[*] Committing files..." -ForegroundColor Cyan
git commit -m "Initial commit of Sakura Quest Proposal and 30-Day Campaign Timeline" -ErrorAction SilentlyContinue

# 5. Remote Configuration
$repoOwner = "talkxo"
$repoName = "sakura-quest-proposal"
$remoteUrl = "https://github.com/$repoOwner/$repoName.git"

Write-Host ""
Write-Host "[*] Configuring remote endpoint..." -ForegroundColor Cyan
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    git remote remove origin
}
git remote add origin $remoteUrl
Write-Host "[+] Remote set to: $remoteUrl" -ForegroundColor Green

Write-Host ""
Write-Host "========================================= WARNING =========================================" -ForegroundColor Yellow
Write-Host "To push to github.com/$repoOwner, you must have the repository created on your account." -ForegroundColor Yellow
Write-Host "If you have not created it yet, please open your browser and go to:" -ForegroundColor Yellow
Write-Host "https://github.com/new" -ForegroundColor Cyan -NoNewline
Write-Host " and create a blank repository named: " -ForegroundColor Yellow -NoNewline
Write-Host "$repoName" -ForegroundColor Cyan
Write-Host "===========================================================================================" -ForegroundColor Yellow
Write-Host ""

$ready = Read-Host "Have you created the blank repository on GitHub? (y/n)"
if ($ready.ToLower() -ne "y") {
    Write-Host "[X] Cancelled. Please create the repository and re-run this script to push." -ForegroundColor Yellow
    Exit
}

# 6. Push to GitHub
Write-Host ""
Write-Host "[*] Pushing files to GitHub. This will trigger the GitHub login prompt..." -ForegroundColor Cyan
Write-Host "[!] Please authorize the login in your web browser if prompted." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[+] Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "===========================================================================================" -ForegroundColor Green
    Write-Host "HOW TO ENABLE GITHUB PAGES FOR THIS PROPOSAL:" -ForegroundColor Green
    Write-Host "1. Go to: https://github.com/$repoOwner/$repoName/settings/pages" -ForegroundColor Cyan
    Write-Host "2. Under 'Build and deployment', set Source to 'Deploy from a branch'." -ForegroundColor White
    Write-Host "3. Under 'Branch', select 'main' and '/ (root)', then click 'Save'." -ForegroundColor White
    Write-Host "4. Your live interactive URL will be ready in 1-2 minutes at:" -ForegroundColor White
    Write-Host "   https://$repoOwner.github.io/$repoName/" -ForegroundColor Cyan
    Write-Host "===========================================================================================" -ForegroundColor Green
} else {
    Write-Host "[X] Push failed. Please check your internet connection or git permissions and try again." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit..."
