import React, { useMemo, useState } from 'react';
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

  // Optimization (Bolt ⚡): Memoize counts calculation in a single pass over activities to avoid multiple O(N) filters on every render.
  const counts = useMemo(() => {
    let running = 0;
    let cycling = 0;
    let walking = 0;

    for (let i = 0; i < activities.length; i++) {
      const type = activities[i].sportType;
      if (type === 'run') running++;
      else if (type === 'ride') cycling++;
      else if (type === 'walk' || type === 'hike') walking++;
    }

    return {
      all: activities.length,
      running,
      cycling,
      walking,
    };
  }, [activities]);

  // Optimization (Bolt ⚡): Memoize filtered activities list so it only recalculates when filter or activities array changes.
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter((act) => {
      if (filter === 'running') return act.sportType === 'run';
      if (filter === 'cycling') return act.sportType === 'ride';
      if (filter === 'walking') return act.sportType === 'walk' || act.sportType === 'hike';
      return true;
    });
  }, [activities, filter]);

  const filterOptions: { id: FeedFilterOption; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: 'all', label: 'All', icon: ActivityIcon, count: counts.all },
    { id: 'running', label: 'Running', icon: Zap, count: counts.running },
    { id: 'cycling', label: 'Cycling', icon: Bike, count: counts.cycling },
    { id: 'walking', label: 'Walking', icon: Footprints, count: counts.walking },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-14">
      {/* Left Column: Social Activity Feed (Span 8) */}
      <div className="lg:col-span-8 space-y-5">
        {/* Quick Workout Start Executive Glass Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] dark:from-[#0B0F17] dark:via-[#161F30] dark:to-[#0B0F17] text-white rounded-3xl p-6 border border-slate-700/60 dark:border-white/10 shadow-xl shadow-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5600]/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E04D00] to-[#FF5600] flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/30">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                Ready for today's session, {currentUser.name.split(' ')[0]}?
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Precision GPS active. Live pace pacing, elevation, and animated replay ready.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenRecord}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#FF5600] to-orange-500 hover:from-[#E04D00] hover:to-[#FF5600] text-white font-bold text-xs rounded-2xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0 relative z-10"
          >
            <Play className="w-4 h-4 fill-white" /> Start Tracking
          </button>
        </div>

        {/* Activity Filter Glass Bar */}
        <div className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm">
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
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 select-none ${
                      isActive
                        ? 'bg-[#FF5600] text-white shadow-sm shadow-orange-500/30'
                        : 'bg-slate-100/80 dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{opt.label}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 dark:bg-white/10 text-[#64748B] dark:text-[#CBD5E1]'
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
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#FF5600] dark:hover:text-[#FF5600] px-3 py-1.5 rounded-full bg-slate-100/60 dark:bg-white/5 transition-colors shrink-0"
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
          <div className="space-y-5">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onOpenSummary={onOpenSummary}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-10 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center mx-auto mb-3.5 shadow-inner">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A] dark:text-white">
              No {filter} activities found
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1.5 max-w-sm mx-auto">
              There are no activities logged under this category yet. Start a new workout or view all activities.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 rounded-full border border-slate-200/60 dark:border-white/10 text-xs font-bold text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Show All Activities
              </button>
              <button
                onClick={onOpenRecord}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#FF5600] to-orange-500 text-white text-xs font-bold hover:from-[#E04D00] hover:to-[#FF5600] shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Record Workout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Widgets Sidebar (Span 4) */}
      <div className="lg:col-span-4 space-y-5">
        {/* Weekly Progress Widget */}
        <WeeklyProgressWidget />

        {/* Challenges Widget */}
        <ChallengesWidget
          onViewAllChallenges={() => setActiveTab('explore')}
        />

        {/* Pro / Athlete Milestone Card */}
        <div className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-500/20">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">Annual Mileage Goal</h4>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono mt-0.5">{currentUser.totalDistanceKm} / {currentUser.yearlyGoalKm} km</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden mb-2 border border-slate-200/40 dark:border-white/5">
            <div
              className="bg-gradient-to-r from-[#FF5600] to-amber-500 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{
                width: `${Math.min(100, Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
            <span>Season Progress</span>
            <span className="font-bold text-[#FF5600]">
              {Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100)}% completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
