# Memorial QR MVP - Setup and Deployment Guide

## Project Overview

**Memorial com QR Code MVP** is a full-stack web application designed to help funeral homes and families create and manage digital memorials. Each memorial is accessible via a unique URL and a QR code that can be printed on grave plaques. The application uses a modern tech stack including React, tRPC, Express, Tailwind CSS, and Drizzle ORM with MySQL.

## Architecture Overview

The project follows a layered architecture with clear separation of concerns:

**Frontend Layer** (`client/src/`): React 19 application with Tailwind CSS 4 for styling. Pages are organized by feature (Login, Dashboards, Memorial Management, Public Pages). All data fetching uses tRPC hooks for type-safe communication with the backend.

**Backend Layer** (`server/`): Express 4 server with tRPC 11 for RPC procedures. All business logic is encapsulated in tRPC routers organized by feature (auth, memorial, descendant, photo, dedication). Database queries are abstracted in `server/db.ts` for reusability.

**Database Layer** (`drizzle/`): Drizzle ORM with MySQL manages the schema. Tables include `users`, `funeralHomes`, `familyUsers`, `memorials`, `descendants`, `photos`, and `dedications`. Migrations are version-controlled and applied via `pnpm db:push`.

**Key Features**:

- **Role-based authentication**: Separate login flows for Funeral Homes and Family Users
- **Memorial management**: Create, edit, and view memorials with full lifecycle management
- **QR code generation**: Automatic QR code generation for each memorial pointing to its public URL
- **Family invitations**: Funeral homes can invite family members to complete memorial information
- **Public memorials**: Publicly accessible memorial pages with photo galleries, dedications, and family information
- **Dedication system**: Visitors can leave messages and tributes on public memorials

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (version 18 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **pnpm** (version 8 or higher) - Install globally with `npm install -g pnpm`
- **MySQL** (version 8.0 or higher) or **TiDB** - A MySQL-compatible database server
- **Git** - For version control

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (or extract the project files)
cd memorial-qr-mvp

# Install dependencies using pnpm
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database connection string
DATABASE_URL="mysql://username:password@localhost:3306/memorial_qr"

# JWT secret for session management
JWT_SECRET="your-secret-key-here-change-this-in-production"

# OAuth configuration (if using Manus OAuth)
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Owner information
OWNER_OPEN_ID="your-owner-id"
OWNER_NAME="Your Name"

# Application branding
VITE_APP_TITLE="Memorial com QR Code"
VITE_APP_LOGO="/logo.svg"

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="your-website-id"

# Built-in APIs (if using Manus platform)
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your-api-key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-key"
```

### 3. Set Up the Database

Before running migrations, ensure your MySQL database is running and accessible. Create a database for the project:

```bash
# Using MySQL CLI
mysql -u root -p
CREATE DATABASE memorial_qr;
EXIT;
```

Then run the database migrations:

```bash
# Generate and apply migrations
pnpm db:push
```

This command will create all necessary tables based on the Drizzle schema defined in `drizzle/schema.ts`.

### 4. Start the Development Server

```bash
# Start the development server (runs on http://localhost:3000)
pnpm dev
```

The application will be available at `http://localhost:3000`. The development server includes hot module reloading for both frontend and backend code.

## Project Structure

```
memorial-qr-mvp/
├── client/                    # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── pages/           # Page components (Home, Login, Dashboards, etc.)
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utilities (tRPC client, hooks)
│   │   ├── contexts/        # React contexts (Theme, etc.)
│   │   ├── App.tsx          # Main app router
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   └── index.html           # HTML template
├── server/                    # Express backend
│   ├── routers.ts           # tRPC procedure definitions
│   ├── db.ts                # Database query helpers
│   ├── qrcode.ts            # QR code generation utilities
│   └── _core/               # Framework internals (auth, context, etc.)
├── drizzle/                  # Database schema and migrations
│   ├── schema.ts            # Table definitions
│   └── migrations/          # Generated migration files
├── shared/                   # Shared constants and types
├── storage/                  # S3 storage helpers
├── drizzle.config.ts        # Drizzle configuration
├── vite.config.ts           # Vite build configuration
├── package.json             # Dependencies and scripts
└── SETUP_GUIDE.md           # This file
```

## Key Files and Their Purposes

| File | Purpose |
|------|---------|
| `drizzle/schema.ts` | Defines all database tables and their relationships |
| `server/db.ts` | Query helper functions for all database operations |
| `server/routers.ts` | tRPC procedure definitions for all API endpoints |
| `server/qrcode.ts` | QR code generation utilities |
| `client/src/App.tsx` | Main router and layout configuration |
| `client/src/pages/` | Feature pages (Login, Dashboards, Memorial pages) |
| `client/src/lib/trpc.ts` | tRPC client configuration |

## Database Schema

The application uses the following main tables:

**funeralHomes**: Stores funeral home partner information including name, email, and contact details.

**familyUsers**: Stores family member accounts with invitation tokens for onboarding.

**memorials**: The core table storing deceased person information, including biography, dates, and visibility settings.

**descendants**: Stores information about the deceased's children, grandchildren, and other descendants.

**photos**: Stores references to memorial photos with captions and ordering.

**dedications**: Stores visitor messages and tributes left on public memorials.

## API Endpoints (tRPC Procedures)

All backend communication uses tRPC, which provides type-safe RPC calls. The main procedure groups are:

**Authentication** (`trpc.auth.*`):
- `funeralHomeLogin`: Login for funeral home users
- `funeralHomeRegister`: Register a new funeral home account
- `familyUserLogin`: Login for family users
- `acceptInvitation`: Accept family invitation and set password

**Memorials** (`trpc.memorial.*`):
- `getByFuneralHome`: Retrieve memorials created by a funeral home
- `getByFamilyUser`: Retrieve memorials assigned to a family user
- `getBySlug`: Get a public memorial by its slug (public access)
- `getById`: Get memorial details by ID (protected)
- `create`: Create a new memorial (funeral home only)
- `update`: Update memorial information (protected)
- `generateQRCode`: Generate QR code for a memorial (public)

**Descendants** (`trpc.descendant.*`):
- `getByMemorial`: List all descendants for a memorial
- `create`: Add a new descendant (protected)
- `delete`: Remove a descendant (protected)

**Photos** (`trpc.photo.*`):
- `getByMemorial`: List all photos for a memorial
- `create`: Upload a new photo (protected)
- `delete`: Remove a photo (protected)

**Dedications** (`trpc.dedication.*`):
- `getByMemorial`: List all dedications for a memorial (public)
- `create`: Add a new dedication (public)

## User Flows

### Funeral Home Flow

1. Funeral home staff registers an account at `/login` (Register tab)
2. After login, they access `/dashboard/funeral-home`
3. They create a new memorial by providing deceased's basic information and family email
4. System automatically creates a family user and sends invitation link
5. Funeral home can view the memorial's QR code and download it for printing

### Family User Flow

1. Family receives invitation link via email (or through funeral home interface)
2. They click the link to `/accept-invitation/:token`
3. They set a password to complete their account
4. After login, they access `/dashboard/family`
5. They can edit memorial information, add photos, descendants, and biography
6. They can view the public memorial page at `/m/:slug`

### Public Visitor Flow

1. Visitor scans QR code or accesses memorial URL directly
2. They view the public memorial page at `/m/:slug`
3. They can read biography, view photos, and see descendants
4. They can leave dedications (messages) on the memorial

## Common Development Tasks

### Adding a New Feature

1. **Update the database schema** in `drizzle/schema.ts`
2. **Run migrations** with `pnpm db:push`
3. **Add query helpers** in `server/db.ts`
4. **Create tRPC procedures** in `server/routers.ts`
5. **Build frontend pages** in `client/src/pages/`
6. **Wire up tRPC hooks** in components using `trpc.feature.useQuery()` or `trpc.feature.useMutation()`

### Running Database Migrations

```bash
# After modifying schema.ts, push changes to database
pnpm db:push

# View migration history
pnpm db:studio  # Opens Drizzle Studio for database inspection
```

### Building for Production

```bash
# Build the application
pnpm build

# The build output will be in the dist/ directory
# Start production server
pnpm start
```

### Debugging

The application includes source maps and detailed error messages. Use browser DevTools (F12) to inspect network requests and component state. tRPC provides type-safe error handling with meaningful error messages.

## Deployment Considerations

### Security

- Change `JWT_SECRET` to a strong random string in production
- Use HTTPS for all connections
- Implement rate limiting on public endpoints
- Validate all user inputs on both frontend and backend
- Use environment-specific configuration for sensitive data

### Database

- Use a managed database service (AWS RDS, Google Cloud SQL, etc.) in production
- Enable SSL/TLS for database connections
- Regular backups are essential
- Monitor database performance and optimize queries as needed

### File Storage

The current implementation uses local file storage. For production, consider:
- AWS S3 for scalable file storage
- CloudFlare R2 for cost-effective storage
- Implement proper access controls and CDN caching

### Performance

- Enable caching headers for static assets
- Use a CDN to serve static content
- Implement database query optimization
- Monitor application performance with analytics

## Troubleshooting

**Database Connection Error**: Verify your `DATABASE_URL` is correct and the MySQL server is running.

**Port Already in Use**: If port 3000 is already in use, you can change it in `vite.config.ts`.

**TypeScript Errors**: Run `pnpm tsc --noEmit` to check for type errors.

**Build Failures**: Clear the build cache with `pnpm clean` and try again.

## Support and Resources

- **Drizzle ORM Documentation**: [orm.drizzle.team](https://orm.drizzle.team/)
- **tRPC Documentation**: [trpc.io](https://trpc.io/)
- **React Documentation**: [react.dev](https://react.dev/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)

## Next Steps

1. **Customize branding**: Update `APP_LOGO` and `APP_TITLE` in `client/src/const.ts`
2. **Implement email notifications**: Add email sending for invitations and dedications
3. **Add payment processing**: Integrate Stripe for subscription management
4. **Enhance UI/UX**: Add more polish and animations
5. **Implement analytics**: Track user behavior and memorial views
6. **Add admin panel**: Create tools for managing users and memorials

## License

This project is provided as-is for MVP validation purposes.
