import { STATUS_LABELS } from "../../lib/roles.js";
import { getRoleLabel } from "../../lib/roleUtils.js";

function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

function UserAvatar({ name, className = "w-10 h-10 text-sm" }) {
  const initial = (name?.trim()?.[0] ?? "U").toUpperCase();
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-[#9C6402] to-[#E6C76A] flex items-center justify-center text-white font-bold shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function RoleBadge({ role, firebaseRoles = [] }) {
  return (
    <span className="inline-flex text-xs bg-amber-50 text-[#9C6402] border border-amber-100 px-2.5 py-1 rounded-full whitespace-nowrap">
      {getRoleLabel(role, firebaseRoles)}
    </span>
  );
}

function UserActions({ user, onEdit, onDelete, onStatusChange, onResetPassword, compact = false, apiOnly = false, canEdit = true, canDelete = true }) {
  const btnBase =
    "text-xs font-medium rounded-xl border transition-colors disabled:opacity-60";
  const btnClass = compact
    ? `${btnBase} flex-1 min-w-0 px-2 py-2 text-center`
    : `${btnBase} px-2.5 py-1.5 whitespace-nowrap`;

  if (apiOnly) {
    return (
      <div className={compact ? "w-full" : "flex flex-wrap items-center gap-1.5 justify-start"}>
        {canEdit && (
        <button type="button" onClick={() => onEdit(user)} className={`${btnClass} text-gray-700 border-gray-200 hover:bg-gray-50 w-full sm:w-auto`}>
          تعديل
        </button>
        )}
      </div>
    );
  }

  return (
    <div className={compact ? "grid grid-cols-2 gap-2 w-full" : "flex flex-wrap items-center gap-1.5 justify-start"}>
      {canEdit && (
      <button type="button" onClick={() => onEdit(user)} className={`${btnClass} text-gray-700 border-gray-200 hover:bg-gray-50`}>
        تعديل
      </button>
      )}
      {user.status === "active" ? (
        <button
          type="button"
          onClick={() => onStatusChange(user, "suspended")}
          className={`${btnClass} text-amber-700 border-amber-200 hover:bg-amber-50`}
        >
          تعليق
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onStatusChange(user, "active")}
          className={`${btnClass} text-green-700 border-green-200 hover:bg-green-50`}
        >
          تفعيل
        </button>
      )}
      <button
        type="button"
        onClick={() => onResetPassword(user)}
        className={`${btnClass} text-blue-700 border-blue-200 hover:bg-blue-50`}
      >
        {compact ? "إعادة تعيين" : "إعادة تعيين"}
      </button>
      {canDelete && (
      <button
        type="button"
        onClick={() => onDelete(user)}
        className={`${btnClass} text-red-600 border-red-200 hover:bg-red-50`}
      >
        حذف
      </button>
      )}
    </div>
  );
}

function UserCard({ user, firebaseRoles, ...actions }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <UserAvatar name={user.fullName} />
        <div className="flex-1 min-w-0 text-right">
          <p className="font-bold text-gray-900 truncate">{user.fullName || "—"}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5" dir="ltr">
            {user.email || "—"}
          </p>
          {user.phone && (
            <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
              {user.phone}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 mt-3">
        <RoleBadge role={user.role} firebaseRoles={firebaseRoles} />
        <StatusBadge status={user.status} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
        <span>{user.department || "بدون قسم"}</span>
        <span>{fmtDate(user.createdAt)}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50">
        <UserActions user={user} compact {...actions} />
      </div>
    </div>
  );
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onStatusChange,
  onResetPassword,
  loading = false,
  apiOnly = false,
  firebaseRoles = [],
  canEdit = true,
  canDelete = true,
}) {
  const actions = { onEdit, onDelete, onStatusChange, onResetPassword, apiOnly, canEdit, canDelete };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-12 px-4">
        <div className="text-4xl mb-3 opacity-60">👤</div>
        لا يوجد مستخدمين
      </div>
    );
  }

  return (
    <>
      {/* Mobile / tablet cards */}
      <div className="md:hidden p-3 sm:p-4 space-y-3">
        {users.map((u) => (
          <UserCard key={u.uid ?? u.id} user={u} firebaseRoles={firebaseRoles} {...actions} />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-right min-w-[720px]">
          <thead>
            <tr className="bg-[#f9f6f0] border-b border-gray-100">
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500">المستخدم</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500">الدور</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 hidden lg:table-cell">القسم</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500">الحالة</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 hidden xl:table-cell">تاريخ الإنشاء</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid ?? u.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3 justify-end">
                    <div className="min-w-0 text-right">
                      <p className="font-semibold text-gray-900 truncate max-w-[180px] lg:max-w-[220px]">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[180px] lg:max-w-[220px]" dir="ltr">
                        {u.email}
                      </p>
                    </div>
                    <UserAvatar name={u.fullName} className="w-9 h-9 text-xs" />
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <RoleBadge role={u.role} firebaseRoles={firebaseRoles} />
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-500 hidden lg:table-cell max-w-[120px] truncate">
                  {u.department || "—"}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3.5 text-gray-500 text-xs hidden xl:table-cell whitespace-nowrap">
                  {fmtDate(u.createdAt)}
                </td>
                <td className="px-4 py-3.5">
                  <UserActions user={u} {...actions} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
