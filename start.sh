#!/bin/bash

echo "🚀 Starting GYANARATNA Platform..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js is installed"

# Check if backend .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Copying from example..."
    cp "backend/.env.example" "backend/.env"
    echo
    echo "📝 Please edit backend/.env with your CouchDB credentials"
    echo
    read -p "Press Enter to continue..."
fi

# Check if frontend .env.local file exists
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Frontend .env.local file not found. Copying from example..."
    cp "frontend/.env.local.example" "frontend/.env.local"
fi

echo
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo
echo "✅ Dependencies installed successfully!"
echo
echo "🌐 Starting servers..."
echo
echo "Backend will start on: http://localhost:4000"
echo "Frontend will start on: http://localhost:3000"
echo
echo "Press Ctrl+C in each terminal to stop the servers"
echo

# Start backend in background
echo "Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "🎉 Servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "📋 Next steps:"
echo "1. Wait for both servers to start completely"
echo "2. Visit http://localhost:3000 in your browser"
echo "3. Create an account and choose your role (Teacher/Student)"
echo
echo "To stop servers, run: kill $BACKEND_PID $FRONTEND_PID"

# Wait for user input
read -p "Press Enter to exit..."

# Kill background processes
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
