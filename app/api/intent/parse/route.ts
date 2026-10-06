import { NextRequest, NextResponse } from "next/server";
import { parseSpendingIntent } from "@/lib/ai/intentParser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instruction } = body;

    if (!instruction || typeof instruction !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing instruction text." },
        { status: 400 }
      );
    }

    const result = await parseSpendingIntent(instruction);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API /api/intent/parse error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process natural language intent." },
      { status: 500 }
    );
  }
}
