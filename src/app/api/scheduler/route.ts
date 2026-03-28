export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { PLAN_LIMITS } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const snapshot = await adminDb.collection(`users/${uid}/schedules`).orderBy("scheduledAt", "asc").get();
    const schedules = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ schedules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const body = await request.json();

    const userDoc = await adminDb.doc(`users/${uid}`).get();
    const plan = userDoc.data()?.plan || "free";
    const limits = PLAN_LIMITS[plan as "free" | "pro"];
    const scheduledCount = (await adminDb.collection(`users/${uid}/schedules`).where("status", "==", "scheduled").count().get()).data().count;

    if (scheduledCount >= limits.maxScheduledPosts) {
      return NextResponse.json({ error: `Schedule limit reached (${limits.maxScheduledPosts})` }, { status: 403 });
    }

    const ref = await adminDb.collection(`users/${uid}/schedules`).add({
      ...body,
      status: "scheduled",
      createdAt: new Date(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
