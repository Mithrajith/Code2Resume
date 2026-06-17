#!/bin/bash

# Code2Resume - React Frontend + Backend Startup Script
echo "🚀 Starting Code2Resume (React Frontend + Backend)..."
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if backend dependencies are installed
if [ ! -d "env" ] && [ ! -d ".venv" ]; then
    echo "⚠️  Backend virtual environment not found!"
    echo "Run: uv sync"
    echo ""
    read -p "Install backend dependencies now? (y/n): " install_backend
    if [ "$install_backend" = "y" ]; then
        uv sync
    else
        exit 1
    fi
fi

# Check if React frontend dependencies are installed
if [ ! -d "frontend-react/node_modules" ]; then
    echo "⚠️  React frontend dependencies not found!"
    echo ""
    read -p "Install frontend dependencies now? (y/n): " install_frontend
    if [ "$install_frontend" = "y" ]; then
        cd frontend-react
        npm install
        cd ..
    else
        exit 1
    fi
fi

echo ""
echo "✨ Starting services..."
echo ""

# Start backend in background
echo "📡 Starting FastAPI backend on http://localhost:8001..."
./scripts/start.sh > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start React frontend
echo "⚛️  Starting React frontend on http://localhost:5173..."
echo ""
echo "─────────────────────────────────────────────────────"
echo "✅ Backend:  http://localhost:8001"
echo "✅ Frontend: http://localhost:5173"
echo "─────────────────────────────────────────────────────"
echo ""
echo "Press CTRL+C to stop all services"
echo ""

cd frontend-react
npm run dev

# Cleanup: Kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null
echo ""
echo "👋 Services stopped"
