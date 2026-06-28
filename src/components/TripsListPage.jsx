import React, { useState, useEffect } from 'react';
import {
    Plus,
    RefreshCw,
    Eye,
    Edit2,
    SlidersHorizontal,
    Download,
    MapPin,
    Calendar,
    User,
    Phone,
    ChevronLeft,
    ChevronRight,
    X,
    Clock,
    CheckCircle2,
    XCircle,
    PauseCircle
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AddPaymentModal from './AddPaymentModal';
import EditTripModal from './EditTripModal';
import AppModal, { ModalField, ModalActions, modalInputClass } from './ui/AppModal';

const API_BASE = "/api";

// ==========================================
// 2. مودال تغيير حالة الرحلة 
// ==========================================
const ChangeStatusModal = ({ isOpen, onClose, onStatusChange }) => {
    const [selectedStatus, setSelectedStatus] = useState('progress');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusOptions = [
        { id: 'progress', label: 'قيد التنفيذ', icon: <Clock className="w-4 h-4 text-blue-500" />, activeClass: 'border-blue-500 bg-blue-50/10' },
        { id: 'completed', label: 'مكتملة', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, activeClass: 'border-emerald-500 bg-emerald-50/10' },
        { id: 'cancelled', label: 'ملغية', icon: <XCircle className="w-4 h-4 text-red-500" />, activeClass: 'border-red-500 bg-red-50/10' },
        { id: 'suspended', label: 'معلقة', icon: <PauseCircle className="w-4 h-4 text-amber-600" />, activeClass: 'border-amber-600 bg-amber-50/10' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (onStatusChange) await onStatusChange(selectedStatus, reason);
            onClose();
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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500">الحالة الجديدة</label>
                    {statusOptions.map((option) => {
                        const isSelected = selectedStatus === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => setSelectedStatus(option.id)}
                                className={`w-full flex items-center gap-3 border rounded-xl p-3 text-right transition-all disabled:opacity-50 ${isSelected ? option.activeClass : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-amber-600' : 'border-gray-300'}`}>
                                    {isSelected && <span className="w-2 h-2 bg-amber-600 rounded-full" />}
                                </span>
                                {option.icon}
                                <span className={`text-xs font-medium ${isSelected ? 'text-gray-800 font-semibold' : 'text-gray-600'}`}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <ModalField label="سبب التغيير">
                    <textarea
                        rows={3}
                        placeholder="ادخل اي ملاحظات اضافية"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={`${modalInputClass} resize-none`}
                        disabled={isSubmitting}
                    />
                </ModalField>
                <ModalActions
                    primaryLabel="تأكيد التغيير"
                    primaryType="submit"
                    onSecondary={onClose}
                    isSubmitting={isSubmitting}
                />
            </form>
        </AppModal>
    );
};

// ==========================================
// 3. المكون الأساسي لصفحة سجل الرحلات
// ==========================================
const TripsLog = () => {
    const location = useLocation();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedTripId, setSelectedTripId] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);

    const [trips, setTrips] = useState([]);
    const [tripsLoading, setTripsLoading] = useState(false);
    const [tripsError, setTripsError] = useState(null);

    // جلب الرحلات من API
    const fetchTrips = async ({ silent = false } = {}) => {
        if (!silent) setTripsLoading(true);
        setTripsError(null);
        try {
            const res = await fetch(`${API_BASE}/trips`);
            if (!res.ok) throw new Error("فشل تحميل الرحلات");
            const json = await res.json();
            const list = Array.isArray(json) ? json : (json.value ?? json.data ?? []);
            setTrips(list);
        } catch (err) {
            setTripsError(err.message);
        } finally {
            if (!silent) setTripsLoading(false);
        }
    };

    // أعد الـ fetch كل ما تُفتح الصفحة
    useEffect(() => {
        fetchTrips();
    }, [location.key]);

    // Refresh when a trip is assigned from CreateTripPage
    useEffect(() => {
        const handler = () => fetchTrips();
        window.addEventListener('trips-list-refresh', handler);
        return () => window.removeEventListener('trips-list-refresh', handler);
    }, []);

    const handleEditClick = (trip) => {
        setSelectedTrip(trip);
        setIsEditModalOpen(true);
    };

    const handlePrint = () => {
        const printContent = trips.map(trip => `
            <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${trip.id}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${trip.customerName}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${trip.driver}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${trip.from} - ${trip.to}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${trip.price}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${trip.status}</td>
            </tr>
        `).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>طباعة سجل الرحلات</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #b88121; margin: 0; }
                    .header p { color: #666; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; text-align: right; }
                    th { background-color: #f9fafb; padding: 12px; border: 1px solid #e5e7eb; color: #4b5563; font-weight: 600; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>سجل الرحلات</h1>
                    <p>تقرير مطبوع بجميع تفاصيل الرحلات الحالية</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>رقم الرحلة</th>
                            <th>العميل</th>
                            <th>السائق</th>
                            <th>المسار</th>
                            <th>السعر</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${printContent}
                    </tbody>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="w-full font-sans text-right" dir="rtl">
            {/* عنوان الصفحة وأزرار التحكم */}
            <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex justify-between items-center mb-5">
                <div className="text-right">
                    <h1 className="text-xl font-bold text-[#bd8b2a]">سجل الرحلات</h1>
                    <p className="text-sm text-gray-500 mt-0.5">إدارة ومتابعة الرحلات بجميع تفاصيلها</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchTrips}
                        disabled={tripsLoading}
                        className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${tripsLoading ? 'animate-spin' : ''}`} />
                        تحديث
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <Download className="w-3.5 h-3.5 text-gray-500" />
                        تصدير
                    </button>
                </div>

            </div>

            {/* البانر الإعلاني */}
            {/* البانر الإعلاني */}
            <div className="relative bg-gradient-to-l from-[#b88121] to-[#dca43b] rounded-xl mb-6 shadow-sm overflow-hidden h-[150px] md:h-[180px] flex items-center">

                {/* النص على اليمين */}
                <div className="z-10 text-white w-full pr-12 text-right">
                    <h2 className="text-5xl font-bold flex items-center gap-3">
                        {trips.length} <span className="text-3xl font-medium pt-1">رحلة</span>
                    </h2>
                </div>

                {/* حاوية الصورة على اليسار - دي اللي هتجبرها تنزل تحت */}
                <div className="absolute top-0 bottom-0 left-0 flex items-end justify-start pointer-events-none md:left-4 pl-4 md:pl-0">
                    <img
                        src="path_to_your_image.png"
                        alt="توصيل ورحلات"
                        className="max-h-[90%] md:max-h-[95%] w-auto object-contain"
                    />
                </div>
            </div>

            {/* قائمة كروت الرحلات */}
            <div className="space-y-4">

                {/* Loading */}
                {tripsLoading && (
                    <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        جاري تحميل الرحلات...
                    </div>
                )}

                {/* Error */}
                {tripsError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-right flex items-center justify-between">
                        <button onClick={fetchTrips} className="text-xs underline text-red-500">إعادة المحاولة</button>
                        <span>{tripsError}</span>
                    </div>
                )}

                {/* Empty */}
                {!tripsLoading && !tripsError && trips.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-12">لا توجد رحلات بعد</p>
                )}

                {/* Trip cards */}
                {!tripsLoading && trips.map((trip, index) => {
                    // map API fields → display values
                    const tripId   = `#${trip.id}`;
                    const status   = trip.trip_status ?? '—';
                    const statusColorMap = { 'تم': 'bg-green-600', 'قيد التنفيذ': 'bg-blue-600', 'ملغية': 'bg-red-600', 'معلقة': 'bg-amber-600', 'موقوفة': 'bg-gray-400' };
                    const statusColor = statusColorMap[status] ?? 'bg-gray-500';
                    const tripType  = trip.trip_type ?? '—';
                    const driverName = trip.driver ? `${trip.driver.name} ${trip.driver.last_name ?? ''}`.trim() : '—';
                    const totalPrice = trip.total_price ? `${Number(trip.total_price).toLocaleString('ar-SA')} ر.س` : '—';
                    const commission = trip.commission_amount ? `${Number(trip.commission_amount).toLocaleString('ar-SA')} ر.س` : '—';
                    const amountPaid = trip.amount_paid ? `${Number(trip.amount_paid).toLocaleString('ar-SA')} ر.س` : '—';
                    const tripDate  = trip.trip_date ? new Date(trip.trip_date).toLocaleDateString('ar-SA') : '—';
                    const salesNames = trip.sales?.map(s => s.name).join('، ') ?? '—';
                    const region = trip.region ?? '—';

                    return (
                        <div key={trip.id ?? index} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">
                            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-base font-bold text-gray-800">{tripId}</span>
                                        <span className={`${statusColor} text-white text-xs px-2.5 py-0.5 rounded-full font-medium`}>
                                            {status}
                                        </span>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-md">
                                            {tripType}
                                        </span>
                                    </div>
                                    <div className="text-amber-700 font-bold text-xl">{totalPrice}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 mt-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                            <span className="font-semibold text-gray-800">{trip.from ?? '—'}</span>
                                            {trip.to && <><span className="text-gray-400">←</span><span className="text-gray-500">{trip.to}</span></>}
                                        </div>
                                        <div className="flex items-center gap-2 pr-5">
                                            <span className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded">المنطقة</span>
                                            <span>{region}</span>
                                        </div>
                                        <div className="pr-5 text-gray-500">
                                            السائق: <span className="font-medium text-gray-800">{driverName}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 md:border-r md:border-l border-gray-100 md:px-4">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{tripDate}</span>
                                        </div>
                                        <div className="text-gray-500">
                                            هاتف العميل: <span className="font-medium text-gray-800">{trip.customer_phone ?? '—'}</span>
                                        </div>
                                        <div className="text-gray-500">
                                            السيلز: <span className="font-medium text-gray-800">{salesNames}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center space-y-1.5 md:mr-auto md:text-left text-right min-w-[120px]">
                                        <div className="text-gray-500">
                                            العمولة: <span className="font-semibold text-amber-600">{commission}</span>
                                        </div>
                                        <div className="text-gray-500">
                                            المدفوع: <span className="font-semibold text-amber-600">{amountPaid}</span>
                                        </div>
                                        {trip.transfer_method && (
                                            <div className="text-gray-400">{trip.transfer_method}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 p-4 border-l border-gray-100 flex flex-col gap-2 justify-center w-full md:w-44 text-center">
                                <span className="text-xs font-semibold text-gray-400 mb-1 block">الإجراءات</span>

                                <button
                                    onClick={() => { setSelectedTripId(trip.id); setIsPaymentModalOpen(true); }}
                                    className="flex items-center justify-center gap-1 bg-[#474747] text-white text-xs py-1.5 px-3 rounded hover:bg-black transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> اضافة دفعه
                                </button>

                                <button
                                    onClick={() => { setSelectedTripId(trip.id); setIsStatusModalOpen(true); }}
                                    className="flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded hover:bg-gray-50 transition-colors"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 text-gray-400" /> تغيير الحالة
                                </button>

                                <Link
                                    to={`/trips/${trip.id}`}
                                    className="flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded hover:bg-gray-50 transition-colors no-underline"
                                >
                                    <Eye className="w-3.5 h-3.5 text-gray-400" /> تفاصيل
                                </Link>

                                <button
                                    onClick={() => handleEditClick(trip)}
                                    className="flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded hover:bg-gray-50 transition-colors"
                                >
                                    <Edit2 className="w-3.5 h-3.5 text-gray-400" /> تعديل
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>


            <AddPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => { setIsPaymentModalOpen(false); setSelectedTripId(null); }}
                tripId={selectedTripId}
                onSuccess={(data) => {
                    setTrips(prev => prev.map(t =>
                        t.id === selectedTripId
                            ? { ...t, total_price: data.total_price, amount_paid: data.amount_paid, remaining_amount: data.remaining_amount, transfer_image: data.transfer_image }
                            : t
                    ));
                }}
            />

            <ChangeStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onStatusChange={async (status, reason) => {
                    if (!selectedTripId) return;
                    try {
                        const res = await fetch(`${API_BASE}/trips/${selectedTripId}/change-status`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status, reason }),
                        });
                        if (res.ok) fetchTrips();
                    } catch {}
                }}
            />

            <EditTripModal
                isOpen={isEditModalOpen}
                trip={selectedTrip}
                onClose={() => { setIsEditModalOpen(false); setSelectedTrip(null); }}
                onSuccess={(updated) => {
                    if (updated?.id) {
                        setTrips((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
                    } else {
                        fetchTrips({ silent: true });
                    }
                }}
            />
        </div>
    );
};

export default TripsLog;
