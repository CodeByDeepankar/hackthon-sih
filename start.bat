@echo off
echo 🚀 Starting Gamified STEM Learning Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if backend .env file exists
if not exist "backend\.env" (
    echo ⚠️  Backend .env file not found. Copying from example...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo 📝 Please edit backend\.env with your CouchDB credentials
    echo.
    pause
)

REM Check if frontend .env.local file exists
if not exist "frontend\.env.local" (
    echo ⚠️  Frontend .env.local file not found. Copying from example...
    copy "frontend\.env.local.example" "frontend\.env.local"
)

echo.
echo 📦 Installing dependencies...

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🌐 Starting servers...
echo.
echo Backend will start on: http://localhost:4000
echo Frontend will start on: http://localhost:3000
echo.
echo Press Ctrl+C in each terminal to stop the servers
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd backend && npm start"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo 🎉 Servers started! Check the new terminal windows.
echo.
echo 📋 Next steps:
echo 1. Wait for both servers to start completely
echo 2. Visit http://localhost:3000 in your browser
echo 3. Create an account and choose your role (Teacher/Student)
echo.
pause
