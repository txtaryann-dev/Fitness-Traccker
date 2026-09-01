import React, { useState } from 'react';
import {
  Activity as ActivityIcon,
  Bike,
  Filter,
  Footprints,
  Play,
  RotateCcw,
  Trophy,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import { ActivityCard } from './ActivityCard';
import { ChallengesWidget } from './ChallengesWidget';
import { WeeklyProgressWidget } from './WeeklyProgressWidget';

export type FeedFilterOption = 'all' | 'running' | 'cycling' | 'walking';

interface HomeFeedViewProps {
  onOpenRecord: () => void;
  onOpenSummary: (activity: Activity) => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  onOpenRecord,
  onOpenSummary,
}) => {
  const { activities, currentUser, setActiveTab } = useApp();
  const [filter, setFilter] = useState<FeedFilterOption>('all');

  // Filter logic across sport categories
  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    if (filter === 'running') return act.sportType === 'run';
    if (filter === 'cycling') return act.sportType === 'ride';
    if (filter === 'walking') return act.sportType === 'walk' || act.sportType === 'hike';
    return true;
  });

  // Calculate live counts for each filter option
  const counts = {
    all: activities.length,
    running: activities.filter((a) => a.sportType === 'run').length,
    cycling: activities.filter((a) => a.sportType === 'ride').length,
    walking: activities.filter((a) => a.sportType === 'walk' || a.sportType === 'hike').length,
  };

  const filterOptions: { id: FeedFilterOption; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: 'all', label: 'All', icon: ActivityIcon, count: counts.all },
    { id: 'running', label: 'Running', icon: Zap, count: counts.running },
    { id: 'cycling', label: 'Cycling', icon: Bike, count: counts.cycling },
    { id: 'walking', label: 'Walking', icon: Footprints, count: counts.walking },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-12">
      {/* Left Column: Social Activity Feed (Span 8) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Quick Workout Start Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] dark:from-[#111827] dark:via-[#1F2937] dark:to-[#111827] text-white rounded-xl p-4 border border-[#334155] dark:border-[#374151] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF5600] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Zap className="w-4.5 h-4.5 fill-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">
                Ready for today's session, {currentUser.name.split(' ')[0]}?
              </h2>
              <p className="text-[11px] text-gray-300">
                High-precision GPS active. Track pace, splits, and elevation.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRecord}
            className="w-full sm:w-auto px-4 py-2 bg-[#FF5600] hover:bg-[#E04D00] text-white font-bold text-xs rounded-lg shadow-xs transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Start Tracking
          </button>
        </div>

        {/* Activity Filter Bar */}
        <div className="bg-white dark:bg-[#151D2A] p-2 sm:p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-xs">
          <div className="flex items-center justify-between gap-2">
            {/* Filter Toggle Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1">
              {filterOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = filter === opt.id;
                return (
                  <button
                    key={opt.id}
                    id={`feed-filter-${opt.id}`}
                    onClick={() => setFilter(opt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 select-none ${
                      isActive
                        ? 'bg-[#FF5600] text-white shadow-xs'
                        : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#334155]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E2E8F0] dark:bg-[#334155] text-[#64748B] dark:text-[#CBD5E1]'
                      }`}
                    >
                      {opt.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Status / Reset Badge */}
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#FF5600] dark:hover:text-[#FF5600] px-2 py-1 rounded transition-colors shrink-0"
                title="Reset to all activities"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Activity Cards Feed Stream or Empty State */}
        {filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onOpenSummary={onOpenSummary}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center mx-auto mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
              No {filter} activities found
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
              There are no activities logged under this category yet. Start a new workout or view all activities.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setFilter('all')}
                className="px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-xs font-bold text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
              >
                Show All Activities
              </button>
              <button
                onClick={onOpenRecord}
                className="px-3.5 py-1.5 rounded-lg bg-[#FF5600] text-white text-xs font-bold hover:bg-[#E04D00] shadow-xs transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-white" /> Record Workout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Widgets Sidebar (Span 4) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Weekly Progress Widget */}
        <WeeklyProgressWidget />

        {/* Challenges Widget */}
        <ChallengesWidget
          onViewAllChallenges={() => setActiveTab('explore')}
        />

        {/* Pro / Athlete Milestone Card */}
        <div className="bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4 shadow-xs transition-colors">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF5600]/10 text-[#FF5600] flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#0F172A] dark:text-white">Annual Mileage Goal</h4>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{currentUser.totalDistanceKm} / {currentUser.yearlyGoalKm} km</p>
            </div>
          </div>
          <div className="w-full bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full h-1.5 overflow-hidden mb-1.5">
            <div
              className="bg-[#FF5600] h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] text-right font-medium">
            {Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100)}% completed
          </p>
        </div>
      </div>
    </div>
  );
};
