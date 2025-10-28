import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const validatePromoCodeSchema = z.object({
  code: z.string().transform((val) => val.toUpperCase()),
  planType: z.enum(["FREE", "PRO", "ELITE"]),
  userId: z.string().cuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, planType, userId } = validatePromoCodeSchema.parse(body);

    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
      include: {
        ambassador: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!promoCode) {
      return NextResponse.json(
        { valid: false, error: "Code promo invalide" },
        { status: 400 }
      );
    }

    if (!promoCode.isActive) {
      return NextResponse.json(
        { valid: false, error: "Ce code promo n'est plus actif" },
        { status: 400 }
      );
    }

    if (promoCode.ambassador.status !== "active") {
      return NextResponse.json(
        { valid: false, error: "Ce code promo n'est plus disponible" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (promoCode.startsAt && promoCode.startsAt > now) {
      return NextResponse.json(
        { valid: false, error: "Ce code promo n'est pas encore valide" },
        { status: 400 }
      );
    }

    if (promoCode.expiresAt && promoCode.expiresAt < now) {
      return NextResponse.json(
        { valid: false, error: "Ce code promo a expiré" },
        { status: 400 }
      );
    }

    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { valid: false, error: "Ce code promo a atteint sa limite d'utilisation" },
        { status: 400 }
      );
    }

    if (promoCode.applicablePlans.length > 0 && !promoCode.applicablePlans.includes(planType)) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Ce code promo n'est valide que pour les plans : ${promoCode.applicablePlans.join(", ")}` 
        },
        { status: 400 }
      );
    }

    if (userId) {
      const userUsageCount = await prisma.promoCodeUsage.count({
        where: {
          promoCodeId: promoCode.id,
          userId,
        },
      });

      if (userUsageCount >= promoCode.maxUsesPerUser) {
        return NextResponse.json(
          { valid: false, error: "Vous avez déjà utilisé ce code promo le nombre maximum de fois" },
          { status: 400 }
        );
      }
    }

    const plans = {
      PRO: { monthly: 9.90, yearly: 99 },
      ELITE: { monthly: 25.90, yearly: 259 },
    };

    let discount = {
      type: promoCode.discountType,
      value: promoCode.discountValue,
      promoCodeId: promoCode.id,
      ambassadorId: promoCode.ambassadorId,
    };

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        ambassadorName: promoCode.ambassador.name,
      },
      discount,
    });
  } catch (error: any) {
    console.error("Error validating promo code:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: false, error: error.message || "Erreur lors de la validation du code promo" },
      { status: 500 }
    );
  }
}
