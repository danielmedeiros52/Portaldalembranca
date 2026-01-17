# Backend-Frontend Integration Issues & Fixes

## Critical Issues Found

### 1. **Broken Authentication in Production (Vercel Serverless)**

**Location**: `server/api/[trpc].ts:48-52`

**Problem**: The Vercel serverless function hardcodes `user: null` in the tRPC context, completely bypassing authentication in production.

```typescript
createContext: async () => ({
  req: req as any,
  res: res as any,
  user: null, // ❌ CRITICAL: Authentication completely disabled!
}),
```

**Why this causes "Unexpected end of JSON input"**:
- When users try to log in, the tRPC procedure executes successfully
- But protected routes fail silently or return empty responses
- The frontend tries to parse an empty response as JSON, causing the error

**Impact**:
- Users cannot log in production
- Protected procedures are accessible to everyone (security vulnerability)
- Session management is broken

---

### 2. **Inconsistent Server Architectures**

**Problem**: The project has TWO different server setups that don't match:

#### Development Mode (`npm run dev`)
- Uses: `server/api/src/main.ts` (NestJS-like Express server)
- Entry point: Custom Express app
- tRPC: NOT integrated (only REST endpoints for payments)
- Runs on: http://localhost:3000

#### Production Mode (Vercel)
- Uses: `api/[trpc].ts` (Vercel serverless function)
- Entry point: Vercel serverless handler
- tRPC: Integrated via `fetchRequestHandler`
- Deployed to: Vercel edge functions

**Why this is problematic**:
1. Different codepaths between dev and production
2. Bugs only appear in production (like the current auth issue)
3. Harder to test production behavior locally
4. Maintenance burden of keeping two servers in sync

---

### 3. **Missing tRPC Integration in Main Server**

**Problem**: The main Express server (`server/_core/index.ts`) is correctly configured with tRPC and authentication, but it's NOT being used in production.

```typescript
// server/_core/index.ts - CORRECT implementation (not used in production)
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext, // ✅ Properly uses SDK authentication
  })
);
```

But `package.json` scripts don't use this file:
```json
"dev": "tsx watch server/api/src/main.ts",  // ❌ Wrong server
"start": "node dist/main.js"                // ❌ Wrong server
```

---

### 4. **Cookie Configuration Issues**

**Location**: `server/api/[trpc].ts:11`

**Problem**: CORS is set to `Access-Control-Allow-Origin: *` but credentials are enabled. This is a contradiction.

```typescript
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Credentials", "true");
```

**Why this is wrong**:
- Browsers reject `credentials: 'include'` when origin is `*`
- Must specify exact origin for cookie-based auth
- Currently breaks session cookies in production

---

### 5. **Missing Error Handling in Serverless Function**

**Location**: `server/api/[trpc].ts:64-67`

**Problem**: Generic error handling that hides the real error:

```typescript
catch (error) {
  console.error("tRPC handler error:", error);
  res.status(500).json({ error: "Internal server error" }); // ❌ Generic message
}
```

**Why this causes JSON parsing errors**:
- When tRPC procedures throw errors, they're caught here
- The generic error might not be valid JSON in all cases
- Stack traces and real error messages are hidden

---

## Recommended Fixes

### Fix #1: Restore Authentication in Vercel Handler

**File**: `server/api/[trpc].ts`

Replace the broken `createContext` with proper authentication:

```typescript
import { sdk } from "../../server/_core/sdk";
import { createContext as createTrpcContext } from "../../server/_core/context";

// In the handler function, replace lines 44-52:
const response = await fetchRequestHandler({
  endpoint: "/api/trpc",
  req: request,
  router: appRouter,
  createContext: async () => {
    // Properly authenticate using SDK
    let user = null;
    try {
      user = await sdk.authenticateRequest(req as any);
    } catch (error) {
      // Authentication is optional for public procedures
      user = null;
    }

    return {
      req: req as any,
      res: res as any,
      user,
    };
  },
});
```

---

### Fix #2: Fix CORS Configuration

**File**: `server/api/[trpc].ts`

Replace wildcard origin with proper configuration:

```typescript
// Get origin from request headers
const origin = req.headers.origin || req.headers.referer || "*";

// Only allow credentials if origin is not wildcard
if (origin !== "*") {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
} else {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Don't set credentials header
}

res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
```

