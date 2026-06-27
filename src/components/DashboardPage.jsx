import { useState, useEffect } from "react";

// ── Helpers ──────────────────────────────────────────────────

const arabicMonth = () => {
  const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو",
                  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  return months[new Date().getMonth()];
};

// Static "previous month" mock diff — positive = زيادة, negative = نقص
const mockDiff = (val) => {
  const diff = Math.round(val * 0.18);
  return { diff, pct: 18, up: true };
};

const StatCard = ({ icon, label, value, diff, pct, up }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
    {/* Right: text */}
    <div className="text-right">
      <p className="text-2xl font-extrabold text-gray-800">{value ?? "—"}</p>
      <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
      <div className="flex items-center gap-1 justify-end mt-1">
        <span className={`text-[10px] font-bold ${up ? "text-emerald-500" : "text-red-500"}`}>
          {up ? "↑" : "↓"}{pct}%~
        </span>
        <span className="text-[10px] text-gray-400">هذا الشهر</span>
      </div>
    </div>
    {/* Left: icon */}
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: "linear-gradient(135deg,#9C6402,#E6C76A)" }}>
      {icon}
    </div>
  </div>
);

// Simple bar chart (pure CSS/Tailwind)
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-28 pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-t-md transition-all"
            style={{ height: `${(d.value / max) * 100}%`, background: "linear-gradient(180deg,#E6C76A,#9C6402)", minHeight: 6 }}/>
          <span className="text-[9px] text-gray-500 whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// Simple donut chart (SVG)
const DonutChart = ({ segments }) => {
  const total = segments.reduce((s, c) => s + c.value, 0) || 1;
  const r = 36; const cx = 50; const cy = 50; const stroke = 16;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke}/>
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const dashOffset = -(cum / total) * circ;
        cum += seg.value;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={dashOffset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px" }}/>
        );
      })}
    </svg>
  );
};

// ── Main Component ────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const month = arabicMonth();

  useEffect(() => {
    fetch("https://drivo1.elmoroj.com/api/dashboard-counts")
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const handlePrint = () => window.print();

  const barData = [
    { label:"يناير",  value: 65 },
    { label:"فبراير", value: 75 },
    { label:"أبريل",  value: 80 },
    { label:"مايو",   value: 70 },
    { label:"يونيو",  value: 90 },
    { label:"أكتوبر", value: 60 },
  ];

  const total   = data?.total_trips    ?? 0;
  const drivers = data?.total_drivers  ?? 0;
  const clients = data?.total_customers ?? 0;
  const active  = Math.round(total * 0.24);

  const donutSegments = [
    { label:"مكتملة",     value: Math.round(total*0.60), color:"#c9a84c" },
    { label:"موقوفة",     value: Math.round(total*0.15), color:"#d1d5db" },
    { label:"قيد التنفيذ",value: Math.round(total*0.20), color:"#6b7280" },
    { label:"ملغية",      value: Math.round(total*0.05), color:"#374151" },
  ];

  const stats = [
    {
      label:"إجمالي الرحلات", value: total, ...mockDiff(total),
      icon:<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
    },
    {
      label:"الرحلات النشطة", value: active, ...mockDiff(active),
      icon:<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
    },
    {
      label:"العملاء الجدد", value: clients, ...mockDiff(clients),
      icon:<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z"/></svg>
    },
    {
      label:"السائقين النشطين", value: drivers, ...mockDiff(drivers),
      icon:<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
    },
  ];

  return (
    <div className="w-full space-y-5 p-4" dir="rtl">

      {/* Header */}
      <div className="bg-white rounded-xl px-5 py-3 border border-gray-200/60 shadow-sm flex items-center justify-between">
        {/* Left: export button */}
        
        {/* Right: title */}
        <div className="text-right">
          <h1 className="text-xl font-bold text-[#c9a84c]">لوحة التحليلات والإحصائيات</h1>
          <p className="text-xs text-gray-400">تحليلات شاملة لأداء النظام</p>
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          تصدير
        </button>
      </div>

      {/* Banner */}
      <div className="relative bg-gradient-to-l from-[#b88121] to-[#dca43b] rounded-2xl overflow-hidden min-h-[150px] flex items-center px-10 shadow-sm">
        <div className="absolute left-0 bottom-0 h-full w-56 pointer-events-none flex items-end">
          <img src="/path_to_your_image.png" alt="" className="h-[95%] w-full object-contain object-bottom drop-shadow-md"/>
        </div>
        <div className="z-10 text-white text-right ml-auto">
          <h2 className="text-5xl font-extrabold flex items-baseline gap-2">
            {loading || error ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"/>
            ) : (
              <><span>{total}</span><span className="text-2xl font-normal">رحلة</span></>
            )}
          </h2>
        </div>
      </div>

      {/* Stat cards */}
      {(loading || error) ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i=>(
            <div key={i} className="bg-white rounded-2xl h-24 border border-gray-100 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin"/>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s,i) => <StatCard key={i} {...s}/>)}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-50">
              هذا الشهر
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </div>
            <p className="text-sm font-bold text-gray-800">أداء الرحلات</p>
          </div>
          <BarChart data={barData}/>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-gray-50">
              هذا الشهر
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
            </div>
            <p className="text-sm font-bold text-gray-800">حالات الرحلات</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {donutSegments.map((s,i)=>(
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor:s.color}}/>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <DonutChart segments={donutSegments}/>
          </div>
        </div>
      </div>

    </div>
  );
}
