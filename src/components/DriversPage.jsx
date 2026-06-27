import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useToast } from "../lib/toast";
<<<<<<< HEAD
import AddPaymentModal from "./AddPaymentModal";
import TripDetailModal from "./TripDetailModal";
=======
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8

const Portal = ({ children }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
};

const BASE = "https://drivo1.elmoroj.com/api";
const DRIVER_ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const DRIVER_ID_LENGTH = 10;

const createDriverId = () => {
  const values = new Uint32Array(DRIVER_ID_LENGTH);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
  } else {
    values.forEach((_, index) => {
      values[index] = Math.floor(Math.random() * DRIVER_ID_ALPHABET.length);
    });
  }

  return Array.from(values, value => DRIVER_ID_ALPHABET[value % DRIVER_ID_ALPHABET.length]).join("");
};

const createUniqueDriverId = (drivers = []) => {
  const usedIds = new Set(drivers.map(driver => String(driver.id)));
  let id = createDriverId();

  while (usedIds.has(id)) {
    id = createDriverId();
  }

  return id;
};

// ── Status config ─────────────────────────────────────────────
const STATUS_MAP = {
  1: { label:"نشط",           cls:"bg-green-100 text-green-700 border border-green-200" },
  2: { label:"مجمد",          cls:"bg-blue-100 text-blue-700 border border-blue-200" },
  3: { label:"محظور",         cls:"bg-red-100 text-red-600 border border-red-200" },
  4: { label:"موقوف مؤقتاً", cls:"bg-amber-100 text-amber-700 border border-amber-200" },
};
const statusLabel = (s) => STATUS_MAP[s]?.label ?? "غير مسجل";
const statusColor = (s) => STATUS_MAP[s]?.cls ?? "bg-gray-100 text-gray-500 border border-gray-200";

// ── Progress Bar ──────────────────────────────────────────────
const ProgressBar = ({ value }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full bg-green-500" style={{ width: `${value}%` }} />
    </div>
    <span className="text-[10px] text-gray-500">{value}%</span>
  </div>
);

// ── Spinner ───────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Action Icons ──────────────────────────────────────────────
const ActionIcons = ({ onDelete, onEdit, onView }) => (
  <div className="flex items-center gap-1.5">
    <button onClick={onDelete} className="p-1 text-red-400 hover:text-red-600" title="حذف">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    </button>
    <button onClick={onEdit} className="p-1 text-gray-400 hover:text-blue-600" title="تعديل">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    </button>
    <button onClick={onView} className="p-1 text-gray-400 hover:text-gray-600" title="عرض">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    </button>
  </div>
);

// ── Modals ────────────────────────────────────────────────────
const AlertModal = ({ isOpen, onClose, driverId, onSaved }) => {
  const toast = useToast();
  const [type, setType] = useState("تنبيه");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const handleSend = async () => {
    if (!msg.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/driver-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ driver_id: driverId, type, message: msg.trim() }),
      });
      if (!res.ok) throw new Error(`خطأ ${res.status}`);
      toast.success("تم إرسال الإشعار بنجاح");
      setMsg(""); onSaved?.(); onClose();
    } catch (err) { toast.error(err.message || "فشل إرسال الإشعار"); }
    finally { setLoading(false); }
  };
  return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
          <h3 className="text-base font-bold text-gray-800">إرسال إشعار / تنبيه</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-right">نوع الإشعار</label>
            <div className="relative">
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white text-right appearance-none">
                <option>تنبيه</option><option>إنذار</option><option>رسالة عادية</option>
              </select>
              <div className="absolute left-3 top-3 pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-right">الرسالة</label>
            <textarea rows="4" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="اكتب رسالة التنبيه..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white resize-none text-right placeholder-gray-300"/>
          </div>
          <button onClick={handleSend} disabled={loading || !msg.trim()} className="w-full bg-[#4a4a4a] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60">{loading ? "جارٍ الإرسال..." : "إرسال الإشعار"}</button>
        </div>
      </div>
    </div>
  </Portal>);
};

const PauseModal = ({ isOpen, onClose, driverId, onSaved }) => {
  const toast = useToast();
  const [duration, setDuration] = useState("24 ساعة");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/driver-pause/${driverId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ duration, reason }),
      });
      if (!res.ok) throw new Error(`خطأ ${res.status}`);
      toast.success("تم إيقاف السائق مؤقتاً");
      onSaved?.(); onClose();
    } catch (err) { toast.error(err.message || "فشل الإيقاف"); }
    finally { setLoading(false); }
  };
  return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
          <h3 className="text-base font-bold text-gray-800">إيقاف مؤقت للسائق</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-right">مدة الإيقاف</label>
            <div className="relative">
              <select value={duration} onChange={e=>setDuration(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white text-right appearance-none">
                <option>24 ساعة</option><option>48 ساعة</option><option>أسبوع</option>
              </select>
              <div className="absolute left-3 top-3 pointer-events-none text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 block text-right">السبب</label>
            <textarea rows="4" value={reason} onChange={e=>setReason(e.target.value)} placeholder="أدخل سبب الإيقاف..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white resize-none text-right placeholder-gray-300"/>
          </div>
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs">
            <span className="text-base">⚠️</span>
            <p>خلال فترة الإيقاف، لن يتمكن السائق من استقبال رحلات جديدة</p>
          </div>
          <button onClick={handleConfirm} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">{loading ? "جارٍ الإيقاف..." : "تأكيد الإيقاف"}</button>
        </div>
      </div>
    </div>
  </Portal>);
};

