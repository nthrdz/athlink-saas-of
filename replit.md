# Athlink - Athletic Link-in-Bio Platform

## Overview
Athlink is a Next.js-based link-in-bio platform for athletes to create digital profiles, showcase performances, competitions, sponsors, and media, and track visitor analytics. Its purpose is to help athletes build their personal brand and connect with sponsors and fans through tiered subscription plans (FREE, PRO, ELITE) that offer progressive features.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15.5.4 (App Router) with React 19.1.0, utilizing Server and Client Components and TypeScript.
- **UI/UX**: Shadcn UI with Radix UI primitives, Tailwind CSS 4, and Framer Motion for animations. Features a 7-color vibrant palette and a mobile-first responsive design. The homepage has been redesigned for a clean, professional, and minimalist aesthetic, inspired by platforms like GetAllMyLinks, with strong social proof elements.
- **State Management**: React hooks for local state; Next.js App Router for server-side data fetching; API polling for real-time analytics.

### Backend Architecture
- **API Layer**: Next.js API Routes (App Router) for RESTful CRUD operations and Server Actions. All API routes for coaching services are fully operational with comprehensive Zod validation.
- **Authentication**: NextAuth.js v5 (beta) with Credentials and Google OAuth providers, JWT sessions, and Prisma adapter.
- **Authorization**: Session-based route protection, plan-based feature gating defined in `lib/features.ts`, with server-side enforcement of plan limits across all API routes. Access to coaching services is restricted to the ELITE plan.
- **Business Logic**: Includes sport type mapping, analytics tracking, and image processing with Sharp. Advanced analytics for the ELITE plan provide intelligent, personalized advice across visibility, conversion, content, and retention, including calendar heatmaps and dynamic trend calculations.
- **Promotion Codes**: Native Stripe Promotion Codes integrated into checkout flow. Users can enter promo codes directly in the Stripe payment interface via `allow_promotion_codes` parameter. All discount management, validation, and tracking handled by Stripe's built-in system.

### Data Architecture
- **ORM**: Prisma with PostgreSQL, defining models for User, Profile, Link, Race, Sponsor, Media, and Analytics.
- **Database Schema**: Profiles link to user authentication, containing athlete info. Links, Races, Sponsors, and Media are associated with profiles. Analytics store referrer, device, and geolocation data.
- **File Storage**: Supabase Storage for avatars, covers, media, and sponsor images, with Sharp-based image optimization.

### Key Design Patterns
- **Component Architecture**: Separation of UI primitives (`components/ui`) and feature components (`components/ui-pro`), clear Client/Server Component boundaries.
- **Data Fetching**: Server Components for page-level data, Client Components for mutations.
- **Form Validation**: Zod schemas for client and server-side validation, integrated with react-hook-form, providing detailed error messages in French.
- **Plan Management**: Simplified to FREE, PRO, ELITE plans, with consistent plan type mapping and feature limit definitions.
- **Error Handling**: Try-catch blocks in APIs, Sonner for toast notifications, client-side error boundaries.
- **Logo Extraction**: Advanced scoring algorithm for extracting official competition logos and sponsor logos from URLs, supporting various image formats and lazy loading.
- **Stripe Integration**: Native Stripe Promotion Codes for discount management. Checkout sessions include `allow_promotion_codes: true` to enable users to apply discount codes directly in Stripe's payment interface. All promo code creation, validation, usage limits, and analytics managed through Stripe Dashboard.

## External Dependencies

### Third-Party Services
- **Supabase**: PostgreSQL database hosting and file storage for images/videos.
- **Google OAuth**: Social authentication provider.
- **Stripe**: Subscription payment processing via Stripe Checkout and webhooks.
- **Clearbit Logo API**: Automatic logo fetching for sponsors.
- **ipapi.co**: Geolocation for analytics.
- **Google Favicon API**: Fallback for logo extraction.
- **Google Analytics (gtag.js)**: Integrated for global site tracking (Google Ads/Analytics) with optimized loading.

### Key NPM Packages
- **Authentication & Database**: `next-auth`, `@prisma/client`, `@auth/prisma-adapter`, `bcryptjs`.
- **UI & Styling**: `@radix-ui/*`, `framer-motion`, `tailwindcss`, `lucide-react`, `sonner`, `recharts`, `@uiw/react-heat-map`.
- **Media & Files**: `sharp`, `html2canvas`, `jspdf`, `qrcode`, `canvas-confetti`.
- **Forms & Validation**: `react-hook-form`, `zod`, `@hookform/resolvers`.
- **Payments**: `stripe`.
- **Web Scraping**: `cheerio`.