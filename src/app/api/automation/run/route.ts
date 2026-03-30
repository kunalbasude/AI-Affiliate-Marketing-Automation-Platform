export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, adminDb } from "@/lib/firebase/admin";
import { runAutomationPipeline } from "@/lib/automation/pipeline";
import type { AutomationSettings, SocialAccount } from "@/types";

const DEFAULT_SETTINGS: AutomationSettings = {
  enabled: true,
  scrapeInterval: "daily",
  maxProductsPerRun: 10,
  minRating: 3.5,
  minOrders: 100,
  categories: ["women-kurtas", "home-decor", "beauty", "mobile-accessories"],
  autoPublishToStore: true,
  autoGenerateContent: true,
  autoPostInstagram: false,
  autoUploadYoutube: false,
  contentTone: "casual",
  priceMarginPercent: 30,
  postsPerDay: 10,
};

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));

    // Load automation settings from Firestore (or use defaults)
    const settingsDoc = await adminDb.doc(`users/${uid}/settings/automation`).get();
    const settings: AutomationSettings = settingsDoc.exists
      ? (settingsDoc.data() as AutomationSettings)
      : DEFAULT_SETTINGS;

    // Load connected social accounts
    const accountsSnap = await adminDb.collection(`users/${uid}/socialAccounts`).get();
    const socialAccounts: SocialAccount[] = accountsSnap.docs.map(
      (d) => d.data() as SocialAccount
    );

    const result = await runAutomationPipeline({
      uid,
      settings,
      socialAccounts,
      adminDb: adminDb as unknown as FirebaseFirestore.Firestore,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyToken(req.headers.get("authorization"));

    const runsSnap = await adminDb
      .collection(`users/${uid}/automationRuns`)
      .orderBy("startedAt", "desc")
      .limit(20)
      .get();

    const runs = runsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ runs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
