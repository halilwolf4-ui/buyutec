import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppData, MonthData, TR_MONTHS, TR_MONTHS_SHORT, formatMoney, getCycleString } from '../types';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { TugOfWarBar } from './TugOfWarBar';
import { PWAInstallButton } from './PWAInstallButton';
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  User,
  Plus,
  Coins
} from 'lucide-react';

interface OverviewTabProps {
  data: AppData;
  selectedYear: number;
  onYearChange: (delta: number) => void;
  onSelectMonth: (year: number, monthIdx: number) => void;
  onOpenDebtManager: () => void;
  onOpenAuth: () => void;
  onOpenSavings: () => void;
  currentUser: string | null;
  isLight: boolean;
  onToggleTheme: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  data,
  selectedYear,
  onYearChange,
  onSelectMonth,
  onOpenDebtManager,
  onOpenAuth,
  onOpenSavings,
  currentUser,
  isLight,
  onToggleTheme
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Total savings portfolio
  const totalSavings = useMemo(() => {
    return (data.savings || []).reduce((sum, s) => sum + (s.amount || 0), 0);
  }, [data.savings]);

  // Calculate accumulated buffer, annual income, expense, and breakdowns
  const {
    cashBuffer,
    annualIncome,
    annualExpense,
    globalIncomeBreakdown,
    globalExpenseBreakdown,
    topCategories
  } = useMemo(() => {
    let acc = 0;
    let aIncome = 0;
    let aExpense = 0;
    const incMap: Record<string, number> = {};
    const expMap: Record<string, number> = {};
    const catItemTotals: Record<string, number> = {};

    data.months.forEach(m => {
      acc += m.remaining || 0;

      if (m.id.startsWith(`${selectedYear}-`)) {
        aIncome += m.income || 0;
        aExpense += m.expense || 0;

        m.incomes?.forEach(inc => {
          if (inc.amount > 0) {
            incMap[inc.name] = (incMap[inc.name] || 0) + inc.amount;
          }
        });

        m.categories?.forEach(cat => {
          cat.items.forEach(item => {
            if (item.amount > 0) {
              expMap[cat.name] = (expMap[cat.name] || 0) + item.amount;
              if (!cat.isDebtCategory && !cat.isRecurringCategory) {
                catItemTotals[item.name] = (catItemTotals[item.name] || 0) + item.amount;
              }
            }
          });
        });
      }
    });

    const sortedCats = Object.entries(catItemTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      cashBuffer: acc,
      annualIncome: aIncome,
      annualExpense: aExpense,
      globalIncomeBreakdown: incMap,
      globalExpenseBreakdown: expMap,
      topCategories: sortedCats
    };
  }, [data.months, selectedYear]);

  // Combined Total Tampon (Cash + Savings)
  const combinedTampon = Math.max(0, cashBuffer) + totalSavings;
  const savingsPct = combinedTampon > 0 ? Math.round((totalSavings / combinedTampon) * 100) : 0;
  const cashPct = combinedTampon > 0 ? 100 - savingsPct : 0;

  const totalRemainingDebt = useMemo(() => {
    return data.debts.reduce((sum, d) => sum + d.remainingAmount, 0);
  }, [data.debts]);

  const cycleDay = data.settings.cycleStartDay || 1;

