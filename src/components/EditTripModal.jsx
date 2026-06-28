import { useState, useEffect, useRef } from "react";
import { useToast } from "../lib/toast";
import AppModal, { ModalField, ModalActions, modalInputClass } from "./ui/AppModal";

const API_BASE = "/api";

/** تحويل تاريخ API إلى صيغة yyyy-MM-dd لحقول type="date" */
function toDateInputValue(value) {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return "";
}

/** يقبل فقط yyyy-MM-dd — لا يرسل صيغ مثل 22/6 */
function toApiDateValue(value) {
  return toDateInputValue(value);
}

function parseApiErrors(json) {
  if (!json || typeof json !== "object") return null;
  if (json.errors && typeof json.errors === "object") {
    const lines = Object.entries(json.errors).flatMap(([field, msgs]) => {
      const list = Array.isArray(msgs) ? msgs : [msgs];
      return list.map((m) => `${field}: ${m}`);
    });
    if (lines.length) return lines.join("\n");
  }
  return json.message || json.error || null;
}

function normalizeTripResponse(raw) {
  return raw?.data ?? raw?.trip ?? raw ?? null;
}

function buildFormFromTrip(trip) {
  if (!trip) {
    return {
      from: "", to: "", region: "",
      trip_date: "", end_date: "",
      departure_time: "", return_time: "",
      trip_type: "", subscription_type: "",
      total_price: "", amount_paid: "",
      trip_status: "",
      transfer_method: "", bank_name: "", account_number: "",
      assisted_by: "", customer_phone: "",
    };
  }
  return {
    from: trip.from ?? "",
    to: trip.to ?? "",
    region: trip.region ?? trip.city ?? "",
    trip_date: toDateInputValue(trip.trip_date),
    end_date: toDateInputValue(trip.end_date),
    departure_time: trip.departure_time ?? trip.start_time ?? "",
    return_time: trip.return_time ?? trip.end_time ?? "",
    trip_type: trip.trip_type ?? "",
    subscription_type: trip.subscription_type ?? "",
    total_price: trip.total_price ?? trip.price ?? "",
    amount_paid: trip.amount_paid ?? "",
    trip_status: trip.trip_status ?? "",
    transfer_method: trip.transfer_method ?? "",
    bank_name: trip.bank_name ?? "",
    account_number: trip.account_number ?? "",
    assisted_by: trip.assisted_by ?? "",
    customer_phone: trip.customer_phone ?? trip.customer?.phone ?? "",
  };
}

function valuesEqual(a, b) {
  return String(a ?? "").trim() === String(b ?? "").trim();
}

function friendlyApiError(message) {
  if (!message) return "حدث خطأ أثناء التعديل";
  if (message.includes("محفظة") || message.includes("رصيد")) {
    return "تغيير السعر يتطلب رصيداً كافياً في محفظة شحن السائق. يمكنك تعديل باقي البيانات بدون تغيير السعر، أو شحن محفظة السائق أولاً.";
  }
  return message;
}

/** بناء FormData مطابق لـ API (multipart/form-data + Laravel _method=PUT) */
function buildTripFormData(form, trip, original) {
  const fd = new FormData();
  fd.append("_method", "PUT");

  const set = (key, val) => {
    if (val != null && val !== "") fd.append(key, String(val));
  };

  set("from", form.from);
  set("to", form.to);
  set("region", form.region);
  set("trip_date", toApiDateValue(form.trip_date));
  set("end_date", toApiDateValue(form.end_date));
  set("departure_time", form.departure_time);
  set("return_time", form.return_time);
  set("trip_type", form.trip_type);
  set("subscription_type", form.subscription_type);
  set("trip_status", form.trip_status);
  set("transfer_method", form.transfer_method);
  set("bank_name", form.bank_name);
  set("account_number", form.account_number);
  set("assisted_by", form.assisted_by);
  set("customer_phone", form.customer_phone);

  // إرسال الحقول المالية فقط عند التغيير — إرسالها دائماً يفعّل فحص محفظة السائق على الـ API
  if (original && !valuesEqual(form.total_price, original.total_price)) {
    set("total_price", form.total_price);
  }
  if (original && !valuesEqual(form.amount_paid, original.amount_paid)) {
    set("amount_paid", form.amount_paid);
  }

  const driverId = trip.driver_id ?? trip.driver?.id;
  const customerId = trip.customer_id ?? trip.customer?.id;
  if (driverId != null) fd.append("driver_id", String(driverId));
  if (customerId != null) fd.append("customer_id", String(customerId));

  const commissionDate = toApiDateValue(trip.commission_transfer_date);
  if (commissionDate) set("commission_transfer_date", commissionDate);

  if (Array.isArray(trip.sales)) {
    trip.sales.forEach((s) => {
      if (s?.id != null) fd.append("sales_ids[]", String(s.id));
    });
  }

  return fd;
}

