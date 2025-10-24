# Athlink - Athletic Link-in-Bio Platform

## Overview

Athlink is a Next.js-based link-in-bio platform specifically designed for athletes. It enables athletes to create digital profiles showcasing their performances, competitions, sponsors, and media content while tracking visitor analytics and engagement metrics.

The platform offers tiered subscription plans (FREE, PRO, ELITE) with progressive feature unlocks, allowing athletes to build their personal brand and connect with sponsors and fans.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Production Deployment Configuration (October 24, 2025)
- **Diagnosed authentication deployment issue**: NextAuth not working in production (athlink.fr) while functional in development
- **Root cause identified**: Environment variables (secrets) not automatically copied from development to deployment on Replit
- **Fixed Prisma deployment error**: Added `binaryTargets = ["native", "debian-openssl-1.1.x"]` to support both development and production environments
- **Added deployment documentation**: Created `DEPLOYMENT_GUIDE.md` and `SECRETS_A_COPIER.md` with step-by-step instructions for configuring production secrets
- **Created `.env.example`**: Template file showing all required environment variables with descriptions
- **NextAuth v5 configuration**: 
  - Uses `AUTH_SECRET` and `AUTH_URL` (NextAuth v5 naming convention)
  - `trustHost: true` hardcoded in `lib/auth.ts` for Replit compatibility
  - Debug mode enabled automatically in development
- **Key insight**: Development (Replit preview) and production (athlink.fr) use separate databases - accounts don't sync automatically
- **Action required by user**: Configure deployment secrets manually in Replit deployment settings (see SECRETS_A_COPIER.md)

### Stripe Payment Integration (October 24, 2025)
- **Integrated Stripe for subscription payments**: Users can now upgrade to Pro (€9.90/month or €99/year) and Elite (€25.90/month or €259/year) plans via Stripe Checkout
- **Created secure API routes**:
  - `/api/create-checkout-session`: Server-side validation of plan/billing cycle, derives Stripe price IDs securely (prevents price manipulation)
  - `/api/webhooks/stripe`: Handles `checkout.session.completed` and `customer.subscription.deleted` events with mandatory signature verification
