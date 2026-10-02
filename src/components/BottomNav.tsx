import React from 'react';
import { LayoutDashboard, Coins, PiggyBank, Settings } from 'lucide-react';

export type TabType = 'overview' | 'this-month' | 'savings' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isLight?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isLight = false
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex justify-center">
      <div
        className={`w-full max-w-md pointer-events-auto h-16 px-4 pb-safe flex items-center justify-around border-t transition-none ${
          isLight
            ? 'bg-white border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
            : 'bg-[#0b0e17] border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Tab 1: Genel Bakış */}
        <button
          onClick={() => onTabChange('overview')}
          className={`flex flex-col items-center justify-center py-1 px-2 relative group flex-1 ${
            activeTab === 'overview'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {activeTab === 'overview' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Genel Bakış</span>
        </button>

        {/* Tab 2: Bu Ay */}
        <button
          onClick={() => onTabChange('this-month')}
          className={`flex flex-col items-center justify-center py-1 px-2 relative group flex-1 ${
            activeTab === 'this-month'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <div
              className={`p-1 rounded-xl ${
                activeTab === 'this-month'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              <Coins className="w-5 h-5" />
            </div>
            {activeTab === 'this-month' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Bu Ay</span>
        </button>

        {/* Tab 3: Birikim */}
        <button
          onClick={() => onTabChange('savings')}
          className={`flex flex-col items-center justify-center py-1 px-2 relative group flex-1 ${
            activeTab === 'savings'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <div
              className={`p-1 rounded-xl ${
                activeTab === 'savings'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400'
              }`}
            >
              <PiggyBank className="w-5 h-5" />
            </div>
            {activeTab === 'savings' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Birikim</span>
        </button>

        {/* Tab 4: Ayarlar */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center py-1 px-2 relative group flex-1 ${
            activeTab === 'settings'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <div className="relative">
            <Settings className="w-5 h-5" />
            {activeTab === 'settings' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Ayarlar</span>
        </button>
      </div>
    </div>
  );
};
