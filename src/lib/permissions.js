/**
 * Enterprise permission keys for Drivo Admin Dashboard.
 * Stored in Firestore `permissions` collection and assigned via roles/users.
 */

export const PERMISSIONS = {
  TRIPS_READ: "Trips.Read",
  TRIPS_EDIT: "Trips.Edit",
  TRIPS_DELETE: "Trips.Delete",
  TRIPS_CREATE: "Trips.Create",
  DRIVERS_READ: "Drivers.Read",
  DRIVERS_CREATE: "Drivers.Create",
  DRIVERS_EDIT: "Drivers.Edit",
  DRIVERS_DELETE: "Drivers.Delete",
  CLIENTS_READ: "Clients.Read",
  CLIENTS_CREATE: "Clients.Create",
  CLIENTS_EDIT: "Clients.Edit",
  CLIENTS_DELETE: "Clients.Delete",
  USERS_READ: "Users.Read",
  USERS_CREATE: "Users.Create",
  USERS_EDIT: "Users.Edit",
  USERS_DELETE: "Users.Delete",
  ROLES_READ: "Roles.Read",
  ROLES_EDIT: "Roles.Edit",
  PERMISSIONS_READ: "Permissions.Read",
  PERMISSIONS_EDIT: "Permissions.Edit",
  NOTIFICATIONS_READ: "Notifications.Read",
  NOTIFICATIONS_SEND: "Notifications.Send",
  SUPPORT_READ: "Support.Read",
  SUPPORT_EDIT: "Support.Edit",
  REWARDS_READ: "Rewards.Read",
  REWARDS_EDIT: "Rewards.Edit",
  ACTIVITY_READ: "Activity.Read",
  SETTINGS_READ: "Settings.Read",
  SETTINGS_EDIT: "Settings.Edit",
  SYSTEM_READ: "System.Read",
  SYSTEM_EDIT: "System.Edit",
  APPROVALS_READ: "Approvals.Read",
  APPROVALS_EDIT: "Approvals.Edit",
  DASHBOARD_READ: "Dashboard.Read",
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const PERMISSION_LABELS = {
  [PERMISSIONS.TRIPS_READ]: "عرض الرحلات",
  [PERMISSIONS.TRIPS_EDIT]: "تعديل الرحلات",
  [PERMISSIONS.TRIPS_DELETE]: "حذف الرحلات",
  [PERMISSIONS.TRIPS_CREATE]: "إنشاء الرحلات",
  [PERMISSIONS.DRIVERS_READ]: "عرض السائقين",
  [PERMISSIONS.DRIVERS_CREATE]: "إضافة سائق",
  [PERMISSIONS.DRIVERS_EDIT]: "تعديل السائقين",
  [PERMISSIONS.DRIVERS_DELETE]: "حذف السائقين",
  [PERMISSIONS.CLIENTS_READ]: "عرض العملاء",
  [PERMISSIONS.CLIENTS_CREATE]: "إضافة عميل",
  [PERMISSIONS.CLIENTS_EDIT]: "تعديل العملاء",
  [PERMISSIONS.CLIENTS_DELETE]: "حذف العملاء",
  [PERMISSIONS.USERS_READ]: "عرض المستخدمين",
  [PERMISSIONS.USERS_CREATE]: "إنشاء مستخدم",
  [PERMISSIONS.USERS_EDIT]: "تعديل المستخدمين",
  [PERMISSIONS.USERS_DELETE]: "حذف المستخدمين",
  [PERMISSIONS.ROLES_READ]: "عرض الأدوار",
  [PERMISSIONS.ROLES_EDIT]: "تعديل الأدوار",
  [PERMISSIONS.PERMISSIONS_READ]: "عرض الصلاحيات",
  [PERMISSIONS.PERMISSIONS_EDIT]: "تعديل الصلاحيات",
  [PERMISSIONS.NOTIFICATIONS_READ]: "عرض الإشعارات",
  [PERMISSIONS.NOTIFICATIONS_SEND]: "إرسال إشعارات",
  [PERMISSIONS.SUPPORT_READ]: "عرض الدعم",
  [PERMISSIONS.SUPPORT_EDIT]: "إدارة الدعم",
  [PERMISSIONS.REWARDS_READ]: "عرض المكافآت",
  [PERMISSIONS.REWARDS_EDIT]: "تعديل المكافآت",
  [PERMISSIONS.ACTIVITY_READ]: "عرض سجل النشاط",
  [PERMISSIONS.SETTINGS_READ]: "عرض الإعدادات",
  [PERMISSIONS.SETTINGS_EDIT]: "تعديل الإعدادات",
  [PERMISSIONS.SYSTEM_READ]: "عرض إعدادات النظام",
  [PERMISSIONS.SYSTEM_EDIT]: "تعديل النظام",
  [PERMISSIONS.APPROVALS_READ]: "عرض الموافقات",
  [PERMISSIONS.APPROVALS_EDIT]: "إدارة الموافقات",
  [PERMISSIONS.DASHBOARD_READ]: "عرض لوحة التحكم",
};

/** Route → required permission (any one of listed) */
export const ROUTE_PERMISSIONS = {
  "/dashboard": [PERMISSIONS.DASHBOARD_READ],
  "/trips": [PERMISSIONS.TRIPS_READ],
  "/create-trip": [PERMISSIONS.TRIPS_CREATE],
  "/new-trip": [PERMISSIONS.TRIPS_CREATE],
  "/clients": [PERMISSIONS.CLIENTS_READ],
  "/drivers": [PERMISSIONS.DRIVERS_READ],
  "/rewards": [PERMISSIONS.REWARDS_READ],
  "/support": [PERMISSIONS.SUPPORT_READ],
  "/notifications": [PERMISSIONS.NOTIFICATIONS_READ],
  "/alerts": [PERMISSIONS.NOTIFICATIONS_READ],
  "/activity": [PERMISSIONS.ACTIVITY_READ],
  "/approvals": [PERMISSIONS.APPROVALS_READ],
  "/permissions": [PERMISSIONS.PERMISSIONS_READ, PERMISSIONS.ROLES_READ],
  "/users": [PERMISSIONS.USERS_READ],
  "/system": [PERMISSIONS.SYSTEM_READ],
  "/settings": [PERMISSIONS.SETTINGS_READ],
};

/** Admin-only routes (RoleGuard) */
export const ADMIN_ONLY_ROUTES = [
  "/users",
  "/permissions",
  "/activity",
  "/system",
];

export function hasPermission(userPermissions, permission) {
  if (!permission) return true;
  if (!userPermissions?.length) return false;
  return userPermissions.includes(permission);
}

export function hasAnyPermission(userPermissions, permissions = []) {
  if (!permissions.length) return true;
  return permissions.some((p) => hasPermission(userPermissions, p));
}

export function canAccessRoute(userPermissions, pathname) {
  const key = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  if (!key) return true;
  return hasAnyPermission(userPermissions, ROUTE_PERMISSIONS[key]);
}
