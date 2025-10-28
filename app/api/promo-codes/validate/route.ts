import { NextRequest, NextResponse } from "next/server"
import { PROMO_CODES } from "@/lib/promo-codes"

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false },
        { status: 400 }
      )
    }

    const upperCode = code.toUpperCase().trim()
    const promo = PROMO_CODES[upperCode as keyof typeof PROMO_CODES]

    if (!promo) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({
      valid: true,
      code: upperCode,
      type: promo.type,
      plan: promo.plan,
      duration: promo.duration,
      description: promo.description
    })

  } catch (error: any) {
    console.error("POST /api/promo-codes/validate error:", error)
    return NextResponse.json(
      { valid: false },
      { status: 500 }
    )
  }
}
