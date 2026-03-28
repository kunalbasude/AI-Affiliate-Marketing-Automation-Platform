export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { generateContent } from "@/lib/ai/generate";
import { PLAN_LIMITS } from "@/types";
import type { ContentType } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const { productId, tone = "casual", type = "youtube_script", customInstructions } = await request.json();

    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const validTypes: ContentType[] = ["youtube_script", "youtube_shorts", "instagram_reel", "instagram_carousel"];
    if (!validTypes.includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const userRef = adminDb.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    const user = userDoc.data();
    const usage = user?.aiUsage?.generationsThisMonth || 0;
    const limits = PLAN_LIMITS[(user?.plan || "free") as "free" | "pro"];

    if (usage >= limits.maxGenerationsPerMonth) {
      return NextResponse.json({ error: "AI generation limit reached" }, { status: 403 });
    }

    const productDoc = await adminDb.doc(`users/${uid}/products/${productId}`).get();
    if (!productDoc.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const product = productDoc.data()!;

    const text = await generateContent(type as ContentType, {
      name: product.name, description: product.description || "",
      originalPrice: product.originalPrice, sellingPrice: product.sellingPrice,
      category: product.category || "", tags: product.tags || [],
    }, tone, customInstructions);

    await userRef.update({ "aiUsage.generationsThisMonth": (usage + 1) });
    return NextResponse.json({ content: text, type });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
