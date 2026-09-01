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

  // Circumference for r=54 -> 2 * PI * 54 = ~339.29
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all duration-300 ${className}`}
    >
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg text-[#0F172A]">Weekly Progress</h2>
        <span className="p-1.5 rounded-lg bg-[#FF5600]/10 text-[#FF5600]">
          <Target className="w-4 h-4" />
        </span>
      </div>

      {/* SVG Circular Progress Ring */}
      <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="8"
          />
          {/* Active progress ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#FF5600"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {percentage}%
          </span>
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-0.5">
            Goal Reached
          </span>
          <span className="text-[11px] font-mono text-[#0F172A] mt-1 font-bold">
            {completed} / {goal} {unitSystem === 'imperial' ? 'mi' : 'km'}
          </span>
        </div>
      </div>

      <p className="text-sm text-[#64748B] max-w-[240px] leading-relaxed">
        Keep pushing. You're on track to hit your weekly mileage target!
      </p>
    </div>
  );
};
