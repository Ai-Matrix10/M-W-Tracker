import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Dumbbell, 
  Utensils, 
  PlusCircle, 
  Calendar, 
  Info, 
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  RoomDatabase, 
  getMealIntensity, 
  getWorkoutIntensity, 
  MealIntensity, 
  WorkoutIntensity,
  getLocalDateString 
} from '../db/room';
import { AppPage } from '../components/AndroidBottomNav';

interface DashboardPageProps {
  onNavigate: (page: AppPage, targetDate?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener('room_db_update', handleUpdate);
    return () => window.removeEventListener('room_db_update', handleUpdate);
  }, []);

  const recentDays = RoomDatabase.activity.getRecentDays(7);
  const todayDateStr = getLocalDateString(new Date());
  const todayActivity = RoomDatabase.activity.getByDate(todayDateStr);

  // Compute today's scores
  const todayMealScore = (todayActivity.meals || []).reduce((acc, m) => acc + (m.score || 0), 0);
  const todayWorkoutScore = (todayActivity.workouts || []).reduce((acc, w) => acc + (w.score || 0), 0);
  const todayMealIntensity = getMealIntensity(todayMealScore);
  const todayWorkoutIntensity = getWorkoutIntensity(todayWorkoutScore);

  // Styling helper for meal badges
  const getMealBadgeStyle = (level: MealIntensity) => {
    switch (level) {
      case 'High':
        return 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80';
      case 'Medium':
        return 'bg-cyan-950/70 text-cyan-400 border border-cyan-800/80';
      case 'Low':
        return 'bg-amber-950/70 text-amber-400 border border-amber-800/80';
      case 'Skip':
        return 'bg-rose-950/70 text-rose-400 border border-rose-800/80 font-bold';
      default:
        return 'bg-slate-900/80 text-slate-500 border border-slate-800';
    }
  };

  // Styling helper for workout badges
  const getWorkoutBadgeStyle = (level: WorkoutIntensity) => {
    switch (level) {
      case 'High':
        return 'bg-purple-950/70 text-purple-400 border border-purple-800/80';
      case 'Medium High':
        return 'bg-indigo-950/70 text-indigo-400 border border-indigo-800/80';
      case 'Medium':
        return 'bg-blue-950/70 text-blue-400 border border-blue-800/80';
      case 'Medium Low':
        return 'bg-teal-950/70 text-teal-400 border border-teal-800/80';
      case 'Low':
        return 'bg-amber-950/70 text-amber-400 border border-amber-800/80';
      case 'Skip':
        return 'bg-rose-950/70 text-rose-400 border border-rose-800/80 font-bold';
      default:
        return 'bg-slate-900/80 text-slate-500 border border-slate-800';
    }
  };

  return (
    <div className="space-y-4 pb-6" key={refreshKey}>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#1a1e2b] via-[#161824] to-[#12131b] border border-slate-800/80 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Hello, Iwan</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track your daily workout sets, reps, and nutrition levels locally.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* 3 Prominent Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          <button
            onClick={() => onNavigate('workout')}
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#202433] hover:bg-[#272c3e] active:scale-[0.98] border border-slate-700/60 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-1 text-purple-400 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-100">Add Workout</span>
          </button>

          <button
            onClick={() => onNavigate('meal')}
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-[#202433] hover:bg-[#272c3e] active:scale-[0.98] border border-slate-700/60 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mb-1 text-teal-400 group-hover:scale-110 transition-transform">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-100">Add Meal</span>
          </button>

          <button
            onClick={() => onNavigate('activity')}
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.98] border border-emerald-500/40 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center mb-1 text-emerald-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-300">Activity</span>
          </button>
        </div>
      </div>

      {/* Today's Overview Snapshot */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Today Meal Card */}
        <div 
          onClick={() => onNavigate('activity', todayDateStr)}
          className="bg-[#181a24] border border-slate-800 rounded-2xl p-3.5 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5 text-xs">
              <Utensils className="w-3.5 h-3.5 text-teal-400" />
              Today's Meals
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white tabular-nums tracking-tight">
              {todayMealScore}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getMealBadgeStyle(todayMealIntensity)}`}>
                {todayMealIntensity}
              </span>
            </div>
          </div>
        </div>

        {/* Today Workout Card */}
        <div 
          onClick={() => onNavigate('activity', todayDateStr)}
          className="bg-[#181a24] border border-slate-800 rounded-2xl p-3.5 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5 text-xs">
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              Today's Workout
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white tabular-nums tracking-tight">
              {todayWorkoutScore}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getWorkoutBadgeStyle(todayWorkoutIntensity)}`}>
                {todayWorkoutIntensity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Days Progress Section */}
      <div className="bg-[#181a24] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">7 Days Progress</h3>
          </div>
          <span className="text-[11px] text-slate-400">Past Week</span>
        </div>

        <div className="space-y-2">
          {recentDays.map(({ date, displayDay, displayDate, activity }) => {
            const mealScore = (activity.meals || []).reduce((acc, m) => acc + (m.score || 0), 0);
            const workoutScore = (activity.workouts || []).reduce((acc, w) => acc + (w.score || 0), 0);
            const mealLevel = getMealIntensity(mealScore);
            const workoutLevel = getWorkoutIntensity(workoutScore);
            const isToday = displayDay === 'Today';

            return (
              <div
                key={date}
                onClick={() => onNavigate('activity', date)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isToday 
                    ? 'bg-[#1e2230] border-emerald-500/40 hover:border-emerald-500/70 shadow-sm' 
                    : 'bg-[#141620] border-slate-800/80 hover:bg-[#191c28] hover:border-slate-700'
                }`}
              >
                {/* 5. Makes Day name and Date in same row like Friday, Nov 6 */}
                <div className="flex items-center justify-between sm:justify-start gap-2 min-w-[130px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {displayDay}, {displayDate}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Mobile-only chevron */}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 sm:hidden" />
                </div>

                {/* Badges container */}
                <div className="grid grid-cols-2 gap-2 flex-1 sm:max-w-md">
                  {/* Meal Badge */}
                  <div className="flex flex-col justify-center px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-teal-400" />
                        Meal
                      </span>
                      <span className="font-mono tabular-nums text-slate-300 font-semibold">{mealScore}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block ${getMealBadgeStyle(mealLevel)}`}>
                        {mealLevel}
                      </span>
                    </div>
                  </div>

                  {/* Workout Badge */}
                  <div className="flex flex-col justify-center px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-purple-400" />
                        Workout
                      </span>
                      <span className="font-mono tabular-nums text-slate-300 font-semibold">{workoutScore}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block ${getWorkoutBadgeStyle(workoutLevel)}`}>
                        {workoutLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules & Formulas Reference Card */}
      <div className="bg-[#141620] border border-slate-800/80 rounded-2xl p-4 text-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Info className="w-4 h-4 text-emerald-400" />
          <span>Formula &amp; Intensity Reference</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 text-[11px]">
          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-semibold text-teal-300">Meal Intensity Formula:</div>
            <div>• <strong className="text-rose-400">Skip</strong>: No value logged (Score = 0)</div>
            <div>• <strong>Low</strong>: Score between 0 and 1,149</div>
            <div>• <strong>Medium</strong>: Score between 1,150 and 2,499</div>
            <div>• <strong>High</strong>: Score &ge; 2,500</div>
            <div className="text-slate-400 pt-1 border-t border-slate-800 text-[10px]">
              Portion Scoring: Small = Grade &times; 2, Medium = Grade &times; 5, Large = Grade &times; 10
            </div>
          </div>

          <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-semibold text-purple-300">Workout Intensity Formula:</div>
            <div>• <strong className="text-rose-400">Skip</strong>: No value logged (Score = 0)</div>
            <div>• <strong>Low</strong>: Score between 50 to 99</div>
            <div>• <strong>Medium Low</strong>: Score between 100 to 149</div>
            <div>• <strong>Medium</strong>: Score between 150 to 199</div>
            <div>• <strong>Medium High</strong>: Score between 200 to 299</div>
            <div>• <strong>High</strong>: Score &ge; 300</div>
            <div className="text-slate-400 pt-1 border-t border-slate-800 text-[10px]">
              Scoring = Reps &times; Sets. (Push Up &amp; Plank excluded from Total Workout Score)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
