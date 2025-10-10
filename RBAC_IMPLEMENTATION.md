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

#### ► Checkpoint [X]

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

#### ► Checkpoint [X]

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

#### ► Checkpoint [X]

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

---

## Part 2: Implementing Persistent Sessions with Redis

This section explains how to implement a refresh token system using Redis. This is the recommended, high-performance approach for managing persistent sessions securely.

### Step 5: Configure Redis and Client

First, set up Redis and install the client library in the project.

1.  **Run Redis:** For local development, the easiest way is with Docker.
    ```sh
    docker run -d -p 6379:6379 --name my-redis redis
    ```
2.  **Install Redis Client:** We will use `ioredis`.
    ```sh
    bun add ioredis
    ```
3.  **Create Redis Utility:** Create a file to manage the Redis client instance.

    **Create File:** `src/utils/redis.utils.ts`

    ```typescript
    import Redis from 'ioredis';

    // It's recommended to use environment variables for connection details
    const redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null, // Important for handling connection drops
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis successfully!');
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    export default redisClient;
    ```

#### ► Checkpoint [ ]

After starting the application, you should see the "Connected to Redis successfully!" message in your console. `ioredis` should be listed as a dependency in your `package.json`.

#### ► Git Commit

```bash
feat(config): add redis client and configuration

- Adds `ioredis` library to handle Redis connections.
- Creates a reusable Redis client utility with connection logic and error handling.
- Recommends using Docker for local Redis instance.
```

---

### Step 6: Update Login Logic for Redis

The login process will now store the `refreshToken` in Redis instead of the main database.

**File:** `src/services/auth.services.ts`

```typescript
// ... import redisClient from '../utils/redis.utils';

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

// 2. Store the refresh token in Redis with a 7-day expiration
const redisKey = `session:${user.id}`;
await redisClient.set(redisKey, refreshToken, 'EX', 7 * 24 * 60 * 60);

// 3. Return both tokens to the controller
return { accessToken, refreshToken };
```

**File:** `src/controllers/auth.controller.ts` (This logic remains the same)

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

After logging in, use a Redis client (`redis-cli`) and run `GET session:<userId>`. The command should return the generated refresh token. The `HttpOnly` cookie should also be present in the browser.

#### ► Git Commit

```bash
feat(auth): store refresh token in redis on login

- Modifies the login service to generate both access and refresh tokens.
- The refresh token is now stored in Redis with the user's ID as the key and a 7-day expiration.
- This decouples session management from the primary database.
```

---

### Step 7: Create Refresh Token Endpoint with Redis

This endpoint will now validate the `refreshToken` against the one stored in Redis.

**File:** `src/services/auth.services.ts`

```typescript
// In AuthService
async refreshAccessToken(token: string) {
  // 1. Verify the token signature and expiration
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string };

  // 2. Check if token exists in Redis and matches the provided one
  const redisKey = `session:${decoded.id}`;
  const storedToken = await redisClient.get(redisKey);

  if (!storedToken || storedToken !== token) {
    throw new Error('Invalid or expired refresh token');
  }

  // 3. Find user to get role for the new payload
  const user = await this.userRepository.findById(decoded.id);
  if (!user) throw new Error('User not found');

  // 4. Issue a new access token
  const newAccessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  return newAccessToken;
}
```

#### ► Checkpoint [ ]

With a valid `refreshToken` cookie, send a `POST` request to `/api/auth/refresh-token`. The response should be a new `accessToken`. If you manually delete the key in Redis and try again, the request must fail.

#### ► Git Commit

```bash
feat(auth): validate refresh token against redis

- Updates the `refreshAccessToken` service to validate the token against the session stored in Redis.
- The endpoint now ensures that the refresh token is not only cryptographically valid but also active in the session store.
- This prevents the use of stolen or old refresh tokens.
```

---

### Step 8: Implement Secure Logout with Redis

A secure logout now means deleting the session from Redis.

**File:** `src/services/auth.services.ts`

```typescript
// In AuthService
async logoutUser(userId: string) {
  // Invalidate the session by deleting the key from Redis
  const redisKey = `session:${userId}`;
  await redisClient.del(redisKey);
}
```

**File:** `src/controllers/auth.controller.ts` (This logic remains the same)

```typescript
// In AuthController
async logout(req: Request, res: Response) {
  const userId = req.user!.id; // From authMiddleware
  await this.authService.logoutUser(userId);
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
}
```

#### ► Checkpoint [ ]

After calling `/api/auth/logout`, the `refreshToken` cookie should be gone from the browser. Use `redis-cli` to confirm that the `session:<userId>` key has been deleted. Any subsequent attempt to refresh the token must fail.

#### ► Git Commit

```bash
feat(auth): implement secure logout by deleting redis session

- Creates a `POST /api/auth/logout` endpoint.
- The user's session is invalidated by deleting the corresponding key from Redis.
- The `refreshToken` cookie is cleared from the user's browser.
```
