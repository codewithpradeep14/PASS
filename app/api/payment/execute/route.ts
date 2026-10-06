import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { evaluatePayment } from "@/lib/policy/policyEngine";
import { analyzeReceipt } from "@/lib/ai/receiptAnalyzer";
import { PassCategory } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      passId,
      merchantId,
      merchantName,
      merchantWallet,
      merchantCategory,
      amount,
      recipient,
      description,
      txSignature,
      receiptItems,
    } = body;

    if (!passId || !amount || !merchantCategory || !recipient) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters for payment execution." },
        { status: 400 }
      );
    }

    const pass = await prisma.pass.findUnique({
      where: { id: passId },
    });

    if (!pass) {
      return NextResponse.json(
        { success: false, error: "PASS record not found." },
        { status: 404 }
      );
    }

    // 1. Policy evaluation (server-side strict enforcement)
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

    // If blocked by policy
    if (!evaluation.allowed) {
      // Record blocked attempt in DB for audit trail & analytics
      const blockedPayment = await prisma.payment.create({
        data: {
          passId: pass.id,
          amount: Number(amount),
          category: merchantCategory,
          description: description || `Attempted purchase at ${merchantName || "merchant"}`,
          status: "BLOCKED",
          blockReason: evaluation.reasons.join("; "),
          txSignature: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          actor: recipient,
          action: "PAYMENT_BLOCKED",
          passId: pass.id,
          metadata: JSON.stringify({
            amount,
            category: merchantCategory,
            reasons: evaluation.reasons,
          }),
        },
      });

      return NextResponse.json({
        success: false,
        blocked: true,
        reasons: evaluation.reasons,
        payment: blockedPayment,
      });
    }

    // 2. Successful Payment: Update PASS balance and record payment
    const numAmount = Number(amount);
    const newSpent = pass.spent + numAmount;
    const newRemaining = Math.max(0, pass.remaining - numAmount);
    const newStatus = newRemaining === 0 ? "DEPLETED" : pass.status;

    const [updatedPass, paymentRecord] = await prisma.$transaction([
      prisma.pass.update({
        where: { id: pass.id },
        data: {
          spent: newSpent,
          remaining: newRemaining,
          status: newStatus,
        },
      }),
      prisma.payment.create({
        data: {
          passId: pass.id,
          merchantId: merchantId || null,
          amount: numAmount,
          category: merchantCategory,
          description: description || `Payment to ${merchantName || "Merchant"}`,
          status: "SUCCESS",
          txSignature: txSignature || `devnet_tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        },
      }),
    ]);

    // 3. Optional Advisory AI Receipt Analysis
    let receiptResult = null;
    if (receiptItems && Array.isArray(receiptItems)) {
      receiptResult = await analyzeReceipt({
        passCategory: pass.category as PassCategory,
        merchantName: merchantName || "Merchant",
        claimedTotal: numAmount,
        items: receiptItems,
      });

      await prisma.receipt.create({
        data: {
          paymentId: paymentRecord.id,
          status: receiptResult.status,
          confidence: receiptResult.confidence,
          analysis: receiptResult.reason,
        },
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        actor: recipient,
        action: "PAYMENT_EXECUTED",
        passId: pass.id,
        metadata: JSON.stringify({
          amount: numAmount,
          merchantCategory,
          newRemaining,
          txSignature: paymentRecord.txSignature,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      pass: updatedPass,
      payment: paymentRecord,
      receiptAnalysis: receiptResult,
    });
  } catch (error: any) {
    console.error("API POST /api/payment/execute error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute payment." },
      { status: 500 }
    );
  }
}
