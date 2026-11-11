/**
 * Android Jetpack Room Database Architecture Simulation
 * All entities, DAOs, and database operations run locally using browser storage
 * with zero cloud dependencies.
 */

export interface WorkoutEntity {
  id: string;
  name: string;
  createdAt: string;
}

export interface MealEntity {
  id: string;
  name: string;
  grade: number;
  createdAt: string;
}

export type MealPortion = 'Small' | 'Medium' | 'Large' | '';
export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface ActivityMealItem {
  id: string;
  mealId: string;
  mealName: string;
  grade: number;
  portion: MealPortion;
  category: MealCategory;
  score: number;
}

export interface ActivityWorkoutItem {
  id: string;
  workoutTypeId: string;
  workoutName: string;
  reps: number;
  sets: number;
  score: number;
}

export interface DailyActivityEntity {
  date: string; // YYYY-MM-DD
  meals: ActivityMealItem[];
  workouts: ActivityWorkoutItem[];
  pushUpReps: number;
  plankSeconds: number;
  updatedAt: string;
}

export interface UserEntity {
  username: string;
  passwordHash: string; // Plain/hash for simple auth as requested
  displayName: string;
}

// Formula implementations
export function calculateMealScore(grade: number, portion: MealPortion): number {
  if (portion === 'Small') {
    return grade * 2;
  }
  if (portion === 'Medium') {
    return grade * 5;
  }
  // Large = Meal Grade x 10
  if (portion === 'Large') {
    return grade * 10;
  }
  return 0;
}

export function calculateWorkoutScore(reps: number, sets: number): number {
  const r = Number(reps) || 0;
  const s = Number(sets) || 0;
  return r * s;
}

export type MealIntensity = 'Skip' | 'Low' | 'Medium' | 'High';

export function getMealIntensity(totalScore: number): MealIntensity {
  if (!totalScore || totalScore <= 0) {
    return 'Skip';
  }
  // Low = Total Meal Score between 0 to 1149
  if (totalScore <= 1149) {
    return 'Low';
  }
  // Medium = Total Meal Score between 1150 - 2499
  if (totalScore <= 2499) {
    return 'Medium';
  }
  // High = Total Meal Score more than 2500
  return 'High';
}

export type WorkoutIntensity = 'Skip' | 'Low' | 'Medium Low' | 'Medium' | 'Medium High' | 'High';

export function getWorkoutIntensity(totalScore: number): WorkoutIntensity {
  if (!totalScore || totalScore <= 0) {
    return 'Skip';
  }
  // Low = 50 to 99 (or 1 to 99)
  if (totalScore < 50) {
    return 'Low';
  }
  if (totalScore <= 99) {
    return 'Low';
  }
  // Medium Low = 100 to 149
  if (totalScore <= 149) {
    return 'Medium Low';
  }
  // Medium = 150 to 199
  if (totalScore <= 199) {
    return 'Medium';
  }
  // Medium High = 200 to 299
  if (totalScore <= 299) {
    return 'Medium High';
  }
  // High = more than 300 (>= 300)
  return 'High';
}

// Storage keys
const ROOM_STORAGE_PREFIX = 'room_android_fittrack_';
const KEY_WORKOUTS = `${ROOM_STORAGE_PREFIX}workouts`;
const KEY_MEALS = `${ROOM_STORAGE_PREFIX}meals`;
const KEY_ACTIVITIES = `${ROOM_STORAGE_PREFIX}activities`;
const KEY_SESSION = `${ROOM_STORAGE_PREFIX}session`;

// Initial Pre-population Seeding (Room Callback simulation)
const INITIAL_WORKOUTS: WorkoutEntity[] = [
  { id: 'w_1', name: 'Lateral Raise', createdAt: new Date().toISOString() },
  { id: 'w_2', name: 'Supinated Bicep Curls', createdAt: new Date().toISOString() },
  { id: 'w_3', name: 'Bicep Curls', createdAt: new Date().toISOString() },
  { id: 'w_4', name: 'Tricep Extension', createdAt: new Date().toISOString() },
];