async function fetchTripById(id) {
  const res = await fetch(`${API_BASE}/trips/${id}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`فشل تحميل الرحلة (${res.status})`);
  return normalizeTripResponse(await res.json());
}

/**
 * EditTripModal — تعديل بيانات رحلة
 *
 * Props:
 *   isOpen      {boolean}
 *   onClose     {Function}
 *   trip        {Object}
 *   onSuccess   {Function?}
 */
export default function EditTripModal({ isOpen, onClose, trip, onSuccess }) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(buildFormFromTrip(null));
  const originalRef = useRef(null);

  useEffect(() => {
    if (isOpen && trip) {
      const initial = buildFormFromTrip(trip);
      setForm(initial);
      originalRef.current = initial;
    }
  }, [isOpen, trip]);

  if (!trip) return null;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const fd = buildTripFormData(form, trip, originalRef.current);

      const res = await fetch(`${API_BASE}/trips/${trip.id}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(friendlyApiError(parseApiErrors(json)) || `خطأ ${res.status}`);
      }

      const freshTrip = await fetchTripById(trip.id);
      toast.success(json.message || "تم تعديل بيانات الرحلة بنجاح");
      onSuccess?.(freshTrip);
      onClose();
    } catch (err) {
      toast.error(friendlyApiError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionTitle = "text-xs font-bold text-[#c9a84c] mb-3";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`تعديل الرحلة #${trip.id}`}
      isSubmitting={isSubmitting}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h3 className={sectionTitle}>مسار الرحلة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[["from", "من"], ["to", "إلى"], ["region", "المنطقة / المدينة"]].map(([name, label]) => (
              <ModalField key={name} label={label}>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className={modalInputClass}
                  disabled={isSubmitting}
                />
              </ModalField>
            ))}
          </div>
        </div>

        <div>
          <h3 className={sectionTitle}>المواعيد والأوقات</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[["trip_date", "تاريخ البداية", "date"], ["end_date", "تاريخ النهاية", "date"], ["departure_time", "وقت الانطلاق", "time"], ["return_time", "وقت العودة", "time"]].map(([name, label, type]) => (
              <ModalField key={name} label={label}>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  className={modalInputClass}
                  disabled={isSubmitting}
                />
              </ModalField>
            ))}
          </div>
        </div>

        <div>
          <h3 className={sectionTitle}>نوع الرحلة والحالة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ModalField label="نوع الرحلة">
              <select
                name="trip_type"
                value={form.trip_type}
                onChange={handleChange}
                className={modalInputClass}
                disabled={isSubmitting}
              >
                <option value="">اختر</option>
                <option value="ذهاب وعودة">ذهاب وعودة</option>
                <option value="ذهاب فقط">ذهاب فقط</option>
                <option value="عودة فقط">عودة فقط</option>
                <option value="فردي">فردي</option>
                <option value="شهرية">شهرية</option>
                <option value="أسبوعية">أسبوعية</option>
                <option value="يومية">يومية</option>
              </select>
            </ModalField>
            <ModalField label="نوع الاشتراك">
              <select
                name="subscription_type"
                value={form.subscription_type}
                onChange={handleChange}
                className={modalInputClass}
                disabled={isSubmitting}
              >
                <option value="">اختر</option>
                <option value="شهري">شهري</option>
                <option value="أسبوعي">أسبوعي</option>
                <option value="يومي">يومي</option>
                <option value="اشتراك">اشتراك</option>
              </select>
            </ModalField>
            <ModalField label="حالة الرحلة">
              <select
                name="trip_status"
                value={form.trip_status}
                onChange={handleChange}
                className={modalInputClass}
                disabled={isSubmitting}
              >
                <option value="">اختر</option>
                <option value="معلقة">معلقة</option>
                <option value="قيد التنفيذ">قيد التنفيذ</option>
                <option value="تم">تم</option>
                <option value="ملغية">ملغية</option>
                <option value="موقوفة">موقوفة</option>
              </select>
            </ModalField>
          </div>
        </div>

        <div>
          <h3 className={sectionTitle}>التفاصيل المالية والتحويل</h3>
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
            تعديل السعر أو المبلغ المدفوع يتطلب رصيداً كافياً في محفظة السائق. لتسجيل دفعة جديدة استخدم زر «إضافة دفعة».
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ModalField label="السعر الكلي" hint="يُرسل للسيرفر فقط عند تغييره">
              <input
                name="total_price"
                type="number"
                value={form.total_price}
                onChange={handleChange}
                className={modalInputClass}
                disabled={isSubmitting}
              />
            </ModalField>
            <ModalField label="المبلغ المدفوع (للعرض)" hint="لتعديل المدفوعات استخدم إضافة دفعة">
              <input
                name="amount_paid"
                type="number"
                value={form.amount_paid}
                readOnly
                className={`${modalInputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
              />
            </ModalField>
            <ModalField label="طريقة التحويل">
              <input
                name="transfer_method"
                value={form.transfer_method}
                onChange={handleChange}
                className={modalInputClass}
                disabled={isSubmitting}
              />
            </ModalField>
            <ModalField label="اسم البنك">
              <input
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                className={modalInputClass}
                disabled={isSubmitting}
              />
            </ModalField>
            <ModalField label="رقم الحساب">
              <input
                name="account_number"
                value={form.account_number}
                onChange={handleChange}
                className={modalInputClass}
                disabled={isSubmitting}
              />
            </ModalField>
            <ModalField label="هاتف العميل">
              <input
                name="customer_phone"
                value={form.customer_phone}
                onChange={handleChange}
                className={modalInputClass}
                disabled={isSubmitting}
                dir="ltr"
              />
            </ModalField>
          </div>
        </div>

        <div>
          <h3 className={sectionTitle}>الموظفين</h3>
          <ModalField label="مساعدة بواسطة">
            <input
              name="assisted_by"
              value={form.assisted_by}
              onChange={handleChange}
              className={modalInputClass}
              disabled={isSubmitting}
            />
          </ModalField>
          {Array.isArray(trip.sales) && trip.sales.length > 0 && (
            <p className="text-[11px] text-gray-400 mt-2">
              مندوبو المبيعات: {trip.sales.map((s) => s.name).filter(Boolean).join("، ")}
            </p>
          )}
        </div>

        <ModalActions
          primaryLabel="حفظ التعديلات"
          primaryType="submit"
          onSecondary={onClose}
          isSubmitting={isSubmitting}
        />
      </form>
    </AppModal>
  );
}