---

### Fix #3: Improve Error Handling

**File**: `server/api/[trpc].ts`

Add better error logging and response handling:

```typescript
} catch (error) {
  console.error("tRPC handler error:", error);

  // Preserve tRPC error format if possible
  if (error instanceof Error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  }

  // Send proper JSON error response
  res.setHeader("Content-Type", "application/json");
  res.status(500).json({
    error: "Internal server error",
    // Include message in development
    ...(process.env.NODE_ENV === "development" && {
      message: error instanceof Error ? error.message : "Unknown error"
    })
  });
}
```

---

### Fix #4: Use Consistent Server Entry Point

**Option A: Use Vercel Functions (Recommended for Vercel deployment)**

Keep the serverless function but fix the issues above. No changes to scripts needed.

**Option B: Use Single Express Server (Better for traditional deployment)**

If moving away from Vercel or want consistent behavior:

1. Update `package.json` scripts:
```json
"dev": "tsx watch server/_core/index.ts",
"start": "node dist/index.js"
```

2. Update `tsconfig.server.json`:
```json
{
  "compilerOptions": {
    "rootDir": "server",
    "outDir": "dist"
  },
  "include": ["server/**/*"]
}
```

3. Remove or deprecate `server/api/src/main.ts` (NestJS-like server)

---

### Fix #5: Add Production Testing

**File**: Create `scripts/test-production.sh`

```bash
#!/bin/bash
# Build and test production mode locally

echo "Building for production..."
npm run build
npm run build:client

echo "Starting production server..."
NODE_ENV=production npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo "Testing /api/trpc endpoint..."
curl -X POST http://localhost:3000/api/trpc/auth.me \
  -H "Content-Type: application/json" \
  -d '{}'

# Cleanup
kill $SERVER_PID
```

---

## Additional Recommendations

### 1. Add Request Logging

Add middleware to log all requests in production:

```typescript
// In Vercel handler
console.log("[tRPC Request]", {
  method: req.method,
  url: req.url,
  headers: req.headers,
  timestamp: new Date().toISOString(),
});
```

### 2. Add Health Check Endpoint

Create `api/health.ts`:

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
}
```

### 3. Add Response Headers Logging

```typescript
// After response is received
console.log("[tRPC Response]", {
  status: response.status,
  headers: Object.fromEntries(response.headers.entries()),
  timestamp: new Date().toISOString(),
});
```

---

## Testing Plan

### 1. Local Testing
```bash
# Install dependencies
pnpm install

# Test development mode
pnpm dev
# Visit http://localhost:3000/login and test login

# Test production build locally
pnpm build
NODE_ENV=production pnpm start
# Visit http://localhost:3000/login and test login
```

### 2. Vercel Preview Testing
```bash
# Push to a feature branch
git checkout -b fix/auth-integration
git add .
git commit -m "Fix authentication in production"
git push origin fix/auth-integration

# Vercel will create a preview deployment
# Test the preview URL thoroughly before merging
```

### 3. Production Verification
After deploying to production:
1. Test funeral home login
2. Test family user login
3. Test protected routes (dashboard)
4. Check browser console for errors
5. Verify cookies are set correctly
6. Test logout functionality

---

## Priority Order

1. **CRITICAL**: Fix #1 (Authentication) - Users can't log in
2. **HIGH**: Fix #2 (CORS) - Breaks cookie-based sessions
3. **MEDIUM**: Fix #3 (Error Handling) - Better debugging
4. **LOW**: Fix #4 (Consistency) - Technical debt
5. **LOW**: Fix #5 (Testing) - Prevention

---

## Rollback Plan

If issues persist after deployment:

1. Revert the commit
2. Deploy previous version
3. Add more logging to understand the issue
4. Test fixes in preview environment first

---

## Questions to Resolve

1. Is the NestJS-like server (`server/api/src/main.ts`) still needed?
   - Currently only used for Stripe payments
   - Could integrate payments into tRPC instead

2. Should we consolidate to a single server architecture?
   - Pro: Consistency between dev and production
   - Con: Vercel serverless functions have benefits (auto-scaling, edge)

3. Do we need the Express middleware server (`server/_core/index.ts`)?
   - Currently unused in production
   - Could be removed if Vercel functions work properly
