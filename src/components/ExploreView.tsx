import React, { useState } from 'react';
import {
  Bike,
  Check,
  ChevronRight,
  Compass,
  Filter,
  Flame,
  Footprints,
  MapPin,
  Mountain,
  Navigation,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Challenge, SportType } from '../types';
import { LeafletMap } from './LeafletMap';

interface ExploreViewProps {
  onStartRouteTracking?: (sport: SportType) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onStartRouteTracking }) => {
  const { challenges, joinChallenge, clubs, joinClub } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'run' | 'ride'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChallenges = challenges.filter((c) => {
    if (selectedCategory !== 'all' && c.sportType !== selectedCategory) return false;
    if (searchQuery.trim() && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const popularRoutes = [
    {
      id: 'route_1',
      title: 'Kathmandu Valley Ridge Loop',
      distance: '14.2 km',
      elevation: '+320 m',
      sportType: 'run' as SportType,
      difficulty: 'Moderate',
      coordinates: [
        { lat: 27.7172, lng: 85.324 },
        { lat: 27.725, lng: 85.335 },
        { lat: 27.731, lng: 85.342 },
        { lat: 27.722, lng: 85.35 },
        { lat: 27.7172, lng: 85.324 },
      ],
    },
    {
      id: 'route_2',
      title: 'Central Park Outer Reservoir Circuit',
      distance: '9.8 km',
      elevation: '+85 m',
      sportType: 'ride' as SportType,
      difficulty: 'Easy',
      coordinates: [
        { lat: 40.785091, lng: -73.968285 },
        { lat: 40.796, lng: -73.958 },
        { lat: 40.792, lng: -73.952 },
        { lat: 40.778, lng: -73.969 },
        { lat: 40.785091, lng: -73.968285 },
      ],
    },
    {
      id: 'route_3',
      title: 'Alpine Crest Trail & Summit',
      distance: '21.5 km',
      elevation: '+890 m',
      sportType: 'hike' as SportType,
      difficulty: 'Hard',
      coordinates: [
        { lat: 27.7172, lng: 85.324 },
        { lat: 27.74, lng: 85.36 },
        { lat: 27.755, lng: 85.38 },
        { lat: 27.73, lng: 85.37 },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Explore & Compete
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Discover community challenges, verified segment routes, and athlete clubs.
          </p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges or routes..."
            className="w-full pl-10 pr-4 py-2 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-full text-xs sm:text-sm focus:outline-none focus:border-[#FF5600] shadow-md text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] transition-all"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-white/10 pb-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-[#FF5600] to-orange-500 text-white shadow-md shadow-orange-500/25 scale-105'
              : 'bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl text-[#64748B] dark:text-[#94A3B8] border border-slate-200/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
          }`}
        >
          All Challenges
        </button>
        <button
          onClick={() => setSelectedCategory('run')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'run'
              ? 'bg-gradient-to-r from-[#FF5600] to-orange-500 text-white shadow-md shadow-orange-500/25 scale-105'
              : 'bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl text-[#64748B] dark:text-[#94A3B8] border border-slate-200/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> Running
        </button>
        <button
          onClick={() => setSelectedCategory('ride')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'ride'
              ? 'bg-gradient-to-r from-[#FF5600] to-orange-500 text-white shadow-md shadow-orange-500/25 scale-105'
              : 'bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl text-[#64748B] dark:text-[#94A3B8] border border-slate-200/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
          }`}
        >
          <Bike className="w-3.5 h-3.5" /> Cycling
        </button>
      </div>

      {/* Challenges Grid */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs sm:text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <div className="p-1 rounded-lg bg-orange-500/10 text-[#FF5600] border border-orange-500/20">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            Active Community Challenges
          </h2>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold">
            {filteredChallenges.length} available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChallenges.map((chal) => {
            const progressPercent = Math.min(
              100,
              Math.round((chal.currentProgress / chal.targetProgress) * 100)
            );

            return (
              <div
                key={chal.id}
                className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-5 sm:p-6 flex flex-col justify-between shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01]"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[10px] font-extrabold uppercase text-[#64748B] dark:text-[#94A3B8]">
                      {chal.sportType}
                    </span>
                    <span className="text-xs font-bold text-[#FF5600]">
                      {chal.daysLeft} days left
                    </span>
                  </div>

                  <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white leading-tight mb-1.5">
                    {chal.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] line-clamp-2 mb-4 leading-relaxed">
                    {chal.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 dark:border-white/5 space-y-3">
                  {chal.isJoined ? (
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Your Progress</span>
                        <span className="text-[#0F172A] dark:text-white font-black font-mono">
                          {chal.currentProgress} / {chal.targetProgress} {chal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-white/5">
                        <div
                          className="bg-gradient-to-r from-[#FF5600] to-orange-500 h-full rounded-full transition-all duration-500 shadow-xs"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{chal.participantsCount.toLocaleString()} athletes participating</span>
                    </div>
                  )}

                  <button
                    onClick={() => joinChallenge(chal.id)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 ${
                      chal.isJoined
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 shadow-xs'
                        : 'bg-gradient-to-r from-[#FF5600] to-orange-500 text-white hover:from-[#E04D00] hover:to-[#FF5600] shadow-md shadow-orange-500/25'
                    }`}
                  >
                    {chal.isJoined ? (
                      <>
                        <Check className="w-4 h-4" /> Joined Challenge
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Join Challenge
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Segment Routes */}
      <section className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1 rounded-lg bg-blue-500/10 text-[#0059b0] dark:text-blue-400 border border-blue-500/20">
                <Compass className="w-3.5 h-3.5" />
              </div>
              Trending Verified Routes
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">Top-rated courses recorded by community athletes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {popularRoutes.map((route) => (
            <div
              key={route.id}
              className="border border-slate-200/60 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-orange-500/40 transition-all bg-white/60 dark:bg-white/5 shadow-md hover:scale-[1.01]"
            >
              <div className="h-40 w-full relative">
                <LeafletMap
                  coordinates={route.coordinates}
                  interactive={false}
                  height="100%"
                  mapId={`explore-${route.id}`}
                />
                <span className="absolute top-2.5 right-2.5 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#0F172A] dark:text-white border border-slate-200/60 dark:border-white/10 shadow-md">
                  {route.difficulty}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white mb-1">{route.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">
                    <span className="font-bold">{route.distance}</span>
                    <span>•</span>
                    <span>{route.elevation}</span>
                  </div>
                </div>

                <button
                  onClick={() => onStartRouteTracking && onStartRouteTracking(route.sportType)}
                  className="mt-3.5 w-full py-2 bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-[#FF5600] hover:text-white hover:border-[#FF5600] rounded-xl text-xs font-bold text-[#0F172A] dark:text-white transition-all flex items-center justify-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" /> Record on Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Athlete Clubs Directory */}
      <section className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1 rounded-lg bg-orange-500/10 text-[#FF5600] border border-orange-500/20">
                <Users className="w-3.5 h-3.5" />
              </div>
              Athlete Clubs & Crews
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">Join local and global training teams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/10 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-white/5 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-sm shrink-0"
                  style={{ backgroundColor: club.iconBg }}
                >
                  {club.iconSymbol ? <Bike className="w-5 h-5" /> : club.iconText}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white truncate">{club.name}</h4>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                    {club.memberCount.toLocaleString()} members • {club.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => joinClub(club.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 hover:scale-105 active:scale-95 ${
                  club.isJoined
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-white/10 border border-slate-200/60 dark:border-white/10 text-[#0F172A] dark:text-white hover:bg-[#FF5600] hover:text-white hover:border-[#FF5600] shadow-xs'
                }`}
              >
                {club.isJoined ? 'Joined' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
