# CrudeFi Server

Backend API server for the CrudeFi financial management system.

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your configuration:

   ```bash
   cp .env.example .env
   ```

3. **Database Setup**
   Ensure your PostgreSQL database is running and configured in the `.env` file.

4. **Start Server**
   ```bash
   npm start
   ```

## Authentication

The system uses JWT-based authentication with role-based access control.

### Roles

- **admin**: Full access to all resources
- **manager**: Most resources with limited admin functions
- **staff**: Basic CRUD operations on most resources
- **viewer**: Read-only access

### API Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only in production)
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

#### Protected Routes

All API routes except auth routes require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Usage Examples

#### Login

```javascript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});
const data = await response.json();
const token = data.token;
```

#### Making Authenticated Requests

```javascript
const response = await fetch("/api/petty-cash", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## Middleware

### `authenticateToken`

Verifies JWT tokens and adds user info to request object.

### `authMiddleware`

Enhanced role-based access control with granular permissions:

- `requirePermission(resource, action)` - Check specific permissions
- `requireRoles(...roles)` - Check user roles
- `requireAdmin()` - Admin only
- `requireManager()` - Manager or admin only

### Usage in Routes

```javascript
const {
  requirePermission,
  requireAdmin,
} = require("./middleware/authMiddleware");

// Require specific permission
router.get(
  "/",
  authenticateToken,
  requirePermission("petty_cash", "read"),
  getPettyCash
);

// Require admin role
router.delete("/:id", authenticateToken, requireAdmin, deletePettyCash);
```

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with configurable expiration
- Role-based access control
- Input validation and sanitization
- Error handling without information leakage

## Development

For development, you can enable the mock user middleware by uncommenting the relevant section in `server/index.js`.
