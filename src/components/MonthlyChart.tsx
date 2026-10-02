import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MonthData, formatMoney } from '../types';
import { LineChart as LineIcon, PieChart as PieIcon, Activity } from 'lucide-react';

interface MonthlyChartProps {
  month: MonthData;
  isLight?: boolean;
}

const CATEGORY_COLORS = [
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
];

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ month, isLight = false }) => {
  const [chartType, setChartType] = useState<'line' | 'pie'>('line');
  const [hoveredDay, setHoveredDay] = useState<{ day: number; amount: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Extract daily spending
  const dailyData = useMemo(() => {
    const parts = month.id.split('-');
    const year = parseInt(parts[0], 10);
    const monthIdx = parseInt(parts[1], 10);
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    const totals: Record<number, number> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      totals[i] = 0;
    }

    month.categories.forEach(cat => {
      // If recurring item was entered as transaction, we include it, or general items
      cat.items.forEach(item => {
        if (item.transactions) {
          item.transactions.forEach(tx => {
            if (tx.amount > 0 && tx.date) {
              const day = parseInt(tx.date.split('/')[0], 10);
              if (!isNaN(day) && totals[day] !== undefined) {
                totals[day] += tx.amount;
              }
            }
          });
        }
      });
    });

    const entries = Object.entries(totals).map(([d, val]) => ({
      day: parseInt(d, 10),
      amount: val
    }));

    const maxVal = Math.max(...entries.map(e => e.amount), 500);

    return { entries, maxVal, daysInMonth };
  }, [month]);

  // Extract category spending
  const categoryData = useMemo(() => {
    const list: { name: string; amount: number; color: string; percentage: number }[] = [];
    let totalCatExpense = 0;

    month.categories.forEach((cat, idx) => {
      let sum = 0;
      cat.items.forEach(item => {
        sum += item.amount || 0;
      });
      if (sum > 0) {
        totalCatExpense += sum;
        list.push({
          name: cat.name,
          amount: sum,
          color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          percentage: 0
        });
      }
    });

    list.sort((a, b) => b.amount - a.amount);
    list.forEach(c => {
      c.percentage = totalCatExpense > 0 ? Math.round((c.amount / totalCatExpense) * 100) : 0;
    });

    return { list, total: totalCatExpense };
  }, [month]);

  // Generate SVG path for line chart
  const { pathD, areaD, points } = useMemo(() => {
    const { entries, maxVal } = dailyData;
    const width = 360;
    const height = 110;
    const paddingX = 14;
    const paddingY = 16;

    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const pts = entries.map((entry, idx) => {
      const x = paddingX + (idx / Math.max(entries.length - 1, 1)) * usableWidth;
      const y = height - paddingY - (entry.amount / maxVal) * usableHeight;
      return { x, y, day: entry.day, amount: entry.amount };
    });

    if (pts.length === 0) return { pathD: '', areaD: '', points: [] };

    // Bezier smoothing
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const area = `${d} L ${pts[pts.length - 1].x} ${height - paddingY} L ${pts[0].x} ${height - paddingY} Z`;

    return { pathD: d, areaD: area, points: pts };
  }, [dailyData]);

  // Donut chart calculations
  const donutSegments = useMemo(() => {
    const { list, total } = categoryData;
    if (total === 0 || list.length === 0) return [];

    let currentAngle = -90; // Start at 12 o'clock
    const radius = 42;
    const cx = 60;
    const cy = 60;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;

    return list.map(item => {
      const ratio = item.amount / total;
      const strokeDasharray = `${ratio * circumference} ${circumference}`;
      const rotation = currentAngle;
      currentAngle += ratio * 360;

      return {
        ...item,
        cx,
        cy,
        radius,
        strokeWidth,
        strokeDasharray,
        rotation
      };
    });
  }, [categoryData]);

  return (
    <div
      className={`rounded-2xl p-4 border transition-all relative overflow-hidden backdrop-blur-md ${
        isLight
          ? 'bg-white/80 border-slate-200/80 shadow-sm'
          : 'bg-slate-900/60 border-white/[0.08] shadow-lg'
      }`}
    >
      {/* Header with Title & Chart Mode Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 tracking-tight">
              {chartType === 'line' ? 'Günlük Harcama Trendi' : 'Kategori Dağılımı'}
            </span>
            <p className="text-[10px] text-slate-400">
              {chartType === 'line'
                ? hoveredDay
                  ? `Gün ${hoveredDay.day}: ${formatMoney(hoveredDay.amount)}`
                  : 'Grafik üzerinde gezinebilirsiniz'
                : `Toplam: ${formatMoney(categoryData.total)}`}
            </p>
          </div>
        </div>

        {/* Toggle Pills */}
        <div
          className={`flex items-center p-0.5 rounded-xl border ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-slate-950/70 border-white/[0.08]'
          }`}
        >
          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-lg transition-all ${
              chartType === 'line'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Çizgi Grafik"
          >
            <LineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`p-1.5 rounded-lg transition-all ${
              chartType === 'pie'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Pasta / Donut Grafik"
          >
            <PieIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative min-h-[140px] flex items-center justify-center">
        {chartType === 'line' ? (
          <div className="w-full relative">
            <svg
              viewBox="0 0 360 120"
              className="w-full h-28 overflow-visible select-none"
              onMouseLeave={() => setHoveredDay(null)}
              onTouchEnd={() => setHoveredDay(null)}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="14" y1="94" x2="346" y2="94" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="14" y1="55" x2="346" y2="55" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Gradient Area Fill */}
              {areaD && (
                <path d={areaD} fill="url(#areaGradient)" />
              )}

              {/* Glowing Line Stroke */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 2px 6px rgba(6, 182, 212, 0.4))"
                />
              )}

              {/* Interaction points & hover indicator */}
              {points.map((pt, idx) => {
                const isHovered = hoveredDay?.day === pt.day;
                const hasSpend = pt.amount > 0;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDay({ day: pt.day, amount: pt.amount })}
                    onTouchStart={() => setHoveredDay({ day: pt.day, amount: pt.amount })}
                  >
                    {/* Invisible larger touch target */}
                    <rect
                      x={pt.x - 6}
                      y="0"
                      width="12"
                      height="120"
                      fill="transparent"
                    />

                    {isHovered && (
                      <>
                        <line
                          x1={pt.x}
                          y1="10"
                          x2={pt.x}
                          y2="94"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          opacity="0.8"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5.5"
                          fill="#38bdf8"
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                      </>
                    )}

                    {hasSpend && !isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="2.5"
                        fill="#06b6d4"
                        opacity="0.9"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Day Numbers */}
            <div className="flex justify-between px-3 mt-1 text-[10px] text-slate-400 font-mono">
              <span>1</span>
              <span>8</span>
              <span>15</span>
              <span>22</span>
              <span>{dailyData.daysInMonth}</span>
            </div>
          </div>
        ) : (
          /* Donut / Pie View */
          <div className="w-full flex items-center justify-between gap-4 py-1">
            {/* SVG Donut */}
            <div className="relative shrink-0 w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  fill="transparent"
                  stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth="14"
                />

                {donutSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx={seg.cx}
                    cy={seg.cy}
                    r={seg.radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={activeCategory === seg.name ? 18 : 14}
                    strokeDasharray={seg.strokeDasharray}
                    style={{
                      transformOrigin: 'center',
                      transform: `rotate(${seg.rotation}deg)`,
                      transition: 'all 0.3s ease'
                    }}
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveCategory(seg.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                    onTouchStart={() => setActiveCategory(activeCategory === seg.name ? null : seg.name)}
                  />
                ))}
              </svg>

              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Gider</span>
                <span className="text-xs font-bold font-mono text-slate-100">
                  {formatMoney(categoryData.total)}
                </span>
              </div>
            </div>

            {/* Category Legend List */}
            <div className="flex-1 space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {categoryData.list.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Harcama bulunmuyor</p>
              ) : (
                categoryData.list.map((cat, idx) => {
                  const isActive = activeCategory === cat.name;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveCategory(cat.name)}
                      onMouseLeave={() => setActiveCategory(null)}
                      onClick={() => setActiveCategory(isActive ? null : cat.name)}
                      className={`flex items-center justify-between text-xs p-1 rounded-lg cursor-pointer transition-colors ${
                        isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate text-slate-300 font-medium text-[11px]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] tabular-nums font-mono">
                        <span className="text-slate-400">%{cat.percentage}</span>
                        <span className="font-semibold text-slate-200">
                          {formatMoney(cat.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
