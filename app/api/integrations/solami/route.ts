import { NextRequest, NextResponse } from "next/server";
import { solamiClient } from "@/lib/integrations/solami/solamiClient";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address") || undefined;

    const data = await solamiClient.getRecentActivity(address);

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("API GET /api/integrations/solami error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Solami activity.",
      },
      { status: 500 }
    );
  }
}
