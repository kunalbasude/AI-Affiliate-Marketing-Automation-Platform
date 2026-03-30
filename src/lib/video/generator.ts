import axios from "axios";

const SHOTSTACK_API = "https://api.shotstack.io/v1";
const SHOTSTACK_KEY = process.env.SHOTSTACK_API_KEY ?? "";

export interface VideoGenerationRequest {
  productName: string;
  productDescription: string;
  imageUrls: string[];
  price: string;
  caption: string;
  platform: "instagram_reel" | "youtube_shorts";
  musicMood?: "upbeat" | "calm" | "energetic";
}

export interface VideoGenerationResponse {
  success: boolean;
  renderId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

/**
 * Generate a product showcase reel/short using Shotstack cloud rendering.
 * Free tier: 5 renders/month. Paid from ~$49/mo.
 * API key: https://app.shotstack.io/register
 */
export async function generateProductVideo(
  req: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  if (!SHOTSTACK_KEY) {
    return { success: false, error: "SHOTSTACK_API_KEY not configured" };
  }

  const timeline = buildTimeline(req);

  try {
    const renderRes = await axios.post(
      `${SHOTSTACK_API}/render`,
      { timeline, output: buildOutput(req.platform) },
      {
        headers: {
          "x-api-key": SHOTSTACK_KEY,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const renderId: string = renderRes.data?.response?.id;
    if (!renderId) throw new Error("No render ID returned");

    return { success: true, renderId };
  } catch (err: unknown) {
    return { success: false, error: extractError(err) };
  }
}

/**
 * Poll a Shotstack render until it completes.
 * Returns the video URL when done.
 */
export async function pollRenderStatus(
  renderId: string
): Promise<VideoGenerationResponse> {
  const maxAttempts = 40;
  const intervalMs = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    await sleep(intervalMs);
    try {
      const res = await axios.get(`${SHOTSTACK_API}/render/${renderId}`, {
        headers: { "x-api-key": SHOTSTACK_KEY },
        timeout: 10000,
      });

      const data = res.data?.response;
      const status: string = data?.status;

      if (status === "done") {
        return {
          success: true,
          renderId,
          videoUrl: data.url,
          thumbnailUrl: data.poster,
        };
      }
      if (status === "failed") {
        return { success: false, renderId, error: "Render failed on Shotstack" };
      }
    } catch {
      // ignore poll errors and retry
    }
  }
  return { success: false, renderId, error: "Render timed out" };
}

// ─── Timeline Builder ─────────────────────────────────────────────────────────

function buildTimeline(req: VideoGenerationRequest) {
  const { productName, price, caption, imageUrls } = req;
  const images = imageUrls.slice(0, 5);
  const duration = 30; // 30-second reel

  // Each image shown for (duration / images.length) seconds
  const imgDuration = Math.floor(duration / Math.max(images.length, 1));

  const imageClips = images.map((url, i) => ({
    asset: { type: "image", src: url },
    start: i * imgDuration,
    length: imgDuration,
    effect: i % 2 === 0 ? "zoomIn" : "zoomOut",
    transition: { in: "fade", out: "fade" },
  }));

  const titleClip = {
    asset: {
      type: "title",
      text: productName.slice(0, 50),
      style: "chunk",
      color: "#ffffff",
      size: "large",
      background: "#00000080",
      position: "top",
    },
    start: 0,
    length: 4,
    transition: { in: "slideDown", out: "slideUp" },
  };

  const priceClip = {
    asset: {
      type: "title",
      text: `Only ₹${price}!`,
      style: "chunk",
      color: "#FFD700",
      size: "medium",
      background: "#00000080",
      position: "top",
    },
    start: 4,
    length: 3,
    transition: { in: "slideDown", out: "slideUp" },
  };

  const ctaClip = {
    asset: {
      type: "title",
      text: "🛒 Shop Now! Link in Bio",
      style: "chunk",
      color: "#ffffff",
      size: "medium",
      background: "#6366F1",
      position: "bottom",
    },
    start: duration - 5,
    length: 5,
    transition: { in: "slideUp" },
  };

  const captionLines = caption.slice(0, 80);
  const captionClip = {
    asset: {
      type: "title",
      text: captionLines,
      style: "minimal",
      color: "#ffffff",
      size: "small",
      background: "#00000060",
      position: "bottom",
    },
    start: 8,
    length: duration - 13,
  };

  return {
    soundtrack: buildSoundtrack(req.musicMood ?? "upbeat"),
    background: "#000000",
    tracks: [
      { clips: imageClips },
      { clips: [titleClip, priceClip, ctaClip, captionClip] },
    ],
  };
}

function buildOutput(platform: VideoGenerationRequest["platform"]) {
  // Both Reels and Shorts are vertical 9:16
  return {
    format: "mp4",
    resolution: "hd",
    aspectRatio: "9:16",
    fps: 30,
  };
}

function buildSoundtrack(mood: "upbeat" | "calm" | "energetic") {
  const tracks = {
    upbeat:
      "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/music/unminus/palmtrees.mp3",
    calm: "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/music/unminus/ambisonic.mp3",
    energetic:
      "https://shotstack-assets.s3.ap-southeast-2.amazonaws.com/music/unminus/lit.mp3",
  };
  return {
    src: tracks[mood],
    effect: "fadeInFadeOut",
    volume: 0.4,
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.response?.error ??
      err.response?.data?.message ??
      err.message
    );
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
