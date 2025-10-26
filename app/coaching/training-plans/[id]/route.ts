import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PlanType } from "@/lib/features"
import { trainingPlanUpdateSchema } from "@/lib/validations"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const plan = plans.find((p: any) => p.id === id)

    if (!plan) {
      return NextResponse.json({ error: "Plan non trouvé" }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Erreur lors de la récupération du plan:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const rawData: any = {}
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const priceStr = formData.get('price') as string
    const durationStr = formData.get('duration') as string
    const difficulty = formData.get('difficulty') as string
    const category = formData.get('category') as string
    const isActiveStr = formData.get('isActive') as string
    const pdfFileNameFromForm = formData.get('pdfFileName') as string
    
    if (title) rawData.title = title
    if (description) rawData.description = description
    if (priceStr) rawData.price = parseFloat(priceStr)
    if (durationStr) rawData.duration = parseInt(durationStr)
    if (difficulty) rawData.difficulty = difficulty
    if (category) rawData.category = category
    if (isActiveStr !== null) rawData.isActive = isActiveStr === 'true'
    if (pdfFileNameFromForm) rawData.pdfFileName = pdfFileNameFromForm

    // Valider avec Zod
    const validation = trainingPlanUpdateSchema.safeParse(rawData)
    
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
    const plans = stats.trainingPlans || []
    const planIndex = plans.findIndex((p: any) => p.id === id)

    if (planIndex === -1) {
      return NextResponse.json({ error: "Plan non trouvé" }, { status: 404 })
    }

    // Mettre à jour le plan
    const updatedPlan = {
      ...plans[planIndex],
      ...validatedData
    }

    plans[planIndex] = updatedPlan

    // Sauvegarder
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        stats: {
          ...stats,
          trainingPlans: plans
        }
      }
    })

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du plan:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Récupérer les plans existants
    const profileData = await prisma.profile.findUnique({
      where: { id: profile.id },
      select: { stats: true }
    })

    const stats = profileData?.stats as any || {}
    const plans = stats.trainingPlans || []
    const planIndex = plans.findIndex((p: any) => p.id === id)

    if (planIndex === -1) {
      return NextResponse.json({ error: "Plan non trouvé" }, { status: 404 })
    }

    // Supprimer le plan
    plans.splice(planIndex, 1)

    // Sauvegarder
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        stats: {
          ...stats,
          trainingPlans: plans
        }
      }
    })

    return NextResponse.json({ message: "Plan supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du plan:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
