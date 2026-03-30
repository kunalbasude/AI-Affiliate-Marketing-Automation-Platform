import axios from "axios";

const GRAPH_API = "https://graph.facebook.com/v19.0";

export interface InstagramPostResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

/**
 * Post a single image to Instagram via Graph API.
 * Requires: Instagram Business Account connected to a Facebook Page.
 * Env vars needed:  INSTAGRAM_ACCOUNT_ID, INSTAGRAM_ACCESS_TOKEN
 */
export async function postInstagramImage(params: {
  imageUrl: string;
  caption: string;
  igUserId: string;
  accessToken: string;
}): Promise<InstagramPostResult> {
  const { imageUrl, caption, igUserId, accessToken } = params;
  try {
    // Step 1: Create media container
    const containerRes = await axios.post(
      `${GRAPH_API}/${igUserId}/media`,
      null,
      {
        params: {
          image_url: imageUrl,
          caption,
          access_token: accessToken,
        },
      }
    );
    const containerId: string = containerRes.data?.id;
    if (!containerId) throw new Error("No container ID returned");

    // Step 2: Publish the container
    await waitForContainerReady(containerId, accessToken);
    const publishRes = await axios.post(
      `${GRAPH_API}/${igUserId}/media_publish`,
      null,
      {
        params: {
          creation_id: containerId,
          access_token: accessToken,
        },
      }
    );

    const postId: string = publishRes.data?.id;
    const permalink = await getPermalink(postId, accessToken);
    return { success: true, postId, permalink };
  } catch (err: unknown) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Post a Reel to Instagram.
 * videoUrl must be a publicly accessible URL to a .mp4 file.
 */
export async function postInstagramReel(params: {
  videoUrl: string;
  caption: string;
  coverImageUrl?: string;
  igUserId: string;
  accessToken: string;
}): Promise<InstagramPostResult> {
  const { videoUrl, caption, coverImageUrl, igUserId, accessToken } = params;
  try {
    // Step 1: Create reel container
    const containerParams: Record<string, string> = {
      media_type: "REELS",
      video_url: videoUrl,
      caption,
      share_to_feed: "true",
      access_token: accessToken,
    };
    if (coverImageUrl) containerParams.cover_url = coverImageUrl;

    const containerRes = await axios.post(
      `${GRAPH_API}/${igUserId}/media`,
      null,
      { params: containerParams }
    );
    const containerId: string = containerRes.data?.id;
    if (!containerId) throw new Error("No reel container ID returned");

    // Step 2: Wait for video to be ready
    await waitForContainerReady(containerId, accessToken, 30, 5000);

    // Step 3: Publish
    const publishRes = await axios.post(
      `${GRAPH_API}/${igUserId}/media_publish`,
      null,
      {
        params: {
          creation_id: containerId,
          access_token: accessToken,
        },
      }
    );

    const postId: string = publishRes.data?.id;
    const permalink = await getPermalink(postId, accessToken);
    return { success: true, postId, permalink };
  } catch (err: unknown) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Post a carousel (multiple images) to Instagram.
 */
export async function postInstagramCarousel(params: {
  imageUrls: string[];
  caption: string;
  igUserId: string;
  accessToken: string;
}): Promise<InstagramPostResult> {
  const { imageUrls, caption, igUserId, accessToken } = params;
  try {
    // Step 1: Create a media container for each image
    const childIds: string[] = [];
    for (const imageUrl of imageUrls.slice(0, 10)) {
      const res = await axios.post(`${GRAPH_API}/${igUserId}/media`, null, {
        params: {
          image_url: imageUrl,
          is_carousel_item: "true",
          access_token: accessToken,
        },
      });
      if (res.data?.id) childIds.push(res.data.id);
    }
    if (childIds.length === 0) throw new Error("No carousel children created");

    // Step 2: Create carousel container
    const carouselRes = await axios.post(
      `${GRAPH_API}/${igUserId}/media`,
      null,
      {
        params: {
          media_type: "CAROUSEL",
          children: childIds.join(","),
          caption,
          access_token: accessToken,
        },
      }
    );
    const containerId: string = carouselRes.data?.id;
    if (!containerId) throw new Error("No carousel container ID returned");

    // Step 3: Publish
    await waitForContainerReady(containerId, accessToken);
    const publishRes = await axios.post(
      `${GRAPH_API}/${igUserId}/media_publish`,
      null,
      {
        params: {
          creation_id: containerId,
          access_token: accessToken,
        },
      }
    );

    const postId: string = publishRes.data?.id;
    const permalink = await getPermalink(postId, accessToken);
    return { success: true, postId, permalink };
  } catch (err: unknown) {
    return { success: false, error: extractErrorMessage(err) };
  }
}

/**
 * Poll until a media container status is FINISHED or PUBLISHED.
 */
async function waitForContainerReady(
  containerId: string,
  accessToken: string,
  maxAttempts = 12,
  intervalMs = 3000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(intervalMs);
    const res = await axios.get(`${GRAPH_API}/${containerId}`, {
      params: {
        fields: "status_code,status",
        access_token: accessToken,
      },
    });
    const code: string = res.data?.status_code;
    if (code === "FINISHED" || code === "PUBLISHED") return;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(`Container failed with status: ${code}`);
    }
  }
  throw new Error("Media container timed out");
}

async function getPermalink(postId: string, accessToken: string): Promise<string> {
  try {
    const res = await axios.get(`${GRAPH_API}/${postId}`, {
      params: { fields: "permalink", access_token: accessToken },
    });
    return res.data?.permalink ?? "";
  } catch {
    return "";
  }
}

/**
 * Verify the access token and return the connected IG account info.
 */
export async function getInstagramAccountInfo(accessToken: string) {
  const res = await axios.get(`${GRAPH_API}/me/accounts`, {
    params: { fields: "id,name,instagram_business_account", access_token: accessToken },
  });

  const pages = res.data?.data ?? [];
  const accounts = pages
    .filter((p: Record<string, unknown>) => p.instagram_business_account)
    .map((p: Record<string, unknown>) => ({
      pageId: p.id,
      pageName: p.name,
      igUserId: (p.instagram_business_account as Record<string, unknown>)?.id,
    }));

  return accounts;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error?.message ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
