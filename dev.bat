@echo off
cd /d "%~dp0"
start "Partykit" cmd /k "npx partykit dev"
cd apps\hub
npm run dev
