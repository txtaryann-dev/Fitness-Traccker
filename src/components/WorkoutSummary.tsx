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
    <div className="bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-gray-100 min-h-screen pb-16 md:pb-10 font-sans antialiased transition-colors">
      {/* Top App Bar */}
      <header className="bg-white/90 dark:bg-[#0F172A]/90 sticky top-0 w-full z-40 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B] shadow-xs transition-colors">
        <div className="flex justify-between items-center px-4 md:px-6 py-2.5 max-w-5xl mx-auto w-full">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#0F172A] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
            title="Close summary"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          <div className="text-base font-black tracking-tight italic text-[#FF5600]">
            VELOCITY
          </div>

          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E2E8F0] dark:border-[#334155]">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-4 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <section className="flex flex-col gap-1 items-center text-center mt-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Great Job, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center gap-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FF5600]/10 text-[#FF5600] font-semibold text-[10px] uppercase tracking-wider">
              {activity.sportType || 'Morning Run'}
            </span>
            <span>•</span>
            <span>{activity.timestamp || 'Today, 6:30 AM'}</span>
          </p>
        </section>

        {/* Bento Layout Content */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Map Card (Span 12) */}
          <div className="md:col-span-12 bg-white dark:bg-[#151D2A] rounded-xl overflow-hidden shadow-xs border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col h-56 sm:h-72 relative">
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
            />
            <div className="absolute top-3 left-3 z-10 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF5600]" />
              <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">
                {dist.full} Total Route
              </span>
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
          <div className="col-span-6 md:col-span-3 bg-white dark:bg-[#151D2A] p-3.5 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-0.5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-[#FF5600]" /> TIME
            </span>
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
              {formatDuration(activity.duration)}
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white dark:bg-[#151D2A] p-3.5 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-0.5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#FF5600]" /> AVG PACE
            </span>
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
              {activity.avgPace}
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white dark:bg-[#151D2A] p-3.5 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-0.5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-[#FF5600]" /> ELEV GAIN
            </span>
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
              {activity.elevationGain}m
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white dark:bg-[#151D2A] p-3.5 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-0.5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FF5600]" /> CALORIES
            </span>
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
              {activity.calories}
            </span>
          </div>

          {/* Top Splits Table (Span 12) */}
          <div className="md:col-span-12 bg-white dark:bg-[#151D2A] p-4 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-2.5 transition-colors">
            <div className="flex justify-between items-center">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Top Splits</h3>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Auto-split every kilometer</span>
            </div>

            <div className="w-full">
              <div className="flex justify-between text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] border-b border-[#E2E8F0] dark:border-[#1E293B] pb-1.5 mb-1.5">
                <span>KM</span>
                <span>PACE</span>
                <span>ELEV</span>
              </div>
              <div className="flex flex-col divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                {splits.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1.5 text-[#0F172A] dark:text-white">
                    <span className="font-semibold">{s.split}</span>
                    <span className="font-mono">{s.pace}</span>
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-mono">{s.elevationChange}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Gallery if any */}
          {photos.length > 0 && (
            <div className="md:col-span-12 bg-white dark:bg-[#151D2A] p-4 rounded-xl shadow-xs border border-[#E2E8F0] dark:border-[#1E293B] transition-colors">
              <h3 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider mb-2.5">Workout Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Activity media"
                    className="w-full h-28 object-cover rounded-lg border border-[#E2E8F0] dark:border-[#334155]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Section (Span 12) */}
          <div className="md:col-span-12 flex flex-col gap-2.5 mt-1">
            <input
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              placeholder="Name your activity"
              className="w-full bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg focus:border-[#FF5600] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] text-xs sm:text-sm py-2.5 px-3 transition-colors shadow-xs"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleAddPhoto}
                className="bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#334155] text-[#0F172A] dark:text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" /> Add Photo
              </button>

              <button
                onClick={handleShare}
                disabled={shared}
                className="bg-[#FF5600] text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#E04D00] transition-colors shadow-xs disabled:bg-emerald-600"
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
