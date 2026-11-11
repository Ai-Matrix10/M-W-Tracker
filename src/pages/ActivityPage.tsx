import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Utensils, 
  Dumbbell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Info,
  Layers
} from 'lucide-react';
import { 
  RoomDatabase, 
  MealEntity, 
  WorkoutEntity, 
  MealCategory, 
  MealPortion, 
  ActivityMealItem, 
  ActivityWorkoutItem,
  DailyActivityEntity,
  calculateMealScore,
  calculateWorkoutScore,
  getMealIntensity,
  getWorkoutIntensity,
  getLocalDateString 
} from '../db/room';

interface ActivityPageProps {
  initialDate?: string;
  onNavigateDate?: (date: string) => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({ initialDate }) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || getLocalDateString(new Date()));
  const [availableMeals, setAvailableMeals] = useState<MealEntity[]>([]);
  const [availableWorkouts, setAvailableWorkouts] = useState<WorkoutEntity[]>([]);
  const [activity, setActivity] = useState<DailyActivityEntity>({
    date: selectedDate,
    meals: [],
    workouts: [],
    pushUpReps: 0,
    plankSeconds: 0,
    updatedAt: '',
  });

  // Track draft selections for adding rows
  const [selectedMealByCat, setSelectedMealByCat] = useState<Record<MealCategory, string>>({
    Breakfast: '',
    Lunch: '',
    Dinner: '',
    Snack: '',
  });

  const [draftWorkoutType, setDraftWorkoutType] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync available meals and workouts from Room DB
  const refreshMasterTables = () => {
    setAvailableMeals(RoomDatabase.meals.getAll());
    setAvailableWorkouts(RoomDatabase.workouts.getAll());
  };

  useEffect(() => {
    refreshMasterTables();
    const handleUpdate = () => refreshMasterTables();
    window.addEventListener('room_db_update', handleUpdate);
    return () => window.removeEventListener('room_db_update', handleUpdate);
  }, []);

  // Sync activity for selected date
  useEffect(() => {
    const act = RoomDatabase.activity.getByDate(selectedDate);
    setActivity(act);
  }, [selectedDate]);

  // Save changes to Room DB
  const persistActivity = (updated: DailyActivityEntity) => {
    setActivity(updated);
    RoomDatabase.activity.save(updated);
    setSaveStatus('Saved to Room DB');
    setTimeout(() => setSaveStatus(null), 1500);
  };

  // Date Navigation
  const changeDateByDays = (delta: number) => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + delta);
    setSelectedDate(getLocalDateString(d));
  };

  const formattedDateHeader = (() => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const todayStr = getLocalDateString(new Date());
    const isToday = selectedDate === todayStr;
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const fullDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return {
      weekday: isToday ? `Today (${weekday})` : weekday,
      fullDate,
      isToday,
    };
  })();

  // Meal Handlers: Automatically add new meal when chosen from dropdown (like Workout Sessions)
  const handleAddMealRow = (category: MealCategory, mealId: string, portion: MealPortion = '') => {
    if (!mealId) return;
    const targetMeal = availableMeals.find((m) => m.id === mealId);
    if (!targetMeal) return;

    const score = calculateMealScore(targetMeal.grade, portion);
    const newItem: ActivityMealItem = {
      id: `m_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      mealId: targetMeal.id,
      mealName: targetMeal.name,
      grade: targetMeal.grade,
      portion,
      category,
      score,
    };

    const updated: DailyActivityEntity = {
      ...activity,
      meals: [...(activity.meals || []), newItem],
    };
    persistActivity(updated);

    // Reset dropdown so user can immediately pick another meal
    setSelectedMealByCat((prev) => ({
      ...prev,
      [category]: '',
    }));
  };

  const handleUpdateMealPortion = (itemId: string, newPortion: MealPortion) => {
    const updated: DailyActivityEntity = {
      ...activity,
      meals: activity.meals.map((m) => {
        if (m.id === itemId) {
          const score = calculateMealScore(m.grade, newPortion);
          return { ...m, portion: newPortion, score };
        }
        return m;
      }),
    };
    persistActivity(updated);
  };

  const handleRemoveMealItem = (itemId: string) => {
    const updated: DailyActivityEntity = {
      ...activity,
      meals: activity.meals.filter((m) => m.id !== itemId),
    };
    persistActivity(updated);
  };

  // Workout Handlers
  const handleAddWorkoutRow = (workoutTypeId: string) => {
    if (!workoutTypeId) return;
    const workoutMeta = availableWorkouts.find((w) => w.id === workoutTypeId);
    if (!workoutMeta) return;

    const defaultReps = 10;
    const defaultSets = 3;
    const score = calculateWorkoutScore(defaultReps, defaultSets);

    const newItem: ActivityWorkoutItem = {
      id: `w_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workoutTypeId: workoutMeta.id,
      workoutName: workoutMeta.name,
      reps: defaultReps,
      sets: defaultSets,
      score,
    };

    const updated: DailyActivityEntity = {
      ...activity,
      workouts: [...(activity.workouts || []), newItem],
    };
    persistActivity(updated);
    setDraftWorkoutType('');
  };

  const handleUpdateWorkoutRepsSets = (itemId: string, reps: number, sets: number) => {
    const safeReps = Math.max(0, Math.floor(reps));
    const safeSets = Math.max(0, Math.floor(sets));
    const score = calculateWorkoutScore(safeReps, safeSets);

    const updated: DailyActivityEntity = {
      ...activity,
      workouts: activity.workouts.map((w) =>
        w.id === itemId
          ? { ...w, reps: safeReps, sets: safeSets, score }
          : w
      ),
    };
    persistActivity(updated);
  };

  const handleRemoveWorkoutItem = (itemId: string) => {
    const updated: DailyActivityEntity = {
      ...activity,
      workouts: activity.workouts.filter((w) => w.id !== itemId),
    };
    persistActivity(updated);
  };

  const handleUpdatePushUp = (reps: number) => {
    const safeReps = Math.max(0, Math.floor(reps));
    const updated: DailyActivityEntity = {
      ...activity,
      pushUpReps: safeReps,
    };
    persistActivity(updated);
  };

  const handleUpdatePlank = (seconds: number) => {
    const safeSecs = Math.max(0, Math.floor(seconds));
    const updated: DailyActivityEntity = {
      ...activity,
      plankSeconds: safeSecs,
    };
    persistActivity(updated);
  };

  // Calculate Scores
  const getCategoryScore = (cat: MealCategory) => {
    return (activity.meals || [])
      .filter((m) => m.category === cat)
      .reduce((sum, item) => sum + (item.score || 0), 0);
  };

  const breakfastScore = getCategoryScore('Breakfast');
  const lunchScore = getCategoryScore('Lunch');
  const dinnerScore = getCategoryScore('Dinner');
  const snackScore = getCategoryScore('Snack');
  const totalMealScore = breakfastScore + lunchScore + dinnerScore + snackScore;
  const mealIntensity = getMealIntensity(totalMealScore);

  // Total Workout Score = Sum of all workout, except Push Up and Plank!
  const totalWorkoutScore = (activity.workouts || []).reduce(
    (sum, item) => sum + (item.score || 0),
    0
  );
  const workoutIntensity = getWorkoutIntensity(totalWorkoutScore);

  const mealCategories: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const handleClearDay = () => {
    if (confirm(`Clear all activity for ${formattedDateHeader.weekday}, ${formattedDateHeader.fullDate}?`)) {
      RoomDatabase.activity.clearDate(selectedDate);
      setActivity({
        date: selectedDate,
        meals: [],
        workouts: [],
        pushUpReps: 0,
        plankSeconds: 0,
        updatedAt: '',
      });
      setSaveStatus('Day activity cleared');
      setTimeout(() => setSaveStatus(null), 1500);
    }
  };

  const hasActivityData =
    (activity.meals && activity.meals.length > 0) ||
    (activity.workouts && activity.workouts.length > 0) ||
    (activity.pushUpReps && activity.pushUpReps > 0) ||
    (activity.plankSeconds && activity.plankSeconds > 0);

  return (
    <div className="space-y-3 pb-20">
      {/* Date Header Card with Automatic Day & Dates */}
      <div className="bg-[#181a24] border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-between">
        <button
          onClick={() => changeDateByDays(-1)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <Calendar className="w-3 h-3" />
            <span>Automatic Day &amp; Date</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
            {formattedDateHeader.weekday}
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">
            {formattedDateHeader.fullDate}
          </p>
          {hasActivityData && (
            <button
              onClick={handleClearDay}
              className="mt-1 text-[10px] text-rose-400 hover:text-rose-300 underline font-medium transition-colors"
            >
              Clear Day
            </button>
          )}
        </div>

        <button
          onClick={() => changeDateByDays(1)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {saveStatus && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-mono py-0.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Summary Score Header Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Meal Score Card */}
        <div className="bg-[#1a1c27] border border-teal-500/30 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-teal-400 flex items-center gap-1.5 text-[11px]">
              <Utensils className="w-3 h-3" />
              Total Meal Score
            </span>
          </div>
          <div className="text-xl font-black text-white tabular-nums mt-0.5">
            {totalMealScore}
          </div>
          <div className="mt-0.5 text-xs">
            <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] inline-block ${
              mealIntensity === 'Skip'
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80 font-bold'
                : 'bg-teal-950/80 text-teal-300 border border-teal-800/60'
            }`}>
              Intensity: {mealIntensity}
            </span>
          </div>
        </div>

        {/* Workout Score Card */}
        <div className="bg-[#1a1c27] border border-purple-500/30 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-purple-400 flex items-center gap-1.5 text-[11px]">
              <Dumbbell className="w-3 h-3" />
              Total Workout Score
            </span>
          </div>
          <div className="text-xl font-black text-white tabular-nums mt-0.5">
            {totalWorkoutScore}
          </div>
          <div className="mt-0.5 text-xs">
            <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] inline-block ${
              workoutIntensity === 'Skip'
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80 font-bold'
                : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
            }`}>
              Intensity: {workoutIntensity}
            </span>
          </div>
        </div>
      </div>

      {/* ======================= MEAL CONTAINERS ======================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Daily Meals</h3>
          </div>
        </div>

        {mealCategories.map((category) => {
          const catMeals = (activity.meals || []).filter((m) => m.category === category);
          const catScore = getCategoryScore(category);

          return (
            <div
              key={category}
              className="bg-[#181a24] border border-slate-800/90 rounded-2xl p-3 shadow-sm space-y-2"
            >
              {/* Container Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <h4 className="text-sm font-bold text-white">{category}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 inline-block mr-1">Score:</span>
                  <span className="text-sm font-bold text-teal-400 font-mono tabular-nums">
                    {catScore}
                  </span>
                </div>
              </div>

              {/* Add Meal Dropdown */}
              <div className="bg-[#12141c] p-2 rounded-xl border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-semibold text-slate-300">
                  Add Meal
                </div>
                <div>
                  <select
                    value={selectedMealByCat[category] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedMealByCat((prev) => ({ ...prev, [category]: val }));
                      if (val) {
                        handleAddMealRow(category, val, '');
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#181b26] border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Select Meal</option>
                    {availableMeals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table / List of Meals in this container */}
              {catMeals.length === 0 ? (
                <div className="text-center py-2.5 text-xs text-slate-500 italic bg-[#12141c] rounded-xl border border-slate-800/80">
                  No {category.toLowerCase()} logged yet. Select from the dropdown above.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 border border-slate-800/80 rounded-xl overflow-hidden bg-[#12141c]">
                  {catMeals.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      {/* Meal Name */}
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="font-semibold text-slate-200 block text-xs leading-tight break-words">
                          {item.mealName}
                        </span>
                      </div>

                      {/* Dropdown contains "Small", "Medium", "Large" after meal name */}
                      <div className="shrink-0">
                        <select
                          value={item.portion || ''}
                          onChange={(e) =>
                            handleUpdateMealPortion(item.id, e.target.value as MealPortion)
                          }
                          className={`px-2 py-1 bg-[#181b26] border rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-500 transition-colors cursor-pointer ${
                            !item.portion
                              ? 'border-amber-500/70 text-amber-300 bg-amber-950/30'
                              : 'border-slate-700 text-teal-300'
                          }`}
                        >
                          <option value="" disabled>
                            Select Portion
                          </option>
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                          <option value="Large">Large</option>
                        </select>
                      </div>

                      {/* Score added according to the formula */}
                      <div className="text-right min-w-[46px] shrink-0">
                        <span className="text-[10px] text-slate-400 block font-mono">Score</span>
                        <span
                          className={`text-xs font-bold font-mono tabular-nums ${
                            item.score > 0 ? 'text-teal-400' : 'text-slate-500'
                          }`}
                        >
                          {item.score > 0 ? `+${item.score}` : '0'}
                        </span>
                      </div>

                      {/* Remove item */}
                      <button
                        onClick={() => handleRemoveMealItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors ml-0.5 shrink-0"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ======================= WORKOUT CONTAINER ======================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Workout Tracker</h3>
          </div>
        </div>

        <div className="bg-[#181a24] border border-slate-800/90 rounded-2xl p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div>
              <h4 className="text-sm font-bold text-white">Workout Sessions</h4>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 inline-block mr-1">Score:</span>
              <span className="text-sm font-bold text-purple-400 font-mono tabular-nums">
                {totalWorkoutScore}
              </span>
            </div>
          </div>

          {/* Add Workout Dropdown */}
          <div className="bg-[#12141c] p-2 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[11px] font-semibold text-slate-300">
              Add Exercise
            </div>
            <div>
              <select
                value={draftWorkoutType}
                onChange={(e) => {
                  const val = e.target.value;
                  setDraftWorkoutType(val);
                  if (val) {
                    handleAddWorkoutRow(val);
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-[#181b26] border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Workout</option>
                {availableWorkouts.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Redesigned Table under Workout Type Drop Down */}
          <div className="space-y-2.5">
            {activity.workouts.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 italic bg-[#12141c] rounded-2xl border border-slate-800/80">
                No exercises added yet. Select a workout from the dropdown above.
              </div>
            ) : (
              <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-[#12141c]">
                <table className="w-full text-left text-xs table-fixed">
                  <thead className="bg-[#181b26] text-slate-400 border-b border-slate-800 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5">Workout Type</th>
                      <th className="py-2 px-0.5 text-center w-11">Reps</th>
                      <th className="py-2 px-0.5 text-center w-11">Sets</th>
                      <th className="py-2 px-0.5 text-center w-11">Score</th>
                      <th className="py-2 px-0.5 text-center w-7"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activity.workouts.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-900/40">
                        {/* 1. Make Workout Type 2 or 3 lines if longer */}
                        <td className="py-2 px-2.5 font-semibold text-slate-200 text-[11px] sm:text-xs leading-tight break-words whitespace-normal">
                          {w.workoutName}
                        </td>

                        {/* 2. Reps input smaller for 2 digit number */}
                        <td className="py-2 px-0.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={w.reps}
                            onChange={(e) => {
                              const val = e.target.value.slice(0, 2);
                              handleUpdateWorkoutRepsSets(w.id, Number(val), w.sets);
                            }}
                            className="w-8 h-6.5 px-0.5 bg-[#181b26] border border-slate-700 rounded text-slate-100 text-xs font-mono tabular-nums text-center focus:outline-none focus:border-purple-500"
                          />
                        </td>

                        {/* 2. Sets input smaller for 2 digit number */}
                        <td className="py-2 px-0.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={w.sets}
                            onChange={(e) => {
                              const val = e.target.value.slice(0, 2);
                              handleUpdateWorkoutRepsSets(w.id, w.reps, Number(val));
                            }}
                            className="w-8 h-6.5 px-0.5 bg-[#181b26] border border-slate-700 rounded text-slate-100 text-xs font-mono tabular-nums text-center focus:outline-none focus:border-purple-500"
                          />
                        </td>

                        {/* Score */}
                        <td className="py-2 px-0.5 text-center font-bold text-purple-400 font-mono tabular-nums text-xs">
                          {w.score}
                        </td>

                        {/* 3. Smaller trash / delete icon */}
                        <td className="py-2 px-0.5 text-center">
                          <button
                            onClick={() => handleRemoveWorkoutItem(w.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors inline-flex items-center justify-center"
                            title="Delete exercise"
                            aria-label="Delete exercise"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Special Core Exercises */}
            <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-[#151722] mt-2 shadow-sm">
              <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Special Core Exercises</span>
              </div>

              {/* 2nd bottom row: Text: "Push Up", Reps Input (number only) */}
              <div className="p-2.5 border-b border-slate-800/80 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Push Up</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-slate-400">Reps:</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={activity.pushUpReps || ''}
                    onChange={(e) => handleUpdatePushUp(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-[#10121a] border border-slate-700 rounded-lg text-slate-100 text-xs font-mono tabular-nums text-center focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Very bottom row: Text: "Plank", Second input (number only) */}
              <div className="p-2.5 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Plank</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-slate-400">Seconds:</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={activity.plankSeconds || ''}
                    onChange={(e) => handleUpdatePlank(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-[#10121a] border border-slate-700 rounded-lg text-slate-100 text-xs font-mono tabular-nums text-center focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
