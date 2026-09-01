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
      className={`bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all duration-300 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-[#0F172A]">Challenges</h3>
        {onViewAllChallenges && (
          <button
            onClick={onViewAllChallenges}
            className="text-xs font-bold text-[#FF5600] hover:underline"
          >
            View All
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-4">
        {challenges.slice(0, 3).map((chal) => (
          <li
            key={chal.id}
            className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] last:border-0 last:pb-0"
          >
            <div className="pr-2">
              <h4 className="font-bold text-sm text-[#0F172A] leading-snug">
                {chal.title}
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                {chal.isJoined
                  ? `${chal.currentProgress} ${chal.unit} completed`
                  : `Starts in ${chal.daysLeft} days`}
              </p>
            </div>

            {chal.isJoined ? (
              <span className="px-3 py-1 bg-orange-50 border border-orange-100 rounded-full font-bold text-xs text-[#FF5600] shrink-0">
                Active
              </span>
            ) : (
              <button
                onClick={() => joinChallenge(chal.id)}
                className="px-3.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full font-bold text-xs text-[#0F172A] hover:bg-[#FF5600] hover:text-white hover:border-[#FF5600] transition-colors shrink-0"
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
