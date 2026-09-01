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
      className={`bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4 flex flex-col items-center text-center shadow-xs transition-colors ${className}`}
    >
      <div className="w-full flex justify-between items-center mb-3">
        <h2 className="font-bold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">Weekly Progress</h2>
        <span className="p-1 rounded-md bg-[#FF5600]/10 text-[#FF5600]">
          <Target className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* SVG Circular Progress Ring */}
      <div className="relative w-32 h-32 mb-3 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
          {/* Background circle track */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            className="stroke-[#E2E8F0] dark:stroke-[#1E293B]"
            strokeWidth="7"
          />
          {/* Active progress ring */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="#FF5600"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            {percentage}%
          </span>
          <span className="text-[9px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
            Target
          </span>
          <span className="text-[10px] font-mono text-[#0F172A] dark:text-gray-200 font-bold mt-0.5">
            {completed} / {goal} {unitSystem === 'imperial' ? 'mi' : 'km'}
          </span>
        </div>
      </div>

      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-[200px] leading-snug">
        Keep pushing to hit your weekly target!
      </p>
    </div>
  );
};
