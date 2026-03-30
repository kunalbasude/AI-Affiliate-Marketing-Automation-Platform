export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { scrapeMeeshoTrending } from "@/lib/scraper/meesho";

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));
    const body = await req.json().catch(() => ({}));
    const {
      categories,
      minRating = 3.5,
      minOrders = 50,
      maxProducts = 20,
      autoPublish = false,
      marginPercent = 30,
    } = body;

    const products = await scrapeMeeshoTrending({
      categories,
      minRating,
      minOrders,
      maxProducts,
    });

    if (products.length === 0) {
      return NextResponse.json({ success: true, scraped: 0, added: 0, products: [] });
    }

    const addedIds: string[] = [];

    if (autoPublish) {
      for (const p of products) {
        const ref = await adminDb.collection(`users/${uid}/products`).add({
          name: p.name,
          description: p.description,
          category: p.category,
          originalPrice: p.originalPrice,
          marginPercent,
          sellingPrice: Math.ceil(p.originalPrice * (1 + marginPercent / 100)),
          affiliateLink: p.meeshoUrl,
          imageURL: p.imageURL,
          images: p.images,
          isPublished: true,
          tags: p.tags,
          sourcePlatform: "meesho",
          commissionRate: 0,
          meeshoProductId: p.meeshoProductId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        addedIds.push(ref.id);
      }
    }

    return NextResponse.json({
      success: true,
      scraped: products.length,
      added: addedIds.length,
      products: products.slice(0, 5),
      productIds: addedIds,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
