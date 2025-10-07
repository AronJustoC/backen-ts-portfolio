# Implementing Role-Based Access Control (RBAC)

This guide details the steps to implement a role-based access control system,
differentiating between `USER` and `ADMIN` roles. Each step includes the necessary
code changes, a verification checkpoint, and a sample git commit message
following conventional standards.

---

### Step 1: Update the Database Schema

First, we need to modify our database schema to store the user's role. We will add a `Role` enum and a `role` field to the `User` model.

**File:** `prisma/schema.prisma`

```prisma
// Add this enum to define the available roles
enum Role {
  USER
  ADMIN
}

// Add the `role` field to your User model
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER) // New field with default value
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### ► Checkpoint [ ]

After saving the file, run the migration command. A new migration folder should be created in `prisma/migrations`, and the command should complete without errors.

```sh
bun run prisma:migrate:dev --name add_user_role
```

#### ► Git Commit

```bash
feat(auth): add role to user model

- Defines a `Role` enum with `USER` and `ADMIN` values.
- Adds a `role` field to the `User` model in the Prisma schema, setting the default role for new users to `USER`.
- Includes the generated database migration files.

This is the foundational step for implementing RBAC.
```

---

### Step 2: Include Role in JWT Payload

To perform authorization checks efficiently, the user's role must be included in the JSON Web Token (JWT) payload created during login.

**File:** `src/types/express.d.ts`

```typescript
// src/types/express.d.ts
export interface UserPayload {
  id: string;
  role: string; // Add the role property
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
```

**File:** `src/services/auth.services.ts` (or your equivalent login service)

```typescript
// src/services/auth.services.ts
// ... inside your login function, after finding the user

const payload: UserPayload = { id: user.id, role: user.role }; // Ensure the payload includes the role
const token = generateToken(payload);

// ... return the token
```

#### ► Checkpoint [ ]

Log in as a user and copy the returned JWT. Decode it using a tool like [jwt.io](https://jwt.io/). The decoded payload section must contain the user's `id` and `role`.

#### ► Git Commit

```bash
feat(auth): include user role in JWT payload

- Updates the `UserPayload` type to include the `role` property.
- Modifies the authentication service to add the user's role to the JWT payload upon successful login.

This makes the user's role available to middleware without requiring an extra database query.
```

---

### Step 3: Create Authorization Middleware

This middleware will protect routes by checking if the authenticated user has the required role.

**Create File:** `src/middleware/role.middleware.ts`

```typescript
// src/middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../types/express';

/**
 * Returns a middleware function that checks if the authenticated user has the required role.
 * @param requiredRole The role required to access the route (e.g., 'ADMIN').
 */
export const checkRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserPayload;

    if (!user || user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Insufficient permissions' });
    }

    return next();
  };
};
```

#### ► Checkpoint [ ]

The file `src/middleware/role.middleware.ts` should exist and contain the `checkRole` higher-order function.

#### ► Git Commit

```bash
feat(auth): create role-checking middleware

- Implements a `checkRole` middleware to authorize requests based on user roles.
- The middleware is a higher-order function that accepts a required role.
- It returns a 403 Forbidden error if the user's role from the JWT payload does not match the required role.
```

---

### Step 4: Protect Routes

Finally, apply the `authMiddleware` and the new `checkRole` middleware to any routes that should be restricted.

**File:** `src/routes/user.routes.ts` (Example)

```typescript
// src/routes/user.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/role.middleware';
import { userController } from '../controllers/user.controller';

const router = Router();

// PUBLIC route - GET all users
router.get('/', userController.getAllUsers);

// PROTECTED route - Only ADMINs can delete a user
router.delete(
  '/:id',
  authMiddleware, // First, ensure user is authenticated
  checkRole('ADMIN'), // Second, ensure user is an ADMIN
  userController.deleteUser,
);

export default router;
```

#### ► Checkpoint [ ]

Attempt to access a protected endpoint (e.g., `DELETE /api/users/some-id`) using a JWT from a regular `USER`. The API must return a `403 Forbidden` error. Then, after creating an `ADMIN` user, try again with an admin token; the request should now be successful.

#### ► Git Commit

```bash
feat(auth): protect user deletion route with admin role

