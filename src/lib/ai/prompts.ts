interface ProductInfo {
  name: string;
  description: string;
  originalPrice: number;
  sellingPrice: number;
  category: string;
  tags: string[];
}

export function instagramCaptionPrompt(product: ProductInfo, tone: string): string {
  return `Generate an engaging Instagram caption for this product:

Product: ${product.name}
Description: ${product.description}
Price: ₹${product.sellingPrice}
Category: ${product.category}
Tags: ${product.tags.join(", ")}

Tone: ${tone}

Requirements:
- Start with a strong hook (first line must grab attention)
- Use relevant emojis naturally
- Include a clear call-to-action (e.g., "Link in bio", "Shop now")
- Create urgency (limited stock, trending, etc.)
- Add 3-5 relevant hashtags at the end
- Keep it under 300 words
- Use ₹ for prices
- Make it feel authentic and engaging, not salesy`;
}

export function instagramReelPrompt(product: ProductInfo, tone: string): string {
  return `Write a 30-60 second Instagram Reel script for this product:

Product: ${product.name}
Description: ${product.description}
Price: ₹${product.sellingPrice}
Category: ${product.category}

Tone: ${tone}

Format the script as:
HOOK (0-3 sec): [Attention-grabbing opening]
SCENE 1 (3-15 sec): [Product introduction]
SCENE 2 (15-30 sec): [Key features/benefits]
SCENE 3 (30-45 sec): [Social proof or demonstration]
CTA (45-60 sec): [Call to action]

CAPTION: [Short caption with emojis]
HASHTAGS: [5-7 relevant hashtags]

Also include:
- Suggested background music mood
- Text overlay suggestions for each scene
- Transition suggestions`;
}

export function instagramCarouselPrompt(product: ProductInfo, tone: string): string {
  return `Create a 7-slide Instagram carousel for this product:

Product: ${product.name}
Description: ${product.description}
Price: ₹${product.sellingPrice}
Category: ${product.category}

Tone: ${tone}

Format each slide as:
SLIDE 1 (Cover): [Hook headline that makes people swipe]
SLIDE 2: [Problem statement]
SLIDE 3: [Product introduction as solution]
SLIDE 4: [Key feature 1 with benefit]
SLIDE 5: [Key feature 2 with benefit]
SLIDE 6: [Social proof / testimonial style]
SLIDE 7 (CTA): [Final call to action with price]

For each slide include:
- Headline text (large, bold)
- Supporting text (smaller)
- Suggested visual/background

Also provide:
CAPTION: [Engaging caption with emojis]
HASHTAGS: [5-7 relevant hashtags]`;
}

export function youtubeScriptPrompt(product: ProductInfo, tone: string): string {
  return `Write a YouTube video script for reviewing/promoting this product:

Product: ${product.name}
Description: ${product.description}
Price: ₹${product.sellingPrice}
Category: ${product.category}

Tone: ${tone}

Format:
TITLE: [SEO-optimized, clickworthy title under 60 chars]
DESCRIPTION: [YouTube description with keywords, 150 words]
TAGS: [10-15 relevant tags]

SCRIPT:

INTRO (0-30 sec):
[Hook the viewer, introduce the product]

SECTION 1 - Overview (30 sec - 2 min):
[Product unboxing/first look]

SECTION 2 - Features (2 - 4 min):
[Detailed feature walkthrough]

SECTION 3 - Benefits (4 - 5 min):
[Who should buy this and why]

SECTION 4 - Pricing (5 - 6 min):
[Value for money analysis]

OUTRO (6 - 7 min):
[Final verdict + CTA to check link in description]

Include speaking directions and emphasis notes.`;
}

export function youtubeShortsPrompt(product: ProductInfo, tone: string): string {
  return `Write a 30-60 second YouTube Shorts script for this product:

Product: ${product.name}
Price: ₹${product.sellingPrice}
Category: ${product.category}
Description: ${product.description}

Tone: ${tone}

Format:
TITLE: [Catchy short title]

HOOK (0-3 sec): [Stop-scrolling opening line]
BODY (3-25 sec): [Quick product showcase with key points]
CTA (25-30 sec): [Call to action]

TEXT OVERLAYS: [Text to show on screen at key moments]
DESCRIPTION: [Short description with hashtags]

Make it fast-paced, engaging, and optimized for vertical video.`;
}

export function hashtagPrompt(product: ProductInfo, platform: string): string {
  return `Generate 25-30 relevant hashtags for promoting this product on ${platform}:

Product: ${product.name}
Category: ${product.category}
Tags: ${product.tags.join(", ")}
Price Range: ₹${product.sellingPrice}

Group them by:
HIGH VOLUME (10): [Popular hashtags with millions of posts]
MEDIUM VOLUME (10): [Moderately popular, better reach]
NICHE (5-10): [Specific hashtags with less competition]

Format each hashtag with # prefix. No explanations needed, just the hashtags grouped by category.`;
}

export function productDescriptionPrompt(product: ProductInfo, tone: string): string {
  return `Write an SEO-optimized product description for an e-commerce listing:

Product: ${product.name}
Original Description: ${product.description}
Price: ₹${product.sellingPrice}
Category: ${product.category}
Tags: ${product.tags.join(", ")}

Tone: ${tone}

Format:
HEADLINE: [Attention-grabbing product headline]

SHORT DESCRIPTION (50 words):
[Quick overview for above-the-fold]

FULL DESCRIPTION (200-300 words):
[Detailed description with features, benefits, and use cases]

KEY FEATURES:
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Feature 4]
- [Feature 5]

SEO KEYWORDS: [10 relevant keywords]

Make it compelling, benefit-focused, and optimized for search engines.`;
}
