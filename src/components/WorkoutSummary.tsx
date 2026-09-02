import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Camera,
  Check,
  ChevronRight,
  Flame,
  Gauge,
  MapPin,
  Mountain,
  Play,
  RotateCcw,
  Share2,
  Timer,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import { LeafletMap } from './LeafletMap';
import { PerformanceChart } from './PerformanceChart';

interface WorkoutSummaryProps {
  activity: Activity;
  onClose: () => void;
  onShareToFeed: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  activity,
  onClose,
  onShareToFeed,
}) => {
  const { currentUser, formatDistance } = useApp();
  const [activityTitle, setActivityTitle] = useState(activity.title || 'Morning Run');
  const [shared, setShared] = useState(false);
  const [photos, setPhotos] = useState<string[]>(activity.photos || []);
  const [replayCount, setReplayCount] = useState(0);

  const dist = formatDistance(activity.distance);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddPhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    ];
    const picked = samplePhotos[photos.length % samplePhotos.length];
    setPhotos((prev) => [...prev, picked]);
  };

  const handleShare = () => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF5600', '#0059b0', '#FFD700', '#10B981'],
      });
    } catch (e) {
      // safe fallback
    }

    setShared(true);
    setTimeout(() => {
      onShareToFeed();
    }, 900);
  };

  // Sample splits if not provided
  const splits = activity.splits && activity.splits.length > 0
    ? activity.splits
    : [
        { split: 2, pace: '4:42', elevationChange: '+5m', time: '9:24' },
        { split: 5, pace: '4:45', elevationChange: '-2m', time: '14:15' },
        { split: 8, pace: '4:48', elevationChange: '+12m', time: '14:24' },
      ];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B0F17] text-[#0F172A] dark:text-gray-100 min-h-screen pb-16 md:pb-10 font-sans antialiased transition-colors">
      {/* Top App Bar with frosted pill container */}
      <header className="sticky top-0 w-full z-40 px-4 sm:px-6 pt-3 pb-2">
        <div className="flex justify-between items-center px-4 md:px-6 py-2.5 max-w-5xl mx-auto w-full bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-full shadow-lg shadow-slate-900/5 dark:shadow-black/20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title="Close summary"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-base font-black tracking-tight italic bg-gradient-to-r from-[#FF5600] to-orange-500 bg-clip-text text-transparent">
            VELOCITY
          </div>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-xs">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-4 flex flex-col gap-5 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <section className="flex flex-col gap-1.5 items-center text-center mt-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Great Job, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center gap-2">
            <span className="inline-block px-3 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-950/40 border border-orange-500/20 text-[#FF5600] font-bold text-[11px] uppercase tracking-wider">
              {activity.sportType || 'Morning Run'}
            </span>
            <span>•</span>
            <span>{activity.timestamp || 'Today, 6:30 AM'}</span>
          </p>
        </section>

        {/* Bento Layout Content */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Map Card (Span 12) */}
          <div className="md:col-span-12 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-white/10 flex flex-col h-60 sm:h-76 relative">
            <LeafletMap
              coordinates={
                activity.routeCoordinates && activity.routeCoordinates.length > 0
                  ? activity.routeCoordinates
                  : [
                      { lat: 27.7172, lng: 85.324 },
                      { lat: 27.728, lng: 85.34 },
                    ]
              }
              interactive={true}
              height="100%"
              mapId={`summary-map-${activity.id}`}
              animateRoute={true}
              animationDuration={1800}
              replayKey={replayCount}
            />
            {/* Route Stats & Replay Badge */}
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
              <div className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-white/10 shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5600] animate-pulse" />
                <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                  {dist.full} Total Route
                </span>
              </div>

              <button
                type="button"
                onClick={() => setReplayCount((c) => c + 1)}
                className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-white/10 shadow-md flex items-center gap-1.5 text-xs font-bold text-[#64748B] dark:text-[#CBD5E1] hover:text-[#FF5600] dark:hover:text-[#FF5600] transition-all hover:scale-105 active:scale-95"
                title="Replay Route Animation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            </div>
          </div>

          {/* Performance Chart Card (Span 12) */}
          <div className="md:col-span-12">
            <PerformanceChart
              data={activity.pacePoints}
              totalTimeMinutes={Math.round(activity.duration / 60)}
              avgPace={activity.avgPace}
            />
          </div>

          {/* 4 Metric Bento Grid Cards (Span 3 each on desktop, 6 on mobile) */}
          <div className="col-span-6 md:col-span-3 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-white/10 flex flex-col gap-1 transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-[#FF5600]" /> TIME
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-mono">
              {formatDuration(activity.duration)}
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-white/10 flex flex-col gap-1 transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#FF5600]" /> AVG PACE
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-mono">
              {activity.avgPace}
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-white/10 flex flex-col gap-1 transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-[#FF5600]" /> ELEV GAIN
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-mono">
              {activity.elevationGain}m
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-white/10 flex flex-col gap-1 transition-all hover:scale-[1.02]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF5600]" /> CALORIES
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-mono">
              {activity.calories}
            </span>
          </div>

          {/* Top Splits Table (Span 12) */}
          <div className="md:col-span-12 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-white/10 flex flex-col gap-3 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider">Top Splits</h3>
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Auto-split every kilometer</span>
            </div>

            <div className="w-full">
              <div className="flex justify-between text-[11px] font-extrabold text-[#64748B] dark:text-[#94A3B8] border-b border-slate-200/60 dark:border-white/10 pb-2 mb-2">
                <span>KM</span>
                <span>PACE</span>
                <span>ELEV</span>
              </div>
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
                {splits.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-xs sm:text-sm py-2 text-[#0F172A] dark:text-white">
                    <span className="font-bold">{s.split}</span>
                    <span className="font-mono font-bold text-[#0059b0] dark:text-blue-400">{s.pace}</span>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-mono">{s.elevationChange}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Gallery if any */}
          {photos.length > 0 && (
            <div className="md:col-span-12 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 border border-slate-200/60 dark:border-white/10 transition-colors">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] dark:text-white uppercase tracking-wider mb-3">Workout Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Activity media"
                    className="w-full h-32 object-cover rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-xs"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Section (Span 12) */}
          <div className="md:col-span-12 flex flex-col gap-3 mt-1">
            <input
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              placeholder="Name your activity"
              className="w-full bg-white/85 dark:bg-[#151D2A]/85 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl focus:border-[#FF5600] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-sm py-3 px-4 transition-all shadow-md focus:outline-none"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddPhoto}
                className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 text-[#0F172A] dark:text-white font-bold text-xs sm:text-sm py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-white/10 transition-all shadow-md hover:scale-[1.01] active:scale-95"
              >
                <Camera className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" /> Add Photo
              </button>

              <button
                onClick={handleShare}
                disabled={shared}
                className="bg-gradient-to-r from-[#FF5600] to-orange-500 text-white font-bold text-xs sm:text-sm py-3 rounded-2xl flex items-center justify-center gap-2 hover:from-[#E04D00] hover:to-[#FF5600] transition-all shadow-lg shadow-orange-500/25 disabled:from-emerald-600 disabled:to-emerald-500 hover:scale-[1.01] active:scale-95"
              >
                {shared ? (
                  <>
                    <Check className="w-4 h-4" /> Shared to Community Feed!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" /> Share to Feed
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
