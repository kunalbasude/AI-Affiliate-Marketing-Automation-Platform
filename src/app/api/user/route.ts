export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const doc = await adminDb.doc(`users/${uid}`).get();
    if (!doc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user: { uid, ...doc.data() } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const body = await request.json();
    const allowed = ["displayName", "storeSettings"];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }
    updates.updatedAt = new Date();
    await adminDb.doc(`users/${uid}`).update(updates);
    return NextResponse.json({ message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
