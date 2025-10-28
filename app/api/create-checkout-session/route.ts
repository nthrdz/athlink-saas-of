import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import Stripe from "stripe"
import { prisma } from "@/lib/db"
import { STRIPE_PRICES } from "@/lib/stripe-prices"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { planName, billingCycle, promoCode } = await req.json()

    if (!planName || !billingCycle) {
      return NextResponse.json({ error: "Plan et cycle de facturation requis" }, { status: 400 })
    }

    // Valider le plan
    if (!["Pro", "Elite"].includes(planName)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 })
    }

    // Valider le cycle de facturation
    if (!["monthly", "yearly"].includes(billingCycle)) {
      return NextResponse.json({ error: "Cycle de facturation invalide" }, { status: 400 })
    }

    // Dériver le priceId sur le serveur (sécurité)
    const priceMapping: Record<string, Record<string, string>> = {
      "Pro": {
        "monthly": STRIPE_PRICES.pro.monthly,
        "yearly": STRIPE_PRICES.pro.yearly,
      },
      "Elite": {
        "monthly": STRIPE_PRICES.elite.monthly,
        "yearly": STRIPE_PRICES.elite.yearly,
      },
    }

    const priceId = priceMapping[planName][billingCycle]

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user || !user.profile) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:5000"

    // Récupérer le code promo Stripe sauvegardé (s'il existe)
    const sessionConfig: any = {
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?upgrade=success&plan=${planName}`,
      cancel_url: `${origin}/dashboard/upgrade?canceled=true`,
      metadata: {
        userId: user.id,
        profileId: user.profile.id,
        planName: planName,
      },
    }

    // Si un code promo est passé en paramètre, l'utiliser en priorité
    const codeToUse = promoCode || user.profile.stripePromoCode
    
    // Si l'utilisateur a un code promo Stripe, l'appliquer automatiquement
    if (codeToUse) {
      try {
        const promotionCodes = await stripe.promotionCodes.list({
          code: codeToUse,
          limit: 1,
        })

        if (promotionCodes.data.length > 0 && promotionCodes.data[0].active) {
          sessionConfig.discounts = [{
            promotion_code: promotionCodes.data[0].id
          }]
          
          // Supprimer le code après utilisation pour éviter les réutilisations
          await prisma.profile.update({
            where: { id: user.profile.id },
            data: { stripePromoCode: null }
          })
        }
      } catch (error) {
        console.error("Erreur application code promo:", error)
        // Continuer sans le code si erreur
      }
    }

    // Si aucun code sauvegardé, permettre l'entrée manuelle
    if (!sessionConfig.discounts) {
      sessionConfig.allow_promotion_codes = true
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Erreur création session Stripe:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    )
  }
}
