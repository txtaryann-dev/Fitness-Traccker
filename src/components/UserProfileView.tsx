import React, { useState } from 'react';
import {
  Award,
  Bike,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Flame,
  Globe,
  Heart,
  Lock,
  MapPin,
  Moon,
  Mountain,
  Plus,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Trophy,
  Users,
  Waves,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity, SportType, Trophy as TrophyType } from '../types';

interface UserProfileViewProps {
  onSelectActivity: (activity: Activity) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onSelectActivity }) => {
  const {
    currentUser,
    updateUserProfile,
    activities,
    trophies,
    clubs,
    joinClub,
    formatDistance,
    theme,
    toggleTheme,
    setTheme,
    unitSystem,
    toggleUnitSystem,
  } = useApp();

  const [activeVolumeTab, setActiveVolumeTab] = useState<'run' | 'ride'>('run');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyType | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editRole, setEditRole] = useState(currentUser.role);
  const [editCity, setEditCity] = useState(currentUser.city);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

  const myActivities = activities.filter(
    (a) => a.userId === currentUser.id || a.isMyActivity
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      bio: editBio,
      role: editRole,
      city: editCity,
      avatar: editAvatar,
    });
    setIsEditing(false);
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // 4-week activity volume days
  const runVolumeBars = [45, 70, 30, 85, 20, 95, 100];
  const rideVolumeBars = [60, 40, 90, 35, 80, 100, 50];
  const activeBars = activeVolumeTab === 'run' ? runVolumeBars : rideVolumeBars;

  const elevationPercent = Math.min(
    100,
    Math.round((currentUser.elevationGoalCurrentM / currentUser.elevationGoalTargetM) * 100)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Header Card */}
      <section className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.005]">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
          {/* Avatar with Pro / Verified badge */}
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white dark:border-[#0F172A] shadow-lg ring-3 ring-orange-500/50"
            />
            <div className="absolute bottom-0 right-0 bg-gradient-to-r from-[#FF5600] to-orange-500 text-white rounded-full p-1.5 border-2 border-white dark:border-[#0F172A] shadow-md flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bio & Details */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
                {currentUser.name}
              </h1>
              <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs font-bold text-[#FF5600] uppercase tracking-wider">{currentUser.role}</span>
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-1.5 max-w-2xl leading-relaxed">
              {currentUser.bio}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              <span className="bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[#0F172A] dark:text-gray-200 font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                {currentUser.isPro ? 'Pro Member' : 'Member'}
              </span>
              <span className="bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[#0F172A] dark:text-gray-200 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-[#FF5600]" /> {currentUser.city}
              </span>
            </div>
          </div>

          {/* Edit / Share Actions */}
          <div className="flex sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 md:flex-initial bg-gradient-to-r from-[#FF5600] to-orange-500 text-white font-bold text-xs px-4 py-2.5 rounded-full hover:from-[#E04D00] hover:to-[#FF5600] transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={handleShareProfile}
              className="flex-1 md:flex-initial bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[#0F172A] dark:text-gray-200 font-bold text-xs px-4 py-2.5 rounded-full hover:bg-white dark:hover:bg-white/10 transition-all shadow-xs flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" /> {shareCopied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Layer 1: High Level Stats & Consistency */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Total Activities Card (Span 4) */}
        <div className="lg:col-span-4 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="p-2 bg-orange-500/10 rounded-xl text-[#FF5600] border border-orange-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-[11px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Total Activities
              </h3>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">
              {currentUser.totalActivities.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              +12 logged this month
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">Total Distance</span>
              <span className="text-xs font-black text-[#0F172A] dark:text-white font-mono">
                {currentUser.totalDistanceKm.toLocaleString()} km
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-white/5">
              <div
                className="bg-gradient-to-r from-[#FF5600] to-orange-500 h-full rounded-full transition-all duration-700 shadow-xs"
                style={{
                  width: `${Math.min(100, Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100))}%`,
                }}
              />
            </div>
            <p className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-1.5 text-right">
              {Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100)}% of yearly goal ({currentUser.yearlyGoalKm.toLocaleString()} km)
            </p>
          </div>
        </div>

        {/* Last 4 Weeks Activity Matrix (Span 8) */}
        <div className="lg:col-span-8 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-white uppercase tracking-wider">Weekly Consistency</h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Multi-sport active days breakdown</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5600] shadow-xs" /> Active
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10" /> Rest
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[340px]">
              {/* Day Headers */}
              <div className="flex justify-between text-xs font-extrabold text-[#64748B] dark:text-[#94A3B8] mb-3 pl-12 pr-16">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {/* Run Row */}
                <div className="flex items-center gap-2">
                  <div className="w-10 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#FF5600]" /> Run
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[true, false, true, true, true, true, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all ${
                          active
                            ? 'bg-gradient-to-tr from-[#E04D00] to-[#FF5600] shadow-sm shadow-orange-500/40'
                            : 'bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-16 text-right font-mono text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                    2h 31m
                  </div>
                </div>

                {/* Ride Row */}
                <div className="flex items-center gap-2">
                  <div className="w-10 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-[#0059b0] dark:text-blue-400" /> Ride
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[true, true, true, true, true, false, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all ${
                          active
                            ? 'bg-gradient-to-tr from-[#00488f] to-[#0059b0] shadow-sm shadow-blue-500/40'
                            : 'bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-16 text-right font-mono text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                    3h 20m
                  </div>
                </div>

                {/* Swim Row */}
                <div className="flex items-center gap-2">
                  <div className="w-10 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Swim
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[false, false, false, false, false, false, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all ${
                          active
                            ? 'bg-gradient-to-tr from-cyan-600 to-cyan-400 shadow-sm shadow-cyan-500/40'
                            : 'bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-16 text-right font-mono text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                    0h 39m
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Stats & Clubs & Elevation Goal Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Social Stats */}
        <div className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-5 sm:p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01]">
          <h2 className="font-extrabold text-xs text-[#0F172A] dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
            <div className="p-1 rounded-lg bg-blue-500/10 text-[#007FB6] border border-blue-500/20">
              <Users className="w-3.5 h-3.5" />
            </div>
            Social Stats
          </h2>
          <div className="flex gap-8">
            <div>
              <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-0.5">Following</div>
              <div className="text-2xl font-black text-[#007FB6]">{currentUser.followingCount}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-0.5">Followers</div>
              <div className="text-2xl font-black text-[#007FB6]">{currentUser.followersCount}</div>
            </div>
          </div>
        </div>

        {/* Clubs */}
        <div className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-5 sm:p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01]">
          <h2 className="font-extrabold text-xs text-[#0F172A] dark:text-white mb-3 uppercase tracking-wider">
            Clubs ({clubs.length})
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {clubs.map((c) => (
              <div
                key={c.id}
                title={`${c.name} (${c.memberCount} members)`}
                className="w-11 h-11 rounded-2xl border border-slate-200/60 dark:border-white/10 flex items-center justify-center font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer overflow-hidden"
                style={{ backgroundColor: c.iconBg }}
              >
                {c.iconSymbol ? (
                  <Bike className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-sm font-black italic">{c.iconText}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Elevation Goal */}
        <div className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-5 sm:p-6 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.01] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="font-extrabold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">Elevation Goal</h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">{currentUser.elevationGoalName}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-[#FF5600]">
                  {currentUser.elevationGoalCurrentM.toLocaleString()}m
                </span>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]"> / {currentUser.elevationGoalTargetM.toLocaleString()}m</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/60 dark:border-white/10 relative mt-2">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF5600] to-orange-500 rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${elevationPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-right text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
            {elevationPercent}% Completed
          </div>
        </div>
      </section>

      {/* Trophy Case & Badge Collections */}
      <section className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.005]">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              Trophies & Achievements
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">Earned through verified milestones and challenges</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {trophies.map((trophy) => (
            <div
              key={trophy.id}
              onClick={() => setSelectedTrophy(trophy)}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                trophy.isLocked
                  ? 'bg-slate-50/50 dark:bg-white/5 border-slate-200/40 dark:border-white/5 opacity-50 grayscale'
                  : 'bg-white/90 dark:bg-white/5 border-slate-200/60 dark:border-white/10 hover:border-orange-500/40 shadow-xs'
              }`}
            >
              <div className="w-13 h-13 rounded-full mb-2.5 flex items-center justify-center relative shadow-inner bg-slate-900 border-2 border-[#FFD700]">
                {trophy.highlightNumber ? (
                  <span className="text-[#FFD700] font-black text-base italic">
                    {trophy.highlightNumber}
                  </span>
                ) : trophy.iconType === 'mountain' ? (
                  <Mountain className="w-5 h-5 text-[#FFD700]" />
                ) : trophy.iconType === 'fire' ? (
                  <Flame className="w-5 h-5 text-[#FF5600]" />
                ) : trophy.iconType === 'bolt' ? (
                  <Zap className="w-5 h-5 text-[#FFD700]" />
                ) : trophy.isLocked ? (
                  <Lock className="w-5 h-5 text-gray-400" />
                ) : (
                  <Trophy className="w-5 h-5 text-[#FFD700]" />
                )}

                {trophy.tag && (
                  <span className="absolute -bottom-1.5 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[#FFD700]">
                    {trophy.tag}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-xs text-[#0F172A] dark:text-white leading-tight line-clamp-2">
                {trophy.title}
              </h4>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
                {trophy.isLocked ? 'Locked' : trophy.dateEarned || 'Unlocked'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Volume Chart (Span 12) */}
      <section className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all hover:scale-[1.005]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h3 className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-white uppercase tracking-wider">Activity Volume</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Last 4 Weeks • Daily training load (km)</p>
          </div>
          <div className="flex gap-1.5 bg-slate-100/80 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/10">
            <button
              onClick={() => setActiveVolumeTab('run')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                activeVolumeTab === 'run'
                  ? 'bg-[#FF5600] text-white shadow-xs shadow-orange-500/30'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
              }`}
            >
              Run
            </button>
            <button
              onClick={() => setActiveVolumeTab('ride')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                activeVolumeTab === 'ride'
                  ? 'bg-[#0059b0] text-white shadow-xs shadow-blue-500/30'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
              }`}
            >
              Ride
            </button>
          </div>
        </div>

        {/* Interactive Volume Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-2 border-b border-slate-200/60 dark:border-white/10 pb-2">
          {activeBars.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
              <div className="relative w-full flex justify-center">
                <div
                  className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${
                    activeVolumeTab === 'run'
                      ? 'bg-gradient-to-t from-[#E04D00] to-[#FF5600] hover:brightness-110'
                      : 'bg-gradient-to-t from-[#00488f] to-[#0059b0] hover:brightness-110'
                  }`}
                  style={{ height: `${val * 1.4}px` }}
                />
                <span className="absolute -top-7 text-[10px] font-bold text-[#0F172A] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 dark:border-white/10 px-2 py-0.5 rounded-lg shadow-md">
                  {(val * 0.15).toFixed(1)} km
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-3 text-xs font-extrabold text-[#64748B] dark:text-[#94A3B8]">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </section>

      {/* Recent Activities List */}
      <section className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all">
        <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-white/10 flex justify-between items-center">
          <h2 className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-white uppercase tracking-wider">Recent Activities</h2>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold">{myActivities.length} recorded</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {myActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => onSelectActivity(act)}
              className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-all cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[#0F172A] dark:text-white border border-slate-200/60 dark:border-white/10 group-hover:border-orange-500/40 group-hover:text-[#FF5600] transition-colors shadow-xs">
                  {act.sportType === 'ride' ? (
                    <Bike className="w-5 h-5" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white group-hover:text-[#FF5600] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">{act.timestamp}</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-3">
                <div>
                  <div className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-white">
                    {formatDistance(act.distance).full}
                  </div>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">{act.avgPace}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#FF5600] transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* App Preferences & Theme Settings Card */}
      <section className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 p-6 sm:p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-xl text-[#FF5600] border border-orange-500/20">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-white uppercase tracking-wider">
              Display & App Preferences
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
              Customize your interface theme, contrast, and units of measurement
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Theme Switcher */}
          <div className="p-4 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-amber-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-white block">Theme Mode</span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] capitalize">
                  Current: {theme} mode
                </span>
              </div>
            </div>

            <div className="flex items-center bg-white dark:bg-[#0F172A] p-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-xs">
              <button
                type="button"
                id="theme-btn-light"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'bg-[#FF5600] text-white shadow-xs shadow-orange-500/30'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
                }`}
              >
                <Sun className="w-3 h-3" /> Light
              </button>
              <button
                type="button"
                id="theme-btn-dark"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-[#FF5600] text-white shadow-xs shadow-orange-500/30'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" /> Dark
              </button>
            </div>
          </div>

          {/* Unit System Switcher */}
          <div className="p-4 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#0F172A] dark:text-white block">Units of Measure</span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                {unitSystem === 'metric' ? 'Metric (KM, Meters)' : 'Imperial (Miles, Feet)'}
              </span>
            </div>

            <div className="flex items-center bg-white dark:bg-[#0F172A] p-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-xs">
              <button
                type="button"
                onClick={() => unitSystem !== 'metric' && toggleUnitSystem()}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  unitSystem === 'metric'
                    ? 'bg-[#FF5600] text-white shadow-xs shadow-orange-500/30'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
                }`}
              >
                Metric (km)
              </button>
              <button
                type="button"
                onClick={() => unitSystem !== 'imperial' && toggleUnitSystem()}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  unitSystem === 'imperial'
                    ? 'bg-[#FF5600] text-white shadow-xs shadow-orange-500/30'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
                }`}
              >
                Imperial (mi)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal with Glassmorphism */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-[#151D2A]/90 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-2xl p-6 sm:p-7 max-w-md w-full space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] dark:text-white tracking-tight">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                  Tagline / Role
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200/60 dark:border-white/10 text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#FF5600] to-orange-500 text-white hover:from-[#E04D00] hover:to-[#FF5600] shadow-md shadow-orange-500/25 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trophy Detail Modal with Glassmorphism */}
      {selectedTrophy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-[#151D2A]/90 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-2xl p-6 max-w-xs w-full text-center space-y-3.5">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-slate-900 border-2 border-[#FFD700] shadow-md">
              <Trophy className="w-8 h-8 text-[#FFD700]" />
            </div>
            <h3 className="text-base font-black text-[#0F172A] dark:text-white">{selectedTrophy.title}</h3>
            <p className="text-xs text-[#FF5600] font-bold">{selectedTrophy.subtitle}</p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">{selectedTrophy.description}</p>
            <button
              onClick={() => setSelectedTrophy(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-[#0F172A] font-bold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