const INITIAL_MEALS: MealEntity[] = [
  { id: 'm_1', name: 'Telur Dadar', grade: 20, createdAt: new Date().toISOString() },
  { id: 'm_2', name: 'Telur Rebus', grade: 10, createdAt: new Date().toISOString() },
  { id: 'm_3', name: 'Nasi Putih', grade: 50, createdAt: new Date().toISOString() },
  { id: 'm_4', name: 'Nasi Padang', grade: 100, createdAt: new Date().toISOString() },
];

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Room DB Read Error for key:', key, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger storage event for reactive UI in same window
    window.dispatchEvent(new Event('room_db_update'));
  } catch (e) {
    console.error('Room DB Write Error for key:', key, e);
  }
}

// Helper to get formatted local date string YYYY-MM-DD
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Clean and purge any dummy/sample activity data so activities start completely empty
function purgeDummyActivityData(): void {
  try {
    const activities = getStored<Record<string, DailyActivityEntity>>(KEY_ACTIVITIES, {});
    let modified = false;
    const cleaned: Record<string, DailyActivityEntity> = {};

    for (const [date, act] of Object.entries(activities)) {
      // Check for seeded dummy IDs (im_*, iw_*)
      const realMeals = (act.meals || []).filter((m) => !m.id.startsWith('im_'));
      const realWorkouts = (act.workouts || []).filter((w) => !w.id.startsWith('iw_'));
      const hadDummyItems =
        (act.meals || []).some((m) => m.id.startsWith('im_')) ||
        (act.workouts || []).some((w) => w.id.startsWith('iw_'));

      // If the day had dummy data and no real user-created items
      if (hadDummyItems && realMeals.length === 0 && realWorkouts.length === 0) {
        modified = true;
        // Don't retain this dummy day
        continue;
      }

      if (
        realMeals.length !== (act.meals || []).length ||
        realWorkouts.length !== (act.workouts || []).length
      ) {
        modified = true;
        cleaned[date] = {
          ...act,
          meals: realMeals,
          workouts: realWorkouts,
          pushUpReps: hadDummyItems ? 0 : act.pushUpReps,
          plankSeconds: hadDummyItems ? 0 : act.plankSeconds,
        };
      } else {
        cleaned[date] = act;
      }
    }

    if (modified || !localStorage.getItem(`${ROOM_STORAGE_PREFIX}purged_dummy_activity_v1`)) {
      setStored(KEY_ACTIVITIES, cleaned);
      localStorage.setItem(`${ROOM_STORAGE_PREFIX}purged_dummy_activity_v1`, 'true');
    }
  } catch (e) {
    console.error('Error purging dummy activity data:', e);
  }
}

