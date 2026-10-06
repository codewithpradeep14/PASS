import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { evaluatePayment } from "@/lib/policy/policyEngine";
import { PassCategory } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passId, merchantWallet, merchantCategory, amount, recipient } = body;

    if (!passId || !amount || !merchantCategory || !recipient) {
      return NextResponse.json(
        { allowed: false, reasons: ["Missing required parameters for payment evaluation."] },
        { status: 400 }
      );
    }

    const pass = await prisma.pass.findUnique({
      where: { id: passId },
    });

    if (!pass) {
      return NextResponse.json(
        { allowed: false, reasons: ["PASS not found in system record."] },
        { status: 404 }
      );
    }

    const evaluation = evaluatePayment(
      {
        id: pass.id,
        ownerWallet: pass.ownerWallet,
        recipientWallet: pass.recipientWallet,
        amount: pass.amount,
        spent: pass.spent,
        remaining: pass.remaining,
        category: pass.category as PassCategory,
        maxPerTransaction: pass.maxPerTransaction,
        expiresAt: pass.expiresAt,
        status: pass.status as any,
      },
      {
        passId: pass.id,
        recipientWallet: recipient,
        merchantWallet,
        merchantCategory: merchantCategory as PassCategory,
        amount: Number(amount),
      }
    );

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error("API /api/payment/check error:", error);
    return NextResponse.json(
      { allowed: false, reasons: [error.message || "Failed to evaluate policy."] },
      { status: 500 }
    );
  }
}
