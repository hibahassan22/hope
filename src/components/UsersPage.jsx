import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useToast } from "../lib/toast.jsx";
import UserForm from "./users/UserForm.jsx";
import UserTable from "./users/UserTable.jsx";
import AppModal, { ConfirmModal } from "./ui/AppModal";
import {
  subscribeUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  fetchRoles,
  fetchDepartments,
} from "../services/userService.js";
import { ROLE_LABELS, STATUS_LABELS, USER_STATUSES } from "../lib/roles.js";

const PAGE_SIZE = 10;

const selectCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:border-[#c9a84c] focus:outline-none bg-white text-right appearance-none";

function FilterSelect({ value, onChange, children }) {
  return (
    <div className="relative w-full">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        {children}
      </select>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function UsersPageContent() {
  const { user: currentUser } = useAuthContext();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchRoles().then(setRoles).catch(() => {});
    fetchDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeUsers(
      (list) => {
        setUsers(list);
        setLoading(false);
      },
      { search, role: filterRole, status: filterStatus }
    );
    return unsub;
  }, [search, filterRole, filterStatus]);

  const currentUserName = currentUser?.fullName ?? currentUser?.displayName ?? "مجهول";
  const currentUserPosition = ROLE_LABELS[currentUser?.role] ?? "موظف";

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paged = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (form) => {
    setSubmitting(true);
    try {
      await createUser(form);
      toast.success("تم إنشاء المستخدم بنجاح");
      setShowCreate(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      await updateUser(editUser.uid ?? editUser.id, {
        fullName: form.fullName,
        phone: form.phone,
        department: form.department,
        role: form.role,
        permissions: form.permissions,
        status: form.status,
      });
      toast.success("تم تحديث المستخدم");
      setEditUser(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteUser(deleteTarget.uid ?? deleteTarget.id);
      toast.success("تم حذف المستخدم");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (u, status) => {
    try {
      await updateUserStatus(u.uid ?? u.id, status);
      toast.success(status === "active" ? "تم التفعيل" : "تم التعليق");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReset = async (u) => {
    try {
      const res = await resetUserPassword(u.uid ?? u.id);
      toast.success("تم إنشاء رابط إعادة التعيين");
      if (res.resetLink) window.prompt("رابط إعادة التعيين (انسخه وأرسله للمستخدم):", res.resetLink);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 p-2 sm:p-4 lg:p-0" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-xl px-4 sm:px-5 py-4 border border-gray-200/60 shadow-sm text-right">
        <h1 className="text-lg sm:text-xl font-bold text-[#c9a84c]">المستخدمين</h1>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          إدارة مستخدمي لوحة التحكم — إنشاء الحسابات للمدير فقط
        </p>
      </div>

      {/* Current user */}
      <div className="bg-[#fffcf5] border border-amber-100 rounded-xl px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs text-gray-500">المستخدم الحالي</p>
        <div className="text-right sm:text-left">
          <p className="text-sm font-bold text-gray-800 break-words">{currentUserName}</p>
          <span className="inline-block mt-1 text-xs font-normal text-[#c9a84c] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {currentUserPosition}
          </span>
        </div>
      </div>

      {/* Create user */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-800 text-right order-2 sm:order-1">
            إنشاء مستخدم جديد
          </h2>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center gap-1.5 bg-[#4a4644] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-black transition-colors"
          >
            {showCreate ? "إخفاء النموذج" : "إضافة مستخدم"}
          </button>
        </div>
        {showCreate && (
          <div className="pt-2 border-t border-gray-50">
            <UserForm
              mode="create"
              roles={roles}
              departments={departments}
              onSubmit={handleCreate}
              loading={submitting}
            />
          </div>
        )}
      </div>

      {/* Users list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="px-3 sm:px-5 py-4 border-b border-gray-50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-800 text-right">
              سجل المستخدمين
              <span className="mr-2 text-xs font-normal text-gray-400">({users.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="بحث بالاسم أو البريد..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-right focus:border-[#c9a84c] focus:outline-none sm:col-span-2 lg:col-span-1"
            />
            <FilterSelect value={filterRole} onChange={(v) => { setFilterRole(v); setPage(1); }}>
              <option value="">جميع الأدوار</option>
              {Object.entries(ROLE_LABELS).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </FilterSelect>
            <FilterSelect value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }}>
              <option value="">جميع الحالات</option>
              {Object.values(USER_STATUSES).map((key) => (
                <option key={key} value={key}>{STATUS_LABELS[key]}</option>
              ))}
            </FilterSelect>
          </div>
        </div>

        <UserTable
          users={paged}
          loading={loading}
          onEdit={setEditUser}
          onDelete={setDeleteTarget}
          onStatusChange={handleStatus}
          onResetPassword={handleReset}
        />

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 py-3 px-3 border-t border-gray-50">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 disabled:opacity-40"
            >
              السابق
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-bold border transition-colors ${
                  page === n
                    ? "bg-[#c9a84c] text-white border-[#c9a84c]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AppModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="تعديل المستخدم"
        isSubmitting={submitting}
        size="lg"
      >
        {editUser && (
          <UserForm
            mode="edit"
            initial={editUser}
            roles={roles}
            departments={departments}
            onSubmit={handleEdit}
            onCancel={() => setEditUser(null)}
            loading={submitting}
          />
        )}
      </AppModal>

      {/* Delete modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message={deleteTarget ? <>حذف <span className="font-bold text-gray-900">{deleteTarget.fullName}</span>؟</> : ""}
        confirmLabel="حذف"
        isSubmitting={submitting}
        variant="danger"
      />
    </div>
  );
}

export default function UsersPage() {
  return <UsersPageContent />;
}
