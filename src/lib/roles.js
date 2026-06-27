/**
 * Role-based access — integrates with Firestore roles + permission keys.
 */


export { canAccessRoute, ADMIN_ONLY_ROUTES } from "./permissions.js";

export const ROLES = {
  ADMIN: "admin",
  SUPPORT: "support",
  ACCOUNTANT: "accountant",
  SUPERVISOR: "supervisor",
};

export const ROLE_LABELS = {
  admin: "مدير النظام",
  support: "خدمة عملاء",
  accountant: "محاسب",
  supervisor: "مشرف",
};

export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
  DISABLED: "disabled",
};

export const STATUS_LABELS = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "معلق",
  blocked: "محظور",
  disabled: "معطل",
};

/** Default permissions per role (overridden by Firestore roles collection) */
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: ["*"],
  support: [
    "Dashboard.Read",
    "Trips.Read", "Trips.Edit",
    "Clients.Read", "Clients.Edit",
    "Support.Read", "Support.Edit",
    "Notifications.Read", "Notifications.Send",
  ],
  accountant: [
    "Dashboard.Read", "Trips.Read", "Rewards.Read", "Rewards.Edit",
  ],
  supervisor: [
    "Dashboard.Read", "Trips.Read", "Trips.Edit",
    "Clients.Read", "Drivers.Read", "Support.Read",
    "Notifications.Read", "Approvals.Read",
  ],
};

export const SUPERVISOR_ROUTES = [
  "/dashboard",
  "/trips",
  "/clients",
  "/drivers",
  "/support",
  "/notifications",
  "/alerts",
  "/activity",
  "/approvals",
  "/settings",
  "/create-trip",
  "/new-trip",
];

export function resolvePermissions(role, roleDocPermissions = [], userPermissions = []) {
  if (userPermissions?.length) return userPermissions;
  if (roleDocPermissions?.length) return roleDocPermissions;
  return DEFAULT_ROLE_PERMISSIONS[role] ?? DEFAULT_ROLE_PERMISSIONS.support;
}

export function hasWildcard(permissions) {
  return permissions?.includes("*");
}

/** Which routes each role may access (route guard). Admin = full access. */
export const ROLE_ROUTES = {
  support: [
    "/dashboard",
    "/trips",
    "/clients",
    "/drivers",
    "/support",
    "/notifications",
    "/alerts",
    "/activity",
    "/approvals",
    "/settings",
    "/create-trip",
    "/new-trip",
  ],
  accountant: [
    "/dashboard",
    "/trips",
    "/rewards",
    "/settings",
  ],
  supervisor: SUPERVISOR_ROUTES,
};

export function canAccess(role, pathname) {
  if (pathname === "/change-password") return true;
  if (!role || role === ROLES.ADMIN) return true;
  const allowed = ROLE_ROUTES[role] ?? ROLE_ROUTES.support;
  return allowed.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/** Sidebar visibility per route — null = all roles (original config) */
export const NAV_ROLE_MAP = {
  "/dashboard":     null,
  "/trips":         null,
  "/create-trip":   ["admin", "support"],
  "/clients":       ["admin", "support"],
  "/drivers":       ["admin", "support"],
  "/rewards":       ["admin", "accountant"],
  "/support":       ["admin", "support"],
  "/notifications": ["admin", "support"],
  "/activity":      ["admin", "support"],
  "/approvals":     ["admin", "support"],
  "/permissions":   ["admin"],
  "/users":         ["admin"],
  "/system":        ["admin"],
  "/settings":      null,
};

export function canSeeNavItem(route, role) {
  const allowed = NAV_ROLE_MAP[route];
  return !allowed || allowed.includes(role);
}
