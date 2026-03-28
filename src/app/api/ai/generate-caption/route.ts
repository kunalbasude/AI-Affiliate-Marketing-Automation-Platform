export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { generateContent } from "@/lib/ai/generate";
import { PLAN_LIMITS } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const { productId, tone = "casual", customInstructions } = await request.json();

    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    // Check AI usage limits
    const userRef = adminDb.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    const user = userDoc.data();
    const plan = user?.plan || "free";
    const limits = PLAN_LIMITS[plan as "free" | "pro"];
    const usage = user?.aiUsage?.generationsThisMonth || 0;

    if (usage >= limits.maxGenerationsPerMonth) {
      return NextResponse.json({ error: `AI generation limit reached (${limits.maxGenerationsPerMonth}/month). Upgrade to Pro.` }, { status: 403 });
    }

    // Fetch product
    const productDoc = await adminDb.doc(`users/${uid}/products/${productId}`).get();
    if (!productDoc.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const product = productDoc.data()!;

    const text = await generateContent("instagram_caption", {
      name: product.name,
      description: product.description || "",
      originalPrice: product.originalPrice,
      sellingPrice: product.sellingPrice,
      category: product.category || "",
      tags: product.tags || [],
    }, tone, customInstructions);

    // Increment usage
    await userRef.update({ "aiUsage.generationsThisMonth": (usage + 1) });

    return NextResponse.json({ content: text, type: "instagram_caption" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
