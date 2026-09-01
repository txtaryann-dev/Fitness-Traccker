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
      className={`bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4 shadow-xs transition-colors ${className}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">Challenges</h3>
        {onViewAllChallenges && (
          <button
            onClick={onViewAllChallenges}
            className="text-[11px] font-bold text-[#FF5600] hover:underline"
          >
            View All
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-2.5">
        {challenges.slice(0, 3).map((chal) => (
          <li
            key={chal.id}
            className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9] dark:border-[#1E293B] last:border-0 last:pb-0"
          >
            <div className="pr-2">
              <h4 className="font-bold text-xs text-[#0F172A] dark:text-white leading-snug">
                {chal.title}
              </h4>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {chal.isJoined
                  ? `${chal.currentProgress} ${chal.unit} completed`
                  : `Starts in ${chal.daysLeft} days`}
              </p>
            </div>

            {chal.isJoined ? (
              <span className="px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-800/40 rounded-full font-bold text-[10px] text-[#FF5600] shrink-0">
                Active
              </span>
            ) : (
              <button
                onClick={() => joinChallenge(chal.id)}
                className="px-2.5 py-0.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full font-bold text-[10px] text-[#0F172A] dark:text-gray-200 hover:bg-[#FF5600] hover:text-white hover:border-[#FF5600] transition-colors shrink-0"
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
