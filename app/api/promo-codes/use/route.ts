import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const usePromoCodeSchema = z.object({
  promoCodeId: z.string().cuid(),
  userId: z.string().cuid(),
  planType: z.enum(["PRO", "ELITE"]),
  billingCycle: z.enum(["monthly", "yearly"]),
  originalAmount: z.number().positive(),
  discountAmount: z.number().positive(),
  finalAmount: z.number().positive(),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = usePromoCodeSchema.parse(body);

    const promoCode = await prisma.promoCode.findUnique({
      where: { id: validated.promoCodeId },
      include: {
        ambassador: true,
      },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Code promo non trouvé" },
        { status: 404 }
      );
    }

    const usage = await prisma.promoCodeUsage.create({
      data: {
        promoCodeId: validated.promoCodeId,
        ambassadorId: promoCode.ambassadorId,
        userId: validated.userId,
        planType: validated.planType,
        billingCycle: validated.billingCycle,
        originalAmount: validated.originalAmount,
        discountAmount: validated.discountAmount,
        finalAmount: validated.finalAmount,
        stripeCustomerId: validated.stripeCustomerId,
        stripeSubscriptionId: validated.stripeSubscriptionId,
        ipAddress: validated.ipAddress,
        userAgent: validated.userAgent,
      },
    });

    await prisma.promoCode.update({
      where: { id: validated.promoCodeId },
      data: {
        currentUses: {
          increment: 1,
        },
        totalRevenue: {
          increment: validated.finalAmount,
        },
      },
    });

    const commissionAmount = validated.finalAmount * (promoCode.ambassador.commissionRate / 100);

    const commission = await prisma.commission.create({
      data: {
        ambassadorId: promoCode.ambassadorId,
        userId: validated.userId,
        type: "signup",
        amount: commissionAmount,
        rate: promoCode.ambassador.commissionRate,
        planType: validated.planType,
        revenue: validated.finalAmount,
        status: "pending",
        period: new Date().toISOString().slice(0, 7),
      },
    });

    await prisma.ambassador.update({
      where: { id: promoCode.ambassadorId },
      data: {
        totalReferrals: {
          increment: 1,
        },
        totalRevenue: {
          increment: validated.finalAmount,
        },
        totalCommission: {
          increment: commissionAmount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      usage,
      commission,
    });
  } catch (error: any) {
    console.error("Error recording promo code usage:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de l'enregistrement de l'utilisation du code promo" },
      { status: 500 }
    );
  }
}
