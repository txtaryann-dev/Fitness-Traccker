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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200 selection:bg-[#FF5600] selection:text-white">
      {/* Top and Mobile Navigation (hidden on full-screen workout recording or summary) */}
      {activeTab !== 'record' && activeTab !== 'summary' && (
        <Navbar onOpenRecord={handleOpenRecord} />
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 pt-4 pb-8">
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
