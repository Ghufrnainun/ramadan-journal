import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CheckSquare,
  Repeat,
  Heart,
  Settings,
  Sparkles,
  Book,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProfile } from '@/lib/storage';

const Sidebar = () => {
  const profile = getProfile();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Quran', path: '/quran' },
    { icon: Book, label: 'Hadits', path: '/hadith' },
    { icon: Calendar, label: 'Jadwal', path: '/calendar' },
    { icon: CheckSquare, label: 'Tracker', path: '/tracker' },
    { icon: Repeat, label: 'Dhikr', path: '/dhikr' },
    { icon: Book, label: 'Doa', path: '/doa' },
    { icon: Heart, label: 'Reflection', path: '/reflection' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 z-50 hidden h-dvh w-64 flex-col border-r border-slate-800 bg-[#020617] md:flex">
      <div className="border-b border-slate-800/50 p-6">
        <div className="mb-1 flex items-center gap-2 text-emerald-500">
          <Sparkles className="h-5 w-5 fill-current" />
          <span className="font-serif text-xl font-bold text-white">
            Ramadan
          </span>
        </div>
        <p className="pl-7 text-xs text-slate-500">MyRamadhanku Journal</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        <div className="mb-4 px-2">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Menu
          </p>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 transition-colors duration-200',
                isActive
                  ? 'bg-emerald-500/10 font-medium text-emerald-400'
                  : 'hover:bg-slate-800/50 hover:text-slate-200',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive
                      ? 'text-emerald-500'
                      : 'text-slate-500 group-hover:text-slate-400',
                  )}
                />
                <span className="text-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="border-t border-slate-800/50 p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
          <p className="mb-1 text-xs text-slate-400">Signed in as</p>
          <p className="truncate text-sm font-medium text-white">
            {profile.displayName || 'Guest'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
