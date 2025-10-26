import { z } from "zod"

// Fonction pour mapper les sports libres vers l'enum Prisma
export function mapSportToEnum(sport: string): "RUNNING" | "CYCLING" | "TRIATHLON" | "SWIMMING" | "SKIING" | "OTHER" {
  const sportLower = sport.toLowerCase()
  
  // Mapping intelligent des sports
  if (sportLower.includes("course") || sportLower.includes("running") || sportLower.includes("marathon") || sportLower.includes("trail")) {
    return "RUNNING"
  }
  if (sportLower.includes("cycl") || sportLower.includes("vélo") || sportLower.includes("bike") || sportLower.includes("vtt")) {
    return "CYCLING"
  }
  if (sportLower.includes("triathlon") || sportLower.includes("tri")) {
    return "TRIATHLON"
  }
  if (sportLower.includes("natation") || sportLower.includes("swimming") || sportLower.includes("nage")) {
    return "SWIMMING"
  }
  if (sportLower.includes("ski") || sportLower.includes("snow")) {
    return "SKIING"
  }
  
  // Pour tous les autres sports (football, basketball, tennis, etc.)
  return "OTHER"
}

// Fonction pour stocker le sport original dans les stats
export function createStatsWithOriginalSport(currentStats: any, originalSport: string) {
  const stats = currentStats || {}
  return {
    ...stats,
    originalSport: originalSport
  }
}

// Fonction pour récupérer le sport original depuis les stats
export function getOriginalSportFromStats(stats: any): string | null {
  return stats?.originalSport || null
}

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  name: z.string().min(2, "Nom requis"),
  username: z.string()
    .min(3, "Minimum 3 caractères")
    .max(30, "Maximum 30 caractères")
    .regex(/^[a-zA-Z0-9_-]+$/, "Uniquement lettres, chiffres, - et _"),
  sport: z.string().min(2, "Sport requis").max(50, "Maximum 50 caractères"),
})

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

// Link schemas
export const linkSchema = z.object({
  title: z.string().min(1, "Titre requis").max(100, "Maximum 100 caractères"),
  url: z.string().url("URL invalide"),
  description: z.string().max(200, "Maximum 200 caractères").optional(),
  icon: z.string().max(10, "Maximum 10 caractères").optional(),
})

export const linkUpdateSchema = linkSchema.partial()

// Profile schemas
export const profileUpdateSchema = z.object({
  displayName: z.string().min(2, "Minimum 2 caractères").optional(),
  bio: z.string().max(500, "Maximum 500 caractères").nullable().optional(),
  location: z.string().max(100, "Maximum 100 caractères").nullable().optional(),
  sport: z.string().min(2, "Minimum 2 caractères").max(50, "Maximum 50 caractères").optional(),
  instagram: z.string().max(100).nullable().optional(),
  strava: z.union([z.string().url("URL invalide"), z.literal(""), z.null()]).optional(),
  youtube: z.union([z.string().url("URL invalide"), z.literal(""), z.null()]).optional(),
  tiktok: z.string().max(100).nullable().optional(),
  twitter: z.string().max(100).nullable().optional(),
  whatsapp: z.string().max(50).nullable().optional(),
  theme: z.string().optional(),
  isPublic: z.boolean().optional(),
  customDomain: z.union([z.string().max(100, "Maximum 100 caractères"), z.literal(""), z.null()]).optional(),
  customCSS: z.string().nullable().optional(),
})

// Race schemas
export const raceSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200, "Maximum 200 caractères"),
  date: z.string().or(z.date()),
  location: z.string().max(200, "Maximum 200 caractères").optional(),
  distance: z.string().max(50, "Maximum 50 caractères").optional(),
  result: z.string().max(100, "Maximum 100 caractères").optional(),
  status: z.enum(["upcoming", "completed"]).default("upcoming"),
  url: z.string().url("URL invalide").or(z.literal("")).optional(),
  logoUrl: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("URL invalide").optional()
  ),
})

