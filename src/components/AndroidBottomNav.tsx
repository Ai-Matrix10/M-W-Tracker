import React from 'react';
import { LayoutDashboard, Flame, Dumbbell, Utensils } from 'lucide-react';

export type AppPage = 'dashboard' | 'activity' | 'workout' | 'meal';

interface AndroidBottomNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentPage,
  onNavigate,
}) => {
  const items: { id: AppPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'activity', label: 'Activity', icon: Flame },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'meal', label: 'Meal', icon: Utensils },
  ];

  return (
    <nav className="w-full bg-[#12141a]/98 backdrop-blur-md border-t border-slate-800/90 shadow-2xl select-none">
      <div className="grid grid-cols-4 items-center h-15 max-w-md mx-auto px-2">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center py-1 group focus:outline-none cursor-pointer transition-transform active:scale-95"
              aria-label={item.label}
            >
              {/* Material 3 active pill indicator */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors duration-200 ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

