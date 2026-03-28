import { getAIClient } from "./client";
import {
  instagramCaptionPrompt,
  instagramReelPrompt,
  instagramCarouselPrompt,
  youtubeScriptPrompt,
  youtubeShortsPrompt,
  hashtagPrompt,
  productDescriptionPrompt,
} from "./prompts";
import type { ContentType } from "@/types";

interface ProductInfo {
  name: string;
  description: string;
  originalPrice: number;
  sellingPrice: number;
  category: string;
  tags: string[];
}

const promptMap: Record<string, (product: ProductInfo, toneOrPlatform: string) => string> = {
  instagram_caption: instagramCaptionPrompt,
  instagram_reel: instagramReelPrompt,
  instagram_carousel: instagramCarouselPrompt,
  youtube_script: youtubeScriptPrompt,
  youtube_shorts: youtubeShortsPrompt,
  hashtags: hashtagPrompt,
  product_description: productDescriptionPrompt,
};

export async function generateContent(
  type: ContentType,
  product: ProductInfo,
  toneOrPlatform: string,
  customInstructions?: string
): Promise<string> {
  const promptFn = promptMap[type];
  if (!promptFn) {
    throw new Error(`Unknown content type: ${type}`);
  }

  let prompt = promptFn(product, toneOrPlatform);

  if (customInstructions) {
    prompt += `\n\nAdditional instructions: ${customInstructions}`;
  }

  const client = getAIClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  return textBlock.text;
}
