export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { generateProductVideo, pollRenderStatus } from "@/lib/video/generator";

/** Kick off a video render. Returns jobId immediately (async). */
export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const body = await req.json();
    const { productId, productName, productDescription, imageUrls, price, caption, platform } = body;

    if (!productName || !imageUrls?.length) {
      return NextResponse.json({ error: "productName and imageUrls required" }, { status: 400 });
    }

    const job = await generateProductVideo({
      productName,
      productDescription: productDescription ?? "",
      imageUrls,
      price: String(price ?? ""),
      caption: caption ?? "",
      platform: platform ?? "instagram_reel",
    });

    if (!job.success) {
      return NextResponse.json({ error: job.error }, { status: 500 });
    }

    const jobRef = await adminDb.collection(`users/${uid}/videoJobs`).add({
      productId: productId ?? null,
      productName,
      status: "rendering",
      platform: platform ?? "instagram_reel",
      shotStackRenderId: job.renderId,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, jobId: jobRef.id, renderId: job.renderId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Poll a render's status by jobId. */
export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

    const jobDoc = await adminDb.doc(`users/${uid}/videoJobs/${jobId}`).get();
    if (!jobDoc.exists) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const job = jobDoc.data()!;

    if (job.status === "completed") {
      return NextResponse.json({ status: "completed", videoUrl: job.videoUrl, thumbnailUrl: job.thumbnailUrl });
    }

    if (!job.shotStackRenderId) {
      return NextResponse.json({ status: job.status });
    }

    const result = await pollRenderStatus(job.shotStackRenderId);
    if (result.success && result.videoUrl) {
      await adminDb.doc(`users/${uid}/videoJobs/${jobId}`).update({
        status: "completed",
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl ?? null,
        completedAt: new Date(),
      });
      return NextResponse.json({ status: "completed", videoUrl: result.videoUrl, thumbnailUrl: result.thumbnailUrl });
    }

    if (!result.success && result.error) {
      await adminDb.doc(`users/${uid}/videoJobs/${jobId}`).update({ status: "failed" });
      return NextResponse.json({ status: "failed", error: result.error });
    }

    return NextResponse.json({ status: "rendering" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