const FreezeModal = ({ isOpen, onClose, driverName, driverId, onSaved }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/driver-freeze/${driverId}`, {
        method: "POST", headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`خطأ ${res.status}`);
      toast.success("تم تجميد حساب السائق");
      onSaved?.(); onClose();
    } catch (err) { toast.error(err.message || "فشل التجميد"); }
    finally { setLoading(false); }
  };
  return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
          <h3 className="text-base font-bold text-gray-800">تجميد حساب السائق</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-2 text-right">
            <h4 className="font-bold">ماذا يعني التجميد؟</h4>
            <ul className="space-y-1 text-xs"><li>• منع استقبال رحلات جديدة</li><li>• السماح بتصفية الحسابات المالية فقط</li><li>• يمكن إلغاء التجميد في أي وقت</li></ul>
          </div>
          <p className="text-sm text-gray-700 text-center font-medium">هل أنت متأكد من تجميد حساب {driverName}؟</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors">إلغاء</button>
            <button onClick={handleConfirm} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">{loading ? "جارٍ التجميد..." : "تأكيد التجميد"}</button>
          </div>
        </div>
      </div>
    </div>
  </Portal>);
};

const BlockModal = ({ isOpen, onClose, driverName, driverId, onSaved }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/driver-block/${driverId}`, {
        method: "POST", headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`خطأ ${res.status}`);
      toast.success("تم حظر السائق نهائياً");
      onSaved?.(); onClose();
    } catch (err) { toast.error(err.message || "فشل الحظر"); }
    finally { setLoading(false); }
  };
  return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
          <h3 className="text-base font-bold text-gray-800">حظر نهائي للسائق</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800 space-y-2 text-right">
            <h4 className="font-bold flex items-center gap-1.5 justify-end">⚠️ تحذير: إجراء نهائي</h4>
            <ul className="space-y-1 text-xs"><li>• منع تسجيل الدخول نهائياً</li><li>• لن يتمكن من استخدام التطبيق</li><li>• سيظهر في النظام كـ "محظور"</li></ul>
          </div>
          <p className="text-sm text-gray-700 text-center leading-relaxed">هل أنت متأكد من حظر {driverName} نهائياً؟ هذا الإجراء لا يمكن التراجع عنه بسهولة.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors">إلغاء</button>
            <button onClick={handleConfirm} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60">{loading ? "جارٍ الحظر..." : "تأكيد الحظر النهائي"}</button>
          </div>
        </div>
      </div>
    </div>
  </Portal>);
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, driverName, loading }) => {
  if (!isOpen) return null;
  return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center space-y-5 mx-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
          <p className="text-sm text-gray-500">هل أنت متأكد أنك تريد حذف <span className="font-bold text-gray-800">{driverName}</span>؟</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-sm">إلغاء</button>
          <button onClick={onConfirm} disabled={loading} className="w-full bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60">
            {loading ? "جارٍ الحذف..." : "حذف السائق"}
          </button>
        </div>
      </div>
    </div>
  </Portal>);
};

// ── Driver Form Modal (Add / Edit) ───────────────────────────
const GENDER_OPTIONS = ["ذكر", "أنثى"];
const normalizeGender = (gender) => {
  const value = String(gender ?? "").trim().toLowerCase();
  if (value === "ذكر" || value === "male" || value === "m") return "ذكر";
  if (value === "أنثى" || value === "انثى" || value === "female" || value === "f") return "أنثى";
  return "";
};
const genderToApiValue = (gender) => {
  if (gender === "ذكر") return "male";
  if (gender === "أنثى") return "female";
  return "";
};

// Field helper — خارج المودال عشان ميتعملش re-mount كل render
const FormField = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-gray-500 block text-right">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder || label}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] bg-white text-right placeholder-gray-300"
    />
  </div>
);

