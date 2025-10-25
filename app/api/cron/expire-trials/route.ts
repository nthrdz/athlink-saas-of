import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const now = new Date()
    
    const expiredTrials = await prisma.profile.findMany({
      where: {
        trialEndsAt: {
          lte: now
        },
        NOT: {
          trialEndsAt: null
        }
      }
    })

    const results = []
    
    for (const profile of expiredTrials) {
      const updated = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          plan: "FREE",
          trialEndsAt: null,
          trialPlan: null,
          updatedAt: now
        }
      })
      
      results.push({
        userId: updated.userId,
        username: updated.username,
        previousPlan: profile.trialPlan,
        newPlan: updated.plan,
        expiredAt: profile.trialEndsAt
      })
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} trial(s) expiré(s)`,
      expiredTrials: results
    })

  } catch (error: any) {
    console.error("Erreur lors de l'expiration des trials:", error)
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    )
  }
}
