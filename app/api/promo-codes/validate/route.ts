import { NextRequest, NextResponse } from "next/server"
import { PROMO_CODES } from "@/lib/promo-codes"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Code requis" },
        { status: 400 }
      )
    }

    const upperCode = code.toUpperCase().trim()

    // 1. Vérifier d'abord si c'est un code interne
    const internalPromo = PROMO_CODES[upperCode as keyof typeof PROMO_CODES]
    
    if (internalPromo) {
      return NextResponse.json({
        valid: true,
        code: upperCode,
        type: internalPromo.type,
        plan: internalPromo.plan,
        duration: internalPromo.duration,
        description: internalPromo.description,
        source: "internal"
      })
    }

    // 2. Sinon, vérifier si c'est un code Stripe
    try {
      const promotionCodes = await stripe.promotionCodes.list({
        code: upperCode,
        limit: 1
      })

      if (promotionCodes.data.length === 0) {
        return NextResponse.json({ 
          valid: false,
          error: "Code promo invalide"
        })
      }

      const stripePromo = promotionCodes.data[0]
      
      // Récupérer les détails du coupon
      const coupon = await stripe.coupons.retrieve(stripePromo.coupon as string)

      // Vérifier si le code est actif
      if (!stripePromo.active) {
        return NextResponse.json({ 
          valid: false,
          error: "Ce code promo n'est plus actif"
        })
      }

      // Vérifier si le code a expiré
      if (stripePromo.expires_at && stripePromo.expires_at < Math.floor(Date.now() / 1000)) {
        return NextResponse.json({ 
          valid: false,
          error: "Ce code promo a expiré"
        })
      }

      // Vérifier si le code a atteint sa limite d'utilisation
      if (stripePromo.max_redemptions && stripePromo.times_redeemed >= stripePromo.max_redemptions) {
        return NextResponse.json({ 
          valid: false,
          error: "Ce code promo a atteint sa limite d'utilisation"
        })
      }

      // Récupérer les informations du coupon
      const discount = coupon.percent_off 
        ? `${coupon.percent_off}% de réduction`
        : coupon.amount_off 
        ? `${(coupon.amount_off / 100).toFixed(2)}€ de réduction`
        : "Réduction applicable"

      const duration = coupon.duration === "forever"
        ? "à vie"
        : coupon.duration === "once"
        ? "sur le premier paiement"
        : coupon.duration_in_months
        ? `pendant ${coupon.duration_in_months} mois`
        : ""

      return NextResponse.json({
        valid: true,
        code: upperCode,
        type: "stripe_discount",
        source: "stripe",
        promotionCodeId: stripePromo.id,
        description: `${discount} ${duration}`,
        discount: {
          percent_off: coupon.percent_off,
          amount_off: coupon.amount_off,
          duration: coupon.duration,
          duration_in_months: coupon.duration_in_months
        }
      })

    } catch (stripeError: any) {
      console.error("Erreur validation Stripe:", stripeError)
      return NextResponse.json({ 
        valid: false,
        error: "Erreur lors de la validation du code"
      })
    }

  } catch (error: any) {
    console.error("POST /api/promo-codes/validate error:", error)
    return NextResponse.json(
      { valid: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
