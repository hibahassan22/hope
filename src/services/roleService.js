import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firestore.js";

const COLLECTION = "roles";

export function generateRoleId(name, existingIds = []) {
  const base =
    name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[/.]/g, "")
      .slice(0, 48) || `role_${Date.now().toString(36)}`;

  const taken = new Set(existingIds);
  if (!taken.has(base)) return base;

  let i = 2;
  while (taken.has(`${base}_${i}`)) i += 1;
  return `${base}_${i}`;
}

export async function fetchRoles() {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

export function subscribeRoles(callback) {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const roles = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      callback(roles);
    },
    (err) => {
      console.error("[roles] listener error:", err);
      callback([]);
    }
  );
}

export async function createRole({ name, description = "", permissions = [] }) {
  const trimmedName = name?.trim();
  if (!trimmedName) throw new Error("اسم الدور مطلوب");

  const existing = await fetchRoles();
  const id = generateRoleId(trimmedName, existing.map((r) => r.id));

  const duplicate = existing.find(
    (r) => r.name?.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  if (duplicate) throw new Error(`الدور «${trimmedName}» موجود مسبقاً`);

  const now = new Date().toISOString();
  const data = {
    name: trimmedName,
    description: description?.trim() || "",
    permissions: Array.isArray(permissions) ? permissions : [],
    sortOrder: existing.length + 1,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, COLLECTION, id), data);
  return { id, ...data };
}

export async function updateRole(roleId, patch) {
  if (!roleId) throw new Error("معرّف الدور مطلوب");
  const ref = doc(db, COLLECTION, roleId);
  await setDoc(
    ref,
    { ...patch, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function updateRolePermissions(roleId, permissions) {
  if (!roleId) throw new Error("معرّف الدور مطلوب");
  if (roleId === "admin") {
    await updateRole(roleId, { permissions: ["*"] });
    return;
  }
  await updateRole(roleId, { permissions: Array.isArray(permissions) ? permissions : [] });
}

export async function deleteRole(roleId) {
  if (!roleId) throw new Error("معرّف الدور مطلوب");
  if (roleId === "admin") throw new Error("لا يمكن حذف دور مدير النظام");
  await deleteDoc(doc(db, COLLECTION, roleId));
}

export function formatRoleDate(value) {
  if (!value) return "—";
  const d = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-SA");
}
