import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
  increment,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import type { Product, Content, Schedule, DailyAnalytics, User } from "@/types";

function db() {
  return getFirebaseDb();
}

// Products
export async function getUserProducts(uid: string): Promise<Product[]> {
  const q = query(collection(db(), `users/${uid}/products`), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function getProduct(uid: string, productId: string): Promise<Product | null> {
  const snap = await getDoc(doc(db(), `users/${uid}/products`, productId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}

export async function addProduct(uid: string, product: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  const ref = await addDoc(collection(db(), `users/${uid}/products`), {
    ...product,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateProduct(uid: string, productId: string, data: Partial<Product>) {
  await updateDoc(doc(db(), `users/${uid}/products`, productId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteProduct(uid: string, productId: string) {
  await deleteDoc(doc(db(), `users/${uid}/products`, productId));
}

// Content
export async function getUserContent(uid: string): Promise<Content[]> {
  const q = query(collection(db(), `users/${uid}/content`), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Content));
}

export async function addContent(uid: string, content: Omit<Content, "id" | "createdAt">) {
  const ref = await addDoc(collection(db(), `users/${uid}/content`), {
    ...content,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function deleteContent(uid: string, contentId: string) {
  await deleteDoc(doc(db(), `users/${uid}/content`, contentId));
}

// Schedules
export async function getUserSchedules(uid: string): Promise<Schedule[]> {
  const q = query(collection(db(), `users/${uid}/schedules`), orderBy("scheduledAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Schedule));
}

export async function addSchedule(uid: string, schedule: Omit<Schedule, "id" | "createdAt">) {
  const ref = await addDoc(collection(db(), `users/${uid}/schedules`), {
    ...schedule,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateSchedule(uid: string, scheduleId: string, data: Partial<Schedule>) {
  await updateDoc(doc(db(), `users/${uid}/schedules`, scheduleId), data);
}

// Analytics
export async function trackClick(uid: string, productId: string, date: string) {
  const ref = doc(db(), `users/${uid}/analytics`, date);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      totalClicks: increment(1),
      [`clicksByProduct.${productId}`]: increment(1),
    });
  } else {
    await setDoc(ref, {
      date,
      totalClicks: 1,
      totalViews: 0,
      clicksByProduct: { [productId]: 1 },
      viewsByProduct: {},
      referrers: {},
    });
  }
}

export async function getAnalytics(uid: string, startDate: string, endDate: string): Promise<DailyAnalytics[]> {
  const q = query(
    collection(db(), `users/${uid}/analytics`),
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as DailyAnalytics);
}

// User lookup by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const snap = await getDoc(doc(db(), "usernames", username));
  if (!snap.exists()) return null;
  const { uid } = snap.data();
  const userSnap = await getDoc(doc(db(), "users", uid));
  return userSnap.exists() ? ({ uid: userSnap.id, ...userSnap.data() } as User) : null;
}

export async function getPublicStoreProducts(uid: string): Promise<Product[]> {
  const q = query(
    collection(db(), `users/${uid}/products`),
    where("isPublished", "==", true),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// ─── Automation & Dropshipping ────────────────────────────────────────────────

import type { AutomationRun, SocialAccount, AutomationSettings, VideoGenerationJob } from "@/types";

export async function getAutomationRuns(uid: string): Promise<AutomationRun[]> {
  const q = query(
    collection(db(), `users/${uid}/automationRuns`),
    orderBy("startedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AutomationRun));
}

export async function getAutomationSettings(uid: string): Promise<AutomationSettings | null> {
  const snap = await getDoc(doc(db(), `users/${uid}/settings`, "automation"));
  return snap.exists() ? (snap.data() as AutomationSettings) : null;
}

export async function saveAutomationSettings(uid: string, settings: AutomationSettings) {
  await setDoc(doc(db(), `users/${uid}/settings`, "automation"), settings);
}

export async function getSocialAccounts(uid: string): Promise<SocialAccount[]> {
  const snap = await getDocs(collection(db(), `users/${uid}/socialAccounts`));
  return snap.docs.map((d) => d.data() as SocialAccount);
}

export async function getVideoJobs(uid: string): Promise<VideoGenerationJob[]> {
  const q = query(
    collection(db(), `users/${uid}/videoJobs`),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VideoGenerationJob));
}
