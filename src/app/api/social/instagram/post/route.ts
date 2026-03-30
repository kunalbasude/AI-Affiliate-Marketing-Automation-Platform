export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { postInstagramImage, postInstagramReel, postInstagramCarousel } from "@/lib/social/instagram";

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const body = await req.json();
    const { type, imageUrl, imageUrls, videoUrl, caption, coverImageUrl, productId } = body;

    // Get stored IG account (with access token — server-side only)
    const accountSnap = await adminDb
      .collection(`users/${uid}/socialAccounts`)
      .where("platform", "==", "instagram")
      .limit(1)
      .get();

    if (accountSnap.empty) {
      return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });
    }

    const account = accountSnap.docs[0].data();
    const igUserId: string = account.accountId;
    const accessToken: string = account.accessToken;

    let result;
    if (type === "reel" && videoUrl) {
      result = await postInstagramReel({ videoUrl, caption, coverImageUrl, igUserId, accessToken });
    } else if (type === "carousel" && imageUrls?.length > 0) {
      result = await postInstagramCarousel({ imageUrls, caption, igUserId, accessToken });
    } else if (imageUrl) {
      result = await postInstagramImage({ imageUrl, caption, igUserId, accessToken });
    } else {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (result.success && productId) {
      await adminDb.collection(`users/${uid}/socialPosts`).add({
        platform: "instagram",
        type,
        productId,
        postId: result.postId,
        permalink: result.permalink,
        caption,
        postedAt: new Date(),
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
