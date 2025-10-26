import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PlanType } from "@/lib/features"
import { bookingSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error)
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
      select: { id: true, plan: true, stats: true }
    })

    if (!profile || (profile.plan !== PlanType.ELITE)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    
    // Parser les données
    const rawData = {
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone || null,
      date: body.date,
      startTime: body.startTime,
      duration: typeof body.duration === 'string' ? parseInt(body.duration) : body.duration,
      service: body.service,
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      notes: body.notes || null,
    }

    // Valider avec Zod
    const validation = bookingSchema.safeParse(rawData)
    
    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const validatedData = validation.data

    // Calculer l'heure de fin
    const [hours, minutes] = validatedData.startTime.split(':').map(Number)
    const endMinutes = hours * 60 + minutes + validatedData.duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

    // Récupérer les réservations existantes
    const stats = profile.stats as any || {}
    const existingBookings = stats.bookings || []

    // Créer la nouvelle réservation
    const newBooking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      endTime,
      status: "PENDING",
      createdAt: new Date().toISOString()
    }

    // Ajouter la nouvelle réservation
    const updatedBookings = [newBooking, ...existingBookings]

    // Sauvegarder dans le profil
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        stats: {
          ...stats,
          bookings: updatedBookings
        }
      }
    })

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
