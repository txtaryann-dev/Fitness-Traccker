import React from 'react';
import {
  Bell,
  Compass,
  Flame,
  Home,
  Plus,
  Radio,
  Settings,
  Trophy,
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
  } = useApp();

  return (
    <>
      {/* Desktop & Tablet Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF5600] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter italic text-[#FF5600]">
                VELOCITY
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === 'home'
                    ? 'text-[#FF5600] bg-orange-50/60'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                Activity Feed
              </button>

              <button
                onClick={() => setActiveTab('explore')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === 'explore'
                    ? 'text-[#FF5600] bg-orange-50/60'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                Explore
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === 'profile'
                    ? 'text-[#FF5600] bg-orange-50/60'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                Profile & Trophies
              </button>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Unit System Toggle (KM vs MI) */}
            <button
              onClick={toggleUnitSystem}
              className="hidden sm:flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
              title="Toggle Unit System"
            >
              <span className={unitSystem === 'metric' ? 'text-[#FF5600]' : ''}>KM</span>
              <span>/</span>
              <span className={unitSystem === 'imperial' ? 'text-[#FF5600]' : ''}>MI</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`p-2 rounded-lg border transition-colors relative ${
                activeTab === 'notifications'
                  ? 'bg-orange-50 text-[#FF5600] border-orange-200'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5600] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Big "Record" Action Button */}
            <button
              onClick={onOpenRecord}
              className="bg-[#FF5600] text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#E04D00] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Record Workout</span>
            </button>

            {/* Profile Avatar Trigger */}
            <button
              onClick={() => setActiveTab('profile')}
              className="w-9 h-9 rounded-full overflow-hidden border border-[#E2E8F0] hover:ring-2 hover:ring-[#FF5600] transition-all ml-1"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-lg px-2 py-1.5 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold ${
            activeTab === 'home' ? 'text-[#FF5600]' : 'text-[#64748B]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold ${
            activeTab === 'explore' ? 'text-[#FF5600]' : 'text-[#64748B]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </button>

        {/* Highlighted Record Center Button */}
        <button
          onClick={onOpenRecord}
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-13 h-13 w-12 h-12 rounded-full bg-[#FF5600] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(255,86,0,0.4)] active:scale-95 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-[#FF5600] mt-1">Record</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold relative ${
            activeTab === 'notifications' ? 'text-[#FF5600]' : 'text-[#64748B]'
          }`}
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-0 right-3 bg-[#FF5600] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {unreadNotificationCount}
            </span>
          )}
          <span>Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-semibold ${
            activeTab === 'profile' ? 'text-[#FF5600]' : 'text-[#64748B]'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
};
