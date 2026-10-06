import { NextRequest, NextResponse } from "next/server";
import { analyzeReceipt } from "@/lib/ai/receiptAnalyzer";
import { PassCategory } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passCategory, receiptText, items, merchantName, claimedTotal } = body;

    if (!passCategory) {
      return NextResponse.json(
        { success: false, error: "PASS category must be provided for verification comparison." },
        { status: 400 }
      );
    }

    const analysis = await analyzeReceipt({
      passCategory: passCategory as PassCategory,
      receiptText,
      items,
      merchantName,
      claimedTotal: Number(claimedTotal || 0),
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("API POST /api/receipt/analyze error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze receipt." },
      { status: 500 }
    );
  }
}
