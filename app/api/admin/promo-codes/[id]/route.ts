import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-admin";
import { z } from "zod";

const updatePromoCodeSchema = z.object({
  code: z.string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/)
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z.string().optional().nullable(),
  discountType: z.enum(["percentage", "fixed_amount"]).optional(),
  discountValue: z.number().positive().optional(),
  applicablePlans: z.array(z.enum(["FREE", "PRO", "ELITE"])).optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  maxUsesPerUser: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        ambassador: true,
        usages: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: {
            usedAt: "desc",
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Code promo non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(promoCode);
  } catch (error: any) {
    console.error("Error fetching promo code:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération du code promo" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validated = updatePromoCodeSchema.parse(body);

    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existingPromoCode) {
      return NextResponse.json(
        { error: "Code promo non trouvé" },
        { status: 404 }
      );
    }

    if (validated.code && validated.code !== existingPromoCode.code) {
      const codeExists = await prisma.promoCode.findUnique({
        where: { code: validated.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Ce code promo existe déjà" },
          { status: 400 }
        );
      }
    }

    if (validated.discountType === "percentage" && validated.discountValue && validated.discountValue > 100) {
      return NextResponse.json(
        { error: "Le pourcentage de réduction ne peut pas dépasser 100%" },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        ...validated,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : undefined,
      },
      include: {
        ambassador: true,
        _count: {
          select: {
            usages: true,
          },
        },
      },
    });

    return NextResponse.json(promoCode);
  } catch (error: any) {
    console.error("Error updating promo code:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour du code promo" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usages: true,
          },
        },
      },
    });

    if (!existingPromoCode) {
      return NextResponse.json(
        { error: "Code promo non trouvé" },
        { status: 404 }
      );
    }

    if (existingPromoCode._count.usages > 0) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer ce code promo car il a déjà été utilisé. Vous pouvez le désactiver à la place.",
        },
        { status: 400 }
      );
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Code promo supprimé avec succès" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la suppression du code promo" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