- **Security hardening**: Price IDs derived server-side from `lib/stripe-prices.ts`, webhook requires `STRIPE_WEBHOOK_SECRET` (rejects unsigned events)
- **Plan mapping**: Pro → ATHLETE_PRO, Elite → COACH in Prisma schema
- **User experience**: Success toast notification on upgrade, seamless redirect flow, promo code support retained
- **Environment secrets**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` stored securely in Replit Secrets

### PlanType Enum Synchronization (October 23, 2025)
- **Fixed deployment-blocking type mismatch**: Removed duplicate PlanType enum definition in `lib/features.ts`
- **Imported PlanType from Prisma Client**: Now using `import { PlanType } from "@prisma/client"` for type consistency
- **Ensured schema-to-code alignment**: All 5 plan types (FREE, PRO, ELITE, ATHLETE_PRO, COACH) now use Prisma-generated types
- **Fixed missing icon import**: Added `Search` icon to `competitions-content.tsx`
- **Result**: 0 TypeScript errors, build compiles successfully, ready for production deployment

### Critical Fixes and Feature Implementation (October 23, 2025)
- **Fixed logout button**: Replaced manual fetch-based signout with NextAuth's `signOut()` from `next-auth/react` for proper session termination
- **Implemented plan limits enforcement**: Added comprehensive plan limit checks across all API routes:
  - `/api/links`: FREE plan limited to 10 links, PRO/ELITE unlimited
  - `/api/races`: FREE plan limited to 1 race, PRO/ELITE unlimited
  - `/api/sponsors`: FREE plan blocked (0 sponsors), PRO/ELITE unlimited
  - `/api/media`: FREE plan limited to 2 media items, PRO/ELITE unlimited
- **Centralized limit logic**: All routes now use `canAddItem()` and `getLimitMessage()` from `lib/features.ts` for consistent enforcement
- **Added customCSS field**: Updated `FeatureLimits` interface to include `customCSS` boolean (ELITE-only feature)
- All plan features now properly gated at API level, ensuring FREE/PRO/ELITE tiers work as designed

### Migration to Replit (October 23, 2025)
- Successfully migrated from Vercel to Replit environment
- Restructured project: moved all Next.js app routes to `app/` directory (App Router standard)
- Moved static assets to `public/` directory (uploads, logos, icons)
- Configured for Replit: port 5000, bind to 0.0.0.0
- Set up PostgreSQL database via Replit (schema pushed successfully)
- Configured environment variables via Replit Secrets
- Added comprehensive .gitignore for Next.js, Node.js, and Replit

**Important Security Note**: The `.next` build directory may still be tracked in Git history from the pre-migration state. This directory contains sensitive Next.js encryption keys. If you plan to make this repository public or share it, you should clean the Git history to remove these files. The .gitignore now prevents future commits of build artifacts.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15.5.4 with React 19.1.0
- App Router architecture for file-based routing
- Server and Client Components pattern for optimal performance
- TypeScript for type safety across the codebase

**UI Framework**: Shadcn UI with Radix UI primitives
- Component library configured in `components.json`
- Design system defined in `lib/design-system.ts` with 7-color vibrant palette
- Tailwind CSS 4 for styling with custom design tokens
- Framer Motion for animations and transitions

**State Management**:
- React hooks for local component state
- Server-side data fetching with Next.js App Router patterns
- Real-time updates via API polling for analytics

**Responsive Design**:
- Mobile-first approach with touch-optimized components
- Custom responsive utilities (ResponsiveContainer, ResponsiveGrid, ResponsiveText)
- Touch-friendly inputs and buttons with minimum 44px touch targets

### Backend Architecture

**API Layer**: Next.js API Routes (App Router)
- RESTful endpoints for CRUD operations
- Route handlers in `/app/api/*` and standalone `/app/*/route.ts` files
- Server Actions for form submissions and mutations

**Authentication**: NextAuth.js v5 (beta)
- Credentials provider with bcrypt password hashing
- Google OAuth integration
- JWT-based session strategy
- Prisma adapter for user/session management

**Authorization**:
- Session-based route protection via middleware
- Plan-based feature gating defined in `lib/features.ts`
- **Server-side plan limit enforcement**: All API routes (`links`, `races`, `sponsors`, `media`) check limits before creating new items
- Client-side plan validation for UI elements
- Centralized limit checking via `canAddItem()`, `checkLimit()`, and `getLimitMessage()` functions

**Business Logic**:
- Sport type mapping system for flexible sport categorization
- Promo code validation system for plan upgrades
- Analytics tracking with view and click event handlers
- Image processing with Sharp for avatar/cover optimization

### Data Architecture

**ORM**: Prisma with PostgreSQL
- Schema located in `prisma/schema.prisma`
- Models: User, Profile, Link, Race, Sponsor, Media, AnalyticsView, AnalyticsClick
- Plan-based feature limits enforced at application level

**Database Schema**:
- User authentication tied to Profile via userId
- Profile contains public-facing athlete information
- Links, Races, Sponsors, Media related to Profile via profileId
- Analytics events stored with referrer, device, and geolocation data
- Stats stored as JSON field for flexible metadata

**File Storage**: Supabase Storage
- Avatar, cover, media, and sponsor images
- Video support for media gallery
- Sharp-based image optimization before upload
- Public URL generation for client-side display

### Key Design Patterns

**Component Architecture**:
- Separation between UI primitives (`components/ui`) and feature components (`components/ui-pro`)
- Client/Server Component boundary clearly defined
- Analytics tracking components as wrapper HOCs

**Data Fetching**:
- Server Components fetch data at page level
- Client Components use fetch API for mutations
- Analytics data fetched client-side with time-range filters

**Form Validation**:
- Zod schemas defined in `lib/validations.ts`
- Schema validation on both client and server
- Type-safe form handling with react-hook-form

**Plan Management**:
- Plan type mapping between app layer (FREE/PRO/ELITE) and Prisma layer (FREE/COACH/ATHLETE_PRO)
- Feature limits defined per plan in `lib/features.ts`
- Client-side feature checks for conditional rendering

**Error Handling**:
- Try-catch blocks in API routes with appropriate HTTP status codes
- Toast notifications via Sonner for user feedback
- Client-side error boundaries for graceful degradation

## External Dependencies

### Third-Party Services

**Supabase**:
- PostgreSQL database hosting
- File storage bucket for images/videos
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Google OAuth**:
- Social authentication provider
- Environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

**Stripe**:
- Subscription payment processing
- Stripe Checkout for secure payment flows
- Webhook events for automated plan updates
- Environment variables: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

**Clearbit Logo API**:
- Automatic sponsor logo fetching via domain
- Public API with no authentication required

### Key NPM Packages

**Authentication & Database**:
- `next-auth` (v5 beta) - Authentication
- `@prisma/client` - Database ORM
- `@auth/prisma-adapter` - NextAuth-Prisma integration
- `bcryptjs` - Password hashing

**UI & Styling**:
- `@radix-ui/*` - Headless UI primitives (Label, Select, Slider, Switch, Progress)
- `framer-motion` - Animation library
- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library
- `sonner` - Toast notifications
- `recharts` - Analytics charts

**Media & Files**:
- `sharp` - Image optimization
- `html2canvas` + `jspdf` - PDF export functionality
- `qrcode` - QR code generation for profile sharing
- `canvas-confetti` - Celebration animations

**Forms & Validation**:
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - RHF-Zod integration

**Payments**:
- `stripe` - Subscription payment processing and webhook handling

**Web Scraping**:
- `cheerio` - HTML parsing for race/sponsor metadata extraction

### Configuration Files

- `.env.local` - Environment variables (DATABASE_URL, auth secrets, Supabase credentials)
- `next.config.ts` - 30MB file upload limit, image optimization, remote patterns
- `tailwind.config.ts` - Custom design system integration
- `tsconfig.json` - TypeScript path aliases (@/* for root imports)
- `components.json` - Shadcn UI configuration

### Deployment Considerations

- Server runs on port 5000 (configurable in package.json scripts)
- Prisma schema generation via postinstall script
- Static asset optimization with Next.js Image component
- Environment-specific database connections via DATABASE_URL