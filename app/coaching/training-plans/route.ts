import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PlanType } from "@/lib/features"
import { trainingPlanSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET(request: NextRequest) {
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

    const profileData = await prisma.profile.findUnique({
      where: { id: profile.id },
      select: { stats: true }
    })

    const stats = profileData?.stats as any || {}
    const plans = stats.trainingPlans || []

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Erreur lors de la récupération des plans:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

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
    
    // Parser les données du formulaire
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
      duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : undefined,
      difficulty: formData.get('difficulty') as string,
      category: formData.get('category') as string,
      isActive: formData.get('isActive') === 'true',
      pdfFileName: (formData.get('pdfFileName') as string) || null,
      pdfFileUrl: (formData.get('pdfFileUrl') as string) || null,
    }

    // Valider avec Zod
    const validation = trainingPlanSchema.safeParse(rawData)
    
    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const validatedData = validation.data

    // Récupérer les plans existants
    const profileData = await prisma.profile.findUnique({
      where: { id: profile.id },
      select: { stats: true }
    })

    const stats = profileData?.stats as any || {}
    const existingPlans = stats.trainingPlans || []

    // Créer le nouveau plan
    const newPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      createdAt: new Date().toISOString(),
      sessions: [],
      subscribers: [],
      _count: {
        sessions: 0,
        subscribers: 0
      }
    }

    // Ajouter le nouveau plan
    const updatedPlans = [newPlan, ...existingPlans]

    // Sauvegarder dans le profil
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        stats: {
          ...stats,
          trainingPlans: updatedPlans
        }
      }
    })

    return NextResponse.json(newPlan, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du plan:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
