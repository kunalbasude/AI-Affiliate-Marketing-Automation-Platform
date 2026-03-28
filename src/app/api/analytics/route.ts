export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const { uid } = await verifyToken(request.headers.get("authorization"));
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "2026-01-01";
    const endDate = searchParams.get("endDate") || "2026-12-31";

    const snapshot = await adminDb.collection(`users/${uid}/analytics`)
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "asc")
      .get();

    const analytics = snapshot.docs.map((doc) => doc.data());
    const totals = analytics.reduce((acc, day: any) => ({
      totalClicks: acc.totalClicks + (day.totalClicks || 0),
      totalViews: acc.totalViews + (day.totalViews || 0),
    }), { totalClicks: 0, totalViews: 0 });

    return NextResponse.json({ analytics, totals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
