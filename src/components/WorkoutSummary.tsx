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
    <div className="bg-[#f8f9ff] text-[#191c20] min-h-screen pb-20 md:pb-12 font-sans antialiased">
      {/* Top App Bar */}
      <header className="bg-white/80 sticky top-0 w-full z-40 backdrop-blur-xl border-b border-[#E2E8F0] shadow-sm">
        <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-7xl mx-auto w-full">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#191c20] hover:bg-[#F1F5F9] transition-colors"
            title="Close summary"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-xl font-black tracking-tight italic text-[#FF5600]">
            VELOCITY
          </div>

          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0]">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <section className="flex flex-col gap-2 items-center text-center mt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#191c20] tracking-tight">
            Great Job, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-sm md:text-base text-[#64748B] flex items-center justify-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FF5600]/10 text-[#FF5600] font-semibold text-xs uppercase tracking-wider">
              {activity.sportType || 'Morning Run'}
            </span>
            <span>•</span>
            <span>{activity.timestamp || 'Today, 6:30 AM'}</span>
          </p>
        </section>

        {/* Bento Layout Content */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Map Card (Span 12) */}
          <div className="md:col-span-12 bg-white rounded-xl overflow-hidden shadow-sm border border-[#E2E8F0] flex flex-col h-72 md:h-96 relative">
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
            <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-[#E2E8F0] shadow-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5600]" />
              <span className="text-xs font-bold text-[#0F172A]">
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
          <div className="col-span-6 md:col-span-3 bg-white p-5 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-[#FF5600]" /> TIME
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-[#0F172A]">
              {formatDuration(activity.duration)}
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white p-5 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#FF5600]" /> AVG PACE
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-[#0F172A]">
              {activity.avgPace}
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white p-5 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-[#FF5600]" /> ELEV GAIN
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-[#0F172A]">
              {activity.elevationGain}m
            </span>
          </div>

          <div className="col-span-6 md:col-span-3 bg-white p-5 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FF5600]" /> CALORIES
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-[#0F172A]">
              {activity.calories}
            </span>
          </div>

          {/* Top Splits Table (Span 12) */}
          <div className="md:col-span-12 bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#0F172A]">Top Splits</h3>
              <span className="text-xs text-[#64748B]">Auto-split every kilometer</span>
            </div>

            <div className="w-full">
              <div className="flex justify-between text-xs font-bold text-[#64748B] border-b border-[#E2E8F0] pb-2 mb-2">
                <span>KM</span>
                <span>PACE</span>
                <span>ELEV</span>
              </div>
              <div className="flex flex-col divide-y divide-[#F1F5F9]">
                {splits.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-2.5 text-[#0F172A]">
                    <span className="font-semibold">{s.split}</span>
                    <span className="font-mono">{s.pace}</span>
                    <span className="text-[#64748B] font-mono">{s.elevationChange}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Gallery if any */}
          {photos.length > 0 && (
            <div className="md:col-span-12 bg-white p-6 rounded-xl shadow-sm border border-[#E2E8F0]">
              <h3 className="text-lg font-bold text-[#0F172A] mb-3">Workout Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Activity media"
                    className="w-full h-36 object-cover rounded-lg border border-[#E2E8F0]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Section (Span 12) */}
          <div className="md:col-span-12 flex flex-col gap-4 mt-2">
            <input
              type="text"
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              placeholder="Name your activity"
              className="w-full bg-white border border-[#E2E8F0] rounded-lg focus:border-[#FF5600] focus:ring-1 focus:ring-[#FF5600] text-[#0F172A] placeholder:text-[#94A3B8] text-base py-3.5 px-4 transition-colors shadow-sm"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddPhoto}
                className="bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-sm py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#F8FAFC] transition-colors shadow-sm"
              >
                <Camera className="w-5 h-5 text-[#64748B]" /> Add Photo
              </button>

              <button
                onClick={handleShare}
                disabled={shared}
                className="bg-[#FF5600] text-white font-bold text-sm py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#E04D00] transition-colors shadow-md disabled:bg-emerald-600"
              >
                {shared ? (
                  <>
                    <Check className="w-5 h-5" /> Shared to Community Feed!
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" /> Share to Feed
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
