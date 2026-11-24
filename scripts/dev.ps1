# Starts the whole app for development: the FastAPI backend (port 8000) and the Vite dev
# server (port 5173), in this one terminal. Press Ctrl+C to stop both.
#
# Run it from anywhere:   powershell -File scripts/dev.ps1
# Or from frontend/:      npm run dev:all
#
# Windows only. On macOS or Linux, start the backend and `npm run dev` in two terminals.

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'
$python = Join-Path $backendDir '.venv\Scripts\python.exe'

if (-not (Test-Path $python)) {
    Write-Error "The backend virtual environment is missing ($python). Create it with: cd backend; python -m venv .venv; .venv\Scripts\pip install -r requirements.txt"
    exit 1
}

# Refuse to start a second backend if something already holds the port.
if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) {
    Write-Error 'Port 8000 is already in use (is the backend already running?). Stop it first, or just run: npm run dev'
    exit 1
}

Write-Host 'Starting the backend on http://localhost:8000 ...' -ForegroundColor Cyan
$backend = Start-Process -FilePath $python `
    -ArgumentList '-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000' `
    -WorkingDirectory $backendDir -NoNewWindow -PassThru

try {
    Write-Host 'Starting the frontend (Vite) ... press Ctrl+C to stop both.' -ForegroundColor Cyan
    Push-Location $frontendDir
    npm run dev
}
finally {
    Pop-Location
    # --reload starts child processes, so stop the whole tree, not just the parent.
    if ($backend -and -not $backend.HasExited) {
        Write-Host 'Stopping the backend ...' -ForegroundColor Cyan
        & taskkill /PID $backend.Id /T /F | Out-Null
    }
}
