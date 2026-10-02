import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string | null;
  onLogin: (username: string) => void;
  onLogout: () => void;
  isLight?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  isLight = false
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError('Kullanıcı adı ve şifre zorunludur.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('budgetApp_users') || '{}');

    if (isLoginMode) {
      if (!users[u]) {
        setError('Kullanıcı bulunamadı. Lütfen kayıt olun.');
        return;
      }
      if (users[u].password !== btoa(p)) {
        setError('Hatalı şifre girdiniz.');
        return;
      }
      onLogin(u);
      onClose();
    } else {
      if (users[u]) {
        setError('Bu kullanıcı adı zaten alınmış.');
        return;
      }
      users[u] = { password: btoa(p) };
      localStorage.setItem('budgetApp_users', JSON.stringify(users));
      onLogin(u);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        className={`relative w-full max-w-sm rounded-3xl border p-6 shadow-2xl overflow-hidden z-10 ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
            : 'bg-[#10131c] border-white/[0.1] text-slate-100 shadow-black'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {currentUser ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 mx-auto flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-cyan-500/30">
              {currentUser.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold">Aktif Hesap: {currentUser}</h3>
              <p className="text-xs text-slate-400">Verileriniz bu kullanıcı altında güvende.</p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-xs hover:bg-rose-500/20 transition-colors"
              >
                Çıkış Yap
              </button>
              <button
                onClick={onClose}
                className="w-full h-11 rounded-xl bg-white/[0.05] border border-white/[0.08] font-semibold text-xs hover:bg-white/[0.08] transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <BrandLogo size={52} className="mx-auto mb-2" />
              <h3 className="text-lg font-black tracking-tight">
                {isLoginMode ? 'Giriş Yap' : 'Yeni Hesap Oluştur'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bütçe ve harcama verilerinizi şifreleyin
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="kullanici_adi"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400 active:scale-[0.98] transition-all"
              >
                {isLoginMode ? 'Giriş Yap' : 'Hesap Oluştur ve Başla'}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError(null);
                }}
                className="text-xs text-cyan-400 font-semibold hover:underline"
              >
                {isLoginMode
                  ? 'Hesabınız yok mu? Yeni Hesap Açın'
                  : 'Zaten hesabınız var mı? Giriş Yapın'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
