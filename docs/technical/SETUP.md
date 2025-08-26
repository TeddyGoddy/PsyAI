# PsyAI - Setup Guide

## Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- Git

## Installation

### 1. Clone and Setup
```bash
git clone <repository-url>
cd PsyAI
```

### 2. Backend Setup
```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Database Setup
```bash
# Create PostgreSQL database
createdb psyai_db

# Run migrations
psql -d psyai_db -f database/migrations/001_initial_setup.sql
psql -d psyai_db -f database/schemas/users.sql
psql -d psyai_db -f database/schemas/sessions.sql
psql -d psyai_db -f database/schemas/analytics.sql

# Optional: Load demo data
psql -d psyai_db -f database/seeds/demo_data.sql
```

### 5. Environment Configuration
Update `.env` file with:
- Database credentials
- Gemini API key
- JWT secret
- Other configuration values

## Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend (build and serve)
cd frontend
npm run build
# Serve build folder with your preferred web server
```

## API Keys Setup

### Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Add to `.env` as `GEMINI_API_KEY`

## Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check PostgreSQL is running and credentials are correct
2. **Gemini API errors**: Verify API key is valid and has proper permissions
3. **Port conflicts**: Ensure ports 3000 (frontend) and 3001 (backend) are available

### Logs
- Backend logs: Check console output or configure winston logging
- Frontend logs: Check browser developer console
