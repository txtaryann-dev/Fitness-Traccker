import React, { useState } from 'react';
import {
  Bike,
  Flame,
  Footprints,
  Play,
  Plus,
  Radio,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Waves,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity, SportType } from '../types';
import { ActivityCard } from './ActivityCard';
import { ChallengesWidget } from './ChallengesWidget';
import { WeeklyProgressWidget } from './WeeklyProgressWidget';

interface HomeFeedViewProps {
  onOpenRecord: () => void;
  onOpenSummary: (activity: Activity) => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  onOpenRecord,
  onOpenSummary,
}) => {
  const { activities, currentUser, setActiveTab } = useApp();
  const [selectedSport, setSelectedSport] = useState<'all' | SportType>('all');

  const filteredActivities = activities.filter((act) => {
    if (selectedSport === 'all') return true;
    return act.sportType === selectedSport;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-16">
      {/* Left Column: Social Activity Feed (Span 8) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Quick Workout Start Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-2xl p-6 border border-[#334155] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF5600] flex items-center justify-center text-white shrink-0 shadow-lg">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">
                Ready for today's session, {currentUser.name.split(' ')[0]}?
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                GPS is calibrated. Track your pace, elevation, and live route.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRecord}
            className="w-full sm:w-auto px-6 py-3 bg-[#FF5600] hover:bg-[#E04D00] text-white font-bold text-sm rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" /> Start Tracking
          </button>
        </div>

        {/* Sport Filter Controls */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2 overflow-x-auto py-1 pr-2 no-scrollbar">
            <button
              onClick={() => setSelectedSport('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedSport === 'all'
                  ? 'bg-[#FF5600] text-white shadow-sm'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              All Activities ({activities.length})
            </button>

            <button
              onClick={() => setSelectedSport('run')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedSport === 'run'
                  ? 'bg-[#FF5600] text-white shadow-sm'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Runs
            </button>

            <button
              onClick={() => setSelectedSport('ride')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedSport === 'ride'
                  ? 'bg-[#FF5600] text-white shadow-sm'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <Bike className="w-3.5 h-3.5" /> Rides
            </button>

            <button
              onClick={() => setSelectedSport('hike')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedSport === 'hike'
                  ? 'bg-[#FF5600] text-white shadow-sm'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" /> Hikes
            </button>
          </div>
        </div>

        {/* Activity Cards Feed Stream */}
        <div className="space-y-6">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onOpenSummary={onOpenSummary}
            />
          ))}
        </div>
      </div>

      {/* Right Column: Widgets Sidebar (Span 4) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Weekly Progress Widget */}
        <WeeklyProgressWidget />

        {/* Challenges Widget */}
        <ChallengesWidget
          onViewAllChallenges={() => setActiveTab('explore')}
        />

        {/* Pro / Athlete Milestone Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FF5600]/10 text-[#FF5600] flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0F172A]">Annual Mileage Goal</h4>
              <p className="text-xs text-[#64748B]">{currentUser.totalDistanceKm} / {currentUser.yearlyGoalKm} km</p>
            </div>
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-[#FF5600] h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-[#64748B] text-right font-medium">
            {Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100)}% completed
          </p>
        </div>
      </div>
    </div>
  );
};
