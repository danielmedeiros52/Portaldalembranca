# Migration Guide: Current Stack → Next.js

This is a step-by-step guide to migrate Portal da Lembrança to Next.js.

## Estimated Time: 2-3 days

---

## Phase 1: Setup (30 minutes)

### Step 1: Create New Next.js Project

```bash
# In parent directory (not inside current project)
cd ~/Desktop/personal

# Create new Next.js project with T3 stack
pnpm create t3-app@latest portaldalembranca-next

# When prompted, select:
# ✅ TypeScript
# ✅ Tailwind CSS
# ✅ tRPC
# ✅ Drizzle ORM
# ✅ App Router
# ❌ NextAuth (we'll use our custom auth)
```

### Step 2: Copy Environment Variables

```bash
cd portaldalembranca-next

# Copy env file
cp ../Portaldalembranca/.env.example .env

# Copy actual env (don't commit this)
cp ../Portaldalembranca/.env .env.local
```

### Step 3: Copy Database

```bash
# Copy Drizzle schema and migrations
cp -r ../Portaldalembranca/drizzle ./

# Copy database utilities
mkdir -p src/server
cp ../Portaldalembranca/server/db.ts src/server/db.ts
```

### Step 4: Initial Setup

```bash
# Install dependencies
pnpm install

# Test that it works
pnpm dev
# Open http://localhost:3000
```

---

## Phase 2: Backend Migration (4-6 hours)

### Step 1: Copy Server Code

```bash
# Copy all server logic
cp -r ../Portaldalembranca/server/* src/server/

# Copy shared code
cp -r ../Portaldalembranca/shared src/
```

### Step 2: Update Imports in Server Files

```bash
# Replace @shared/* with relative paths
# Replace ../drizzle/schema with @/drizzle/schema
# Replace ./_core/ with @/server/_core/
```

Example:
```typescript
// Before:
import { COOKIE_NAME } from "../shared/const";

// After:
import { COOKIE_NAME } from "@/shared/const";
```

### Step 3: Create tRPC API Route

Create `src/app/api/trpc/[trpc]/route.ts`:

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
  });

export { handler as GET, handler as POST };
```

### Step 4: Update tRPC Client

T3 Stack already created `src/trpc/react.tsx`. Update it:

```typescript
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@/server/routers";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Step 5: Test Backend

```bash
# Start dev server
pnpm dev

# Test API in browser console:
# fetch('/api/trpc/memorials.list').then(r => r.json())
```

---

## Phase 3: Frontend Migration (6-8 hours)

### Step 1: Copy Components

```bash
# Copy all React components
mkdir -p src/components
cp -r ../Portaldalembranca/client/src/components/* src/components/

# Copy hooks
mkdir -p src/hooks
cp -r ../Portaldalembranca/client/src/hooks/* src/hooks/

# Copy lib utilities
cp -r ../Portaldalembranca/client/src/lib/* src/lib/
```

### Step 2: Migrate Pages One by One

#### Example: Home Page

**Old** (`client/src/pages/Home.tsx`):
```typescript
import { Link } from "wouter";

export function Home() {
  return (
    <div>
      <h1>Portal da Lembrança</h1>
      <Link href="/login">Login</Link>
    </div>
  );
}
```

**New** (`src/app/page.tsx`):
```typescript
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1>Portal da Lembrança</h1>
      <Link href="/login">Login</Link>
    </div>
  );
}
```

**Changes**:
- `export function` → `export default function`
- `Link` from `wouter` → `Link` from `next/link`
- File: `pages/Home.tsx` → `app/page.tsx`

#### Example: Login Page (Client Component)

**New** (`src/app/login/page.tsx`):
```typescript
'use client'; // Important: This makes it a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = trpc.auth.funeralHomeLogin.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={login.isLoading}>
          Login
        </Button>
      </form>
    </div>
  );
}
```

**Changes**:
- Add `'use client'` directive (needed for hooks)
- `useLocation` from wouter → `useRouter` from next/navigation
- `setLocation` → `router.push`

#### Example: Memorial Page (Server Component)

**New** (`src/app/memorial/[slug]/page.tsx`):
```typescript
import { db } from '@/server/db';
import { notFound } from 'next/navigation';
import { MemorialView } from '@/components/MemorialView';

export default async function MemorialPage({
  params,
}: {
  params: { slug: string };
}) {
  // This runs on the server!
  const memorial = await db.getMemorialBySlug(params.slug);

  if (!memorial) {
    notFound(); // Shows 404 page
  }

  return <MemorialView memorial={memorial} />;
}

// Optional: Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const memorial = await db.getMemorialBySlug(params.slug);

  return {
    title: `${memorial?.deceasedName} - Portal da Lembrança`,
    description: memorial?.biography,
    openGraph: {
      images: [memorial?.photoUrl],
    },
  };
}
```

**Benefits**:
- No loading spinner needed
- Better SEO (fully rendered HTML)
- Faster initial load
- Automatic metadata generation

