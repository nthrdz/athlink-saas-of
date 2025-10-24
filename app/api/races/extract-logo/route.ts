import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import * as cheerio from "cheerio"

interface LogoResult {
  logoUrl: string | null
  method: "scraping" | "opengraph" | "favicon" | "clearbit" | "google" | "none"
  confidence: "high" | "medium" | "low"
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 })
    }

    const normalizedUrl = normalizeUrl(url)
    console.log(`🔍 Extraction du logo pour: ${normalizedUrl}`)

    // 0️⃣ PRIORITÉ 0: Clearbit API (rapide et fiable)
    const clearbitLogo = getClearbitLogo(normalizedUrl)
    if (await isImageValid(clearbitLogo)) {
      console.log(`✅ Logo trouvé via Clearbit: ${clearbitLogo}`)
      return NextResponse.json({
        success: true,
        logoUrl: clearbitLogo,
        method: "clearbit",
        message: "Logo trouvé via Clearbit API"
      })
    }

    // 1️⃣ PRIORITÉ 1: Scraping intelligent du site
    const scrapedLogo = await scrapeLogo(normalizedUrl)
    if (scrapedLogo.logoUrl) {
      console.log(`✅ Logo trouvé via scraping: ${scrapedLogo.logoUrl}`)
      return NextResponse.json({
        success: true,
        logoUrl: scrapedLogo.logoUrl,
        method: scrapedLogo.method,
        message: "Logo trouvé via scraping du site"
      })
    }

    // 2️⃣ PRIORITÉ 2: Open Graph meta tags
    const ogLogo = await extractOpenGraph(normalizedUrl)
    if (ogLogo.logoUrl) {
      console.log(`✅ Logo trouvé via Open Graph: ${ogLogo.logoUrl}`)
      return NextResponse.json({
        success: true,
        logoUrl: ogLogo.logoUrl,
        method: "opengraph",
        message: "Logo trouvé via Open Graph"
      })
    }

    // 3️⃣ PRIORITÉ 3: Google Favicon API
    const googleLogo = await getGoogleFavicon(normalizedUrl)
    if (googleLogo.logoUrl) {
      console.log(`✅ Logo trouvé via Google: ${googleLogo.logoUrl}`)
      return NextResponse.json({
        success: true,
        logoUrl: googleLogo.logoUrl,
        method: "google",
        message: "Logo trouvé via Google Favicon API"
      })
    }

    // 4️⃣ PRIORITÉ 4: Favicon (dernière option)
    const faviconLogo = await extractFavicon(normalizedUrl)
    if (faviconLogo.logoUrl) {
      console.log(`✅ Favicon trouvé: ${faviconLogo.logoUrl}`)
      return NextResponse.json({
        success: true,
        logoUrl: faviconLogo.logoUrl,
        method: "favicon",
        message: "Favicon trouvé"
      })
    }

    // ❌ Aucun logo trouvé
    console.log(`❌ Aucun logo trouvé pour ${normalizedUrl}`)
    return NextResponse.json({
      success: false,
      message: "Aucun logo trouvé pour cette URL",
      logoUrl: null
    })

  } catch (error: any) {
    console.error("Erreur extraction logo événement:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'extraction du logo", details: (error as Error).message },
      { status: 500 }
    )
  }
}

// 🌐 UTILITAIRES
function normalizeUrl(url: string): string {
  url = url.trim()
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  
  try {
    const urlObj = new URL(url)
    return urlObj.href
  } catch {
    return 'https://' + url
  }
}

function makeAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
  try {
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl
    }
    
    if (relativeUrl.startsWith('//')) {
      return 'https:' + relativeUrl
    }
    
    if (relativeUrl.startsWith('data:')) {
      return relativeUrl
    }
    
    const base = new URL(baseUrl)
    
    if (relativeUrl.startsWith('/')) {
      return base.origin + relativeUrl
    }
    
    return new URL(relativeUrl, baseUrl).href
    
  } catch (error) {
    return relativeUrl
  }
}

async function isImageValid(url: string): Promise<boolean> {
  if (!url) return false
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    })
    
    if (!response.ok) return false
    
    const contentType = response.headers.get('content-type')
    return contentType?.startsWith('image/') || false
    
  } catch {
    return false
  }
}

// 🎯 CLEARBIT API
function getClearbitLogo(url: string): string {
  try {
    const urlObj = new URL(url)
    return `https://logo.clearbit.com/${urlObj.hostname}`
  } catch {
    return `https://logo.clearbit.com/${url.replace(/^https?:\/\//, '')}`
  }
}

