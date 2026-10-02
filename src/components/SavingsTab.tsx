import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SavingsItem,
  SavingsCategoryType,
  SAVINGS_CATEGORIES,
  formatMoney,
  generateId
} from '../types';
import {
  PieChart as PieIcon,
  Sparkles,
  Percent,
  TrendingUp,
  Zap,
  DollarSign,
  Wallet,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  PiggyBank
} from 'lucide-react';

interface SavingsTabProps {
  savings: SavingsItem[];
  cashBuffer: number; // accumulated monthly buffer from budget
  onUpdateSavings: (updated: SavingsItem[]) => void;
  isLight: boolean;
  onOpenAddModal: () => void;
}

export const SavingsTab: React.FC<SavingsTabProps> = ({
  savings,
  cashBuffer,
  onUpdateSavings,
  isLight,
  onOpenAddModal
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  // Total Portfolio Value
  const totalSavings = useMemo(() => {
    return savings.reduce((sum, s) => sum + (s.amount || 0), 0);
  }, [savings]);

  // Combined Total Tampon (Cash Buffer + Savings Portfolio)
  const combinedTotalTampon = Math.max(0, cashBuffer) + totalSavings;

  const cashPct = combinedTotalTampon > 0 ? Math.round((Math.max(0, cashBuffer) / combinedTotalTampon) * 100) : 50;
  const savingsPct = combinedTotalTampon > 0 ? 100 - cashPct : 50;

  // Breakdown by savings category
  const categoryBreakdown = useMemo(() => {
    const map: Record<SavingsCategoryType, { total: number; count: number; items: SavingsItem[] }> = {
      fon: { total: 0, count: 0, items: [] },
      altin: { total: 0, count: 0, items: [] },
      vadeli: { total: 0, count: 0, items: [] },
      borsa: { total: 0, count: 0, items: [] },
      kripto: { total: 0, count: 0, items: [] },
      doviz: { total: 0, count: 0, items: [] },
      diger: { total: 0, count: 0, items: [] }
    };

    savings.forEach(item => {
      const type = item.type || 'diger';
      if (map[type]) {
        map[type].total += item.amount || 0;
        map[type].count += 1;
        map[type].items.push(item);
      }
    });

    return map;
  }, [savings]);

  const getCategoryMeta = (type: SavingsCategoryType) => {
    return SAVINGS_CATEGORIES.find(c => c.type === type) || SAVINGS_CATEGORIES[0];
  };

  const getCategoryIcon = (type: SavingsCategoryType) => {
    switch (type) {
      case 'fon':
        return <PieIcon className="w-4 h-4 text-cyan-400" />;
      case 'altin':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'vadeli':
        return <Percent className="w-4 h-4 text-emerald-400" />;
      case 'borsa':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'kripto':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'doviz':
        return <DollarSign className="w-4 h-4 text-pink-400" />;
      default:
        return <Wallet className="w-4 h-4 text-teal-400" />;
    }
  };

  const handleDeleteItem = (id: string) => {
    onUpdateSavings(savings.filter(s => s.id !== id));
  };

  const handleStartEdit = (item: SavingsItem) => {
    setEditingItemId(item.id);
    setEditAmount(String(item.amount));
  };

  const handleSaveEdit = (id: string) => {
    const val = parseFloat(editAmount);
    if (!isNaN(val) && val >= 0) {
      const today = new Date();
      onUpdateSavings(
        savings.map(s =>
          s.id === id
            ? { ...s, amount: val, updatedAt: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}` }
            : s
        )
      );
    }
    setEditingItemId(null);
  };

  return (
    <div className="space-y-5 pb-24 pt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span className={isLight ? 'text-slate-900' : 'text-slate-100'}>Birikim &</span>
            <span
              className={
                isLight
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#f72585] to-[#4361ee]'
                  : 'text-cyan-400 font-extrabold'
              }
            >
              Yatırım
            </span>
            <PiggyBank className={`w-5 h-5 ${isLight ? 'text-[#7209b7]' : 'text-cyan-400'}`} />
          </h1>
          <p className={`text-xs font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Fon, altın, vadeli, borsa ve kripto portföyünüz
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md font-bold text-xs shadow-md active:scale-95 transition-all ${
            isLight
              ? 'bg-gradient-to-r from-[#f72585] to-[#4361ee] text-white shadow-[#4361ee]/20'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-cyan-500/25'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Varlık Ekle</span>
        </button>
      </div>

      {/* Combined Tampon Hero Card - Sharp & Stylized */}
      <div
        className={`p-4.5 rounded-lg border-2 relative overflow-hidden transition-all ${
          isLight
            ? 'bg-gradient-to-br from-white via-[#f8f9fe] to-[#eef2ff] border-[#4361ee] shadow-[0_4px_20px_rgba(67,97,238,0.12)]'
            : 'bg-gradient-to-br from-[#1a1428] via-[#141222] to-[#0e101a] border-[#3e3455] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Top Glowing Accent Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isLight
              ? 'bg-gradient-to-r from-[#f72585] via-[#4361ee] to-[#4cc9f0]'
              : 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#7209b7]'
          }`}
        />

        <div className="flex items-center justify-between mb-1.5 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                isLight ? 'text-[#4361ee]' : 'text-emerald-400'
              }`}
            >
              TOPLAM BİRİKMİŞ TAMPON
            </span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider border ${
              isLight
                ? 'bg-[#4361ee]/10 text-[#4361ee] border-[#4361ee]/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            Nakit Kasa
          </span>
        </div>

        {/* Big number: ONLY cash buffer (investments excluded) */}
        <h2
          className={`text-3xl font-black tabular-nums font-mono tracking-tight my-1.5 ${
            cashBuffer < 0
              ? 'text-rose-500'
              : isLight
              ? 'text-slate-900'
              : 'text-emerald-400'
          }`}
        >
          {formatMoney(cashBuffer)}
        </h2>

        {/* Ratio Track Bar - Sharp */}
        <div className="mt-3 space-y-1.5">
          <div
            className={`flex h-2.5 w-full rounded-sm overflow-hidden p-0.5 border ${
              isLight
                ? 'bg-slate-100 border-[#4361ee]/20'
                : 'bg-[#120f1e] border-[#372d4c]'
            }`}
          >
            <div
              style={{ width: `${cashPct}%` }}
              className={`h-full rounded-none ${
                isLight ? 'bg-[#4361ee]' : 'bg-emerald-400'
              }`}
            />
            <div
              style={{ width: `${savingsPct}%` }}
              className={`h-full rounded-none ${
                isLight ? 'bg-[#f72585]' : 'bg-cyan-400'
              }`}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono pt-0.5">
            <div className={`flex items-center gap-1 ${isLight ? 'text-[#4361ee]' : 'text-emerald-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-none ${isLight ? 'bg-[#4361ee]' : 'bg-emerald-400'}`} />
              <span>Nakit Tampon: <strong>{formatMoney(Math.max(0, cashBuffer))}</strong> (%{cashPct})</span>
            </div>
            <div className={`flex items-center gap-1 ${isLight ? 'text-[#f72585]' : 'text-cyan-400'}`}>
              <span>Yatırım Portföyü: <strong>{formatMoney(totalSavings)}</strong> (%{savingsPct})</span>
              <span className={`w-1.5 h-1.5 rounded-none ${isLight ? 'bg-[#f72585]' : 'bg-cyan-400'}`} />
            </div>
          </div>

          <div
            className={`flex items-center justify-between text-[10px] mt-1 pt-1.5 border-t font-mono ${
              isLight ? 'border-slate-200 text-slate-500' : 'border-[#2d2542] text-slate-400'
            }`}
          >
            <span>Toplam Varlık Gücü:</span>
            <span className={`font-bold ${isLight ? 'text-[#7209b7]' : 'text-slate-100'}`}>
              {formatMoney(cashBuffer + totalSavings)}
            </span>
          </div>
        </div>
      </div>

      {/* Asset Categories Grid / Filter Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Varlık Dağılımı ({savings.length} Kalem)
          </span>
          <span className="text-xs font-bold font-mono text-cyan-400">
            {formatMoney(totalSavings)}
          </span>
        </div>

        {/* Horizontal Category Cards - Sharp & High Contrast */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SAVINGS_CATEGORIES.map(cat => {
            const data = categoryBreakdown[cat.type];
            const pct = totalSavings > 0 ? Math.round((data.total / totalSavings) * 100) : 0;

            return (
              <div
                key={cat.type}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isLight
                    ? 'bg-white border-[#4361ee]/20 shadow-sm'
                    : 'bg-[#181427] border-[#372d4c]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-1.5 rounded-md ${
                      isLight ? 'bg-slate-100' : 'bg-white/[0.05]'
                    }`}
                  >
                    {getCategoryIcon(cat.type)}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    %{pct}
                  </span>
                </div>
                <div className="mt-2">
                  <h4
                    className={`text-[11px] font-black truncate ${
                      isLight ? 'text-slate-700' : 'text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </h4>
                  <div
                    className={`text-xs font-black font-mono mt-0.5 ${
                      isLight ? 'text-slate-900' : 'text-slate-100'
                    }`}
                  >
                    {formatMoney(data.total)}
                  </div>
                  <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {data.count} varlık
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Savings Items List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Kayıtlı Varlıklar
          </span>
          <button
            onClick={onOpenAddModal}
            className={`text-xs font-mono font-bold transition-colors flex items-center gap-1 ${
              isLight ? 'text-[#4361ee] hover:text-[#7209b7]' : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Ekle</span>
          </button>
        </div>

        {savings.length === 0 ? (
          <div
            className={`text-center py-8 border-2 border-dashed rounded-lg p-6 ${
              isLight ? 'border-slate-300 bg-white' : 'border-[#372d4c] bg-[#141220]'
            }`}
          >
            <Coins className="w-10 h-10 text-cyan-400/50 mx-auto mb-2" />
            <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Henüz birikim eklemediniz
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Yatırım fonu, altın, vadeli mevduat, borsa veya kripto varlıklarınızı buraya ekleyerek toplam tamponunuzu büyütün.
            </p>
            <button
              onClick={onOpenAddModal}
              className={`mt-4 px-4 py-2 rounded-md font-bold text-xs ${
                isLight ? 'bg-[#4361ee] text-white' : 'bg-cyan-500 text-slate-950'
              }`}
            >
              İlk Birikimini Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {savings.map(item => {
              const meta = getCategoryMeta(item.type);
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-[#181427] border-[#372d4c]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-md shrink-0 ${
                          isLight ? 'bg-slate-100' : 'bg-white/[0.05]'
                        }`}
                      >
                        {getCategoryIcon(item.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs font-black truncate ${
                              isLight ? 'text-slate-900' : 'text-slate-200'
                            }`}
                          >
                            {item.name}
                          </h4>
                          <span
                            className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm shrink-0"
                            style={{
                              backgroundColor: `${meta.color}15`,
                              color: meta.color,
                              border: `1px solid ${meta.color}30`
                            }}
                          >
                            {meta.label.split(' ')[0]}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            autoFocus
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            className="w-24 h-8 px-2 rounded-md bg-white/[0.08] border border-cyan-400 text-xs font-bold font-mono text-cyan-400 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 rounded-md bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-right">
                            <div
                              className={`text-xs font-black font-mono tabular-nums ${
                                isLight ? 'text-slate-900' : 'text-slate-100'
                              }`}
                            >
                              {formatMoney(item.amount)}
                            </div>
                            {item.updatedAt && (
                              <div className="text-[9px] text-slate-400 font-mono">
                                {item.updatedAt}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleStartEdit(item)}
                            className={`p-1.5 rounded-md transition-colors ${
                              isLight
                                ? 'text-slate-500 hover:text-[#4361ee] hover:bg-slate-100'
                                : 'text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05]'
                            }`}
                            title="Tutarı Güncelle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* --- Add Savings Modal --- */
interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<SavingsItem, 'id'>) => void;
  isLight: boolean;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isLight
}) => {
  const [type, setType] = useState<SavingsCategoryType>('fon');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount.replace(',', '.'));
    if (!name.trim() || isNaN(amt) || amt < 0) {
      return;
    }
    const today = new Date();
    onAdd({
      type,
      name: name.trim(),
      amount: amt,
      note: note.trim() || undefined,
      updatedAt: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
    });
    setName('');
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className={`relative w-full max-w-sm sm:max-w-md max-h-[85vh] rounded-lg border-2 shadow-2xl p-4 z-10 flex flex-col overflow-y-auto ${
          isLight
            ? 'bg-white border-[#4361ee]/30 text-slate-900 shadow-slate-400/25'
            : 'bg-[#181427] border-[#3e3455] text-slate-100 shadow-black'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-2.5 mb-2.5 border-b ${
            isLight ? 'border-slate-200' : 'border-white/[0.08]'
          }`}
        >
          <h3
            className={`text-sm font-black font-mono tracking-tight ${
              isLight ? 'text-slate-900' : 'text-slate-100'
            }`}
          >
            Yeni Birikim / Varlık Ekle
          </h3>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${
              isLight
                ? 'border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'border-[#3e3455] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label
              className={`block text-[10px] font-black font-mono uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              Varlık Türü
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SAVINGS_CATEGORIES.map(cat => (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => setType(cat.type)}
                  className={`p-1.5 rounded-md text-left border-2 text-[11px] font-mono font-bold transition-all ${
                    type === cat.type
                      ? isLight
                        ? 'bg-[#4361ee]/15 border-[#4361ee] text-[#4361ee]'
                        : 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      : 'bg-[#120f1e] border-[#372d4c] text-slate-400 hover:border-[#524470]'
                  }`}
                >
                  <div className="truncate">{cat.label.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className={`block text-[10px] font-black font-mono uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              Varlık Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: TI2 Fonu, 24 Ayar Gram Altın, THYAO..."
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full h-9 px-3 rounded-md border-2 text-xs font-bold focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                  : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-[10px] font-black font-mono uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              Güncel Değer (₺)
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`w-full h-10 px-3 rounded-md border-2 text-base font-black font-mono focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                  : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-[10px] font-black font-mono uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              Hedef / Not (İsteğe bağlı)
            </label>
            <input
              type="text"
              placeholder="Örn: Acil durum, Emeklilik, Ev peşinatı..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className={`w-full h-9 px-3 rounded-md border-2 text-xs font-medium focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                  : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
              }`}
            />
          </div>

          <div className="flex gap-2 pt-1.5">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 h-9 rounded-md border-2 font-mono font-bold text-xs transition-colors ${
                isLight
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'border-[#3e3455] text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              className={`flex-1 h-9 rounded-md font-mono font-bold text-xs shadow-md active:scale-98 transition-all ${
                isLight
                  ? 'bg-gradient-to-r from-[#f72585] to-[#4361ee] text-white shadow-[#4361ee]/20'
                  : 'bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              Varlığı Ekle
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
