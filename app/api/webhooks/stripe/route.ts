import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/db"
import { PlanType } from "@prisma/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
})

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET non défini")
      return NextResponse.json({ error: "Configuration webhook manquante" }, { status: 500 })
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Erreur webhook Stripe:", err)
    return NextResponse.json({ error: "Webhook invalide" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
        const profileId = session.metadata?.profileId
        const planName = session.metadata?.planName

        if (!profileId || !planName) {
          console.error("Metadata manquante dans la session Stripe")
          return NextResponse.json({ error: "Metadata manquante" }, { status: 400 })
        }

        const planMapping: Record<string, PlanType> = {
          "Pro": PlanType.PRO,
          "Elite": PlanType.ELITE
        }

        const prismaPlan = planMapping[planName]

        if (!prismaPlan) {
          console.error("Plan invalide:", planName)
          return NextResponse.json({ error: "Plan invalide" }, { status: 400 })
        }

        await prisma.profile.update({
          where: { id: profileId },
          data: { plan: prismaPlan }
        })

        console.log(`Plan ${planName} activé pour le profil ${profileId}`)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null
        }
        
        if (invoice.billing_reason !== "subscription_cycle") {
          break
        }

        const subscriptionId = typeof invoice.subscription === "string" 
          ? invoice.subscription 
          : (invoice.subscription as Stripe.Subscription | null)?.id
        if (!subscriptionId) break

        const usage = await prisma.promoCodeUsage.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          include: {
            promoCode: {
              include: {
                ambassador: true,
              },
            },
            user: true,
          },
        })

        if (usage && usage.promoCode.ambassador.commissionType === "recurring") {
          const amount = (invoice.amount_paid || 0) / 100
          const commissionAmount = amount * (usage.promoCode.ambassador.commissionRate / 100)
          
          await prisma.commission.create({
            data: {
              ambassadorId: usage.ambassadorId,
              userId: usage.userId,
              type: "renewal",
              amount: commissionAmount,
              rate: usage.promoCode.ambassador.commissionRate,
              planType: usage.planType,
              revenue: amount,
              stripeInvoiceId: invoice.id,
              status: "pending",
              period: new Date().toISOString().slice(0, 7),
            },
          })

          await prisma.ambassador.update({
            where: { id: usage.ambassadorId },
            data: {
              totalRevenue: {
                increment: amount,
              },
              totalCommission: {
                increment: commissionAmount,
              },
            },
          })

          await prisma.promoCode.update({
            where: { id: usage.promoCodeId },
            data: {
              totalRevenue: {
                increment: amount,
              },
            },
          })

          console.log(`Commission récurrente créée pour l'ambassadeur ${usage.ambassadorId}: ${commissionAmount}€`)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        
        const customerId = subscription.customer as string
        
        const customer = await stripe.customers.retrieve(customerId)
        if (customer.deleted) {
          console.error("Client Stripe supprimé")
          return NextResponse.json({ error: "Client supprimé" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
          where: { email: customer.email! },
          include: { profile: true }
        })

        if (user?.profile) {
          await prisma.profile.update({
            where: { id: user.profile.id },
            data: { plan: PlanType.FREE }
          })

          console.log(`Abonnement annulé pour le profil ${user.profile.id}`)
        }
        break
      }

      default:
        console.log(`Event non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erreur traitement webhook:", error)
    return NextResponse.json(
      { error: "Erreur traitement webhook" },
      { status: 500 }
    )
  }
}
