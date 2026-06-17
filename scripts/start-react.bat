@echo off
REM Code2Resume - React Frontend + Backend Startup Script

echo 🚀 Starting Code2Resume (React Frontend + Backend)...
echo.

cd /d "%~dp0\.."

REM Check if backend dependencies are installed
if not exist "env\" if not exist ".venv\" (
    echo ⚠️  Backend virtual environment not found!
    echo Run: uv sync
    echo.
    set /p install_backend="Install backend dependencies now? (y/n): "
    if /i "%install_backend%"=="y" (
        uv sync
    ) else (
        exit /b 1
    )
)

REM Check if React frontend dependencies are installed
if not exist "frontend-react\node_modules\" (
    echo ⚠️  React frontend dependencies not found!
    echo.
    set /p install_frontend="Install frontend dependencies now? (y/n): "
    if /i "%install_frontend%"=="y" (
        cd frontend-react
        call npm install
        cd ..
    ) else (
        exit /b 1
    )
)

echo.
echo ✨ Starting services...
echo.

REM Start backend in new window
echo 📡 Starting FastAPI backend on http://localhost:8001...
start "Code2Resume Backend" cmd /k "scripts\start.bat"

REM Wait for backend to start
timeout /t 3 /nobreak > nul

REM Start React frontend
echo ⚛️  Starting React frontend on http://localhost:5173...
echo.
echo ─────────────────────────────────────────────────────
echo ✅ Backend:  http://localhost:8001
echo ✅ Frontend: http://localhost:5173
echo ─────────────────────────────────────────────────────
echo.
echo Press CTRL+C to stop frontend service
echo Close both windows to stop all services
echo.

cd frontend-react
npm run dev

pause
