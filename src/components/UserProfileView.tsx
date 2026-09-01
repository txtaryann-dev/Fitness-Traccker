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
  Mountain,
  Plus,
  Share2,
  ShieldCheck,
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
    <div className="space-y-5 pb-12">
      {/* Profile Header Card */}
      <section className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          {/* Avatar with Pro / Verified badge */}
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white dark:border-[#0F172A] shadow-md ring-2 ring-[#FF5600]"
            />
            <div className="absolute bottom-0.5 right-0.5 bg-[#FF5600] text-white rounded-full p-1 border border-white dark:border-[#0F172A] shadow-xs flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bio & Details */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white tracking-tight">
                {currentUser.name}
              </h1>
              <span className="hidden md:inline text-[#64748B] dark:text-[#94A3B8]">•</span>
              <span className="text-xs font-semibold text-[#FF5600]">{currentUser.role}</span>
            </div>

            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-1 max-w-2xl leading-relaxed">
              {currentUser.bio}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-2.5">
              <span className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-gray-200 font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
                {currentUser.isPro ? 'Pro Member' : 'Member'}
              </span>
              <span className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-gray-200 font-semibold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF5600]" /> {currentUser.city}
              </span>
            </div>
          </div>

          {/* Edit / Share Actions */}
          <div className="flex sm:flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 md:flex-initial bg-[#FF5600] text-white font-bold text-xs px-3.5 py-2 rounded-lg hover:bg-[#E04D00] transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={handleShareProfile}
              className="flex-1 md:flex-initial bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-gray-200 font-semibold text-xs px-3.5 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" /> {shareCopied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Layer 1: High Level Stats & Consistency */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Total Activities Card (Span 4) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4 sm:p-5 shadow-xs transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#FF5600]/10 rounded-md text-[#FF5600]">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Total Activities
              </h3>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight">
              {currentUser.totalActivities.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              +12 logged this month
            </p>
          </div>

          <div className="pt-3.5 border-t border-[#F1F5F9] dark:border-[#1E293B] mt-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Total Distance</span>
              <span className="text-[11px] font-bold text-[#0F172A] dark:text-white font-mono">
                {currentUser.totalDistanceKm.toLocaleString()} km
              </span>
            </div>
            <div className="w-full bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#FF5600] h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100))}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1 text-right">
              {Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100)}% of yearly goal ({currentUser.yearlyGoalKm.toLocaleString()} km)
            </p>
          </div>
        </div>

        {/* Last 4 Weeks Activity Matrix (Span 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 sm:p-5 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white uppercase tracking-wider">Weekly Consistency</h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Multi-sport active days breakdown</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF5600]" /> Active
              </span>
              <span className="flex items-center gap-1 text-[#94A3B8]">
                <span className="w-2 h-2 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]" /> Rest
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[340px]">
              {/* Day Headers */}
              <div className="flex justify-between text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] mb-2 pl-12 pr-16">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>

              {/* Rows */}
              <div className="space-y-2.5">
                {/* Run Row */}
                <div className="flex items-center gap-2">
                  <div className="w-9 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#FF5600]" /> Run
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[true, false, true, true, true, true, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          active
                            ? 'bg-[#FF5600] shadow-xs'
                            : 'bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-14 text-right font-mono text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                    2h 31m
                  </div>
                </div>

                {/* Ride Row */}
                <div className="flex items-center gap-2">
                  <div className="w-9 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1">
                    <Bike className="w-3 h-3 text-[#0059b0] dark:text-blue-400" /> Ride
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[true, true, true, true, true, false, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          active
                            ? 'bg-[#0059b0] dark:bg-blue-500 shadow-xs'
                            : 'bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-14 text-right font-mono text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                    3h 20m
                  </div>
                </div>

                {/* Swim Row */}
                <div className="flex items-center gap-2">
                  <div className="w-9 text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1">
                    <Waves className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> Swim
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[false, false, false, false, false, false, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          active
                            ? 'bg-cyan-600 dark:bg-cyan-500 shadow-xs'
                            : 'bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-14 text-right font-mono text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
                    0h 39m
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Stats & Clubs & Elevation Goal Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Social Stats */}
        <div className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 shadow-xs transition-colors">
          <h2 className="font-bold text-xs text-[#0F172A] dark:text-white mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#007FB6]" /> Social Stats
          </h2>
          <div className="flex gap-6">
            <div>
              <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-0.5">Following</div>
              <div className="text-2xl font-black text-[#007FB6]">{currentUser.followingCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-0.5">Followers</div>
              <div className="text-2xl font-black text-[#007FB6]">{currentUser.followersCount}</div>
            </div>
          </div>
        </div>

        {/* Clubs */}
        <div className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 shadow-xs transition-colors">
          <h2 className="font-bold text-xs text-[#0F172A] dark:text-white mb-2.5 uppercase tracking-wider">Clubs ({clubs.length})</h2>
          <div className="flex flex-wrap gap-2">
            {clubs.map((c) => (
              <div
                key={c.id}
                title={`${c.name} (${c.memberCount} members)`}
                className="w-10 h-10 rounded-lg border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-center font-bold text-white shadow-xs hover:scale-105 transition-transform cursor-pointer overflow-hidden"
                style={{ backgroundColor: c.iconBg }}
              >
                {c.iconSymbol ? (
                  <Bike className="w-4.5 h-4.5 text-white" />
                ) : (
                  <span className="text-sm italic">{c.iconText}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Elevation Goal */}
        <div className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 shadow-xs transition-colors flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <h2 className="font-bold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">Elevation Goal</h2>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{currentUser.elevationGoalName}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#FF5600]">
                  {currentUser.elevationGoalCurrentM.toLocaleString()}m
                </span>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]"> / {currentUser.elevationGoalTargetM.toLocaleString()}m</span>
              </div>
            </div>

            <div className="w-full h-2 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-full overflow-hidden border border-[#E2E8F0] dark:border-[#334155] relative mt-2">
              <div
                className="absolute top-0 left-0 h-full bg-[#FF5600] rounded-full transition-all duration-700"
                style={{ width: `${elevationPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-1 text-right text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
            {elevationPercent}% Completed
          </div>
        </div>
      </section>

      {/* Trophy Case & Badge Collections */}
      <section className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" /> Trophies & Achievements
            </h2>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Earned through verified milestones and challenges</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {trophies.map((trophy) => (
            <div
              key={trophy.id}
              onClick={() => setSelectedTrophy(trophy)}
              className={`p-3 rounded-lg border flex flex-col items-center text-center cursor-pointer transition-all hover:scale-102 ${
                trophy.isLocked
                  ? 'bg-[#F8FAFC] dark:bg-[#1E293B]/40 border-[#E2E8F0] dark:border-[#1E293B] opacity-50 grayscale'
                  : 'bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] hover:border-[#FF5600] hover:shadow-xs'
              }`}
            >
              <div className="w-12 h-12 rounded-full mb-2 flex items-center justify-center relative shadow-inner bg-[#2A312B] border-2 border-[#FFD700]">
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
                  <span className="absolute -bottom-1.5 bg-[#2A312B] text-white text-[8px] font-bold px-1 py-0.2 rounded-full border border-[#FFD700]">
                    {trophy.tag}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-[11px] text-[#0F172A] dark:text-white leading-tight line-clamp-2">
                {trophy.title}
              </h4>
              <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {trophy.isLocked ? 'Locked' : trophy.dateEarned || 'Unlocked'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Volume Chart (Span 12) */}
      <section className="bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white uppercase tracking-wider">Activity Volume</h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Last 4 Weeks • Daily training load (km)</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveVolumeTab('run')}
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                activeVolumeTab === 'run'
                  ? 'bg-[#FF5600] text-white'
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]'
              }`}
            >
              Run
            </button>
            <button
              onClick={() => setActiveVolumeTab('ride')}
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                activeVolumeTab === 'ride'
                  ? 'bg-[#0059b0] text-white'
                  : 'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]'
              }`}
            >
              Ride
            </button>
          </div>
        </div>

        {/* Interactive Volume Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-2">
          {activeBars.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
              <div className="relative w-full flex justify-center">
                <div
                  className={`w-full max-w-[36px] rounded-t transition-all duration-300 ${
                    activeVolumeTab === 'run'
                      ? 'bg-[#FF5600] hover:bg-[#E04D00]'
                      : 'bg-[#0059b0] hover:bg-[#00488f]'
                  }`}
                  style={{ height: `${val * 1.4}px` }}
                />
                <span className="absolute -top-6 text-[9px] font-bold text-[#0F172A] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] px-1 py-0.5 rounded shadow-xs">
                  {(val * 0.15).toFixed(1)} km
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8]">
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
      <section className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] overflow-hidden shadow-xs transition-colors">
        <div className="p-3.5 sm:p-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex justify-between items-center">
          <h2 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white uppercase tracking-wider">Recent Activities</h2>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">{myActivities.length} recorded</span>
        </div>

        <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
          {myActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => onSelectActivity(act)}
              className="p-3 sm:p-3.5 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-full bg-[#F8FAFC] dark:bg-[#1E293B] flex items-center justify-center text-[#0F172A] dark:text-white border border-[#E2E8F0] dark:border-[#334155] group-hover:border-[#FF5600] group-hover:text-[#FF5600] transition-colors">
                  {act.sportType === 'ride' ? (
                    <Bike className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white group-hover:text-[#FF5600] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{act.timestamp}</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2.5">
                <div>
                  <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white">
                    {formatDistance(act.distance).full}
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">{act.avgPace}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl p-5 max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                  Tagline / Role
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-md bg-[#FF5600] text-white hover:bg-[#E04D00]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trophy Detail Modal */}
      {selectedTrophy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl p-5 max-w-xs w-full text-center space-y-3">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[#2A312B] border-2 border-[#FFD700] shadow-md">
              <Trophy className="w-8 h-8 text-[#FFD700]" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">{selectedTrophy.title}</h3>
            <p className="text-[11px] text-[#FF5600] font-semibold">{selectedTrophy.subtitle}</p>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{selectedTrophy.description}</p>
            <button
              onClick={() => setSelectedTrophy(null)}
              className="w-full py-2 bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-bold rounded-md text-xs hover:bg-[#1E293B] dark:hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
