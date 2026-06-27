/**
 * Role-based access configuration for Drivo Admin Dashboard.
 *
 * Roles are stored in Clerk publicMetadata:
 *   user.publicMetadata.role  ->  "admin" | "support" | "accountant"
 *
 * If no role is set the user is treated as "support" (least privilege).
 */

export const ROLES = {
  ADMIN: "admin",
  SUPPORT: "support",
  ACCOUNTANT: "accountant",
};

/**
 * Which routes each role may access.
 * "admin" can access everything - handled by the guard logic below.
 */
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
  ],
  accountant: [
    "/dashboard",
    "/trips",
    "/rewards",
    "/settings",
  ],
};

/**
 * Returns true when the given role can access the given pathname.
 * Admins always return true.
 * Unknown roles fall back to the support permission set.
 */
export function canAccess(role, pathname) {
  if (!role || role === "admin") return true;
  const allowed = ROLE_ROUTES[role] ?? ROLE_ROUTES["support"];
  return allowed.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/**
 * Per-route role restriction for the sidebar.
 * null means visible to all roles.
 */
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