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
    <div className="max-w-3xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Stay updated on your progress, kudos, comments, and community.
          </p>
        </div>

        <button
          onClick={markNotificationsAsRead}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#151D2A] text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] font-semibold text-xs transition-colors shadow-xs self-start sm:self-auto"
        >
          <CheckCheck className="w-3.5 h-3.5 text-[#FF5600]" /> Mark all as read
        </button>
      </div>

      {/* Notification Container Box */}
      <div className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] overflow-hidden shadow-xs transition-colors">
        {/* TODAY SECTION */}
        {todayNotifs.length > 0 && (
          <div>
            <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/60 px-4 py-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <h2 className="font-bold text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Today
              </h2>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {todayNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 flex gap-3 items-start transition-colors relative ${
                    !item.isRead
                      ? 'bg-orange-50/20 dark:bg-orange-950/10'
                      : 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40'
                  }`}
                >
                  {!item.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#FF5600]" />
                  )}

                  {/* Avatar with type badge */}
                  <div className="relative w-9 h-9 shrink-0">
                    <img
                      src={item.userAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'}
                      alt={item.userName}
                      className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#FF5600] text-white rounded-full p-0.5 border border-white dark:border-[#0F172A] flex items-center justify-center shadow-xs">
                      {item.type === 'kudos' ? (
                        <ThumbsUp className="w-2.5 h-2.5 fill-white" />
                      ) : (
                        <MessageCircle className="w-2.5 h-2.5 fill-white" />
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-xs sm:text-sm text-[#0F172A] dark:text-white leading-snug">
                        <span className="font-bold">{item.userName}</span> {item.text}{' '}
                        <span className="font-bold text-[#FF5600]">{item.activityTitle}</span>.
                      </p>
                      <span className="text-[10px] text-[#94A3B8] whitespace-nowrap ml-2">
                        {item.timestamp}
                      </span>
                    </div>

                    {item.quote && (
                      <div className="mt-1.5 bg-[#F8FAFC] dark:bg-[#1E293B] p-2 rounded-md border border-[#E2E8F0] dark:border-[#334155] text-xs text-[#475569] dark:text-[#CBD5E1] italic">
                        "{item.quote}"
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      {item.type === 'comment' ? (
                        <button
                          onClick={() => setRepliedId(repliedId === item.id ? null : item.id)}
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] font-bold text-[11px] text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
                        >
                          Reply
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(item)}
                          className="inline-flex items-center gap-1 text-[#FF5600] hover:text-[#E04D00] font-bold text-xs transition-colors"
                        >
                          View Activity <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Inline Reply Form */}
                    {repliedId === item.id && (
                      <div className="mt-2 flex gap-1.5">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          className="flex-1 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-md px-2.5 py-1 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#FF5600]"
                        />
                        <button
                          onClick={() => handleSendReply(item)}
                          className="px-3 py-1 bg-[#FF5600] text-white rounded-md text-xs font-bold hover:bg-[#E04D00]"
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
            <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/60 px-4 py-2 border-y border-[#E2E8F0] dark:border-[#1E293B]">
              <h2 className="font-bold text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Yesterday
              </h2>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {yesterdayNotifs.map((item) => (
                <div key={item.id} className="p-3.5 sm:p-4 flex gap-3 items-start hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[#FF5600]/10 text-[#FF5600] flex items-center justify-center shrink-0 border border-[#FF5600]/20">
                    <Trophy className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                        {item.text}
                      </p>
                      <span className="text-[10px] text-[#94A3B8] whitespace-nowrap ml-2">
                        {item.timestamp}
                      </span>
                    </div>
                    {item.quote && <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] mt-0.5">{item.quote}</p>}

                    <button
                      onClick={() => handleAction(item)}
                      className="mt-2 px-3 py-1 rounded-md bg-[#FF5600] text-white font-bold text-xs hover:bg-[#E04D00] transition-colors"
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
            <div className="bg-[#F8FAFC] dark:bg-[#1E293B]/60 px-4 py-2 border-y border-[#E2E8F0] dark:border-[#1E293B]">
              <h2 className="font-bold text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                Earlier
              </h2>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {earlierNotifs.map((item) => (
                <div key={item.id} className="p-3.5 sm:p-4 flex gap-3 items-start hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/30 text-[#0059b0] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                    <Flag className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
                        {item.text}
                      </p>
                      <span className="text-[10px] text-[#94A3B8] whitespace-nowrap ml-2">
                        {item.timestamp}
                      </span>
                    </div>
                    {item.quote && <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] mt-0.5">{item.quote}</p>}

                    <button
                      onClick={() => handleAction(item)}
                      className="mt-2 px-3 py-1 rounded-md bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] font-bold text-xs text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#334155] transition-colors"
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
