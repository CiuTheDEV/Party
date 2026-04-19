@echo off
cd /d "%~dp0"
call powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\dev-preflight.ps1"
if errorlevel 1 exit /b %errorlevel%
start "PartyKit" cmd /k "cd /d %~dp0 && npx partykit dev"
start "Auth API" cmd /k "cd /d %~dp0 && node scripts/dev-auth-dev.mjs"
call npm run dev:next --workspace @party/hub