- Applies the `checkRole('ADMIN')` middleware to the `DELETE /api/users/:id` endpoint.
- This ensures that only users with the 'ADMIN' role can delete user accounts, while still allowing any authenticated user to view the user list.
```

---

### Appendix: Creating an Admin User

For security, there is no public API endpoint to create an admin. The recommended way to create your first admin is manually.

1. **Register a new user** through the standard registration endpoint.
2. **Launch Prisma Studio** with the following command:

   ```sh
   bunx prisma studio
   ```

3. In the web interface that opens, select the **User** model.
4. Find the user you just created and click on their `role` field.
5. Change the value from `USER` to `ADMIN` and save the change.

That user will now have admin privileges and can be used to test protected routes.

---

---

## Part 2: Implementing Persistent Sessions with Refresh Tokens

This section explains how to implement a refresh token system to allow for persistent user sessions without compromising security.

### Step 5: Update Schema for Refresh Token

We need to store a hashed version of the refresh token in the database. This allows us to revoke it, providing a secure way to log users out.

**File:** `prisma/schema.prisma`

```prisma
model User {
  // ... existing fields
  role         Role     @default(USER)
  refreshToken String?  @unique // New field for the hashed refresh token
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

#### ► Checkpoint [ ]

Run the database migration. A new migration folder should be created, and the command should complete successfully.

```sh
bun run prisma:migrate:dev --name add_refresh_token
```

#### ► Git Commit

```bash
feat(auth): add refresh token to user schema

- Adds an optional `refreshToken` field to the `User` model.
- This field will store a hashed version of the user's refresh token, allowing for session revocation.
- Includes the generated database migration files.
```

---

### Step 6: Update Login Logic for Refresh Tokens

The login process will now generate two tokens: a short-lived `accessToken` and a long-lived `refreshToken`. The refresh token will be sent as a secure `HttpOnly` cookie.

**File:** `src/services/auth.services.ts`

```typescript
// ... inside your login service
// 1. Generate tokens with different secrets and lifespans
const accessToken = jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '15m' },
);
const refreshToken = jwt.sign(
  { id: user.id },
  process.env.REFRESH_TOKEN_SECRET!, // Use a different secret
  { expiresIn: '7d' },
);

// 2. Hash and save the refresh token to the database
const hashedRefreshToken = await hashData(refreshToken); // Assumes a hashing utility
await this.userRepository.update(user.id, { refreshToken: hashedRefreshToken });

// 3. Return both tokens to the controller
return { accessToken, refreshToken };
```

**File:** `src/controllers/auth.controller.ts`

```typescript
// ... inside your login controller method
const { accessToken, refreshToken } = await this.authService.loginUser(
  req.body,
);

// Send the refresh token in a secure HttpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Send the access token in the JSON response
res.json({ accessToken });
```

#### ► Checkpoint [ ]

After logging in, inspect your browser's developer tools. Under the "Application" > "Cookies" tab for your backend's domain, you should see a new `HttpOnly` cookie named `refreshToken`. The JSON response from the login request should only contain the `accessToken`.

#### ► Git Commit

```bash
feat(auth): implement refresh token generation on login

- Modifies the login service to generate both a short-lived access token and a long-lived refresh token.
- The refresh token is hashed and stored in the database for the user.
- The login controller now sends the refresh token as a secure, HttpOnly cookie and the access token in the JSON response body.
```

---

### Step 7: Create Refresh Token Endpoint

This new endpoint will use the `refreshToken` from the cookie to issue a new `accessToken`.

**File:** `src/routes/auth.routes.ts`

```typescript
// Add a new route for refreshing the token
router.post('/refresh-token', authController.refreshToken);
```

**File:** `src/controllers/auth.controller.ts` & `src/services/auth.services.ts`

```typescript
// In AuthController
async refreshToken(req: Request, res: Response) {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }
  const newAccessToken = await this.authService.refreshAccessToken(refreshToken);
  res.json({ accessToken: newAccessToken });
}

// In AuthService
async refreshAccessToken(token: string) {
  // 1. Verify the token signature and expiration
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string };

  // 2. Find the user and compare the stored hash with the received token
  const user = await this.userRepository.findById(decoded.id);
  if (!user || !user.refreshToken) throw new Error('Invalid token');

  const isTokenMatch = await compareData(token, user.refreshToken); // Assumes a compare utility
  if (!isTokenMatch) throw new Error('Invalid token');

  // 3. Issue a new access token
  const newAccessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  return newAccessToken;
}
```

#### ► Checkpoint [ ]

With a valid `refreshToken` cookie present in your browser, send a `POST` request to the `/api/auth/refresh-token` endpoint. The response should be a JSON object containing a new, valid `accessToken`.

#### ► Git Commit

```bash
feat(auth): create endpoint to refresh access tokens

- Adds a new `POST /api/auth/refresh-token` endpoint.
- The endpoint uses the `refreshToken` from the HttpOnly cookie to validate the user's session.
- If the refresh token is valid and matches the stored hash in the database, it generates and returns a new, short-lived access token.
```

---

### Step 8: Implement Secure Logout

A secure logout must invalidate the session on the server side. We do this by clearing the stored refresh token.

**File:** `src/routes/auth.routes.ts`

```typescript
// Add a new route for logging out
router.post('/logout', authMiddleware, authController.logout);
```

**File:** `src/controllers/auth.controller.ts` & `src/services/auth.services.ts`

```typescript
// In AuthController
async logout(req: Request, res: Response) {
  const userId = req.user!.id; // From authMiddleware
  await this.authService.logoutUser(userId);
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
}

// In AuthService
async logoutUser(userId: string) {
  // Invalidate the session by clearing the refresh token from the database
  await this.userRepository.update(userId, { refreshToken: null });
}
```

#### ► Checkpoint [ ]

After calling the `/api/auth/logout` endpoint, the `refreshToken` cookie should be removed from the browser. Any subsequent attempt to use the `/api/auth/refresh-token` endpoint should fail with a `401` or `403` error.

#### ► Git Commit

```bash
feat(auth): implement secure logout by revoking refresh token

- Creates a `POST /api/auth/logout` endpoint.
- The user's stored refresh token hash is cleared from the database, invalidating the session on the server.
- The `refreshToken` cookie is cleared from the user's browser.
```
