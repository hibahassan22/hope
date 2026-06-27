/**
 * driverNotificationsService.js
 *
 * Handles all driver-notification operations:
 *  - Sending via the API endpoint POST /notifications/drivers/send
 *  - Persisting every sent/scheduled notification to Firestore
 *  - Reading / filtering from Firestore (real-time or one-shot)
 *  - Delete & resend helpers
 *
 * Firestore collection: "driver_notifications"
 *
 * ── REPLACE THIS if the API base URL changes ──────────────────
 */

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

// ── Config ────────────────────────────────────────────────────
const API_BASE = "https://drivo1.elmoroj.com/api";
const COL      = "notifications";                  // uses same collection as the rest of the app
const SEND_URL = `${API_BASE}/notifications/drivers/send`;

// ── Helpers ───────────────────────────────────────────────────
/**
 * Normalize a raw Firestore doc into a flat notification object.
 */
export function normalizeNotification(docSnap) {
  const d = docSnap.data();
  return {
    id:           docSnap.id,
    title:        d.title        ?? "",
    content:      d.content      ?? "",
    type:         d.type         ?? "تهنئة",
    status:       d.status       ?? "مرسل",
    scheduledAt:  d.scheduled_at ?? null,
    createdAt:    d.createdAt    ?? null,
    // Raw fields kept for display flexibility
    _raw: d,
  };
}

/**
 * Format a Firestore Timestamp or ISO string to Arabic-friendly string.
 */
export function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(d)) return String(ts);
  return d.toLocaleString("ar-EG", {
    year:   "numeric",
    month:  "short",
    day:    "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// ── Send & Save ───────────────────────────────────────────────
/**
 * POST to API then persist the notification to Firestore.
 * Returns the new Firestore document reference.
 *
 * @param {{ title, content, type, status, scheduled_at? }} payload
 */
export async function sendDriverNotification(payload) {
  // 1. Hit the API
  const res = await fetch(SEND_URL, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Accept:         "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = json?.errors
      ? Object.values(json.errors).flat().join(" | ")
      : json?.message ?? `خطأ ${res.status}`;
    throw new Error(errMsg);
  }

  // 2. Persist to Firestore (source of truth for the management page)
  const docRef = await addDoc(collection(db, COL), {
    title:        payload.title       ?? "",
    content:      payload.content     ?? "",
    type:         payload.type        ?? "تهنئة",
    status:       payload.status      ?? "مرسل",
    scheduled_at: payload.scheduled_at ?? null,
    createdAt:    serverTimestamp(),
    // Keep the raw API response for traceability
    api_response: json,
  });

  return { docRef, apiResponse: json };
}

// ── Fetch all (one-shot, ordered newest-first) ────────────────
/**
 * Returns an array of normalized notification objects.
 */
export async function fetchAllDriverNotifications() {
  const q    = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(normalizeNotification);
}

// ── Delete ────────────────────────────────────────────────────
/**
 * Permanently delete a notification from Firestore.
 * @param {string} id  Firestore document ID
 */
export async function deleteDriverNotification(id) {
  await deleteDoc(doc(db, COL, id));
}

// ── Resend ────────────────────────────────────────────────────
/**
 * Re-send an existing notification (same payload, new Firestore doc).
 * @param {object} notification  Normalized notification object
 */
export async function resendDriverNotification(notification) {
  const payload = {
    title:        notification.title,
    content:      notification.content,
    type:         notification.type,
    status:       "مرسل",
    // No scheduled_at on resend — it becomes immediate
  };
  return sendDriverNotification(payload);
}
