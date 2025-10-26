import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PlanType } from "@/lib/features"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, plan: true }
    })

    if (!profile || (profile.plan !== PlanType.ELITE)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const formData = await request.formData()
    const pdfFile = formData.get('pdfFile') as File
    const planId = formData.get('planId') as string

    if (!pdfFile) {
      return NextResponse.json({ error: "Fichier PDF requis" }, { status: 400 })
    }

    if (!pdfFile.type.includes('pdf')) {
      return NextResponse.json({ error: "Le fichier doit être un PDF" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (pdfFile.size > maxSize) {
      return NextResponse.json({ error: "Le fichier ne doit pas dépasser 10MB" }, { status: 400 })
    }

    // Pour l'instant, on retourne juste les infos du fichier
    // Dans une vraie app, on uploadrait vers Supabase Storage
    const fileUrl = `/uploads/training-plans/${planId}/${pdfFile.name}`
    
    return NextResponse.json({
      fileUrl,
      originalName: pdfFile.name,
      size: pdfFile.size
    }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de l'upload du PDF:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
