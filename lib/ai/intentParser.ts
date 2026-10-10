import { z } from "zod";
import { PassCategory, ALL_CATEGORIES, AIParsedIntent } from "@/types";

export const IntentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.string().default("USDC"),
  recipient: z.string().min(1, "Recipient must be specified"),
  purpose: z.string().min(1, "Purpose must be specified"),
  category: z.enum([
    "GROCERIES",
    "FOOD",
    "TRANSPORT",
    "EDUCATION",
    "HEALTHCARE",
    "WORK",
    "TRAVEL",
    "UTILITIES",
    "ENTERTAINMENT",
    "CUSTOM",
  ]),
  maxPerTransaction: z.number().positive("Max per transaction must be positive"),
  expiresAt: z.string().min(1, "Expiration must be set"),
  allowedMerchantCategories: z.array(z.string()).min(1),
  confidence: z.number().min(0).max(1).default(1.0),
  explanation: z.string().optional(),
});

export interface IntentParseResponse {
  success: boolean;
  data?: AIParsedIntent;
  clarification?: string;
  error?: string;
}

/**
 * Intelligent rule-based NLP extractor when LLM key is not provided or network is offline.
 * Reliably maps natural instructions like:
 * "Give my brother $100 for groceries until Sunday"
 * "Give Rahul 50 USDC for food with max $25 per tx until tomorrow"
 */
export function parseIntentDeterministically(instruction: string): IntentParseResponse {
  const text = instruction.trim();
  const lower = text.toLowerCase();

  // 1. Detect missing essential info
  const amountMatch = text.match(/\$?(\d+(\.\d+)?)\s*(usdc|usd|\$)?/i);
  if (!amountMatch || parseFloat(amountMatch[1]) <= 0) {
    return {
      success: false,
      clarification: "How much money would you like to allocate for this PASS (e.g. $100 USDC)?",
    };
  }
  const amount = parseFloat(amountMatch[1]);

  // 2. Detect Category
  let category: PassCategory = "CUSTOM";
  let purpose = "General Expenses";

  if (lower.includes("grocer")) {
    category = "GROCERIES";
    purpose = "Groceries and household essentials";
  } else if (lower.includes("food") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("snack") || lower.includes("restaurant") || lower.includes("meal")) {
    category = "FOOD";
    purpose = "Food and dining";
  } else if (lower.includes("uber") || lower.includes("taxi") || lower.includes("transport") || lower.includes("gas") || lower.includes("metro") || lower.includes("bus")) {
    category = "TRANSPORT";
    purpose = "Transportation and transit";
  } else if (lower.includes("book") || lower.includes("tuition") || lower.includes("course") || lower.includes("school") || lower.includes("education")) {
    category = "EDUCATION";
    purpose = "Educational expenses and books";
  } else if (lower.includes("med") || lower.includes("doctor") || lower.includes("health") || lower.includes("pharmacy")) {
    category = "HEALTHCARE";
    purpose = "Healthcare and prescriptions";
  } else if (lower.includes("work") || lower.includes("office") || lower.includes("software") || lower.includes("supplies")) {
    category = "WORK";
    purpose = "Work and office supplies";
  } else if (lower.includes("flight") || lower.includes("hotel") || lower.includes("travel")) {
    category = "TRAVEL";
    purpose = "Travel and lodging";
  } else if (lower.includes("game") || lower.includes("gaming") || lower.includes("steam") || lower.includes("movie") || lower.includes("entertainment")) {
    category = "ENTERTAINMENT";
    purpose = "Entertainment";
  } else if (lower.includes("electric") || lower.includes("water") || lower.includes("bill") || lower.includes("utilities")) {
    category = "UTILITIES";
    purpose = "Utility bills";
  }

  // 3. Detect Recipient
  let recipient = "Demo Recipient (Bob)";
  const recipientMatch = text.match(/(?:give|to|for)\s+([A-Z][a-z]+|[0-9a-zA-Z]{32,44}|my\s+[a-z]+)/i);
  if (recipientMatch) {
    const rawRecip = recipientMatch[1].trim();
    if (rawRecip.toLowerCase() === "my brother") {
      recipient = "Brother (0x...Bob)";
    } else if (rawRecip.toLowerCase() === "my sister") {
      recipient = "Sister (0x...Alice)";
    } else if (rawRecip.length > 20) {
      recipient = rawRecip;
    } else {
      recipient = rawRecip;
    }
  }

  // 4. Detect Max Per Transaction (Default to 50% of amount, capped reasonably, or explicitly specified)
  const maxTxMatch = text.match(/max(?:imum)?\s*(?:of)?\s*\$?(\d+(\.\d+)?)/i);
  const maxPerTransaction = maxTxMatch
    ? Math.min(amount, parseFloat(maxTxMatch[1]))
    : Math.max(10, Math.min(amount, Math.round(amount * 0.5)));

  // 5. Expiration Calculation (hours, minutes, days, or day-of-week)
  const now = new Date();
  let expiresDate: Date;

  const hoursMatch = lower.match(/(?:for|in|valid\s+for)?\s*(\d+)\s*(?:hours?|hrs?)/i);
  const minutesMatch = lower.match(/(?:for|in|valid\s+for)?\s*(\d+)\s*(?:minutes?|mins?)/i);
  const oneHourMatch = lower.match(/(?:for|in|valid\s+for)\s*(?:an?)\s*(?:hour|hr)/i);

  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    expiresDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
  } else if (oneHourMatch) {
    expiresDate = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  } else if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1], 10);
    expiresDate = new Date(now.getTime() + minutes * 60 * 1000);
  } else {
    let daysToAdd = 7; // Default 1 week
    if (lower.includes("today")) {
      daysToAdd = 0;
    } else if (lower.includes("tomorrow")) {
      daysToAdd = 1;
    } else if (lower.includes("sunday")) {
      const currentDay = now.getDay();
      daysToAdd = (7 - currentDay) % 7 || 7;
    } else if (lower.includes("friday")) {
      const currentDay = now.getDay();
      daysToAdd = (5 - currentDay + 7) % 7 || 7;
    } else if (lower.includes("month")) {
      daysToAdd = 30;
    }
    expiresDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    expiresDate.setHours(23, 59, 59, 999);
  }

  const parsedData: AIParsedIntent = {
    amount,
    currency: "USDC",
    recipient,
    purpose,
    category,
    maxPerTransaction,
    expiresAt: expiresDate.toISOString(),
    allowedMerchantCategories: [category],
    confidence: 0.96,
    explanation: `Extracted intent to allocate $${amount} USDC for ${category} with a per-tx cap of $${maxPerTransaction}.`,
  };

  const validation = IntentSchema.safeParse(parsedData);
  if (!validation.success) {
    return {
      success: false,
      error: "Extracted policy failed schema validation: " + validation.error.message,
    };
  }

  return {
    success: true,
    data: validation.data as AIParsedIntent,
  };
}