### Step 3: Migrate Routing

Create this mapping:

| Old Route | New File Path |
|-----------|---------------|
| `/` | `src/app/page.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/register` | `src/app/register/page.tsx` |
| `/dashboard` | `src/app/dashboard/page.tsx` |
| `/memorial/:slug` | `src/app/memorial/[slug]/page.tsx` |
| `/admin` | `src/app/admin/page.tsx` |
| `/admin/orders` | `src/app/admin/orders/page.tsx` |

### Step 4: Update Root Layout

Edit `src/app/layout.tsx`:

```typescript
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Portal da Lembrança",
  description: "Plataforma de gestão de memoriais",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <TRPCReactProvider>
          {children}
          <Toaster />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
```

### Step 5: Copy Static Assets

```bash
# Copy public files
cp -r ../Portaldalembranca/client/public/* public/
```

---

## Phase 4: Authentication (2-3 hours)

### Step 1: Create Middleware for Protected Routes

Create `src/middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sdk } from "@/server/_core/sdk";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  // Protected routes
  const protectedPaths = ["/dashboard", "/admin"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const session = await sdk.verifySession(sessionCookie);

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

### Step 2: Update Cookie Handling

Next.js handles cookies differently. Update `src/server/_core/cookies.ts`:

```typescript
import { cookies } from "next/headers";

export function getSessionCookie() {
  return cookies().get("session")?.value;
}

export function setSessionCookie(token: string) {
  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
```

---

## Phase 5: Deployment (30 minutes)

### Step 1: Create GitHub Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Migrated to Next.js"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/portaldalembranca-next.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects Next.js
4. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY`
   - etc.
5. Click "Deploy"

**That's it!** No vercel.json needed. ✅

### Step 3: Run Migrations

```bash
# Connect to Vercel project
vercel link

# Run migrations
vercel env pull .env.local
pnpm db:push
```

---

## Phase 6: Testing (2-3 hours)

### Checklist

- [ ] Home page loads
- [ ] Login works (funeral home)
- [ ] Login works (family user)
- [ ] Dashboard loads
- [ ] Create memorial works
- [ ] Upload photos works
- [ ] Public memorial page works
- [ ] QR code generation works
- [ ] Admin panel works
- [ ] Dedications work
- [ ] All API routes work

---

## Troubleshooting

### Issue: "use client" errors

**Problem**: Getting errors about hooks in server components.

**Solution**: Add `'use client'` directive at the top of the file:
```typescript
'use client';

import { useState } from 'react';
// ... rest of file
```

### Issue: Can't import server code in client components

**Problem**: Trying to import server utilities in client component.

**Solution**: Use tRPC instead:
```typescript
// ❌ Don't do this in client component:
import { db } from '@/server/db';

// ✅ Do this instead:
const { data } = trpc.memorials.list.useQuery();
```

### Issue: Module not found errors

**Problem**: Import paths broken after migration.

**Solution**: Update `tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Migration Checklist

### Setup
- [ ] Create new Next.js project
- [ ] Copy environment variables
- [ ] Copy database schema
- [ ] Install dependencies

### Backend
- [ ] Copy server code
- [ ] Update imports
- [ ] Create tRPC API route
- [ ] Test API endpoints

### Frontend
- [ ] Copy components
- [ ] Migrate pages
- [ ] Update routing
- [ ] Copy static assets
- [ ] Test all pages

### Auth
- [ ] Create middleware
- [ ] Update cookie handling
- [ ] Test login/logout
- [ ] Test protected routes

### Deployment
- [ ] Create GitHub repo
- [ ] Deploy to Vercel
- [ ] Run migrations
- [ ] Test production

### Cleanup
- [ ] Delete old project (after backup)
- [ ] Update documentation
- [ ] Update README

---

## After Migration Benefits

What you'll notice immediately:

1. ✅ **Deployments just work** - No more module errors
2. ✅ **Faster builds** - 1-2 minutes instead of 3-5
3. ✅ **Better performance** - SSR + Server Components
4. ✅ **Simpler codebase** - No vercel.json, no bundler scripts
5. ✅ **Better SEO** - All pages server-rendered
6. ✅ **Type-safe routing** - `Link` component is typed
7. ✅ **Better DX** - Hot reload, better errors

---

## Need Help?

- Next.js Discord: https://discord.gg/nextjs
- T3 Discord: https://t3.gg/discord
- Stack Overflow: Tag with `next.js` and `trpc`

---

## Estimated Timeline

| Phase | Time | Can Do In Parallel |
|-------|------|--------------------|
| Setup | 30 min | No |
| Backend | 4-6 hours | No |
| Frontend | 6-8 hours | After backend |
| Auth | 2-3 hours | After frontend |
| Deployment | 30 min | After auth |
| Testing | 2-3 hours | After deployment |
| **Total** | **2-3 days** | |

**Weekend project? Absolutely!** 🚀
