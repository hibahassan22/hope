import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Send } from "lucide-react";
import { useToast } from "../lib/toast";
import { useAuth } from "../hooks/useAuth";
import AppModal from "./ui/AppModal";

const API_BASE = "https://drivo1.elmoroj.com/api";

function personName(person) {
  if (!person) return null;
  return [person.name, person.last_name].filter(Boolean).join(" ") || person.name || null;
}

function formatTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

async function fetchTripMessages(tripId) {
  const res = await fetch(`${API_BASE}/trip-chat/${tripId}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`فشل تحميل المحادثة (${res.status})`);
  const data = await res.json();
  return Array.isArray(data.messages) ? data.messages : [];
}

async function sendTripMessage({ tripId, senderId, receiverId, message }) {
  const res = await fetch(`${API_BASE}/trip-chat/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      trip_id: Number(tripId),
      sender_id: senderId,
      receiver_id: receiverId,
      message: message.trim(),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `خطأ ${res.status}`);
  return json;
}

/**
 * TripChatModal — محادثة رحلة بين السائق وخدمة العملاء
 *
 * Props:
 *   isOpen    {boolean}
 *   onClose   {Function}
 *   tripId    {string|number}
 *   tripLabel {string?}
 */
export default function TripChatModal({ isOpen, onClose, tripId, tripLabel }) {
  const toast = useToast();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const myId = user?.uid ?? "";

  const driverMap = useMemo(() => {
    const map = new Map();
    drivers.forEach((d) => {
      map.set(String(d.id), d);
    });
    return map;
  }, [drivers]);

  const salesMap = useMemo(() => {
    const map = new Map();
    sales.forEach((s) => {
      map.set(String(s.id), s);
      if (s.uid) map.set(String(s.uid), s);
    });
    if (myId) {
      map.set(myId, {
        id: myId,
        name: user?.displayName || user?.fullName || "خدمة العملاء",
      });
    }
    return map;
  }, [sales, myId, user]);

  const loadChatData = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const [msgs, driversRes, salesRes] = await Promise.all([
        fetchTripMessages(tripId),
        fetch(`${API_BASE}/drivers`, { headers: { Accept: "application/json" } }).then((r) => r.json()),
        fetch(`${API_BASE}/sales`, { headers: { Accept: "application/json" } }).then((r) => r.json()),
      ]);

      const driverList = Array.isArray(driversRes) ? driversRes : driversRes.data ?? driversRes.drivers ?? [];
      const salesList = Array.isArray(salesRes) ? salesRes : salesRes.data ?? salesRes.sales ?? [];

      setMessages(msgs);
      setDrivers(driverList);
      setSales(salesList);

      const driverIds = new Set(driverList.map((d) => String(d.id)));
      const involvedDriverIds = new Set();
      msgs.forEach((m) => {
        if (driverIds.has(String(m.sender_id))) involvedDriverIds.add(String(m.sender_id));
        if (driverIds.has(String(m.receiver_id))) involvedDriverIds.add(String(m.receiver_id));
      });

      setSelectedDriverId((prev) => {
        if (prev && (involvedDriverIds.has(prev) || driverIds.has(prev))) return prev;
        const first = [...involvedDriverIds][0] ?? String(driverList[0]?.id ?? "");
        return first;
      });
    } catch (err) {
      toast.error(err.message || "فشل تحميل المحادثة");
    } finally {
      setLoading(false);
    }
  }, [tripId, toast]);

  useEffect(() => {
    if (!isOpen) return;
    setInputText("");
    setSearch("");
    loadChatData();
  }, [isOpen, loadChatData]);

  useEffect(() => {
    if (!isOpen || !tripId) return undefined;
    const timer = setInterval(() => {
      fetchTripMessages(tripId)
        .then(setMessages)
        .catch(() => {});
    }, 8000);
    return () => clearInterval(timer);
  }, [isOpen, tripId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedDriverId]);

  const getPersonLabel = useCallback(
    (id) => {
      const key = String(id);
      const driver = driverMap.get(key);
      if (driver) return personName(driver) || `سائق ${key.slice(0, 6)}`;
      const sale = salesMap.get(key);
      if (sale) return sale.name || "خدمة العملاء";
      if (key === myId) return user?.displayName || "أنت";
      return key.slice(0, 8);
    },
    [driverMap, salesMap, myId, user]
  );

  const driverOptions = useMemo(() => {
    const driverIds = new Set(drivers.map((d) => String(d.id)));
    const involved = new Set();
    messages.forEach((m) => {
      if (driverIds.has(String(m.sender_id))) involved.add(String(m.sender_id));
      if (driverIds.has(String(m.receiver_id))) involved.add(String(m.receiver_id));
    });

    const list = drivers.filter((d) => {
      const id = String(d.id);
      const name = personName(d) || "";
      const matchesSearch = !search || name.includes(search) || id.includes(search);
      return matchesSearch && (involved.has(id) || !involved.size);
    });

    if (involved.size) {
      const involvedDrivers = drivers.filter((d) => involved.has(String(d.id)));
      const filtered = involvedDrivers.filter((d) => {
        const name = personName(d) || "";
        return !search || name.includes(search) || String(d.id).includes(search);
      });
      return filtered.length ? filtered : list;
    }

    return list;
  }, [drivers, messages, search]);

  const threadMessages = useMemo(() => {
    if (!selectedDriverId) return [];
    const driverId = String(selectedDriverId);
    const isSalesSide = (id) => String(id) === myId || salesMap.has(String(id));

    return messages
      .filter((m) => {
        const sender = String(m.sender_id);
        const receiver = String(m.receiver_id);
        return (
          (sender === driverId && isSalesSide(receiver)) ||
          (receiver === driverId && isSalesSide(sender))
        );
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [messages, selectedDriverId, myId, salesMap]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedDriverId || !myId) {
      if (!myId) toast.error("يجب تسجيل الدخول لإرسال رسالة");
      return;
    }
    setSending(true);
    try {
      await sendTripMessage({
        tripId,
        senderId: myId,
        receiverId: selectedDriverId,
        message: inputText,
      });
      setInputText("");
      const msgs = await fetchTripMessages(tripId);
      setMessages(msgs);
    } catch (err) {
      toast.error(err.message || "فشل إرسال الرسالة");
    } finally {
      setSending(false);
    }
  };

  const selectedDriver = driverMap.get(String(selectedDriverId));

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`محادثة الرحلة #${tripId}`}
      subtitle={tripLabel}
      size="xl"
    >
      <div className="flex h-[520px] -mx-1 overflow-hidden rounded-2xl border border-gray-100" dir="rtl">
        {/* قائمة السائقين */}
        <div className="w-64 shrink-0 border-l border-gray-100 bg-[#faf7f0] flex flex-col">
          <div className="px-3 py-3 border-b border-amber-100 bg-gradient-to-b from-[#9C6402] to-[#b8943f]">
            <p className="text-white text-xs font-bold mb-2">السائقون</p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-full rounded-xl bg-white/20 border border-white/20 px-3 py-1.5 text-xs text-white placeholder-white/60 outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : driverOptions.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">لا يوجد سائقون</p>
            ) : (
              driverOptions.map((d) => {
                const id = String(d.id);
                const active = id === String(selectedDriverId);
                const lastMsg = [...messages]
                  .reverse()
                  .find((m) => String(m.sender_id) === id || String(m.receiver_id) === id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedDriverId(id)}
                    className={`w-full text-right px-3 py-3 border-b border-amber-50 transition-colors ${
                      active ? "bg-[#c9a84c]/10 border-r-2 border-r-[#c9a84c]" : "hover:bg-amber-50/60"
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-800 truncate">{personName(d)}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {lastMsg?.message || d.phone || "—"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* نافذة المحادثة */}
        <div className="flex-1 flex flex-col bg-[#f8f6f2] min-w-0">
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">
              {selectedDriver ? personName(selectedDriver) : "اختر سائقاً"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {selectedDriver?.phone || "محادثة حول الرحلة المعروضة"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {!selectedDriverId ? (
              <p className="text-center text-sm text-gray-400 py-10">اختر سائقاً لعرض المحادثة</p>
            ) : threadMessages.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">لا توجد رسائل بعد — ابدأ المحادثة</p>
            ) : (
              threadMessages.map((m) => {
                const isMe = String(m.sender_id) === myId;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[75%] ${isMe ? "items-start" : "items-end"} flex flex-col gap-0.5`}>
                      <span className="text-[10px] text-gray-400 px-1">{getPersonLabel(m.sender_id)}</span>
                      <div
                        className={`px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                          isMe
                            ? "bg-gradient-to-br from-[#9C6402] to-[#c9a84c] text-white rounded-bl-sm"
                            : "bg-white text-gray-800 border border-amber-100 rounded-br-sm"
                        }`}
                      >
                        {m.message}
                      </div>
                      <span className="text-[10px] text-gray-300 px-1">{formatTime(m.created_at)}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !inputText.trim() || !selectedDriverId}
              className="shrink-0 w-10 h-10 rounded-xl bg-[#4a4644] text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="اكتب ردك للسائق..."
              disabled={sending || !selectedDriverId}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-right outline-none focus:border-[#c9a84c] disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </AppModal>
  );
}
