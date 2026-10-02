import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatMoney } from '../types';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

interface TugOfWarBarProps {
  income: number;
  expense: number;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
  isLight?: boolean;
}

export const TugOfWarBar: React.FC<TugOfWarBarProps> = ({
  income,
  expense,
  incomeBreakdown,
  expenseBreakdown,
  isLight = false
}) => {
  const [activeTooltip, setActiveTooltip] = useState<'income' | 'expense' | null>(null);

  const total = income + expense;
  let incomePct = total > 0 ? (income / total) * 100 : 50;
  let expensePct = total > 0 ? (expense / total) * 100 : 50;

  // Clamp visually so both remain clickable
  if (total > 0) {
    if (incomePct > 92) {
      incomePct = 92;
      expensePct = 8;
    } else if (expensePct > 92) {
      expensePct = 92;
      incomePct = 8;
    }
  }

  const activeData = activeTooltip === 'income' ? incomeBreakdown : expenseBreakdown;
  const items = Object.entries(activeData)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]);
  const activeTotal = items.reduce((sum, [_, v]) => sum + v, 0);

  const netDiff = income - expense;
  const isSurplus = netDiff >= 0;

  return (
    <div className="relative mb-6">
      {/* Title & Quick Stats */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Yıllık Denge
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            (Detay için dokun)
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold tabular-nums">
          <span className={isSurplus ? 'text-emerald-400' : 'text-rose-400'}>
            {isSurplus ? '+' : ''}{formatMoney(netDiff)}
          </span>
          <span className="text-[11px] text-slate-400 font-normal">net</span>
        </div>
      </div>

      {/* Main Bar Track */}
      <div
        className={`relative h-4 rounded-xl overflow-hidden cursor-pointer select-none p-0.5 shadow-inner transition-colors ${
          isLight
            ? 'bg-slate-200/80 border border-slate-300/60'
            : 'bg-slate-900/90 border border-white/[0.08]'
        }`}
      >
        <div className="flex h-full w-full rounded-lg overflow-hidden relative">
          {/* Income Side */}
          <motion.div
            initial={{ width: '50%' }}
            animate={{ width: `${incomePct}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            onClick={() => setActiveTooltip(activeTooltip === 'income' ? null : 'income')}
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 relative group flex items-center justify-start pl-2"
          >
            {incomePct > 18 && (
              <span className="text-[9px] font-bold text-slate-950 uppercase tracking-wider truncate">
                Gelir %{Math.round((income / (total || 1)) * 100)}
              </span>
            )}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* Center Dividing Notch */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/40 z-10 shadow-sm pointer-events-none" />

          {/* Expense Side */}
          <motion.div
            initial={{ width: '50%' }}
            animate={{ width: `${expensePct}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            onClick={() => setActiveTooltip(activeTooltip === 'expense' ? null : 'expense')}
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 relative group flex items-center justify-end pr-2"
          >
            {expensePct > 18 && (
              <span className="text-[9px] font-bold text-white uppercase tracking-wider truncate">
                Gider %{Math.round((expense / (total || 1)) * 100)}
              </span>
            )}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>
      </div>

      {/* Sub-label indicators */}
      <div className="flex justify-between items-center mt-1.5 px-1 text-[11px] font-medium text-slate-400">
        <button
          onClick={() => setActiveTooltip(activeTooltip === 'income' ? null : 'income')}
          className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>Gelirler ({formatMoney(income)})</span>
        </button>
        <button
          onClick={() => setActiveTooltip(activeTooltip === 'expense' ? null : 'expense')}
          className="flex items-center gap-1 hover:text-rose-400 transition-colors"
        >
          <span>Giderler ({formatMoney(expense)})</span>
          <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
        </button>
      </div>

      {/* Tooltip / Breakdown Card */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className={`mt-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl z-20 ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/40'
                : 'bg-slate-900/95 border-white/[0.1] text-slate-100 shadow-black/80'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                {activeTooltip === 'income' ? (
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="p-1 rounded-lg bg-rose-500/10 text-rose-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold leading-none">
                    {activeTooltip === 'income' ? 'Yıllık Gelir Dağılımı' : 'Yıllık Gider Dağılımı'}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Toplam: {formatMoney(activeTotal)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTooltip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {items.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">Kayıtlı veri bulunamadı</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map(([name, amount], idx) => {
                  const pct = activeTotal > 0 ? Math.round((amount / activeTotal) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium truncate max-w-[170px] text-slate-300">
                          {name}
                        </span>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="text-slate-400 text-[11px] font-mono">%{pct}</span>
                          <span
                            className={`font-semibold text-[11px] ${
                              activeTooltip === 'income' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatMoney(amount)}
                          </span>
                        </div>
                      </div>
                      {/* Micro progress line */}
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4, delay: idx * 0.04 }}
                          className={`h-full rounded-full ${
                            activeTooltip === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
