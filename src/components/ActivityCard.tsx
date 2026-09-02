import React, { useState } from 'react';
import {
  Bike,
  Flame,
  Heart,
  MapPin,
  MessageCircle,
  Mountain,
  PersonStanding,
  Send,
  Share2,
  ThumbsUp,
  Timer,
  Trophy,
  Waves,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity, SportType } from '../types';
import { LeafletMap } from './LeafletMap';

interface ActivityCardProps {
  activity: Activity;
  onOpenSummary?: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onOpenSummary }) => {
  const { currentUser, toggleLike, addComment, formatDistance } = useApp();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shareToast, setShareToast] = useState(false);

  const hasLiked = activity.likes.includes(currentUser.id);
  const dist = formatDistance(activity.distance);

  const getSportIcon = (type: SportType) => {
    switch (type) {
      case 'ride':
        return <Bike className="w-4 h-4 text-[#0F172A] dark:text-white" />;
      case 'walk':
      case 'hike':
        return <PersonStanding className="w-4 h-4 text-[#0F172A] dark:text-white" />;
      case 'swim':
        return <Waves className="w-4 h-4 text-[#0F172A] dark:text-white" />;
      case 'run':
      default:
        return <Zap className="w-4 h-4 text-[#0F172A] dark:text-white" />;
    }
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds > 0 ? `${seconds}s` : ''}`;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(activity.id, commentText);
    setCommentText('');
    setShowComments(true);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <article className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-orange-500/5 hover:scale-[1.008] transition-all duration-300">
      <div className="p-5 sm:p-6 pb-4">
        {/* Athlete Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm ring-1 ring-orange-500/20">
              <img
                src={activity.userAvatar}
                alt={activity.userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-white leading-tight hover:text-[#FF5600] cursor-pointer transition-colors">
                {activity.userName}
              </h3>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5 mt-0.5 font-medium">
                <span>{activity.timestamp}</span>
                {activity.location && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="truncate max-w-[200px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF5600] shrink-0" />
                      {activity.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-2 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 shadow-xs">
            {getSportIcon(activity.sportType)}
          </div>
        </div>

        {/* Activity Title & Description */}
        <div className="mb-3.5">
          <h2
            onClick={() => onOpenSummary && onOpenSummary(activity)}
            className="font-extrabold text-base sm:text-lg text-[#0F172A] dark:text-white leading-snug hover:text-[#FF5600] cursor-pointer transition-colors"
          >
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed mt-1.5 font-normal">
              {activity.description}
            </p>
          )}
        </div>

        {/* Primary Workout Stats Grid with Rounded-2xl inner containers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-3.5 bg-slate-50/70 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5 my-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Distance
            </span>
            <span className="font-black text-base sm:text-lg text-[#0F172A] dark:text-white font-mono tracking-tight mt-0.5">
              {dist.full}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              {activity.sportType === 'ride' ? 'Speed' : 'Avg Pace'}
            </span>
            <span className="font-black text-base sm:text-lg text-[#0F172A] dark:text-white font-mono tracking-tight mt-0.5">
              {activity.avgPace}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Duration
            </span>
            <span className="font-black text-base sm:text-lg text-[#0F172A] dark:text-white font-mono tracking-tight mt-0.5">
              {formatDuration(activity.duration)}
            </span>
          </div>

          {activity.achievementsCount && activity.achievementsCount > 0 ? (
            <div className="flex flex-col sm:items-end">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Badges
              </span>
              <div className="flex items-center gap-1.5 text-[#0F172A] dark:text-white font-black text-base sm:text-lg mt-0.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{activity.achievementsCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:items-end">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Elev Gain
              </span>
              <span className="font-black text-base sm:text-lg text-[#0F172A] dark:text-white font-mono tracking-tight mt-0.5">
                {activity.elevationGain}m
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Map Preview */}
      {activity.routeCoordinates && activity.routeCoordinates.length > 0 && (
        <div
          className="w-full h-52 sm:h-64 relative cursor-pointer group px-5 sm:px-6"
          onClick={() => onOpenSummary && onOpenSummary(activity)}
        >
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 relative shadow-inner">
            <LeafletMap
              coordinates={activity.routeCoordinates}
              interactive={false}
              height="100%"
              mapId={`feed-map-${activity.id}`}
            />
            <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#0F172A] dark:text-white shadow-md border border-slate-200/60 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to view breakdown & replay
            </div>
          </div>
        </div>
      )}

      {/* Attached Photos if any */}
      {activity.photos && activity.photos.length > 0 && (
        <div className="px-5 sm:px-6 py-3">
          <div className="grid grid-cols-2 gap-2.5 rounded-2xl overflow-hidden">
            {activity.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt="Workout capture"
                className="w-full h-36 object-cover rounded-xl border border-slate-200/50 dark:border-white/10 shadow-xs"
              />
            ))}
          </div>
        </div>
      )}

      {/* Social Actions and Kudos Counter */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-200/50 dark:border-white/5 flex flex-col gap-2.5 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activity.likes.length > 0 ? (
              <div className="flex items-center gap-1.5 text-xs text-[#0F172A] dark:text-gray-200 font-semibold">
                <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF5600] to-orange-400 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  👍
                </span>
                <span>
                  {activity.likes.length} {activity.likes.length === 1 ? 'kudos' : 'kudos'}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Give the first kudos!</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Kudos Button */}
            <button
              onClick={() => toggleLike(activity.id)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 active:scale-95 ${
                hasLiked
                  ? 'bg-gradient-to-r from-[#FF5600] to-orange-500 text-white border-transparent shadow-orange-500/25'
                  : 'bg-white/80 dark:bg-white/5 text-[#64748B] dark:text-[#CBD5E1] border-slate-200/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white'
              }`}
              title="Give Kudos"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{hasLiked ? 'Kudos' : 'Give Kudos'}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:scale-105 active:scale-95 ${
                showComments
                  ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-transparent'
                  : 'bg-white/80 dark:bg-white/5 text-[#64748B] dark:text-[#CBD5E1] border-slate-200/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white'
              }`}
              title="Comments"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{activity.comments.length}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#64748B] dark:text-[#CBD5E1] hover:bg-white dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white transition-all shadow-xs hover:scale-105 active:scale-95"
              title="Share workout"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Share Toast */}
        {shareToast && (
          <div className="text-[11px] text-center py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800 font-medium">
            Activity link copied to clipboard!
          </div>
        )}

        {/* Expandable Comment Section */}
        {showComments && (
          <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 space-y-2.5">
            {activity.comments.length > 0 ? (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {activity.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 bg-white/80 dark:bg-white/5 p-2.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                    <img
                      src={c.userAvatar}
                      alt={c.userName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200/60 dark:border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0F172A] dark:text-white">{c.userName}</span>
                        <span className="text-[9px] text-[#94A3B8] font-medium">{c.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#334155] dark:text-[#CBD5E1] mt-0.5 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#94A3B8] italic py-0.5 text-center">No comments yet. Start the conversation!</p>
            )}

            {/* Add Comment Input Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 text-xs bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-full px-4 py-2 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#FF5600] transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#FF5600] to-orange-500 text-white rounded-full text-xs font-bold hover:from-[#E04D00] hover:to-[#FF5600] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};