  // Handle scroll snap detection
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    const newIdx = Math.round(scrollLeft / (clientWidth || 1));
    if (newIdx !== carouselIndex && newIdx >= 0 && newIdx <= 1) {
      setCarouselIndex(newIdx);
    }
  };

  const scrollToSlide = (idx: number) => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.clientWidth;
    carouselRef.current.scrollTo({
      left: idx * width,
      behavior: 'smooth'
    });
    setCarouselIndex(idx);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={36} withGlow={false} />
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-slate-100 flex items-center gap-1.5">
              Büyüteç <span className="text-cyan-400 font-extrabold">Bütçe</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {currentUser ? `@${currentUser}` : 'Kişisel Bütçe Asistanı'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton isLight={isLight} />

          {/* User Profile Avatar Trigger */}
          <button
            onClick={onOpenAuth}
            className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                : 'bg-white/[0.05] border-white/[0.08] text-slate-300 hover:bg-white/[0.1]'
            }`}
            title="Kullanıcı & Güvenlik"
          >
            <User className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Theme Switcher */}
          <ThemeToggle isLight={isLight} onToggle={onToggleTheme} />
        </div>
      </div>

      {/* SWIPEABLE CAROUSEL (USER REQUEST: Slide olarak elle kaydırılabilen Tampon & En Çok Harcananlar) */}
      <div className="relative">
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 pb-0.5 touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* SLIDE 1: Toplam Birikmiş Tampon */}
          <div
            className={`w-full shrink-0 snap-center p-5 rounded-3xl border relative overflow-hidden transition-all ${
              isLight
                ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-emerald-200 shadow-sm'
                : 'bg-gradient-to-br from-[#0c221a] via-[#0d181e] to-[#0f1422] border-emerald-500/30 shadow-lg'
            }`}
          >
            <div className="absolute top-0 right-0 p-5 opacity-10 pointer-events-none text-emerald-400">
              <Sparkles className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Toplam Birikmiş Tampon
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                Kasa + Yatırımlar
              </span>
            </div>
            <h2 className="text-3xl font-black tabular-nums text-emerald-400 font-mono tracking-tight my-1">
              {formatMoney(combinedTampon)}
            </h2>

            {/* Subtext with Savings Breakdown */}
            <div
              onClick={onOpenSavings}
              className="mt-2.5 pt-2 border-t border-white/[0.08] cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Tamponun <strong className="text-cyan-400 font-mono">{formatMoney(totalSavings)}</strong> tutarı (%{savingsPct}) birikimde
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Aylık bütçe fazlası kasa tamponu: {formatMoney(Math.max(0, cashBuffer))} (%{cashPct})</span>
                <span className="text-cyan-400 underline font-medium">Yönet</span>
              </div>
            </div>
          </div>

          {/* SLIDE 2: En Çok Harcananlar */}
          <div
            className={`w-full shrink-0 snap-center p-5 rounded-3xl border relative overflow-hidden transition-all ${
              isLight
                ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-200 shadow-sm'
                : 'bg-gradient-to-br from-[#24170a] via-[#1a141c] to-[#0f1422] border-amber-500/30 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                En Çok Harcananlar ({selectedYear})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Top 5 Kategori</span>
            </div>
            {topCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Bu yıl henüz harcama kaydı yok</p>
            ) : (
              <div className="space-y-1.5 max-h-[88px] overflow-y-auto pr-1">
                {topCategories.map(([catName, amt], idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-0.5 border-b border-white/[0.04] last:border-none"
                  >
                    <span className="text-slate-300 truncate max-w-[170px] text-[11px]">
                      {idx + 1}. {catName}
                    </span>
                    <span className="font-bold text-rose-400 tabular-nums font-mono text-[11px]">
                      {formatMoney(amt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Carousel Dots indicator */}
        <div className="flex justify-center items-center gap-1.5 mt-2">
          <button
            onClick={() => scrollToSlide(0)}
            className={`h-1.5 rounded-full transition-all ${
              carouselIndex === 0 ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-600/50'
            }`}
            title="Birikmiş Tampon"
          />
          <button
            onClick={() => scrollToSlide(1)}
            className={`h-1.5 rounded-full transition-all ${
              carouselIndex === 1 ? 'w-6 bg-amber-400' : 'w-2 bg-slate-600/50'
            }`}
            title="En Çok Harcananlar"
          />
        </div>
      </div>

      {/* Global Debt Card */}
      <div
        onClick={onOpenDebtManager}
        className={`p-4 rounded-3xl border cursor-pointer relative overflow-hidden transition-all group ${
          isLight
            ? 'bg-gradient-to-r from-rose-50/80 to-pink-50/40 border-rose-200 hover:border-rose-300'
            : 'bg-gradient-to-r from-[#220d14] via-[#16121d] to-[#0f1422] border-rose-500/25 hover:border-rose-500/40 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Toplam Kalan Borç
              </span>
              <div className="text-xl font-black tabular-nums text-rose-400 font-mono">
                {formatMoney(totalRemainingDebt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-rose-400 transition-colors">
            <span>Yönet</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* X-Axis Tug of War Bar */}
      <TugOfWarBar
        income={annualIncome}
        expense={annualExpense}
        incomeBreakdown={globalIncomeBreakdown}
        expenseBreakdown={globalExpenseBreakdown}
        isLight={isLight}
      />

      {/* Year Selector */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onYearChange(-1)}
            className={`p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-900 border-white/[0.08] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-lg font-black tracking-tight text-slate-100 px-2 font-mono">
            {selectedYear}
          </h3>
          <button
            onClick={() => onYearChange(1)}
            className={`p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-900 border-white/[0.08] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Döngü:{' '}
          <span className="text-cyan-400 font-bold font-mono">
            {cycleDay === 1 ? '1-30' : `${cycleDay}. Gün`}
          </span>
        </div>
      </div>

      {/* 12 Months Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {Array.from({ length: 12 }).map((_, monthIdx) => {
          const monthId = `${selectedYear}-${monthIdx}`;
          const existingMonth = data.months.find(m => m.id === monthId);
          const cycleLabel = getCycleString(monthIdx, cycleDay);
          const isNegative = existingMonth ? existingMonth.remaining < 0 : false;

          return (
            <div
              key={monthIdx}
              onClick={() => onSelectMonth(selectedYear, monthIdx)}
              className={`p-3 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between min-h-[92px] active:scale-[0.97] ${
                existingMonth
                  ? isLight
                    ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
                    : 'bg-[#101422] border-white/[0.08] hover:border-cyan-400/40 shadow-sm'
                  : isLight
                  ? 'bg-slate-100/60 border-dashed border-slate-300 text-slate-400 hover:border-cyan-400'
                  : 'bg-white/[0.02] border-dashed border-white/[0.08] text-slate-500 hover:border-white/[0.2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    {TR_MONTHS[monthIdx]}
                  </span>
                  {existingMonth && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isNegative ? 'bg-rose-400' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {cycleDay === 1 ? TR_MONTHS_SHORT[monthIdx] : cycleLabel}
                </div>
              </div>

              {existingMonth ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span>G: {formatMoney(existingMonth.income)}</span>
                  </div>
                  <div
                    className={`text-xs font-bold font-mono tracking-tight mt-0.5 tabular-nums ${
                      isNegative ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {!isNegative && '+'}
                    {formatMoney(existingMonth.remaining)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 py-1">
                  <Plus className="w-3 h-3" />
                  <span>Başlat</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
