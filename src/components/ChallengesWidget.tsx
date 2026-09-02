import React from 'react';
import { Flag, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChallengesWidgetProps {
  className?: string;
  onViewAllChallenges?: () => void;
}

export const ChallengesWidget: React.FC<ChallengesWidgetProps> = ({
  className = '',
  onViewAllChallenges,
}) => {
  const { challenges, joinChallenge } = useApp();

  return (
    <div
      className={`bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01] ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-orange-500/10 text-[#FF5600] border border-orange-500/20">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">
            Active Challenges
          </h3>
        </div>
        {onViewAllChallenges && (
          <button
            onClick={onViewAllChallenges}
            className="text-xs font-bold text-[#FF5600] hover:text-[#E04D00] hover:underline"
          >
            View All
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {challenges.slice(0, 3).map((chal) => (
          <li
            key={chal.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 hover:border-orange-500/30 transition-all"
          >
            <div className="pr-2 min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white leading-snug truncate">
                {chal.title}
              </h4>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">
                {chal.isJoined
                  ? `${chal.currentProgress} ${chal.unit} logged`
                  : `Closes in ${chal.daysLeft} days`}
              </p>
            </div>

            {chal.isJoined ? (
              <span className="px-3 py-1 bg-orange-500/10 dark:bg-orange-950/40 border border-orange-500/30 rounded-full font-bold text-[10px] text-[#FF5600] shrink-0 shadow-xs">
                Active
              </span>
            ) : (
              <button
                onClick={() => joinChallenge(chal.id)}
                className="px-3.5 py-1 bg-white dark:bg-white/10 border border-slate-200/60 dark:border-white/10 rounded-full font-bold text-[11px] text-[#0F172A] dark:text-white hover:bg-[#FF5600] hover:text-white hover:border-[#FF5600] transition-all shadow-xs shrink-0 hover:scale-105 active:scale-95"
              >
                Join
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
