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
      <header className="sticky top-0 z-40 bg-white/75 dark:bg-[#0B0F17]/75 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 shadow-sm shadow-slate-900/5 dark:shadow-black/20 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-5 lg:px-6 h-14 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E04D00] to-[#FF5600] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-all">
                <Zap className="w-4.5 h-4.5 fill-white" />
              </div>
              <span className="font-black text-xl tracking-tight italic bg-gradient-to-r from-[#FF5600] to-orange-500 bg-clip-text text-transparent">
                VELOCITY
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-white/5 p-1 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'home'
                    ? 'text-white bg-[#FF5600] shadow-sm shadow-orange-500/25'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                }`}
              >
                Feed
              </button>

              <button
                onClick={() => setActiveTab('explore')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'explore'
                    ? 'text-white bg-[#FF5600] shadow-sm shadow-orange-500/25'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                }`}
              >
                Explore
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'text-white bg-[#FF5600] shadow-sm shadow-orange-500/25'
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
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
              id="navbar-theme-toggle"
              onClick={toggleTheme}
              className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[#64748B] dark:text-[#CBD5E1] hover:text-[#FF5600] dark:hover:text-[#FF5600] hover:border-orange-500/30 transition-all cursor-pointer select-none shadow-xs hover:scale-105"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#64748B]" />
              )}
            </button>

            {/* Unit System Toggle (KM vs MI) */}
            <button
              onClick={toggleUnitSystem}
              className="hidden sm:flex items-center gap-1 bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#64748B] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-white transition-all shadow-xs hover:scale-105"
              title="Toggle Unit System"
            >
              <span className={unitSystem === 'metric' ? 'text-[#FF5600]' : ''}>KM</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className={unitSystem === 'imperial' ? 'text-[#FF5600]' : ''}>MI</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-8.5 h-8.5 rounded-xl border transition-all relative flex items-center justify-center shadow-xs hover:scale-105 ${
                activeTab === 'notifications'
                  ? 'bg-orange-500/10 text-[#FF5600] border-orange-500/30'
                  : 'bg-white/80 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-[#64748B] dark:text-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-white'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5600] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-orange-500/40 animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Compact "Record" Action Button */}
            <button
              onClick={onOpenRecord}
              className="bg-gradient-to-r from-[#FF5600] to-orange-500 hover:from-[#E04D00] hover:to-[#FF5600] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-orange-500/25 flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Record</span>
            </button>

            {/* Profile Avatar Trigger */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8.5 h-8.5 rounded-full overflow-hidden border-2 border-white dark:border-white/10 shadow-xs hover:ring-2 hover:ring-[#FF5600] transition-all ml-0.5 hover:scale-105"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/10 shadow-lg px-3 py-1.5 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
            activeTab === 'home' ? 'text-[#FF5600]' : 'text-[#64748B] dark:text-[#94A3B8]'
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
            activeTab === 'explore' ? 'text-[#FF5600]' : 'text-[#64748B] dark:text-[#94A3B8]'
          }`}
        >
          <Compass className="w-4.5 h-4.5" />
          <span>Explore</span>
        </button>

        {/* Highlighted Record Center Button */}
        <button
          onClick={onOpenRecord}
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#E04D00] to-[#FF5600] text-white flex items-center justify-center shadow-lg shadow-orange-500/40 active:scale-95 hover:scale-105 transition-all">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-bold text-[#FF5600] mt-0.5">Record</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-semibold relative transition-all ${
            activeTab === 'notifications' ? 'text-[#FF5600]' : 'text-[#64748B] dark:text-[#94A3B8]'
          }`}
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-0 right-2.5 bg-[#FF5600] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm">
              {unreadNotificationCount}
            </span>
          )}
          <span>Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
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
