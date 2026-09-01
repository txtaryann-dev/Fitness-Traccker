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
    <div className="space-y-8 pb-16">
      {/* Profile Header Card */}
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Pro / Verified badge */}
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-[#FF5600]"
            />
            <div className="absolute bottom-1 right-1 bg-[#FF5600] text-white rounded-full p-1.5 border-2 border-white shadow-sm flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Bio & Details */}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                {currentUser.name}
              </h1>
              <span className="hidden md:inline text-[#64748B]">•</span>
              <span className="text-sm font-semibold text-[#FF5600]">{currentUser.role}</span>
            </div>

            <p className="text-sm md:text-base text-[#64748B] mt-2 max-w-2xl leading-relaxed">
              {currentUser.bio}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <span className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs px-3 py-1 rounded-full">
                {currentUser.isPro ? 'Pro Member' : 'Member'}
              </span>
              <span className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-semibold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF5600]" /> {currentUser.city}
              </span>
            </div>
          </div>

          {/* Edit / Share Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#FF5600] text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-[#E04D00] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
            <button
              onClick={handleShareProfile}
              className="bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-sm px-6 py-3 rounded-lg hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-[#64748B]" /> {shareCopied ? 'Link Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Layer 1: High Level Stats & Last 4 Weeks Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Total Activities Card (Span 4) */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-[#FF5600]/10 rounded-lg text-[#FF5600]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-[#64748B] uppercase tracking-widest">
                Total Activities
              </h3>
            </div>
            <p className="text-4xl md:text-5xl font-black text-[#0F172A] tracking-tight">
              {currentUser.totalActivities.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-emerald-600 mt-2 flex items-center gap-1">
              +12 logged this month
            </p>
          </div>

          <div className="pt-6 border-t border-[#F1F5F9] mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748B]">Total Distance</span>
              <span className="text-xs font-bold text-[#0F172A] font-mono">
                {currentUser.totalDistanceKm.toLocaleString()} km
              </span>
            </div>
            <div className="w-full bg-[#E2E8F0] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#FF5600] h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100))}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5 text-right">
              {Math.round((currentUser.totalDistanceKm / currentUser.yearlyGoalKm) * 100)}% of yearly goal ({currentUser.yearlyGoalKm.toLocaleString()} km)
            </p>
          </div>
        </div>

        {/* Last 4 Weeks Activity Matrix (Span 8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-lg text-[#0F172A]">Last 4 Weeks Consistency</h3>
              <p className="text-xs text-[#64748B]">Weekly multi-sport active days breakdown</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5600]" /> Active
              </span>
              <span className="flex items-center gap-1.5 text-[#94A3B8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F1F5F9] border border-[#E2E8F0]" /> Rest
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[420px]">
              {/* Day Headers */}
              <div className="flex justify-between text-xs font-bold text-[#64748B] mb-3 pl-14 pr-20">
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>
              </div>

              {/* Rows */}
              <div className="space-y-4">
                {/* Run Row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 text-xs font-bold text-[#0F172A] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#FF5600]" /> Run
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[true, false, true, true, true, true, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all ${
                          active
                            ? 'bg-[#FF5600] shadow-sm scale-105'
                            : 'bg-[#F8FAFC] border border-[#E2E8F0]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-16 text-right font-mono text-xs font-bold text-[#64748B]">
                    2h 31m
                  </div>
                </div>

                {/* Ride Row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 text-xs font-bold text-[#0F172A] flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5 text-[#0059b0]" /> Ride
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[true, true, true, true, true, false, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all ${
                          active
                            ? 'bg-[#0059b0] shadow-sm scale-105'
                            : 'bg-[#F8FAFC] border border-[#E2E8F0]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-16 text-right font-mono text-xs font-bold text-[#64748B]">
                    3h 20m
                  </div>
                </div>

                {/* Swim Row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 text-xs font-bold text-[#0F172A] flex items-center gap-1">
                    <Waves className="w-3.5 h-3.5 text-cyan-600" /> Swim
                  </div>
                  <div className="flex-1 flex justify-between px-2">
                    {[false, false, false, false, false, false, true].map((active, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all ${
                          active
                            ? 'bg-cyan-600 shadow-sm scale-105'
                            : 'bg-[#F8FAFC] border border-[#E2E8F0]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="w-16 text-right font-mono text-xs font-bold text-[#64748B]">
                    0h 39m
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Stats & Clubs & Elevation Goal Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Social Stats */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all">
          <h2 className="font-bold text-lg text-[#0F172A] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#007FB6]" /> Social Stats
          </h2>
          <div className="flex gap-8">
            <div>
              <div className="text-xs font-semibold text-[#64748B] mb-1">Following</div>
              <div className="text-3xl font-extrabold text-[#007FB6]">{currentUser.followingCount}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#64748B] mb-1">Followers</div>
              <div className="text-3xl font-extrabold text-[#007FB6]">{currentUser.followersCount}</div>
            </div>
          </div>
        </div>

        {/* Clubs */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all">
          <h2 className="font-bold text-lg text-[#0F172A] mb-4">Clubs ({clubs.length})</h2>
          <div className="flex flex-wrap gap-3">
            {clubs.map((c) => (
              <div
                key={c.id}
                title={`${c.name} (${c.memberCount} members)`}
                className="w-14 h-14 rounded-xl border border-[#E2E8F0] flex items-center justify-center font-bold text-white shadow-sm hover:scale-105 transition-transform cursor-pointer overflow-hidden"
                style={{ backgroundColor: c.iconBg }}
              >
                {c.iconSymbol ? (
                  <Bike className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-lg italic">{c.iconText}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Elevation Goal */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="font-bold text-lg text-[#0F172A]">Elevation Goal</h2>
                <p className="text-xs text-[#64748B]">{currentUser.elevationGoalName}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-[#FF5600]">
                  {currentUser.elevationGoalCurrentM.toLocaleString()}m
                </span>
                <span className="text-xs text-[#64748B]"> / {currentUser.elevationGoalTargetM.toLocaleString()}m</span>
              </div>
            </div>

            <div className="w-full h-3.5 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E2E8F0] relative mt-3">
              <div
                className="absolute top-0 left-0 h-full bg-[#FF5600] rounded-full transition-all duration-700"
                style={{ width: `${elevationPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-2 text-right text-xs font-semibold text-[#64748B]">
            {elevationPercent}% Completed
          </div>
        </div>
      </section>

      {/* Trophy Case & Badge Collections */}
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-6 md:p-8 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FFD700]" /> Trophies & Achievements
            </h2>
            <p className="text-xs text-[#64748B]">Earned through verified milestones and challenges</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {trophies.map((trophy) => (
            <div
              key={trophy.id}
              onClick={() => setSelectedTrophy(trophy)}
              className={`p-4 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105 ${
                trophy.isLocked
                  ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-50 grayscale'
                  : 'bg-white border-[#E2E8F0] hover:border-[#FF5600] hover:shadow-md'
              }`}
            >
              <div className="w-16 h-16 rounded-full mb-3 flex items-center justify-center relative shadow-inner bg-[#2A312B] border-2 border-[#FFD700]">
                {trophy.highlightNumber ? (
                  <span className="text-[#FFD700] font-black text-xl italic">
                    {trophy.highlightNumber}
                  </span>
                ) : trophy.iconType === 'mountain' ? (
                  <Mountain className="w-7 h-7 text-[#FFD700]" />
                ) : trophy.iconType === 'fire' ? (
                  <Flame className="w-7 h-7 text-[#FF5600]" />
                ) : trophy.iconType === 'bolt' ? (
                  <Zap className="w-7 h-7 text-[#FFD700]" />
                ) : trophy.isLocked ? (
                  <Lock className="w-7 h-7 text-gray-400" />
                ) : (
                  <Trophy className="w-7 h-7 text-[#FFD700]" />
                )}

                {trophy.tag && (
                  <span className="absolute -bottom-2 bg-[#2A312B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#FFD700]">
                    {trophy.tag}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-xs text-[#0F172A] leading-tight line-clamp-2">
                {trophy.title}
              </h4>
              <span className="text-[10px] text-[#64748B] mt-1">
                {trophy.isLocked ? 'Locked' : trophy.dateEarned || 'Unlocked'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Activity Volume Chart (Span 12) */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h3 className="font-bold text-xl text-[#0F172A] mb-1">Activity Volume</h3>
            <p className="text-sm text-[#64748B]">Last 4 Weeks • Daily training load (km)</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveVolumeTab('run')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                activeVolumeTab === 'run'
                  ? 'bg-[#FF5600] text-white'
                  : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
              }`}
            >
              Run
            </button>
            <button
              onClick={() => setActiveVolumeTab('ride')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                activeVolumeTab === 'ride'
                  ? 'bg-[#0059b0] text-white'
                  : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
              }`}
            >
              Ride
            </button>
          </div>
        </div>

        {/* Interactive Volume Bar Chart */}
        <div className="h-60 flex items-end justify-between gap-3 border-b border-[#E2E8F0] pb-2">
          {activeBars.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="relative w-full flex justify-center">
                <div
                  className={`w-full max-w-[48px] rounded-t transition-all duration-300 ${
                    activeVolumeTab === 'run'
                      ? 'bg-[#FF5600] hover:bg-[#E04D00]'
                      : 'bg-[#0059b0] hover:bg-[#00488f]'
                  }`}
                  style={{ height: `${val * 2}px` }}
                />
                <span className="absolute -top-7 text-[10px] font-bold text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded shadow-sm">
                  {(val * 0.15).toFixed(1)} km
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-3 text-xs font-bold text-[#64748B]">
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
      <section className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center">
          <h2 className="font-bold text-xl text-[#0F172A]">Recent Activities</h2>
          <span className="text-xs text-[#64748B] font-semibold">{myActivities.length} recorded</span>
        </div>

        <div className="divide-y divide-[#E2E8F0]">
          {myActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => onSelectActivity(act)}
              className="p-5 md:p-6 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#0F172A] border border-[#E2E8F0] group-hover:border-[#FF5600] group-hover:text-[#FF5600] transition-colors">
                  {act.sportType === 'ride' ? (
                    <Bike className="w-5 h-5" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-[#0F172A] group-hover:text-[#FF5600] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">{act.timestamp}</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-3">
                <div>
                  <div className="font-bold text-sm md:text-base text-[#0F172A]">
                    {formatDistance(act.distance).full}
                  </div>
                  <div className="text-xs text-[#64748B] font-mono">{act.avgPace}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 md:p-8 max-w-md w-full space-y-5 animate-in fade-in zoom-in duration-150">
            <h2 className="text-xl font-bold text-[#0F172A]">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF5600]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  Tagline / Role
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF5600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF5600]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF5600]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold rounded-lg bg-[#FF5600] text-white hover:bg-[#E04D00]"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-[#2A312B] border-4 border-[#FFD700] shadow-lg">
              <Trophy className="w-10 h-10 text-[#FFD700]" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">{selectedTrophy.title}</h3>
            <p className="text-xs text-[#FF5600] font-semibold">{selectedTrophy.subtitle}</p>
            <p className="text-sm text-[#64748B]">{selectedTrophy.description}</p>
            <button
              onClick={() => setSelectedTrophy(null)}
              className="w-full py-2.5 bg-[#0F172A] text-white font-bold rounded-lg text-sm hover:bg-[#1E293B]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
