import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, onSnapshot, serverTimestamp, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const COL = "notifications";
const API = "https://drivo1.elmoroj.com/api";

/** Unread if `read` is false/missing or legacy API `status` is not read. */
export function isNotificationUnread(n) {
  if (!n) return false;
  if (n.read === true) return false;
  if (n.read === false) return true;
  if (n.status === "read" || n.status === "مقروء") return false;
  return true;
}

async function markBackendAllRead() {
  const res = await fetch(`${API}/drivo/admin/notifications/mark-read`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ── Auto-create collection on first load ───────────────────────
// Firestore creates the collection automatically on first addDoc.
// This function is called once on app start to ensure the collection exists
// and seed it with any existing backend notifications.
export async function initNotificationsCollection() {
  try {
    // Check if collection already has documents
    const snap = await getDocs(collection(db, COL));
    if (snap.empty) {
      // Collection empty or does not exist yet — seed a welcome doc
      // then immediately sync from backend
      await addDoc(collection(db, COL), {
        title:     "مرحبا بك في نظام الإشعارات",
        body:      "سيتم حفظ جميع الإشعارات هنا تلقائيا",
        driverId:  "",
        type:      "system",
        read:      false,
        createdAt: serverTimestamp(),
      });
      console.log("[Notifications] Collection created automatically in Firestore");
    }
    // Always try to sync backend notifications on init
    await syncBackendNotifications();
  } catch (e) {
    console.error("[Notifications] Init failed:", e.message);
  }
}

// ── Save one notification ──────────────────────────────────────
export async function saveNotification(data) {
  return addDoc(collection(db, COL), {
    title:    data.title    ?? "",
    body:     data.body     ?? data.message ?? "",
    driverId: String(data.driverId ?? data.driver_id ?? ""),
    type:     data.type     ?? "driver",
    read:     false,
    createdAt: serverTimestamp(),
  });
}

// ── Send via API then auto-save to Firestore ───────────────────
export async function sendDriverNotification(payload) {
  const res = await fetch(API + "/send-driver-notification", {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? ("HTTP " + res.status));
  }
  // Auto-save to Firestore immediately after successful API call
  await saveNotification({
    title:    payload.title    ?? payload.notification?.title ?? "اشعار",
    body:     payload.body     ?? payload.notification?.body  ?? "",
    driverId: payload.driver_id ?? "",
    type:     "driver",
  });
  return res.json().catch(() => ({}));
}

// ── Mark one as read ───────────────────────────────────────────
export async function markAsRead(docId) {
  await updateDoc(doc(db, COL, docId), { read: true });
}

// ── Mark ALL unread as read (Firestore + backend API) ──────────
export async function markAllAsRead() {
  try {
    await markBackendAllRead();
  } catch (e) {
    console.warn("[Notifications] API mark-read:", e.message);
  }

  const snap = await getDocs(collection(db, COL));
  const updates = snap.docs
    .filter((d) => isNotificationUnread(d.data()))
    .map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(updates);
}

// ── Real-time listener ─────────────────────────────────────────
export function subscribeNotifications(callback) {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.error("[Notifications] listener:", err.message)
  );
}

// ── Sync from backend (no duplicates) ─────────────────────────
export async function syncBackendNotifications() {
  try {
    const res = await fetch(API + "/drivo/admin/notifications", {
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return;
    const raw   = await res.json();
    const items = Array.isArray(raw) ? raw : [];
    if (!items.length) return;

    const existing = await getDocs(collection(db, COL));
    const keys = new Set(
      existing.docs.map(d => {
        const x = d.data();
        return (x.title ?? "") + "|" + (x.driverId ?? "");
      })
    );

    const writes = items
      .filter(item => {
        const k = (item.title ?? item.type ?? "") + "|" + (item.driver_id ?? "");
        return !keys.has(k);
      })
      .map(item => addDoc(collection(db, COL), {
        title:    item.title   ?? item.type ?? "اشعار",
        body:     item.content ?? item.body ?? "",
        driverId: String(item.driver_id ?? ""),
        type:     item.type    ?? "system",
        read:     item.status === "read",
        createdAt: serverTimestamp(),
      }));

    await Promise.all(writes);
    if (writes.length) {
      console.log("[Notifications] Synced " + writes.length + " items from backend");
    }
  } catch (e) {
    console.warn("[Sync failed]", e.message);
  }
}