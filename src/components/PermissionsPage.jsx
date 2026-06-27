import { useState } from "react";

// ======= Mock Data =======
const MODULES = [
  {
    id: "rewards",
    name: "المكافآت والأكواد الترويجية",
    icon: "🎁",
    iconBg: "bg-pink-100",
    permissions: ["عرض الإعدادات", "إضافة كود ترويجي", "تعديل الكود", "حذف الكود", "تفعيل/إيقاف الكود"],
  },
  {
    id: "clients",
    name: "قائمة العملاء",
    icon: "👥",
    iconBg: "bg-blue-100",
    permissions: ["عرض العملاء", "إضافة عميل", "تعديل بيانات العميل", "حذف عميل", "تصدير البيانات"],
  },
  {
    id: "support",
    name: "الدعم الفني والتذاكر",
    icon: "🎧",
    iconBg: "bg-purple-100",
    permissions: ["عرض التذاكر", "الرد على التذاكر", "إغلاق التذكرة", "حذف التذكرة", "تصعيد التذكرة"],
  },
  {
    id: "drivers",
    name: "سجل السائقين",
    icon: "🚗",
    iconBg: "bg-green-100",
    permissions: ["عرض السائقين", "إضافة سائق", "تعديل بيانات السائق", "حذف سائق", "تعليق السائق"],
  },
  {
    id: "notifications",
    name: "إدارة الإشعارات",
    icon: "🔔",
    iconBg: "bg-yellow-100",
    permissions: ["عرض الإشعارات", "إرسال إشعار", "تعديل إشعار", "حذف إشعار", "جدولة إشعار"],
  },
  {
    id: "promos",
    name: "المكافآت والأكواد الترويجية",
    icon: "💬",
    iconBg: "bg-pink-100",
    permissions: ["عرض الأكواد", "إضافة كود", "تعديل كود", "حذف كود", "تفعيل/إيقاف"],
  },
  {
    id: "trips_ads",
    name: "الرحلات المعروضة / الإعلانات",
    icon: "📢",
    iconBg: "bg-orange-100",
    permissions: ["عرض الإعلانات", "إضافة إعلان", "تعديل إعلان", "حذف إعلان", "نشر الإعلان"],
  },
  {
    id: "trips_log",
    name: "سجل الرحلات والتفاصيل",
    icon: "📋",
    iconBg: "bg-teal-100",
    permissions: ["عرض الرحلات", "إنشاء رحلة", "تعديل رحلة", "إلغاء رحلة", "تصدير التقارير"],
  },
];

const ROLES = [
  { id: 1, name: "خدمة عملاء", desc: "متابعة المعاملات اليومية للرحلات", permissions: 40, rank: 3, date: "1-2-2026" },
  { id: 2, name: "كوالتي",     desc: "مراقبة جودة العمليات",             permissions: 40, rank: 3, date: "1-2-2026" },
  { id: 3, name: "مدير الحسابات", desc: "ادارة ومراقبة الحسابات المالية", permissions: 40, rank: 3, date: "1-2-2026" },
  { id: 4, name: "موظف الحسابات", desc: "متابعة المعاملات المالية",       permissions: 40, rank: 3, date: "1-2-2026" },
  { id: 5, name: "الأدمن",     desc: "ادارة النظام والصلاحيات",           permissions: 40, rank: 3, date: "1-2-2026" },
  { id: 6, name: "موظف It",    desc: "الدعم الفني للنظام",               permissions: 40, rank: 3, date: "1-2-2026" },
  { id: 7, name: "مدير الدعم الفني", desc: "الإشراف على الدعم الفني",    permissions: 40, rank: 3, date: "1-2-2026" },
  { id: 8, name: "المسوق",     desc: "ادارة الحملات التسويقية",           permissions: 40, rank: 3, date: "1-2-2026" },
];