// 🔍 SCRAPING INTELLIGENT DU SITE
async function scrapeLogo(url: string): Promise<LogoResult> {
  try {
    console.log(`📄 Chargement de la page: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.log(`⚠️ Response status: ${response.status}`)
      return { logoUrl: null, method: "scraping", confidence: "low" }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    console.log(`📊 Page chargée, taille: ${html.length} caractères`)

    // Liste étendue de sélecteurs CSS pour trouver le logo
    const logoSelectors = [
      // Sélecteurs directs par classe
      'img.logo',
      'img.site-logo',
      'img.header-logo',
      'img.navbar-logo',
      'img.brand-logo',
      'img.event-logo',
      'img.main-logo',
      'img[class*="logo"]',
      'img[class*="Logo"]',
      'img[class*="brand"]',
      'img[class*="Brand"]',
      
      // Sélecteurs de conteneurs
      '.logo img',
      '.site-logo img',
      '.header-logo img',
      '.navbar-brand img',
      '.brand img',
      'header .logo img',
      'header .brand img',
      'nav .logo img',
      'nav .brand img',
      '.header img.logo',
      '.navigation img',
      
      // Sélecteurs par ID
      '#logo',
      '#site-logo',
      '#brand-logo',
      '#logo img',
      '#header-logo img',
      
      // Par attribut alt
      'img[alt*="logo" i]',
      'img[alt*="Logo" i]',
      'img[alt*="brand" i]',
      'img[alt*="Brand" i]',
      
      // Éléments SVG
      'svg.logo',
      '.logo svg',
      'header svg',
    ]

    console.log(`🔍 Test de ${logoSelectors.length} sélecteurs...`)

    for (const selector of logoSelectors) {
      const elements = $(selector)
      
      if (elements.length > 0) {
        console.log(`✓ Trouvé ${elements.length} élément(s) avec: ${selector}`)
        
        const element = elements.first()
        let logoUrl: string | null = null

        // Pour les images
        if (element.is('img')) {
          logoUrl = element.attr('src') || 
                    element.attr('data-src') || 
                    element.attr('data-lazy-src') ||
                    element.attr('data-original') ||
                    null
        }
        
        // Pour les SVG
        if (element.is('svg')) {
          const svgContent = $.html(element)
          if (svgContent) {
            logoUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`
          }
        }

        if (logoUrl) {
          logoUrl = makeAbsoluteUrl(logoUrl, url)
          
          // Pour les SVG inline, on les accepte directement
          if (logoUrl.startsWith('data:image/svg')) {
            console.log(`✅ Logo SVG trouvé`)
            return {
              logoUrl,
              method: "scraping",
              confidence: "high"
            }
          }
          
          if (await isImageValid(logoUrl)) {
            console.log(`✅ Logo valide trouvé: ${logoUrl}`)
            return {
              logoUrl,
              method: "scraping",
              confidence: "high"
            }
          }
        }
      }
    }

    // Recherche dans header/nav en dernier recours
    const headerImages = $('header img, nav img').toArray()
    for (const img of headerImages.slice(0, 5)) {
      const $img = $(img)
      let logoUrl = $img.attr('src') || $img.attr('data-src')
      
      if (logoUrl) {
        logoUrl = makeAbsoluteUrl(logoUrl, url)
        if (await isImageValid(logoUrl)) {
          console.log(`✅ Logo trouvé dans header/nav: ${logoUrl}`)
          return {
            logoUrl,
            method: "scraping",
            confidence: "medium"
          }
        }
      }
    }

    return { logoUrl: null, method: "scraping", confidence: "low" }

  } catch (error: any) {
    console.error(`❌ Erreur scraping:`, error.message)
    return { logoUrl: null, method: "scraping", confidence: "low" }
  }
}

// 🏷️ OPEN GRAPH META TAGS
async function extractOpenGraph(url: string): Promise<LogoResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      return { logoUrl: null, method: "opengraph", confidence: "low" }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const ogImage = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[property="twitter:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[itemprop="image"]').attr('content')

    if (ogImage) {
      const absoluteUrl = makeAbsoluteUrl(ogImage, url)
      
      if (await isImageValid(absoluteUrl)) {
        return {
          logoUrl: absoluteUrl,
          method: "opengraph",
          confidence: "medium"
        }
      }
    }

    return { logoUrl: null, method: "opengraph", confidence: "low" }

  } catch (error: any) {
    return { logoUrl: null, method: "opengraph", confidence: "low" }
  }
}

// 🌐 GOOGLE FAVICON API
async function getGoogleFavicon(url: string): Promise<LogoResult> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    
    // Google Favicon API avec différentes tailles
    const sizes = [128, 64, 32]
    
    for (const size of sizes) {
      const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
      
      if (await isImageValid(googleUrl)) {
        console.log(`✅ Google Favicon trouvé (${size}px): ${googleUrl}`)
        return {
          logoUrl: googleUrl,
          method: "google",
          confidence: size >= 64 ? "medium" : "low"
        }
      }
    }

    return { logoUrl: null, method: "google", confidence: "low" }

  } catch (error: any) {
    return { logoUrl: null, method: "google", confidence: "low" }
  }
}

// 🎨 FAVICON
async function extractFavicon(url: string): Promise<LogoResult> {
  try {
    const domain = new URL(url).origin
    
    const faviconUrls = [
      `${domain}/favicon.svg`,
      `${domain}/favicon.png`,
      `${domain}/apple-touch-icon.png`,
      `${domain}/favicon-192x192.png`,
      `${domain}/favicon-96x96.png`,
      `${domain}/favicon.ico`,
    ]

    for (const faviconUrl of faviconUrls) {
      if (await isImageValid(faviconUrl)) {
        return {
          logoUrl: faviconUrl,
          method: "favicon",
          confidence: "low"
        }
      }
    }

    return { logoUrl: null, method: "favicon", confidence: "low" }

  } catch (error: any) {
    return { logoUrl: null, method: "favicon", confidence: "low" }
  }
}
