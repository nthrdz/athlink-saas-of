import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { promoCode } = await req.json()

    if (!promoCode || typeof promoCode !== "string") {
      return NextResponse.json(
        { error: "Code promo requis" },
        { status: 400 }
      )
    }

    // Sauvegarder le code promo dans le profil
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        stripePromoCode: promoCode.toUpperCase().trim()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Code promo sauvegardé"
    })

  } catch (error: any) {
    console.error("POST /api/save-promo-code error:", error)
    
    return NextResponse.json(
      { error: error.message || "Erreur lors de la sauvegarde du code promo" },
      { status: 500 }
    )
  }
}
