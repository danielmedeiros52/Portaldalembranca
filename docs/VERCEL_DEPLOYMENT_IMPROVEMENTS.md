# Vercel Deployment Improvements

This document outlines recommended improvements to make the Portal da Lembrança project easier to deploy and maintain on Vercel.

## Current Issues

1. **Mixed Module Systems**: CommonJS (`package.json: "type": "commonjs"`) vs ES Modules (modern dependencies like `jose`)
2. **Path Aliases**: `@shared/*` aliases don't resolve properly in serverless functions
3. **Dual Architecture**: Both NestJS-like API and tRPC increase complexity
4. **TypeScript Compilation**: Vercel compiles TypeScript on-the-fly, causing module resolution issues
5. **Dependency Bundling**: Server dependencies aren't properly bundled with serverless functions

## Recommended Solutions

### 1. Convert to Full ES Modules (HIGH PRIORITY)

**Why**: Modern Node.js and Vercel prefer ES modules. This eliminates CommonJS/ESM interop issues.

**Implementation**:

```json
// package.json
{
  "type": "module",
  "exports": {
    "./server/*": "./server/*",
    "./shared/*": "./shared/*"
  }
}
```

**Changes needed**:
- Change all `require()` to `import`
- Change all `module.exports` to `export`
- Update file extensions to `.mjs` or use `"type": "module"`
- Update `tsconfig.json` to use `"module": "ES2022"` or `"ESNext"`

**Benefits**:
- No more `ERR_REQUIRE_ESM` errors
- Native support for modern packages like `jose`, `nanoid`, etc.
- Better tree-shaking and smaller bundles
- Aligns with modern JavaScript standards

### 2. Bundle Serverless Functions with esbuild (HIGH PRIORITY)

**Why**: Pre-bundling eliminates runtime module resolution issues and reduces cold start times.

**Implementation**:

Install dependencies:
```bash
pnpm add -D esbuild @vercel/nft
```

Create bundler script:
```javascript
// scripts/bundle-functions.mjs
import * as esbuild from 'esbuild';
import { nodeFileTrace } from '@vercel/nft';

await esbuild.build({
  entryPoints: ['api/trpc/[...trpc].ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: '.vercel/output/functions/api/trpc',
  external: ['@neondatabase/serverless'], // Don't bundle native modules
  sourcemap: true,
  minify: false, // Keep readable for debugging
});
```

Update `package.json`:
```json
{
  "scripts": {
    "build:functions": "node scripts/bundle-functions.mjs",
    "build:vercel": "npm run build:functions && npm run build:client"
  }
}
```

Update `vercel.json`:
```json
{
  "functions": {
    "api/trpc/[...trpc].ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

**Benefits**:
- All dependencies bundled into single file
- No runtime module resolution
- Faster cold starts
- No need for `includeFiles` configuration

### 3. Simplify Path Resolution (MEDIUM PRIORITY)

**Option A: Use relative paths only** (Current approach)
- Replace all `@shared/*` with relative paths
- Simple but verbose

**Option B: Use subpath imports** (Recommended for ES modules)
```json
// package.json
{
  "imports": {
    "#shared/*": "./shared/*",
    "#server/*": "./server/*"
  }
}
```

Then use:
```typescript
import { COOKIE_NAME } from '#shared/const';
```

**Benefits**:
- Native Node.js feature (no build tools needed)
- Works in both development and production
- Clear distinction from external packages (`#` prefix)

### 4. Consolidate to Single Backend Architecture (MEDIUM PRIORITY)

**Why**: Having both NestJS-like API (Express decorators) and tRPC adds complexity.

**Recommendation**: Keep only tRPC, migrate payment endpoints.

**Implementation**:

Move payment endpoints to tRPC:
```typescript
// server/routers.ts
export const appRouter = router({
  // ... existing routes

  payments: router({
    createPaymentIntent: protectedProcedure
      .input(z.object({
        amount: z.number(),
        currency: z.string().default('brl'),
        memorialId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Payment logic here (migrate from payments.service.ts)
        return { clientSecret: '...' };
      }),
  }),
});
```

Remove:
- `server/api/src/` directory
- Express server setup
- Decorator-based controllers

**Benefits**:
- Single API surface
- End-to-end type safety everywhere
- Simpler deployment (only one serverless function)
- Easier testing and maintenance

### 5. Optimize TypeScript Configuration (LOW PRIORITY)

**Current issue**: Multiple conflicting tsconfig files.

**Recommendation**: Single configuration with proper project references.

```json
// tsconfig.json (root)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "#shared/*": ["./shared/*"],
      "#server/*": ["./server/*"]
    }
  }
}
```

```json
// tsconfig.client.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["client/src/**/*"]
}
```

```json
// tsconfig.server.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "dist/server"
  },
  "include": ["server/**/*", "api/**/*", "shared/**/*"]
}
```

### 6. Use Vercel Build Output API (ADVANCED)

**Why**: More control over the build process and output structure.

**Implementation**:

Create custom build script:
```javascript
// scripts/vercel-build.mjs
import { writeFileSync, mkdirSync } from 'fs';

