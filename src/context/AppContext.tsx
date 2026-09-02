import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CURRENT_USER,
  INITIAL_ACTIVITIES,
  INITIAL_CHALLENGES,
  INITIAL_CLUBS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TROPHIES,
} from '../data/mockData';
import { Activity, Challenge, Club, NotificationItem, Trophy, UserProfile } from '../types';

interface AppContextType {
  currentUser: UserProfile;
  activities: Activity[];
  trophies: Trophy[];
  challenges: Challenge[];
  clubs: Club[];
  notifications: NotificationItem[];
  unitSystem: 'metric' | 'imperial';
  theme: 'light' | 'dark';
  activeTab: 'home' | 'explore' | 'record' | 'activity' | 'profile' | 'notifications' | 'summary';
  selectedActivity: Activity | null;
  workoutSummaryActivity: Activity | null;
  unreadNotificationCount: number;
  setActiveTab: (tab: 'home' | 'explore' | 'record' | 'activity' | 'profile' | 'notifications' | 'summary') => void;
  setSelectedActivity: (activity: Activity | null) => void;
  setWorkoutSummaryActivity: (activity: Activity | null) => void;
  toggleUnitSystem: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleLike: (activityId: string) => void;
  addComment: (activityId: string, text: string) => void;
  addActivity: (activity: Partial<Activity>) => Activity;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  joinChallenge: (challengeId: string) => void;
  joinClub: (clubId: string) => void;
  markNotificationsAsRead: () => void;
  formatDistance: (km: number) => { value: string; unit: string; full: string };
  formatPace: (paceStr: string, isSpeed?: boolean) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'velocity_app_state_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed saving to localStorage', err);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    getStored('user', CURRENT_USER)
  );
  const [activities, setActivities] = useState<Activity[]>(() =>
    getStored('activities', INITIAL_ACTIVITIES)
  );
  const [trophies, setTrophies] = useState<Trophy[]>(() =>
    getStored('trophies', INITIAL_TROPHIES)
  );
  const [challenges, setChallenges] = useState<Challenge[]>(() =>
    getStored('challenges', INITIAL_CHALLENGES)
  );
  const [clubs, setClubs] = useState<Club[]>(() =>
    getStored('clubs', INITIAL_CLUBS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStored('notifications', INITIAL_NOTIFICATIONS)
  );
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = getStored<'light' | 'dark' | null>('theme', null);
    if (saved) return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'record' | 'activity' | 'profile' | 'notifications' | 'summary'>('home');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [workoutSummaryActivity, setWorkoutSummaryActivity] = useState<Activity | null>(null);

  useEffect(() => {
    setStored('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    setStored('user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStored('activities', activities);
  }, [activities]);

  useEffect(() => {
    setStored('trophies', trophies);
  }, [trophies]);

  useEffect(() => {
    setStored('challenges', challenges);
  }, [challenges]);

  useEffect(() => {
    setStored('clubs', clubs);
  }, [clubs]);

  useEffect(() => {
    setStored('notifications', notifications);
  }, [notifications]);

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const toggleUnitSystem = () => {
    setUnitSystem((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const formatDistance = (km: number) => {
    if (unitSystem === 'imperial') {
      const miles = km * 0.621371;
      const formatted = miles >= 10 ? miles.toFixed(1) : miles.toFixed(2);
      return { value: formatted, unit: 'mi', full: `${formatted} mi` };
    }
    const formatted = km >= 10 ? km.toFixed(1) : km.toFixed(2);
    return { value: formatted, unit: 'km', full: `${formatted} km` };
  };

  const formatPace = (paceStr: string, isSpeed?: boolean) => {
    // If it's already a clean string, return or format based on system
    return paceStr;
  };

  const toggleLike = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const hasLiked = act.likes.includes(currentUser.id);
          const newLikes = hasLiked
            ? act.likes.filter((id) => id !== currentUser.id)
            : [...act.likes, currentUser.id];
          return { ...act, likes: newLikes };
        }
        return act;
      })
    );
  };

  const addComment = (activityId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: 'Just now',
    };
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          return { ...act, comments: [...act.comments, newComment] };
        }
        return act;
      })
    );
  };

  const addActivity = (activityData: Partial<Activity>): Activity => {
    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      title: activityData.title || 'Workout Session',
      description: activityData.description || 'Recorded with Velocity GPS',
      sportType: activityData.sportType || 'run',
      distance: activityData.distance || 5.0,
      duration: activityData.duration || 1800,
      avgPace: activityData.avgPace || '4:50 /km',
      avgSpeed: activityData.avgSpeed || 12.5,
      elevationGain: activityData.elevationGain || 45,
      calories: activityData.calories || 350,
      avgHeartRate: activityData.avgHeartRate || 152,
      achievementsCount: activityData.achievementsCount || 1,
      location: activityData.location || 'New York, NY',
      timestamp: 'Just now · Velocity App',
      createdAt: Date.now(),
      isMyActivity: true,
      routeCoordinates: activityData.routeCoordinates || [],
      pacePoints: activityData.pacePoints || [],
      splits: activityData.splits || [],
      likes: [],
      comments: [],
      photos: activityData.photos || [],
    };

    setActivities((prev) => [newActivity, ...prev]);

    // Update user stats
    setCurrentUser((prev) => {
      const updatedDistance = prev.totalDistanceKm + newActivity.distance;
      const updatedActivities = prev.totalActivities + 1;
      const updatedElevation = prev.elevationGoalCurrentM + newActivity.elevationGain;
      return {
        ...prev,
        totalDistanceKm: Number(updatedDistance.toFixed(1)),
        totalActivities: updatedActivities,
        elevationGoalCurrentM: updatedElevation,
        weeklyCompletedMiles: Number((prev.weeklyCompletedMiles + newActivity.distance * 0.621371).toFixed(1)),
      };
    });

    // Update challenge progress
    setChallenges((prev) =>
      prev.map((chal) => {
        if (chal.isJoined && (chal.sportType === newActivity.sportType || chal.sportType === 'run')) {
          const addedProgress =
            chal.targetMetric === 'Elevation' ? newActivity.elevationGain : newActivity.distance;
          const nextVal = Math.min(chal.targetProgress, chal.currentProgress + addedProgress);
          return { ...chal, currentProgress: Number(nextVal.toFixed(1)) };
        }
        return chal;
      })
    );

    return newActivity;
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  const joinClub = (clubId: string) => {
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activities,
        trophies,
        challenges,
        clubs,
        notifications,
        unitSystem,
        theme,
        activeTab,
        selectedActivity,
        workoutSummaryActivity,
        unreadNotificationCount,
        setActiveTab,
        setSelectedActivity,
        setWorkoutSummaryActivity,
        toggleUnitSystem,
        toggleTheme,
        setTheme,
        toggleLike,
        addComment,
        addActivity,
        updateUserProfile,
        joinChallenge,
        joinClub,
        markNotificationsAsRead,
        formatDistance,
        formatPace,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
