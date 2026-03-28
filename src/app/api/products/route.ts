export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { productSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/types";
import { calculateSellingPrice } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query: FirebaseFirestore.Query = adminDb.collection(`users/${uid}/products`).orderBy("createdAt", "desc");
    if (category) query = query.where("category", "==", category);

    const snapshot = await query.get();
    let products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const s = search.toLowerCase();
      products = products.filter((p: any) => p.name?.toLowerCase().includes(s));
    }

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.errors }, { status: 400 });
    }

    // Check plan limits
    const userDoc = await adminDb.doc(`users/${uid}`).get();
    const user = userDoc.data();
    const plan = user?.plan || "free";
    const limits = PLAN_LIMITS[plan as "free" | "pro"];

    const productsSnap = await adminDb.collection(`users/${uid}/products`).count().get();
    if (productsSnap.data().count >= limits.maxProducts) {
      return NextResponse.json({ error: `Product limit reached (${limits.maxProducts}). Upgrade to Pro for unlimited.` }, { status: 403 });
    }

    const data = parsed.data;
    const sellingPrice = calculateSellingPrice(data.originalPrice, data.marginPercent);

    const ref = await adminDb.collection(`users/${uid}/products`).add({
      ...data,
      sellingPrice,
      images: data.images || [],
      tags: data.tags || [],
      sourcePlatform: data.sourcePlatform || "",
      commissionRate: data.commissionRate || 0,
      isPublished: data.isPublished ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: ref.id, message: "Product created" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
