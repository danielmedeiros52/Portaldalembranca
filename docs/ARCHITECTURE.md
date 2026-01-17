# Memorial QR MVP - Architecture Documentation

## System Overview

The Memorial QR MVP is a full-stack web application built with modern technologies to provide a seamless experience for funeral homes, families, and visitors. The system is designed with scalability, maintainability, and ease of extension in mind.

## Technology Stack

**Frontend**: React 19 with TypeScript provides a modern, type-safe user interface. Tailwind CSS 4 handles styling with a utility-first approach. The application uses Wouter for lightweight client-side routing without the overhead of Next.js.

**Backend**: Express 4 serves as the HTTP server, with tRPC 11 providing type-safe RPC communication between frontend and backend. This eliminates the need for traditional REST API documentation and provides compile-time type safety across the entire stack.

**Database**: Drizzle ORM provides a TypeScript-first database abstraction layer, with MySQL as the primary database. Migrations are version-controlled and applied programmatically, ensuring consistency across environments.

**Authentication**: The system implements custom email/password authentication for both funeral homes and family users. Session management uses JWT tokens stored in secure HTTP-only cookies.

## Architectural Layers

### Presentation Layer (Frontend)

The frontend is organized into feature-based pages and reusable components:

**Pages** (`client/src/pages/`): Each page corresponds to a major user flow or feature. Pages handle routing, state management via tRPC hooks, and composition of smaller components.

**Components** (`client/src/components/`): Reusable UI components built with shadcn/ui and Tailwind CSS. Components are stateless where possible and receive data through props.

**Contexts** (`client/src/contexts/`): React contexts manage global state like theme preferences.

**Hooks** (`client/src/lib/`): Custom hooks encapsulate tRPC client logic and other reusable logic.

### Business Logic Layer (Backend)

The backend organizes business logic into feature-specific routers:

**tRPC Routers** (`server/routers.ts`): Each router groups related procedures. Procedures are either public (accessible without authentication) or protected (require authentication). Input validation uses Zod schemas.

**Database Helpers** (`server/db.ts`): Query functions abstract database operations and provide a consistent interface for the routers. This separation allows for easy testing and potential caching strategies.

**Utilities** (`server/qrcode.ts`): Specialized utilities for features like QR code generation.

### Data Access Layer (Database)

**Drizzle Schema** (`drizzle/schema.ts`): Defines all tables, columns, types, and relationships. The schema is the single source of truth for the database structure.

**Migrations** (`drizzle/migrations/`): Version-controlled migration files ensure consistent schema across environments.

## Data Model

### Core Entities

```
FuneralHome
├── id (primary key)
├── name
├── email (unique)
├── passwordHash
├── phone
├── address
└── timestamps

FamilyUser
├── id (primary key)
├── name
├── email (unique)
├── passwordHash
├── phone
├── invitationToken
├── invitationExpiry
├── isActive
└── timestamps

Memorial
├── id (primary key)
├── slug (unique, for public URLs)
├── fullName
├── birthDate
├── deathDate
├── birthplace
├── filiation
├── biography
├── visibility (public/private)
├── status (active/pending_data/inactive)
├── funeralHomeId (foreign key)
├── familyUserId (foreign key)
└── timestamps

Descendant
├── id (primary key)
├── memorialId (foreign key)
├── name
├── relationship
└── createdAt

Photo
├── id (primary key)
├── memorialId (foreign key)
├── fileUrl
├── caption
├── order
└── createdAt

Dedication
├── id (primary key)
├── memorialId (foreign key)
├── authorName
├── message
└── createdAt
```

## Request Flow

### Authentication Flow

1. User submits email and password on login page
2. Frontend calls `trpc.auth.funeralHomeLogin` or `trpc.auth.familyUserLogin`
3. Backend validates credentials against hashed passwords
4. On success, backend sets a JWT session cookie
5. Frontend redirects to appropriate dashboard
6. Subsequent requests include the session cookie automatically

### Data Fetching Flow

1. Component calls `trpc.feature.useQuery()` or `trpc.feature.useMutation()`
2. tRPC client sends request to `/api/trpc` endpoint
3. Backend router receives request and validates input with Zod
4. Router calls database helper functions
5. Database helper executes queries via Drizzle ORM
6. Results are returned to frontend with full type safety
7. Component re-renders with new data

