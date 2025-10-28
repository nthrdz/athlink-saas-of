import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { signupSchema, mapSportToEnum, createStatsWithOriginalSport } from "@/lib/validations"
import { PROMO_CODES } from "@/lib/promo-codes"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { promoCode, userData } = body

    if (!promoCode || !userData) {
      return NextResponse.json(
        { error: "Code promo et données utilisateur requis" },
        { status: 400 }
      )
    }

    // Valider les données utilisateur
    const validatedData = signupSchema.parse(userData)

    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      )
    }

    // Check if username exists
    const existingUsername = await prisma.profile.findUnique({
      where: { username: validatedData.username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà pris" },
        { status: 400 }
      )
    }

    const upperCode = promoCode.toUpperCase().trim()
    const internalPromo = PROMO_CODES[upperCode as keyof typeof PROMO_CODES]

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)

    // Si c'est un code INTERNE : créer le compte avec le plan gratuit
    if (internalPromo) {
      const plan = internalPromo.plan as "FREE" | "PRO" | "ELITE"
      const trialEndsAt = internalPromo.type === "trial" && internalPromo.duration
        ? new Date(Date.now() + internalPromo.duration * 24 * 60 * 60 * 1000)
        : null

      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: hashedPassword,
          profile: {
            create: {
              username: validatedData.username,
              displayName: validatedData.name,
              sport: mapSportToEnum(validatedData.sport),
              stats: createStatsWithOriginalSport(null, validatedData.sport),
              plan: plan,
              trialEndsAt: trialEndsAt,
              trialPlan: internalPromo.type === "trial" ? plan : null
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
          plan: user.profile?.plan
        }
      }, { status: 201 })
    }

    // Si c'est un code STRIPE : créer le compte FREE et sauvegarder le code
    // Le code sera appliqué automatiquement au checkout
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        profile: {
          create: {
            username: validatedData.username,
            displayName: validatedData.name,
            sport: mapSportToEnum(validatedData.sport),
            stats: createStatsWithOriginalSport(null, validatedData.sport),
            plan: "FREE",
            stripePromoCode: upperCode  // Sauvegarder le code Stripe
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
        stripePromoCode: user.profile?.stripePromoCode
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error("Signup with promo error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    )
  }
}
