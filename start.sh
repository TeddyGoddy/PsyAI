#!/bin/bash

# PsyAI - Startup Script
echo "🚀 Avvio PsyAI - Sistema Completo"
echo "=================================="

# Check if PostgreSQL is running
echo "📊 Controllo PostgreSQL..."
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL non è in esecuzione. Avvio PostgreSQL..."
    brew services start postgresql
    sleep 3
fi

# Check if database exists
echo "🗄️  Controllo database psyai_db..."
if ! psql -lqt | cut -d \| -f 1 | grep -qw psyai_db; then
    echo "📝 Creazione database psyai_db..."
    createdb psyai_db
    echo "🔧 Setup database con utenti demo..."
    cd backend && node scripts/setup-db.js && cd ..
fi

# Install dependencies if needed
echo "📦 Controllo dipendenze..."
if [ ! -d "node_modules" ]; then
    echo "⬇️  Installazione dipendenze root..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "⬇️  Installazione dipendenze backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "⬇️  Installazione dipendenze frontend..."
    cd frontend && npm install && cd ..
fi

# Kill any existing processes on ports 3000 and 3001
echo "🔄 Pulizia processi esistenti..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ Setup completato!"
echo "🌐 Avvio Backend (porta 3001) e Frontend (porta 3000)..."
echo ""
echo "📝 Credenziali di accesso:"
echo "   🩺 Psicologo: demo@psyai.com / password123"
echo "   🧑‍💼 Paziente: paziente@demo.com / password123"
echo ""
echo "🔗 URL Applicazione: http://localhost:3000"
echo "🔗 URL API Backend: http://localhost:3001"
echo ""
echo "⏹️  Per fermare: Ctrl+C"
echo "=================================="

# Start both backend and frontend
npx concurrently \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "blue,green" \
  "cd backend && npm start" \
  "cd frontend && npm start"
