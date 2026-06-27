import React, { useState, useEffect, useCallback } from "react";
<<<<<<< HEAD
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, PauseCircle, X, Upload } from "lucide-react";
import { useToast } from "../lib/toast";
import AddPaymentModal from "./AddPaymentModal";
import EditTripModal from "./EditTripModal";
=======
import { useNavigate, useParams } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, PauseCircle, X, Upload } from "lucide-react";
import { useToast } from "../lib/toast";
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8

const BASE_URL = "https://drivo1.elmoroj.com/api";

// ======= Icons =======
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const ImageIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const TransferArrowIcon = () => (
  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

<<<<<<< HEAD
// ======= ConfirmAssignDialog =======
function ConfirmAssignDialog({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans" dir="rtl">
      <div className="w-full max-w-xs rounded-3xl bg-white shadow-2xl p-8 flex flex-col items-center gap-5 text-center">
        <h2 className="text-xl font-bold text-[#c9a84c]">تأكيد</h2>
        <p className="text-sm text-gray-700 leading-relaxed">هل تم الاتفاق مع سائق لهذه الرحلة ؟</p>
        <div className="flex gap-3 w-full">
          <button onClick={onConfirm} className="flex-1 rounded-2xl bg-[#4a4746] py-3 text-sm font-bold text-white hover:bg-black transition-colors">نعم</button>
          <button onClick={onCancel} className="flex-1 rounded-2xl border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">إلغاء</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ======= AssignTripModal =======
function AssignTripModal({ isOpen, onClose, tripId, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    trip_number: "",
    driver_phone: "",
    commission: "",
    amount_paid: "",
    total_price: "",
    account_from: "",
    account_to: "",
    transfer_method: "البنك",
    transfer_image: null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("trip_number", formData.trip_number);
      fd.append("driver_phone", formData.driver_phone);
      fd.append("commission", formData.commission);
      fd.append("amount_paid", formData.amount_paid);
      fd.append("total_price", formData.total_price);
      fd.append("account_from", formData.account_from);
      fd.append("account_to", formData.account_to);
      fd.append("transfer_method", formData.transfer_method);
      if (formData.transfer_image) fd.append("transfer_image", formData.transfer_image);

      const res = await fetch(`${BASE_URL}/trips/${tripId}/assign`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("فشل الإسناد");
      toast.success("تم إسناد الرحلة بنجاح");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans" dir="rtl"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-[#f5f0e8] shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#f5f0e8] rounded-t-2xl border-b border-black/5">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
          <h3 className="text-base font-bold text-gray-800">إسناد رحلة جديدة</h3>
          <div className="w-5" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-5 pt-4 space-y-4">

          {/* المعلومات الأساسية */}
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-[#c9a84c] text-right">$ معلومات اساسية</p>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 text-right">رقم الرحله</label>
              <input type="text" placeholder="اكتب رقم الرحلة" value={formData.trip_number}
                onChange={(e) => set("trip_number", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-400 focus:outline-none text-right" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 text-right">هاتف السائق</label>
              <input type="tel" placeholder="أدخل هاتف السائق" value={formData.driver_phone}
                onChange={(e) => set("driver_phone", e.target.value)} dir="ltr"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-400 focus:outline-none text-right" />
              <button type="button" className="text-xs text-[#c9a84c] text-right mt-0.5 w-fit self-end">
                السائق غير موجود؟ إضافة سائق
              </button>
            </div>
          </div>

          {/* التفاصيل المالية */}
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-[#c9a84c] text-right">$ التفاصيل المالية</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 text-right">عمولتنا</label>
                <input type="number" placeholder="ادخل العمولة..." value={formData.commission}
                  onChange={(e) => set("commission", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-400 focus:outline-none text-right" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 text-right">المدفوع</label>
                <input type="number" placeholder="ادخل المبلغ المدفوع" value={formData.amount_paid}
                  onChange={(e) => set("amount_paid", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-400 focus:outline-none text-right" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 text-right">سعر الرحلة الكاملة</label>
              <input type="number" placeholder="ادخل سعر الرحلة" value={formData.total_price}
                onChange={(e) => set("total_price", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-400 focus:outline-none text-right" />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-[#c9a84c] text-right">حساب التحويل</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 text-right">من</label>
                  <input type="text" placeholder="ادخل اسم الحساب" value={formData.account_from}
                    onChange={(e) => set("account_from", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-400 focus:outline-none text-right" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 text-right">إلى</label>
                  <input type="text" placeholder="ادخل اسم الحساب" value={formData.account_to}
                    onChange={(e) => set("account_to", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-400 focus:outline-none text-right" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 text-right">طريقة التحويل</label>
                <div className="relative">
                  <select value={formData.transfer_method} onChange={(e) => set("transfer_method", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 focus:border-amber-400 focus:outline-none">
                    <option>البنك</option>
                    <option>تحويل بنكي</option>
                    <option>كاش</option>
                    <option>محفظة إلكترونية</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="fill-current h-3.5 w-3.5" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 text-right">رفع صورة التحويل</label>
                <label className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-gray-400" />
                  <span>{formData.transfer_image ? formData.transfer_image.name.slice(0, 10) + "..." : "اختر الملف"}</span>
                  <input type="file" className="hidden" accept="image/*"
                    onChange={(e) => set("transfer_image", e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-2xl bg-[#4a4746] py-3.5 text-sm font-bold text-white hover:bg-black transition-colors disabled:opacity-60">
            {loading ? "جاري الإسناد..." : "إسناد رحلة"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

=======
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
// ======= AddNoteModal =======
function AddNoteModal({ isOpen, onClose, onSave }) {
  const [text, setText] = useState("");
  if (!isOpen) return null;
  const handleSave = () => { if (!text.trim()) return; onSave(text.trim()); setText(""); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-800">إضافة ملاحظة</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب الملاحظة هنا..." rows={4}
          className="w-full border border-gray-200 rounded-xl p-3 text-xs text-gray-700 resize-none outline-none focus:border-[#c9a84c] transition-colors" dir="rtl" />
        <div className="flex items-center gap-2 mt-4 justify-start">
          <button onClick={handleSave} className="bg-[#4a4746] text-white text-xs px-5 py-2 rounded-lg hover:bg-[#b8943f] transition-colors">حفظ</button>
          <button onClick={onClose} className="border border-gray-200 text-gray-500 text-xs px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ======= RefundModal =======
function RefundModal({ isOpen, onClose, tripId, amountPaid, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: "", method: "", accountName: "", iban: "", bankTo: "", bankName: "", reason: "" });
  if (!isOpen) return null;
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}/refund`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: formData.amount, method: formData.method, account_name: formData.accountName, iban: formData.iban, bank_to: formData.bankTo, bank_name: formData.bankName, reason: formData.reason }),
      });
      if (!res.ok) throw new Error("فشل طلب الاسترداد");
      toast.success("تم معالجة طلب الاسترداد بنجاح"); onSuccess?.(); onClose();
    } catch (err) { toast.error(err.message || "حدث خطأ أثناء معالجة الاسترداد"); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans" dir="rtl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[440px] rounded-2xl bg-white shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto text-right space-y-4 animate-in fade-in zoom-in-95 duration-200 hide-scrollbar">
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div><h3 className="text-sm font-bold text-gray-800">معالجة طلب استرداد</h3><p className="text-[10px] text-gray-400 mt-1 leading-tight">أدخل تفاصيل المبلغ المراد استرداد</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-[#fffcf5] border border-amber-200 rounded-xl p-3 text-center">
          <span className="text-gray-600 text-[11px]">المبلغ الإجمالي المدفوع : <strong className="text-[#c9a84c] font-bold">{amountPaid ?? "—"} ريال</strong></span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">المبلغ المسترد (ريال)</label><input type="number" placeholder="ادخل المبلغ" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 focus:border-[#c9a84c] focus:outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">طريقة الاسترداد</label><select value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none bg-white appearance-none"><option value="" disabled>اختر طريقة الاسترداد</option><option value="bank">تحويل بنكي</option><option value="cash">نقدي</option></select></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">اسم صاحب الحساب</label><input type="text" placeholder="اسم صاحب الحساب" value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none" /></div>
          <input type="text" placeholder="رقم الايبان" value={formData.iban} onChange={(e) => setFormData({...formData, iban: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none" />
          <input type="text" placeholder="البنك المحول له" value={formData.bankTo} onChange={(e) => setFormData({...formData, bankTo: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none" />
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">سبب الاسترداد</label><textarea rows="3" placeholder="ادخل اي ملاحظات اضافية" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none resize-none" /></div>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="w-full rounded-xl bg-[#595959] py-3 text-sm font-bold text-white hover:bg-[#404040] transition-colors disabled:opacity-60">{loading ? "جارٍ المعالجة..." : "معالجة الاسترداد"}</button>
      </div>
    </div>
  );
}

// ======= ChangeStatusModal =======
function ChangeStatusModal({ isOpen, onClose, tripId, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("progress");
  const [reason, setReason] = useState("");
  if (!isOpen) return null;
  const statuses = [
    { id: "progress",  label: "قيد التنفيذ", icon: <Clock className="w-5 h-5 text-blue-600" /> },
    { id: "completed", label: "مكتملة",       icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
    { id: "cancelled", label: "ملغية",        icon: <XCircle className="w-5 h-5 text-red-500" /> },
    { id: "suspended", label: "معلقة",        icon: <PauseCircle className="w-5 h-5 text-amber-600" /> },
  ];
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}/change-status`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, reason }),
      });
      if (!res.ok) throw new Error("فشل تغيير الحالة");
      toast.success("تم تغيير حالة الرحلة بنجاح"); onSuccess?.(); onClose();
    } catch (err) { toast.error(err.message || "حدث خطأ"); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans" dir="rtl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[420px] rounded-3xl bg-white shadow-2xl p-6 flex flex-col text-right relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 left-5 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <div className="mb-5"><h3 className="text-lg font-bold text-gray-800">تغيير حالة الرحلة</h3><p className="text-[13px] text-gray-500 mt-1">اختر الحالة الجديدة وأدخل سبب التغيير</p></div>
        <label className="text-sm font-bold text-gray-700 mb-3 block">الحالة الجديدة</label>
        <div className="space-y-3 mb-5">
          {statuses.map((s) => {
            const isSelected = selectedStatus === s.id;
            return (
              <div key={s.id} onClick={() => setSelectedStatus(s.id)} className={`flex items-center border rounded-xl p-3.5 cursor-pointer transition-all ${isSelected ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-gray-800" : "border-gray-300"}`}>{isSelected && <div className="w-2 h-2 bg-gray-800 rounded-full" />}</div>
                  {s.icon}<span className="text-sm font-medium text-gray-700">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-sm font-bold text-gray-700">سبب التغيير</label>
          <textarea rows="3" placeholder="ادخل اي ملاحظات اضافية" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-gray-400 focus:outline-none resize-none" />
        </div>
        <button onClick={handleSubmit} disabled={loading} className="w-full rounded-xl bg-[#595959] py-3.5 text-sm font-bold text-white hover:bg-[#404040] transition-colors disabled:opacity-60">{loading ? "جارٍ التأكيد..." : "تأكيد التغيير"}</button>
      </div>
    </div>
  );
}

<<<<<<< HEAD
// ======= EditTripDataModal =======
=======
// ======= AddPaymentModal (TripDetailsPage) =======
function AddPaymentModal({ isOpen, onClose, tripId, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: "", date: "", accountFrom: "", accountTo: "", method: "", notes: "", proof: null });
  if (!isOpen) return null;
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("amount", formData.amount); fd.append("date", formData.date);
      fd.append("account_from", formData.accountFrom); fd.append("account_to", formData.accountTo);
      fd.append("method", formData.method); fd.append("notes", formData.notes);
      if (formData.proof) fd.append("proof", formData.proof);
      const res = await fetch(`${BASE_URL}/trips/${tripId}/add-payment`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("فشل إضافة الدفعة");
      toast.success("تمت إضافة الدفعة بنجاح"); onSuccess?.(); onClose();
    } catch (err) { toast.error(err.message || "حدث خطأ"); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans" dir="rtl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto text-right space-y-4 animate-in fade-in zoom-in-95 duration-200 hide-scrollbar">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-bold text-gray-800">إضافة دفعة جديدة</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">المبلغ</label><input type="number" placeholder="ادخل المبلغ" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">التاريخ</label><input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">الحساب المحول منه</label><input type="text" placeholder="ادخل اسم الحساب" value={formData.accountFrom} onChange={(e) => setFormData({...formData, accountFrom: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">الحساب المحول إليه</label><input type="text" placeholder="ادخل اسم الحساب" value={formData.accountTo} onChange={(e) => setFormData({...formData, accountTo: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">طريقة التحويل</label><select value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none bg-white appearance-none"><option value="" disabled>البنك</option><option value="bank">تحويل بنكي</option><option value="cash">نقدي</option></select></div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">إثبات التحويل</label>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-[11px] text-gray-600 hover:bg-gray-50 font-bold">
              <Upload className="w-3.5 h-3.5" /><span>اختر الملف</span>
              <input type="file" className="hidden" onChange={(e) => setFormData({ ...formData, proof: e.target.files[0] })} />
            </label>
            {formData.proof && <span className="text-[10px] text-emerald-600 truncate px-1">{formData.proof.name}</span>}
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-600">ملاحظة</label><textarea rows="3" placeholder="أضف ملاحظة (اختياري)" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs focus:border-[#c9a84c] focus:outline-none resize-none" /></div>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="w-full rounded-xl bg-[#595959] py-3 text-sm font-bold text-white hover:bg-[#404040] transition-colors disabled:opacity-60">{loading ? "جارٍ الحفظ..." : "حفظ"}</button>
      </div>
    </div>
  );
}

// ======= EditTripDataModal =======
function EditTripDataModal({ isOpen, onClose, tripId, trip, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ price: "", city: "", from: "", to: "", driver: "", customerName: "", phone: "" });
  useEffect(() => {
    if (isOpen && trip) {
      setFormData({ price: trip.total_price ?? "", city: trip.city ?? "", from: trip.from ?? "", to: trip.to ?? "", driver: trip.driver?.name ?? "", customerName: trip.customer?.name ?? "", phone: trip.customer?.phone ?? "" });
    }
  }, [isOpen, trip]);
  if (!isOpen) return null;
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}/update`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_price: formData.price, city: formData.city, from: formData.from, to: formData.to, driver_name: formData.driver, customer_name: formData.customerName, customer_phone: formData.phone }),
      });
      if (!res.ok) throw new Error("فشل تعديل بيانات الرحلة");
      toast.success("تم تعديل بيانات الرحلة بنجاح"); onSuccess?.(); onClose();
    } catch (err) { toast.error(err.message || "حدث خطأ"); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans" dir="rtl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[500px] rounded-3xl bg-white shadow-2xl p-6 flex flex-col max-h-[92vh] overflow-y-auto text-right space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-5 left-5 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-bold text-gray-800 mb-2">تعديل بيانات الرحلة</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-600">نقطة الانطلاق</label><input type="text" value={formData.from} onChange={(e) => setFormData({...formData, from: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#c9a84c] outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-600">نقطة الوصول</label><input type="text" value={formData.to} onChange={(e) => setFormData({...formData, to: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#c9a84c] outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-600">المدينة</label><input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#c9a84c] outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-600">السعر</label><input type="text" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#c9a84c] outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-600">اسم السائق</label><input type="text" value={formData.driver} onChange={(e) => setFormData({...formData, driver: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#c9a84c] outline-none" /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-600">اسم العميل</label><input type="text" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#c9a84c] outline-none" /></div>
          <div className="flex flex-col gap-1.5 col-span-2"><label className="text-xs font-bold text-gray-600">رقم الهاتف</label><input type="text" dir="ltr" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-[#c9a84c] outline-none text-right" /></div>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="w-full rounded-xl bg-[#c9a84c] py-3.5 text-sm font-bold text-white hover:bg-[#b8943f] mt-4 transition-colors disabled:opacity-60">{loading ? "جارٍ الحفظ..." : "حفظ التعديلات"}</button>
      </div>
    </div>
  );
}
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8

// ======= Main Component =======
export default function TripDetailsPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const toast = useToast();

  const tabs = [
    { id: "trip", label: "بيانات الرحلة" },
    { id: "financial", label: "التفاصيل الماليه" },
    { id: "notes", label: "الملاحظات" },
  ];

  const [trip, setTrip] = useState(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [tripError, setTripError] = useState(null);
  const [noteList, setNoteList] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
<<<<<<< HEAD
  const [showAssignConfirm, setShowAssignConfirm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
=======
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8

  const fetchTrip = useCallback(async () => {
    setTripLoading(true); setTripError(null);
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}`);
      if (!res.ok) throw new Error("فشل تحميل بيانات الرحلة");
      const data = await res.json();
      setTrip(data?.data ?? data);
    } catch (err) { setTripError(err.message || "حدث خطأ أثناء تحميل البيانات"); }
    finally { setTripLoading(false); }
  }, [tripId]);

  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}/notes`);
      if (!res.ok) throw new Error("");
      const data = await res.json();
      setNoteList(data?.data ?? data ?? []);
    } catch { /* silently keep existing */ }
    finally { setNotesLoading(false); }
  }, [tripId]);

  useEffect(() => { fetchTrip(); fetchNotes(); }, [fetchTrip, fetchNotes]);

  const handleAddNote = async (text) => {
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}/notes`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error("فشل حفظ الملاحظة");
      toast.success("تمت إضافة الملاحظة"); fetchNotes();
    } catch (err) { toast.error(err.message || "حدث خطأ"); }
  };

  if (tripLoading) {
    return (
      <div className="w-full min-h-screen bg-[#f5f0e8] flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <svg className="w-8 h-8 animate-spin text-[#c9a84c]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">جارٍ تحميل بيانات الرحلة...</span>
        </div>
      </div>
    );
  }

  if (tripError) {
    return (
      <div className="w-full min-h-screen bg-[#f5f0e8] flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 flex flex-col items-center gap-3 text-center max-w-sm">
          <XCircle className="w-10 h-10 text-red-400" />
          <p className="text-sm font-bold text-gray-700">{tripError}</p>
          <button onClick={fetchTrip} className="mt-2 bg-[#4a4746] text-white text-xs px-5 py-2 rounded-lg hover:bg-[#383534] transition-colors">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  const statusStyles = { suspended: "border-[#c9a84c] text-[#c9a84c] bg-[#fffcf5]", completed: "border-emerald-400 text-emerald-600 bg-emerald-50", cancelled: "border-red-400 text-red-600 bg-red-50", progress: "border-blue-400 text-blue-600 bg-blue-50" };
  const statusLabels = { suspended: "معلقة", completed: "مكتملة", cancelled: "ملغية", progress: "قيد التنفيذ" };
  const currentStatus = trip?.trip_status ?? "suspended";

  return (
    <div className="w-full min-h-screen bg-[#f5f0e8] font-sans flex flex-col gap-4 p-4 md:p-6" dir="rtl">
      {/* كارت العنوان */}
      <div className="w-full bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#4a4746] font-bold text-lg mb-4 w-fit">
              <ArrowRightIcon />
              <span>تفاصيل الرحلة #{trip?.id ?? tripId}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#4a4746] text-white text-xs px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {trip?.trip_type ?? "فردي"}
              </span>
              <span className="border border-gray-200 text-gray-500 text-xs px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                {trip?.route_type ?? "مسار واحد"}
              </span>
              <span className="border border-gray-200 text-gray-500 text-xs px-4 py-1.5 rounded-lg shadow-sm">{trip?.subscription_type ?? "اشتراك"}</span>
              <span className={`border text-xs px-4 py-1.5 rounded-lg shadow-sm ${statusStyles[currentStatus] ?? statusStyles.suspended}`}>{statusLabels[currentStatus] ?? currentStatus}</span>
            </div>
          </div>
<<<<<<< HEAD
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowAssignConfirm(true)} className="flex items-center gap-1.5 bg-[#c9a84c] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#b8943f] transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              إسناد
            </button>
=======
          <div className="flex gap-2">
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
            <button onClick={() => setShowStatusModal(true)} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"><RefreshIcon /> تغيير الحالة</button>
            <button onClick={() => setShowEditTripModal(true)} className="flex items-center gap-1.5 bg-[#4a4746] text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-[#383534] transition-colors shadow-sm"><EditIcon /> تعديل الرحلة</button>
          </div>
        </div>
      </div>

      {/* كارت التابات */}
      <div className="w-full bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="mx-6 mt-6 mb-2 bg-[#f4efe8] p-1.5 rounded-full flex gap-1 shadow-inner border border-gray-100 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 whitespace-nowrap text-[13px] font-bold rounded-full transition-all duration-300 ${activeTab === tab.id ? "bg-white text-gray-800 shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-white/40"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 bg-[#faf9f6] flex-1 rounded-b-[1.5rem]">
          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-800 text-sm">الملاحظات الإدارية</h3>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm"><PlusIcon /> اضافة ملاحظة</button>
              </div>
              {notesLoading ? (
                <div className="flex justify-center py-8"><svg className="w-6 h-6 animate-spin text-[#c9a84c]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg></div>
              ) : (
                <div className="space-y-3">
                  {noteList.length === 0 && <p className="text-center text-gray-400 text-xs py-6">لا توجد ملاحظات حتى الآن</p>}
                  {noteList.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-[1.2rem] p-5 shadow-sm text-right flex flex-col hover:border-[#c9a84c] transition-colors">
                      <p className="text-gray-800 font-bold text-sm mb-3">{note.text ?? note.content ?? "—"}</p>
                      <p className="text-gray-400 text-xs text-left w-full mt-auto">{note.date ?? note.created_at ?? "—"} . <span className="font-medium text-gray-500">{note.author ?? note.created_by ?? "—"}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Trip Data Tab */}
          {activeTab === "trip" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-gray-800 font-bold mb-3 text-sm"><span className="text-[#c9a84c]">📍</span><span>مسار الرحلة</span></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                  <div><span className="text-gray-400 block mb-1">نقطة الانطلاق:</span><span className="font-medium">{trip?.from ?? "—"}</span></div>
                  <div><span className="text-gray-400 block mb-1">نقطة الوصول:</span><span className="font-medium">{trip?.to ?? "—"}</span></div>
                  <div><span className="text-gray-400 block mb-1">المدينة:</span><span className="font-medium">{trip?.city ?? "—"}</span></div>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div>
                <div className="flex items-center gap-2 text-gray-800 font-bold mb-3 text-sm"><span className="text-[#c9a84c]">📅</span><span>مواعيد الرحلة</span></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                  <div><span className="text-gray-400 block mb-1">تاريخ البداية:</span><span className="font-medium">{trip?.trip_date ?? "—"}</span></div>
                  <div><span className="text-gray-400 block mb-1">تاريخ النهاية:</span><span className="font-medium">{trip?.end_date ?? "—"}</span></div>
                  <div><span className="text-gray-400 block mb-1">ايام التشغيل:</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(trip?.days ?? []).length > 0 ? trip.days.map((day, idx) => <span key={idx} className="border border-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-md bg-white shadow-sm">{day}</span>) : <span className="text-gray-400 text-[10px]">—</span>}
                    </div>
                  </div>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="bg-white border border-gray-200 rounded-[1.2rem] p-5 shadow-sm text-right">
                  <h4 className="font-bold text-gray-800 text-sm mb-4 border-b border-gray-100 pb-2">معلومات السائق</h4>
                  <div className="space-y-2 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-1"><span className="text-gray-400">👤 الاسم:</span><span className="font-medium">{trip?.driver?.name ?? "—"}</span></div>
                    <div className="flex items-center gap-1"><span className="text-gray-400">📞 الهاتف:</span><span className="font-medium" dir="ltr">{trip?.driver?.phone ?? "—"}</span></div>
                  </div>
                  <button className="w-full border border-gray-200 text-gray-500 rounded-xl py-2 text-xs font-semibold hover:bg-gray-50 transition-colors">عرض الملف الشخصي</button>
                </div>
                <div className="bg-white border border-gray-200 rounded-[1.2rem] p-5 shadow-sm text-right">
                  <h4 className="font-bold text-gray-800 text-sm mb-4 border-b border-gray-100 pb-2">معلومات العميل</h4>
                  <div className="space-y-2 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-1"><span className="text-gray-400">👤 الاسم:</span><span className="font-medium">{trip?.customer?.name ?? "—"}</span></div>
                    <div className="flex items-center gap-1"><span className="text-gray-400">📞 الهاتف:</span><span className="font-medium" dir="ltr">{trip?.customer?.phone ?? "—"}</span></div>
                  </div>
                  <button className="w-full border border-gray-200 text-gray-500 rounded-xl py-2 text-xs font-semibold hover:bg-gray-50 transition-colors">عرض الملف الشخصي</button>
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === "financial" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-4 pb-2">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5"><span className="text-[#c9a84c] text-lg font-serif">$</span> التفاصيل المالية</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowRefundModal(true)} className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-600 text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-gray-50 shadow-sm"><RefreshIcon /> معالجة إسترداد</button>
                  <button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-1.5 bg-[#4a4746] text-white text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-[#383534] shadow-sm"><PlusIcon /> اضافة دفعه</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#eef4ff] border border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center text-center"><span className="text-blue-500 text-xs font-bold mb-2">إجمالي سعر الرحلة</span><span className="text-blue-600 text-xl font-bold">{trip?.total_price ?? "—"} ريال</span></div>
                <div className="bg-[#ecfdf5] border border-green-200 rounded-xl p-4 flex flex-col items-center justify-center text-center"><span className="text-green-500 text-xs font-bold mb-2">المبلغ المدفوع</span><span className="text-green-600 text-xl font-bold">{trip?.amount_paid ?? "—"} ريال</span></div>
                <div className="bg-[#fef2f2] border border-red-200 rounded-xl p-4 flex flex-col items-center justify-center text-center"><span className="text-red-500 text-xs font-bold mb-2">الرصيد المستحق</span><span className="text-red-600 text-xl font-bold">{trip?.remaining_amount ?? "—"} ريال</span></div>
              </div>
              {/* Payment history — requires API endpoint when available */}
              <div className="space-y-4 pt-2">
                <div className="border border-gray-200 rounded-2xl p-5 shadow-sm bg-white">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-2.5"><CheckCircle2 className="w-5 h-5 text-green-500" /><div><div className="font-bold text-gray-800 text-sm">1500 ر.س</div><div className="text-[10px] text-gray-400 mt-0.5">2025-2-1</div></div></div>
                    <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"><ImageIcon /> عرض الإثبات</button>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3"><span className="text-[11px] text-gray-500 w-16">الدافع:</span><span className="border border-gray-200 text-gray-600 bg-white text-[10px] px-4 py-1 rounded-md shadow-sm">السائق</span></div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3"><TransferArrowIcon /><span className="text-[11px] text-gray-600 font-medium">حساب السائق - البنك الاهلي  ←  حساب الشركة الراجحي</span></div>
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2"><span className="text-[11px] text-gray-500">طريقة التحويل:</span><span className="text-[11px] font-bold text-gray-700">تحويل بنكي</span></div>
                    <div className="bg-[#fffcf5] border border-amber-200 rounded-xl p-3.5"><div className="text-[11px] font-bold text-amber-700 mb-1">ملاحظة:</div><div className="text-[11px] text-amber-600 font-medium">دفعة مقدمة للرحلة</div></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddNoteModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAddNote} />
      <RefundModal isOpen={showRefundModal} onClose={() => setShowRefundModal(false)} tripId={tripId} amountPaid={trip?.amount_paid} onSuccess={fetchTrip} />
      <ChangeStatusModal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} tripId={tripId} onSuccess={fetchTrip} />
<<<<<<< HEAD
      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        tripId={tripId}
        onSuccess={(data) => {
          setTrip(prev => prev ? {
            ...prev,
            total_price: data.total_price,
            amount_paid: data.amount_paid,
            remaining_amount: data.remaining_amount,
            transfer_image: data.transfer_image,
          } : prev);
        }}
      />
      <EditTripModal
        isOpen={showEditTripModal}
        onClose={() => setShowEditTripModal(false)}
        trip={trip}
        onSuccess={(updated) => {
          setTrip(prev => prev ? { ...prev, ...updated } : prev);
        }}
      />

      <ConfirmAssignDialog
        isOpen={showAssignConfirm}
        onConfirm={() => { setShowAssignConfirm(false); setShowAssignModal(true); }}
        onCancel={() => setShowAssignConfirm(false)}
      />
      <AssignTripModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        tripId={tripId}
        onSuccess={fetchTrip}
      />
=======
      <AddPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} tripId={tripId} onSuccess={fetchTrip} />
      <EditTripDataModal isOpen={showEditTripModal} onClose={() => setShowEditTripModal(false)} tripId={tripId} trip={trip} onSuccess={fetchTrip} />
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
    </div>
  );
}
