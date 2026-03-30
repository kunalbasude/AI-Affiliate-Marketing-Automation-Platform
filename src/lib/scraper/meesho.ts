import axios from "axios";
import * as cheerio from "cheerio";
import type { ScrapedProduct } from "@/types";

const MEESHO_BASE = "https://www.meesho.com";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Cache-Control": "no-cache",
  Referer: "https://www.meesho.com/",
};

const MEESHO_API_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-IN,en;q=0.9",
  "Content-Type": "application/json",
  Origin: "https://www.meesho.com",
  Referer: "https://www.meesho.com/",
};

// Category mapping from Meesho categories to our internal categories
const CATEGORY_MAP: Record<string, string> = {
  "women-kurtas": "Fashion",
  "men-tshirts": "Fashion",
  "sarees": "Fashion",
  "leggings": "Fashion",
  "kurtis": "Fashion",
  "mobile-accessories": "Electronics",
  "home-decor": "Home & Kitchen",
  "kitchen-storage": "Home & Kitchen",
  "beauty": "Beauty",
  "skin-care": "Beauty",
  "health-personal-care": "Health",
  "toys-games": "Toys",
  "sports-fitness": "Sports",
};

interface MeeshoApiProduct {
  id: string;
  name: string;
  price: { mrp: number; sp: number };
  images: Array<{ url: string }>;
  category: string;
  supplier_name?: string;
  rating?: number;
  num_orders?: number;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch trending products from Meesho's internal search/discovery API.
 * Falls back to HTML scraping if API fails.
 */
export async function scrapeMeeshoTrending(options: {
  categories?: string[];
  minRating?: number;
  minOrders?: number;
  maxProducts?: number;
}): Promise<ScrapedProduct[]> {
  const {
    categories = ["women-kurtas", "home-decor", "beauty", "mobile-accessories"],
    minRating = 3.5,
    minOrders = 100,
    maxProducts = 20,
  } = options;

  const results: ScrapedProduct[] = [];

  for (const category of categories) {
    if (results.length >= maxProducts) break;

    try {
      const products = await scrapeCategoryProducts(category, minRating, minOrders);
      results.push(...products.slice(0, maxProducts - results.length));
      await sleep(1500 + Math.random() * 1000); // polite rate limiting
    } catch (err) {
      console.error(`[Meesho Scraper] Failed category ${category}:`, err);
    }
  }

  return results.slice(0, maxProducts);
}

async function scrapeCategoryProducts(
  category: string,
  minRating: number,
  minOrders: number
): Promise<ScrapedProduct[]> {
  // Try Meesho's internal catalog API first
  try {
    const response = await axios.post(
      "https://www.meesho.com/api/v2/catalog_items/search",
      {
        query: "",
        page: 1,
        sortOrder: "POPULARITY",
        filters: { category: [category] },
        pageSize: 40,
      },
      { headers: MEESHO_API_HEADERS, timeout: 15000 }
    );

    const items: MeeshoApiProduct[] = response.data?.data?.catalog_items ?? [];
    return items
      .filter(
        (item) =>
          (item.rating ?? 0) >= minRating && (item.num_orders ?? 0) >= minOrders
      )
      .map((item) => normalizeApiProduct(item, category));
  } catch {
    // API failed — fall back to HTML scraping
    return scrapeHtmlPage(category, minRating, minOrders);
  }
}

async function scrapeHtmlPage(
  category: string,
  minRating: number,
  minOrders: number
): Promise<ScrapedProduct[]> {
  const url = `${MEESHO_BASE}/${category}`;
  const response = await axios.get(url, {
    headers: BROWSER_HEADERS,
    timeout: 20000,
  });

  const $ = cheerio.load(response.data);
  const products: ScrapedProduct[] = [];

  // Meesho renders product cards with data attributes in JSON script tags
  $("script[type='application/json']").each((_, el) => {
    try {
      const json = JSON.parse($(el).html() ?? "{}");
      const items: MeeshoApiProduct[] =
        json?.props?.pageProps?.catalogData?.catalog_items ?? [];

      for (const item of items) {
        if ((item.rating ?? 0) < minRating || (item.num_orders ?? 0) < minOrders) continue;
        products.push(normalizeApiProduct(item, category));
      }
    } catch {
      // ignore malformed JSON
    }
  });

  // If no JSON script data, try to parse product cards directly
  if (products.length === 0) {
    $("[data-testid='product-card'], .ProductCard, [class*='product-card']").each(
      (_, el) => {
        const name = $(el).find("[class*='product-title'], h3, h4").first().text().trim();
        const priceText = $(el).find("[class*='price'], .price").first().text().replace(/[^\d.]/g, "");
        const imgSrc =
          $(el).find("img").first().attr("data-src") ??
          $(el).find("img").first().attr("src") ??
          "";
        const ratingText = $(el).find("[class*='rating']").first().text().replace(/[^\d.]/g, "");
        const ordersText = $(el).find("[class*='orders'], [class*='sold']").first().text();
        const ordersNum = extractOrderCount(ordersText);
        const rating = parseFloat(ratingText) || 0;
        const price = parseFloat(priceText) || 0;

        if (!name || price === 0) return;
        if (rating < minRating || ordersNum < minOrders) return;

        const productUrl = $(el).find("a").first().attr("href") ?? "";
        const fullUrl = productUrl.startsWith("http")
          ? productUrl
          : `${MEESHO_BASE}${productUrl}`;
        const id = extractProductIdFromUrl(fullUrl);

        products.push({
          name,
          description: `${name} - Available on Meesho. High quality product with ${ordersNum}+ orders.`,
          originalPrice: price,
          imageURL: normalizeImageUrl(imgSrc),
          images: imgSrc ? [normalizeImageUrl(imgSrc)] : [],
          category: CATEGORY_MAP[category] ?? "Other",
          tags: generateTags(name, category),
          rating,
          totalOrders: ordersNum,
          meeshoProductId: id,
          meeshoUrl: fullUrl,
          supplier: "Meesho Supplier",
        });
      }
    );
  }

  return products;
}

function normalizeApiProduct(item: MeeshoApiProduct, category: string): ScrapedProduct {
  const images = (item.images ?? []).map((img) => normalizeImageUrl(img.url)).filter(Boolean);
  return {
    name: item.name ?? "Product",
    description: `${item.name} - High quality product with ${item.num_orders ?? 0}+ orders and ${item.rating ?? 0} star rating.`,
    originalPrice: item.price?.sp ?? item.price?.mrp ?? 0,
    imageURL: images[0] ?? "",
    images,
    category: CATEGORY_MAP[category] ?? "Other",
    tags: generateTags(item.name ?? "", category),
    rating: item.rating ?? 0,
    totalOrders: item.num_orders ?? 0,
    meeshoProductId: item.id ?? "",
    meeshoUrl: `${MEESHO_BASE}/product/${item.id}`,
    supplier: item.supplier_name ?? "Meesho Supplier",
  };
}

function extractOrderCount(text: string): number {
  if (!text) return 0;
  const normalized = text.toLowerCase();
  const match = normalized.match(/([\d.]+)\s*([kKlLm]?)/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2]?.toLowerCase();
  if (suffix === "k") return Math.floor(num * 1000);
  if (suffix === "l") return Math.floor(num * 100000);
  if (suffix === "m") return Math.floor(num * 1000000);
  return Math.floor(num);
}

function extractProductIdFromUrl(url: string): string {
  const match = url.match(/\/([a-zA-Z0-9-]+)(?:\?|$)/);
  return match?.[1] ?? Math.random().toString(36).slice(2);
}

function normalizeImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  return `https://www.meesho.com${url}`;
}

function generateTags(name: string, category: string): string[] {
  const words = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const catTag = CATEGORY_MAP[category]?.toLowerCase().replace(/\s/g, "-") ?? category;
  return [...new Set([...words.slice(0, 5), catTag, "meesho", "dropshipping"])];
}

/**
 * Scrape a single product's detail page for more info.
 */
export async function scrapeMeeshoProductDetail(meeshoUrl: string): Promise<Partial<ScrapedProduct>> {
  try {
    const response = await axios.get(meeshoUrl, {
      headers: BROWSER_HEADERS,
      timeout: 15000,
    });
    const $ = cheerio.load(response.data);

    const description =
      $("[class*='product-description'], [class*='ProductDescription']").first().text().trim() ||
      $("meta[name='description']").attr("content") ||
      "";

    const allImages: string[] = [];
    $("img[class*='product'], [class*='ProductImage'] img").each((_, el) => {
      const src =
        $(el).attr("data-src") ??
        $(el).attr("src") ??
        "";
      if (src) allImages.push(normalizeImageUrl(src));
    });

    return { description, images: [...new Set(allImages)] };
  } catch {
    return {};
  }
}
