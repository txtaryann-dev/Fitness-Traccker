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
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Notifications
          </h1>
          <p className="text-base text-[#64748B] mt-1">
            Stay updated on your progress, kudos, comments, and community.
          </p>
        </div>

        <button
          onClick={markNotificationsAsRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] font-semibold text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-[#FF5600]" /> Mark all as read
        </button>
      </div>

      {/* Notification Container Box */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        {/* TODAY SECTION */}
        {todayNotifs.length > 0 && (
          <div>
            <div className="bg-[#F8FAFC] px-6 py-3.5 border-b border-[#E2E8F0]">
              <h2 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Today
              </h2>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {todayNotifs.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 flex gap-4 items-start transition-colors relative ${
                    !item.isRead ? 'bg-orange-50/20' : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  {!item.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF5600]" />
                  )}

                  {/* Avatar with type badge */}
                  <div className="relative w-12 h-12 shrink-0">
                    <img
                      src={item.userAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'}
                      alt={item.userName}
                      className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#FF5600] text-white rounded-full p-1 border-2 border-white flex items-center justify-center shadow-sm">
                      {item.type === 'kudos' ? (
                        <ThumbsUp className="w-3 h-3 fill-white" />
                      ) : (
                        <MessageCircle className="w-3 h-3 fill-white" />
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm md:text-base text-[#0F172A] leading-snug">
                        <span className="font-bold">{item.userName}</span> {item.text}{' '}
                        <span className="font-bold text-[#FF5600]">{item.activityTitle}</span>.
                      </p>
                      <span className="text-xs text-[#94A3B8] whitespace-nowrap ml-3">
                        {item.timestamp}
                      </span>
                    </div>

                    {item.quote && (
                      <div className="mt-2 bg-[#F8FAFC] p-3.5 rounded-lg border border-[#E2E8F0] text-sm text-[#475569] italic">
                        "{item.quote}"
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      {item.type === 'comment' ? (
                        <button
                          onClick={() => setRepliedId(repliedId === item.id ? null : item.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] font-bold text-xs text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                        >
                          Reply
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(item)}
                          className="inline-flex items-center gap-1 text-[#FF5600] hover:text-[#E04D00] font-bold text-xs transition-colors"
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
                          className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#FF5600]"
                        />
                        <button
                          onClick={() => handleSendReply(item)}
                          className="px-4 py-1.5 bg-[#FF5600] text-white rounded-lg text-xs font-bold hover:bg-[#E04D00]"
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
            <div className="bg-[#F8FAFC] px-6 py-3.5 border-y border-[#E2E8F0]">
              <h2 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Yesterday
              </h2>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {yesterdayNotifs.map((item) => (
                <div key={item.id} className="p-6 flex gap-4 items-start hover:bg-[#F8FAFC] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-[#FF5600]/10 text-[#FF5600] flex items-center justify-center shrink-0 border border-[#FF5600]/20">
                    <Trophy className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm md:text-base font-bold text-[#0F172A]">
                        {item.text}
                      </p>
                      <span className="text-xs text-[#94A3B8] whitespace-nowrap ml-3">
                        {item.timestamp}
                      </span>
                    </div>
                    {item.quote && <p className="text-xs md:text-sm text-[#64748B] mt-1">{item.quote}</p>}

                    <button
                      onClick={() => handleAction(item)}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-[#FF5600] text-white font-bold text-xs hover:bg-[#E04D00] transition-colors"
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
            <div className="bg-[#F8FAFC] px-6 py-3.5 border-y border-[#E2E8F0]">
              <h2 className="font-bold text-xs text-[#0F172A] uppercase tracking-wider">
                Earlier
              </h2>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
              {earlierNotifs.map((item) => (
                <div key={item.id} className="p-6 flex gap-4 items-start hover:bg-[#F8FAFC] transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0059b0] flex items-center justify-center shrink-0 border border-blue-100">
                    <Flag className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm md:text-base font-bold text-[#0F172A]">
                        {item.text}
                      </p>
                      <span className="text-xs text-[#94A3B8] whitespace-nowrap ml-3">
                        {item.timestamp}
                      </span>
                    </div>
                    {item.quote && <p className="text-xs md:text-sm text-[#64748B] mt-1">{item.quote}</p>}

                    <button
                      onClick={() => handleAction(item)}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-white border border-[#E2E8F0] font-bold text-xs text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
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
