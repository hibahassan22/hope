import { ROLES } from "../lib/roles.js";

const API_BASE = "/api";

/** أدوار Firebase المرتبطة بسجل /api/sales (الدور في Firebase، الـ id = uid) */
export const SALES_LINKED_ROLES = new Set([ROLES.SUPPORT]);

export function isSalesLinkedRole(role) {
  return SALES_LINKED_ROLES.has(role);
}

async function parseResponse(res) {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(formatSalesApiError(data, text, res.status));
  }
  return data;
}

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

/** رسالة عربية واضحة لأخطاء الـ API (بما فيها البريد المكرر) */
export function formatSalesApiError(data, rawText = "", status = 0) {
  const blob = `${data?.message ?? ""} ${rawText}`.toLowerCase();

  if (
    blob.includes("duplicate entry") ||
    blob.includes("sales_email_unique") ||
    blob.includes("1062")
  ) {
    const emailMatch = blob.match(/['"]([^'"]+@[^'"]+)['"]/);
    const email = emailMatch?.[1];
    return email
      ? `البريد الإلكتروني «${email}» مسجّل مسبقاً — استخدم بريداً آخر أو عدّل الموظف الحالي`
      : "البريد الإلكتروني مسجّل مسبقاً — استخدم بريداً آخر";
  }

  if (data?.errors?.email) {
    return Array.isArray(data.errors.email)
      ? data.errors.email.join("، ")
      : String(data.errors.email);
  }

  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors).flat().join("، ");
  return `خطأ ${status || ""}`.trim();
}

export function findSalesByEmail(salesList, email, excludeId = null) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return (
    salesList.find((s) => {
      if (excludeId && String(s.id) === String(excludeId)) return false;
      return normalizeEmail(s.email) === normalized;
    }) ?? null
  );
}

/** GET /api/sales — كل موظفي المبيعات / خدمة العملاء */
export async function fetchSalesList() {
  const res = await fetch(`${API_BASE}/sales`, { headers: { Accept: "application/json" } });
  const data = await parseResponse(res);
  return Array.isArray(data) ? data : data?.data ?? data?.sales ?? [];
}

/** تحويل سجل /api/sales لشكل مستخدم في الواجهة */
export function salesRecordToUser(sale, roleFromFirebase) {
  const id = String(sale.id);
  return {
    uid: id,
    id,
    fullName: sale.name ?? "",
    email: sale.email ?? "",
    phone: sale.phone ?? "",
    role: roleFromFirebase ?? ROLES.SUPPORT,
    status: sale.status ?? "active",
    department: "",
    permissions: [],
    createdAt: sale.created_at ?? null,
    fromSalesApi: true,
    salesRecord: sale,
  };
}

/**
 * دمج مستخدمي Firebase مع GET /api/sales
 * — الدور من Firebase عند تطابق id
 * — سجلات API فقط تظهر كخدمة عملاء
 */
export function mergeUsersWithSales(firebaseUsers = [], salesList = []) {
  const map = new Map();

  firebaseUsers.forEach((user) => {
    const id = String(user.uid ?? user.id);
    map.set(id, { ...user, uid: id, id });
  });

  salesList.forEach((sale) => {
    const id = String(sale.id);
    const existing = map.get(id);
    if (existing) {
      map.set(id, {
        ...existing,
        fullName: existing.fullName || sale.name || "",
        email: existing.email || sale.email || "",
        phone: existing.phone || sale.phone || "",
        status: existing.status || sale.status || "active",
        salesRecord: sale,
      });
    } else {
      map.set(id, salesRecordToUser(sale));
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const ta = a.createdAt?.toDate?.() ?? new Date(a.createdAt ?? 0);
    const tb = b.createdAt?.toDate?.() ?? new Date(b.createdAt ?? 0);
    return tb - ta;
  });
}

export function generateSalesId() {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `#sale${Date.now().toString(36)}${suffix}`;
}

export function filterSalesUsers(users, { search = "", role = "", status = "" } = {}) {
  let list = users;
  const term = search.trim().toLowerCase();
  if (term) {
    list = list.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        String(u.phone ?? "").includes(term) ||
        String(u.uid ?? u.id ?? "").includes(term)
    );
  }
  if (role) list = list.filter((u) => u.role === role);
  if (status) list = list.filter((u) => u.status === status);
  return list;
}

/** @deprecated استخدم filterSalesUsers */
export function filterMergedUsers(users, filters) {
  return filterSalesUsers(users, filters);
}

/** POST /api/sales — id = Firebase uid، بدون role (الدور في Firebase فقط) */
export async function createSalesRecord({ id, name, phone = "", email }) {
  const res = await fetch(`${API_BASE}/sales`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      id: String(id),
      name: String(name).trim(),
      phone: String(phone ?? "").trim(),
      email: String(email).trim().toLowerCase(),
    }),
  });
  return parseResponse(res);
}

/** PUT /api/sales/{id} */
export async function updateSalesRecord(id, { name, phone, email }) {
  const body = {};
  if (name !== undefined) body.name = String(name).trim();
  if (phone !== undefined) body.phone = String(phone ?? "").trim();
  if (email !== undefined) body.email = String(email).trim().toLowerCase();

  const res = await fetch(`${API_BASE}/sales/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

/** إنشاء أو تحديث سجل المبيعات حسب uid */
export async function syncSalesRecord(uid, { name, phone, email }) {
  try {
    return await updateSalesRecord(uid, { name, phone, email });
  } catch {
    return createSalesRecord({ id: uid, name, phone, email });
  }
}
