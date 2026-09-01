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
    <div className="space-y-5 pb-12">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Explore & Compete
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
            Discover community challenges, verified segment routes, and athlete clubs.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges or routes..."
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs focus:outline-none focus:border-[#FF5600] shadow-xs text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-2.5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#FF5600] text-white shadow-xs'
              : 'bg-white dark:bg-[#151D2A] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
          }`}
        >
          All Challenges
        </button>
        <button
          onClick={() => setSelectedCategory('run')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
            selectedCategory === 'run'
              ? 'bg-[#FF5600] text-white shadow-xs'
              : 'bg-white dark:bg-[#151D2A] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
          }`}
        >
          <Zap className="w-3 h-3" /> Running
        </button>
        <button
          onClick={() => setSelectedCategory('ride')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
            selectedCategory === 'ride'
              ? 'bg-[#FF5600] text-white shadow-xs'
              : 'bg-white dark:bg-[#151D2A] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
          }`}
        >
          <Bike className="w-3 h-3" /> Cycling
        </button>
      </div>

      {/* Challenges Grid */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-[#FF5600]" /> Active Community Challenges
          </h2>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
            {filteredChallenges.length} available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredChallenges.map((chal) => {
            const progressPercent = Math.min(
              100,
              Math.round((chal.currentProgress / chal.targetProgress) * 100)
            );

            return (
              <div
                key={chal.id}
                className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 flex flex-col justify-between shadow-xs transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[10px] font-bold uppercase text-[#64748B] dark:text-[#94A3B8]">
                      {chal.sportType}
                    </span>
                    <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      {chal.daysLeft} days left
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#0F172A] dark:text-white leading-tight mb-1">
                    {chal.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#CBD5E1] line-clamp-2 mb-3 leading-relaxed">
                    {chal.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F1F5F9] dark:border-[#1E293B] space-y-2.5">
                  {chal.isJoined ? (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold mb-1">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Your Progress</span>
                        <span className="text-[#0F172A] dark:text-white font-bold font-mono">
                          {chal.currentProgress} / {chal.targetProgress} {chal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#FF5600] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{chal.participantsCount.toLocaleString()} athletes participating</span>
                    </div>
                  )}

                  <button
                    onClick={() => joinChallenge(chal.id)}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                      chal.isJoined
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                        : 'bg-[#FF5600] text-white hover:bg-[#E04D00] shadow-xs'
                    }`}
                  >
                    {chal.isJoined ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Joined Challenge
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Join Challenge
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
      <section className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-[#0059b0] dark:text-blue-400" /> Trending Verified Routes
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Top-rated courses recorded by community athletes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {popularRoutes.map((route) => (
            <div
              key={route.id}
              className="border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl overflow-hidden flex flex-col hover:border-[#FF5600] transition-colors bg-white dark:bg-[#1E293B]/40"
            >
              <div className="h-36 w-full relative">
                <LeafletMap
                  coordinates={route.coordinates}
                  interactive={false}
                  height="100%"
                  mapId={`explore-${route.id}`}
                />
                <span className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155]">
                  {route.difficulty}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white mb-1">{route.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                    <span>{route.distance}</span>
                    <span>•</span>
                    <span>{route.elevation}</span>
                  </div>
                </div>

                <button
                  onClick={() => onStartRouteTracking && onStartRouteTracking(route.sportType)}
                  className="mt-3 w-full py-1.5 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#0F172A] dark:hover:bg-[#FF5600] hover:text-white rounded-lg text-xs font-bold text-[#0F172A] dark:text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
                >
                  <Navigation className="w-3 h-3" /> Record on Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Athlete Clubs Directory */}
      <section className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#FF5600]" /> Athlete Clubs & Crews
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Join local and global training teams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-xs shrink-0"
                  style={{ backgroundColor: club.iconBg }}
                >
                  {club.iconSymbol ? <Bike className="w-5 h-5" /> : club.iconText}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white truncate">{club.name}</h4>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">
                    {club.memberCount.toLocaleString()} members • {club.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => joinClub(club.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors shrink-0 ${
                  club.isJoined
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white hover:bg-[#FF5600] hover:text-white hover:border-[#FF5600]'
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
