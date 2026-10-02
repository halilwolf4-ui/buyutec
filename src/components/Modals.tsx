import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Debt, RecurringItem, formatMoney, generateId } from '../types';
import {
  X,
  CreditCard,
  Repeat,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  User,
  Lock,
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`relative w-full max-w-md max-h-[90vh] flex flex-col rounded-t-[28px] sm:rounded-3xl border shadow-2xl overflow-hidden z-10 ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-900'
                : 'bg-[#10141e] border-white/[0.08] text-slate-100'
            }`}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-500/30 mx-auto mt-3 mb-1 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                {icon && <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">{icon}</div>}
                <div>
                  <h3 className="text-base font-bold tracking-tight">{title}</h3>
                  {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4">{children}</div>
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
  isLight
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
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
              className="w-full h-14 pl-4 pr-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-2xl font-bold font-mono focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-slate-600"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
              ₺
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Açıklama (İsteğe bağlı)
          </label>
          <input
            type="text"
            placeholder="Örn: Hafta Sonu Alışverişi, Fatura vb."
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-white/[0.1] text-slate-300 font-semibold text-sm hover:bg-white/[0.05] transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400 active:scale-[0.98] transition-all"
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
  isLight
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
      icon={<CreditCard className="w-4 h-4" />}
      isLight={isLight}
    >
      <div className="space-y-4">
        {/* Existing Debts List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {debts.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/[0.08] rounded-2xl p-4">
              <p className="text-xs text-slate-400">Kayıtlı borcunuz bulunmuyor.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Aşağıdaki formu kullanarak yeni taksitli veya tek seferlik borç ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            debts.map(d => (
              <div
                key={d.id}
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold truncate text-slate-200">{d.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>Aylık: {formatMoney(d.installmentAmount)}</span>
                    <span>·</span>
                    <span>{d.installments} Taksit</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-rose-400">
                      {formatMoney(d.remainingAmount)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      / {formatMoney(d.totalAmount)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`"${d.name}" borcunu silmek istediğinize emin misiniz?`)) {
                        onDeleteDebt(d.id);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Borcu Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Debt Form */}
        <form
          onSubmit={handleAdd}
          className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Borç Ekle</span>
          </div>

          <input
            type="text"
            placeholder="Borç Adı (Örn: Kredi Kartı, Telefon Kredisi)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs focus:border-cyan-400 focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Toplam Borç (₺)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-mono focus:border-cyan-400 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Taksit Sayısı (Ay)"
              value={installments}
              onChange={e => setInstallments(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-[0.98] transition-all"
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
  isLight
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
      icon={<CreditCard className="w-4 h-4 text-rose-400" />}
      isLight={isLight}
    >
      {activeDebts.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <p className="text-sm font-semibold text-slate-300">
            Ödenecek aktif borcunuz bulunmuyor!
          </p>
          <p className="text-xs text-slate-500">
            Genel Bakış veya Ayarlar menüsünden yeni bir borç tanımlayabilirsiniz.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2.5 rounded-xl bg-white/[0.08] text-xs font-semibold"
          >
            Kapat
          </button>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Hangi Borcu Ödüyorsunuz?
            </label>
            <div className="relative">
              <select
                value={selectedDebtId}
                onChange={e => handleDebtChange(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-semibold appearance-none focus:border-rose-400 focus:outline-none"
              >
                {activeDebts.map(d => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.name} — Kalan: {formatMoney(d.remainingAmount)} (Taksit: {formatMoney(d.installmentAmount)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Ödenecek Tutar (₺)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="w-full h-14 pl-4 pr-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-2xl font-bold font-mono text-rose-400 focus:border-rose-400 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ₺
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ödeme yapıldığında bu ayın bütçesine gider olarak eklenir ve kalan borçtan düşülür.
            </p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-white/[0.1] text-slate-300 font-semibold text-sm hover:bg-white/[0.05]"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 active:scale-[0.98] transition-all"
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
  isLight
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
      <div className="space-y-4">
        <p className="text-xs text-slate-400 leading-relaxed">
          Buraya ekleyeceğiniz Maaş, Kira, Aidat gibi kalemler her yeni ayda otomatik olarak hazır bekler. Tek tuşla ödeme alabilir veya ödeyebilirsiniz.
        </p>

        {/* Existing Items */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {recurring.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Kayıtlı kalıcı işlem yok.</p>
          ) : (
            recurring.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{item.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {item.type === 'income' ? 'Gelir' : 'Gider'}
                    </span>
                  </div>
                  <div className="text-xs font-bold font-mono mt-1 text-slate-300">
                    {formatMoney(item.amount)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`"${item.name}" kalıcı işlemini silmek istediğinize emin misiniz?`)) {
                      onDeleteRecurring(item.id);
                    }
                  }}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Form */}
        <form
          onSubmit={handleAdd}
          className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Kalıcı İşlem Ekle</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`h-10 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-white/[0.05] text-slate-400'
              }`}
            >
              💰 Gelir (Maaş vb.)
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`h-10 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white/[0.05] text-slate-400'
              }`}
            >
              💸 Gider (Kira vb.)
            </button>
          </div>

          <input
            type="text"
            placeholder="İşlem Adı (Örn: Maaş, Ev Kirası)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs focus:border-cyan-400 focus:outline-none"
          />

          <input
            type="number"
            placeholder="Sabit Tutar (₺)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-mono focus:border-cyan-400 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 hover:bg-cyan-400 active:scale-[0.98] transition-all"
          >
            Kalıcı İşlemi Kaydet
          </button>
        </form>
      </div>
    </BottomSheetModal>
  );
};
