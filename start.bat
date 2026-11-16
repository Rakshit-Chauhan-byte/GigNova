@echo off
echo ===================================================
echo             GigNova Platform Launcher
echo         Sharda University - PBL Evaluation
echo ===================================================
echo.
echo Starting GigNova Backend API on port 5000...
start "GigNova Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting GigNova Frontend Client on port 5173...
start "GigNova Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo Platform Services Initialized!
echo Backend API:  http://localhost:5000/api
echo Frontend Web: http://localhost:5173
echo.
echo Demo Credentials:
echo   - Admin:    admin@gignova.com   / Admin@123456
echo   - Student:  student@gignova.com / Student@123
echo   - Business: business@gignova.com / Business@123
echo.
echo SmartMatch Demo Businesses:
echo   - TechNova (100 Applicants): demo-biz-technova@demo.gignova.com / Demo@12345
echo   - CloudScale (3 Gigs):       demo-biz-cloud@demo.gignova.com    / Demo@12345
echo   - PixelCraft (2 Gigs):       demo-biz-design@demo.gignova.com   / Demo@12345
echo ===================================================
echo.
pause
