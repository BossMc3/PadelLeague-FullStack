# Frontend Auth API Contract

Base URL: http://localhost:8080/api
All endpoints below are relative to /api.

## 1) Login
Endpoint: POST /auth/login

Request body:
{
  "email": "user@example.com",
  "password": "secret123"
}

Success response (200):
{
  "token": "jwt-or-session-token",
  "email": "user@example.com",
  "role": "ROLE_USER"
}

Notes:
- role must be ROLE_USER or ROLE_ADMIN.
- Frontend stores token in localStorage as key: token.
- Frontend stores { email, role } in localStorage as key: user.

## 2) Register
Endpoint: POST /auth/register

Request body:
{
  "email": "new@example.com",
  "password": "secret123",
  "role": "USER"
}

Allowed role values from frontend form:
- USER
- PLAYER
- ADMIN

Success response (200):
{
  "token": "jwt-or-session-token",
  "email": "new@example.com",
  "role": "ROLE_USER"
}

Notes:
- Frontend expects same response shape as login.
- If role mapping is needed, backend can map USER/PLAYER/ADMIN to ROLE_USER/ROLE_ADMIN.

## 3) Forgot Password
Endpoint: POST /auth/forgot-password

Request body:
{
  "email": "user@example.com"
}

Success response (200):
- Any JSON or empty body is fine.
- Frontend only checks success/failure status.

Error response:
- Any non-2xx status marks request as failed in UI.

## 4) Reset Password
Endpoint: POST /auth/reset-password

Request body:
{
  "token": "reset-token",
  "newPassword": "newSecret123"
}

Success response (200):
- Any JSON or empty body is fine.
- Frontend shows success message then redirects to /login.

Error response:
- Any non-2xx status shows error message.

## 5) CORS
Frontend runs on Next.js dev server, usually:
- http://localhost:3000

Backend should allow CORS from frontend origin.

## 6) Quick checklist for backend developer
- Implement POST /api/auth/login
- Implement POST /api/auth/register
- Implement POST /api/auth/forgot-password
- Implement POST /api/auth/reset-password
- Return { token, email, role } for login/register
- Use ROLE_USER / ROLE_ADMIN values in response role
