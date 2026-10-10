import { NextRequest, NextResponse } from "next/server";
import { pantaClient } from "@/lib/integrations/panta/pantaClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("q") || undefined;

    const data = await pantaClient.getMarkets(category, query);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("API GET /api/integrations/panta error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Panta markets.",
      },
      { status: 500 }
    );
  }
}
