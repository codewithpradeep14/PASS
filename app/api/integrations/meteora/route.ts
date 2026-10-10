import { NextRequest, NextResponse } from "next/server";
import { meteoraClient } from "@/lib/integrations/meteora/meteoraClient";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenMint = searchParams.get("tokenMint") || undefined;
    const passId = searchParams.get("passId") || undefined;

    const data = await meteoraClient.getLaunchInsights(tokenMint, passId);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("API GET /api/integrations/meteora error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Meteora launch insights.",
      },
      { status: 500 }
    );
  }
}
