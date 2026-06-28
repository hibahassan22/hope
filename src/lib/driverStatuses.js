const API_BASE = "https://drivo1.elmoroj.com/api";

export const DRIVER_STATUS_COLORS = {
  1: "bg-green-100 text-green-700 border border-green-200",
  2: "bg-blue-100 text-blue-700 border border-blue-200",
  3: "bg-red-100 text-red-600 border border-red-200",
  4: "bg-amber-100 text-amber-700 border border-amber-200",
};

export const FALLBACK_DRIVER_STATUSES = [
  { id: 1, name: "نشط" },
  { id: 2, name: "مجمد" },
  { id: 3, name: "محظور" },
  { id: 4, name: "موقوف مؤقتاً" },
];

export async function fetchDriverStatuses() {
  const res = await fetch(`${API_BASE}/driver-statuses`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`فشل تحميل الحالات (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) && data.length ? data : FALLBACK_DRIVER_STATUSES;
}

function normalizeStatusId(id) {
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}

export function createDriverStatusHelpers(statuses = FALLBACK_DRIVER_STATUSES) {
  const list = statuses.length ? statuses : FALLBACK_DRIVER_STATUSES;
  const byId = new Map();

  list.forEach((s) => {
    byId.set(s.id, s);
    byId.set(String(s.id), s);
    byId.set(Number(s.id), s);
  });

  const findByName = (...names) =>
    list.find((s) => names.some((n) => s.name === n || s.name?.includes(n)));

  const statusLabel = (id) => {
    const key = normalizeStatusId(id);
    return (key != null && byId.get(key)?.name) || byId.get(id)?.name || "غير مسجل";
  };

  const statusColor = (id) => {
    const key = normalizeStatusId(id);
    return (key != null && DRIVER_STATUS_COLORS[key]) || "bg-gray-100 text-gray-500 border border-gray-200";
  };

  const statusIdForAction = {
    pause: findByName("موقوف مؤقتاً", "موقوف")?.id ?? 4,
    freeze: findByName("مجمد")?.id ?? 2,
    block: findByName("محظور")?.id ?? 3,
    active: findByName("نشط")?.id ?? 1,
  };

  return { statuses: list, statusLabel, statusColor, statusIdForAction };
}

export async function updateDriverStatus(driverId, statusId) {
  if (!driverId || statusId == null) throw new Error("بيانات السائق أو الحالة غير متوفرة");

  const fd = new FormData();
  fd.append("status", String(statusId));

  const res = await fetch(`${API_BASE}/driverstest/update/${driverId}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: fd,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok && res.status >= 500) {
    throw new Error(json?.message || `خطأ ${res.status}`);
  }

  return json;
}

export async function sendDriverNotification(driverId, title, body) {
  if (!driverId) throw new Error("معرّف السائق غير متوفر");

  const res = await fetch(`${API_BASE}/send-driver-notification`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ driver_id: driverId, title, body }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `خطأ ${res.status}`);
  return json;
}
