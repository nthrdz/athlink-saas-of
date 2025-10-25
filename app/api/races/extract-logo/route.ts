import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

interface LogoResult {
  logoUrl: string | null
  method: "scraping" | "opengraph" | "favicon" | "clearbit" | "google" | "none"
  confidence: "high" | "medium" | "low"
  brandName?: string
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    const { websiteUrl, brandName } = await req.json()

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "URL du site web requise" },
        { status: 400 }
      )
    }

    // Normaliser l'URL
    const normalizedUrl = normalizeUrl(websiteUrl)
    console.log(`🔍 Extraction du logo pour: ${normalizedUrl}`)

    // 0️⃣ PRIORITÉ 0: Clearbit API (rapide et fiable)
    const clearbitLogo = getClearbitLogo(normalizedUrl)
    if (await isImageValid(clearbitLogo)) {
      console.log(`✅ Logo trouvé via Clearbit: ${clearbitLogo}`)
      return NextResponse.json({
        logoUrl: clearbitLogo,
        method: "clearbit",
        confidence: "high"
      })
    }

    // 1️⃣ PRIORITÉ 1: Scraping intelligent du site
    const scrapedLogo = await scrapeLogo(normalizedUrl, brandName)
    if (scrapedLogo.logoUrl) {
      console.log(`✅ Logo trouvé via scraping: ${scrapedLogo.logoUrl}`)
      return NextResponse.json(scrapedLogo)
    }

    // 2️⃣ PRIORITÉ 2: Open Graph meta tags
    const ogLogo = await extractOpenGraph(normalizedUrl)
    if (ogLogo.logoUrl) {
      console.log(`✅ Logo trouvé via Open Graph: ${ogLogo.logoUrl}`)
      return NextResponse.json(ogLogo)
    }

    // 3️⃣ PRIORITÉ 3: Google Favicon API
    const googleLogo = await getGoogleFavicon(normalizedUrl)
    if (googleLogo.logoUrl) {
      console.log(`✅ Logo trouvé via Google: ${googleLogo.logoUrl}`)
      return NextResponse.json(googleLogo)
    }

    // 4️⃣ PRIORITÉ 4: Favicon (dernière option)
    const faviconLogo = await extractFavicon(normalizedUrl)
    if (faviconLogo.logoUrl) {
      console.log(`✅ Favicon trouvé: ${faviconLogo.logoUrl}`)
      return NextResponse.json(faviconLogo)
    }

    // ❌ Aucun logo trouvé
    console.log(`❌ Aucun logo trouvé pour ${normalizedUrl}`)
    return NextResponse.json({
      logoUrl: null,
      method: "none",
      confidence: "low",
      message: "Aucun logo trouvé. Upload manuel recommandé."
    })

  } catch (error: any) {
    console.error("❌ Erreur extraction:", error.message)
    return NextResponse.json(
      { 
        error: "Erreur lors de l'extraction", 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// ==========================================
// 🎯 CLEARBIT API
// ==========================================
function getClearbitLogo(url: string): string {
  try {
    const urlObj = new URL(url)
    return `https://logo.clearbit.com/${urlObj.hostname}`
  } catch {
    return ""
  }
}

// ==========================================
// 🎯 SCRAPING INTELLIGENT DU SITE
// ==========================================
async function scrapeLogo(url: string, brandName?: string): Promise<LogoResult> {
  try {
    console.log(`📄 Chargement de la page: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.log(`⚠️ Response status: ${response.status}`)
      return { logoUrl: null, method: "scraping", confidence: "low" }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    console.log(`📊 Page chargée, taille: ${html.length} caractères`)

    const logoSelectors = [
      'img.logo',
      'img.site-logo',
      'img.header-logo',
      'img.navbar-logo',
      'img.brand-logo',
      'img.event-logo',
      'img.race-logo',
      'img.competition-logo',
      'img[class*="logo"]',
      'img[class*="Logo"]',
      'img[class*="brand"]',
      'img[class*="Brand"]',
      'img[class*="event"]',
      'img[class*="Event"]',
      '.logo img',
      '.site-logo img',
      '.header-logo img',
      '.navbar-brand img',
      '.event-logo img',
      '.race-logo img',
      'header .logo img',
      'nav .logo img',
      'header img[alt*="logo" i]',
      'nav img[alt*="logo" i]',
      '#logo',
      '#site-logo',
      '#event-logo',
      '#logo img',
      'img[alt*="logo" i]',
      'img[alt*="Logo" i]',
      'img[alt*="event" i]',
      'img[alt*="race" i]',
      'svg.logo',
      'svg[class*="logo"]',
      ...(brandName ? [
        `img[alt*="${brandName}" i]`,
        `img[title*="${brandName}" i]`,
        `img[src*="${brandName.toLowerCase().replace(/\s+/g, '-')}" i]`,
        `img[src*="${brandName.toLowerCase().replace(/\s+/g, '_')}" i]`,
      ] : []),
    ]

    console.log(`🔍 Test de ${logoSelectors.length} sélecteurs...`)

    for (const selector of logoSelectors) {
      const elements = $(selector)
      
      if (elements.length > 0) {
        console.log(`✓ Trouvé ${elements.length} élément(s) avec: ${selector}`)
        
        const element = elements.first()
        let logoUrl: string | null = null

        if (element.is('img')) {
          logoUrl = element.attr('src') || 
                    element.attr('data-src') || 
                    element.attr('data-lazy-src') || 
                    null
        }

        if (logoUrl) {
          logoUrl = makeAbsoluteUrl(logoUrl, url)
          
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

    // Recherche dans header/nav
    const headerImages = $('header img, nav img, [role="banner"] img').toArray()
    console.log(`📸 ${headerImages.length} images trouvées dans header/nav`)

    for (const img of headerImages.slice(0, 5)) {
      const src = $(img).attr('src') || 
                  $(img).attr('data-src') || 
                  $(img).attr('data-lazy-src') ||
                  $(img).attr('data-original')
      
      if (src) {
        const absoluteUrl = makeAbsoluteUrl(src, url)
        const alt = $(img).attr('alt') || ''
        const className = $(img).attr('class') || ''
        
        if (alt.toLowerCase().includes('logo') || 
            className.toLowerCase().includes('logo') ||
            alt.toLowerCase().includes('event') ||
            className.toLowerCase().includes('event')) {
          
          if (await isImageValid(absoluteUrl)) {
            console.log(`✅ Logo trouvé dans header: ${absoluteUrl}`)
            return {
              logoUrl: absoluteUrl,
              method: "scraping",
              confidence: "high"
            }
          }
        } else if (await isImageValid(absoluteUrl)) {
          console.log(`✅ Image trouvée dans header: ${absoluteUrl}`)
          return {
            logoUrl: absoluteUrl,
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

// ==========================================
// 🏷️ OPEN GRAPH META TAGS
// ==========================================
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
      $('meta[property="twitter:image"]').attr('content') ||
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

// ==========================================
// 🌐 GOOGLE FAVICON API
// ==========================================
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

// ==========================================
// 🎨 FAVICON
// ==========================================
async function extractFavicon(url: string): Promise<LogoResult> {
  try {
    const domain = new URL(url).origin
    
    const faviconUrls = [
      `${domain}/favicon.svg`,
      `${domain}/favicon.png`,
      `${domain}/apple-touch-icon.png`,
      `${domain}/favicon-192x192.png`,
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

// ==========================================
// 🛠️ UTILITAIRES
// ==========================================

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
  try {
    if (url.startsWith('data:')) {
      return false
    }

    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(8000)
    })
    
    if (!response.ok) {
      return false
    }

    const contentType = response.headers.get('content-type') || ''
    const isImage = contentType.startsWith('image/') || 
                    contentType.includes('octet-stream')
    
    if (isImage) {
      console.log(`✅ Image valide: ${url} (${contentType})`)
    } else {
      console.log(`⚠️ Pas une image: ${url} (${contentType})`)
    }
    
    return isImage

  } catch (error: any) {
    console.log(`⚠️ Erreur validation: ${url} - ${error.message}`)
    return false
  }
}
