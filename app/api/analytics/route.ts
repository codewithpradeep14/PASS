import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  try {
    const passes = await prisma.pass.findMany({
      include: { payments: true },
    });

    const allPayments = await prisma.payment.findMany();

    let totalAllocated = 0;
    let totalSpent = 0;
    let totalRemaining = 0;
    let activePassesCount = 0;
    let expiredPassesCount = 0;
    let revokedPassesCount = 0;

    const categorySpending: Record<string, number> = {};
    const blockedByCategory: Record<string, { count: number; volume: number }> = {};

    const now = new Date();

    passes.forEach((p) => {
      totalAllocated += p.amount;
      totalSpent += p.spent;
      totalRemaining += p.remaining;

      if (p.status === "ACTIVE" && new Date(p.expiresAt) > now) {
        activePassesCount++;
      } else if (p.status === "REVOKED") {
        revokedPassesCount++;
      } else {
        expiredPassesCount++;
      }
    });

    let approvedPaymentsCount = 0;
    let blockedPaymentsCount = 0;

    allPayments.forEach((pmt) => {
      if (pmt.status === "SUCCESS") {
        approvedPaymentsCount++;
        categorySpending[pmt.category] = (categorySpending[pmt.category] || 0) + pmt.amount;
      } else if (pmt.status === "BLOCKED") {
        blockedPaymentsCount++;
        if (!blockedByCategory[pmt.category]) {
          blockedByCategory[pmt.category] = { count: 0, volume: 0 };
        }
        blockedByCategory[pmt.category].count++;
        blockedByCategory[pmt.category].volume += pmt.amount;
      }
    });

    return NextResponse.json({
      success: true,
      analytics: {
        totalAllocated,
        totalSpent,
        totalRemaining,
        activePassesCount,
        expiredPassesCount,
        revokedPassesCount,
        approvedPaymentsCount,
        blockedPaymentsCount,
        categorySpending,
        blockedByCategory,
      },
    });
  } catch (error: any) {
    console.error("API GET /api/analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