// Sponsor schemas
export const sponsorSchema = z.object({
  name: z.string().min(1, "Nom requis").max(200, "Maximum 200 caractères"),
  logoUrl: z.string().url("URL invalide").or(z.literal("")).optional(),
  websiteUrl: z.string().url("URL invalide").or(z.literal("")).optional(),
  promoCode: z.string().max(50, "Maximum 50 caractères").optional(),
  description: z.string().max(500, "Maximum 500 caractères").optional(),
})

// Media schemas
export const mediaSchema = z.object({
  type: z.enum(["IMAGE", "VIDEO", "YOUTUBE"]),
  url: z.string().url("URL invalide"),
  thumbnail: z.string().url("URL invalide").optional(),
  title: z.string().max(200, "Maximum 200 caractères").optional(),
  description: z.string().max(500, "Maximum 500 caractères").optional(),
})

// Coaching Training Plan schemas
export const trainingPlanSchema = z.object({
  title: z.string().min(1, "Titre requis").max(200, "Maximum 200 caractères"),
  description: z.string().min(1, "Description requise").max(1000, "Maximum 1000 caractères"),
  price: z.number().min(0, "Le prix ne peut pas être négatif").max(10000, "Prix maximum 10000€"),
  duration: z.number().int().min(1, "Durée minimum 1 semaine").max(52, "Durée maximum 52 semaines"),
  difficulty: z.enum(["DEBUTANT", "INTERMEDIAIRE", "AVANCE"], {
    message: "Niveau invalide (DEBUTANT, INTERMEDIAIRE ou AVANCE)"
  }),
  category: z.string().min(1, "Catégorie requise").max(100, "Maximum 100 caractères"),
  isActive: z.boolean().default(true),
  pdfFileName: z.string().max(255, "Nom de fichier trop long").nullable().optional(),
  pdfFileUrl: z.string().url("URL PDF invalide").nullable().optional(),
})

export const trainingPlanUpdateSchema = trainingPlanSchema.partial()

// Coaching Booking schemas
export const bookingSchema = z.object({
  clientName: z.string().min(1, "Nom du client requis").max(200, "Maximum 200 caractères"),
  clientEmail: z.string().email("Email invalide").max(200, "Maximum 200 caractères"),
  clientPhone: z.string().max(50, "Maximum 50 caractères").nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide (HH:MM)"),
  duration: z.number().int().min(15, "Durée minimum 15 minutes").max(480, "Durée maximum 8 heures"),
  service: z.string().min(1, "Service requis").max(200, "Maximum 200 caractères"),
  price: z.number().min(0, "Le prix ne peut pas être négatif").max(10000, "Prix maximum 10000€"),
  notes: z.string().max(1000, "Maximum 1000 caractères").nullable().optional(),
})

export const bookingUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], {
    message: "Statut invalide"
  }).optional(),
  clientName: z.string().min(1, "Nom du client requis").max(200, "Maximum 200 caractères").optional(),
  clientEmail: z.string().email("Email invalide").max(200, "Maximum 200 caractères").optional(),
  clientPhone: z.string().max(50, "Maximum 50 caractères").nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)").optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide (HH:MM)").optional(),
  duration: z.number().int().min(15, "Durée minimum 15 minutes").max(480, "Durée maximum 8 heures").optional(),
  service: z.string().min(1, "Service requis").max(200, "Maximum 200 caractères").optional(),
  price: z.number().min(0, "Le prix ne peut pas être négatif").max(10000, "Prix maximum 10000€").optional(),
  notes: z.string().max(1000, "Maximum 1000 caractères").nullable().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type LinkInput = z.infer<typeof linkSchema>
export type LinkUpdateInput = z.infer<typeof linkUpdateSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type RaceInput = z.infer<typeof raceSchema>
export type SponsorInput = z.infer<typeof sponsorSchema>
export type MediaInput = z.infer<typeof mediaSchema>
export type TrainingPlanInput = z.infer<typeof trainingPlanSchema>
export type TrainingPlanUpdateInput = z.infer<typeof trainingPlanUpdateSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>
