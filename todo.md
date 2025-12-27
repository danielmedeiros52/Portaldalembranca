# Memorial QR MVP - Project TODO

## Core Features

### Database & Schema
- [x] Define Drizzle ORM schema (FuneralHome, FamilyUser, Memorial, Descendant, Photo, Dedication)
- [x] Create and run database migrations

### Authentication & Authorization
- [x] Implement FuneralHome user registration and login
- [x] Implement FamilyUser registration and login
- [x] Implement role-based access control (FUNERARIA vs FAMILIA roles)
- [x] Create protected routes for each user type
- [x] Implement invitation link flow for family users

### Funeral Home Features
- [x] Dashboard showing list of memorials created by funeral home
- [x] Create new memorial form (basic deceased info + family email)
- [x] Auto-generate invitation link for family
- [x] View memorial details and QR code
- [x] Download QR code as PNG/SVG

### Family User Features
- [x] Accept invitation and set password
- [x] Dashboard showing memorials they manage
- [x] Edit memorial page (biography, naturalidade, filiacao)
- [x] Add/edit/delete descendants
- [ ] Photo gallery (upload, delete, reorder) - UI ready, backend needs S3 integration
- [x] Add/view dedicacoes (messages)

### Public Memorial Page
- [x] Display deceased info (name, dates, naturalidade, filiacao)
- [x] Display descendants list
- [x] Display biography
- [ ] Display photo gallery - UI ready, needs image implementation
- [x] Display dedicacoes (read-only)
- [x] Handle private/public visibility

### QR Code Generation
- [x] Generate QR code for each memorial
- [x] Make QR code downloadable
- [x] Display QR code preview in dashboard

### UI/UX
- [x] Login page with role selection
- [x] Funeral home dashboard layout
- [x] Family dashboard layout
- [x] Memorial edit form
- [ ] Photo upload component - Placeholder ready
- [x] Dedicacao form
- [x] Public memorial page styling
- [ ] Responsive design for mobile - Basic responsive, needs testing

## Technical Implementation

### Backend (tRPC Procedures)
- [x] Auth procedures (login, register, logout)
- [x] Memorial CRUD procedures
- [x] Descendant CRUD procedures
- [x] Photo CRUD procedures
- [x] Dedication CRUD procedures
- [x] QR code generation procedure

### Frontend Components
- [x] Reusable form components
- [ ] Photo gallery component - Placeholder ready
- [x] Dedication list component
- [x] QR code display component

### Documentation
- [x] Architecture documentation (ARCHITECTURE.md)
- [x] Data model documentation (in ARCHITECTURE.md)
- [x] Setup and running guide (SETUP_GUIDE.md)
- [x] API documentation (in SETUP_GUIDE.md)

## Completed Items
- [x] Project initialization with tRPC + Express + React stack
- [x] Database schema design and migrations
- [x] Authentication system (FuneralHome and FamilyUser)
- [x] Invitation token system for family onboarding
- [x] All core tRPC procedures implemented
- [x] All main pages implemented (Login, Dashboards, Memorial Edit, Public Page)
- [x] QR code generation and display
- [x] Comprehensive documentation

## Localization & Customization (Completed)
- [x] Update Tailwind CSS with custom colors (#C4F2EF primary, #F2C4C7 secondary)
- [x] Translate Home page to Portuguese Brazilian
- [x] Translate Login page to Portuguese Brazilian
- [x] Translate Funeral Home Dashboard to Portuguese Brazilian
- [x] Translate Family Dashboard to Portuguese Brazilian
- [x] Translate Memorial Edit page to Portuguese Brazilian
- [x] Translate Public Memorial page to Portuguese Brazilian
- [x] Translate Invitation Acceptance page to Portuguese Brazilian
- [x] Translate backend error messages to Portuguese Brazilian
- [x] Translate documentation to Portuguese Brazilian (GUIA_CONFIGURACAO.md, ARQUITETURA.md)

## Demo/Marketing Presentation Mode (Completed)
- [x] Improve color scheme with better contrast (Teal #0D9488, Red #DC2626)
- [x] Create mock data utilities (mockData.ts)
- [x] Populate Home page with landing content
- [x] Populate Login page with demo mode
- [x] Populate Funeral Home Dashboard with mock memorials
- [x] Populate Family Dashboard with mock memorials
- [x] Populate Memorial Edit page with mock data
- [x] Populate Public Memorial page with complete mock data
- [x] Implement complete navigation flow between all pages
- [x] Add QR code generation to Public Memorial page

## Future Enhancements
- [ ] Photo upload to S3
- [ ] Email notifications for invitations
- [ ] Payment processing (Stripe integration)
- [ ] Admin dashboard
- [ ] Analytics and tracking
- [ ] Mobile app
- [ ] Multilingual support
- [ ] Advanced search
- [ ] Social media sharing


## Modernization & Data Architecture (Completed)
- [x] Create centralized data/ folder with JSON mock files
- [x] Create data service layer to abstract data fetching
- [x] Redesign Home page with modern UI (gradients, animations, glass effects)
- [x] Redesign Login page with modern UI
- [x] Redesign Funeral Home Dashboard with modern UI
- [x] Redesign Family Dashboard with modern UI
- [x] Redesign Memorial Edit page with modern UI
- [x] Redesign Public Memorial page with modern UI
- [x] Add global animations and transitions
- [x] Implement responsive modern design patterns


## Branding Update (Completed)
- [x] Update application name to "Portal da Lembrança"
- [x] Update APP_TITLE default in const.ts
- [x] Update all hardcoded references in pages
