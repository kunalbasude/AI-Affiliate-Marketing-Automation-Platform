export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { generateContent } from "@/lib/ai/generate";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const { productId, platform = "instagram" } = await request.json();

    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const productDoc = await adminDb.doc(`users/${uid}/products/${productId}`).get();
    if (!productDoc.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const product = productDoc.data()!;

    const text = await generateContent("hashtags", {
      name: product.name, description: product.description || "",
      originalPrice: product.originalPrice, sellingPrice: product.sellingPrice,
      category: product.category || "", tags: product.tags || [],
    }, platform);

    return NextResponse.json({ content: text, type: "hashtags" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
