import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PROMO_CODES } from "@/lib/promo-codes"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { plan, promoCode } = await req.json()

    if (!plan || !promoCode) {
      return NextResponse.json(
        { error: "Plan et code promo requis" },
        { status: 400 }
      )
    }

    // Valider le code promo
    const upperPromoCode = promoCode.toUpperCase()
    const promo = PROMO_CODES[upperPromoCode as keyof typeof PROMO_CODES]

    if (!promo) {
      return NextResponse.json(
        { error: "Code promo invalide" },
        { status: 400 }
      )
    }

    // Vérifier que le code promo correspond au plan demandé
    if (promo.plan !== plan) {
      return NextResponse.json(
        { error: "Ce code promo ne s'applique pas à ce plan" },
        { status: 400 }
      )
    }

    // Rejeter les codes trial pour l'instant (pas de support des dates d'expiration)
    if (promo.type === "trial") {
      return NextResponse.json(
        { error: "Les codes trial ne sont pas encore supportés. Utilisez la page d'upgrade pour un abonnement payant." },
        { status: 400 }
      )
    }

    // Mettre à jour le plan de l'utilisateur
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        plan: plan,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Plan mis à jour avec succès",
      profile: {
        plan: updatedProfile.plan
      }
    })

  } catch (error: any) {
    console.error("POST /api/upgrade-plan error:", error)
    
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour du plan" },
      { status: 500 }
    )
  }
}
