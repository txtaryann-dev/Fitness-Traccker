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
    <article className="bg-white dark:bg-[#151D2A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
      <div className="p-3.5 sm:p-4 pb-3">
        {/* Athlete Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-full overflow-hidden shrink-0 border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]">
              <img
                src={activity.userAvatar}
                alt={activity.userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white leading-tight hover:text-[#FF5600] cursor-pointer transition-colors">
                {activity.userName}
              </h3>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 mt-0.5">
                <span>{activity.timestamp}</span>
                {activity.location && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[180px]">{activity.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
            {getSportIcon(activity.sportType)}
          </div>
        </div>

        {/* Activity Title & Description */}
        <div className="mb-2.5">
          <h2
            onClick={() => onOpenSummary && onOpenSummary(activity)}
            className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-white leading-snug hover:text-[#FF5600] cursor-pointer transition-colors"
          >
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed mt-1">
              {activity.description}
            </p>
          )}
        </div>

        {/* Primary Workout Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-2 border-y border-[#F1F5F9] dark:border-[#1E293B] my-2">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">Distance</span>
            <span className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-white">
              {dist.full}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
              {activity.sportType === 'ride' ? 'Speed' : 'Pace'}
            </span>
            <span className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-white">
              {activity.avgPace}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">Time</span>
            <span className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-white">
              {formatDuration(activity.duration)}
            </span>
          </div>

          {activity.achievementsCount && activity.achievementsCount > 0 ? (
            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">Badges</span>
              <div className="flex items-center gap-1 text-[#0F172A] dark:text-white font-bold text-sm sm:text-base">
                <Trophy className="w-3.5 h-3.5 text-[#FF5600]" />
                <span>{activity.achievementsCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">Elev Gain</span>
              <span className="font-bold text-sm sm:text-base text-[#0F172A] dark:text-white">
                {activity.elevationGain}m
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Map Preview */}
      {activity.routeCoordinates && activity.routeCoordinates.length > 0 && (
        <div
          className="w-full h-48 sm:h-56 relative cursor-pointer group"
          onClick={() => onOpenSummary && onOpenSummary(activity)}
        >
          <LeafletMap
            coordinates={activity.routeCoordinates}
            interactive={false}
            height="100%"
            mapId={`feed-map-${activity.id}`}
          />
          <div className="absolute top-2.5 right-2.5 z-10 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-[#0F172A] dark:text-white shadow-xs border border-[#E2E8F0] dark:border-[#334155] opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view breakdown
          </div>
        </div>
      )}

      {/* Attached Photos if any */}
      {activity.photos && activity.photos.length > 0 && (
        <div className="px-3.5 sm:px-4 py-2">
          <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
            {activity.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt="Workout capture"
                className="w-full h-32 object-cover rounded-md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Social Actions and Kudos Counter */}
      <div className="px-3.5 sm:px-4 py-2 bg-[#FAFAFC] dark:bg-[#111827] border-t border-[#E2E8F0] dark:border-[#1E293B] flex flex-col gap-2 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {activity.likes.length > 0 ? (
              <div className="flex items-center gap-1 text-xs text-[#0F172A] dark:text-gray-200 font-medium">
                <span className="w-4.5 h-4.5 rounded-full bg-[#FF5600]/10 text-[#FF5600] flex items-center justify-center text-[10px] font-bold">
                  👍
                </span>
                <span>
                  {activity.likes.length} {activity.likes.length === 1 ? 'kudos' : 'kudos'}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Be the first to give kudos!</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Kudos Button */}
            <button
              onClick={() => toggleLike(activity.id)}
              className={`px-2.5 py-1 rounded-md border text-xs font-semibold flex items-center gap-1 transition-all ${
                hasLiked
                  ? 'bg-[#FF5600] text-white border-[#FF5600] shadow-xs'
                  : 'bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] hover:text-[#0F172A] dark:hover:text-white'
              }`}
              title="Give Kudos"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{hasLiked ? 'Kudos' : 'Give Kudos'}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`px-2.5 py-1 rounded-md border text-xs font-semibold flex items-center gap-1 transition-all ${
                showComments
                  ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-[#0F172A] dark:border-white'
                  : 'bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] hover:text-[#0F172A] dark:hover:text-white'
              }`}
              title="Comments"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{activity.comments.length}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-md border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] hover:text-[#0F172A] dark:hover:text-white transition-colors"
              title="Share workout"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Share Toast */}
        {shareToast && (
          <div className="text-[11px] text-center py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
            Activity link copied to clipboard!
          </div>
        )}

        {/* Expandable Comment Section */}
        {showComments && (
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
            {activity.comments.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activity.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 bg-white dark:bg-[#1E293B] p-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                    <img
                      src={c.userAvatar}
                      alt={c.userName}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-[#0F172A] dark:text-white">{c.userName}</span>
                        <span className="text-[9px] text-[#94A3B8]">{c.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#334155] dark:text-[#CBD5E1] mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#94A3B8] italic py-0.5">No comments yet. Start the conversation!</p>
            )}

            {/* Add Comment Input Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 text-xs bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md px-2.5 py-1.5 text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#FF5600]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-1.5 bg-[#FF5600] text-white rounded-md text-xs font-semibold hover:bg-[#E04D00] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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