// Build client
await $`vite build`;

// Build serverless functions with esbuild
await bundleFunctions();

// Generate .vercel/output/config.json
const config = {
  version: 3,
  routes: [
    { src: '/api/trpc/.*', dest: '/api/trpc' },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' }
  ]
};

mkdirSync('.vercel/output', { recursive: true });
writeFileSync('.vercel/output/config.json', JSON.stringify(config, null, 2));
```

Update `vercel.json`:
```json
{
  "buildCommand": "node scripts/vercel-build.mjs"
}
```

**Benefits**:
- Full control over output structure
- Can optimize for Vercel's edge network
- Better caching strategies

### 7. Environment Variable Management

**Current issue**: Environment variables scattered across codebase.

**Recommendation**: Centralized environment validation.

```typescript
// shared/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().optional(),
  OAUTH_SERVER_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
```

Update Vercel project settings to include required variables with validation.

### 8. Add Deployment Health Checks

**Implementation**:

```typescript
// api/health.ts
async function handler(req: any, res: any) {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Test database connection
    const db = await getDb();
    await db.execute('SELECT 1');
    checks.database = true;
  } catch (error) {
    console.error('Health check failed:', error);
  }

  const status = checks.database ? 200 : 503;
  res.status(status).json({
    status: checks.database ? 'healthy' : 'unhealthy',
    checks,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7),
  });
}

module.exports = handler;
```

Add to CI/CD:
```yaml
# .github/workflows/deploy.yml
- name: Health Check
  run: |
    sleep 10
    curl -f https://your-app.vercel.app/api/health || exit 1
```

## Priority Implementation Order

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Fix path aliases (use relative paths) - DONE
2. ✅ Fix ES module imports (dynamic imports) - DONE
3. Add environment validation
4. Add health check endpoint

### Phase 2: Module System Migration (4-6 hours)
1. Convert to ES modules
2. Update all imports/exports
3. Update TypeScript configuration
4. Test all endpoints

### Phase 3: Architecture Simplification (6-8 hours)
1. Migrate payments to tRPC
2. Remove NestJS-like framework
3. Consolidate to single API
4. Update frontend to use new endpoints

### Phase 4: Build Optimization (2-4 hours)
1. Add esbuild bundler
2. Configure Vercel Build Output API
3. Optimize cold start times
4. Add deployment checks

## Migration Checklist

### Converting to ES Modules

- [ ] Update `package.json` to `"type": "module"`
- [ ] Change all `require()` to `import`
- [ ] Change all `module.exports` to `export`
- [ ] Update `tsconfig.json` to `"module": "ES2022"`
- [ ] Update file extensions if needed
- [ ] Test locally with `NODE_OPTIONS=--experimental-specifier-resolution=node`
- [ ] Update Vercel configuration
- [ ] Deploy and test

### Adding Bundler

- [ ] Install esbuild
- [ ] Create bundler script
- [ ] Test bundle locally
- [ ] Update build command in package.json
- [ ] Update vercel.json
- [ ] Remove `includeFiles` configuration
- [ ] Deploy and test bundle size

### Consolidating Architecture

- [ ] Audit all NestJS-like endpoints
- [ ] Create tRPC procedures for each endpoint
- [ ] Update frontend to use tRPC client
- [ ] Test all migrated endpoints
- [ ] Remove old API code
- [ ] Update documentation

## Expected Benefits

After implementing these improvements:

1. **Faster Deployments**: Bundled functions deploy 3-5x faster
2. **Reduced Errors**: No more module resolution issues
3. **Better Performance**: ~50% faster cold starts with bundling
4. **Easier Maintenance**: Single API architecture, clear module system
5. **Type Safety**: Full end-to-end type safety with tRPC
6. **Modern Stack**: Using current JavaScript standards

## Additional Resources

- [Vercel Build Output API](https://vercel.com/docs/build-output-api/v3)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [esbuild Bundling](https://esbuild.github.io/)
- [tRPC Documentation](https://trpc.io/docs)

## Questions or Issues?

Document any issues encountered during migration in this file for future reference.
