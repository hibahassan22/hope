import { useState, useEffect, useMemo } from "react";
import RoleSelector from "./RoleSelector.jsx";
import { findSalesByEmail } from "../../services/salesService.js";
import { getDefaultRoleId } from "../../lib/roleUtils.js";
import { sanitizePhoneInput, validatePhone } from "../../lib/phoneValidation.js";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#c9a84c] focus:outline-none bg-white text-right placeholder-gray-300";

const gridCls = "grid grid-cols-1 sm:grid-cols-2 gap-3";

export default function SalesUserForm({
  mode = "create",
  initial = {},
  existingSales = [],
  roles = [],
  defaultRoleId,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const fallbackRole = defaultRoleId ?? getDefaultRoleId(roles);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: fallbackRole,
  });

  useEffect(() => {
    if (mode !== "create" || !roles.length) return;
    const defaultId = getDefaultRoleId(roles);
    setForm((p) => (roles.some((r) => r.id === p.role) ? p : { ...p, role: defaultId }));
  }, [mode, roles]);

  useEffect(() => {
    if (mode === "edit" && initial) {
      setForm({
        fullName: initial.fullName ?? "",
        email: initial.email ?? "",
        phone: initial.phone ?? "",
        role: initial.role ?? fallbackRole,
      });
    }
  }, [mode, initial, fallbackRole]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const emailConflict = useMemo(() => {
    if (mode !== "create" || !form.email.trim()) return null;
    return findSalesByEmail(existingSales, form.email);
  }, [mode, form.email, existingSales]);

  const phoneValidation = useMemo(() => validatePhone(form.phone), [form.phone]);
  const phoneInvalid = form.phone.length > 0 && !phoneValidation.valid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailConflict) return;
    if (!phoneValidation.valid) return;
    onSubmit({ ...form, phone: phoneValidation.normalized ?? form.phone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={gridCls}>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 block text-right">الاسم الكامل</label>
          <input
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="الاسم الكامل"
            className={inputCls}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 block text-right">البريد الإلكتروني</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="email@domain.com"
            dir="ltr"
            className={`${inputCls} ${emailConflict ? "border-red-300 focus:border-red-400" : ""}`}
            required
            disabled={loading || mode === "edit"}
          />
          {emailConflict && (
            <p className="text-[11px] text-red-600 text-right">
              هذا البريد مسجّل مسبقاً للموظف «{emailConflict.name || emailConflict.id}»
            </p>
          )}
        </div>
      </div>

      <div className={gridCls}>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 block text-right">رقم الهاتف</label>
          <input
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => set("phone", sanitizePhoneInput(e.target.value))}
            placeholder="05xxxxxxxx"
            dir="ltr"
            maxLength={10}
            className={`${inputCls} ${phoneInvalid ? "border-red-300 focus:border-red-400" : ""}`}
            required
            disabled={loading}
          />
          {phoneInvalid && (
            <p className="text-[11px] text-red-600 text-right">{phoneValidation.message}</p>
          )}
          {!phoneInvalid && form.phone.length > 0 && (
            <p className="text-[11px] text-gray-400 text-right">9 أو 10 أرقام — مثال: 05xxxxxxxx</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-500 block text-right">الدور</label>
          <RoleSelector value={form.role} onChange={(v) => set("role", v)} roles={roles} />
        </div>
      </div>

      <p className="text-[11px] text-gray-500 text-right leading-relaxed">
        بيانات الموظف تُحفظ في <span className="font-mono">/api/sales</span> والدور يُربط في Firebase بنفس المعرّف.
      </p>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50"
          >
            إلغاء
          </button>
        )}
        <button
          type="submit"
          disabled={loading || (mode === "create" && !!emailConflict) || !phoneValidation.valid}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#4a4644] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-black transition-colors disabled:opacity-60"
        >
          {loading ? "جارٍ الحفظ..." : mode === "create" ? "إضافة موظف" : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
