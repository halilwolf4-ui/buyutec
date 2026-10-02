import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Debt, RecurringItem, formatMoney } from '../types';
import {
  X,
  CreditCard,
  Repeat,
  Plus,
  Trash2,
  ChevronDown
} from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isLight?: boolean;
}

export const BottomSheetModal: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  isLight = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80"
          />

          {/* Centered Modal Container - Sharp & Compact (Does not cover full screen) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`relative w-full max-w-sm sm:max-w-md max-h-[85vh] flex flex-col rounded-lg border-2 shadow-2xl overflow-hidden z-10 ${
              isLight
                ? 'bg-white border-[#4361ee]/30 text-slate-900 shadow-slate-400/25'
                : 'bg-[#181427] border-[#3e3455] text-slate-100 shadow-black'
            }`}
          >
            {/* Top Accent Strip */}
            <div
              className={`h-1 w-full shrink-0 ${
                isLight
                  ? 'bg-gradient-to-r from-[#f72585] via-[#7209b7] to-[#4361ee]'
                  : 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#7209b7]'
              }`}
            />

            {/* Header */}
            <div
              className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${
                isLight ? 'border-slate-200' : 'border-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-2">
                {icon && (
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs ${
                      isLight ? 'bg-[#4361ee]/10 text-[#4361ee]' : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    {icon}
                  </div>
                )}
                <div>
                  <h3
                    className={`text-sm font-black font-mono tracking-tight leading-tight ${
                      isLight ? 'text-slate-900' : 'text-slate-100'
                    }`}
                  >
                    {title}
                  </h3>
                  {subtitle && (
                    <p className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
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

            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-3">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* --- 1. TRANSACTION MODAL --- */
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onConfirm: (amount: number, desc: string) => void;
  isLight?: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  title,
  onConfirm,
  isLight = false
}) => {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDesc('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }
    onConfirm(val, desc.trim() || 'İşlem');
    onClose();
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${title} Ekle`}
      subtitle="Bu kaleme yeni tutar ekleyin"
      icon={<Plus className="w-4 h-4" />}
      isLight={isLight}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            className={`block text-[10px] font-black font-mono uppercase tracking-wider mb-1 ${
              isLight ? 'text-slate-700' : 'text-slate-400'
            }`}
          >
            Tutar (₺)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              autoFocus
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`w-full h-11 pl-3 pr-10 rounded-md border-2 text-xl font-black font-mono focus:outline-none transition-all ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                  : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-600 focus:border-cyan-400'
              }`}
            />
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 font-mono font-bold text-base ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              ₺
            </span>
          </div>
        </div>

        <div>
          <label
            className={`block text-[10px] font-black font-mono uppercase tracking-wider mb-1 ${
              isLight ? 'text-slate-700' : 'text-slate-400'
            }`}
          >
            Açıklama (İsteğe bağlı)
          </label>
          <input
            type="text"
            placeholder="Örn: Hafta Sonu Alışverişi, Fatura vb."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className={`w-full h-10 px-3 rounded-md border-2 text-xs font-medium focus:outline-none transition-all ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-600 focus:border-cyan-400'
            }`}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 h-10 rounded-md border-2 font-mono font-bold text-xs transition-colors ${
              isLight
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'border-[#3e3455] text-slate-300 hover:bg-white/[0.05]'
            }`}
          >
            İptal
          </button>
          <button
            type="submit"
            className={`flex-1 h-10 rounded-md font-mono font-bold text-xs shadow-md active:scale-[0.98] transition-all ${
              isLight
                ? 'bg-gradient-to-r from-[#f72585] via-[#7209b7] to-[#4361ee] text-white shadow-[#4361ee]/25'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            Ekle
          </button>
        </div>
      </form>
    </BottomSheetModal>
  );
};

/* --- 2. DEBT MANAGER MODAL --- */
interface DebtManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  onAddDebt: (name: string, totalAmount: number, installments: number) => void;
  onDeleteDebt: (debtId: string) => void;
  isLight?: boolean;
}

export const DebtManagerModal: React.FC<DebtManagerModalProps> = ({
  isOpen,
  onClose,
  debts,
  onAddDebt,
  onDeleteDebt,
  isLight = false
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('');

  const totalRemaining = debts.reduce((sum, d) => sum + d.remainingAmount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(amount);
    const inst = parseInt(installments, 10);
    if (!name.trim() || isNaN(tot) || tot <= 0 || isNaN(inst) || inst <= 0) {
      alert('Lütfen tüm alanları geçerli şekilde doldurun.');
      return;
    }
    onAddDebt(name.trim(), tot, inst);
    setName('');
    setAmount('');
    setInstallments('');
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Borç Yönetimi"
      subtitle={`Toplam Borç: ${formatMoney(totalRemaining)}`}
      icon={<CreditCard className="w-4 h-4 text-rose-400" />}
      isLight={isLight}
    >
      <div className="space-y-3">
        {/* Existing Debts List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {debts.length === 0 ? (
            <div
              className={`text-center py-4 border-2 border-dashed rounded-md p-3 ${
                isLight ? 'border-slate-300 bg-slate-50' : 'border-[#372d4c] bg-[#120f1e]'
              }`}
            >
              <p className={`text-xs font-mono font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Kayıtlı borcunuz bulunmuyor.
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Aşağıdaki formu kullanarak yeni borç ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            debts.map(d => (
              <div
                key={d.id}
                className={`p-2.5 rounded-md border-2 flex items-center justify-between gap-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#120f1e] border-[#372d4c]'
                }`}
              >
                <div className="min-w-0">
                  <h4 className={`text-xs font-black truncate ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    {d.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5">
                    <span>Aylık: {formatMoney(d.installmentAmount)}</span>
                    <span>·</span>
                    <span>{d.installments} Taksit</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-rose-500">
                      {formatMoney(d.remainingAmount)}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      / {formatMoney(d.totalAmount)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`"${d.name}" borcunu silmek istediğinize emin misiniz?`)) {
                        onDeleteDebt(d.id);
                      }
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Borcu Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Debt Form - Sharp */}
        <form
          onSubmit={handleAdd}
          className={`p-3 rounded-md border-2 space-y-2.5 ${
            isLight
              ? 'bg-[#f8f9fe] border-[#4361ee]/20'
              : 'bg-[#141220] border-[#372d4c]'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs font-black font-mono uppercase tracking-wider ${
              isLight ? 'text-[#4361ee]' : 'text-cyan-400'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Borç Ekle</span>
          </div>

          <input
            type="text"
            placeholder="Borç Adı (Örn: Kredi Kartı, Telefon Kredisi)"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`w-full h-9 px-3 rounded-md border-2 text-xs font-bold focus:outline-none ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
            }`}
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Toplam Borç (₺)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`w-full h-9 px-3 rounded-md border-2 text-xs font-mono font-bold focus:outline-none ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                  : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
              }`}
            />
            <input
              type="number"
              placeholder="Taksit Sayısı (Ay)"
              value={installments}
              onChange={e => setInstallments(e.target.value)}
              className={`w-full h-9 px-3 rounded-md border-2 text-xs font-mono font-bold focus:outline-none ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                  : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
              }`}
            />
          </div>

          <button
            type="submit"
            className={`w-full h-9 rounded-md font-mono font-bold text-xs shadow-sm active:scale-[0.98] transition-all ${
              isLight
                ? 'bg-[#4361ee] text-white shadow-[#4361ee]/25'
                : 'bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            Borcu Kaydet
          </button>
        </form>
      </div>
    </BottomSheetModal>
  );
};

/* --- 3. PAY DEBT MODAL --- */
interface PayDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  onConfirmPay: (debtId: string, amount: number) => void;
  isLight?: boolean;
}

export const PayDebtModal: React.FC<PayDebtModalProps> = ({
  isOpen,
  onClose,
  debts,
  onConfirmPay,
  isLight = false
}) => {
  const [selectedDebtId, setSelectedDebtId] = useState('');
  const [payAmount, setPayAmount] = useState('');

  const activeDebts = debts.filter(d => d.remainingAmount > 0);

  useEffect(() => {
    if (isOpen) {
      if (activeDebts.length > 0) {
        setSelectedDebtId(activeDebts[0].id);
        setPayAmount(String(activeDebts[0].installmentAmount));
      } else {
        setSelectedDebtId('');
        setPayAmount('');
      }
    }
  }, [isOpen]);

  const handleDebtChange = (id: string) => {
    setSelectedDebtId(id);
    const d = activeDebts.find(item => item.id === id);
    if (d) {
      setPayAmount(String(d.installmentAmount));
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!selectedDebtId || isNaN(amt) || amt <= 0) {
      alert('Lütfen borç seçin ve geçerli bir tutar girin.');
      return;
    }
    onConfirmPay(selectedDebtId, amt);
    onClose();
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Borç Öde"
      subtitle="Mevcut borcunuzdan taksit düşün"
      icon={<CreditCard className="w-4 h-4 text-rose-500" />}
      isLight={isLight}
    >
      {activeDebts.length === 0 ? (
        <div className="text-center py-4 space-y-2">
          <p className={`text-xs font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
            Ödenecek aktif borcunuz bulunmuyor!
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            Genel Bakış veya Ayarlar menüsünden yeni bir borç tanımlayabilirsiniz.
          </p>
          <button
            onClick={onClose}
            className={`mt-2 px-4 py-1.5 rounded-md text-xs font-mono font-bold border ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white/[0.08] border-white/[0.1] text-slate-300'
            }`}
          >
            Kapat
          </button>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-3">
          <div>
            <label
              className={`block text-[10px] font-black font-mono uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              Hangi Borcu Ödüyorsunuz?
            </label>
            <div className="relative">
              <select
                value={selectedDebtId}
                onChange={e => handleDebtChange(e.target.value)}
                className={`w-full h-10 px-3 pr-8 rounded-md border-2 text-xs font-mono font-bold appearance-none focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-rose-400'
                    : 'bg-[#120f1e] border-[#372d4c] text-slate-100 focus:border-rose-400'
                }`}
              >
                {activeDebts.map(d => (
                  <option key={d.id} value={d.id} className={isLight ? 'bg-white text-slate-900' : 'bg-[#181427] text-white'}>
                    {d.name} — Kalan: {formatMoney(d.remainingAmount)} (Taksit: {formatMoney(d.installmentAmount)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              className={`block text-[10px] font-black font-mono uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              Ödenecek Tutar (₺)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className={`w-full h-11 pl-3 pr-10 rounded-md border-2 text-xl font-black font-mono text-rose-500 focus:outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 focus:border-rose-500'
                    : 'bg-[#120f1e] border-[#372d4c] focus:border-rose-500'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-base">
                ₺
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Ödeme yapıldığında bu ayın bütçesine eklenir ve kalan borçtan düşülür.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 h-10 rounded-md border-2 font-mono font-bold text-xs transition-colors ${
                isLight
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'border-[#3e3455] text-slate-300 hover:bg-white/[0.05]'
              }`}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-md bg-gradient-to-r from-rose-500 to-pink-500 text-white font-mono font-bold text-xs shadow-md shadow-rose-500/25 active:scale-[0.98] transition-all"
            >
              Borcu Öde
            </button>
          </div>
        </form>
      )}
    </BottomSheetModal>
  );
};

/* --- 4. RECURRING MANAGER MODAL --- */
interface RecurringManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurring: RecurringItem[];
  onAddRecurring: (type: 'income' | 'expense', name: string, amount: number) => void;
  onDeleteRecurring: (id: string) => void;
  isLight?: boolean;
}

export const RecurringManagerModal: React.FC<RecurringManagerModalProps> = ({
  isOpen,
  onClose,
  recurring,
  onAddRecurring,
  onDeleteRecurring,
  isLight = false
}) => {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) {
      alert('Lütfen tüm alanları geçerli şekilde doldurun.');
      return;
    }
    onAddRecurring(type, name.trim(), amt);
    setName('');
    setAmount('');
  };

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="Kalıcı İşlemler"
      subtitle="Her ay sabit olan gelir ve giderleriniz"
      icon={<Repeat className="w-4 h-4 text-cyan-400" />}
      isLight={isLight}
    >
      <div className="space-y-3">
        <p className={`text-xs font-mono leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Maaş, Kira, Aidat gibi kalemler her yeni ayda otomatik olarak hazır bekler.
        </p>

        {/* Existing Items */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {recurring.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono text-center py-3">Kayıtlı kalıcı işlem yok.</p>
          ) : (
            recurring.map(item => (
              <div
                key={item.id}
                className={`p-2.5 rounded-md border-2 flex items-center justify-between gap-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#120f1e] border-[#372d4c]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                      {item.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                        item.type === 'income'
                          ? isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/15 text-emerald-400'
                          : isLight ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {item.type === 'income' ? 'Gelir' : 'Gider'}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-black font-mono mt-0.5 ${
                      item.type === 'income'
                        ? isLight ? 'text-emerald-600' : 'text-emerald-400'
                        : isLight ? 'text-rose-600' : 'text-rose-400'
                    }`}
                  >
                    {formatMoney(item.amount)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`"${item.name}" kalıcı işlemini silmek istediğinize emin misiniz?`)) {
                      onDeleteRecurring(item.id);
                    }
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Form - Sharp */}
        <form
          onSubmit={handleAdd}
          className={`p-3 rounded-md border-2 space-y-2.5 ${
            isLight
              ? 'bg-[#f8f9fe] border-[#4361ee]/20'
              : 'bg-[#141220] border-[#372d4c]'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs font-black font-mono uppercase tracking-wider ${
              isLight ? 'text-[#4361ee]' : 'text-cyan-400'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Kalıcı İşlem Ekle</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`h-9 rounded-md text-xs font-mono font-bold transition-all border ${
                type === 'income'
                  ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'bg-white border-slate-300 text-slate-600'
                  : 'bg-[#120f1e] border-[#372d4c] text-slate-400'
              }`}
            >
              💰 Gelir (Maaş)
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`h-9 rounded-md text-xs font-mono font-bold transition-all border ${
                type === 'expense'
                  ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                  : isLight
                  ? 'bg-white border-slate-300 text-slate-600'
                  : 'bg-[#120f1e] border-[#372d4c] text-slate-400'
              }`}
            >
              💸 Gider (Kira)
            </button>
          </div>

          <input
            type="text"
            placeholder="İşlem Adı (Örn: Maaş, Ev Kirası)"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`w-full h-9 px-3 rounded-md border-2 text-xs font-bold focus:outline-none ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
            }`}
          />

          <input
            type="number"
            placeholder="Sabit Tutar (₺)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={`w-full h-9 px-3 rounded-md border-2 text-xs font-mono font-bold focus:outline-none ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#4361ee]'
                : 'bg-[#120f1e] border-[#372d4c] text-slate-100 placeholder:text-slate-500 focus:border-cyan-400'
            }`}
          />

          <button
            type="submit"
            className={`w-full h-9 rounded-md font-mono font-bold text-xs shadow-sm active:scale-[0.98] transition-all ${
              isLight
                ? 'bg-[#4361ee] text-white shadow-[#4361ee]/20'
                : 'bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            Kalıcı İşlemi Kaydet
          </button>
        </form>
      </div>
    </BottomSheetModal>
  );
};
