import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  plan: "free" | "pro";
  storeSettings: StoreSettings;
  aiUsage: {
    generationsThisMonth: number;
    lastResetDate: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StoreSettings {
  storeName: string;
  bio: string;
  accentColor: string;
  logoURL?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  originalPrice: number;
  marginPercent: number;
  sellingPrice: number;
  affiliateLink: string;
  imageURL: string;
  images: string[];
  isPublished: boolean;
  tags: string[];
  sourcePlatform: string;
  commissionRate: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Content {
  id: string;
  productId: string;
  productName: string;
  type: ContentType;
  platform: Platform;
  tone: Tone;
  generatedText: string;
  editedText?: string;
  isScheduled: boolean;
  aiModel: string;
  createdAt: Timestamp;
}

export interface Schedule {
  id: string;
  contentId: string;
  productId: string;
  productName: string;
  platform: Platform;
  caption: string;
  scheduledAt: Timestamp;
  status: ScheduleStatus;
  notes?: string;
  createdAt: Timestamp;
}

export interface DailyAnalytics {
  date: string;
  totalClicks: number;
  totalViews: number;
  clicksByProduct: Record<string, number>;
  viewsByProduct: Record<string, number>;
  referrers: Record<string, number>;
}

export type ContentType =
  | "instagram_caption"
  | "instagram_reel"
  | "instagram_carousel"
  | "youtube_script"
  | "youtube_shorts"
  | "hashtags"
  | "product_description";

export type Platform = "instagram" | "youtube" | "twitter" | "facebook";

export type Tone =
  | "professional"
  | "casual"
  | "humorous"
  | "urgent"
  | "luxury"
  | "friendly";

export type ScheduleStatus = "scheduled" | "posted" | "missed" | "cancelled";

export interface PlanLimits {
  maxProducts: number;
  maxGenerationsPerMonth: number;
  maxScheduledPosts: number;
}

export const PLAN_LIMITS: Record<"free" | "pro", PlanLimits> = {
  free: {
    maxProducts: 10,
    maxGenerationsPerMonth: 20,
    maxScheduledPosts: 5,
  },
  pro: {
    maxProducts: Infinity,
    maxGenerationsPerMonth: 500,
    maxScheduledPosts: Infinity,
  },
};

export const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Health",
  "Sports",
  "Books",
  "Toys",
  "Automotive",
  "Garden",
  "Other",
] as const;

export const PLATFORMS: Platform[] = ["instagram", "youtube", "twitter", "facebook"];

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "instagram_caption", label: "Instagram Caption" },
  { value: "instagram_reel", label: "Instagram Reel Script" },
  { value: "instagram_carousel", label: "Instagram Carousel" },
  { value: "youtube_script", label: "YouTube Script" },
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "hashtags", label: "Hashtags" },
  { value: "product_description", label: "Product Description" },
];

export const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "humorous", label: "Humorous" },
  { value: "urgent", label: "Urgent / FOMO" },
  { value: "luxury", label: "Luxury / Premium" },
  { value: "friendly", label: "Friendly" },
];

// ─── Dropshipping / Automation Types ─────────────────────────────────────────

export interface ScrapedProduct {
  name: string;
  description: string;
  originalPrice: number;
  imageURL: string;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  totalOrders: number;
  meeshoProductId: string;
  meeshoUrl: string;
  supplier: string;
}

export interface SocialAccount {
  platform: "instagram" | "youtube";
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: string;
  connected: boolean;
  connectedAt: string;
}

export interface AutomationSettings {
  enabled: boolean;
  scrapeInterval: "hourly" | "every6h" | "daily";
  maxProductsPerRun: number;
  minRating: number;
  minOrders: number;
  categories: string[];
  autoPublishToStore: boolean;
  autoGenerateContent: boolean;
  autoPostInstagram: boolean;
  autoUploadYoutube: boolean;
  contentTone: Tone;
  priceMarginPercent: number;
  postsPerDay: number;
}

export interface AutomationRun {
  id: string;
  status: "running" | "completed" | "failed" | "partial";
  startedAt: string;
  completedAt?: string;
  stats: {
    productsScraped: number;
    productsAdded: number;
    contentGenerated: number;
    videosCreated: number;
    instagramPosted: number;
    youtubeUploaded: number;
    errors: number;
  };
  errors: string[];
  productIds: string[];
}

export interface VideoGenerationJob {
  id: string;
  productId: string;
  productName: string;
  status: "pending" | "rendering" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  platform: "instagram_reel" | "youtube_shorts";
  shotStackRenderId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface DropshippingStats {
  totalProductsScraped: number;
  totalVideosCreated: number;
  totalInstagramPosts: number;
  totalYoutubeUploads: number;
  lastRunAt?: string;
  todayPosts: number;
}
