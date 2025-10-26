import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PlanType } from "@/lib/features"
import { bookingUpdateSchema } from "@/lib/validations"

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
      select: { id: true, plan: true, stats: true }
    })

    if (!profile || (profile.plan !== PlanType.ELITE)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const stats = profile.stats as any || {}
    const bookings = stats.bookings || []
    const booking = bookings.find((b: any) => b.id === id)

    if (!booking) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation:", error)
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
      select: { id: true, plan: true, stats: true }
    })

    if (!profile || (profile.plan !== PlanType.ELITE)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    
    // Parser les données
    const rawData: any = {}
    if (body.status) rawData.status = body.status
    if (body.clientName) rawData.clientName = body.clientName
    if (body.clientEmail) rawData.clientEmail = body.clientEmail
    if (body.clientPhone !== undefined) rawData.clientPhone = body.clientPhone || null
    if (body.date) rawData.date = body.date
    if (body.startTime) rawData.startTime = body.startTime
    if (body.duration) rawData.duration = typeof body.duration === 'string' ? parseInt(body.duration) : body.duration
    if (body.service) rawData.service = body.service
    if (body.price !== undefined) rawData.price = typeof body.price === 'string' ? parseFloat(body.price) : body.price
    if (body.notes !== undefined) rawData.notes = body.notes || null

    // Valider avec Zod
    const validation = bookingUpdateSchema.safeParse(rawData)
    
    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const validatedData = validation.data

    // Récupérer les réservations existantes
    const stats = profile.stats as any || {}
    const bookings = stats.bookings || []
    const bookingIndex = bookings.findIndex((b: any) => b.id === id)

    if (bookingIndex === -1) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 })
    }

    // Recalculer l'heure de fin si nécessaire
    let endTime = bookings[bookingIndex].endTime
    if (validatedData.startTime && validatedData.duration) {
      const [hours, minutes] = validatedData.startTime.split(':').map(Number)
      const endMinutes = hours * 60 + minutes + validatedData.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
    }

    // Mettre à jour la réservation
    const updatedBooking = {
      ...bookings[bookingIndex],
      ...validatedData,
      endTime
    }

    bookings[bookingIndex] = updatedBooking

    // Sauvegarder
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        stats: {
          ...stats,
          bookings
        }
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la réservation:", error)
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
      select: { id: true, plan: true, stats: true }
    })

    if (!profile || (profile.plan !== PlanType.ELITE)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    // Récupérer les réservations existantes
    const stats = profile.stats as any || {}
    const bookings = stats.bookings || []
    const bookingIndex = bookings.findIndex((b: any) => b.id === id)

    if (bookingIndex === -1) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 })
    }

    // Supprimer la réservation
    bookings.splice(bookingIndex, 1)

    // Sauvegarder
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        stats: {
          ...stats,
          bookings
        }
      }
    })

    return NextResponse.json({ message: "Réservation supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
