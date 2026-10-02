import React from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isLight: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isLight, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative w-14 h-8 rounded-full p-1 border transition-colors flex items-center shadow-inner ${
        isLight
          ? 'bg-amber-100/80 border-amber-300/80'
          : 'bg-slate-900 border-white/[0.12]'
      }`}
      title={isLight ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
          isLight
            ? 'translate-x-6 bg-gradient-to-tr from-amber-400 to-orange-400 text-slate-950'
            : 'translate-x-0 bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950'
        }`}
      >
        {isLight ? (
          <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
        ) : (
          <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
        )}
      </motion.div>
    </button>
  );
};
