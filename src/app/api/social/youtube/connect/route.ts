export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { getYouTubeAuthUrl, exchangeYouTubeCode } from "@/lib/social/youtube";

/** Step 1: Return OAuth2 URL for the user to authorize YouTube. */
export async function GET(req: NextRequest) {
  try {
    await verifyToken(req.headers.get("authorization"));
    const authUrl = getYouTubeAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

/** Step 2: Exchange OAuth callback code for tokens and save. */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const body = await req.json();
    const { code } = body;
    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

    const ytInfo = await exchangeYouTubeCode(code);

    // Remove existing YouTube accounts
    const existing = await adminDb
      .collection(`users/${uid}/socialAccounts`)
      .where("platform", "==", "youtube")
      .get();
    const batch = adminDb.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    await adminDb.collection(`users/${uid}/socialAccounts`).add({
      platform: "youtube",
      accountId: ytInfo.channelId,
      accountName: ytInfo.channelName,
      accessToken: ytInfo.accessToken,
      refreshToken: ytInfo.refreshToken,
      tokenExpiry: ytInfo.tokenExpiry,
      connected: true,
      connectedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, channelName: ytInfo.channelName, channelId: ytInfo.channelId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const existing = await adminDb
      .collection(`users/${uid}/socialAccounts`)
      .where("platform", "==", "youtube")
      .get();
    const batch = adminDb.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
