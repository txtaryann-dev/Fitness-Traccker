import React from 'react';
import { ExploreView } from './components/ExploreView';
import { HomeFeedView } from './components/HomeFeedView';
import { Navbar } from './components/Navbar';
import { NotificationsView } from './components/NotificationsView';
import { UserProfileView } from './components/UserProfileView';
import { WorkoutSummary } from './components/WorkoutSummary';
import { WorkoutTracker } from './components/WorkoutTracker';
import { AppProvider, useApp } from './context/AppContext';
import { Activity, SportType } from './types';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    workoutSummaryActivity,
    setWorkoutSummaryActivity,
  } = useApp();

  const handleOpenRecord = () => {
    setActiveTab('record');
  };

  const handleFinishWorkout = (activity: Activity) => {
    setWorkoutSummaryActivity(activity);
    setActiveTab('summary');
  };

  const handleSelectActivity = (activity: Activity) => {
    setWorkoutSummaryActivity(activity);
    setActiveTab('summary');
  };

  const handleCloseSummary = () => {
    setWorkoutSummaryActivity(null);
    setActiveTab('home');
  };

  const handleShareToFeed = () => {
    setWorkoutSummaryActivity(null);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-300 selection:bg-[#FF5600] selection:text-white relative overflow-x-hidden">
      {/* Subtle Atmospheric Ambient Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#FF5600]/5 dark:bg-[#FF5600]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[30rem] h-[30rem] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-80 h-80 bg-orange-400/5 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top and Mobile Navigation (hidden on full-screen workout recording or summary) */}
      {activeTab !== 'record' && activeTab !== 'summary' && (
        <Navbar onOpenRecord={handleOpenRecord} />
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 pt-5 pb-10">
        {activeTab === 'home' && (
          <HomeFeedView
            onOpenRecord={handleOpenRecord}
            onOpenSummary={handleSelectActivity}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            onStartRouteTracking={(sport: SportType) => {
              setActiveTab('record');
            }}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView onSelectActivity={handleSelectActivity} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView onSelectActivity={handleSelectActivity} />
        )}

        {activeTab === 'record' && (
          <WorkoutTracker
            onFinishWorkout={handleFinishWorkout}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'summary' && workoutSummaryActivity && (
          <WorkoutSummary
            activity={workoutSummaryActivity}
            onClose={handleCloseSummary}
            onShareToFeed={handleShareToFeed}
          />
        )}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
