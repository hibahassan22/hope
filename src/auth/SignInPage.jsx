import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function SignInPage() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Forgot-password state
  const [forgotMode,    setForgotMode]    = useState(false);
  const [resetEmail,    setResetEmail]    = useState("");
  const [resetSent,     setResetSent]     = useState(false);
  const [resetLoading,  setResetLoading]  = useState(false);
  const [resetError,    setResetError]    = useState("");

  /* ── Sign In ── */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("يرجى إدخال البريد الإلكتروني وكلمة المرور"); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
        case "auth/wrong-password":
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة"); break;
        case "auth/invalid-email":
          setError("صيغة البريد الإلكتروني غير صحيحة"); break;
        case "auth/too-many-requests":
          setError("محاولات كثيرة، يرجى الانتظار قليلاً ثم المحاولة مجدداً"); break;
        default:
          setError("حدث خطأ، يرجى المحاولة مجدداً");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot Password ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    if (!resetEmail.trim()) { setResetError("يرجى إدخال بريدك الإلكتروني"); return; }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSent(true);
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-email":
          setResetError("البريد الإلكتروني غير مسجل في النظام"); break;
        default:
          setResetError("حدث خطأ، يرجى المحاولة مجدداً");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-[#c9a84c]/30">
            <img src="/judy.png" alt="Drivo" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#c9a84c]">Drivo</h1>
            <p className="text-sm text-gray-500 mt-0.5">لوحة تحكم المشرفين</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-7">

          {/* ── Forgot Password Mode ── */}
          {forgotMode ? (
            <>
              <h2 className="text-base font-bold text-gray-800 mb-1">استعادة كلمة المرور</h2>
              <p className="text-xs text-gray-500 mb-5">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>

              {resetSent ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-2">
                  <div className="text-2xl">✅</div>
                  <p className="text-sm font-semibold text-green-700">تم إرسال رابط الاستعادة</p>
                  <p className="text-xs text-green-600">تحقق من بريدك الإلكتروني واتبع التعليمات</p>
                  <button
                    onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail(""); }}
                    className="mt-2 text-xs text-[#c9a84c] font-semibold hover:underline"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {resetError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5 text-right">
                      {resetError}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600 block">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="example@domain.com"
                      dir="ltr"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#c9a84c] focus:outline-none placeholder-gray-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-[#c9a84c] hover:bg-[#b8943f] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
                  >
                    {resetLoading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(false); setResetError(""); }}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </form>
              )}
            </>
          ) : (

            /* ── Sign In Mode ── */
            <>
              <h2 className="text-base font-bold text-gray-800 mb-5">تسجيل الدخول</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5 text-right mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 block">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    dir="ltr"
                    autoComplete="email"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#c9a84c] focus:outline-none placeholder-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 block">كلمة المرور</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    autoComplete="current-password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#c9a84c] focus:outline-none placeholder-gray-300"
                  />
                </div>

                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError(""); }}
                    className="text-xs text-[#c9a84c] hover:text-[#b8943f] font-medium"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c9a84c] hover:bg-[#b8943f] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 shadow-sm"
                >
                  {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
