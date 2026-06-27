<<<<<<< HEAD
import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useToast } from '../lib/toast';

const BASE_URL = 'https://drivo1.elmoroj.com/api';

/**
 * Shared Add Payment Modal
 * Props:
 *   isOpen      — boolean
 *   onClose     — () => void
 *   tripId      — number | string
 *   onSuccess   — (responseData) => void   called after successful submission
 */
export default function AddPaymentModal({ isOpen, onClose, tripId, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount_paid: '',
    transfer_method: 'تحويل بنكي',
    account_number: '',
    recipient_account: '',
    commission_transfer_date: '',
    payment_note: '',
    transfer_image: null,
  });

  if (!isOpen) return null;

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount_paid) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('amount_paid', formData.amount_paid);
      fd.append('transfer_method', formData.transfer_method);
      fd.append('account_number', formData.account_number);
      fd.append('recipient_account', formData.recipient_account);
      fd.append('commission_transfer_date', formData.commission_transfer_date);
      fd.append('payment_note', formData.payment_note);
      if (formData.transfer_image) fd.append('transfer_image', formData.transfer_image);

      const res = await fetch(`${BASE_URL}/trips-without-driver/${tripId}/add-payment`, {
        method: 'POST',
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `خطأ ${res.status}`);

      toast.success(json.message || 'تمت إضافة الدفعة بنجاح');
      onSuccess?.(json);
      onClose();
      setFormData({
        amount_paid: '', transfer_method: 'تحويل بنكي', account_number: '',
        recipient_account: '', commission_transfer_date: '', payment_note: '', transfer_image: null,
      });
    } catch (err) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans"
      dir="rtl"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-base font-semibold text-gray-700">إضافة دفعة جديدة</h3>
          <div className="w-5" />
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">المبلغ المدفوع *</label>
            <input
              type="number" required placeholder="ادخل المبلغ"
              value={formData.amount_paid}
              onChange={(e) => set('amount_paid', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none"
            />
          </div>

=======
import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function AddPaymentModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    fromAccount: '',
    toAccount: '',
    transferMethod: 'bank',
    proof: null,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Payment Data:', formData);
    // هنا يمكنك إضافة الأكشن الخاص بحفظ البيانات أو إرسالها للـ API
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans" dir="rtl">
      {/* الحاوية الرئيسية للمودال */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* الهيدر / العنوان */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-base font-semibold text-gray-700">إضافة دفعة جديدة</h3>
          <div className="w-5"></div> {/* موازن بصري لتوسيط العنوان */}
        </div>

        {/* محتوى النموذج القابل للتمرير */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* حقل المبلغ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">المبلغ</label>
            <input
              type="number"
              placeholder="ادخل المبلغ"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* حقل التاريخ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">التاريخ</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* الحساب المحول منه */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">الحساب المحول منه</label>
            <input
              type="text"
              placeholder="ادخل اسم الحساب"
              value={formData.fromAccount}
              onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          {/* الحساب المحول إليه */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">الحساب المحول إليه</label>
            <input
              type="text"
              placeholder="ادخل اسم الحساب"
              value={formData.toAccount}
              onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none transition-colors"
            />
          </div>

          {/* طريقة التحويل */}
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">طريقة التحويل</label>
            <div className="relative">
              <select
<<<<<<< HEAD
                value={formData.transfer_method}
                onChange={(e) => set('transfer_method', e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:border-amber-500 focus:outline-none bg-white"
              >
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="كاش">كاش</option>
                <option value="محفظة إلكترونية">محفظة إلكترونية</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
=======
                value={formData.transferMethod}
                onChange={(e) => setFormData({ ...formData, transferMethod: e.target.value })}
                className="w-full appearance-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:border-amber-500 focus:outline-none bg-white transition-colors"
              >
                <option value="bank">البنك</option>
                <option value="cash">نقدي</option>
                <option value="wallet">محفظة إلكترونية</option>
              </select>
              {/* سهم مخصص للـ Select يناسب اتجاه اليمين */}
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
              </div>
            </div>
          </div>

<<<<<<< HEAD
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">رقم الحساب</label>
              <input
                type="text" placeholder="123456"
                value={formData.account_number}
                onChange={(e) => set('account_number', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">حساب المستلم</label>
              <input
                type="text" placeholder="78910111"
                value={formData.recipient_account}
                onChange={(e) => set('recipient_account', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">تاريخ التحويل</label>
            <input
              type="date"
              value={formData.commission_transfer_date}
              onChange={(e) => set('commission_transfer_date', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">صورة التحويل</label>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 text-gray-400" />
              <span>{formData.transfer_image ? formData.transfer_image.name : 'اختر الملف'}</span>
              <input type="file" className="hidden" accept="image/*"
                onChange={(e) => set('transfer_image', e.target.files[0])} />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">ملاحظة</label>
            <textarea
              rows="2" placeholder="أضف ملاحظة (اختياري)"
              value={formData.payment_note}
              onChange={(e) => set('payment_note', e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit" disabled={loading}
              className="w-full rounded-xl bg-[#4a4746] py-3 text-sm font-medium text-white hover:bg-black transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
=======
          {/* إثبات التحويل */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">إثبات التحويل</label>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 text-gray-400" />
              <span>اختر الملف</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFormData({ ...formData, proof: e.target.files[0] })}
              />
            </label>
            {formData.proof && (
              <span className="text-xs text-emerald-600 text-left truncate">{formData.proof.name}</span>
            )}
          </div>

          {/* ملاحظة */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">ملاحظة</label>
            <textarea
              rows="3"
              placeholder="أضف ملاحظة (اختياري)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:border-amber-500 focus:outline-none transition-colors resize-none"
            ></textarea>
          </div>

          {/* زر حفظ */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#4a4746] py-3 text-sm font-medium text-white hover:bg-black transition-colors shadow-sm"
            >
              حفظ
            </button>
          </div>

>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
        </form>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
