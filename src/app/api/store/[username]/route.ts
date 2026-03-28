export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const usernameDoc = await adminDb.doc(`usernames/${params.username}`).get();
    if (!usernameDoc.exists) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const uid = usernameDoc.data()!.uid;
    const userDoc = await adminDb.doc(`users/${uid}`).get();
    const user = userDoc.data();

    const productsSnap = await adminDb.collection(`users/${uid}/products`)
      .where("isPublished", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    const products = productsSnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      sellingPrice: doc.data().sellingPrice,
      imageURL: doc.data().imageURL,
      category: doc.data().category,
      affiliateLink: doc.data().affiliateLink,
    }));

    return NextResponse.json({
      store: {
        username: params.username,
        displayName: user?.displayName,
        storeName: user?.storeSettings?.storeName,
        bio: user?.storeSettings?.bio,
        accentColor: user?.storeSettings?.accentColor,
        logoURL: user?.storeSettings?.logoURL,
      },
      products,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
