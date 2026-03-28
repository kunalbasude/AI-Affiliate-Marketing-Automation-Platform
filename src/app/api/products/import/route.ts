export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { csvProductSchema } from "@/lib/validations";
import { calculateSellingPrice } from "@/lib/utils";
import { PLAN_LIMITS } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const { products: rawProducts } = await request.json();

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    // Check plan limits
    const userDoc = await adminDb.doc(`users/${uid}`).get();
    const plan = userDoc.data()?.plan || "free";
    const limits = PLAN_LIMITS[plan as "free" | "pro"];
    const currentCount = (await adminDb.collection(`users/${uid}/products`).count().get()).data().count;
    const remaining = limits.maxProducts - currentCount;

    const batch = adminDb.batch();
    let successCount = 0;
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rawProducts.length && successCount < remaining; i++) {
      const parsed = csvProductSchema.safeParse(rawProducts[i]);
      if (!parsed.success) {
        errors.push({ row: i + 1, error: parsed.error.errors.map((e) => e.message).join(", ") });
        continue;
      }

      const data = parsed.data;
      const ref = adminDb.collection(`users/${uid}/products`).doc();
      batch.set(ref, {
        name: data.name,
        description: data.description,
        category: data.category,
        originalPrice: data.originalPrice,
        marginPercent: data.marginPercent,
        sellingPrice: calculateSellingPrice(data.originalPrice, data.marginPercent),
        affiliateLink: data.affiliateLink,
        imageURL: data.imageURL,
        images: [],
        tags: [],
        sourcePlatform: data.sourcePlatform,
        commissionRate: data.commissionRate,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      successCount++;
    }

    await batch.commit();
    return NextResponse.json({ imported: successCount, errors, total: rawProducts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
