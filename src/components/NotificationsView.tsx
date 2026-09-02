import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCheck,
  Flag,
  MessageCircle,
  Sparkles,
  ThumbsUp,
  Trophy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity, NotificationItem } from '../types';

interface NotificationsViewProps {
  onSelectActivity: (activity: Activity) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onSelectActivity }) => {
  const { notifications, markNotificationsAsRead, activities, joinChallenge } = useApp();
  const [repliedId, setRepliedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const todayNotifs = notifications.filter((n) => n.timeCategory === 'Today');
  const yesterdayNotifs = notifications.filter((n) => n.timeCategory === 'Yesterday');
  const earlierNotifs = notifications.filter((n) => n.timeCategory === 'Earlier');

  const handleAction = (item: NotificationItem) => {
    if (item.activityId) {
      const act = activities.find((a) => a.id === item.activityId);
      if (act) {
        onSelectActivity(act);
      }
    } else if (item.type === 'challenge') {
      // join challenge
      joinChallenge('chal-century-september');
    }
  };

  const handleSendReply = (item: NotificationItem) => {
    if (!replyText.trim()) return;
    setRepliedId(null);
    setReplyText('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Stay updated on your progress, kudos, comments, and community.
          </p>
        </div>

        <button
          onClick={markNotificationsAsRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl text-[#0F172A] dark:text-white hover:bg-white dark:hover:bg-white/10 font-bold text-xs transition-all shadow-md self-start sm:self-auto hover:scale-105 active:scale-95"
        >
          <CheckCheck className="w-4 h-4 text-[#FF5600]" /> Mark all as read
        </button>
      </div>

      {/* Notification Container Box */}
      <div className="bg-white/75 dark:bg-[#151D2A]/75 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-white/10 overflow-hidden shadow-xl shadow-slate-900/5 dark:shadow-black/20 transition-all">
        {/* TODAY SECTION */}
        {todayNotifs.length > 0 && (
          <div>
            <div className="bg-slate-100/60 dark:bg-white/5 px-6 py-3 border-b border-slate-200/60 dark:border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5600] animate-pulse" />
              <h2 className="font-black text-[11px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Today
              </h2>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-white/5">
              {todayNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 flex gap-4 items-start transition-all relative ${
                    !item.isRead
                      ? 'bg-orange-500/5 dark:bg-orange-500/10'
                      : 'hover:bg-slate-50/50 dark:hover:bg-white/5'
                  }`}
                >
                  {!item.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF5600] to-orange-400 rounded-r" />
                  )}

                  {/* Avatar with type badge */}
                  <div className="relative w-11 h-11 shrink-0">
                    <img
                      src={item.userAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'}
                      alt={item.userName}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200/60 dark:border-white/10 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#FF5600] to-orange-500 text-white rounded-full p-1 border-2 border-white dark:border-[#0F172A] flex items-center justify-center shadow-md">
                      {item.type === 'kudos' ? (
                        <ThumbsUp className="w-2.5 h-2.5 fill-white" />
                      ) : (
                        <MessageCircle className="w-2.5 h-2.5 fill-white" />
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs sm:text-sm text-[#0F172A] dark:text-white leading-snug">
                        <span className="font-bold">{item.userName}</span> {item.text}{' '}
                        <span className="font-bold text-[#FF5600]">{item.activityTitle}</span>.
                      </p>
                      <span className="text-[11px] font-medium text-[#94A3B8] whitespace-nowrap ml-3">
                        {item.timestamp}
                      </span>
                    </div>

                    {item.quote && (
                      <div className="mt-2 bg-slate-100/80 dark:bg-white/5 p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 text-xs text-[#475569] dark:text-[#CBD5E1] italic">
                        "{item.quote}"
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      {item.type === 'comment' ? (
                        <button
                          onClick={() => setRepliedId(repliedId === item.id ? null : item.id)}
                          className="px-3.5 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200/60 dark:border-white/10 font-bold text-xs text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-white/20 transition-all shadow-xs hover:scale-105 active:scale-95"
                        >
                          Reply
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(item)}
                          className="inline-flex items-center gap-1 text-[#FF5600] hover:text-[#E04D00] font-bold text-xs transition-colors hover:underline"
                        >
                          View Activity <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Form */}
                    {repliedId === item.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="flex-1 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl px-3.5 py-2 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600] shadow-xs"
                        />
                        <button
                          onClick={() => handleSendReply(item)}
                          className="px-4 py-2 bg-gradient-to-r from-[#FF5600] to-orange-500 text-white rounded-2xl text-xs font-bold hover:from-[#E04D00] hover:to-[#FF5600] shadow-md shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* YESTERDAY SECTION */}
        {yesterdayNotifs.length > 0 && (
          <div>
            <div className="bg-slate-100/60 dark:bg-white/5 px-6 py-3 border-y border-slate-200/60 dark:border-white/10">
              <h2 className="font-black text-[11px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Yesterday
              </h2>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-white/5">
              {yesterdayNotifs.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex gap-4 items-start hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-[#FF5600] flex items-center justify-center shrink-0 border border-orange-500/20 shadow-sm">
                    <Trophy className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                        {item.text}
                      </p>
                      <span className="text-[11px] font-medium text-[#94A3B8] whitespace-nowrap ml-3">
                        {item.timestamp}
                      </span>
                    </div>
                    {item.quote && <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] mt-1">{item.quote}</p>}

                    <button
                      onClick={() => handleAction(item)}
                      className="mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF5600] to-orange-500 text-white font-bold text-xs hover:from-[#E04D00] hover:to-[#FF5600] shadow-md shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                      {item.actionLabel || 'View Badge'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EARLIER SECTION */}
        {earlierNotifs.length > 0 && (
          <div>
            <div className="bg-slate-100/60 dark:bg-white/5 px-6 py-3 border-y border-slate-200/60 dark:border-white/10">
              <h2 className="font-black text-[11px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Earlier
              </h2>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-white/5">
              {earlierNotifs.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex gap-4 items-start hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-[#0059b0] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-sm">
                    <Flag className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                        {item.text}
                      </p>
                      <span className="text-[11px] font-medium text-[#94A3B8] whitespace-nowrap ml-3">
                        {item.timestamp}
                      </span>
                    </div>
                    {item.quote && <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] mt-1">{item.quote}</p>}

                    <button
                      onClick={() => handleAction(item)}
                      className="mt-3 px-4 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200/60 dark:border-white/10 font-bold text-xs text-[#0F172A] dark:text-white hover:bg-[#FF5600] hover:text-white hover:border-[#FF5600] shadow-xs transition-all hover:scale-105 active:scale-95"
                    >
                      {item.actionLabel || 'Join Challenge'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
