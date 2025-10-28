import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-admin";
import { z } from "zod";

const createAmbassadorSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  commissionRate: z.number().min(0).max(100).default(20),
  commissionType: z.enum(["recurring", "one-time", "lifetime"]).default("recurring"),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;

    const ambassadors = await prisma.ambassador.findMany({
      where: status ? { status } : undefined,
      include: {
        promoCodes: {
          select: {
            id: true,
            code: true,
            isActive: true,
            currentUses: true,
            maxUses: true,
          },
        },
        _count: {
          select: {
            promoCodes: true,
            usages: true,
            commissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(ambassadors);
  } catch (error: any) {
    console.error("Error fetching ambassadors:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération des ambassadeurs" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = createAmbassadorSchema.parse(body);

    const existingAmbassador = await prisma.ambassador.findUnique({
      where: { email: validated.email },
    });

    if (existingAmbassador) {
      return NextResponse.json(
        { error: "Un ambassadeur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    const ambassador = await prisma.ambassador.create({
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        commissionRate: validated.commissionRate,
        commissionType: validated.commissionType,
        notes: validated.notes,
      },
      include: {
        promoCodes: true,
      },
    });

    return NextResponse.json(ambassador, { status: 201 });
  } catch (error: any) {
    console.error("Error creating ambassador:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de l'ambassadeur" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
