import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MonthData,
  Category,
  CategoryItem,
  IncomeItem,
  Transaction,
  formatMoney,
  generateId,
  getCycleString,
  TR_MONTHS
} from '../types';
import { MonthlyChart } from './MonthlyChart';
import {
  Save,
  RotateCcw,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  GripVertical,
  ArrowLeft,
  Check,
  Coins,
  PiggyBank,
  Sparkles
} from 'lucide-react';

interface MonthEditorTabProps {
  currentMonth: MonthData;
  onUpdateMonth: (updated: MonthData) => void;
  onSaveMonth: () => void;
  onResetMonth: () => void;
  onOpenPayDebt: () => void;
  onBackToOverview: () => void;
  onOpenTransactionModal: (
    type: 'income' | 'expense',
    catIndex: number,
    itemIndex: number | null,
    itemName: string
  ) => void;
  onRestoreDebt: (debtId: string, amount: number) => void;
  cycleStartDay: number;
  isLight: boolean;
  allPreviousCategories?: string[];
  allPreviousIncomes?: string[];
  allPreviousItems?: string[];
}

export const MonthEditorTab: React.FC<MonthEditorTabProps> = ({
  currentMonth,
  onUpdateMonth,
  onSaveMonth,
  onResetMonth,
  onOpenPayDebt,
  onBackToOverview,
  onOpenTransactionModal,
  onRestoreDebt,
  cycleStartDay,
  isLight,
  allPreviousCategories = [],
  allPreviousIncomes = [],
  allPreviousItems = []
}) => {
  const [expandedTxIds, setExpandedTxIds] = useState<Record<string, boolean>>({});
  const [activeInputFocus, setActiveInputFocus] = useState<string | null>(null);

  const toggleTx = (key: string) => {
    setExpandedTxIds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute calculated totals live
  const { totalIncome, totalExpense, remaining } = useMemo(() => {
    let inc = 0;
    currentMonth.incomes.forEach(i => {
      const sum = i.transactions ? i.transactions.reduce((acc, tx) => acc + tx.amount, 0) : 0;
      i.amount = sum;
      inc += sum;
    });

    let exp = 0;
    currentMonth.categories.forEach(c => {
      c.items.forEach(item => {
        const sum = item.transactions ? item.transactions.reduce((acc, tx) => acc + tx.amount, 0) : 0;
        item.amount = sum;
        exp += sum;
      });
    });

    return {
      totalIncome: inc,
      totalExpense: exp,
      remaining: inc - exp
    };
  }, [currentMonth]);

  // Quick Pay for recurring item
  const handleQuickPay = (type: 'income' | 'expense', catIdx: number, itemIdx?: number) => {
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}`;

    if (type === 'income') {
      const item = currentMonth.incomes[catIdx];
      if (!item.targetAmount) return;
      const newIncomes = [...currentMonth.incomes];
      newIncomes[catIdx] = {
        ...item,
        transactions: [
          ...(item.transactions || []),
          { id: generateId(), amount: item.targetAmount, desc: 'Kalıcı Gelir', date: dateStr }
        ]
      };
      onUpdateMonth({ ...currentMonth, incomes: newIncomes });
    } else if (itemIdx !== undefined) {
      const cat = currentMonth.categories[catIdx];
      const item = cat.items[itemIdx];
      if (!item.targetAmount) return;
      const newCategories = [...currentMonth.categories];
      const newItems = [...cat.items];
      newItems[itemIdx] = {
        ...item,
        transactions: [
          ...(item.transactions || []),
          { id: generateId(), amount: item.targetAmount, desc: 'Kalıcı Gider', date: dateStr }
        ]
      };
      newCategories[catIdx] = { ...cat, items: newItems };
      onUpdateMonth({ ...currentMonth, categories: newCategories });
    }
  };

  // Slider change handler (optimized for mobile 60fps)
  const handleSliderChange = (catIdx: number, itemIdx: number, val: number) => {
    const cat = currentMonth.categories[catIdx];
    const item = cat.items[itemIdx];
    const txs = item.transactions ? [...item.transactions] : [];

    const existingIdx = txs.findIndex(t => t.desc === 'Sürgü ile ayarlandı');
    if (existingIdx >= 0) {
      txs[existingIdx] = { ...txs[existingIdx], amount: val };
    } else {
      const today = new Date();
      txs.push({
        id: generateId(),
        amount: val,
        desc: 'Sürgü ile ayarlandı',
        date: `${today.getDate()}/${today.getMonth() + 1}`
      });
    }

    const newCategories = [...currentMonth.categories];
    const newItems = [...cat.items];
    newItems[itemIdx] = { ...item, transactions: txs };
    newCategories[catIdx] = { ...cat, items: newItems };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  // Toggle slider lock
  const handleToggleLock = (catIdx: number, itemIdx: number) => {
    const cat = currentMonth.categories[catIdx];
    const item = cat.items[itemIdx];
    const newCategories = [...currentMonth.categories];
    const newItems = [...cat.items];
    newItems[itemIdx] = { ...item, sliderLocked: item.sliderLocked === false ? true : false };
    newCategories[catIdx] = { ...cat, items: newItems };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  // Delete transaction (safe without blocking alert/confirm)
  const handleDeleteTx = (
    type: 'income' | 'expense',
    catIdx: number,
    itemIdx: number | null,
    txId: string
  ) => {
    if (type === 'income') {
      const item = currentMonth.incomes[catIdx];
      const newIncomes = [...currentMonth.incomes];
      newIncomes[catIdx] = {
        ...item,
        transactions: (item.transactions || []).filter(t => t.id !== txId)
      };
      onUpdateMonth({ ...currentMonth, incomes: newIncomes });
    } else if (itemIdx !== null) {
      const cat = currentMonth.categories[catIdx];
      const item = cat.items[itemIdx];
      const tx = item.transactions?.find(t => t.id === txId);
      if (tx && cat.isDebtCategory && item.linkedDebtId) {
        onRestoreDebt(item.linkedDebtId, tx.amount);
      }
      const newCategories = [...currentMonth.categories];
      const newItems = [...cat.items];
      newItems[itemIdx] = {
        ...item,
        transactions: (item.transactions || []).filter(t => t.id !== txId)
      };
      newCategories[catIdx] = { ...cat, items: newItems };
      onUpdateMonth({ ...currentMonth, categories: newCategories });
    }
  };

  // Income items handlers
  const handleAddIncome = () => {
    onUpdateMonth({
      ...currentMonth,
      incomes: [
        { id: generateId(), name: 'Yeni Gelir', amount: 0, transactions: [] },
        ...currentMonth.incomes
      ]
    });
  };

  const handleUpdateIncomeName = (index: number, val: string) => {
    const newIncomes = [...currentMonth.incomes];
    newIncomes[index] = { ...newIncomes[index], name: val };
    onUpdateMonth({ ...currentMonth, incomes: newIncomes });
  };

  // Safe delete income without blocking window.confirm
  const handleDeleteIncome = (index: number) => {
    onUpdateMonth({
      ...currentMonth,
      incomes: currentMonth.incomes.filter((_, i) => i !== index)
    });
  };

  // Category handlers - Add new category AT THE TOP
  const handleAddCategory = () => {
    const newCategory: Category = {
      id: generateId(),
      name: 'Yeni Kategori',
      items: [
        {
          id: generateId(),
          name: 'Yeni Kalem',
          amount: 0,
          transactions: [],
          sliderLocked: true
        }
      ]
    };

    let insertIndex = 0;
    const recurringIndex = currentMonth.categories.findIndex(c => c.isRecurringCategory);
    if (recurringIndex >= 0) {
      insertIndex = recurringIndex + 1;
    }

    const newCategories = [...currentMonth.categories];
    newCategories.splice(insertIndex, 0, newCategory);
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  const handleUpdateCategoryName = (index: number, val: string) => {
    const newCategories = [...currentMonth.categories];
    newCategories[index] = { ...newCategories[index], name: val };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  // Safe delete category without blocking window.confirm
  const handleDeleteCategory = (index: number) => {
    onUpdateMonth({
      ...currentMonth,
      categories: currentMonth.categories.filter((_, i) => i !== index)
    });
  };

  // Move Category Up & Down for manual reordering and save
  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentMonth.categories.length) return;

    const newCategories = [...currentMonth.categories];
    const itemToMove = newCategories.splice(index, 1)[0];
    newCategories.splice(targetIndex, 0, itemToMove);
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  const handleAddItem = (catIndex: number) => {
    const cat = currentMonth.categories[catIndex];
    const newCategories = [...currentMonth.categories];
    newCategories[catIndex] = {
      ...cat,
      items: [
        ...cat.items,
        { id: generateId(), name: 'Yeni Kalem', amount: 0, transactions: [], sliderLocked: true }
      ]
    };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  const handleUpdateItemName = (catIndex: number, itemIndex: number, val: string) => {
    const cat = currentMonth.categories[catIndex];
    const newCategories = [...currentMonth.categories];
    const newItems = [...cat.items];
    newItems[itemIndex] = { ...newItems[itemIndex], name: val };
    newCategories[catIndex] = { ...cat, items: newItems };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  // Safe delete item without blocking window.confirm
  const handleDeleteItem = (catIndex: number, itemIndex: number) => {
    const cat = currentMonth.categories[catIndex];
    const newCategories = [...currentMonth.categories];
    newCategories[catIndex] = {
      ...cat,
      items: cat.items.filter((_, i) => i !== itemIndex)
    };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  const cycleStr = getCycleString(currentMonth.monthIdx, cycleStartDay);
  const isSurplus = remaining >= 0;

  return (
    <div className="space-y-4 pb-24">
      {/* HTML Datalists for Autocomplete (USER REQUEST 3: suggestions prevent typos) */}
      <datalist id="category-suggestions-list">
        {allPreviousCategories.map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>

      <datalist id="income-suggestions-list">
        {allPreviousIncomes.map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>

      <datalist id="item-suggestions-list">
        {allPreviousItems.map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>

      {/* Top Bar with Navigation & Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBackToOverview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-white/[0.05] border-white/[0.08] text-slate-300 hover:bg-white/[0.1]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Genel Bakış</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Reset Month */}
          <button
            onClick={onResetMonth}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
            }`}
            title="Bu Ayı Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Month */}
          <button
            onClick={onSaveMonth}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      {/* Month Title & Date Range */}
      <div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <span>{currentMonth.name}</span>
            <Coins className="w-5 h-5 text-cyan-400" />
          </h1>
          {cycleStartDay !== 1 && (
            <span className="text-xs font-semibold text-cyan-400 font-mono">
              ({cycleStr})
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Bütçe, gelir ve harcama detaylarınızı düzenleyin
        </p>
      </div>

      {/* Compact Status Card with Pay Debt & Net Remaining */}
      <div
        className={`p-4 rounded-3xl border backdrop-blur-xl relative overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/80 border-white/[0.08] shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Quick Pay Debt Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onOpenPayDebt}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:from-rose-400 hover:to-pink-400 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Borç Öde</span>
          </motion.button>

          {/* Right Summary Figures */}
          <div className="text-right">
            <div
              className={`text-2xl font-black font-mono tracking-tight tabular-nums ${
                isSurplus ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isSurplus ? '+' : ''}
              {formatMoney(remaining)}
            </div>
            <div className="flex items-center justify-end gap-2 text-[11px] font-mono mt-0.5">
              <span className="text-emerald-400 font-semibold">
                G: {formatMoney(totalIncome)}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-rose-400 font-semibold">
                Ç: {formatMoney(totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Chart */}
      <MonthlyChart month={currentMonth} isLight={isLight} />

      {/* INCOMES SECTION */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Gelirler ({formatMoney(totalIncome)})
          </span>
          <button
            onClick={handleAddIncome}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Gelir Ekle</span>
          </button>
        </div>

        <div className="space-y-2">
          {currentMonth.incomes.map((inc, index) => {
            const isPermanent = !!inc.linkedRecurringId;
            const txCount = inc.transactions?.length || 0;
            const isExpanded = !!expandedTxIds[`inc-${index}`];

            return (
              <div
                key={inc.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isPermanent
                    ? isLight
                      ? 'bg-emerald-50/50 border-emerald-300/80 shadow-sm'
                      : 'bg-emerald-950/20 border-emerald-500/30'
                    : isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-white/[0.03] border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {isPermanent ? (
                      <span className="text-xs font-bold text-emerald-400 truncate block">
                        {inc.name}
                      </span>
                    ) : (
                      <input
                        type="text"
                        list="income-suggestions-list"
                        value={inc.name}
                        onChange={e => handleUpdateIncomeName(index, e.target.value)}
                        className="bg-transparent text-xs font-semibold text-slate-200 w-full focus:outline-none focus:border-b focus:border-cyan-400"
                        placeholder="Gelir Adı"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPermanent && inc.targetAmount && (
                      <button
                        onClick={() => handleQuickPay('income', index)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] shadow-sm hover:bg-emerald-400 active:scale-95 transition-all"
                      >
                        💰 {formatMoney(inc.targetAmount)} Al
                      </button>
                    )}

                    {txCount > 0 && (
                      <button
                        onClick={() => toggleTx(`inc-${index}`)}
                        className="px-2 py-0.5 rounded-lg bg-white/[0.08] text-[10px] font-mono font-bold text-slate-300 hover:bg-white/[0.12] transition-colors flex items-center gap-1"
                      >
                        <span>{txCount} işlem</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}

                    <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                      {formatMoney(inc.amount)}
                    </span>

                    {!isPermanent && (
                      <>
                        <button
                          onClick={() => onOpenTransactionModal('income', index, null, inc.name)}
                          className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                          title="Tutar Ekle"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(index)}
                          className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Collapsible Transactions History */}
                <AnimatePresence>
                  {isExpanded && inc.transactions && inc.transactions.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2.5 pt-2 border-t border-white/[0.06] space-y-1.5 overflow-hidden"
                    >
                      {inc.transactions.map(tx => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-white/[0.02]"
                        >
                          <span className="text-slate-400">
                            {tx.date} — {tx.desc}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400 font-mono">
                              +{formatMoney(tx.amount)}
                            </span>
                            <button
                              onClick={() => handleDeleteTx('income', index, null, tx.id)}
                              className="text-slate-500 hover:text-rose-400 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPENSE CATEGORIES SECTION (USER REQUEST 1: Add at top, USER REQUEST 2: Reorderable) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Gider Kategorileri ({formatMoney(totalExpense)})
          </span>
          <button
            onClick={handleAddCategory}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>En Üste Kategori Ekle</span>
          </button>
        </div>

        {currentMonth.categories.map((cat, catIdx) => {
          const isDebtCat = !!cat.isDebtCategory;
          const isRecurringCat = !!cat.isRecurringCategory;
          const catSum = cat.items.reduce((sum, item) => sum + (item.amount || 0), 0);

          return (
            <div
              key={cat.id}
              className={`p-4 rounded-3xl border transition-all ${
                isDebtCat
                  ? isLight
                    ? 'bg-rose-50/50 border-rose-300/80 shadow-sm'
                    : 'bg-rose-950/20 border-rose-500/30'
                  : isRecurringCat
                  ? isLight
                    ? 'bg-blue-50/50 border-blue-300/80 shadow-sm'
                    : 'bg-blue-950/20 border-blue-500/30'
                  : isLight
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-slate-900/60 border-white/[0.08]'
              }`}
            >
              {/* Category Header with Reorder Controls */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06] gap-2">
                {/* Reorder Buttons (Move Up / Down) */}
                {!isDebtCat && !isRecurringCat && (
                  <div className="flex items-center gap-0.5 shrink-0 bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
                    <button
                      onClick={() => handleMoveCategory(catIdx, 'up')}
                      disabled={catIdx === 0}
                      className="p-1 rounded text-slate-400 hover:text-cyan-400 disabled:opacity-20 disabled:hover:text-slate-400"
                      title="Yukarı Taşı"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveCategory(catIdx, 'down')}
                      disabled={catIdx === currentMonth.categories.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-cyan-400 disabled:opacity-20 disabled:hover:text-slate-400"
                      title="Aşağı Taşı"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {isDebtCat || isRecurringCat ? (
                    <span
                      className={`text-xs font-bold tracking-tight ${
                        isDebtCat ? 'text-rose-400' : 'text-cyan-400'
                      }`}
                    >
                      {cat.name}
                    </span>
                  ) : (
                    <input
                      type="text"
                      list="category-suggestions-list"
                      value={cat.name}
                      onChange={e => handleUpdateCategoryName(catIdx, e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-100 uppercase tracking-wider w-full focus:outline-none focus:border-b focus:border-cyan-400"
                      placeholder="Kategori Adı"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-rose-400 tabular-nums">
                    {formatMoney(catSum)}
                  </span>
                  {!isDebtCat && !isRecurringCat && (
                    <button
                      onClick={() => handleDeleteCategory(catIdx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Kategoriyi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items within Category */}
              <div className="space-y-2">
                {cat.items.map((item, itemIdx) => {
                  const isPermanent = !!item.linkedRecurringId;
                  const isDebtItem = !!item.linkedDebtId;
                  const isLocked = item.sliderLocked !== false;
                  const txCount = item.transactions?.length || 0;
                  const isExpanded = !!expandedTxIds[`cat-${catIdx}-${itemIdx}`];

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {isPermanent || isDebtItem ? (
                            <span className="text-xs font-semibold text-slate-200 truncate block">
                              {item.name}
                            </span>
                          ) : (
                            <input
                              type="text"
                              list="item-suggestions-list"
                              value={item.name}
                              onChange={e => handleUpdateItemName(catIdx, itemIdx, e.target.value)}
                              className="bg-transparent text-xs text-slate-200 font-medium w-full focus:outline-none focus:border-b focus:border-cyan-400"
                              placeholder="Kalem Adı"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Quick Pay Recurring Button */}
                          {isPermanent && item.targetAmount && (
                            <button
                              onClick={() => handleQuickPay('expense', catIdx, itemIdx)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-bold text-[11px] shadow-sm hover:bg-rose-400 active:scale-95 transition-all"
                            >
                              💸 {formatMoney(item.targetAmount)} Öde
                            </button>
                          )}

                          {/* Tx Count Badge */}
                          {txCount > 0 && (
                            <button
                              onClick={() => toggleTx(`cat-${catIdx}-${itemIdx}`)}
                              className="px-2 py-0.5 rounded-lg bg-white/[0.08] text-[10px] font-mono font-bold text-slate-300 hover:bg-white/[0.12] transition-colors flex items-center gap-1"
                            >
                              <span>{txCount} işlem</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}

                          {/* Item Amount */}
                          <span className="text-xs font-bold font-mono text-slate-100 tabular-nums">
                            {formatMoney(item.amount)}
                          </span>

                          {/* Action Tools for Regular Items */}
                          {!isDebtCat && !isPermanent && (
                            <>
                              <button
                                onClick={() =>
                                  onOpenTransactionModal('expense', catIdx, itemIdx, item.name)
                                }
                                className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 flex items-center justify-center transition-colors"
                                title="İşlem Ekle"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleLock(catIdx, itemIdx)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                  isLocked
                                    ? 'bg-white/[0.05] text-slate-400'
                                    : 'bg-amber-500/10 text-amber-400'
                                }`}
                                title={isLocked ? 'Sürgü Kilidini Aç' : 'Sürgüyü Kilitle'}
                              >
                                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => handleDeleteItem(catIdx, itemIdx)}
                                className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Interactive Slider when unlocked */}
                      {!isLocked && !isDebtCat && !isPermanent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-1.5 pb-1"
                        >
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                            <span>0 ₺</span>
                            <span>Hızlı Sürgü Ayarı</span>
                            <span>50.000 ₺</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="50000"
                            step="100"
                            value={item.amount || 0}
                            onChange={e => handleSliderChange(catIdx, itemIdx, parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </motion.div>
                      )}

                      {/* Collapsible Transactions History */}
                      <AnimatePresence>
                        {isExpanded && item.transactions && item.transactions.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2 pt-2 border-t border-white/[0.06] space-y-1.5 overflow-hidden"
                          >
                            {item.transactions.map(tx => (
                              <div
                                key={tx.id}
                                className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-white/[0.02]"
                              >
                                <span className="text-slate-400">
                                  {tx.date} — {tx.desc}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-rose-400 font-mono">
                                    {formatMoney(tx.amount)}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteTx('expense', catIdx, itemIdx, tx.id)}
                                    className="text-slate-500 hover:text-rose-400 p-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Add Item to Category Button */}
              {!isDebtCat && !isRecurringCat && (
                <button
                  onClick={() => handleAddItem(catIdx)}
                  className="w-full py-2 mt-2 rounded-xl border border-dashed border-white/[0.08] text-xs font-semibold text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Kalem Ekle</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
