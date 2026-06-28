import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EditTripModal from "./EditTripModal";
import AssignTripModal from "./AssignTripModal";
import TripChatModal from "./TripChatModal";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import { filterByGlobalSearch } from "../lib/searchUtils";
import { usePermissions } from "../hooks/usePermissions.js";
import { PERMISSIONS } from "../lib/permissions.js";

const BASE_URL = "https://drivo1.elmoroj.com/api";
const API_URL = `${BASE_URL}/trip-without-drivers`;

function mapApiTrip(t) {
  return {
    id: `#${t.id}`,
    price: t.total_price ? `${Number(t.total_price).toLocaleString("ar-SA")} ر.س` : "—",
    status: t.route_type ?? "—",
    statusColor: "bg-[#c9a84c] text-white",
    badges: [t.trip_type, t.subscription_type].filter(Boolean),
    from: t.from ?? "—",
    to: t.to ?? "—",
    city: "",
    tripType: t.route_direction ?? "—",
    dateFrom: t.start_date ? new Date(t.start_date).toLocaleDateString("ar-SA") : "—",
    dateTo: t.end_date   ? new Date(t.end_date).toLocaleDateString("ar-SA")   : "—",
    days: t.operation_days ?? [],
    customerName: t.sales?.map(s => s.name).join("، ") || "—",
    phone: t.driver?.phone ?? "",
    active: t.status === "offered",
    _raw: t,
  };
}

