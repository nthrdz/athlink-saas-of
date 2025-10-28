import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-admin";
import { z } from "zod";

const createPromoCodeSchema = z.object({
  ambassadorId: z.string().cuid(),
  code: z.string()
    .min(3, "Le code doit contenir au moins 3 caractères")
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Le code ne peut contenir que des lettres majuscules, chiffres, tirets et underscores")
    .transform((val) => val.toUpperCase()),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.number().positive(),
  applicablePlans: z.array(z.enum(["FREE", "PRO", "ELITE"])).default([]),
  maxUses: z.number().int().positive().optional().nullable(),
  maxUsesPerUser: z.number().int().positive().default(1),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const ambassadorId = searchParams.get("ambassadorId");
    const isActive = searchParams.get("isActive");

    const promoCodes = await prisma.promoCode.findMany({
      where: {
        ...(ambassadorId && { ambassadorId }),
        ...(isActive !== null && { isActive: isActive === "true" }),
      },
      include: {
        ambassador: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(promoCodes);
  } catch (error: any) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération des codes promo" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = createPromoCodeSchema.parse(body);

    const ambassador = await prisma.ambassador.findUnique({
      where: { id: validated.ambassadorId },
    });

    if (!ambassador) {
      return NextResponse.json(
        { error: "Ambassadeur non trouvé" },
        { status: 404 }
      );
    }

    const existingCode = await prisma.promoCode.findUnique({
      where: { code: validated.code },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "Ce code promo existe déjà" },
        { status: 400 }
      );
    }

    if (validated.discountType === "percentage" && validated.discountValue > 100) {
      return NextResponse.json(
        { error: "Le pourcentage de réduction ne peut pas dépasser 100%" },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        ambassadorId: validated.ambassadorId,
        code: validated.code,
        description: validated.description,
        discountType: validated.discountType,
        discountValue: validated.discountValue,
        applicablePlans: validated.applicablePlans,
        maxUses: validated.maxUses,
        maxUsesPerUser: validated.maxUsesPerUser,
        startsAt: validated.startsAt ? new Date(validated.startsAt) : undefined,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
        isActive: validated.isActive,
      },
      include: {
        ambassador: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error: any) {
    console.error("Error creating promo code:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de la création du code promo" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
