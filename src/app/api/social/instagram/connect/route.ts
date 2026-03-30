export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { getInstagramAccountInfo } from "@/lib/social/instagram";

/**
 * Save Instagram access token and account info.
 * The user gets their long-lived token from Meta Graph API Explorer.
 */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const body = await req.json();
    const { accessToken } = body;
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken required" }, { status: 400 });
    }

    const accounts = await getInstagramAccountInfo(accessToken);
    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "No Instagram Business Account found. Make sure your Instagram is connected to a Facebook Page." },
        { status: 400 }
      );
    }

    const account = accounts[0];

    // Remove existing IG accounts
    const existing = await adminDb
      .collection(`users/${uid}/socialAccounts`)
      .where("platform", "==", "instagram")
      .get();
    const batch = adminDb.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    await adminDb.collection(`users/${uid}/socialAccounts`).add({
      platform: "instagram",
      accountId: account.igUserId,
      accountName: account.pageName,
      accessToken,
      connected: true,
      connectedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, accountName: account.pageName, igUserId: account.igUserId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const existing = await adminDb
      .collection(`users/${uid}/socialAccounts`)
      .where("platform", "==", "instagram")
      .get();
    const batch = adminDb.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
