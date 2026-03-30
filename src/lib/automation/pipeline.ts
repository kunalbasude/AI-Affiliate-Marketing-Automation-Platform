/**
 * Main Dropshipping Automation Pipeline
 *
 * Flow:
 *  1. Scrape viral products from Meesho
 *  2. Save products to Firestore (auto-published to store)
 *  3. Generate AI content (caption + reel script) for each product
 *  4. Generate product video via Shotstack
 *  5. Post reel to Instagram
 *  6. Upload Short to YouTube
 *  7. Track run stats in Firestore
 */

import { scrapeMeeshoTrending } from "@/lib/scraper/meesho";
import { generateProductVideo, pollRenderStatus } from "@/lib/video/generator";
import { postInstagramReel, postInstagramImage } from "@/lib/social/instagram";
import { uploadYouTubeShort } from "@/lib/social/youtube";
import type { AutomationSettings, AutomationRun, SocialAccount } from "@/types";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface PipelineContext {
  uid: string;
  settings: AutomationSettings;
  socialAccounts: SocialAccount[];
  /** Firestore admin instance passed in to avoid circular imports */
  adminDb: FirebaseFirestore.Firestore;
}

export interface PipelineResult {
  runId: string;
  stats: AutomationRun["stats"];
  errors: string[];
}

