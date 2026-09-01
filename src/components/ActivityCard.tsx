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
        return <Bike className="w-5 h-5 text-[#0F172A]" />;
      case 'walk':
      case 'hike':
        return <PersonStanding className="w-5 h-5 text-[#0F172A]" />;
      case 'swim':
        return <Waves className="w-5 h-5 text-[#0F172A]" />;
      case 'run':
      default:
        return <Zap className="w-5 h-5 text-[#0F172A]" />;
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
    <article className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all duration-200">
      <div className="p-4 md:p-6 pb-4">
        {/* Athlete Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#E2E8F0] bg-[#F8FAFC]">
              <img
                src={activity.userAvatar}
                alt={activity.userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#0F172A] leading-tight hover:text-[#FF5600] cursor-pointer transition-colors">
                {activity.userName}
              </h3>
              <div className="text-[12px] text-[#64748B] flex items-center gap-1 mt-0.5">
                <span>{activity.timestamp}</span>
                {activity.location && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{activity.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            {getSportIcon(activity.sportType)}
          </div>
        </div>

        {/* Activity Title & Description */}
        <div className="mb-4">
          <h2
            onClick={() => onOpenSummary && onOpenSummary(activity)}
            className="font-bold text-[20px] text-[#0F172A] leading-snug mb-1 hover:text-[#FF5600] cursor-pointer transition-colors"
          >
            {activity.title}
          </h2>
          {activity.description && (
            <p className="text-[14px] text-[#334155] leading-relaxed">
              {activity.description}
            </p>
          )}
        </div>

        {/* Primary Workout Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-[#F1F5F9] my-3">
          <div className="flex flex-col">
            <span className="text-[12px] text-[#64748B] font-medium">Distance</span>
            <span className="font-bold text-[18px] md:text-[20px] text-[#0F172A]">
              {dist.full}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[12px] text-[#64748B] font-medium">
              {activity.sportType === 'ride' ? 'Speed' : 'Pace'}
            </span>
            <span className="font-bold text-[18px] md:text-[20px] text-[#0F172A]">
              {activity.avgPace}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[12px] text-[#64748B] font-medium">Time</span>
            <span className="font-bold text-[18px] md:text-[20px] text-[#0F172A]">
              {formatDuration(activity.duration)}
            </span>
          </div>

          {activity.achievementsCount && activity.achievementsCount > 0 ? (
            <div className="flex flex-col sm:items-end">
              <span className="text-[12px] text-[#64748B] font-medium">Achievements</span>
              <div className="flex items-center gap-1 text-[#0F172A] font-bold text-[18px] md:text-[20px]">
                <Trophy className="w-4 h-4 text-[#FF5600]" />
                <span>{activity.achievementsCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:items-end">
              <span className="text-[12px] text-[#64748B] font-medium">Elev Gain</span>
              <span className="font-bold text-[18px] md:text-[20px] text-[#0F172A]">
                {activity.elevationGain}m
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Map Preview */}
      {activity.routeCoordinates && activity.routeCoordinates.length > 0 && (
        <div
          className="w-full h-64 md:h-72 relative cursor-pointer group"
          onClick={() => onOpenSummary && onOpenSummary(activity)}
        >
          <LeafletMap
            coordinates={activity.routeCoordinates}
            interactive={false}
            height="100%"
            mapId={`feed-map-${activity.id}`}
          />
          <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#0F172A] shadow-sm border border-[#E2E8F0] opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view breakdown
          </div>
        </div>
      )}

      {/* Attached Photos if any */}
      {activity.photos && activity.photos.length > 0 && (
        <div className="px-4 md:px-6 py-2">
          <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
            {activity.photos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt="Workout capture"
                className="w-full h-40 object-cover rounded-md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Social Actions and Kudos Counter */}
      <div className="px-4 md:px-6 py-3 bg-[#FAFAFC] border-t border-[#E2E8F0] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activity.likes.length > 0 ? (
              <div className="flex items-center gap-1.5 text-[13px] text-[#0F172A] font-medium">
                <span className="w-5 h-5 rounded-full bg-[#FF5600]/10 text-[#FF5600] flex items-center justify-center text-xs font-bold">
                  👍
                </span>
                <span>
                  {activity.likes.length} {activity.likes.length === 1 ? 'kudos' : 'kudos'}
                </span>
              </div>
            ) : (
              <span className="text-[13px] text-[#64748B]">Be the first to give kudos!</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Kudos Button */}
            <button
              onClick={() => toggleLike(activity.id)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-1.5 transition-all ${
                hasLiked
                  ? 'bg-[#FF5600] text-white border-[#FF5600] shadow-sm'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
              title="Give Kudos"
            >
              <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{hasLiked ? 'Kudos Given' : 'Give Kudos'}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-1.5 transition-all ${
                showComments
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
              }`}
              title="Comments"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{activity.comments.length}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
              title="Share workout"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Share Toast */}
        {shareToast && (
          <div className="text-xs text-center py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
            Activity link copied to clipboard!
          </div>
        )}

        {/* Expandable Comment Section */}
        {showComments && (
          <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
            {activity.comments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activity.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                    <img
                      src={c.userAvatar}
                      alt={c.userName}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0F172A]">{c.userName}</span>
                        <span className="text-[10px] text-[#94A3B8]">{c.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#334155] mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] italic py-1">No comments yet. Start the conversation!</p>
            )}

            {/* Add Comment Input Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment or encouragement..."
                className="flex-1 text-xs bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#FF5600] focus:ring-1 focus:ring-[#FF5600]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-2 bg-[#FF5600] text-white rounded-lg text-xs font-semibold hover:bg-[#E04D00] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
};
