export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const snap = await adminDb.collection(`users/${uid}/socialAccounts`).get();
    const accounts = snap.docs.map((d) => {
      const data = d.data();
      return {
        platform: data.platform,
        accountId: data.accountId,
        accountName: data.accountName,
        connected: data.connected,
        connectedAt: data.connectedAt,
        tokenExpiry: data.tokenExpiry ?? null,
      };
    });
    return NextResponse.json({ accounts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
