import React from 'react';
import {
  Bell,
  Compass,
  Home,
  Moon,
  Plus,
  Sun,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onOpenRecord: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRecord }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    unreadNotificationCount,
    unitSystem,
    toggleUnitSystem,
    theme,
    toggleTheme,
  } = useApp();

  return (
    <>
      {/* Desktop & Tablet Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B] shadow-xs transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 h-13 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-7 h-7 rounded-md bg-[#FF5600] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-black text-xl tracking-tight italic text-[#FF5600]">
                VELOCITY
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-0.5">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeTab === 'home'
                    ? 'text-[#FF5600] bg-orange-50 dark:bg-orange-950/30'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                }`}
              >
                Feed
              </button>

              <button
                onClick={() => setActiveTab('explore')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeTab === 'explore'
                    ? 'text-[#FF5600] bg-orange-50 dark:bg-orange-950/30'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                }`}
              >
                Explore
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeTab === 'profile'
                    ? 'text-[#FF5600] bg-orange-50 dark:bg-orange-950/30'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]'
                }`}
              >
                Profile & Badges
              </button>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#CBD5E1] hover:text-[#FF5600] dark:hover:text-[#FF5600] transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Unit System Toggle (KM vs MI) */}
            <button
              onClick={toggleUnitSystem}
              className="hidden sm:flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] px-2 py-1 rounded-md text-[11px] font-bold text-[#64748B] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-white transition-colors"
              title="Toggle Unit System"
            >
              <span className={unitSystem === 'metric' ? 'text-[#FF5600]' : ''}>KM</span>
              <span>/</span>
              <span className={unitSystem === 'imperial' ? 'text-[#FF5600]' : ''}>MI</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-8 h-8 rounded-lg border transition-colors relative flex items-center justify-center ${
                activeTab === 'notifications'
                  ? 'bg-orange-50 dark:bg-orange-950/40 text-[#FF5600] border-orange-200 dark:border-orange-800/40'
                  : 'bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#334155] hover:text-[#0F172A] dark:hover:text-white'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5600] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Compact "Record" Action Button */}
            <button
              onClick={onOpenRecord}
              className="bg-[#FF5600] hover:bg-[#E04D00] text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Record</span>
            </button>

            {/* Profile Avatar Trigger */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-7.5 h-7.5 rounded-full overflow-hidden border border-[#E2E8F0] dark:border-[#334155] hover:ring-2 hover:ring-[#FF5600] transition-all ml-0.5"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for Mobile Screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-[#1E293B] shadow-lg px-2 py-1 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold ${
            activeTab === 'home' ? 'text-[#FF5600]' : 'text-[#64748B] dark:text-[#94A3B8]'
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold ${
            activeTab === 'explore' ? 'text-[#FF5600]' : 'text-[#64748B] dark:text-[#94A3B8]'
          }`}
        >
          <Compass className="w-4.5 h-4.5" />
          <span>Explore</span>
        </button>

        {/* Highlighted Record Center Button */}
        <button
          onClick={onOpenRecord}
          className="flex flex-col items-center -mt-4"
        >
          <div className="w-10.5 h-10.5 rounded-full bg-[#FF5600] text-white flex items-center justify-center shadow-[0_3px_10px_rgba(255,86,0,0.4)] active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold text-[#FF5600] mt-0.5">Record</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold relative ${
            activeTab === 'notifications' ? 'text-[#FF5600]' : 'text-[#64748B] dark:text-[#94A3B8]'
          }`}
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-0 right-2 bg-[#FF5600] text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">
              {unreadNotificationCount}
            </span>
          )}
          <span>Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold ${
            activeTab === 'profile' ? 'text-[#FF5600]' : 'text-[#64748B] dark:text-[#94A3B8]'
          }`}
        >
          <User className="w-4.5 h-4.5" />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
};
