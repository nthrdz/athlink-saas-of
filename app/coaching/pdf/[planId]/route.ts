import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { PlanType } from "@/lib/features"

interface AccessTokenPayload {
  planId: string
  clientEmail: string
  issuedAt: number
  expiresAt: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: "Token d'accès requis" }, { status: 401 })
    }

    // Vérifier le token
    const tokenPayload = verifyAccessToken(token)
    if (!tokenPayload) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 401 })
    }

    if (tokenPayload.planId !== planId) {
      return NextResponse.json({ error: "Token invalide pour ce plan" }, { status: 403 })
    }

    // Récupérer le plan et le fichier PDF
    const profiles = await prisma.profile.findMany({
      where: { plan: PlanType.ELITE },
      select: { id: true, stats: true }
    })

    let targetPlan = null
    let coachProfileId = null

    for (const profile of profiles) {
      const stats = profile.stats as any
      const trainingPlans = stats.trainingPlans || []
      const plan = trainingPlans.find((p: any) => p.id === planId)
      
      if (plan) {
        targetPlan = plan
        coachProfileId = profile.id
        break
      }
    }

    if (!targetPlan || !targetPlan.pdfFileName || !coachProfileId) {
      return NextResponse.json({ error: "PDF non trouvé" }, { status: 404 })
    }

    // Construire le chemin du fichier
    const fileName = targetPlan.pdfFileName
    const filePath = join(process.cwd(), 'public', 'uploads', 'coaching', coachProfileId, fileName)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Fichier PDF non trouvé sur le serveur" }, { status: 404 })
    }

    // Lire et servir le fichier
    const fileBuffer = await readFile(filePath)
    
    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${targetPlan.title}.pdf"`,
        'Cache-Control': 'private, max-age=3600' // Cache 1h
      }
    })

  } catch (error) {
    console.error("Erreur lors du service du PDF:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const payload: AccessTokenPayload = JSON.parse(decoded)
    
    // Vérifier l'expiration
    if (Date.now() > payload.expiresAt) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

