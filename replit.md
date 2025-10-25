# Athlink - Athletic Link-in-Bio Platform

## Overview
Athlink is a Next.js-based link-in-bio platform designed for athletes to create digital profiles. It allows athletes to showcase their performances, competitions, sponsors, and media content, while also providing visitor analytics and engagement metrics. The platform aims to help athletes build their personal brand and connect with sponsors and fans through tiered subscription plans (FREE, PRO, ELITE) that unlock progressive features.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 25, 2025)
- **Favicon personnalisé**: Ajout du logo Athlink (32x32px) comme favicon avec couleurs exactes préservées - créé aussi apple-icon.png (180x180px)
- **Nettoyage des plans d'abonnement**: Simplifié pour n'avoir que 3 plans (FREE, PRO, ELITE) - supprimé ATHLETE_PRO et COACH
  - Conversion automatique des données existantes : ATHLETE_PRO → ELITE, COACH → PRO
  - Suppression du fichier lib/plan-mapping.ts devenu inutile
  - Mise à jour de toutes les références dans le code
  - Migration base de données effectuée avec succès
- **Modal sponsors**: Ajout d'une modal expandable pour voir tous les sponsors quand il y en a plus de 4 (similaire à la galerie) avec composant GlassSponsorsGrid
- **Analytics Avancées 100% opérationnelles** (plan ELITE uniquement):
  - Heatmap calendrier professionnelle avec @uiw/react-heat-map (style GitHub contributions)
  - Vraies tendances calculées dynamiquement basées sur les données réelles (fini les "+12%" fixes)
  - Statistiques précises avec insights personnalisés
  - Composant CalendarHeatmap avec stats quotidiennes et visualisation annuelle
  - Protection défensive contre les valeurs manquantes (pas de NaN)
- **Branding**: Navbar logo simplifié - texte "ATHLINK" uniquement (sans icône)
- **Extraction de logos sponsors**: Corrigé le bug d'API (paramètre 'websiteUrl' au lieu de 'url') et amélioré l'UX pour rendre claire l'extraction automatique depuis l'URL du site web
- **Extraction de logos compétitions**: Ajout du même système d'extraction automatique pour les compétitions avec API dédiée `/api/races/extract-logo` et UX améliorée avec section dédiée et meilleur feedback
- **Validation sponsors (PRODUCTION FIX)**: Corrigé l'erreur "erreur lors de la sauvegarde" en production - conversion des chaînes vides en null pour compatibilité Prisma (POST et PATCH)
- **Validation compétitions (PRODUCTION FIX)**: Même correctif appliqué aux compétitions pour éviter les erreurs en production
- **API upgrade-plan**: Créée l'API manquante `/api/upgrade-plan` pour gérer les upgrades de plan avec codes promo - codes promo centralisés dans `lib/promo-codes.ts` (ELITE et ATHLINK_PREMIUM supportés, ATHLINK100 désactivé temporairement)
- **Post-payment UX**: Rafraîchissement automatique de la page après paiement Stripe avec double notification toast
- **Services de coaching**: Accès restreint au plan ELITE uniquement (retiré du plan PRO)
- **API de réservation**: Déplacée vers `/api/public/booking-request` pour structure Next.js correcte

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15.5.4 (App Router) with React 19.1.0, utilizing Server and Client Components and TypeScript.
- **UI/UX**: Shadcn UI with Radix UI primitives, Tailwind CSS 4, and Framer Motion for animations. Features a 7-color vibrant palette and a mobile-first responsive design.
- **State Management**: React hooks for local state; Next.js App Router for server-side data fetching; API polling for real-time analytics.

### Backend Architecture
- **API Layer**: Next.js API Routes (App Router) for RESTful CRUD operations and Server Actions.
- **Authentication**: NextAuth.js v5 (beta) with Credentials and Google OAuth providers, JWT sessions, and Prisma adapter.
- **Authorization**: Session-based route protection, plan-based feature gating defined in `lib/features.ts`, with server-side enforcement of plan limits across all API routes.
- **Business Logic**: Includes sport type mapping, promo code validation, analytics tracking, and image processing with Sharp.

### Data Architecture
- **ORM**: Prisma with PostgreSQL, defining models for User, Profile, Link, Race, Sponsor, Media, AnalyticsView, and AnalyticsClick.
- **Database Schema**: Profiles link to user authentication, containing athlete info. Links, Races, Sponsors, and Media are associated with profiles. Analytics store referrer, device, and geolocation data.
- **File Storage**: Supabase Storage for avatars, covers, media, and sponsor images, with Sharp-based image optimization.

### Key Design Patterns
- **Component Architecture**: Separation of UI primitives (`components/ui`) and feature components (`components/ui-pro`), clear Client/Server Component boundaries.
- **Data Fetching**: Server Components for page-level data, Client Components for mutations.
- **Form Validation**: Zod schemas for client and server-side validation, integrated with react-hook-form.
- **Plan Management**: Consistent plan type mapping and feature limit definitions.
- **Error Handling**: Try-catch blocks in APIs, Sonner for toast notifications, client-side error boundaries.

## External Dependencies

### Third-Party Services
- **Supabase**: PostgreSQL database hosting and file storage for images/videos.
- **Google OAuth**: Social authentication provider.
- **Stripe**: Subscription payment processing via Stripe Checkout and webhooks.
- **Clearbit Logo API**: Automatic logo fetching for sponsors.
- **ipapi.co**: Geolocation for analytics (free tier).
- **Google Favicon API**: Fallback for logo extraction.

### Key NPM Packages
- **Authentication & Database**: `next-auth`, `@prisma/client`, `@auth/prisma-adapter`, `bcryptjs`.
- **UI & Styling**: `@radix-ui/*`, `framer-motion`, `tailwindcss`, `lucide-react`, `sonner`, `recharts`.
- **Media & Files**: `sharp`, `html2canvas`, `jspdf`, `qrcode`, `canvas-confetti`.
- **Forms & Validation**: `react-hook-form`, `zod`, `@hookform/resolvers`.
- **Payments**: `stripe`.
- **Web Scraping**: `cheerio`.