import React, { useState } from 'react';
import { Database, X, RefreshCw, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RoomDatabase } from '../db/room';

interface RoomInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const RoomInspectorModal: React.FC<RoomInspectorModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'meals' | 'activities'>('overview');
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const workouts = RoomDatabase.workouts.getAll();
  const meals = RoomDatabase.meals.getAll();
  const rawActivities = RoomDatabase.activity.getRecentDays(7);

  const handleReset = () => {
    if (confirm('Reset Room Database to initial seed state (Telur Dadar, Lateral Raise, etc.)?')) {
      RoomDatabase.resetToDefaults();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2000);
      onDataReset();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161821] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#12141c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Room Database Inspector</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                  v1.0 Local SQLite
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Zero Cloud. All data stored directly on device in local Room storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800 bg-[#14161f] text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Schema Overview
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'workouts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            workout_table ({workouts.length})
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'meals'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            meal_table ({meals.length})
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'activities'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            activity_history (7d)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 text-sm space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Workout Table</div>
                  <div className="text-xl font-bold text-white mt-1">{workouts.length} items</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">@Entity(tableName = &quot;workout_table&quot;)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Meal Table</div>
                  <div className="text-xl font-bold text-white mt-1">{meals.length} items</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">@Entity(tableName = &quot;meal_table&quot;)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Auth Engine</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">iwan</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">Local Password Validation</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Android Room Architecture Notes
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li><strong className="text-slate-200">Local Only:</strong> No remote servers or cloud database connections are invoked.</li>
                  <li><strong className="text-slate-200">Scoring Engine:</strong> Meal Portion (Small = Grade &times; 2, Medium = Grade &times; 5, Large = Grade &times; 10).</li>
                  <li><strong className="text-slate-200">Workout Engine:</strong> Reps &times; Sets (Push Up &amp; Plank recorded separately and excluded from main workout total score).</li>
                  <li><strong className="text-slate-200">Pre-seeded Entities:</strong> Lateral Raise, Supinated Bicep Curls, Bicep Curls, Tricep Extension, Telur Dadar (20), Telur Rebus (10), Nasi Putih (50), Nasi Padang (100).</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'workouts' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="text-slate-400 text-[11px] mb-2">SELECT * FROM workout_table ORDER BY createdAt DESC:</div>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Workout Type</th>
                      <th className="p-2.5">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {workouts.map(w => (
                      <tr key={w.id} className="hover:bg-slate-900/40">
                        <td className="p-2.5 text-slate-500">{w.id}</td>
                        <td className="p-2.5 text-emerald-400 font-semibold">{w.name}</td>
                        <td className="p-2.5 text-slate-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'meals' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="text-slate-400 text-[11px] mb-2">SELECT * FROM meal_table ORDER BY grade DESC:</div>
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Meal Type</th>
                      <th className="p-2.5">Meal Grade</th>
                      <th className="p-2.5">Portion Med Score (x5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {meals.map(m => (
                      <tr key={m.id} className="hover:bg-slate-900/40">
                        <td className="p-2.5 text-slate-500">{m.id}</td>
                        <td className="p-2.5 text-teal-400 font-semibold">{m.name}</td>
                        <td className="p-2.5 text-amber-400 tabular-nums">{m.grade}</td>
                        <td className="p-2.5 text-slate-300 tabular-nums">{m.grade * 5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-slate-400 text-[11px]">7-Day Activity Records stored in local Room:</div>
              <div className="space-y-2">
                {rawActivities.map(({ date, displayDay, activity }) => {
                  const mealCount = activity.meals?.length || 0;
                  const workoutCount = activity.workouts?.length || 0;
                  return (
                    <div key={date} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold">{displayDay}</span>
                        <span className="text-slate-500 ml-2">({date})</span>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Meals: {mealCount} items · Workouts: {workoutCount} items · Pushups: {activity.pushUpReps || 0} · Plank: {activity.plankSeconds || 0}s
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Room Entity
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#12141c] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted in Device LocalStorage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-950/40 border border-amber-800/60 rounded-lg hover:bg-amber-900/50 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Seed Defaults</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>

        {resetDone && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg shadow-lg flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Database restored to initial seed state!
          </div>
        )}
      </div>
    </div>
  );
};
