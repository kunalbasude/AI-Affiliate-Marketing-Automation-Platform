export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { calculateSellingPrice } from "@/lib/utils";

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const doc = await adminDb.doc(`users/${uid}/products/${params.productId}`).get();
    if (!doc.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ product: { id: doc.id, ...doc.data() } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const body = await request.json();
    const ref = adminDb.doc(`users/${uid}/products/${params.productId}`);
    const doc = await ref.get();
    if (!doc.exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (body.originalPrice !== undefined && body.marginPercent !== undefined) {
      body.sellingPrice = calculateSellingPrice(body.originalPrice, body.marginPercent);
    }
    body.updatedAt = new Date();

    await ref.update(body);
    return NextResponse.json({ message: "Product updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    await adminDb.doc(`users/${uid}/products/${params.productId}`).delete();
    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
