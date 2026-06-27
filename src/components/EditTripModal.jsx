<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useToast } from '../lib/toast';

const BASE_URL = 'https://drivo1.elmoroj.com/api';

/**
 * Shared Edit Trip Modal
 * Props:
 *   isOpen    — boolean
 *   onClose   — () => void
 *   trip      — raw API trip object (pre-fills the form, provides id)
 *   onSuccess — (updatedTrip) => void  called with the API response after save
 */
export default function EditTripModal({ isOpen, onClose, trip, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    from: '', to: '', city: '',
    trip_date: '', end_date: '',
    trip_type: '', subscription_type: '',
    driver_name: '', customer_name: '', customer_phone: '',
    total_price: '',
  });

  useEffect(() => {
    if (isOpen && trip) {
      setForm({
        from:              trip.from              ?? '',
        to:                trip.to                ?? '',
        city:              trip.city              ?? '',
        trip_date:         trip.trip_date         ?? '',
        end_date:          trip.end_date          ?? '',
        trip_type:         trip.trip_type         ?? '',
        subscription_type: trip.subscription_type ?? '',
        driver_name:       trip.driver?.name      ?? trip.driver_name       ?? '',
        customer_name:     trip.customer?.name    ?? trip.customer_name     ?? trip.client_name ?? '',
        customer_phone:    trip.customer?.phone   ?? trip.customer_phone    ?? trip.client_phone ?? '',
        total_price:       trip.total_price       ?? trip.price             ?? '',
      });
    }
  }, [isOpen, trip?.id]);

  if (!isOpen || !trip) return null;

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || `خطأ ${res.status}`);
      toast.success(json.message || 'تم تعديل بيانات الرحلة بنجاح');
      onSuccess?.(json?.trip ?? json?.data ?? json);
      onClose();
    } catch (err) {
      toast.error(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const cls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
=======
import { useState } from "react";

export default function EditTripModal({ trip, onClose, onSave }) {
  const [form, setForm] = useState({
    from: trip?.from || "",
    to: trip?.to || "",
    city: trip?.city || "",
    driver: trip?.driver || "",
    customerName: trip?.customerName || "",
    phone: trip?.customerPhone || "",
    dateFrom: trip?.dateFrom || "",
    dateTo: trip?.dateTo || "",
    timeFrom: trip?.timeFrom || "",
    timeTo: trip?.timeTo || "",
    tripType: trip?.tripType || "",
    subscriptionType: trip?.subscriptionType || "",
    price: trip?.price || "",
    commission: trip?.commission || "",
    remaining: trip?.remaining || "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden" dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-amber-50">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
<<<<<<< HEAD
          <h2 className="text-base font-bold text-gray-800">تعديل الرحلة #{trip.id}</h2>
          <div className="w-5" />
=======
          <h2 className="text-base font-bold text-gray-800">
            تعديل الرحلة {trip?.id ? `#${trip.id}` : ""}
          </h2>
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* مسار الرحلة */}
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3">مسار الرحلة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
<<<<<<< HEAD
              {[['from','من'],['to','إلى'],['city','المدينة']].map(([name, label]) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{label}</label>
                  <input name={name} value={form[name]} onChange={handleChange} className={cls} />
=======
              {[
                { name: "from", label: "من" },
                { name: "to", label: "إلى" },
                { name: "city", label: "المدينة" },
              ].map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{f.label}</label>
                  <input
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
                </div>
              ))}
            </div>
          </div>

<<<<<<< HEAD
          {/* المواعيد */}
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3">المواعيد</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['trip_date','تاريخ البداية'],['end_date','تاريخ النهاية']].map(([name, label]) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{label}</label>
                  <input name={name} type="date" value={form[name]} onChange={handleChange} className={cls} />
=======
          {/* التواريخ والأوقات */}
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3">المواعيد</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "dateFrom", label: "تاريخ البداية" },
                { name: "dateTo", label: "تاريخ النهاية" },
                { name: "timeFrom", label: "وقت الانطلاق" },
                { name: "timeTo", label: "وقت العودة" },
              ].map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{f.label}</label>
                  <input
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
                </div>
              ))}
            </div>
          </div>

          {/* السائق والعميل */}
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3">السائق والعميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<<<<<<< HEAD
              {[['driver_name','السائق'],['customer_name','اسم العميل']].map(([name, label]) => (
                <div key={name} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{label}</label>
                  <input name={name} value={form[name]} onChange={handleChange} className={cls} />
                </div>
              ))}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs text-gray-500">رقم الجوال</label>
                <input name="customer_phone" dir="ltr" value={form.customer_phone} onChange={handleChange} className={cls} />
              </div>
=======
              {[
                { name: "driver", label: "السائق" },
                { name: "customerName", label: "اسم العميل" },
                { name: "phone", label: "رقم الجوال" },
              ].map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{f.label}</label>
                  <input
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    dir={f.name === "phone" ? "ltr" : "rtl"}
                  />
                </div>
              ))}
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
            </div>
          </div>

          {/* نوع الرحلة */}
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3">نوع الرحلة</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">نوع الرحلة</label>
<<<<<<< HEAD
                <select name="trip_type" value={form.trip_type} onChange={handleChange} className={cls}>
                  <option value="">اختر</option>
=======
                <select
                  name="tripType"
                  value={form.tripType}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
                  <option value="ذهاب وعودة">ذهاب وعودة</option>
                  <option value="ذهاب فقط">ذهاب فقط</option>
                  <option value="عودة فقط">عودة فقط</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">نوع الاشتراك</label>
<<<<<<< HEAD
                <select name="subscription_type" value={form.subscription_type} onChange={handleChange} className={cls}>
                  <option value="">اختر</option>
=======
                <select
                  name="subscriptionType"
                  value={form.subscriptionType}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
                  <option value="شهري">شهري</option>
                  <option value="أسبوعي">أسبوعي</option>
                  <option value="يومي">يومي</option>
                </select>
              </div>
            </div>
          </div>

          {/* المالية */}
          <div>
            <h3 className="text-sm font-semibold text-amber-700 mb-3">التفاصيل المالية</h3>
<<<<<<< HEAD
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">السعر الكلي</label>
              <input name="total_price" type="number" value={form.total_price} onChange={handleChange} className={cls} />
=======
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "price", label: "السعر" },
                { name: "commission", label: "العمولة" },
                { name: "remaining", label: "المتبقي" },
              ].map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{f.label}</label>
                  <input
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              ))}
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
            </div>
          </div>

          {/* أزرار */}
          <div className="flex gap-3 pt-2">
<<<<<<< HEAD
            <button type="submit" disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
              {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-white border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
=======
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              حفظ التعديلات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
>>>>>>> bfa305e06ca566f2c1a1d06441b1846613d7cde8
              إلغاء
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