/**
 * Main AI Intent Parser: invokes LLM if key is configured, validated with Zod,
 * and falls back safely to deterministic parser.
 */
export async function parseSpendingIntent(instruction: string): Promise<IntentParseResponse> {
  const apiKey = process.env.AI_API_KEY;

  if (!instruction || instruction.trim().length === 0) {
    return {
      success: false,
      clarification: "Please describe who should receive the funds, the amount, and what it should be used for.",
    };
  }

  if (!apiKey) {
    // Deterministic parser runs locally and safely
    return parseIntentDeterministically(instruction);
  }

  try {
    const prompt = `You are the intent interpreter for PASS (Money with instructions).
Convert this user instruction into a strictly structured JSON policy.
Instruction: "${instruction}"

Valid categories: ${ALL_CATEGORIES.join(", ")}
Currency is always "USDC".

Return ONLY valid JSON matching this structure:
{
  "amount": number,
  "currency": "USDC",
  "recipient": string,
  "purpose": string,
  "category": "GROCERIES" | "FOOD" | "TRANSPORT" | "EDUCATION" | "HEALTHCARE" | "WORK" | "TRAVEL" | "UTILITIES" | "ENTERTAINMENT" | "CUSTOM",
  "maxPerTransaction": number,
  "expiresAt": string (ISO 8601),
  "allowedMerchantCategories": [category],
  "confidence": number,
  "explanation": string
}

If any critical piece is missing (e.g. no amount specified), return:
{
  "clarification": "question to ask user"
}`;

    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!res.ok) {
      return parseIntentDeterministically(instruction);
    }

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return parseIntentDeterministically(instruction);
    }

    const parsedJson = JSON.parse(rawText);

    if (parsedJson.clarification) {
      return { success: false, clarification: parsedJson.clarification };
    }

    const validation = IntentSchema.safeParse(parsedJson);
    if (!validation.success) {
      // Reject raw invalid LLM data
      return parseIntentDeterministically(instruction);
    }

    return {
      success: true,
      data: validation.data as AIParsedIntent,
    };
  } catch (err: any) {
    console.warn("AI Intent API call fallback:", err?.message);
    return parseIntentDeterministically(instruction);
  }
}
