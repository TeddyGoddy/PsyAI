# PsyAI API Documentation

## Overview
PsyAI Backend API provides endpoints for AI-powered psychological support application.

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/verify` - Verify JWT token

### AI Services
- `POST /ai/analyze` - Analyze text content
- `POST /ai/generate-questions` - Generate adaptive questions
- `POST /ai/what-if-scenarios` - Generate alternative scenarios
- `POST /ai/extract-themes` - Extract themes from texts

### Analysis
- `POST /analysis/upload-document` - Upload and analyze documents
- `POST /analysis/create-visualization` - Create visualization data
- `POST /analysis/generate-report` - Generate executive reports (psychologists only)

### Data Management
- `GET /data/sessions` - Get user sessions
- `POST /data/sessions` - Save session data
- `GET /data/insights` - Get AI insights
- `GET /data/timeline` - Get timeline data

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/preferences` - Update user preferences

## Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "error": "Error message if success is false"
}
```

## Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
