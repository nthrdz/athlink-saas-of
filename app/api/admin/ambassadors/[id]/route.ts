import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-admin";
import { z } from "zod";

const updateAmbassadorSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  commissionType: z.enum(["recurring", "one-time", "lifetime"]).optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const ambassador = await prisma.ambassador.findUnique({
      where: { id },
      include: {
        promoCodes: {
          include: {
            _count: {
              select: {
                usages: true,
              },
            },
          },
        },
        usages: {
          include: {
            promoCode: {
              select: {
                code: true,
              },
            },
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
          orderBy: {
            usedAt: "desc",
          },
        },
        commissions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        },
        _count: {
          select: {
            promoCodes: true,
            usages: true,
            commissions: true,
          },
        },
      },
    });

    if (!ambassador) {
      return NextResponse.json(
        { error: "Ambassadeur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(ambassador);
  } catch (error: any) {
    console.error("Error fetching ambassador:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération de l'ambassadeur" },
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
    const validated = updateAmbassadorSchema.parse(body);

    const existingAmbassador = await prisma.ambassador.findUnique({
      where: { id },
    });

    if (!existingAmbassador) {
      return NextResponse.json(
        { error: "Ambassadeur non trouvé" },
        { status: 404 }
      );
    }

    if (validated.email && validated.email !== existingAmbassador.email) {
      const emailExists = await prisma.ambassador.findUnique({
        where: { email: validated.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé par un autre ambassadeur" },
          { status: 400 }
        );
      }
    }

    const ambassador = await prisma.ambassador.update({
      where: { id },
      data: validated,
      include: {
        promoCodes: true,
        _count: {
          select: {
            promoCodes: true,
            usages: true,
            commissions: true,
          },
        },
      },
    });

    return NextResponse.json(ambassador);
  } catch (error: any) {
    console.error("Error updating ambassador:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour de l'ambassadeur" },
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

    const existingAmbassador = await prisma.ambassador.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usages: true,
            commissions: true,
          },
        },
      },
    });

    if (!existingAmbassador) {
      return NextResponse.json(
        { error: "Ambassadeur non trouvé" },
        { status: 404 }
      );
    }

    if (existingAmbassador._count.usages > 0 || existingAmbassador._count.commissions > 0) {
      return NextResponse.json(
        { 
          error: "Impossible de supprimer cet ambassadeur car il a déjà des conversions ou commissions. Vous pouvez le désactiver à la place.",
        },
        { status: 400 }
      );
    }

    await prisma.ambassador.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Ambassadeur supprimé avec succès" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting ambassador:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la suppression de l'ambassadeur" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