function useOfferedTrips() {
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API_URL, { headers: { Accept: "application/json" }, signal: ctrl.signal });
      if (!res.ok) throw new Error(`فشل تحميل البيانات (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data ?? []);
      if (!ctrl.signal.aborted) setTrips(list.map(mapApiTrip));
    } catch (err) {
      if (!ctrl.signal.aborted) {
        console.error("[OfferedTrips]", err);
        setError(err.message);
      }
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); return () => abortRef.current?.abort(); }, [load]);
  return { trips, setTrips, loading, error, retry: load };
}

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { trips, setTrips, loading, error, retry } = useOfferedTrips();
  const [assignModal, setAssignModal] = useState({ open: false, tripId: null });
  const [chatModal, setChatModal] = useState({ open: false, tripId: null, tripLabel: "" });
  const [editModal, setEditModal]     = useState({ open: false, trip: null });
  const { searchQuery } = useGlobalSearch();
  const { can } = usePermissions();
  const canCreate = can(PERMISSIONS.TRIPS_ADS_CREATE);
  const canEdit = can(PERMISSIONS.TRIPS_ADS_EDIT);
  const canDelete = can(PERMISSIONS.TRIPS_ADS_DELETE);
  const canPublish = can(PERMISSIONS.TRIPS_ADS_PUBLISH);

  const filteredTrips = useMemo(
    () => filterByGlobalSearch(trips, searchQuery, (trip) => [
      trip.id,
      trip.from,
      trip.to,
      trip.customerName,
      trip.phone,
      trip.tripType,
      trip.status,
      ...(trip.badges ?? []),
    ]),
    [trips, searchQuery]
  );

  const toggleActive = (i) => setTrips(prev => prev.map((t,idx) => idx===i ? {...t,active:!t.active} : t));
  const deleteTrip  = (i) => setTrips(prev => prev.filter((_,idx) => idx!==i));

  return (
    <div className="w-full space-y-4 p-4" dir="rtl">

      {/* Header */}
      <div className="bg-white rounded-xl px-5 py-3 border border-gray-200/60 shadow-sm flex items-center justify-between">
        <button className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 text-xs px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
          تصفية
        </button>
        <div className="text-right">
          <h1 className="text-xl font-bold text-[#c9a84c]">قائمة الرحلات المعروضة</h1>
          <p className="text-xs text-gray-400">الرحلات للسائقين المسجلين بالتطبيق</p>
        </div>
      </div>

      {/* Banner */}
      <div className="relative bg-gradient-to-l from-[#b88121] to-[#dca43b] rounded-2xl overflow-hidden min-h-[160px] flex items-center px-10 shadow-sm">
        <div className="absolute left-0 bottom-0 h-full w-48 pointer-events-none flex items-end">
          <img src="/path_to_your_image.png" alt="" className="h-[95%] w-full object-contain object-bottom drop-shadow-md"/>
        </div>
        <div className="z-10 text-white text-right ml-auto">
          <h2 className="text-5xl font-extrabold flex items-baseline gap-2"><span>{loading ? "…" : trips.length}</span><span className="text-2xl font-normal">رحلة</span></h2>
          <p className="text-sm opacity-90 mt-1">عدد الرحلات النشطة</p>
          {canCreate && (
          <button onClick={() => navigate("/new-trip")} className="mt-4 flex items-center gap-2 bg-white text-[#b88121] text-sm font-semibold px-5 py-2 rounded-full shadow hover:bg-amber-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            إنشاء رحلة جديدة
          </button>
          )}
        </div>
      </div>

      {/* Trip Cards */}
      <div className="space-y-3">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            جاري تحميل الرحلات...
          </div>
        )}
        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between" dir="rtl">
            <button onClick={retry} className="text-xs underline text-red-500">إعادة المحاولة</button>
            <span>{error}</span>
          </div>
        )}
        {/* Empty */}
        {!loading && !error && filteredTrips.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            {trips.length === 0 ? "لا توجد رحلات متاحة حالياً" : "لا توجد نتائج تطابق البحث"}
          </p>
        )}
        {!loading && !error && filteredTrips.map((trip, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden">
            {/* Right: trip info */}
            <div className="p-4 flex-1 space-y-2 text-right">
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-bold text-amber-600 shrink-0">{trip.price}</span>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {trip.badges.map((b,i) => <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">{b}</span>)}
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${trip.statusColor}`}>{trip.status}</span>
                  <span className="text-base font-bold text-gray-800">{trip.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 justify-end text-sm text-gray-700">
                <span className="text-gray-400 text-xs">{trip.city}</span>
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                <span>{trip.to}</span><span className="text-gray-400">←</span>
                <span className="font-semibold">{trip.from}</span>
              </div>
              <div className="flex items-center gap-4 justify-end text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  الفترة والأيام
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4"/></svg>
                  نوع الرحلة
                </span>
              </div>
              <div className="flex items-center gap-1.5 justify-end text-xs text-gray-500">
                <span>{trip.dateTo}</span><span className="text-gray-400">—</span><span>{trip.dateFrom}</span>
              </div>
              <div className="flex items-center gap-2 justify-end flex-wrap">
                <div className="flex gap-1 flex-wrap justify-end">
                  {trip.days.map((d,i) => <span key={i} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded">{d}</span>)}
                </div>
                <span className="text-xs text-gray-500">{trip.tripType}</span>
              </div>
              <div className="flex items-center gap-3 justify-end text-xs text-gray-500">
                <span>{trip.phone}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  معلومات العميل
                </span>
              </div>
              <div className="text-xs text-gray-700 font-medium text-right">{trip.customerName}</div>
            </div>

            {/* Left: Actions */}
            <div className="bg-gray-50 p-3 flex flex-col gap-2 justify-center items-stretch w-36 shrink-0 border-r border-gray-100">
              <span className="text-xs font-semibold text-gray-400 text-center mb-1">الإجراءات</span>
              {canEdit && (
              <button
                onClick={() => setAssignModal({ open: true, tripId: trip._raw?.id })}
                className="flex items-center justify-center gap-1 bg-[#474747] text-white text-xs py-1.5 px-2 rounded hover:bg-black transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                إسناد رحلة
              </button>
              )}
              {canPublish && (
              <button onClick={() => toggleActive(index)} className="flex items-center justify-center gap-1.5 text-xs py-1.5 px-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <div className={`w-7 h-4 rounded-full flex items-center px-0.5 transition-colors ${trip.active ? "bg-amber-500" : "bg-gray-300"}`}>
                  <div className={`w-3 h-3 bg-white rounded-full shadow transition-transform ${trip.active ? "translate-x-3" : "translate-x-0"}`}/>
                </div>
                <span>{trip.active ? "متاح" : "موقوف"}</span>
              </button>
              )}
              {canEdit && (
              <button
                onClick={() => setEditModal({ open: true, trip: trip._raw })}
                className="flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 text-xs py-1.5 px-2 rounded hover:bg-gray-50 transition-colors">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                تعديل
              </button>
              )}
              <button
                type="button"
                onClick={() => setChatModal({
                  open: true,
                  tripId: trip._raw?.id,
                  tripLabel: `${trip.from} → ${trip.to}`,
                })}
                className="flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 text-xs py-1.5 px-2 rounded hover:bg-gray-50 transition-colors">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                المحادثات
              </button>
              {canDelete && (
              <button onClick={() => deleteTrip(index)} className="flex items-center justify-center gap-1 bg-white border border-red-200 text-red-400 text-xs py-1.5 px-2 rounded hover:bg-red-50 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                حذف
              </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AssignTripModal
        isOpen={assignModal.open}
        tripId={assignModal.tripId}
        onClose={() => setAssignModal({ open: false, tripId: null })}
        onSuccess={() => {
          // Remove the assigned trip immediately from the list
          setTrips(prev => prev.filter(t => t._raw?.id !== assignModal.tripId));
          // Signal TripsListPage to refresh
          window.dispatchEvent(new CustomEvent('trips-list-refresh'));
        }}
      />

      <TripChatModal
        isOpen={chatModal.open}
        tripId={chatModal.tripId}
        tripLabel={chatModal.tripLabel}
        onClose={() => setChatModal({ open: false, tripId: null, tripLabel: "" })}
      />

      <EditTripModal
        isOpen={editModal.open}
        trip={editModal.trip}
        onClose={() => setEditModal({ open: false, trip: null })}
        onSuccess={(updated) => {
          if (updated) {
            setTrips((prev) => prev.map((t) =>
              t._raw?.id === updated.id ? mapApiTrip(updated) : t
            ));
          }
          window.dispatchEvent(new CustomEvent("trips-list-refresh"));
        }}
      />
    </div>
  );
}
