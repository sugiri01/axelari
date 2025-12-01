# Integration Guide: Frontend & Auth Microservice

## Overview
This guide explains how the React frontend interacts with the Node.js Authentication Microservice.

## 1. Backend: Auth Microservice
**Location**: `../auth-service`
**Port**: 3000 (default)

### Running the Backend
1.  Navigate to `auth-service` directory.
2.  Install dependencies: `npm install`
3.  Set up environment variables:
    -   Copy `.env.example` to `.env`.
    -   Update `DATABASE_URL` with your Neon connection string.
    -   Update `JWT_SECRET`.
4.  Start the server: `npm run dev`

### API Endpoints
-   `POST /auth/register`: Register a new user.
    -   Body: `{ "name": "...", "email": "...", "password": "..." }`
-   `POST /auth/login`: Login existing user.
    -   Body: `{ "email": "...", "password": "..." }`
-   `GET /auth/me`: Get current user profile (Protected).
    -   Headers: `Authorization: Bearer <token>`

## 2. Frontend: React App
**Location**: `./` (axelari1-main)
**Port**: 5173 (Vite default)

### Running the Frontend
1.  Navigate to `axelari1-main` directory.
2.  Install dependencies: `npm install` (ensure `axios` is installed).
3.  Start the app: `npm run dev`

### Integration Points
-   **API Client**: `src/services/api.ts` handles Axios configuration and token attachment.
-   **Auth Service**: `src/services/authService.ts` defines the API calls to the backend.
-   **Auth Context**: `src/context/AuthContext.tsx` manages user state and token storage (localStorage).
-   **Protected Routes**: `src/components/ProtectedRoute.tsx` ensures only authenticated users can access the dashboard.

## 3. How it Works
1.  **Login/Register**: User submits form -> `AuthContext` calls `authService` -> API request to Backend.
2.  **Token Storage**: On success, JWT is stored in `localStorage`.
3.  **Authenticated Requests**: `api.ts` interceptor reads token from `localStorage` and adds `Authorization` header to every request.
4.  **Session Check**: On app load, `AuthContext` checks for token and calls `/auth/me` to validate session and get user details.
5.  **Logout**: Clears `localStorage` and redirects to login.

## 4. Database Setup
Ensure PostgreSQL is running and you have created the database `axelari_auth`.
Run the schema script in `src/db/schema.sql` to create the `users` table.

```sql
CREATE DATABASE axelari_auth;
-- Connect to axelari_auth
-- Run content of src/db/schema.sql
```
