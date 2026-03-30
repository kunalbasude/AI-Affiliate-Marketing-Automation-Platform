export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const doc = await adminDb.doc(`users/${uid}/settings/automation`).get();
    return NextResponse.json({ settings: doc.exists ? doc.data() : null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const body = await req.json();
    await adminDb.doc(`users/${uid}/settings/automation`).set(body, { merge: true });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