### QR Code Generation Flow

1. User requests QR code for a memorial
2. Frontend calls `trpc.memorial.generateQRCode` with slug and base URL
3. Backend constructs full memorial URL
4. QRCode library generates PNG or SVG representation
5. Base64-encoded image is returned to frontend
6. Frontend displays or allows download

## Security Considerations

### Authentication

- Passwords are hashed using bcryptjs with salt rounds of 10
- JWT tokens are stored in HTTP-only cookies to prevent XSS attacks
- Session tokens include expiration times
- Protected procedures check for valid session before execution

### Input Validation

- All tRPC procedures validate input using Zod schemas
- Database queries use parameterized statements via Drizzle ORM
- Frontend validation provides immediate user feedback
- Backend validation is the authoritative source of truth

### Authorization

- Funeral homes can only view/edit memorials they created
- Family users can only view/edit memorials assigned to them
- Public memorials respect the visibility setting
- Visitors can only leave dedications, not edit existing content

## Scalability Considerations

### Database

- Indexes should be added on frequently queried columns (slug, funeralHomeId, familyUserId)
- Consider partitioning the `dedications` table if it grows very large
- Implement caching for frequently accessed public memorials

### File Storage

- Current implementation uses local storage; migrate to S3 or similar for production
- Implement CDN for fast image delivery
- Use image optimization libraries to reduce file sizes

### API Performance

- Implement rate limiting on public endpoints
- Cache generated QR codes to avoid regeneration
- Use database connection pooling
- Monitor slow queries and optimize as needed

### Frontend Performance

- Code-split pages using dynamic imports
- Lazy load images in photo galleries
- Implement pagination for large lists
- Use React.memo for expensive components

## Extension Points

### Adding New Features

1. **New User Role**: Add role to `familyUsers` or create new table, add procedures to auth router
2. **New Memorial Fields**: Add columns to `memorials` table, update schema and migrations
3. **New Content Type**: Create new table, add CRUD procedures, build UI components
4. **Integrations**: Create new routers for external services (email, payment, etc.)

### Customization

- **Styling**: Modify Tailwind configuration in `tailwind.config.ts`
- **Branding**: Update constants in `client/src/const.ts`
- **Email Templates**: Create email service in `server/email.ts`
- **Notifications**: Implement webhook handlers for events

## Development Workflow

1. **Schema Changes**: Update `drizzle/schema.ts`, run `pnpm db:push`
2. **Backend Logic**: Add queries in `server/db.ts`, procedures in `server/routers.ts`
3. **Frontend**: Create pages/components, wire up tRPC hooks
4. **Testing**: Manual testing in browser, automated tests for critical paths
5. **Deployment**: Build with `pnpm build`, deploy to hosting platform

## Monitoring and Debugging

### Development

- Use browser DevTools for frontend debugging
- tRPC provides detailed error messages
- Enable verbose logging in development environment
- Use Drizzle Studio for database inspection

### Production

- Implement error tracking (Sentry, etc.)
- Monitor API response times
- Track database query performance
- Monitor server resource usage

## Future Enhancements

1. **Email Notifications**: Send invitations and notifications to users
2. **Payment Processing**: Integrate Stripe for subscription management
3. **Admin Dashboard**: Tools for managing users and memorials
4. **Analytics**: Track memorial views and engagement
5. **Mobile App**: Native mobile applications for iOS and Android
6. **Multilingual Support**: Internationalization for multiple languages
7. **Advanced Search**: Full-text search across memorials
8. **Social Features**: Share memorials on social media
9. **API for Partners**: RESTful API for funeral home integrations
10. **Accessibility**: Enhanced accessibility features for diverse users

## Conclusion

The Memorial QR MVP architecture provides a solid foundation for a scalable, maintainable application. The use of modern technologies and clear separation of concerns makes it easy to extend and customize as requirements evolve. The type-safe nature of the stack (TypeScript, tRPC, Drizzle) provides confidence in code changes and reduces the likelihood of runtime errors.
