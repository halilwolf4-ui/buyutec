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
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <span>Birikim &</span>
            <span className="text-cyan-400 font-extrabold">Yatırım</span>
            <PiggyBank className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fon, altın, vadeli, borsa ve kripto portföyünüz
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Varlık Ekle</span>
        </button>
      </div>

      {/* Combined Tampon Hero Card */}
      <div
        className={`p-5 rounded-3xl border relative overflow-hidden backdrop-blur-xl ${
          isLight
            ? 'bg-gradient-to-br from-cyan-50 via-teal-50 to-white border-cyan-200/80 shadow-md shadow-cyan-500/5'
            : 'bg-gradient-to-br from-[#0c1a29]/80 via-slate-900/80 to-slate-900/90 border-cyan-500/25 shadow-xl shadow-black/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Toplam Birikmiş Tampon
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
            Nakit + Yatırımlar
          </span>
        </div>

        <h2 className="text-3xl font-black tabular-nums text-slate-100 drop-shadow-sm font-mono tracking-tight my-1">
          {formatMoney(combinedTotalTampon)}
        </h2>

        {/* Ratio Track Bar */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex h-3 w-full rounded-xl overflow-hidden bg-slate-950/60 p-0.5 border border-white/[0.08]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cashPct}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-l-lg bg-gradient-to-r from-emerald-500 to-teal-400"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${savingsPct}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-r-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-medium pt-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Kasa Tamponu: <strong>{formatMoney(Math.max(0, cashBuffer))}</strong> (%{cashPct})</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span>Portföy: <strong>{formatMoney(totalSavings)}</strong> (%{savingsPct})</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
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

        {/* Horizontal Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SAVINGS_CATEGORIES.map(cat => {
            const data = categoryBreakdown[cat.type];
            const pct = totalSavings > 0 ? Math.round((data.total / totalSavings) * 100) : 0;

            return (
              <div
                key={cat.type}
                className={`p-3 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-xl bg-white/[0.05]">
                    {getCategoryIcon(cat.type)}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    %{pct}
                  </span>
                </div>
                <div className="mt-2">
                  <h4 className="text-[11px] font-bold text-slate-300 truncate">
                    {cat.label}
                  </h4>
                  <div className="text-xs font-bold font-mono text-slate-100 mt-0.5">
                    {formatMoney(data.total)}
                  </div>
                  <div className="text-[10px] text-slate-400">
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
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Ekle</span>
          </button>
        </div>

        {savings.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/[0.08] rounded-3xl p-6">
            <Coins className="w-10 h-10 text-cyan-400/50 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">Henüz birikim eklemediniz</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Yatırım fonu, altın, vadeli mevduat, borsa veya kripto varlıklarınızı buraya ekleyerek toplam tamponunuzu büyütün.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
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
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-slate-900/60 border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-white/[0.05] shrink-0">
                        {getCategoryIcon(item.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-200 truncate">
                            {item.name}
                          </h4>
                          <span
                            className="text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0"
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
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
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
                            className="w-24 h-8 px-2 rounded-lg bg-white/[0.08] border border-cyan-400 text-xs font-bold font-mono text-cyan-400 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-right">
                            <div className="text-xs font-bold font-mono text-slate-100 tabular-nums">
                              {formatMoney(item.amount)}
                            </div>
                            {item.updatedAt && (
                              <div className="text-[9px] text-slate-500 font-mono">
                                {item.updatedAt}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                            title="Tutarı Güncelle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ y: '100%', opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.8 }}
        className={`relative w-full max-w-md rounded-t-[28px] sm:rounded-3xl border shadow-2xl p-6 z-10 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#10141e] border-white/[0.08] text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
          <h3 className="text-base font-bold">Yeni Birikim / Varlık Ekle</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Varlık Türü
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SAVINGS_CATEGORIES.map(cat => (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => setType(cat.type)}
                  className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all ${
                    type === cat.type
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="truncate">{cat.label.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Varlık Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: TI2 Fonu, 24 Ayar Gram Altın, THYAO..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Güncel Değer (₺)
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full h-12 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-lg font-bold font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Hedef / Not (İsteğe bağlı)
            </label>
            <input
              type="text"
              placeholder="Örn: Acil durum, Emeklilik, Ev peşinatı..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-white/[0.1] text-slate-300 font-semibold text-xs"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400 active:scale-98 transition-all"
            >
              Varlığı Ekle
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
