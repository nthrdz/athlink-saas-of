import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sponsorSchema } from "@/lib/validations"

// PATCH update sponsor
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = sponsorSchema.partial().parse(body)

    // Convertir les chaînes vides en null pour Prisma
    const cleanedData: any = { ...validatedData }
    if ('logoUrl' in cleanedData) {
      cleanedData.logoUrl = cleanedData.logoUrl && cleanedData.logoUrl.trim() !== "" ? cleanedData.logoUrl : null
    }
    if ('websiteUrl' in cleanedData) {
      cleanedData.websiteUrl = cleanedData.websiteUrl && cleanedData.websiteUrl.trim() !== "" ? cleanedData.websiteUrl : null
    }
    if ('promoCode' in cleanedData) {
      cleanedData.promoCode = cleanedData.promoCode && cleanedData.promoCode.trim() !== "" ? cleanedData.promoCode : null
    }
    if ('description' in cleanedData) {
      cleanedData.description = cleanedData.description && cleanedData.description.trim() !== "" ? cleanedData.description : null
    }

    // Verify sponsor belongs to user
    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
      include: { profile: true }
    })

    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor non trouvé" }, { status: 404 })
    }

    if (sponsor.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const updatedSponsor = await prisma.sponsor.update({
      where: { id },
      data: cleanedData
    })

    return NextResponse.json({ sponsor: updatedSponsor })

  } catch (error: any) {
    console.error("PATCH sponsor error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE sponsor
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Verify sponsor belongs to user
    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
      include: { profile: true }
    })

    if (!sponsor) {
      return NextResponse.json({ error: "Sponsor non trouvé" }, { status: 404 })
    }

    if (sponsor.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    await prisma.sponsor.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("DELETE sponsor error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
