export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { username, productId, type = "click" } = await request.json();
    if (!username || !productId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Look up user by username
    const usernameDoc = await adminDb.doc(`usernames/${username}`).get();
    if (!usernameDoc.exists) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    const uid = usernameDoc.data()!.uid;

    const today = new Date().toISOString().split("T")[0];
    const ref = adminDb.doc(`users/${uid}/analytics/${today}`);
    const doc = await ref.get();

    const field = type === "view" ? "totalViews" : "totalClicks";
    const mapField = type === "view" ? "viewsByProduct" : "clicksByProduct";

    if (doc.exists) {
      await ref.update({
        [field]: FieldValue.increment(1),
        [`${mapField}.${productId}`]: FieldValue.increment(1),
      });
    } else {
      await ref.set({
        date: today,
        totalClicks: type === "click" ? 1 : 0,
        totalViews: type === "view" ? 1 : 0,
        clicksByProduct: type === "click" ? { [productId]: 1 } : {},
        viewsByProduct: type === "view" ? { [productId]: 1 } : {},
        referrers: {},
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
