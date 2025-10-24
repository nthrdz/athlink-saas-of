import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

// Fonction pour obtenir le pays depuis l'IP
async function getCountryFromIP(ip: string): Promise<string | null> {
  // IPs locales ou inconnues
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return null
  }

  try {
    // Utiliser ipapi.co (gratuit, 30k requêtes/mois)
    const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
      signal: AbortSignal.timeout(3000),
      headers: {
        'User-Agent': 'Athlink/1.0'
      }
    })

    if (response.ok) {
      const country = await response.text()
      return country.trim() || null
    }

    return null
  } catch (error) {
    console.error('Erreur géolocalisation IP:', error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { profileId } = await request.json()

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID requis" }, { status: 400 })
    }

    // Récupérer les informations du visiteur
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || 'unknown'
    
    // Déterminer le type d'appareil
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)
    const device = isMobile ? 'mobile' : 'desktop'
    
    // Déterminer le navigateur
    let browser = 'Other'
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome'
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Edg')) browser = 'Edge'
    
    // Récupérer le pays depuis l'IP
    const country = await getCountryFromIP(ip)

    // Récupérer ou créer l'entrée analytics du jour
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let analytics = await prisma.analytics.findFirst({
      where: {
        profileId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    if (!analytics) {
      analytics = await prisma.analytics.create({
        data: {
          profileId,
          date: today,
          views: 1,
          uniqueViews: 1,
          linkClicks: 0,
          device,
          country: null // Ne pas stocker de pays unique, utiliser demographics à la place
        }
      })
    } else {
      analytics = await prisma.analytics.update({
        where: { id: analytics.id },
        data: {
          views: { increment: 1 }
        }
      })
    }

    // Stocker les données démographiques dans les stats du profil
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { stats: true }
    })

    const stats = (profile?.stats as any) || {}
    const demographics = stats.demographics || {
      devices: {},
      browsers: {},
      countries: {}
    }

    // Incrémenter les compteurs
    demographics.devices[device] = (demographics.devices[device] || 0) + 1
    demographics.browsers[browser] = (demographics.browsers[browser] || 0) + 1
    if (country) {
      demographics.countries[country] = (demographics.countries[country] || 0) + 1
    }

    await prisma.profile.update({
      where: { id: profileId },
      data: {
        stats: {
          ...stats,
          demographics
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      analyticsId: analytics.id,
      device,
      browser,
      country
    })
  } catch (error) {
    console.error("Erreur tracking view:", error)
    return NextResponse.json(
      { error: "Erreur lors du tracking" },
      { status: 500 }
    )
  }
}

