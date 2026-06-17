#!/bin/bash

# Code2Resume - Full Stack Startup Script
echo "🚀 Starting Code2Resume..."
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

PROJECT_ROOT=$(pwd)

# Check if backend virtual environment exists
if [ ! -d "env" ] && [ ! -d ".venv" ]; then
    echo "❌ Backend virtual environment not found!"
    echo "Please run: uv sync"
    exit 1
fi

# Check if React frontend dependencies are installed
if [ ! -d "frontend-react/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend-react
    npm install
    cd "$PROJECT_ROOT"
fi

echo ""
echo "✨ Starting services..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "   ✓ Backend stopped"
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "   ✓ Frontend stopped"
    fi
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM EXIT

# Start backend
echo "📡 Starting FastAPI backend on http://localhost:8001..."
if [ -d "env" ]; then
    source env/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

echo "   ✓ Backend started (PID: $BACKEND_PID)"

# Start React frontend
echo "⚛️  Starting React frontend on http://localhost:5173..."
cd frontend-react
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

# Wait for frontend to start
sleep 3

echo "   ✓ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "─────────────────────────────────────────────────────"
echo "✅ Code2Resume is running!"
echo ""
echo "   Backend:  http://localhost:8001"
echo "   Frontend: http://localhost:5173"
echo "   API Docs: http://localhost:8001/docs"
echo "─────────────────────────────────────────────────────"
echo ""
echo "Press CTRL+C to stop all services"
echo ""

# Wait for background processes
wait
