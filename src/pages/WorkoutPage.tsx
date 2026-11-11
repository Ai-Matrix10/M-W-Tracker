import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, Trash2, Edit2, Check, X, Search, Sparkles } from 'lucide-react';
import { RoomDatabase, WorkoutEntity } from '../db/room';

export const WorkoutPage: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutEntity[]>([]);
  const [workoutTypeInput, setWorkoutTypeInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadWorkouts = () => {
    setWorkouts(RoomDatabase.workouts.getAll());
  };

  useEffect(() => {
    loadWorkouts();
    const handleUpdate = () => loadWorkouts();
    window.addEventListener('room_db_update', handleUpdate);
    return () => window.removeEventListener('room_db_update', handleUpdate);
  }, []);

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTypeInput.trim()) return;

    RoomDatabase.workouts.insert(workoutTypeInput.trim());
    setWorkoutTypeInput('');
    setFeedbackMsg(`Added "${workoutTypeInput.trim()}" to Workout Table`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleStartEdit = (w: WorkoutEntity) => {
    setEditingId(w.id);
    setEditingName(w.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    RoomDatabase.workouts.update(id, editingName.trim());
    setEditingId(null);
    setEditingName('');
    setFeedbackMsg('Workout updated');
    setTimeout(() => setFeedbackMsg(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}" from Workout Table?`)) {
      RoomDatabase.workouts.delete(id);
      setFeedbackMsg(`Deleted "${name}"`);
      setTimeout(() => setFeedbackMsg(null), 2000);
    }
  };

  const filteredWorkouts = workouts.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">Workout Management</h2>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-xl text-xs text-purple-300 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Input Form as specifically required:
          "1. A input text titled Workout Type and OK Button, when press, put to the Workout Table" */}
      <div className="bg-[#181a24] border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          <span>Add New Workout</span>
        </h3>

        <form onSubmit={handleAddWorkout} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Workout Type
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={workoutTypeInput}
                onChange={(e) => setWorkoutTypeInput(e.target.value)}
                placeholder="e.g. Lateral Raise, Incline Dumbbell Press..."
                className="flex-1 px-3 py-2 bg-[#11131a] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-purple-600/20 active:scale-95 shrink-0"
              >
                OK
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List of Workout Table as requested:
          "2. List of Workout Table that already made, with edit and delete button
           3. Put these to the Workout Table: Lateral Raise, Supinated Bicep Curls, Bicep Curls, Tricep Extension" */}
      <div className="bg-[#181a24] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-purple-400" />
              <span>Workout Table</span>
              <span className="text-xs font-mono text-purple-400 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded-full">
                {workouts.length} items
              </span>
            </h3>
          </div>

          {/* Search filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workouts..."
              className="pl-8 pr-3 py-1.5 bg-[#11131a] border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 w-full sm:w-48"
            />
          </div>
        </div>

        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-[#12141c] rounded-2xl border border-slate-800/60">
            No workouts found. Use the form above to add one.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 border border-slate-800/80 rounded-2xl overflow-hidden bg-[#12141c]">
            {filteredWorkouts.map((workout, index) => {
              const isEditing = editingId === workout.id;

              return (
                <div
                  key={workout.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#161822] transition-colors"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#0f1015] border border-purple-500 rounded-lg text-sm text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(workout.id)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                        title="Save Changes"
                        aria-label="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                        title="Cancel"
                        aria-label="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-slate-400 w-6 text-right tabular-nums">
                          {index + 1}.
                        </span>
                        <div className="truncate">
                          <span className="text-sm font-semibold text-slate-100 truncate block">
                            {workout.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {workout.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEdit(workout)}
                          className="p-2 text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 rounded-lg transition-colors active:scale-95"
                          title="Edit Workout"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(workout.id, workout.name)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors active:scale-95"
                          title="Delete Workout"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