export async function runAutomationPipeline(ctx: PipelineContext): Promise<PipelineResult> {
  const { uid, settings, socialAccounts, adminDb } = ctx;
  const runId = `run_${Date.now()}`;
  const stats: AutomationRun["stats"] = {
    productsScraped: 0,
    productsAdded: 0,
    contentGenerated: 0,
    videosCreated: 0,
    instagramPosted: 0,
    youtubeUploaded: 0,
    errors: 0,
  };
  const errors: string[] = [];

  // ─── 1. Scrape Meesho ─────────────────────────────────────────────────────
  console.log("[Pipeline] Step 1: Scraping Meesho products...");
  let scrapedProducts: Awaited<ReturnType<typeof scrapeMeeshoTrending>> = [];
  try {
    scrapedProducts = await scrapeMeeshoTrending({
      categories: settings.categories.length > 0 ? settings.categories : undefined,
      minRating: settings.minRating,
      minOrders: settings.minOrders,
      maxProducts: settings.maxProductsPerRun,
    });
    stats.productsScraped = scrapedProducts.length;
    console.log(`[Pipeline] Scraped ${scrapedProducts.length} products`);
  } catch (err) {
    const msg = `Scraping failed: ${extractError(err)}`;
    errors.push(msg);
    stats.errors++;
    console.error("[Pipeline]", msg);
  }

  if (scrapedProducts.length === 0) {
    await saveRunRecord(adminDb, uid, runId, "failed", stats, errors);
    return { runId, stats, errors };
  }

  const instagramAccount = socialAccounts.find((a) => a.platform === "instagram");
  const youtubeAccount = socialAccounts.find((a) => a.platform === "youtube");
  const addedProductIds: string[] = [];

  // ─── Per-product processing ───────────────────────────────────────────────
  for (const product of scrapedProducts) {
    try {
      // ── 2. Save product to Firestore ────────────────────────────────────
      const productData = {
        name: product.name,
        description: product.description,
        category: product.category,
        originalPrice: product.originalPrice,
        marginPercent: settings.priceMarginPercent,
        sellingPrice: Math.ceil(product.originalPrice * (1 + settings.priceMarginPercent / 100)),
        affiliateLink: product.meeshoUrl,
        imageURL: product.imageURL,
        images: product.images,
        isPublished: settings.autoPublishToStore,
        tags: product.tags,
        sourcePlatform: "meesho",
        commissionRate: 0,
      };

      const productRef = await adminDb
        .collection(`users/${uid}/products`)
        .add({
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      const productId = productRef.id;
      addedProductIds.push(productId);
      stats.productsAdded++;

      if (!settings.autoGenerateContent) continue;

      // ── 3. Generate AI caption ──────────────────────────────────────────
      const caption = await generateCaption(product.name, product.description, product.originalPrice, settings.contentTone);
      stats.contentGenerated++;

      // ── 4. Generate video ───────────────────────────────────────────────
      let videoUrl: string | undefined;
      let thumbnailUrl: string | undefined;

      try {
        const videoJob = await generateProductVideo({
          productName: product.name,
          productDescription: product.description,
          imageUrls: product.images.slice(0, 5),
          price: String(productData.sellingPrice),
          caption,
          platform: "instagram_reel",
          musicMood: "upbeat",
        });

        if (videoJob.success && videoJob.renderId) {
          const rendered = await pollRenderStatus(videoJob.renderId);
          if (rendered.success) {
            videoUrl = rendered.videoUrl;
            thumbnailUrl = rendered.thumbnailUrl;
            stats.videosCreated++;

            // Save video job to Firestore
            await adminDb.collection(`users/${uid}/videoJobs`).add({
              productId,
              productName: product.name,
              status: "completed",
              videoUrl,
              thumbnailUrl,
              platform: "instagram_reel",
              shotStackRenderId: videoJob.renderId,
              createdAt: new Date(),
              completedAt: new Date(),
            });
          }
        }
      } catch (videoErr) {
        errors.push(`Video generation failed for "${product.name}": ${extractError(videoErr)}`);
        stats.errors++;
      }

      // ── 5. Post to Instagram ────────────────────────────────────────────
      if (settings.autoPostInstagram && instagramAccount?.connected) {
        try {
          let igResult;
          if (videoUrl) {
            igResult = await postInstagramReel({
              videoUrl,
              caption: `${caption}\n\n${product.tags.map((t: string) => `#${t}`).join(" ")}`,
              coverImageUrl: thumbnailUrl,
              igUserId: instagramAccount.accountId,
              accessToken: instagramAccount.accessToken,
            });
          } else {
            // Fall back to image post
            igResult = await postInstagramImage({
              imageUrl: product.imageURL,
              caption: `${caption}\n\n${product.tags.map((t: string) => `#${t}`).join(" ")}`,
              igUserId: instagramAccount.accountId,
              accessToken: instagramAccount.accessToken,
            });
          }

          if (igResult.success) {
            stats.instagramPosted++;
            await adminDb.collection(`users/${uid}/socialPosts`).add({
              platform: "instagram",
              productId,
              postId: igResult.postId ?? null,
              permalink: igResult.permalink ?? null,
              caption,
              postedAt: new Date(),
            });
          } else {
            errors.push(`Instagram post failed for "${product.name}": ${igResult.error}`);
            stats.errors++;
          }
        } catch (igErr) {
          errors.push(`Instagram error for "${product.name}": ${extractError(igErr)}`);
          stats.errors++;
        }
      }

      // ── 6. Upload YouTube Short ─────────────────────────────────────────
      if (settings.autoUploadYoutube && youtubeAccount?.connected && videoUrl) {
        try {
          const ytResult = await uploadYouTubeShort({
            videoUrl,
            title: `${product.name} - Best Deal! #Shorts`,
            description: `${caption}\n\nShop Now: ${product.meeshoUrl}\n\n#Shorts #Dropshipping #Products #Shopping`,
            tags: product.tags,
            thumbnailUrl,
            accessToken: youtubeAccount.accessToken,
            refreshToken: youtubeAccount.refreshToken ?? "",
          });

          if (ytResult.success) {
            stats.youtubeUploaded++;
            await adminDb.collection(`users/${uid}/socialPosts`).add({
              platform: "youtube",
              productId,
              postId: ytResult.videoId,
              videoUrl: ytResult.videoUrl,
              title: `${product.name} #Shorts`,
              postedAt: new Date(),
            });
          } else {
            errors.push(`YouTube upload failed for "${product.name}": ${ytResult.error}`);
            stats.errors++;
          }
        } catch (ytErr) {
          errors.push(`YouTube error for "${product.name}": ${extractError(ytErr)}`);
          stats.errors++;
        }
      }

      // Rate limiting — avoid API bans
      await sleep(2000);
    } catch (productErr) {
      errors.push(`Product processing failed for "${product.name}": ${extractError(productErr)}`);
      stats.errors++;
    }
  }

  // ─── 7. Save run record ───────────────────────────────────────────────────
  const finalStatus =
    errors.length === 0
      ? "completed"
      : stats.productsAdded > 0
      ? "partial"
      : "failed";

  await saveRunRecord(adminDb, uid, runId, finalStatus, stats, errors, addedProductIds);

  console.log("[Pipeline] Done.", stats);
  return { runId, stats, errors };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateCaption(
  name: string,
  description: string,
  price: number,
  tone: string
): Promise<string> {
  const prompt = `Write a short, punchy Instagram/YouTube caption for this product.
Product: ${name}
Description: ${description.slice(0, 200)}
Price: ₹${price}
Tone: ${tone}

Requirements:
- 2-3 sentences max
- Include an emoji
- End with a call-to-action (e.g. "Link in bio!")
- No hashtags (added separately)
Return only the caption text.`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });
  return (response.content[0] as { text: string }).text.trim();
}

async function saveRunRecord(
  adminDb: FirebaseFirestore.Firestore,
  uid: string,
  runId: string,
  status: AutomationRun["status"],
  stats: AutomationRun["stats"],
  errors: string[],
  productIds: string[] = []
) {
  await adminDb.collection(`users/${uid}/automationRuns`).doc(runId).set({
    id: runId,
    status,
    startedAt: new Date(),
    completedAt: new Date(),
    stats,
    errors: errors.slice(0, 50), // cap stored errors
    productIds,
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
