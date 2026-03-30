import { google } from "googleapis";
import { Readable } from "stream";
import axios from "axios";

const youtube = google.youtube("v3");

export interface YouTubeUploadResult {
  success: boolean;
  videoId?: string;
  videoUrl?: string;
  error?: string;
}

/**
 * Create an OAuth2 client from stored tokens.
 */
function createOAuthClient(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/social/youtube/callback`
  );
  client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  return client;
}

/**
 * Upload a YouTube Short (or regular video).
 * videoUrl must be a publicly accessible .mp4 URL.
 * Add "#Shorts" to title/description to qualify as a Short.
 */
export async function uploadYouTubeShort(params: {
  videoUrl: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl?: string;
  accessToken: string;
  refreshToken: string;
}): Promise<YouTubeUploadResult> {
  const { videoUrl, title, description, tags, thumbnailUrl, accessToken, refreshToken } =
    params;

  try {
    const auth = createOAuthClient({ accessToken, refreshToken });

    // Download the video from URL into a buffer/stream
    const videoResponse = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      timeout: 120000,
    });
    const videoBuffer = Buffer.from(videoResponse.data);
    const videoStream = bufferToStream(videoBuffer);

    // Shorts title must include #Shorts OR be < 60 seconds vertical
    const shortTitle = title.includes("#Shorts") ? title : `${title} #Shorts`;
    const shortDesc = `${description}\n\n#Shorts #Dropshipping #ProductReview`;

    const res = await youtube.videos.insert(
      {
        auth,
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: shortTitle.slice(0, 100),
            description: shortDesc.slice(0, 5000),
            tags: [...tags, "Shorts", "dropshipping", "products"].slice(0, 500),
            categoryId: "22", // People & Blogs
            defaultLanguage: "en",
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          mimeType: "video/mp4",
          body: videoStream,
        },
      },
      {
        onUploadProgress: (evt) => {
          const progress = (evt.bytesRead / videoBuffer.length) * 100;
          console.log(`[YouTube Upload] Progress: ${Math.round(progress)}%`);
        },
      }
    );

    const videoId = res.data?.id;
    if (!videoId) throw new Error("No video ID returned from YouTube");

    // Set thumbnail if provided
    if (thumbnailUrl) {
      await setYouTubeThumbnail(videoId, thumbnailUrl, auth);
    }

    return {
      success: true,
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (err: unknown) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Set a custom thumbnail for a YouTube video.
 */
async function setYouTubeThumbnail(
  videoId: string,
  thumbnailUrl: string,
  auth: ReturnType<typeof createOAuthClient>
) {
  try {
    const thumbResponse = await axios.get(thumbnailUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    const thumbBuffer = Buffer.from(thumbResponse.data);
    const thumbStream = bufferToStream(thumbBuffer);

    await youtube.thumbnails.set({
      auth,
      videoId,
      media: {
        mimeType: "image/jpeg",
        body: thumbStream,
      },
    });
  } catch (err) {
    console.error("[YouTube] Failed to set thumbnail:", err);
  }
}

/**
 * Generate the Google OAuth2 URL for YouTube authorization.
 */
export function getYouTubeAuthUrl(): string {
  const client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/social/youtube/callback`
  );
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
    prompt: "consent",
  });
}

/**
 * Exchange an auth code for tokens after OAuth2 callback.
 */
export async function exchangeYouTubeCode(code: string) {
  const client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/social/youtube/callback`
  );
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Get channel info
  const channelRes = await youtube.channels.list({
    auth: client,
    part: ["snippet"],
    mine: true,
  });
  const channel = channelRes.data.items?.[0];

  return {
    accessToken: tokens.access_token ?? "",
    refreshToken: tokens.refresh_token ?? "",
    tokenExpiry: tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : undefined,
    channelId: channel?.id ?? "",
    channelName: channel?.snippet?.title ?? "",
  };
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
