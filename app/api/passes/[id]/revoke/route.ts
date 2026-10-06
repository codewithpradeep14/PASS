import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { ownerWallet, txSignature } = body;

    const pass = await prisma.pass.findUnique({
      where: { id },
    });

    if (!pass) {
      return NextResponse.json(
        { success: false, error: "PASS record not found." },
        { status: 404 }
      );
    }

    if (ownerWallet && pass.ownerWallet.toLowerCase() !== ownerWallet.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Only the creator can revoke this PASS." },
        { status: 403 }
      );
    }

    const updated = await prisma.pass.update({
      where: { id },
      data: { status: "REVOKED" },
    });

    await prisma.auditLog.create({
      data: {
        actor: ownerWallet || pass.ownerWallet,
        action: "REVOKE_PASS",
        passId: pass.id,
        metadata: JSON.stringify({
          refundedRemaining: pass.remaining,
          txSignature: txSignature || null,
        }),
      },
    });

    return NextResponse.json({ success: true, pass: updated });
  } catch (error: any) {
    console.error("API POST /api/passes/[id]/revoke error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revoke PASS." },
      { status: 500 }
    );
  }
}
