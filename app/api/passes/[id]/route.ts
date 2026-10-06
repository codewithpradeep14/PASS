import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const pass = await prisma.pass.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          include: {
            receipts: true,
            aiAnalyses: true,
          },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!pass) {
      return NextResponse.json(
        { success: false, error: "PASS record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, pass });
  } catch (error: any) {
    console.error("API GET /api/passes/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch PASS detail." },
      { status: 500 }
    );
  }
}
