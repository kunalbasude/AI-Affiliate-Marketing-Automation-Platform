import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  category: z.string().min(1, "Category is required"),
  originalPrice: z.number().positive("Price must be positive"),
  marginPercent: z.number().min(0).max(500),
  affiliateLink: z.string().url("Must be a valid URL"),
  imageURL: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  sourcePlatform: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  isPublished: z.boolean().optional(),
});

export const csvProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  category: z.string().optional().default("Other"),
  originalPrice: z.coerce.number().positive(),
  affiliateLink: z.string().url(),
  imageURL: z.string().optional().default(""),
  marginPercent: z.coerce.number().min(0).optional().default(20),
  sourcePlatform: z.string().optional().default(""),
  commissionRate: z.coerce.number().min(0).optional().default(0),
});

export const contentGenerateSchema = z.object({
  productId: z.string().min(1),
  type: z.enum([
    "instagram_caption",
    "instagram_reel",
    "instagram_carousel",
    "youtube_script",
    "youtube_shorts",
    "hashtags",
    "product_description",
  ]),
  platform: z.enum(["instagram", "youtube", "twitter", "facebook"]),
  tone: z.enum([
    "professional",
    "casual",
    "humorous",
    "urgent",
    "luxury",
    "friendly",
  ]),
  customInstructions: z.string().optional(),
});

export const scheduleSchema = z.object({
  contentId: z.string().min(1),
  productId: z.string().min(1),
  platform: z.enum(["instagram", "youtube", "twitter", "facebook"]),
  scheduledAt: z.string().min(1, "Schedule date is required"),
  notes: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, hyphens and underscores"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required").max(50),
  bio: z.string().max(500).optional(),
  accentColor: z.string().optional(),
});
