import { useState, useEffect, useCallback } from "react";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

const BASE = "https://drivo1.elmoroj.com/api";

const STATUS_MAP = {
  pending: { label: "معلق", color: "bg-amber-100 text-amber-600" },
  approved: { label: "موافق", color: "bg-green-100 text-green-600" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-500" },
  معلق: { label: "معلق", color: "bg-amber-100 text-amber-600" },
  موافق: { label: "موافق", color: "bg-green-100 text-green-600" },
  مرفوض: { label: "مرفوض", color: "bg-red-100 text-red-500" },
};

const FIELD_LABELS = {
  driver_id: "السائق",
  driver: "السائق",
  driver_name: "السائق",
  from: "من",
  to: "إلى",
  city: "المدينة",
  city_id: "المدينة",
  price: "سعر الرحلة",
  trip_price: "سعر الرحلة",
  amount: "المبلغ",
  date_from: "تاريخ البداية",
  date_to: "تاريخ النهاية",
  time_from: "وقت المغادرة",
  time_to: "وقت الوصول",
  departure_time: "وقت المغادرة",
  arrival_time: "وقت الوصول",
  trip_type: "نوع الرحلة",
  subscription_type: "نوع الاشتراك",
  commission: "العمولة",
  remaining: "المتبقي",
  customer_name: "اسم العميل",
  customer_phone: "هاتف العميل",
  phone: "رقم الهاتف",
  status: "حالة الرحلة",
  notes: "ملاحظات",
  description: "الوصف",
};

const statusOptions = ["الكل", "معلق", "موافق", "مرفوض"];

const typeConfig = {
  "تعديل رحلة": {
    bg: "bg-purple-50",
    icon: "text-purple-500",
    d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
};

function fmtVal(val) {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function normalizeStatus(raw) {
  const key = String(raw ?? "pending").toLowerCase();
  return STATUS_MAP[key] || STATUS_MAP[raw] || STATUS_MAP.pending;
}

function buildChanges(item) {
  if (Array.isArray(item.changes) && item.changes.length) {
    return item.changes.map((ch) => ({
      label: ch.label || ch.field || ch.key || "حقل",
      from: fmtVal(ch.from ?? ch.old ?? ch.old_value),
      to: fmtVal(ch.to ?? ch.new ?? ch.new_value),
    }));
  }

  const oldVals = item.old_values ?? item.old_data ?? item.before ?? item.original ?? {};
  const newVals = item.new_values ?? item.new_data ?? item.after ?? item.requested ?? item.changes_data ?? {};

  if (typeof oldVals === "object" && typeof newVals === "object" && !Array.isArray(oldVals)) {
    const keys = [...new Set([...Object.keys(oldVals), ...Object.keys(newVals)])];
    return keys
      .filter((k) => fmtVal(oldVals[k]) !== fmtVal(newVals[k]))
      .map((k) => ({
        label: FIELD_LABELS[k] || k,
        from: fmtVal(oldVals[k]),
        to: fmtVal(newVals[k]),
      }));
  }

  if (item.change_summary) {
    return [{ label: "ملخص التعديل", from: "—", to: fmtVal(item.change_summary) }];
  }

  return [];
}

function normalizeRequest(item) {
  const statusInfo = normalizeStatus(item.status ?? item.request_status);
  const trip = item.trip ?? {};
  const created = item.created_at ?? item.date ?? "";

  let date = "";
  let time = "";
  if (created) {
    const d = new Date(created);
    if (!Number.isNaN(d.getTime())) {
      date = d.toLocaleDateString("ar-EG");
      time = d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    } else {
      date = String(created);
    }
  }

  return {
    id: item.id,
    type: "تعديل رحلة",
    status: statusInfo.label,
    statusColor: statusInfo.color,
    tripId: item.trip_id ?? trip.id ?? item.tripId,
    from: item.from ?? trip.from ?? trip.pickup_location ?? trip.origin ?? "",
    to: item.to ?? trip.to ?? trip.dropoff_location ?? trip.destination ?? "",
    submittedBy: item.submitted_by ?? item.requested_by ?? item.user_name ?? item.user?.name ?? "—",
    submittedFrom: item.submitted_from ?? item.requested_from ?? item.user_role ?? item.source ?? "—",
    date,
    time,
    changes: buildChanges(item),
    raw: item,
  };
}

function parseList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.requests)) return data.requests;
  if (Array.isArray(data?.trip_edit_requests)) return data.trip_edit_requests;
  return [];
}

