import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { useToast } from "../lib/toast.jsx";
import { usePermissions } from "../hooks/usePermissions.js";
import { PERMISSIONS } from "../lib/permissions.js";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import SalesUserForm from "./users/SalesUserForm.jsx";
import UserTable from "./users/UserTable.jsx";
import AppModal from "./ui/AppModal";
import {
  fetchSalesList,
  salesRecordToUser,
  filterSalesUsers,
  createSalesRecord,
  updateSalesRecord,
  generateSalesId,
  findSalesByEmail,
  normalizeEmail,
} from "../services/salesService.js";
import { fetchStaffRolesMap, saveStaffRole, syncFirebaseUserRoleByEmail } from "../services/staffRoleService.js";
import { subscribeRoles } from "../services/roleService.js";
import { buildRoleOptions, getRoleLabel, getDefaultRoleId } from "../lib/roleUtils.js";
import { validatePhone } from "../lib/phoneValidation.js";
import { STATUS_LABELS, USER_STATUSES } from "../lib/roles.js";

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
  const { can } = usePermissions();
  const canCreate = can(PERMISSIONS.USERS_CREATE);
  const canEdit = can(PERMISSIONS.USERS_EDIT);

  const [salesUsers, setSalesUsers] = useState([]);
  const [roleMap, setRoleMap] = useState({});
  const [firebaseRoles, setFirebaseRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { searchQuery, setSearchQuery } = useGlobalSearch();
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const loadSalesUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [list, roles] = await Promise.all([
        fetchSalesList(),
        fetchStaffRolesMap().catch(() => ({})),
      ]);
      setSalesUsers(list);
      setRoleMap(roles);
    } catch (err) {
      toast.error(err.message || "فشل تحميل المستخدمين");
      setSalesUsers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const unsub = subscribeRoles(setFirebaseRoles);
    loadSalesUsers();
    return unsub;
  }, [loadSalesUsers]);

  const roleOptions = useMemo(() => buildRoleOptions(firebaseRoles), [firebaseRoles]);

  const users = useMemo(
    () =>
      filterSalesUsers(
        salesUsers.map((sale) => salesRecordToUser(sale, roleMap[String(sale.id)])),
        { search: searchQuery, role: filterRole, status: filterStatus }
      ),
    [salesUsers, roleMap, searchQuery, filterRole, filterStatus]
  );

  const currentUserName = currentUser?.fullName ?? currentUser?.displayName ?? "مجهول";
  const currentUserPosition = getRoleLabel(currentUser?.role, firebaseRoles);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paged = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async (form) => {
    const email = normalizeEmail(form.email);
    const duplicate = findSalesByEmail(salesUsers, email);
    if (duplicate) {
      toast.error(
        `البريد «${email}» مسجّل مسبقاً للموظف «${duplicate.name || duplicate.id}» — استخدم بريداً آخر`
      );
      return;
    }

    const phoneCheck = validatePhone(form.phone);
    if (!phoneCheck.valid) {
      toast.error(phoneCheck.message);
      return;
    }

    setSubmitting(true);
    try {
      const id = generateSalesId();
      await createSalesRecord({
        id,
        name: form.fullName,
        phone: phoneCheck.normalized,
        email: form.email,
      });
      try {
        await saveStaffRole(id, form.role);
        await syncFirebaseUserRoleByEmail(form.email, form.role).catch(() => {});
      } catch (roleErr) {
        toast.error(roleErr.message || "تم حفظ الموظف لكن فشل حفظ الدور");
      }
      toast.success("تم إضافة الموظف بنجاح");
      setShowCreate(false);
      await loadSalesUsers();
    } catch (err) {
      toast.error(err.message || "فشل إضافة الموظف");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (form) => {
    if (!editUser) return;

    const phoneCheck = validatePhone(form.phone);
    if (!phoneCheck.valid) {
      toast.error(phoneCheck.message);
      return;
    }

    setSubmitting(true);
    try {
      const staffId = editUser.uid ?? editUser.id;
      await updateSalesRecord(staffId, {
        name: form.fullName,
        phone: phoneCheck.normalized,
        email: editUser.email,
      });
      try {
        await saveStaffRole(staffId, form.role);
        await syncFirebaseUserRoleByEmail(editUser.email, form.role).catch(() => {});
      } catch (roleErr) {
        toast.error(roleErr.message || "تم تحديث البيانات لكن فشل حفظ الدور");
      }
      toast.success("تم تحديث بيانات الموظف");
      setEditUser(null);
      await loadSalesUsers();
    } catch (err) {
      toast.error(err.message || "فشل تحديث الموظف");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 p-2 sm:p-4 lg:p-0" dir="rtl">
      <div className="bg-white rounded-xl px-4 sm:px-5 py-4 border border-gray-200/60 shadow-sm text-right">
        <h1 className="text-lg sm:text-xl font-bold text-[#c9a84c]">المستخدمين</h1>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          إدارة موظفي خدمة العملاء من نظام المبيعات — <span className="font-mono">GET /api/sales</span>
        </p>
      </div>

      <div className="bg-[#fffcf5] border border-amber-100 rounded-xl px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs text-gray-500">المستخدم الحالي</p>
        <div className="text-right sm:text-left">
          <p className="text-sm font-bold text-gray-800 break-words">{currentUserName}</p>
          <span className="inline-block mt-1 text-xs font-normal text-[#c9a84c] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {currentUserPosition}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-sm font-bold text-gray-800 text-right order-2 sm:order-1">
            إضافة موظف جديد
          </h2>
          <button
            type="button"
            onClick={() => canCreate && setShowCreate((v) => !v)}
            disabled={!canCreate}
            className="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center gap-1.5 bg-[#4a4644] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showCreate ? "إخفاء النموذج" : "إضافة موظف"}
          </button>
        </div>
        {showCreate && (
          <div className="pt-2 border-t border-gray-50">
            <SalesUserForm
              mode="create"
              existingSales={salesUsers}
              roles={roleOptions}
              defaultRoleId={getDefaultRoleId(firebaseRoles)}
              onSubmit={handleCreate}
              loading={submitting}
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-5 py-4 border-b border-gray-50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-800 text-right">
              سجل الموظفين
              <span className="mr-2 text-xs font-normal text-gray-400">({users.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="بحث بالاسم أو البريد أو الهاتف..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-right focus:border-[#c9a84c] focus:outline-none sm:col-span-2 lg:col-span-1"
            />
            <FilterSelect value={filterRole} onChange={(v) => { setFilterRole(v); setPage(1); }}>
              <option value="">جميع الأدوار</option>
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
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
          apiOnly
          firebaseRoles={firebaseRoles}
          onEdit={setEditUser}
          canEdit={canEdit}
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

      <AppModal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="تعديل الموظف"
        isSubmitting={submitting}
        size="lg"
      >
        {editUser && (
          <SalesUserForm
            mode="edit"
            initial={editUser}
            roles={roleOptions}
            onSubmit={handleEdit}
            onCancel={() => setEditUser(null)}
            loading={submitting}
          />
        )}
      </AppModal>
    </div>
  );
}

export default function UsersPage() {
  return <UsersPageContent />;
}
