export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";

export async function PUT(request: NextRequest, { params }: { params: { scheduleId: string } }) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const body = await request.json();
    await adminDb.doc(`users/${uid}/schedules/${params.scheduleId}`).update(body);
    return NextResponse.json({ message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { scheduleId: string } }) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    await adminDb.doc(`users/${uid}/schedules/${params.scheduleId}`).delete();
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
