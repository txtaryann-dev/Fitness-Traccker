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
    <div className="space-y-8 pb-16">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Explore & Compete
          </h1>
          <p className="text-base text-[#64748B] mt-1">
            Discover community challenges, verified segment routes, and athlete clubs.
          </p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges or routes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#FF5600] shadow-sm text-[#0F172A]"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-[#FF5600] text-white shadow-sm'
              : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
        >
          All Challenges
        </button>
        <button
          onClick={() => setSelectedCategory('run')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'run'
              ? 'bg-[#FF5600] text-white shadow-sm'
              : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> Running
        </button>
        <button
          onClick={() => setSelectedCategory('ride')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            selectedCategory === 'ride'
              ? 'bg-[#FF5600] text-white shadow-sm'
              : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
        >
          <Bike className="w-3.5 h-3.5" /> Cycling
        </button>
      </div>

      {/* Challenges Grid */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FF5600]" /> Active Community Challenges
          </h2>
          <span className="text-xs text-[#64748B] font-semibold">
            {filteredChallenges.length} available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((chal) => {
            const progressPercent = Math.min(
              100,
              Math.round((chal.currentProgress / chal.targetProgress) * 100)
            );

            return (
              <div
                key={chal.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-6 flex flex-col justify-between hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-bold uppercase text-[#64748B]">
                      {chal.sportType}
                    </span>
                    <span className="text-xs font-semibold text-[#64748B]">
                      {chal.daysLeft} days left
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#0F172A] leading-tight mb-2">
                    {chal.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
                    {chal.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F1F5F9] space-y-4">
                  {chal.isJoined ? (
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[#64748B]">Your Progress</span>
                        <span className="text-[#0F172A] font-bold font-mono">
                          {chal.currentProgress} / {chal.targetProgress} {chal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#FF5600] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <Users className="w-4 h-4 text-[#94A3B8]" />
                      <span>{chal.participantsCount.toLocaleString()} athletes participating</span>
                    </div>
                  )}

                  <button
                    onClick={() => joinChallenge(chal.id)}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                      chal.isJoined
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-[#FF5600] text-white hover:bg-[#E04D00] shadow-sm'
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
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0059b0]" /> Trending Verified Routes
            </h2>
            <p className="text-xs text-[#64748B]">Top-rated courses recorded by community athletes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularRoutes.map((route) => (
            <div
              key={route.id}
              className="border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col hover:border-[#FF5600] transition-colors"
            >
              <div className="h-44 w-full relative">
                <LeafletMap
                  coordinates={route.coordinates}
                  interactive={false}
                  height="100%"
                  mapId={`explore-${route.id}`}
                />
                <span className="absolute top-2.5 right-2.5 z-10 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-[#0F172A] border border-[#E2E8F0]">
                  {route.difficulty}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A] mb-2">{route.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#64748B] font-mono">
                    <span>{route.distance}</span>
                    <span>•</span>
                    <span>{route.elevation}</span>
                  </div>
                </div>

                <button
                  onClick={() => onStartRouteTracking && onStartRouteTracking(route.sportType)}
                  className="mt-4 w-full py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#0F172A] hover:text-white rounded-lg text-xs font-bold text-[#0F172A] transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" /> Record on Route
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Athlete Clubs Directory */}
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF5600]" /> Athlete Clubs & Crews
            </h2>
            <p className="text-xs text-[#64748B]">Join local and global training teams</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                  style={{ backgroundColor: club.iconBg }}
                >
                  {club.iconSymbol ? <Bike className="w-6 h-6" /> : club.iconText}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A]">{club.name}</h4>
                  <p className="text-xs text-[#64748B]">
                    {club.memberCount.toLocaleString()} members • {club.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => joinClub(club.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  club.isJoined
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#FF5600] hover:text-white hover:border-[#FF5600]'
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
