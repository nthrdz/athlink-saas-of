import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Mapper les sports vers les valeurs Sport enum valides
function mapSportToEnum(sport: string): string {
  const sportUpper = sport.toUpperCase()
  const validSports = ['RUNNING', 'CYCLING', 'TRIATHLON', 'SWIMMING', 'SKIING']
  
  if (validSports.includes(sportUpper)) {
    return sportUpper
  }
  
  // Mapper des sports spécifiques
  const sportMap: { [key: string]: string } = {
    'HYROX': 'OTHER',
    'FITNESS': 'OTHER',
    'CROSSFIT': 'OTHER',
    'MUSCULATION': 'OTHER',
    'TRAIL': 'RUNNING',
    'MARATHON': 'RUNNING',
    'CYCLISME': 'CYCLING',
    'VELO': 'CYCLING',
    'NATATION': 'SWIMMING',
    'SKI': 'SKIING'
  }
  
  return sportMap[sportUpper] || 'OTHER'
}

// Codes promo prédéfinis
const PROMO_CODES = {
  "ATHLINK_PREMIUM": {
    type: "plan_upgrade",
    plan: "COACH",
    duration: null,
    discount: 100,
    description: "Accès complet à toutes les fonctionnalités (COACH)"
  },
  "ELITE": {
    type: "plan_upgrade",
    plan: "ATHLETE_PRO",
    duration: null,
    discount: 0,
    description: "Accès Pro complet"
  },
  "ATHLINK100": {
    type: "trial", 
    plan: "ATHLETE_PRO",
    duration: 30,
    discount: 0,
    description: "1 mois offert Pro"
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📥 Body reçu:", JSON.stringify(body, null, 2))
    
    const { promoCode, userData } = body

    if (!userData) {
      console.log("❌ userData manquant:", { promoCode, userData })
      return NextResponse.json({ error: "Données utilisateur requises" }, { status: 400 })
    }
    
    console.log("✅ userData présent:", userData)

    // Vérifier si le code promo existe
    const promo = PROMO_CODES[promoCode?.toUpperCase() as keyof typeof PROMO_CODES]
    
    let planType = "FREE" // Plan par défaut
    let trialEndsAt = null

    if (promo) {
      planType = promo.plan
      
      if (promo.type === "trial" && promo.duration) {
        // Calculer la date de fin d'essai
        trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + promo.duration)
      }
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const existingUsername = await prisma.profile.findUnique({
      where: { username: userData.username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà pris" },
        { status: 400 }
      )
    }

    // Hacher le mot de passe
    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Créer l'utilisateur et le profil avec le code promo appliqué
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        profile: {
          create: {
            username: userData.username,
            displayName: userData.name,
            sport: mapSportToEnum(userData.sport) as any, // Mapper le sport vers enum valide
            plan: planType as any, // Cast temporaire pour l'enum PlanType
            stats: {
              personalRecords: [],
              achievements: [],
              promoCodeUsed: promoCode?.toUpperCase() || null,
              trialEndsAt: trialEndsAt?.toISOString() || null
            }
          }
        }
      },
      include: {
        profile: true
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.profile?.username,
        plan: user.profile?.plan,
        promoApplied: promoCode?.toUpperCase() || null,
        trialEndsAt: trialEndsAt?.toISOString() || null
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error("Erreur application code promo:", error)
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email ou nom d'utilisateur déjà utilisé" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    )
  }
}