const GenderSelect = ({ value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-gray-500 block text-right">الجنس *</label>
    <select
      value={value}
      onChange={onChange}
      required
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] bg-white text-right appearance-none"
    >
      <option value="">اختر الجنس</option>
      {GENDER_OPTIONS.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const FileUpload = ({ label, name, files, onFileChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-gray-500 block text-right">{label}</label>
    <label className="flex flex-col items-center justify-center gap-1 w-full border-2 border-dashed border-gray-200 rounded-xl py-4 cursor-pointer hover:bg-gray-50 text-gray-400 text-xs transition-colors">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
      {files?.[name]?.name
        ? <span className="text-[#c9a84c] font-medium">{files[name].name}</span>
        : <span>اختر ملف الصورة او سحبها هنا</span>
      }
      <input type="file" className="hidden" accept="image/*" onChange={e => onFileChange(name, e.target.files[0])}/>
    </label>
  </div>
);

const DriverFormModal = ({ isOpen, onClose, driverData, onSaved, onToast }) => {
  const isEditing = Boolean(driverData);
  const [form, setForm] = useState({
    name:"", phone:"", address:"", nationality:"", gender:"", email:"",
    bank_name:"", account_owner:"", iban:"",
    car_type:"", car_model:"", vehicle_size:""
  });
  const [fileMap, setFileMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSuccess(false);
    setFileMap({});
    if (driverData) {
      setForm({
        name: driverData.name||"", phone: driverData.phone||"",
        address: driverData.address||"", nationality: driverData.nationality||"",
        gender: normalizeGender(driverData.gender), email: driverData.email||"",
        bank_name:"", account_owner:"", iban:"",
        car_type: driverData.car_type||"", car_model: driverData.car_model||"",
        vehicle_size: driverData.vehicle_size||""
      });
    } else {
      setForm({ name:"", phone:"", address:"", nationality:"", gender:"", email:"", bank_name:"", account_owner:"", iban:"", car_type:"", car_model:"", vehicle_size:"" });
    }
  }, [isOpen, driverData?.id]);

  if (!isOpen) return null;

  const u = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}));
  const onFileChange = (k, file) => setFileMap(f => ({...f, [k]: file}));
  const isGenderSelected = GENDER_OPTIONS.includes(form.gender);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGenderSelected) {
      onToast?.("error", "يرجى اختيار الجنس");
      return;
    }
    setSaving(true);
    try {
      let url;
      const apiForm = { ...form, gender: genderToApiValue(form.gender) };

      if (isEditing) {
        // تعديل سائق — FormData عشان الصور
        url = `${BASE}/driverstest/update/${driverData.id}`;
        const fd = new FormData();
        Object.entries(apiForm).forEach(([k,v]) => { if(v) fd.append(k, v); });
        Object.entries(fileMap).forEach(([k,file]) => { if(file) fd.append(k, file); });
        const res = await fetch(url, { method: "POST", body: fd });
        if (res.ok || res.status < 500) {
          setSuccess(true);
          onSaved();
          onToast?.("success", "تم تعديل بيانات السائق بنجاح");
          setTimeout(() => { setSuccess(false); onClose(); }, 800);
        }
      } else {
        url = `${BASE}/drivers`;

        const existingRes = await fetch(url, { headers: { Accept: "application/json" } });
        if (!existingRes.ok) throw new Error("فشل تحميل السائقين للتحقق من معرف جديد");

        const existingDrivers = await existingRes.json().catch(() => []);
        const driverId = createUniqueDriverId(Array.isArray(existingDrivers) ? existingDrivers : []);

        const payload = {
          id:        driverId,
          fcm_token: `web_${driverId}`,
          city_id:   1,
          region:    1,
          ...apiForm,
        };

        // Always use FormData so the server accepts the request
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== "" && v !== null && v !== undefined) fd.append(k, v);
        });
        Object.entries(fileMap).forEach(([k, file]) => {
          if (file) fd.append(k, file);
        });

        const res = await fetch(url, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: fd,
        });

        if (res.ok) {
          const refreshedRes = await fetch(url, { headers: { Accept: "application/json" } });
          const refreshedDrivers = refreshedRes.ok ? await refreshedRes.json().catch(() => []) : [];
          const driverExists = Array.isArray(refreshedDrivers) && refreshedDrivers.some(driver => String(driver.id) === driverId);

          if (!driverExists) {
            onToast?.("error", "تم إرسال الطلب لكن لم يظهر السائق في القائمة");
            return;
          }

          setSuccess(true);
          onSaved();
          onToast?.("success", "تم إضافة السائق بنجاح");
          setTimeout(() => { setSuccess(false); onClose(); }, 800);
        } else {
          const err = await res.json().catch(() => ({}));
          onToast?.("error", err?.message ?? "حدث خطأ أثناء الإضافة");
        }
      }
    } catch (err) { console.error(err); onToast?.("error", err.message || "حدث خطأ، حاول مجدداً"); }
    finally { setSaving(false); }
  };

  return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <h3 className="text-base font-bold text-gray-800">{isEditing ? "تعديل بيانات السائق" : "إضافة سائق جديد"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/40">

          {/* المعلومات الشخصية */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-[#c9a84c] text-right">$ المعلومات الشخصية</h4>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="رقم الهاتف" value={form.phone} onChange={u("phone")} placeholder="ادخل الرقم"/>
              <FormField label="اسم السائق" value={form.name} onChange={u("name")} placeholder="ادخل اسم السائق"/>
              <FormField label="الجنسية" value={form.nationality} onChange={u("nationality")} placeholder="ادخل جنسية السائق"/>
              <FormField label="المدينه" value={form.address} onChange={u("address")} placeholder="ادخل مدينة السائق"/>
              <GenderSelect value={form.gender} onChange={u("gender")}/>
              <FormField label="البريد الإلكتروني" value={form.email} onChange={u("email")} type="email" placeholder="ادخل بريد السائق"/>
            </div>
            <FileUpload label="صورة الهوية" name="identity_image" files={fileMap} onFileChange={onFileChange}/>
          </div>

          {/* المعلومات المالية */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-[#c9a84c] text-right">$ المعلومات المالية</h4>
            <FormField label="اسم البنك" value={form.bank_name} onChange={u("bank_name")} placeholder="ادخل اسم البنك"/>
            <FormField label="اسم صاحب الحساب" value={form.account_owner} onChange={u("account_owner")} placeholder="ادخل اسم صاحب الحساب"/>
            <p className="text-[10px] text-gray-400 text-right">لابد ان يتطابق مع اسم السائق</p>
            <FormField label="الآيبان" value={form.iban} onChange={u("iban")} placeholder="ادخل رقم الآيبان"/>
          </div>

          {/* معلومات السيارة */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-[#c9a84c] text-right">$ معلومات السيارة</h4>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="موديل السيارة" value={form.car_model} onChange={u("car_model")} placeholder="ادخل موديل السيارة"/>
              <FormField label="نوع السيارة" value={form.car_type} onChange={u("car_type")} placeholder="ادخل نوع السيارة"/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 block text-right">حجم السيارة</label>
              <select value={form.vehicle_size} onChange={u("vehicle_size")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] bg-white text-right appearance-none">
                <option value="">اختر حجم السيارة</option>
                <option value="صغيرة">صغيرة (4 ركاب)</option>
                <option value="متوسطه">متوسطة (5-6 ركاب)</option>
                <option value="كبيرة">كبيرة (7+ ركاب)</option>
              </select>
            </div>
            <FileUpload label="صورة السيارة" name="car_image" files={fileMap} onFileChange={onFileChange}/>
            <FileUpload label="صورة الرخصة" name="license_image" files={fileMap} onFileChange={onFileChange}/>
          </div>

          <button type="submit" disabled={saving || success || !isGenderSelected}
            className={`w-full font-bold py-3 rounded-xl text-sm transition-colors ${success ? "bg-green-600 text-white" : "bg-[#4a4644] text-white hover:bg-black disabled:opacity-60"}`}>
            {success ? "✓ تم الحفظ بنجاح" : saving ? "جارٍ الحفظ..." : isEditing ? "حفظ التعديلات" : "إضافة سائق"}
          </button>
        </form>
      </div>
    </div>
  </Portal>);
};

// ── Assign Trip Modal ─────────────────────────────────────────
const AssignTripModal = ({ isOpen, onClose }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  if (!isOpen) return null;
  if (showConfirm) return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8 text-center space-y-6 mx-4">
        <h2 className="text-2xl font-bold text-[#c9a84c]">تأكيد</h2>
        <p className="text-base text-gray-700">هل تم الاتفاق مع سائق لهذه الرحلة ؟</p>
        <div className="flex gap-3">
          <button onClick={()=>{setShowConfirm(false);onClose();}} className="flex-1 py-3 rounded-xl bg-[#4a4644] text-white text-sm font-semibold">نعم</button>
          <button onClick={()=>setShowConfirm(false)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold">إلغاء</button>
        </div>
      </div>
    </div>
  </Portal>);
  return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
          <h3 className="text-base font-bold text-gray-800">إسناد رحلة جديدة</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/40">
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-[#c9a84c] text-right">$ معلومات اساسية</h4>
            <div className="space-y-1"><label className="text-xs text-gray-500 block text-right">رقم الرحله</label><input type="text" placeholder="اكتب رقم الرحلة" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none bg-white text-right"/></div>
            <div className="space-y-1"><label className="text-xs text-gray-500 block text-right">هاتف السائق</label><input type="tel" placeholder="أدخل هاتف السائق" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none bg-white text-right"/></div>
          </div>
        </div>
        <div className="p-4 bg-[#4a4644]">
          <button onClick={()=>setShowConfirm(true)} className="w-full py-3 text-sm font-bold text-white rounded-xl">إسناد رحلة</button>
        </div>
      </div>
    </div>
  </Portal>);
};

// ── Add Note Modal ────────────────────────────────────────────
const AddNoteModal = ({ isOpen, onClose, driverId, onSaved }) => {
  if (!isOpen) return null;
  const [message, setMessage] = useState("");
  const [type, setType]       = useState("ملاحظة");
  const [rating, setRating]   = useState("");
  const [date, setDate]       = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");

  const submit = async () => {
    if (!message.trim()) return;
    setSaving(true); setErr("");
    try {
      const body = {
        driver_id:      driverId,
        message:        message.trim(),
        type,
        violation_date: date,
        ...(rating ? { rating: Number(rating) } : {}),
      };
      const r = await fetch(`${BASE}/driver-violations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok || r.status < 500) {
        setMessage(""); setType("ملاحظة"); setRating(""); setErr("");
        onSaved?.();
        onClose();
      } else {
        setErr(data?.message ?? `خطأ ${r.status}`);
      }
    } catch (e) { setErr("حدث خطأ، حاول مجدداً"); }
    finally { setSaving(false); }
  };

  return (<Portal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
          <h3 className="text-base font-semibold text-gray-800">إضافة ملاحظة / مخالفة</h3>
        </div>
        <div className="p-5 space-y-3">
          {err && <p className="text-xs text-red-500 text-right bg-red-50 rounded-xl px-3 py-2">{err}</p>}
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block text-right">النوع</label>
            <select value={type} onChange={e=>setType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white text-right appearance-none">
              <option>ملاحظة</option>
              <option>شكوى</option>
              <option>إنذار</option>
              <option>مخالفة</option>
              <option>تنبيه</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500 block text-right">الرسالة *</label>
            <textarea rows="4" value={message} onChange={e=>setMessage(e.target.value)} placeholder="اكتب الملاحظة هنا..." className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none resize-none text-right placeholder-gray-300"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 block text-right">التاريخ</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none text-right"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 block text-right">التقييم (اختياري)</label>
              <input type="number" min="1" max="5" value={rating} onChange={e=>setRating(e.target.value)} placeholder="1-5" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none text-right"/>
            </div>
          </div>
          <button onClick={submit} disabled={saving || !message.trim()} className="w-full rounded-xl bg-[#4a4644] py-3 text-sm font-semibold text-white hover:bg-black transition-colors disabled:opacity-60">
            {saving ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  </Portal>);
};

// ── Driver Trips Tab ──────────────────────────────────────────
const TRIP_STATUS = {
  completed:  { label:"مكتملة",      cls:"bg-green-600 text-white" },
  in_progress:{ label:"قيد التنفيذ", cls:"bg-blue-600 text-white" },
  cancelled:  { label:"ملغية",       cls:"bg-red-600 text-white" },
  pending:    { label:"معلقة",       cls:"bg-gray-400 text-white" },
};
const tripStatusInfo = (s) => TRIP_STATUS[s] || { label: s||"—", cls:"bg-gray-200 text-gray-600" };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("ar-EG") : "—";

const DriverTripsTab = ({ driverId, tripsCount, totalDues }) => {
<<<<<<< HEAD
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [paymentModal, setPaymentModal]   = useState({ open: false, tripId: null });
  const [detailModal,  setDetailModal]    = useState({ open: false, tripId: null });
=======
  const [trips, setTrips]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
  const PER_PAGE = 5;

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}/driver-trips/${driverId}`)
      .then(r => r.json())
      .then(d => { setTrips(Array.isArray(d.trips) ? d.trips : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [driverId]);

  const totalPages = Math.max(1, Math.ceil(trips.length / PER_PAGE));
  const paged = trips.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-100 rounded-xl p-4 flex items-center justify-between bg-white">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"linear-gradient(135deg,#9C6402,#E6C76A)"}}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1"/></svg>
          </div>
          <div className="text-right"><p className="text-xl font-bold">{totalDues||"0"} ر.س</p><p className="text-xs text-gray-400">إجمالي المستحقات</p></div>
        </div>
        <div className="border border-gray-100 rounded-xl p-4 flex items-center justify-between bg-white">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:"linear-gradient(135deg,#9C6402,#E6C76A)"}}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7"/></svg>
          </div>
          <div className="text-right"><p className="text-xl font-bold">{tripsCount||trips.length||0}</p><p className="text-xs text-gray-400">إجمالي عدد الرحلات</p></div>
        </div>
      </div>

      {/* Trip cards */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : paged.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">لا توجد رحلات للعرض</p>
      ) : (
        paged.map(trip => {
          const st = tripStatusInfo(trip.status);
          const isSubscription = trip.type === "subscription" || trip.subscription_type;
<<<<<<< HEAD
          const tripId = trip.trip_id ?? trip.id;  // driver-trips API returns trip_id
          return (
            <div key={tripId ?? trip.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
=======
          return (
            <div key={trip.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
              <div className="flex flex-col md:flex-row">
                {/* Trip info */}
                <div className="flex-1 p-4 space-y-2.5">
                  {/* Row 1: id + badges + client */}
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {trip.client_name && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        {trip.client_name}
                      </span>
                    )}
                    {isSubscription && <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">اشتراك</span>}
                    {trip.is_registered === false && <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full">غير مسجل</span>}
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${st.cls}`}>{st.label}</span>
<<<<<<< HEAD
                    <span className="font-bold text-gray-800 text-sm">#{tripId}</span>
=======
                    <span className="font-bold text-gray-800 text-sm">#{trip.id}</span>
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
                    <span className="text-lg font-bold text-amber-600">{trip.price||trip.total_price||"—"} ر.س</span>
                  </div>

                  {/* Row 2: route */}
                  <div className="flex items-center justify-end gap-1.5 text-sm text-gray-700">
                    <span className="text-xs text-gray-400">{trip.city||""}</span>
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    <span className="text-gray-500 text-xs">{trip.to||""}</span>
                    <span className="text-gray-400">←</span>
                    <span className="font-semibold text-xs">{trip.from||""}</span>
                  </div>

                  {/* Row 3: dates + driver + client info */}
                  <div className="flex items-center justify-end flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>{fmtDate(trip.date_from)} — {fmtDate(trip.date_to)}</span>
                    {trip.driver_name && <span>السائق: <span className="font-medium text-gray-700">{trip.driver_name}</span></span>}
                    {trip.client_phone && <span>{trip.client_phone}</span>}
                    {trip.client_fullname && <span>العميل: <span className="font-medium text-gray-700">{trip.client_fullname}</span></span>}
                  </div>

                  {/* Row 4: financials */}
                  {(trip.commission || trip.remaining) && (
                    <div className="flex items-center justify-end gap-4 text-xs">
                      {trip.remaining  && <span>المتبقي: <span className="text-amber-600 font-semibold">{trip.remaining} ر.س</span></span>}
                      {trip.commission && <span>العمولة: <span className="text-amber-600 font-semibold">{trip.commission} ر.س</span></span>}
                    </div>
                  )}
                </div>

                {/* Actions column */}
                <div className="border-t md:border-t-0 md:border-r border-gray-100 bg-gray-50/60 px-3 py-3 flex md:flex-col gap-2 justify-center items-stretch md:w-32 shrink-0">
<<<<<<< HEAD
                  <button
                    onClick={() => setPaymentModal({ open: true, tripId })}
                    className="flex items-center justify-center gap-1 bg-[#474747] text-white text-xs py-1.5 px-2 rounded-lg hover:bg-black transition-colors">
=======
                  <button className="flex items-center justify-center gap-1 bg-[#474747] text-white text-xs py-1.5 px-2 rounded-lg hover:bg-black transition-colors">
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    إضافة دفعة
                  </button>
                  <button className="flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 text-xs py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    تغيير الحالة
                  </button>
<<<<<<< HEAD
                  <button
                    onClick={() => tripId && setDetailModal({ open: true, tripId })}
                    disabled={!tripId}
                    className="flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 text-xs py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
=======
                  <button className="flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 text-xs py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    عرض التفاصيل
                  </button>
                  <button className="flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 text-xs py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    تعديل
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Pagination */}
      {trips.length > PER_PAGE && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          {Array.from({length: totalPages}, (_,i) => i+1).map(n => (
            <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${page===n ? "bg-[#c9a84c] text-white border-[#c9a84c]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}
<<<<<<< HEAD

      <AddPaymentModal
        isOpen={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, tripId: null })}
        tripId={paymentModal.tripId}
        onSuccess={(data) => {
          setTrips(prev => prev.map(t => {
            const tId = t.trip_id ?? t.id;
            return tId === paymentModal.tripId
              ? { ...t, total_price: data.total_price, amount_paid: data.amount_paid, remaining: data.remaining_amount, transfer_image: data.transfer_image }
              : t;
          }));
        }}
      />

      <TripDetailModal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, tripId: null })}
        tripId={detailModal.tripId}
      />
=======
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
    </div>
  );
};
// ── Driver Violations Tab ─────────────────────────────────────
const VIOLATION_TYPE = {
  تنبيه:  { cls: "bg-blue-100 text-blue-600 border border-blue-200" },
  إنذار:  { cls: "bg-red-100 text-red-500 border border-red-200" },
  ملاحظة: { cls: "bg-amber-100 text-amber-600 border border-amber-200" },
};
const violationInfo = (t) => VIOLATION_TYPE[t] || { cls: "bg-gray-100 text-gray-500 border border-gray-200" };
const fmtViolDate = (d) => d ? new Date(d).toLocaleDateString("ar-EG", { year:"numeric", month:"2-digit", day:"2-digit" }).replace(/\//g, "-") : "—";

const DriverViolationsTab = ({ driverId, refreshKey }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState(false);

  useEffect(() => {
    setLoading(true);
    setApiError(false);
    // Parse response — API returns { driver: {...}, violations: [...] }
    fetch(`${BASE}/driver-violations/${driverId}`, { headers: { Accept: "application/json" } })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        const list = Array.isArray(d.violations) ? d.violations
                   : Array.isArray(d.data)       ? d.data
                   : Array.isArray(d)             ? d
                   : [];
        setViolations(list);
        setLoading(false);
      })
      .catch(() => { setApiError(true); setLoading(false); });
  }, [driverId, refreshKey]);

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (apiError) return (
    <div className="text-center py-8 space-y-2">
      <p className="text-sm text-gray-400">هذه الخاصية غير متاحة حالياً</p>
      <p className="text-xs text-gray-300">يرجى التواصل مع فريق الـ backend لتفعيل API المخالفات</p>
    </div>
  );

  if (violations.length === 0) return (
    <p className="text-center text-sm text-gray-400 py-8">لا توجد مخالفات أو تنبيهات</p>
  );

  return (
    <div className="space-y-3">
      {violations.map((v, i) => {
        const info = violationInfo(v.type || v.violation_type);
        return (
          <div key={v.id || i} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-1.5">
            {/* top row: badge + date */}
            <div className="flex items-center justify-end gap-3">
              <span className="text-xs text-gray-400">{fmtViolDate(v.created_at || v.date)}</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${info.cls}`}>
                {v.type || v.violation_type || "تنبيه"}
              </span>
            </div>
            {/* description */}
            <p className="text-sm font-semibold text-gray-800 text-right">
              {v.description || v.reason || v.message || "—"}
            </p>
            {/* by */}
            {(v.by || v.created_by || v.admin_name) && (
              <p className="text-xs text-gray-400 text-right">
                بواسطة: {v.by || v.created_by || v.admin_name}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Driver Ratings Tab ────────────────────────────────────────
const DriverRatingsTab = ({ driverId }) => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}/driver-rating/${driverId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [driverId]);

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const avg     = parseFloat(data?.average_rating) || 0;
  const total   = data?.total_records || 0;
  const details = Array.isArray(data?.details) ? data.details : [];
  const rounded = Math.round(avg * 2) / 2; // round to nearest 0.5

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
        {/* Left: total */}
        <div className="text-center">
          <p className="text-3xl font-extrabold text-gray-800">{total}</p>
          <p className="text-xs text-gray-400 mt-1">إجمالي التقييمات</p>
        </div>
        {/* Right: stars + average */}
        <div className="flex flex-col items-end gap-2">
          <p className="text-xs font-semibold text-gray-500 text-right">متوسط التقييم</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800">{avg > 0 ? avg.toFixed(1) : "—"} / 5</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => {
                const filled = s <= Math.floor(rounded);
                const half   = !filled && s - 0.5 === rounded;
                return (
                  <svg key={s} className={`w-6 h-6 ${filled ? "text-yellow-400" : half ? "text-yellow-300" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Details list */}
      {details.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-6">لا توجد تقييمات بعد</p>
      ) : details.map((item, i) => {
        const itemRating = parseFloat(item.rating) || 0;
        return (
          <div key={item.id || i} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 space-y-2">
            {/* top: name + date */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {item.created_at ? new Date(item.created_at).toLocaleDateString("ar-EG") : "—"}
              </span>
              <div className="flex items-center gap-2">
                {item.client_name && (
                  <span className="text-xs font-semibold text-gray-700">{item.client_name}</span>
                )}
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-4 h-4 ${s <= itemRating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700">{itemRating}/5</span>
              </div>
            </div>
            {/* comment */}
            {(item.comment || item.note || item.review) && (
              <p className="text-sm text-gray-600 text-right">{item.comment || item.note || item.review}</p>
            )}
            {/* trip ref */}
            {item.trip_id && (
              <p className="text-xs text-gray-400 text-right">رحلة #{item.trip_id}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const DriverDetailsPage = ({ driverId, basicDriver, onBack, onEditRequest, onDeleteRequest }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [violRefreshKey, setViolRefreshKey] = useState(0);
  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    setLoadingDetail(true);
    fetch(`${BASE}/drivers/${driverId}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoadingDetail(false); })
      .catch(() => { setDetail(basicDriver); setLoadingDetail(false); });
  }, [driverId]);

  const driver = detail || basicDriver;
  const fullName = [driver.name, driver.last_name].filter(Boolean).join(" ");

  const tabs = [
    { id:"personal",   label:"المعلومات الشخصية" },
    { id:"trips",      label:"سجل الرحلات" },
    { id:"violations", label:"المخالفات والتنبيهات" },
    { id:"notes",      label:"الملاحظات" },
    { id:"ratings",    label:"التقييمات" },
  ];

  return (
    <div dir="rtl" className="w-full space-y-4">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[#c9a84c] text-sm font-semibold hover:opacity-80">
        <span>العودة إلى السائقين</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      {loadingDetail ? <Spinner/> : (
        <>
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Left: action buttons */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              <button onClick={()=>setActiveModal("alert")} className="bg-blue-600 text-white px-3 py-2 rounded-xl">إرسال تنبيه</button>
              <button onClick={()=>setActiveModal("pause")} className="bg-amber-500 text-white px-3 py-2 rounded-xl">إيقاف مؤقت</button>
              <button onClick={()=>setActiveModal("freeze")} className="bg-blue-400 text-white px-3 py-2 rounded-xl">تجميد</button>
              <button onClick={()=>setActiveModal("block")} className="bg-red-600 text-white px-3 py-2 rounded-xl">حظر نهائي</button>
              <button onClick={()=>onEditRequest(driver)} className="border border-gray-200 text-gray-600 px-3 py-2 rounded-xl">تعديل</button>
              <button onClick={()=>onDeleteRequest(driver)} className="border border-red-200 text-red-500 px-3 py-2 rounded-xl">حذف</button>
              <button onClick={()=>setActiveModal("assignTrip")} className="bg-neutral-800 text-white px-3 py-2 rounded-xl">+ إسناد رحلة</button>
            </div>
            {/* Right: name + status + avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800">{fullName}</h2>
                <p className="text-xs text-gray-400 mt-1">{driver.phone}</p>
                <div className="flex gap-2 mt-2 justify-end">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${statusColor(driver.status)}`}>{statusLabel(driver.status)}</span>
                </div>
              </div>
              {driver.car_image
                ? <img src={driver.car_image} alt="" className="w-14 h-14 rounded-full object-cover border border-gray-200"/>
                : <div className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center text-2xl font-bold shrink-0">{(driver.name||"?")[0]}</div>
              }
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium"><span>نسبة اكتمال الملف الشخصي</span><span>{driver.profile_completion||0}%</span></div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{width:`${driver.profile_completion||0}%`}}/></div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex gap-4 text-sm font-semibold text-gray-400 overflow-x-auto">
            {tabs.map(tab=>(
              <span key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className={`px-3 py-1 cursor-pointer whitespace-nowrap transition-colors ${activeTab===tab.id ? "text-[#c9a84c] border-b-2 border-[#c9a84c]" : "hover:text-gray-700"}`}>
                {tab.label}
              </span>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-2">
            {activeTab === "personal" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-[#c9a84c]">المعلومات الشخصية</h3>
                  {[["الاسم",fullName],["الهاتف",driver.phone],["العنوان",driver.address],["الجنسية",driver.nationality],["البريد",driver.email||"—"],["الجنس",driver.gender==="male"?"ذكر":driver.gender==="female"?"أنثى":"—"]].map(([l,v])=>(
                    <div key={l} className="flex justify-between border-b border-gray-50 pb-2 text-sm">
                      <span className="text-gray-400">{l}</span>
                      <span className="text-gray-700 font-medium">{v||"—"}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-[#c9a84c]">معلومات السيارة</h3>
                    {[["نوع السيارة",driver.car_type],["موديل السيارة",driver.car_model],["حجم السيارة",driver.vehicle_size]].map(([l,v])=>(
                      <div key={l} className="flex justify-between border-b border-gray-50 pb-2 text-sm">
                        <span className="text-gray-400">{l}</span>
                        <span className="text-gray-700 font-medium">{v||"—"}</span>
                      </div>
                    ))}
                    {driver.car_image && <img src={driver.car_image} alt="صورة السيارة" className="w-full h-32 object-cover rounded-xl mt-2"/>}
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-[#c9a84c]">الوثائق</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[["رخصة القيادة",driver.license_image],["استمارة السيارة",driver.registration_image]].map(([l,img])=>img&&(
                        <div key={l} className="space-y-1">
                          <p className="text-xs text-gray-400 text-right">{l}</p>
                          <img src={img} alt={l} className="w-full h-24 object-cover rounded-xl"/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "trips" && (
              <DriverTripsTab
                driverId={driverId}
                tripsCount={driver.trips_count}
                totalDues={driver.total_dues}
              />
            )}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <button onClick={()=>setActiveModal("addNote")} className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50 bg-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                    اضافة ملاحظة
                  </button>
                  <h3 className="font-semibold text-gray-700">الملاحظات الإدارية</h3>
                </div>
                <p className="text-center text-sm text-gray-400 py-4">لا توجد ملاحظات</p>
              </div>
            )}
            {activeTab === "violations" && (
              <DriverViolationsTab driverId={driverId} refreshKey={violRefreshKey} />
            )}
            {activeTab === "ratings" && (
              <DriverRatingsTab driverId={driverId} />
            )}
          </div>
        </>
      )}

      <AlertModal isOpen={activeModal==="alert"} onClose={closeModal}/>
      <PauseModal isOpen={activeModal==="pause"} onClose={closeModal}/>
      <FreezeModal isOpen={activeModal==="freeze"} onClose={closeModal} driverName={fullName}/>
      <BlockModal isOpen={activeModal==="block"} onClose={closeModal} driverName={fullName}/>
      <AssignTripModal isOpen={activeModal==="assignTrip"} onClose={closeModal}/>
      <AddNoteModal
        isOpen={activeModal==="addNote"}
        onClose={closeModal}
        driverId={driverId}
        onSaved={() => { setViolRefreshKey(k => k+1); setActiveTab("violations"); }}
      />
    </div>
  );
};

// ── Main DriversPage ──────────────────────────────────────────
const ITEMS_PER_PAGE = 6;

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalState, setModalState] = useState({ type: null, driver: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const closeGlobalModal = () => setModalState({ type: null, driver: null });
  const toast = useToast();

  // Fetch statuses from API
  const [statuses, setStatuses] = useState([]);
  useEffect(() => {
    fetch(`${BASE}/driver-statuses`)
      .then(r => r.json())
      .then(d => setStatuses(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const fetchDrivers = useCallback(() => {
    setLoading(true);
    fetch(`${BASE}/drivers`)
      .then(r => r.json())
      .then(d => { setDrivers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); toast.error("فشل تحميل السائقين"); });
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const executeDelete = async () => {
    if (!modalState.driver) return;
    setDeleteLoading(true);
    try {
      await fetch(`${BASE}/drivers/${modalState.driver.id}`, { method: "DELETE" });
      if (selectedDriver?.id === modalState.driver.id) setSelectedDriver(null);
      fetchDrivers();
      toast.success(`تم حذف السائق بنجاح`);
    } catch (e) { toast.error("فشل حذف السائق"); }
    setDeleteLoading(false);
    closeGlobalModal();
  };

  const totalPages = Math.max(1, Math.ceil(drivers.length / ITEMS_PER_PAGE));
  const paginated = drivers.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);

  if (selectedDriver) return (
    <>
      <DriverDetailsPage
        driverId={selectedDriver.id}
        basicDriver={selectedDriver}
        onBack={()=>setSelectedDriver(null)}
        onEditRequest={d=>setModalState({type:"edit",driver:d})}
        onDeleteRequest={d=>setModalState({type:"delete",driver:d})}
      />
      <DriverFormModal isOpen={modalState.type==="edit"} onClose={closeGlobalModal} driverData={modalState.driver} onSaved={fetchDrivers} onToast={(t,m)=>toast[t](m)}/>
      <DeleteConfirmModal isOpen={modalState.type==="delete"} onClose={closeGlobalModal} onConfirm={executeDelete} driverName={modalState.driver?.name} loading={deleteLoading}/>
    </>
  );

  return (
    <div className="w-full space-y-4" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-xl px-5 py-3 border border-gray-200/60 shadow-sm text-right">
        <h1 className="text-xl font-bold text-[#c9a84c]">قائمة السائقين</h1>
        <p className="text-xs text-gray-400 mt-0.5">إدارة ومتابعة السائقين والمهام بلحظة</p>
      </div>

      {/* Banner */}
      <div className="relative bg-gradient-to-l from-[#b88121] to-[#dca43b] rounded-2xl overflow-hidden min-h-[150px] flex items-center justify-between px-8 shadow-sm">
        <div className="absolute left-4 bottom-0 h-[90%] w-1/3 max-w-[160px] pointer-events-none flex items-end">
          <img src="/path_to_your_image.png" alt="" className="h-full w-full object-contain object-bottom drop-shadow-md"/>
        </div>
        <div className="z-10 text-white text-right">
          <h2 className="text-5xl font-extrabold">{drivers.length} <span className="text-2xl font-normal">سائق</span></h2>
          <p className="text-sm opacity-80 mt-1">عدد السائقين المسجلين</p>
          <button onClick={()=>setModalState({type:"add",driver:null})} className="mt-4 flex items-center gap-2 bg-white text-[#b88121] text-sm font-semibold px-5 py-2 rounded-full shadow hover:bg-amber-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            إضافة سائق جديد
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? <Spinner/> : error ? (
          <p className="text-center text-red-500 text-sm py-10">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="bg-[#f9f6f0] border-b border-gray-100">
                  {["الاسم","رقم الهاتف","المدينة","نوع السيارة","حالة الحساب","عدد الرحلات","المستحقات","اكتمال الملف","إجراءات"].map(h=>(
                    <th key={h} className="px-4 py-3.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(driver=>(
                  <tr key={driver.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800">{[driver.name, driver.last_name].filter(Boolean).join(" ")}</td>
                    <td className="px-4 py-3.5 text-gray-600" dir="ltr">{driver.phone}</td>
                    <td className="px-4 py-3.5 text-gray-600">{driver.address||"—"}</td>
                    <td className="px-4 py-3.5 text-gray-600">{driver.car_type||"—"}</td>
                    <td className="px-4 py-3.5"><span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${statusColor(driver.status)}`}>{statusLabel(driver.status)}</span></td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">{driver.trips_count||0}</td>
                    <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{driver.total_dues||0} ر.س</td>
                    <td className="px-4 py-3.5"><ProgressBar value={driver.profile_completion||0}/></td>
                    <td className="px-4 py-3.5">
                      <ActionIcons
                        onDelete={()=>setModalState({type:"delete",driver})}
                        onEdit={()=>setModalState({type:"edit",driver})}
                        onView={()=>setSelectedDriver(driver)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 py-4 text-xs text-gray-600" dir="ltr">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
              <button key={n} onClick={()=>setPage(n)} className={`w-7 h-7 rounded font-bold transition-colors ${page===n?"bg-amber-500 text-white shadow-sm":"bg-white border border-gray-200 hover:bg-gray-50"}`}>{n}</button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>

      <DriverFormModal isOpen={modalState.type==="add"||modalState.type==="edit"} onClose={closeGlobalModal} driverData={modalState.driver} onSaved={fetchDrivers} onToast={(t,m)=>toast[t](m)}/>
      <DeleteConfirmModal isOpen={modalState.type==="delete"} onClose={closeGlobalModal} onConfirm={executeDelete} driverName={modalState.driver?.name} loading={deleteLoading}/>
    </div>
  );
}

