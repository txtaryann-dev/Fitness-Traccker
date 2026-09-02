import React from 'react';
import { Sparkles, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WeeklyProgressWidgetProps {
  className?: string;
}

export const WeeklyProgressWidget: React.FC<WeeklyProgressWidgetProps> = ({ className = '' }) => {
  const { currentUser, unitSystem } = useApp();

  const completed = currentUser.weeklyCompletedMiles;
  const goal = currentUser.weeklyGoalMiles;
  const percentage = Math.min(100, Math.round((completed / goal) * 100));

  // Circumference for r=46 -> 2 * PI * 46 = ~289.02
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01] ${className}`}
    >
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="font-extrabold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">
          Weekly Progress
        </h2>
        <span className="p-1.5 rounded-xl bg-orange-500/10 text-[#FF5600] border border-orange-500/20">
          <Target className="w-4 h-4" />
        </span>
      </div>

      {/* SVG Circular Progress Ring */}
      <div className="relative w-36 h-36 mb-4 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF5600" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>

          {/* Background circle track */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            className="stroke-slate-100 dark:stroke-white/5"
            strokeWidth="8"
          />
          {/* Active progress ring */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="url(#progressGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mt-0.5">
            Target
          </span>
          <span className="text-[11px] font-mono text-[#0F172A] dark:text-gray-200 font-extrabold mt-0.5">
            {completed} / {goal} {unitSystem === 'imperial' ? 'mi' : 'km'}
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-50/80 dark:bg-white/5 p-2.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed">
          {percentage >= 100 ? "🎉 Target smashed! Outstanding work." : "Keep pushing to hit your weekly mileage goal!"}
        </p>
      </div>
    </div>
  );
};
