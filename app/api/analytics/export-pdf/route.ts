import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import jsPDF from "jspdf"

// Fonction pour générer des conseils intelligents basés sur les performances réelles
function generateSmartAdvice(data: {
  totalViews: number
  totalUniqueViews: number
  totalClicks: number
  avgViewsPerDay: number
  days: number
  linksCount: number
  racesCount: number
  sponsorsCount: number
  mediaCount: number
}) {
  const advice = []
  const {
    totalViews,
    totalUniqueViews,
    totalClicks,
    avgViewsPerDay,
    days,
    linksCount,
    racesCount,
    sponsorsCount,
    mediaCount
  } = data

  const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0
  const retentionRate = totalViews > 0 ? (totalUniqueViews / totalViews) * 100 : 0

  // 1. ANALYSE DU TRAFIC
  if (avgViewsPerDay < 10) {
    advice.push({
      priority: 1,
      icon: '🚀',
      category: 'VISIBILITÉ',
      problem: `${avgViewsPerDay} vue${avgViewsPerDay > 1 ? 's' : ''}/jour`,
      status: 'CRITIQUE',
      statusColor: [239, 68, 68], // rouge
      description: 'Votre profil manque de visibilité. Voici comment y remédier:',
      solutions: [
        `Partagez votre lien athlink.com/${data.days > 0 ? 'username' : ''} sur Instagram en bio`,
        'Postez 3-5 stories par semaine pointant vers votre profil',
        'Ajoutez votre lien dans vos posts TikTok/YouTube',
        `Objectif à atteindre: 50 vues/jour (vous: ${avgViewsPerDay}/jour)`
      ]
    })
  } else if (avgViewsPerDay < 50) {
    advice.push({
      priority: 1,
      icon: '📈',
      category: 'CROISSANCE',
      problem: `${avgViewsPerDay} vues/jour`,
      status: 'À AMÉLIORER',
      statusColor: [245, 158, 11], // orange
      description: 'Bon début ! Accélérez la croissance:',
      solutions: [
        'Collaborez avec 2-3 athlètes de votre niveau',
        'Utilisez des hashtags ciblés (#running #trail #fitness)',
        'Créez du contenu viral (défis, transformations)',
        `Objectif: 100 vues/jour (vous: ${avgViewsPerDay}/jour)`
      ]
    })
  } else if (avgViewsPerDay >= 50) {
    advice.push({
      priority: 1,
      icon: '✅',
      category: 'TRAFIC',
      problem: `${avgViewsPerDay} vues/jour`,
      status: 'EXCELLENT',
      statusColor: [16, 185, 129], // vert
      description: 'Votre visibilité est solide ! Maintenez le cap:',
      solutions: [
        'Continuez votre rythme de publication actuel',
        'Diversifiez vos canaux de promotion',
        'Analysez vos meilleures sources de trafic',
        'Objectif: Doubler en 3 mois'
      ]
    })
  }

  // 2. ANALYSE DU TAUX DE CONVERSION
  if (conversionRate < 2 && totalViews > 10) {
    advice.push({
      priority: 2,
      icon: '🎯',
      category: 'CONVERSION',
      problem: `${conversionRate.toFixed(1)}% de clics`,
      status: 'CRITIQUE',
      statusColor: [239, 68, 68],
      description: 'Vos visiteurs ne cliquent pas assez. Actions immédiates:',
      solutions: [
        `Réduisez vos liens: max 5 liens (vous: ${linksCount})`,
        'Utilisez des titres accrocheurs: "🔥 Découvre mon plan"',
        'Mettez en avant votre MEILLEUR contenu en 1er',
        `Objectif: 5% de clics (vous: ${conversionRate.toFixed(1)}%)`
      ]
    })
  } else if (conversionRate >= 2 && conversionRate < 5 && totalViews > 10) {
    advice.push({
      priority: 2,
      icon: '💡',
      category: 'OPTIMISATION',
      problem: `${conversionRate.toFixed(1)}% de clics`,
      status: 'MOYEN',
      statusColor: [245, 158, 11],
      description: 'Bon taux de clic, optimisez encore:',
      solutions: [
        'Testez différents titres et émojis',
        'Créez de l\'urgence: "🎁 Offre limitée"',
        'A/B testez vos 3 premiers liens',
        `Objectif: 8% de clics (vous: ${conversionRate.toFixed(1)}%)`
      ]
    })
  } else if (conversionRate >= 5 && totalViews > 10) {
    advice.push({
      priority: 2,
      icon: '🏆',
      category: 'CONVERSION',
      problem: `${conversionRate.toFixed(1)}% de clics`,
      status: 'EXCELLENT',
      statusColor: [16, 185, 129],
      description: 'Votre taux de conversion est au top !',
      solutions: [
        'Votre stratégie fonctionne, continuez ainsi',
        'Documentez ce qui marche pour répliquer',
        'Augmentez maintenant votre trafic',
        'Vous êtes dans le top 10% des profils'
      ]
    })
  }

  // 3. ANALYSE DU CONTENU
  const totalContent = linksCount + racesCount + sponsorsCount + mediaCount
  if (totalContent < 5) {
    advice.push({
      priority: 3,
      icon: '📝',
      category: 'CONTENU',
      problem: `${totalContent} éléments seulement`,
      status: 'INSUFFISANT',
      statusColor: [239, 68, 68],
      description: 'Votre profil manque de contenu. Ajoutez immédiatement:',
      solutions: [
        `${linksCount < 3 ? `✓ 3-5 liens (vous: ${linksCount})` : '✓ Liens OK'}`,
        `${racesCount < 3 ? `✓ 3-5 compétitions (vous: ${racesCount})` : '✓ Compétitions OK'}`,
        `${sponsorsCount < 2 ? `✓ 2-3 sponsors (vous: ${sponsorsCount})` : '✓ Sponsors OK'}`,
        `${mediaCount < 4 ? `✓ 4-6 photos/vidéos (vous: ${mediaCount})` : '✓ Média OK'}`
      ]
    })
  } else if (totalContent < 15) {
    advice.push({
      priority: 3,
      icon: '🎨',
      category: 'CONTENU',
      problem: `${totalContent} éléments`,
      status: 'BIEN',
      statusColor: [245, 158, 11],
      description: 'Base solide ! Enrichissez votre profil:',
      solutions: [
        'Ajoutez 1-2 éléments par semaine',
        'Variez les types de contenu',
        'Mettez à jour régulièrement',
        `Objectif: 20+ éléments (vous: ${totalContent})`
      ]
    })
  }

  // 4. ANALYSE DE LA RÉTENTION
  if (retentionRate < 40 && totalViews > 20) {
    advice.push({
      priority: 4,
      icon: '🔄',
      category: 'FIDÉLISATION',
      problem: `${retentionRate.toFixed(0)}% de rétention`,
      status: 'FAIBLE',
      statusColor: [239, 68, 68],
      description: 'Trop de visiteurs uniques, pas assez de retours:',
      solutions: [
        'Créez du contenu récurrent: "Lundi Motivation"',
        'Offrez un bonus pour abonnés: code promo exclusif',
        'Annoncez vos prochains posts sur Instagram',
        `Objectif: 60% de rétention (vous: ${retentionRate.toFixed(0)}%)`
      ]
    })
  } else if (retentionRate >= 70 && totalViews > 20) {
    advice.push({
      priority: 4,
      icon: '💪',
      category: 'FIDÉLISATION',
      problem: `${retentionRate.toFixed(0)}% de rétention`,
      status: 'EXCELLENT',
      statusColor: [16, 185, 129],
      description: 'Vos visiteurs reviennent, c\'est parfait !',
      solutions: [
        'Votre contenu fidélise, continuez',
        'Récompensez vos visiteurs fidèles',
        'Créez une communauté privée',
        'Vous maîtrisez l\'engagement'
      ]
    })
  }

  // 5. CONSEIL RAPIDE GAINS si tout est moyen
  if (advice.length < 3 && totalViews > 10) {
    advice.push({
      priority: 5,
      icon: '⚡',
      category: 'GAINS RAPIDES',
      problem: 'Optimisation rapide',
      status: 'ACTION',
      statusColor: [59, 130, 246], // bleu
      description: 'Actions rapides pour de gros résultats:',
      solutions: [
        '1. Changez votre titre le + cliqué (test A/B 48h)',
        '2. Ajoutez 2 photos de qualité cette semaine',
        '3. Partagez votre profil 1x/jour pendant 7 jours',
        '4. Analysez vos stats chaque dimanche'
      ]
    })
  }

  // Trier par priorité et retourner les 3 meilleurs conseils
  return advice.sort((a, b) => a.priority - b.priority).slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        links: { where: { isActive: true }, orderBy: { position: 'asc' } },
        races: true,
        sponsors: true,
        media: true
      }
    })

    if (!profile) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 })
    }

    // Récupérer les paramètres de la requête
    const { days = 7 } = await request.json()
    
    // Calculer la date de début
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Récupérer les analytics pour la période
    const analytics = await prisma.analytics.findMany({
      where: {
        profileId: profile.id,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    })

    // Récupérer les clics sur les liens
    const linkClicks = await prisma.link.aggregate({
      where: { profileId: profile.id },
      _sum: { clicks: true }
    })

    // Calculer les totaux avec précision
    const totalViews = analytics.reduce((sum, day) => sum + (day.views || 0), 0)
    const totalUniqueViews = analytics.reduce((sum, day) => sum + (day.uniqueViews || 0), 0)
    const totalClicks = linkClicks._sum.clicks || 0
    const clickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100) : 0
    
    // Calculer la moyenne par jour
    const avgViewsPerDay = days > 0 ? Math.round(totalViews / days) : 0
    const avgUniquePerDay = days > 0 ? Math.round(totalUniqueViews / days) : 0

    // Calculer les métriques de performance
    const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0
    const engagementScore = Math.min(100, Math.round((conversionRate / 10) * 100))
    
    // Calculer le taux de croissance
    const midPoint = Math.floor(analytics.length / 2)
    const firstHalf = analytics.slice(0, midPoint)
    const secondHalf = analytics.slice(midPoint)
    const firstHalfAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, a) => sum + a.views, 0) / firstHalf.length 
      : 0
    const secondHalfAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, a) => sum + a.views, 0) / secondHalf.length 
      : 0
    const growthRate = firstHalfAvg > 0 
      ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) 
      : 0

    // Créer le PDF (format A4)
    const pdf = new jsPDF()
    
    // Configuration des couleurs (RGB)
    const colors = {
      primary: [31, 41, 55],      // gray-800
      secondary: [107, 114, 128], // gray-500
      accent: [239, 68, 68],      // red-500
      success: [16, 185, 129],    // emerald-500
      blue: [59, 130, 246],       // blue-500
      orange: [245, 158, 11]      // amber-500
    }

    // Fonction helper pour définir les couleurs
    const setColor = (color: number[]) => pdf.setTextColor(color[0], color[1], color[2])
    const setDrawColor = (color: number[]) => pdf.setDrawColor(color[0], color[1], color[2])
    const setFillColor = (color: number[]) => pdf.setFillColor(color[0], color[1], color[2])

    // === EN-TÊTE ===
    let yPos = 20
    
    // Logo/Titre
    pdf.setFontSize(20)
    setColor(colors.accent)
    pdf.text('ATHLINK', 20, yPos)
    
    // Date et période
    pdf.setFontSize(9)
    setColor(colors.secondary)
    const dateStr = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    pdf.text(dateStr, 190, yPos, { align: 'right' })
    
    yPos += 10
    
    // Titre du rapport
    pdf.setFontSize(16)
    setColor(colors.primary)
    pdf.text(`Rapport de Performance - ${profile.displayName}`, 20, yPos)
    
    yPos += 6
    pdf.setFontSize(8)
    setColor(colors.secondary)
    pdf.text(`@${profile.username} • Période: ${days} jour${days > 1 ? 's' : ''}`, 20, yPos)
    
    // Ligne de séparation
    yPos += 5
    setDrawColor(colors.accent)
    pdf.setLineWidth(0.5)
    pdf.line(20, yPos, 190, yPos)
    
    // === STATISTIQUES PRINCIPALES ===
    yPos += 10
    pdf.setFontSize(12)
    setColor(colors.primary)
    pdf.text('📊 VUE D\'ENSEMBLE', 20, yPos)
    
    yPos += 8
    
    // Grille de stats 2x3 avec design amélioré
    const stats = [
      { 
        label: 'VUES TOTALES', 
        value: totalViews.toString(), 
        sublabel: `${avgViewsPerDay}/jour en moyenne`,
        color: colors.blue 
      },
      { 
        label: 'VISITEURS UNIQUES', 
        value: totalUniqueViews.toString(), 
        sublabel: `${avgUniquePerDay}/jour en moyenne`,
        color: colors.success 
      },
      { 
        label: 'CLICS TOTAUX', 
        value: totalClicks.toString(), 
        sublabel: `${conversionRate.toFixed(1)}% taux de conversion`,
        color: colors.orange 
      },
      { 
        label: 'LIENS ACTIFS', 
        value: profile.links.length.toString(), 
        sublabel: `${(totalClicks / Math.max(profile.links.length, 1)).toFixed(0)} clics/lien`,
        color: colors.accent 
      },
      { 
        label: 'TAUX D\'ENGAGEMENT', 
        value: `${engagementScore}/100`, 
        sublabel: engagementScore > 50 ? 'Excellent' : engagementScore > 25 ? 'Moyen' : 'À améliorer',
        color: engagementScore > 50 ? colors.success : engagementScore > 25 ? colors.orange : colors.accent 
      },
      { 
        label: 'CROISSANCE', 
        value: `${growthRate > 0 ? '+' : ''}${growthRate}%`, 
        sublabel: growthRate > 10 ? 'Forte croissance' : growthRate > 0 ? 'En progression' : 'Stable',
        color: growthRate > 10 ? colors.success : growthRate > 0 ? colors.blue : colors.secondary 
      }
    ]

    stats.forEach((stat, index) => {
      const x = 20 + (index % 3) * 60
      const y = yPos + Math.floor(index / 3) * 22
      
      // Cadre coloré
      setFillColor(stat.color)
      pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2], 0.1)
      pdf.rect(x, y - 2, 55, 18, 'F')
      
      setDrawColor(stat.color)
      pdf.setLineWidth(0.3)
      pdf.rect(x, y - 2, 55, 18)
      
      // Label
      pdf.setFontSize(6)
      setColor(colors.secondary)
      pdf.text(stat.label, x + 2, y + 2)
      
      // Valeur
      pdf.setFontSize(14)
      setColor(stat.color)
      pdf.text(stat.value, x + 2, y + 9)
      
      // Sous-label
      pdf.setFontSize(6)
      setColor(colors.secondary)
      pdf.text(stat.sublabel, x + 2, y + 14)
    })

    yPos += 50

    // === PERFORMANCE GLOBALE ===
    pdf.setFontSize(12)
    setColor(colors.primary)
    pdf.text('📈 PERFORMANCE GLOBALE', 20, yPos)
    yPos += 8

    // Calcul du score global
    let globalScore = 0
    let scoreDetails = []

    // Score de trafic (40% du total)
    const trafficScore = Math.min(40, (avgViewsPerDay / 100) * 40)
    globalScore += trafficScore
    scoreDetails.push(`Trafic: ${trafficScore.toFixed(0)}/40`)

    // Score de conversion (30% du total)
    const conversionScore = Math.min(30, (conversionRate / 10) * 30)
    globalScore += conversionScore
    scoreDetails.push(`Conversion: ${conversionScore.toFixed(0)}/30`)

    // Score de contenu (20% du total)
    const totalContent = profile.links.length + profile.races.length + profile.sponsors.length + profile.media.length
    const contentScore = Math.min(20, (totalContent / 20) * 20)
    globalScore += contentScore
    scoreDetails.push(`Contenu: ${contentScore.toFixed(0)}/20`)

    // Score d'engagement (10% du total)
    const retentionRate = totalViews > 0 ? (totalUniqueViews / totalViews) * 100 : 0
    const engagementGlobalScore = Math.min(10, (retentionRate / 70) * 10)
    globalScore += engagementGlobalScore
    scoreDetails.push(`Fidélité: ${engagementGlobalScore.toFixed(0)}/10`)

    // Afficher le score global avec design impactant
    const scoreColor = globalScore >= 70 ? colors.success : globalScore >= 40 ? colors.orange : colors.accent
    const scoreStatus = globalScore >= 70 ? 'EXCELLENT' : globalScore >= 40 ? 'MOYEN' : 'À AMÉLIORER'

    // Cadre du score
    setFillColor(scoreColor)
    pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2], 0.1)
    pdf.rect(20, yPos, 170, 25, 'F')
    
    setDrawColor(scoreColor)
    pdf.setLineWidth(0.5)
    pdf.rect(20, yPos, 170, 25)

    // Score principal
    pdf.setFontSize(24)
    setColor(scoreColor)
    pdf.text(`${Math.round(globalScore)}/100`, 30, yPos + 10)

    // Status
    pdf.setFontSize(10)
    pdf.text(scoreStatus, 30, yPos + 17)

    // Détails du score
    pdf.setFontSize(7)
    setColor(colors.secondary)
    scoreDetails.forEach((detail, index) => {
      pdf.text(detail, 90 + (index % 2) * 40, yPos + 7 + Math.floor(index / 2) * 6)
    })

    yPos += 30

    // === CONSEILS D'OPTIMISATION PERSONNALISÉS ===
    pdf.setFontSize(12)
    setColor(colors.accent)
    pdf.text('💡 VOS CONSEILS PERSONNALISÉS', 20, yPos)
    yPos += 3
    
    pdf.setFontSize(7)
    setColor(colors.secondary)
    pdf.text('Basés sur l\'analyse de vos performances réelles', 20, yPos)
    yPos += 7

    // Générer les conseils intelligents
    const smartAdvice = generateSmartAdvice({
      totalViews,
      totalUniqueViews,
      totalClicks,
      avgViewsPerDay,
      days,
      linksCount: profile.links.length,
      racesCount: profile.races.length,
      sponsorsCount: profile.sponsors.length,
      mediaCount: profile.media.length
    })

    // Afficher les conseils avec design moderne
    smartAdvice.forEach((item, index) => {
      if (yPos > 240) return // Éviter les débordements

      // Cadre du conseil
      setFillColor(item.statusColor)
      pdf.setFillColor(item.statusColor[0], item.statusColor[1], item.statusColor[2], 0.05)
      pdf.rect(20, yPos, 170, 35, 'F')
      
      setDrawColor(item.statusColor)
      pdf.setLineWidth(0.3)
      pdf.rect(20, yPos, 170, 35)

      // En-tête du conseil
      pdf.setFontSize(9)
      setColor(item.statusColor)
      pdf.text(`${item.icon} ${item.category}`, 23, yPos + 5)

      // Status badge
      pdf.setFontSize(6)
      pdf.text(item.status, 160, yPos + 5)

      // Problème identifié
      pdf.setFontSize(7)
      setColor(colors.primary)
      pdf.text(`→ ${item.problem}`, 23, yPos + 10)

      // Description
      pdf.setFontSize(6)
      setColor(colors.secondary)
      pdf.text(item.description, 23, yPos + 15)

      // Solutions avec numérotation
      pdf.setFontSize(6)
      setColor(colors.primary)
      item.solutions.forEach((solution, solIndex) => {
        const lines = pdf.splitTextToSize(solution, 160)
        lines.forEach((line: string, lineIndex: number) => {
          pdf.text(lineIndex === 0 ? `${solIndex + 1}. ${line}` : `   ${line}`, 25, yPos + 20 + (solIndex * 4) + (lineIndex * 3))
        })
      })

      yPos += 38
    })

    // === PIED DE PAGE ===
    const footerY = 280
    
    // Ligne de séparation
    setDrawColor(colors.secondary)
    pdf.setLineWidth(0.3)
    pdf.line(20, footerY - 5, 190, footerY - 5)
    
    pdf.setFontSize(7)
    setColor(colors.secondary)
    pdf.text('Généré par Athlink • athlink.com', 20, footerY)
    pdf.text(`Rapport créé le ${new Date().toLocaleString('fr-FR')}`, 190, footerY, { align: 'right' })

    // Convertir en buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="athlink-performance-${profile.username}-${days}j-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return NextResponse.json({ error: "Erreur lors de la génération du PDF" }, { status: 500 })
  }
}
