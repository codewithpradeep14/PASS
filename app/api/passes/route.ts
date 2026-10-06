import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { ALL_CATEGORIES, PassCategory } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const recipient = searchParams.get("recipient");

    const where: any = {};
    if (owner) where.ownerWallet = owner;
    if (recipient) where.recipientWallet = recipient;

    const passes = await prisma.pass.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ success: true, passes });
  } catch (error: any) {
    console.error("API GET /api/passes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch PASS records." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      onchainPassAddress,
      ownerWallet,
      recipientWallet,
      amount,
      purpose,
      category,
      maxPerTransaction,
      expiresAt,
    } = body;

    // Validate inputs
    if (!ownerWallet || !recipientWallet || !amount || !purpose || !expiresAt) {
      return NextResponse.json(
        { success: false, error: "Missing required PASS creation fields." },
        { status: 400 }
      );
    }

    const validCategory = ALL_CATEGORIES.includes(category as PassCategory)
      ? (category as PassCategory)
      : "CUSTOM";

    const numAmount = Number(amount);
    const numMaxTx = Number(maxPerTransaction || amount);

    if (numAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than zero." },
        { status: 400 }
      );
    }

    // Save Pass
    const pass = await prisma.pass.create({
      data: {
        onchainPassAddress: onchainPassAddress || `pass_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ownerWallet,
        recipientWallet,
        amount: numAmount,
        spent: 0.0,
        remaining: numAmount,
        purpose,
        category: validCategory,
        maxPerTransaction: numMaxTx,
        expiresAt: new Date(expiresAt),
        status: "ACTIVE",
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actor: ownerWallet,
        action: "CREATE_PASS",
        passId: pass.id,
        metadata: JSON.stringify({ amount: numAmount, category: validCategory, recipientWallet }),
      },
    });

    return NextResponse.json({ success: true, pass });
  } catch (error: any) {
    console.error("API POST /api/passes error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create PASS." },
      { status: 500 }
    );
  }
}
