export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { PLAN_LIMITS } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const doc = await adminDb.doc(`users/${uid}`).get();
    const user = doc.data();
    const plan = user?.plan || "free";
    return NextResponse.json({ plan, limits: PLAN_LIMITS[plan as "free" | "pro"], usage: user?.aiUsage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const { plan } = await request.json();
    if (!["free", "pro"].includes(plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    await adminDb.doc(`users/${uid}`).update({ plan, updatedAt: new Date() });
    return NextResponse.json({ message: `Plan updated to ${plan}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
