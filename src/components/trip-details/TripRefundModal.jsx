import { useState } from "react";
import { useToast } from "../../lib/toast";
import AppModal, { ModalField, ModalActions, modalInputClass } from "../ui/AppModal";

const BASE_URL = "https://drivo1.elmoroj.com/api";

function fmtMoney(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("ar-SA") : String(v);
}

/**
 * TripRefundModal
 * Props:
 *   isOpen       {boolean}
 *   onClose      {() => void}
 *   tripId       {string|number}
 *   amountPaid   {number}
 *   onSuccess    {() => void}
 */
export default function TripRefundModal({ isOpen, onClose, tripId, amountPaid, onSuccess }) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    method: "",
    accountName: "",
    iban: "",
    bankTo: "",
    reason: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: form.amount,
          method: form.method,
          account_name: form.accountName,
          iban: form.iban,
          bank_to: form.bankTo,
          reason: form.reason,
        }),
      });
      if (!res.ok) throw new Error("فشل طلب الاسترداد");
      toast.success("تم معالجة طلب الاسترداد");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="معالجة طلب استرداد"
      subtitle={`المبلغ المدفوع: ${fmtMoney(amountPaid)} ريال`}
      isSubmitting={isSubmitting}
      size="md"
    >
      <div className="space-y-3">
        <ModalField label="المبلغ المسترد">
          <input
            type="number"
            placeholder="ادخل المبلغ"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className={modalInputClass}
            disabled={isSubmitting}
          />
        </ModalField>
        <ModalField label="طريقة الاسترداد">
          <select
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            className={modalInputClass}
            disabled={isSubmitting}
          >
            <option value="">اختر الطريقة</option>
            <option value="bank">تحويل بنكي</option>
            <option value="cash">نقدي</option>
          </select>
        </ModalField>
        <ModalField label="اسم صاحب الحساب">
          <input
            type="text"
            placeholder="اسم صاحب الحساب"
            value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            className={modalInputClass}
            disabled={isSubmitting}
          />
        </ModalField>
        <ModalField label="سبب الاسترداد">
          <textarea
            rows={3}
            placeholder="سبب الاسترداد"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className={`${modalInputClass} resize-none`}
            disabled={isSubmitting}
          />
        </ModalField>
      </div>
      <div className="mt-5">
        <ModalActions
          primaryLabel="معالجة الاسترداد"
          onPrimary={handleSubmit}
          onSecondary={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </AppModal>
  );
}
