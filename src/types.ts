export type SportType = 'run' | 'ride' | 'walk' | 'hike' | 'swim';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Split {
  split: number; // km or mi number
  pace: string; // e.g. "4:42"
  elevationChange: string; // e.g. "+5m"
  time: string; // e.g. "4:42"
}

export interface PacePoint {
  time: number; // minutes
  pace: number; // in min/km or mph
  elevation?: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userTitle?: string;
  title: string;
  description?: string;
  sportType: SportType;
  distance: number; // in kilometers
  duration: number; // in seconds
  avgPace: string; // e.g. "4:49 /km"
  avgSpeed?: number; // e.g. 18.2 mph / km/h
  elevationGain: number; // in meters
  calories: number;
  avgHeartRate?: number;
  achievementsCount?: number;
  location: string;
  timestamp: string;
  createdAt: number;
  routeCoordinates: LatLng[];
  pacePoints?: PacePoint[];
  splits?: Split[];
  likes: string[]; // userIds who gave kudos
  comments: Comment[];
  photos?: string[];
  isMyActivity?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  role: string;
  city: string;
  country: string;
  isPro: boolean;
  followingCount: number;
  followersCount: number;
  totalActivities: number;
  totalDistanceKm: number;
  yearlyGoalKm: number;
  elevationGoalCurrentM: number;
  elevationGoalTargetM: number;
  elevationGoalName: string;
  weeklyGoalMiles: number;
  weeklyCompletedMiles: number;
  isFollowing?: boolean;
}

export interface Trophy {
  id: string;
  title: string;
  subtitle: string;
  dateEarned?: string;
  iconType: 'trophy' | 'mountain' | 'fire' | 'bolt' | 'lock' | 'badge';
  highlightNumber?: string;
  tag?: string;
  isLocked: boolean;
  description: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  sportType: SportType;
  targetMetric: string;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  daysLeft: number;
  isJoined: boolean;
  participantsCount: number;
  rewardBadge: string;
}

export interface NotificationItem {
  id: string;
  type: 'kudos' | 'comment' | 'milestone' | 'challenge' | 'follow';
  userId?: string;
  userName?: string;
  userAvatar?: string;
  activityId?: string;
  activityTitle?: string;
  text: string;
  timestamp: string;
  timeCategory: 'Today' | 'Yesterday' | 'Earlier';
  isRead: boolean;
  quote?: string;
  actionLabel?: string;
}

export interface Club {
  id: string;
  name: string;
  sportType: SportType;
  memberCount: number;
  iconBg: string;
  iconText?: string;
  iconSymbol?: string;
  description: string;
  isJoined: boolean;
  location?: string;
}
