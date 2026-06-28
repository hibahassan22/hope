import { ROLE_LABELS } from "./roles.js";

/** خيارات الأدوار من Firestore `roles` مع fallback */
export function buildRoleOptions(firebaseRoles = []) {
  if (!firebaseRoles.length) {
    return Object.entries(ROLE_LABELS).map(([id, name]) => ({ id, name }));
  }
  return firebaseRoles.map((r) => ({
    id: r.id,
    name: r.name ?? ROLE_LABELS[r.id] ?? r.id,
    description: r.description ?? "",
  }));
}

export function getRoleLabel(roleId, firebaseRoles = []) {
  if (!roleId) return "—";
  const match = firebaseRoles.find((r) => r.id === roleId);
  return match?.name ?? ROLE_LABELS[roleId] ?? roleId;
}

export function getDefaultRoleId(firebaseRoles = []) {
  if (firebaseRoles.some((r) => r.id === "support")) return "support";
  return firebaseRoles[0]?.id ?? "support";
}
