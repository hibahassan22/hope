import { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

const BASE_URL = 'https://drivo1.elmoroj.com/api';

const fmt = (v) => (v != null && v !== '') ? Number(v).toLocaleString('ar-SA') : null;

const Row = ({ label, value }) => (
  value != null && value !== '' && value !== '—' ? (
    <div className="flex justify-between border-b border-gray-50 pb-2 text-xs last:border-0 last:pb-0">
      <span className="text-gray-400 shrink-0 ml-4">{label}</span>
      <span className="text-gray-700 font-medium text-right">{value}</span>
    </div>
  ) : null
);

const Section = ({ title, children }) => {
  const hasContent = Array.isArray(children)
    ? children.some(Boolean)
    : Boolean(children);
  if (!hasContent) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5">
      <p className="text-xs font-bold text-[#c9a84c] mb-3">{title}</p>
      {children}
    </div>
  );
};

const statusLabels = {
  suspended: 'معلقة', completed: 'مكتملة', cancelled: 'ملغية', progress: 'قيد التنفيذ',
  تم: 'مكتملة',
};
const statusStyles = {
  suspended: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
  progress:   'bg-blue-100 text-blue-700',
  تم:         'bg-emerald-100 text-emerald-700',
};

/**
 * Shared Trip Detail Modal
 * Props:
 *   isOpen  — boolean
 *   onClose — () => void
 *   tripId  — number | string
 */
