import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const passId = searchParams.get("passId");

    const where: any = {};
    if (passId) where.passId = passId;

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        pass: true,
        merchant: true,
        receipts: true,
      },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    console.error("API GET /api/history error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch payment history." },
      { status: 500 }
    );
  }
}
