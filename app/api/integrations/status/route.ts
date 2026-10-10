import { NextResponse } from "next/server";
import { getIntegrationsStatus } from "@/lib/integrations/manager";

export async function GET() {
  try {
    const status = await getIntegrationsStatus();
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error("API GET /api/integrations/status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch integrations status.",
      },
      { status: 500 }
    );
  }
}