export default function TripDetailModal({ isOpen, onClose, tripId }) {
  const [trip, setTrip]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!isOpen || !tripId) return;
    setTrip(null);
    setError(null);
    setLoading(true);
    fetch(`${BASE_URL}/trips/${tripId}`, { headers: { Accept: 'application/json' } })
      .then(r => { if (!r.ok) throw new Error(`فشل تحميل البيانات (${r.status})`); return r.json(); })
      .then(d => setTrip(d?.data ?? d?.trip ?? d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, tripId]);

  if (!isOpen) return null;

  const d = trip;
  const st = d?.trip_status ?? '';
  const remaining = d
    ? Number(d.remaining_amount ?? 0) || Math.max(0, Number(d.total_price ?? 0) - Number(d.amount_paid ?? 0))
    : 0;
  const isFullyPaid = d && Number(d.total_price ?? 0) > 0 && remaining <= 0;
  const driverName = d?.driver ? [d.driver.name, d.driver.last_name].filter(Boolean).join(' ') : (d?.driver_name ?? null);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans"
      dir="rtl"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[#f9f7f3] shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-2xl border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <h3 className="text-base font-bold text-gray-800">
              تفاصيل الرحلة {d ? `#${d.id}` : ''}
            </h3>
            {d && st && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusStyles[st] ?? 'bg-gray-100 text-gray-600'}`}>
                {statusLabels[st] ?? st}
              </span>
            )}
            {isFullyPaid && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" /> مدفوع بالكامل
              </span>
            )}
          </div>
          <div className="w-5" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-right">
              {error}
            </div>
          )}

          {!loading && !error && !d && (
            <p className="text-center text-sm text-gray-400 py-10">لا توجد بيانات</p>
          )}

          {!loading && !error && d && (
            <>
              {/* Trip Info */}
              <Section title="$ معلومات الرحلة">
                <Row label="رقم الرحلة"        value={`#${d.id}`} />
                <Row label="تاريخ الرحلة"       value={d.trip_date} />
                <Row label="نوع الرحلة"          value={d.trip_type} />
                <Row label="عدد أيام الرحلة"     value={d.trip_days_count} />
                <Row label="من"                  value={d.from} />
                <Row label="إلى"                 value={d.to} />
                <Row label="المنطقة"             value={d.region ?? d.city} />
                <Row label="هاتف العميل"         value={d.customer_phone} />
                <Row label="حالة الرحلة"         value={statusLabels[st] ?? st} />
                <Row label="حالة الدفع"          value={d.payment_status ?? (isFullyPaid ? 'مدفوع بالكامل' : 'دفع جزئي')} />
                <Row label="بواسطة"              value={d.assisted_by} />
                <Row label="نقاط المكافأة"       value={d.reward_points} />
                <Row label="تاريخ الإنشاء"       value={d.created_at} />
                <Row label="آخر تحديث"           value={d.updated_at} />
              </Section>

              {/* Driver Info */}
              {(driverName || d.driver) && (
                <Section title="👤 معلومات السائق">
                  <Row label="الاسم"        value={driverName} />
                  <Row label="الهاتف"       value={d.driver?.phone} />
                  <Row label="الجنسية"      value={d.driver?.nationality} />
                  <Row label="العنوان"      value={d.driver?.address} />
                  <Row label="نوع السيارة"  value={d.driver?.car_type} />
                  <Row label="موديل السيارة" value={d.driver?.car_model} />
                  <Row label="حجم السيارة"  value={d.driver?.vehicle_size} />
                </Section>
              )}

              {/* Financial Info */}
              <Section title="$ التفاصيل المالية">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-blue-500 font-bold mb-1">إجمالي السعر</p>
                    <p className="text-sm font-bold text-blue-700">{fmt(d.total_price) ?? '—'} ر.س</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-500 font-bold mb-1">المدفوع</p>
                    <p className="text-sm font-bold text-emerald-700">{fmt(d.amount_paid) ?? '—'} ر.س</p>
                  </div>
                  <div className={`border rounded-xl p-3 text-center ${isFullyPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                    <p className={`text-[10px] font-bold mb-1 ${isFullyPaid ? 'text-emerald-500' : 'text-red-500'}`}>المتبقي</p>
                    <p className={`text-sm font-bold ${isFullyPaid ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isFullyPaid ? '0' : (fmt(remaining) ?? '—')} ر.س
                    </p>
                  </div>
                </div>
                <Row label="نسبة العمولة"         value={d.commission_rate ? `${d.commission_rate}%` : null} />
                <Row label="مبلغ العمولة"          value={d.commission_amount ? `${fmt(d.commission_amount)} ر.س` : null} />
                <Row label="طريقة التحويل"         value={d.transfer_method} />
                <Row label="اسم البنك"             value={d.bank_name} />
                <Row label="رقم الحساب"            value={d.account_number} />
                <Row label="تاريخ تحويل العمولة"   value={d.commission_transfer_date} />
                {d.transfer_image && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 mb-1.5">صورة إثبات التحويل</p>
                    <img src={d.transfer_image} alt="إثبات التحويل"
                      className="w-full max-h-48 object-contain rounded-xl border border-gray-100 bg-gray-50" />
                  </div>
                )}
              </Section>

              {/* Sales Reps */}
              {Array.isArray(d.sales) && d.sales.length > 0 && (
                <Section title="👥 مندوبو المبيعات">
                  {d.sales.map((s, i) => (
                    <div key={s.id ?? i} className="bg-gray-50 rounded-xl p-3 space-y-1">
                      <Row label="الاسم"          value={s.name} />
                      <Row label="الهاتف"         value={s.phone} />
                      <Row label="البريد"         value={s.email} />
                      <Row label="الحالة"         value={s.status} />
                    </div>
                  ))}
                </Section>
              )}

              {/* Refund */}
              {(d.refund_request_status || d.refund_amount) && (
                <Section title="↩️ معلومات الاسترداد">
                  <Row label="حالة طلب الاسترداد" value={d.refund_request_status} />
                  <Row label="المبلغ المسترد"      value={d.refund_amount ? `${fmt(d.refund_amount)} ر.س` : null} />
                  <Row label="سبب الاسترداد"       value={d.refund_reason} />
                  <Row label="تاريخ الاسترداد"     value={d.refunded_at} />
                </Section>
              )}

              {/* Cancellation */}
              {d.cancellation_reason && (
                <Section title="❌ معلومات الإلغاء">
                  <Row label="سبب الإلغاء"  value={d.cancellation_reason} />
                  <Row label="تاريخ الإلغاء" value={d.cancelled_at} />
                </Section>
              )}

              {/* Notes */}
              {d.notes && (
                <Section title="📝 ملاحظات">
                  <p className="text-xs text-gray-700 leading-relaxed">{d.notes}</p>
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