export default function ApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const { searchQuery, setSearchQuery } = useGlobalSearch();
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${BASE}/trip-edit-requeststest`, {
        headers: { Accept: "application/json" },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setRequests(parseList(d).map(normalizeRequest));
    } catch (err) {
      console.error("fetchRequests error:", err);
      setError("حدث خطأ أثناء تحميل طلبات التعديل. يرجى التحقق من اتصال الشبكة.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const r = await fetch(`${BASE}/trip-edit-approve/${id}`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await r.json();
      fetchRequests();
    } catch (err) {
      console.error("handleApprove error:", err);
      alert("حدث خطأ أثناء الموافقة على الطلب");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const r = await fetch(`${BASE}/trip-edit-reject/${id}`, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await r.json();
      fetchRequests();
    } catch (err) {
      console.error("handleReject error:", err);
      alert("حدث خطأ أثناء رفض الطلب");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === "الكل" || r.status === statusFilter;
    const q = searchQuery.trim();
    const matchSearch =
      q === "" ||
      r.submittedBy.includes(q) ||
      String(r.id).includes(q) ||
      String(r.tripId ?? "").includes(q);
    return matchStatus && matchSearch;
  });

  const config = typeConfig["تعديل رحلة"];

  return (
    <div className="w-full space-y-5 pb-8" dir="rtl">

      <div className="bg-white rounded-2xl shadow-sm px-5 py-4">
        <h1 className="text-2xl font-semibold text-[#c9a84c] text-right">مركز الموافقات</h1>
        <p className="text-xs text-gray-400 mt-0.5 text-right">
          مراجعة وموافقة على طلبات تعديل الرحلات قبل تطبيقها
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 text-right">فلتر حسب الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-600 text-right"
            >
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 text-right">بحث</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الطلب أو الرحلة أو اسم الموظف..."
                className="bg-transparent text-sm outline-none w-full placeholder-gray-300 text-right"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-10 space-y-3 bg-[#faf7f0] rounded-xl border border-gray-100">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={fetchRequests}
              className="px-4 py-2 bg-[#c9a84c] hover:bg-[#b8973d] text-white text-xs font-medium rounded-xl transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="border border-gray-100 rounded-xl p-4 space-y-3 hover:bg-gray-50/40 transition-colors"
              >
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs text-gray-400 font-mono">{req.id}#</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${req.statusColor}`}>
                    {req.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{req.type}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                    <svg className={`w-4 h-4 ${config.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.d} />
                    </svg>
                  </div>
                </div>

                <div className="text-right">
                  {req.tripId && (
                    <p className="text-sm font-bold text-gray-800">
                      #{req.tripId}
                      {(req.from || req.to) && (
                        <>
                          {" "}
                          {req.from}
                          {req.from && req.to && <span className="text-gray-400 mx-1">→</span>}
                          {req.to}
                        </>
                      )}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>
                      مقدم من: {req.submittedFrom} ({req.submittedBy})
                    </span>
                    {(req.date || req.time) && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>
                          {req.date}
                          {req.time && ` • ${req.time}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 text-right mb-2">التغييرات المطلوبة</p>
                  {req.changes.length > 0 ? (
                    req.changes.map((ch, ci) => (
                      <div key={ci} className="flex items-center justify-end gap-2 text-xs">
                        <span className="text-green-600 font-medium">{ch.to}</span>
                        <span className="text-gray-300">←</span>
                        <span className="text-red-400 line-through">{ch.from}</span>
                        <span className="text-gray-500 font-medium">{ch.label}:</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-right">لا توجد تفاصيل تغيير متاحة</p>
                  )}
                </div>

                {req.status === "معلق" && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      disabled={actionLoading === req.id}
                      onClick={() => handleReject(req.id)}
                      className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {actionLoading === req.id ? "جارٍ الرفض..." : "رفض الطلب"}
                    </button>
                    <button
                      disabled={actionLoading === req.id}
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {actionLoading === req.id ? "جارٍ الموافقة..." : "الموافقة على الطلب"}
                    </button>
                  </div>
                )}

                {req.status !== "معلق" && (
                  <div
                    className={`text-center text-xs font-medium py-2 rounded-xl ${
                      req.status === "موافق" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                    }`}
                  >
                    {req.status === "موافق" ? "✓ تمت الموافقة على هذا الطلب" : "✕ تم رفض هذا الطلب"}
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">لا توجد طلبات</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
