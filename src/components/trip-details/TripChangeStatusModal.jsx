import { useState } from "react";
import { Clock, CheckCircle2, XCircle, PauseCircle } from "lucide-react";
import { useToast } from "../../lib/toast";
import AppModal, { ModalField, ModalActions, modalInputClass } from "../ui/AppModal";

const BASE_URL = "https://drivo1.elmoroj.com/api";

const STATUS_OPTIONS = [
  { id: "progress", label: "قيد التنفيذ", icon: Clock, color: "text-blue-600" },
  { id: "completed", label: "مكتملة", icon: CheckCircle2, color: "text-emerald-500" },
  { id: "cancelled", label: "ملغية", icon: XCircle, color: "text-red-500" },
  { id: "suspended", label: "معلقة", icon: PauseCircle, color: "text-amber-600" },
];

/**
 * TripChangeStatusModal
 * Props:
 *   isOpen       {boolean}
 *   onClose      {() => void}
 *   tripId       {string|number}
 *   onSuccess    {() => void}
 */
export default function TripChangeStatusModal({ isOpen, onClose, tripId, onSuccess }) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState("progress");
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/trips/${tripId}/change-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selected, reason }),
      });
      if (!res.ok) throw new Error("فشل تغيير الحالة");
      toast.success("تم تغيير حالة الرحلة");
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
      title="تغيير حالة الرحلة"
      subtitle="اختر الحالة الجديدة وأدخل سبب التغيير"
      isSubmitting={isSubmitting}
      size="md"
    >
      <div className="space-y-2 mb-4">
        {STATUS_OPTIONS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            type="button"
            disabled={isSubmitting}
            onClick={() => setSelected(id)}
            className={`w-full flex items-center gap-3 border rounded-xl p-3 text-right transition-colors disabled:opacity-50 ${
              selected === id ? "border-[#c9a84c] bg-[#fffcf5]" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                selected === id ? "border-[#4a4746]" : "border-gray-300"
              }`}
            >
              {selected === id && <span className="w-2 h-2 bg-[#4a4746] rounded-full" />}
            </span>
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>
      <ModalField label="سبب التغيير">
        <textarea
          rows={3}
          placeholder="سبب التغيير"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={`${modalInputClass} resize-none`}
          disabled={isSubmitting}
        />
      </ModalField>
      <div className="mt-5">
        <ModalActions
          primaryLabel="تأكيد التغيير"
          onPrimary={handleSubmit}
          onSecondary={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </AppModal>
  );
}
