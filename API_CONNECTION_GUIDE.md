# API Connection Setup Guide

## Issues Fixed

✅ **CORS Configuration**: Updated backend to accept both localhost:5173 and localhost:5174
✅ **Authentication**: Modified middleware to work with mock user in development
✅ **API Endpoints**: Temporarily disabled auth requirement for testing
✅ **Error Handling**: Added detailed logging for debugging
✅ **Database Setup**: Created initialization scripts

## Quick Start

### 1. Start Backend Server

```bash
cd server
npm install
node start-server.js
```

The server will:

- Test database connection
- Check if tables exist
- Start on port 5000

### 2. Start Frontend Client

```bash
cd client
npm run dev
```

The client will start on port 5174.

### 3. Test Connection

Open browser to `http://localhost:5174/fruit-deliveries` and check browser console for API request logs.

## Database Setup (if needed)

If database tables don't exist:

```bash
cd server
node setup-database.js
```

This will create the `fruit_deliveries` table and insert sample data.

## Environment Configuration

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=crudefi
PORT=5000
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5174
```

### Frontend (Vite Config)

Default API URL: `http://localhost:5000/api`

## Debugging

Check browser console for detailed API request/response logs:

- 🌐 Request details
- 📡 Response status
- 📦 Response data
- ❌ Error messages

## Common Issues

1. **Database Connection**: Ensure PostgreSQL is running
2. **Port Conflicts**: Make sure ports 5000 and 5174 are available
3. **CORS Errors**: Backend now allows both development ports
4. **Auth Errors**: Using mock user in development mode

## Production Notes

Remember to:

- Remove mock user setup
- Re-enable authentication
- Set proper environment variables
- Configure production database
