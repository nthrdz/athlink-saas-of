# Athlink - Athletic Link-in-Bio Platform

## Overview
Athlink is a Next.js-based link-in-bio platform designed for athletes to create digital profiles. It allows athletes to showcase their performances, competitions, sponsors, and media content, while also providing visitor analytics and engagement metrics. The platform aims to help athletes build their personal brand and connect with sponsors and fans through tiered subscription plans (FREE, PRO, ELITE) that unlock progressive features.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 26, 2025)
- **Services coaching 100% opérationnels avec validation complète** : Système de validation Zod pour TOUS les services de coaching
  - Ajout de schémas de validation complets pour les plans d'entraînement (trainingPlanSchema, trainingPlanUpdateSchema)
  - Ajout de schémas de validation complets pour les réservations (bookingSchema, bookingUpdateSchema)
  - Validation avec messages d'erreur clairs et en français pour tous les champs (titre, description, prix, durée, difficulté, catégorie, nom client, email, téléphone, date, heure, service, notes)
  - Limites de sécurité : prix max 10000€, durée minimum 15min/max 8h pour réservations, durée min 1 semaine/max 52 semaines pour plans
  - Validation email avec format correct, validation dates (YYYY-MM-DD), validation heures (HH:MM)
  - API complètement refaites avec validation Zod : POST/PUT/DELETE pour plans d'entraînement et réservations
  - Messages d'erreur détaillés retournés au frontend avec path exact du champ invalide
  - Protection contre données manquantes, types invalides, formats incorrects
  - Toutes les APIs testées et fonctionnelles sans bugs
- **Réseaux sociaux Twitter et WhatsApp maintenant sauvegardés** : Correction du schéma de validation pour permettre la sauvegarde
  - Ajout de twitter et whatsapp dans profileUpdateSchema (lib/validations.ts)
  - Les données sont maintenant correctement sauvegardées dans la base de données
  - Affichage automatique sur la page publique quand renseignés
- **Rapport de performance TOTALEMENT refait** : Système de conseils intelligents et personnalisés
  - Analyse intelligente basée sur vos VRAIES performances (trafic, conversion, contenu, fidélité)
  - 5 catégories d'analyse : Visibilité, Conversion, Contenu, Fidélisation, Gains rapides
  - Conseils adaptés avec 3 niveaux : CRITIQUE (rouge), À AMÉLIORER (orange), EXCELLENT (vert)
  - Solutions concrètes et actionnables avec objectifs chiffrés (ex: "Objectif: 50 vues/jour (vous: 12/jour)")
  - Score global sur 100 avec répartition : Trafic (40pts), Conversion (30pts), Contenu (20pts), Fidélité (10pts)
  - Design moderne avec codes couleur, badges de statut et mise en page claire
  - Comparaisons avec benchmarks réalistes (top 10%, moyennes du marché)
  - Maximum 3 conseils prioritaires pour ne pas surcharger
- **Erreur Server Components corrigée** : Supprimé le champ "telegram" qui n'existait pas dans la base de données
  - Retiré `telegram` de l'interface TypeScript Profile dans profile-content.tsx
  - Supprimé le champ Telegram du formulaire de profil
  - Résolu l'erreur "Server Components render" après connexion
- **Carrousel homepage mobile activé** : Les images défilantes sont maintenant visibles sur mobile comme sur desktop
  - Retiré la classe `hidden lg:block` qui cachait le carrousel sur mobile
  - Dimensions responsives : 300px (mobile) → 400px (sm) → 500px (md) → 600px (lg+)
  - Animation fade automatique toutes les 3 secondes entre les images de Noa et Nathan
  - Coins arrondis adaptatifs : rounded-2xl (mobile) → rounded-3xl (desktop)
- **Twitter et WhatsApp ajoutés** : Nouveaux champs sociaux dans la base de données et affichage sur la page publique
  - Ajout des champs `twitter` et `whatsapp` dans le modèle Profile (Prisma)
  - Icônes personnalisées Twitter (X) et WhatsApp dans ModernProfileCard
  - Liens fonctionnels : Twitter → x.com/@username, WhatsApp → wa.me/numero
  - Les icônes s'affichent automatiquement à côté des autres réseaux sociaux (Instagram, TikTok, Strava, Youtube)
- **Extraction logos compétitions 100% opérationnelle** : Système intelligent avec scoring pour trouver le VRAI logo (pas les sponsors)
  - Algorithme de scoring avancé : +380 points pour HYROX-Logo.svg vs 0 pour Fitness-Park-Hyrox
  - Priorisation : fichiers nommés "logo" (+200), SVG (+80), header/nav (+40)
  - Filtrage sponsors : pénalité -150 pour Puma/Nike/Adidas/Myprotein, -100 pour partenariats
  - Validation de 16+ logos candidats triés par pertinence
  - Testé et validé avec hyroxfrance.com : extrait le bon logo officiel SVG
- **Next.js images autorisées** : Configuration `hostname: '**'` pour accepter les logos de TOUS les sites de compétitions HTTPS (nécessaire pour extraire n'importe quelle compétition)
- **Affichage logos optimisé** : Fond noir (bg-gray-900) pour voir les logos blancs + padding pour meilleur rendu
- **Favicon.ico corrigé**: Résolu l'erreur 404/500 sur favicon.ico en créant le fichier dans public/ - retourne maintenant 200 OK avec Content-Type image/x-icon
- **Extraction logos base technique** : 38 sélecteurs CSS, timeouts 15s scraping/8s validation, support lazy loading (data-src, data-lazy-src, data-original), détection SVG et types MIME
- **Système de codes promo avec expiration automatique** :
  - Nouveau code ELITE2025 : accès ELITE permanent
  - Nouveau code PRO30FREE : 1 mois PRO offert avec expiration automatique vers FREE
  - Ajout champs DB : trialEndsAt, trialPlan dans Profile
  - API cron `/api/cron/expire-trials` pour vérification automatique
  - Fonction utilitaire `checkAndExpireTrial()` pour vérification en temps réel
  - Documentation complète dans CODES_PROMO.md
- **Correctifs TypeScript déploiement**: Supprimé toutes les références à "COACH" dans les types TypeScript (advanced-analytics.tsx, analytics-with-filter.tsx, upgrade/page.tsx, plan-badge.tsx) et corrigé les mappings de plans - Build production réussi ✓
- **Favicon personnalisé**: Ajout du logo Athlink simplifié (64x64px haute qualité) monochrome (noir et gris uniquement) avec moins de détails pour meilleure visibilité en petit - créé aussi apple-icon.png (180x180px)
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