// Room Database DAO Layer
export const RoomDatabase = {
  // Database initialization
  init() {
    if (!localStorage.getItem(KEY_WORKOUTS)) {
      setStored(KEY_WORKOUTS, INITIAL_WORKOUTS);
    }
    if (!localStorage.getItem(KEY_MEALS)) {
      setStored(KEY_MEALS, INITIAL_MEALS);
    }
    // Purge any dummy activities if previously stored
    purgeDummyActivityData();
    // Synchronize stored meal scores with updated formulas
    try {
      const activities = getStored<Record<string, DailyActivityEntity>>(KEY_ACTIVITIES, {});
      let updated = false;
      for (const act of Object.values(activities)) {
        for (const meal of act.meals || []) {
          const correctScore = calculateMealScore(meal.grade, meal.portion);
          if (meal.score !== correctScore) {
            meal.score = correctScore;
            updated = true;
          }
        }
      }
      if (updated) {
        setStored(KEY_ACTIVITIES, activities);
      }
    } catch (e) {
      console.error('Error syncing meal scores with formula:', e);
    }
  },

  resetToDefaults() {
    localStorage.removeItem(KEY_WORKOUTS);
    localStorage.removeItem(KEY_MEALS);
    localStorage.removeItem(KEY_ACTIVITIES);
    localStorage.removeItem(`${ROOM_STORAGE_PREFIX}purged_dummy_activity_v1`);
    this.init();
    window.dispatchEvent(new Event('room_db_update'));
  },

  // Workouts DAO
  workouts: {
    getAll(): WorkoutEntity[] {
      return getStored<WorkoutEntity[]>(KEY_WORKOUTS, INITIAL_WORKOUTS);
    },
    insert(name: string): WorkoutEntity {
      const list = this.getAll();
      const newEntity: WorkoutEntity = {
        id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      setStored(KEY_WORKOUTS, [newEntity, ...list]);
      return newEntity;
    },
    update(id: string, name: string): boolean {
      const list = this.getAll();
      const idx = list.findIndex(w => w.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], name: name.trim() };
        setStored(KEY_WORKOUTS, list);
        return true;
      }
      return false;
    },
    delete(id: string): boolean {
      const list = this.getAll();
      const filtered = list.filter(w => w.id !== id);
      setStored(KEY_WORKOUTS, filtered);
      return true;
    },
  },

  // Meals DAO
  meals: {
    getAll(): MealEntity[] {
      return getStored<MealEntity[]>(KEY_MEALS, INITIAL_MEALS);
    },
    insert(name: string, grade: number): MealEntity {
      const list = this.getAll();
      const newEntity: MealEntity = {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        grade: Math.max(0, Math.floor(grade)),
        createdAt: new Date().toISOString(),
      };
      setStored(KEY_MEALS, [newEntity, ...list]);
      return newEntity;
    },
    update(id: string, name: string, grade: number): boolean {
      const list = this.getAll();
      const idx = list.findIndex(m => m.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], name: name.trim(), grade: Math.max(0, Math.floor(grade)) };
        setStored(KEY_MEALS, list);
        return true;
      }
      return false;
    },
    delete(id: string): boolean {
      const list = this.getAll();
      const filtered = list.filter(m => m.id !== id);
      setStored(KEY_MEALS, filtered);
      return true;
    },
  },

  // Activity DAO
  activity: {
    getByDate(date: string): DailyActivityEntity {
      const activities = getStored<Record<string, DailyActivityEntity>>(KEY_ACTIVITIES, {});
      if (activities[date]) {
        return activities[date];
      }
      return {
        date,
        meals: [],
        workouts: [],
        pushUpReps: 0,
        plankSeconds: 0,
        updatedAt: new Date().toISOString(),
      };
    },

    save(activity: DailyActivityEntity): void {
      const activities = getStored<Record<string, DailyActivityEntity>>(KEY_ACTIVITIES, {});
      activities[activity.date] = {
        ...activity,
        updatedAt: new Date().toISOString(),
      };
      setStored(KEY_ACTIVITIES, activities);
    },

    getRecentDays(daysCount = 7, referenceDate: Date = new Date()): { date: string; displayDay: string; displayDate: string; activity: DailyActivityEntity }[] {
      const result = [];
      const activities = getStored<Record<string, DailyActivityEntity>>(KEY_ACTIVITIES, {});

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(referenceDate);
        d.setDate(d.getDate() - i);
        const dateKey = getLocalDateString(d);
        
        const isToday = i === 0;
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const act = activities[dateKey] || {
          date: dateKey,
          meals: [],
          workouts: [],
          pushUpReps: 0,
          plankSeconds: 0,
          updatedAt: '',
        };

        result.push({
          date: dateKey,
          displayDay: isToday ? 'Today' : dayName,
          displayDate: monthDay,
          activity: act,
        });
      }

      return result;
    },

    clearDate(date: string): void {
      const activities = getStored<Record<string, DailyActivityEntity>>(KEY_ACTIVITIES, {});
      delete activities[date];
      setStored(KEY_ACTIVITIES, activities);
    },

    clearAll(): void {
      setStored(KEY_ACTIVITIES, {});
    },
  },

  // Auth Session DAO
  auth: {
    login(username: string, password: string):boolean {
      // Requested credentials: username: iwan, password: nirvana
      if (username.trim().toLowerCase() === 'iwan' && password === 'nirvana') {
        const session: UserEntity = {
          username: 'iwan',
          passwordHash: 'nirvana',
          displayName: 'Iwan',
        };
        setStored(KEY_SESSION, session);
        return true;
      }
      return false;
    },

    getCurrentUser(): UserEntity | null {
      return getStored<UserEntity | null>(KEY_SESSION, null);
    },

    logout(): void {
      localStorage.removeItem(KEY_SESSION);
      window.dispatchEvent(new Event('room_db_update'));
    },
  },
};

// Initialize on module load
RoomDatabase.init();