// ======= Sub-component: Expanded module permissions =======
function ModuleExpanded({ module, enabled, onToggle, onToggleAll }) {
  const enabledCount = enabled.filter(Boolean).length;
  const total = module.permissions.length;
  const pct = Math.round((enabledCount / total) * 100);

  return (
    <div className="mt-3 space-y-2">
      {/* تفعيل الكل / إلغاء الكل */}
      <div className="flex items-center justify-end gap-2 mb-3">
        <button
          onClick={() => onToggleAll(false)}
          className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
        >
          إلغاء الكل
        </button>
        <button
          onClick={() => onToggleAll(true)}
          className="text-xs px-3 py-1 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
        >
          تفعيل الكل
        </button>
      </div>

      {/* Permission rows */}
      {module.permissions.map((perm, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${
            enabled[i] ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
          }`}
        >
          <button
            onClick={() => onToggle(i)}
            className={`relative inline-flex w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
              enabled[i] ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 mt-0.5 ${
                enabled[i] ? "translate-x-1" : "translate-x-5"
              }`}
            />
          </button>
          <div className="flex items-center gap-2 text-right">
            <span className={`text-sm ${enabled[i] ? "text-gray-800" : "text-gray-400"}`}>{perm}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${enabled[i] ? "bg-green-500" : "bg-gray-300"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ======= Sub-component: Module row =======
function ModuleRow({ module, expandedId, onExpand, permState, onToggle, onToggleAll }) {
  const isOpen = expandedId === module.id;
  const enabledCount = permState.filter(Boolean).length;
  const total = module.permissions.length;
  const pct = Math.round((enabledCount / total) * 100);
  const isActive = enabledCount > 0;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Row header — clickable */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50/60 transition-colors"
        onClick={() => onExpand(isOpen ? null : module.id)}
      >
        {/* Left: chevron + status */}
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
            {isActive ? "مفعّل" : "معطّل"}
          </span>
          <span className="text-xs text-gray-400">{pct}%</span>
          {/* Progress bar */}
          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Right: icon + name */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{module.name}</p>
            <p className="text-xs text-gray-400">{enabledCount} من {total} صلاحيات مفعلة</p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${module.iconBg}`}>
            {module.icon}
          </div>
        </div>
      </button>

      {/* Expanded area */}
      {isOpen && (
        <div className="px-4 pb-4 bg-white border-t border-gray-100">
          <ModuleExpanded
            module={module}
            enabled={permState}
            onToggle={onToggle}
            onToggleAll={onToggleAll}
          />
        </div>
      )}
    </div>
  );
}

// ======= Main Page =======
export default function PermissionsPage() {
  const [roleName, setRoleName] = useState("مدير النظام");
  const [roleDesc, setRoleDesc] = useState("");
  const [expandedModule, setExpandedModule] = useState(null);
  const [roleSearch, setRoleSearch] = useState("");

  // permissions state: { moduleId: [bool, bool, ...] }
  const [permState, setPermState] = useState(() => {
    const init = {};
    MODULES.forEach((m) => { init[m.id] = m.permissions.map(() => false); });
    return init;
  });

  const togglePerm = (moduleId, idx) => {
    setPermState((prev) => {
      const arr = [...prev[moduleId]];
      arr[idx] = !arr[idx];
      return { ...prev, [moduleId]: arr };
    });
  };

  const toggleAll = (moduleId, val) => {
    setPermState((prev) => ({
      ...prev,
      [moduleId]: prev[moduleId].map(() => val),
    }));
  };

  const totalEnabled = Object.values(permState).flat().filter(Boolean).length;
  const totalDisabled = Object.values(permState).flat().filter((v) => !v).length;

  const filteredRoles = ROLES.filter((r) => r.name.includes(roleSearch));

  return (
    <div className="w-full space-y-5" dir="rtl">

      {/* ===== تعريف الدور ===== */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#c9a84c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-base font-semibold text-gray-800">تعريف الدور</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* اسم الدور */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 text-right">
              اسم الدور <span className="text-red-400">*</span>
            </label>
            <input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-right"
              placeholder="مدير النظام"
            />
          </div>
          {/* وصف الدور */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 text-right">وضف الدور (اختياري)</label>
            <input
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-right"
              placeholder="أدخل وصف الدور"
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 text-right">اختر اسماً واضحاً يُعبر عن وظيفة هذا الدور</p>

        {/* ملخص الصلاحيات */}
        <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>الإجمالي: <span className="font-semibold text-gray-700">{totalEnabled + totalDisabled}</span></span>
            <span className="text-gray-300">|</span>
            <span>الصلاحيات المفعلة: <span className="font-semibold text-green-600">{totalEnabled}</span></span>
          </div>
          <div className="flex items-center gap-2 text-[#c9a84c] text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ملخص الصلاحيات
          </div>
        </div>
      </div>

      {/* ===== مصفوفة الصلاحيات التفصيلية ===== */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <div className="text-right mb-1">
          <h2 className="text-base font-semibold text-gray-800">مصفوفة الصلاحيات التفصيلية</h2>
          <p className="text-xs text-gray-400 mt-0.5">قم بتفعيل أو إلغاء الصلاحيات لكل وحدة من وحدات النظام</p>
        </div>

        <div className="space-y-2">
          {MODULES.map((mod) => (
            <ModuleRow
              key={mod.id}
              module={mod}
              expandedId={expandedModule}
              onExpand={setExpandedModule}
              permState={permState[mod.id]}
              onToggle={(i) => togglePerm(mod.id, i)}
              onToggleAll={(val) => toggleAll(mod.id, val)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button className="px-5 py-2.5 bg-[#c9a84c] hover:bg-[#b8973d] text-white text-sm font-medium rounded-xl transition-colors">
            حفظ التعديلات
          </button>
          <button className="px-5 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors">
            إلغاء الكل
          </button>
        </div>
      </div>

      {/* ===== سجل الأدوار ===== */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div /> {/* spacer */}
          <div className="flex items-center gap-2 text-right">
            <h2 className="text-base font-semibold text-gray-800">سجل الأدوار</h2>
            <button className="w-6 h-6 rounded-full bg-[#c9a84c] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 text-right">فلتر حسب الاسم</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="ابحث هنا ..."
              className="bg-transparent text-sm outline-none w-full placeholder-gray-300 text-right"
              dir="rtl"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="bg-[#faf7f0] border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">اسم الدور</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">عدد الصلاحيات</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">تاريخ الإنشاء</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">ترتيب الدور</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{role.name}</p>
                    <p className="text-xs text-gray-400">{role.desc}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-700">{role.permissions}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400">{role.date}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 border border-gray-200 rounded-lg text-xs text-gray-600 font-medium">
                      {role.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="text-xs text-red-500 font-medium hover:underline flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف
                      </button>
                      <button className="text-xs text-gray-500 hover:text-[#c9a84c] font-medium flex items-center gap-1 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        عرض الصلاحيات
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ترتيب الأدوار ===== */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <div className="text-right">
          <h2 className="text-base font-semibold text-gray-800">ترتيب الأدوار</h2>
          <p className="text-xs text-gray-400 mt-0.5">اسحب وأفلت لترتيب الأدوار وتغيير الأدوار حسب الأولوية</p>
        </div>

        <div className="space-y-2">
          {ROLES.map((role, idx) => (
            <div
              key={role.id}
              className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing hover:border-amber-200 transition-colors"
            >
              {/* Left: permission badge */}
              <span className="text-xs bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                {role.permissions} صلاحية
              </span>
              {/* Right: drag icon + name */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{role.name}</p>
                  <p className="text-xs text-gray-400">الترتيب: {idx + 1}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 8h16M4 16h16" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
