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
  ArrowLeft,
  Coins
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

  const isSurplus = remaining >= 0;

  // Month cycle title format
  const monthIdx = parseInt(currentMonth.id.split('-')[1], 10);
  const cycleStr = getCycleString(monthIdx, cycleStartDay);

  // Quick Pay Recurring handlers
  const handleQuickPay = (type: 'income' | 'expense', catIdx: number, itemIdx?: number) => {
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;

    if (type === 'income') {
      const inc = currentMonth.incomes[catIdx];
      const target = inc.targetAmount || 0;
      const newTx: Transaction = {
        id: generateId(),
        amount: target,
        date: dateStr,
        desc: 'Hızlı Maaş/Gelir Girişi'
      };
      const newIncomes = [...currentMonth.incomes];
      newIncomes[catIdx] = {
        ...inc,
        transactions: [...(inc.transactions || []), newTx]
      };
      onUpdateMonth({ ...currentMonth, incomes: newIncomes });
    } else if (itemIdx !== undefined) {
      const cat = currentMonth.categories[catIdx];
      const item = cat.items[itemIdx];
      const target = item.targetAmount || 0;
      const newTx: Transaction = {
        id: generateId(),
        amount: target,
        date: dateStr,
        desc: 'Hızlı Sabit Fatura/Abonelik Ödemesi'
      };
      const newItems = [...cat.items];
      newItems[itemIdx] = {
        ...item,
        transactions: [...(item.transactions || []), newTx]
      };
      const newCategories = [...currentMonth.categories];
      newCategories[catIdx] = { ...cat, items: newItems };
      onUpdateMonth({ ...currentMonth, categories: newCategories });
    }
  };

  // Slider change handler
  const handleSliderChange = (catIdx: number, itemIdx: number, val: number) => {
    const cat = currentMonth.categories[catIdx];
    const item = cat.items[itemIdx];
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`;

    const newTx: Transaction = {
      id: generateId(),
      amount: val,
      date: dateStr,
      desc: 'Sürgü Ayarı'
    };

    const newItems = [...cat.items];
    newItems[itemIdx] = {
      ...item,
      amount: val,
      transactions: [newTx]
    };

    const newCategories = [...currentMonth.categories];
    newCategories[catIdx] = { ...cat, items: newItems };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  // Toggle lock state
  const handleToggleLock = (catIdx: number, itemIdx: number) => {
    const cat = currentMonth.categories[catIdx];
    const item = cat.items[itemIdx];
    const newItems = [...cat.items];
    newItems[itemIdx] = {
      ...item,
      sliderLocked: item.sliderLocked === false ? true : false
    };
    const newCategories = [...currentMonth.categories];
    newCategories[catIdx] = { ...cat, items: newItems };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  // Delete transaction with debt balance restore
  const handleDeleteTx = (
    type: 'income' | 'expense',
    catIdx: number,
    itemIdx: number | null,
    txId: string
  ) => {
    if (type === 'income') {
      const inc = currentMonth.incomes[catIdx];
      const newIncomes = [...currentMonth.incomes];
      newIncomes[catIdx] = {
        ...inc,
        transactions: (inc.transactions || []).filter(t => t.id !== txId)
      };
      onUpdateMonth({ ...currentMonth, incomes: newIncomes });
    } else if (itemIdx !== null) {
      const cat = currentMonth.categories[catIdx];
      const item = cat.items[itemIdx];
      const tx = item.transactions?.find(t => t.id === txId);

      if (item.linkedDebtId && tx) {
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

  const handleDeleteCategory = (index: number) => {
    onUpdateMonth({
      ...currentMonth,
      categories: currentMonth.categories.filter((_, i) => i !== index)
    });
  };

  // Move Category Up & Down
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
        {
          id: generateId(),
          name: 'Yeni Kalem',
          amount: 0,
          transactions: [],
          sliderLocked: true
        }
      ]
    };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  const handleUpdateItemName = (catIndex: number, itemIndex: number, val: string) => {
    const cat = currentMonth.categories[catIndex];
    const newItems = [...cat.items];
    newItems[itemIndex] = { ...newItems[itemIndex], name: val };
    const newCategories = [...currentMonth.categories];
    newCategories[catIndex] = { ...cat, items: newItems };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  const handleDeleteItem = (catIndex: number, itemIndex: number) => {
    const cat = currentMonth.categories[catIndex];
    const newItems = cat.items.filter((_, i) => i !== itemIndex);
    const newCategories = [...currentMonth.categories];
    newCategories[catIndex] = { ...cat, items: newItems };
    onUpdateMonth({ ...currentMonth, categories: newCategories });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Autocomplete Lists */}
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

      {/* Top Bar with Navigation & Actions - Sharp Corners */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBackToOverview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono font-bold transition-colors ${
            isLight
              ? 'bg-white border-[#4361ee]/30 text-[#4361ee] hover:bg-[#4361ee]/10'
              : 'bg-[#181427] border-[#3e3455] text-slate-300 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Genel Bakış</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Reset Month */}
          <button
            onClick={onResetMonth}
            className={`p-2 rounded-md border transition-colors ${
              isLight
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
            }`}
            title="Bu Ayı Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Month - Futuristic / Dark */}
          <button
            onClick={onSaveMonth}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold text-xs shadow-md active:scale-95 transition-all ${
              isLight
                ? 'bg-gradient-to-r from-[#f72585] via-[#7209b7] to-[#4361ee] text-white shadow-[#4361ee]/25'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      {/* Month Title & Date Range - FIXED: Visible Dark Text in Light Mode */}
      <div>
        <div className="flex items-baseline gap-2">
          <h1
            className={`text-2xl font-black tracking-tight flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-slate-100'
            }`}
          >
            <span>{currentMonth.name}</span>
            <Coins className={`w-5 h-5 ${isLight ? 'text-[#4361ee]' : 'text-cyan-400'}`} />
          </h1>
          {cycleStartDay !== 1 && (
            <span
              className={`text-xs font-bold font-mono ${
                isLight ? 'text-[#f72585]' : 'text-cyan-400'
              }`}
            >
              ({cycleStr})
            </span>
          )}
        </div>
        <p className={`text-xs font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Bütçe, gelir ve harcama detaylarınızı düzenleyin
        </p>
      </div>

      {/* Status Card with Pay Debt & Net Remaining - Sharp & Stylized */}
      <div
        className={`p-3.5 rounded-lg border-2 relative overflow-hidden transition-all ${
          isLight
            ? 'bg-gradient-to-r from-white via-[#fbfcfe] to-[#f4f7fd] border-[#4361ee]/30 shadow-sm'
            : 'bg-gradient-to-br from-[#1a1428] via-[#141222] to-[#0e101a] border-[#3e3455] shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Quick Pay Debt Button - Sharp */}
          <button
            onClick={onOpenPayDebt}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-xs shadow-md active:scale-95 transition-all ${
              isLight
                ? 'bg-gradient-to-r from-[#f72585] to-[#7209b7] text-white shadow-[#f72585]/20'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/25'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Borç Öde</span>
          </button>

          {/* Right Summary Figures */}
          <div className="text-right">
            <div
              className={`text-2xl font-black font-mono tracking-tight tabular-nums ${
                isSurplus
                  ? isLight ? 'text-[#4361ee]' : 'text-emerald-400'
                  : isLight ? 'text-[#f72585]' : 'text-rose-400'
              }`}
            >
              {isSurplus ? '+' : ''}
              {formatMoney(remaining)}
            </div>
            <div className="flex items-center justify-end gap-2 text-[11px] font-mono mt-0.5">
              <span className={`font-bold ${isLight ? 'text-[#4361ee]' : 'text-emerald-400'}`}>
                G: {formatMoney(totalIncome)}
              </span>
              <span className="text-slate-400">|</span>
              <span className={`font-bold ${isLight ? 'text-[#f72585]' : 'text-rose-400'}`}>
                Ç: {formatMoney(totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Chart */}
      <MonthlyChart month={currentMonth} isLight={isLight} />

      {/* INCOMES SECTION - Sharp & Stylized */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span
            className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 ${
              isLight ? 'text-[#4361ee]' : 'text-emerald-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-sm ${
                isLight ? 'bg-[#4361ee]' : 'bg-emerald-400'
              }`}
            />
            Gelirler ({formatMoney(totalIncome)})
          </span>
          <button
            onClick={handleAddIncome}
            className={`text-xs font-mono font-bold transition-colors flex items-center gap-1 px-2 py-1 rounded-md border ${
              isLight
                ? 'bg-[#4361ee]/10 border-[#4361ee]/30 text-[#4361ee] hover:bg-[#4361ee]/20'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
            }`}
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
                className={`p-3 rounded-lg border-2 transition-all ${
                  isPermanent
                    ? isLight
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                      : 'bg-emerald-950/20 border-emerald-500/30'
                    : isLight
                    ? 'bg-white border-[#4361ee]/25 shadow-sm'
                    : 'bg-[#181427] border-[#372d4c]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {isPermanent ? (
                      <span
                        className={`text-xs font-bold truncate block ${
                          isLight ? 'text-emerald-700' : 'text-emerald-400'
                        }`}
                      >
                        {inc.name}
                      </span>
                    ) : (
                      <input
                        type="text"
                        list="income-suggestions-list"
                        value={inc.name}
                        onChange={e => handleUpdateIncomeName(index, e.target.value)}
                        className={`bg-transparent text-xs font-bold w-full focus:outline-none focus:border-b focus:border-[#4361ee] ${
                          isLight
                            ? 'text-slate-900 placeholder:text-slate-400'
                            : 'text-slate-100 placeholder:text-slate-500'
                        }`}
                        placeholder="Gelir Adı"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isPermanent && inc.targetAmount && (
                      <button
                        onClick={() => handleQuickPay('income', index)}
                        className="px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-bold text-[11px] shadow-sm hover:bg-emerald-400 active:scale-95 transition-all"
                      >
                        💰 {formatMoney(inc.targetAmount)} Al
                      </button>
                    )}

                    {txCount > 0 && (
                      <button
                        onClick={() => toggleTx(`inc-${index}`)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
                          isLight
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-white/[0.08] text-slate-300'
                        }`}
                      >
                        <span>{txCount} işlem</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}

                    <span
                      className={`text-xs font-black font-mono tabular-nums ${
                        isLight ? 'text-[#4361ee]' : 'text-emerald-400'
                      }`}
                    >
                      {formatMoney(inc.amount)}
                    </span>

                    {!isPermanent && (
                      <>
                        <button
                          onClick={() => onOpenTransactionModal('income', index, null, inc.name)}
                          className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                            isLight
                              ? 'bg-[#4361ee]/10 text-[#4361ee] hover:bg-[#4361ee]/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title="Tutar Ekle"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(index)}
                          className="w-7 h-7 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
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
                      className={`mt-2.5 pt-2 border-t space-y-1.5 overflow-hidden ${
                        isLight ? 'border-slate-200' : 'border-white/[0.06]'
                      }`}
                    >
                      {inc.transactions.map(tx => (
                        <div
                          key={tx.id}
                          className={`flex items-center justify-between text-[11px] py-1 px-2 rounded-md ${
                            isLight ? 'bg-slate-50' : 'bg-white/[0.03]'
                          }`}
                        >
                          <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                            {tx.date} — {tx.desc}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black font-mono ${
                                isLight ? 'text-[#4361ee]' : 'text-emerald-400'
                              }`}
                            >
                              +{formatMoney(tx.amount)}
                            </span>
                            <button
                              onClick={() => handleDeleteTx('income', index, null, tx.id)}
                              className="text-slate-400 hover:text-rose-500 p-0.5"
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

      {/* EXPENSE CATEGORIES SECTION - Sharp & Stylized */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <span
            className={`text-xs font-black uppercase tracking-wider font-mono flex items-center gap-1.5 ${
              isLight ? 'text-[#f72585]' : 'text-rose-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-sm ${
                isLight ? 'bg-[#f72585]' : 'bg-rose-400'
              }`}
            />
            Gider Kategorileri ({formatMoney(totalExpense)})
          </span>
          <button
            onClick={handleAddCategory}
            className={`text-xs font-mono font-bold transition-colors flex items-center gap-1.5 px-3 py-1 rounded-md border ${
              isLight
                ? 'bg-[#f72585]/10 border-[#f72585]/30 text-[#f72585] hover:bg-[#f72585]/20'
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kategori Ekle</span>
          </button>
        </div>

        {currentMonth.categories.map((cat, catIdx) => {
          const isDebtCat = !!cat.isDebtCategory;
          const isRecurringCat = !!cat.isRecurringCategory;
          const catSum = cat.items.reduce((sum, item) => sum + (item.amount || 0), 0);

          return (
            <div
              key={cat.id}
              className={`p-3.5 rounded-lg border-2 transition-all ${
                isDebtCat
                  ? isLight
                    ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                    : 'bg-[#24121d] border-rose-500/30'
                  : isRecurringCat
                  ? isLight
                    ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                    : 'bg-[#141829] border-blue-500/30'
                  : isLight
                  ? 'bg-white border-[#4361ee]/25 shadow-sm'
                  : 'bg-[#181427] border-[#372d4c]'
              }`}
            >
              {/* Category Header with Reorder Controls */}
              <div
                className={`flex items-center justify-between mb-2.5 pb-2 border-b gap-2 ${
                  isLight ? 'border-slate-200' : 'border-white/[0.06]'
                }`}
              >
                {/* Reorder Buttons */}
                {!isDebtCat && !isRecurringCat && (
                  <div
                    className={`flex items-center gap-0.5 shrink-0 rounded-md p-0.5 border ${
                      isLight
                        ? 'bg-slate-100 border-slate-200'
                        : 'bg-white/[0.04] border-white/[0.06]'
                    }`}
                  >
                    <button
                      onClick={() => handleMoveCategory(catIdx, 'up')}
                      disabled={catIdx === 0}
                      className="p-1 rounded text-slate-400 hover:text-[#4361ee] disabled:opacity-20"
                      title="Yukarı Taşı"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveCategory(catIdx, 'down')}
                      disabled={catIdx === currentMonth.categories.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-[#4361ee] disabled:opacity-20"
                      title="Aşağı Taşı"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {isDebtCat || isRecurringCat ? (
                    <span
                      className={`text-xs font-black tracking-tight ${
                        isDebtCat
                          ? isLight ? 'text-rose-600' : 'text-rose-400'
                          : isLight ? 'text-blue-600' : 'text-cyan-400'
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
                      className={`bg-transparent text-xs font-black uppercase tracking-wider w-full focus:outline-none focus:border-b focus:border-[#4361ee] ${
                        isLight
                          ? 'text-slate-900 placeholder:text-slate-400'
                          : 'text-slate-100 placeholder:text-slate-500'
                      }`}
                      placeholder="Kategori Adı"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black font-mono tabular-nums ${
                      isLight ? 'text-[#f72585]' : 'text-rose-400'
                    }`}
                  >
                    {formatMoney(catSum)}
                  </span>
                  {!isDebtCat && !isRecurringCat && (
                    <button
                      onClick={() => handleDeleteCategory(catIdx)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Kategoriyi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items within Category - Sharp & Stylized */}
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
                      className={`p-2.5 rounded-md border space-y-2 ${
                        isLight
                          ? 'bg-[#f8f9fe] border-slate-200'
                          : 'bg-[#120f1e] border-[#29223a]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {isPermanent || isDebtItem ? (
                            <span
                              className={`text-xs font-bold truncate block ${
                                isLight ? 'text-slate-800' : 'text-slate-200'
                              }`}
                            >
                              {item.name}
                            </span>
                          ) : (
                            <input
                              type="text"
                              list="item-suggestions-list"
                              value={item.name}
                              onChange={e => handleUpdateItemName(catIdx, itemIdx, e.target.value)}
                              className={`bg-transparent text-xs font-bold w-full focus:outline-none focus:border-b focus:border-[#4361ee] ${
                                isLight
                                  ? 'text-slate-900 placeholder:text-slate-400'
                                  : 'text-slate-100 placeholder:text-slate-500'
                              }`}
                              placeholder="Kalem Adı"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Quick Pay Recurring Button */}
                          {isPermanent && item.targetAmount && (
                            <button
                              onClick={() => handleQuickPay('expense', catIdx, itemIdx)}
                              className="px-2.5 py-1 rounded-md bg-rose-500 text-white font-bold text-[11px] shadow-sm hover:bg-rose-400 active:scale-95 transition-all"
                            >
                              💸 {formatMoney(item.targetAmount)} Öde
                            </button>
                          )}

                          {/* Tx Count Badge */}
                          {txCount > 0 && (
                            <button
                              onClick={() => toggleTx(`cat-${catIdx}-${itemIdx}`)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
                                isLight
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-white/[0.08] text-slate-300'
                              }`}
                            >
                              <span>{txCount} işlem</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}

                          {/* Item Amount */}
                          <span
                            className={`text-xs font-black font-mono tabular-nums ${
                              isLight ? 'text-slate-900' : 'text-slate-100'
                            }`}
                          >
                            {formatMoney(item.amount)}
                          </span>

                          {/* Action Tools for Regular Items */}
                          {!isDebtCat && !isPermanent && (
                            <>
                              <button
                                onClick={() =>
                                  onOpenTransactionModal('expense', catIdx, itemIdx, item.name)
                                }
                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                                  isLight
                                    ? 'bg-[#4361ee]/10 text-[#4361ee] hover:bg-[#4361ee]/20'
                                    : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                                }`}
                                title="İşlem Ekle"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleLock(catIdx, itemIdx)}
                                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                                  isLocked
                                    ? isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/[0.05] text-slate-400'
                                    : 'bg-amber-500/15 text-amber-500'
                                }`}
                                title={isLocked ? 'Sürgü Kilidini Aç' : 'Sürgüyü Kilitle'}
                              >
                                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => handleDeleteItem(catIdx, itemIdx)}
                                className="w-7 h-7 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
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
                            className={`w-full h-1.5 rounded-sm appearance-none cursor-pointer ${
                              isLight ? 'bg-slate-200 accent-[#4361ee]' : 'bg-white/[0.1] accent-cyan-400'
                            }`}
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
                            className={`mt-2 pt-2 border-t space-y-1.5 overflow-hidden ${
                              isLight ? 'border-slate-200' : 'border-white/[0.06]'
                            }`}
                          >
                            {item.transactions.map(tx => (
                              <div
                                key={tx.id}
                                className={`flex items-center justify-between text-[11px] py-1 px-2 rounded-md ${
                                  isLight ? 'bg-white' : 'bg-white/[0.02]'
                                }`}
                              >
                                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                                  {tx.date} — {tx.desc}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-black font-mono ${
                                      isLight ? 'text-[#f72585]' : 'text-rose-400'
                                    }`}
                                  >
                                    {formatMoney(tx.amount)}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteTx('expense', catIdx, itemIdx, tx.id)}
                                    className="text-slate-400 hover:text-rose-500 p-0.5"
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
                  className={`w-full py-1.5 mt-2 rounded-md border border-dashed text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1 ${
                    isLight
                      ? 'border-[#4361ee]/30 text-[#4361ee] hover:bg-[#4361ee]/5'
                      : 'border-white/[0.08] text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40'
                  }`}
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
