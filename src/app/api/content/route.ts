export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const platform = searchParams.get("platform");

    let query: FirebaseFirestore.Query = adminDb.collection(`users/${uid}/content`).orderBy("createdAt", "desc");
    if (type) query = query.where("type", "==", type);
    if (platform) query = query.where("platform", "==", platform);

    const snapshot = await query.get();
    const content = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const body = await request.json();
    const ref = await adminDb.collection(`users/${uid}/content`).add({
      ...body,
      isScheduled: false,
      createdAt: new Date(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
