import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { PassCategory } from "@/types";

const DEFAULT_MERCHANTS: Array<{
  name: string;
  category: PassCategory;
  walletAddress: string;
  description: string;
}> = [
  {
    name: "FreshMart Supermarket",
    category: "GROCERIES",
    walletAddress: "Fresh11111111111111111111111111111111111111",
    description: "Local grocery store selling fresh vegetables, dairy, and household essentials.",
  },
  {
    name: "Urban Cafe & Bakery",
    category: "FOOD",
    walletAddress: "Cafe111111111111111111111111111111111111111",
    description: "Artisan coffee, sandwiches, and bakery items.",
  },
  {
    name: "Metro Transit Authority",
    category: "TRANSPORT",
    walletAddress: "Metro11111111111111111111111111111111111111",
    description: "Public transit passes, subway fares, and train tickets.",
  },
  {
    name: "Academy Books & Tools",
    category: "EDUCATION",
    walletAddress: "Edu1111111111111111111111111111111111111111",
    description: "University coursebooks, supplies, and coding bootcamps.",
  },
  {
    name: "Apex Gaming & VR Zone",
    category: "ENTERTAINMENT",
    walletAddress: "Game111111111111111111111111111111111111111",
    description: "Video games, consoles, digital skins, and arcade tokens.",
  },
];

export async function GET() {
  try {
    let merchants = await prisma.merchant.findMany();

    // Seed defaults if empty
    if (merchants.length === 0) {
      for (const m of DEFAULT_MERCHANTS) {
        await prisma.merchant.create({
          data: {
            name: m.name,
            category: m.category,
            walletAddress: m.walletAddress,
          },
        });
      }
      merchants = await prisma.merchant.findMany();
    }

    return NextResponse.json({ success: true, merchants });
  } catch (error: any) {
    console.error("API GET /api/merchants error:", error);
    // Return default static merchants if DB error
    return NextResponse.json({
      success: true,
      merchants: DEFAULT_MERCHANTS.map((m, idx) => ({ id: `m_${idx}`, ...m })),
    });
  }
}
