export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest, { params }: { params: { contentId: string } }) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const doc = await adminDb.doc(`users/${uid}/content/${params.contentId}`).get();
    if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ content: { id: doc.id, ...doc.data() } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { contentId: string } }) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const body = await request.json();
    await adminDb.doc(`users/${uid}/content/${params.contentId}`).update(body);
    return NextResponse.json({ message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { contentId: string } }) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    await adminDb.doc(`users/${uid}/content/${params.contentId}`).delete();
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
