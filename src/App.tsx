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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#FF5600] selection:text-white">
      {/* Top and Mobile Navigation (hidden on full-screen workout recording or summary) */}
      {activeTab !== 'record' && activeTab !== 'summary' && (
        <Navbar onOpenRecord={handleOpenRecord} />
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
