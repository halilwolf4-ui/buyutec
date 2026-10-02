import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { AppData } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  Repeat,
  Calendar,
  Download,
  Upload,
  LogOut,
  Trash2,
  ChevronRight,
  ShieldAlert,
  User,
  Info,
  CheckCircle2
} from 'lucide-react';

interface SettingsTabProps {
  data: AppData;
  onUpdateSettings: (newCycleDay: number) => void;
  onOpenRecurringModal: () => void;
  onDownloadBackup: () => void;
  onUploadBackup: (file: File) => void;
  onLogout: () => void;
  onClearAllData: () => void;
  currentUser: string | null;
  onOpenAuth: () => void;
  isLight: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  data,
  onUpdateSettings,
  onOpenRecurringModal,
  onDownloadBackup,
  onUploadBackup,
  onLogout,
  onClearAllData,
  currentUser,
  onOpenAuth,
  isLight
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadBackup(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cycleDay = data.settings.cycleStartDay || 1;

  return (
    <div className="space-y-5 pb-20 pt-1">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-100">Ayarlar</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Hesap, veri yedekleme ve bütçe döngüsü tercihleri
        </p>
      </div>

      {/* Account Info Card */}
      <div
        onClick={onOpenAuth}
        className={`p-4 rounded-3xl border flex items-center justify-between cursor-pointer transition-all ${
          isLight
            ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
            : 'bg-slate-900/60 border-white/[0.08] hover:border-cyan-400/40 shadow-lg'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-cyan-500/25">
            {currentUser ? currentUser.charAt(0).toUpperCase() : 'G'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-100">
                {currentUser ? currentUser : 'Misafir Kullanıcı'}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {currentUser ? 'Şifreli Hesap' : 'Yerel Veri'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentUser ? 'Hesap değiştirmek veya çıkış yapmak için dokunun' : 'Şifre belirlemek için hesap açın'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* Preferences Group */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Bütçe & Kalıcı Kalemler
        </span>

        {/* Kalıcı İşlemler Trigger */}
        <div
          onClick={onOpenRecurringModal}
          className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
            isLight
              ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
              : 'bg-slate-900/60 border-white/[0.08] hover:border-cyan-400/40 shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">
                Kalıcı İşlemler (Maaş, Kira vb.)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {data.recurring.length} adet kayıtlı kalıcı işlem
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-sm hover:bg-cyan-400 transition-colors">
            Yönet
          </button>
        </div>

        {/* Ay Başı / Hesap Kesim Günü */}
        <div
          className={`p-4 rounded-3xl border ${
            isLight
              ? 'bg-white border-slate-200 shadow-sm'
              : 'bg-slate-900/60 border-white/[0.08] shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Maaş Döngüsü / Kesim Günü
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Her ayın kaçında yeni bütçe başlasın?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="31"
                value={cycleDay}
                onChange={e => {
                  let val = parseInt(e.target.value, 10);
                  if (isNaN(val) || val < 1) val = 1;
                  if (val > 31) val = 31;
                  onUpdateSettings(val);
                }}
                className="w-16 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] text-center font-bold font-mono text-cyan-400 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-xs font-semibold text-slate-400">. gün</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal pl-13">
            Örn: 15 seçerseniz bütçeniz &apos;15 Ekim - 14 Kasım&apos; döngüsüne göre hesaplanır.
          </p>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Veri & Yedekleme
        </span>

        {/* Download Backup */}
        <div
          onClick={onDownloadBackup}
          className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
            isLight
              ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
              : 'bg-slate-900/60 border-white/[0.08] hover:border-cyan-400/40 shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Yedeği İndir (.json)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tüm aylar, borçlar ve kalıcı işlemleri dışa aktar
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Upload Backup */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
            isLight
              ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
              : 'bg-slate-900/60 border-white/[0.08] hover:border-cyan-400/40 shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Yedeği Yükle (.json)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Daha önce kaydedilmiş JSON yedeğini geri yükle
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-2.5 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-400 px-1">
          Hesap & Veri İşlemleri
        </span>

        {currentUser && (
          <div
            onClick={onLogout}
            className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${
              isLight
                ? 'bg-white border-slate-200 hover:border-rose-400'
                : 'bg-slate-900/60 border-white/[0.08] hover:border-rose-400/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Hesaptan Çıkış Yap</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Bu cihazdaki oturumu sonlandır
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}

        <div
          onClick={onClearAllData}
          className={`p-4 rounded-3xl border cursor-pointer transition-all flex items-center justify-between border-rose-500/30 ${
            isLight
              ? 'bg-rose-50/50 hover:bg-rose-100/60'
              : 'bg-rose-950/20 hover:bg-rose-950/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-400">
                Hesabımı ve Tüm Verilerimi Sil
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kayıtlı bütçe ve kullanıcı verilerini tamamen temizler
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </div>
      </div>

      {/* App Branding & Version Footer */}
      <div className="pt-4 text-center space-y-1">
        <BrandLogo size={32} className="mx-auto opacity-70" />
        <p className="text-xs font-bold text-slate-300">Büyüteç Bütçe v2.0</p>
        <p className="text-[10px] text-slate-400">
          Kişisel Bütçe ve Harcama Yönetimi Asistanınız · 2026
        </p>
      </div>
    </div>
  );
};
