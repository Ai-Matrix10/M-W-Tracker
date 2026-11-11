import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Trash2, Edit2, Check, X, Search, Sparkles } from 'lucide-react';
import { RoomDatabase, MealEntity } from '../db/room';

export const MealPage: React.FC = () => {
  const [meals, setMeals] = useState<MealEntity[]>([]);
  const [mealTypeInput, setMealTypeInput] = useState('');
  const [mealGradeInput, setMealGradeInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingGrade, setEditingGrade] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadMeals = () => {
    setMeals(RoomDatabase.meals.getAll());
  };

  useEffect(() => {
    loadMeals();
    const handleUpdate = () => loadMeals();
    window.addEventListener('room_db_update', handleUpdate);
    return () => window.removeEventListener('room_db_update', handleUpdate);
  }, []);

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealTypeInput.trim()) return;
    const gradeNum = Number(mealGradeInput) || 0;

    RoomDatabase.meals.insert(mealTypeInput.trim(), gradeNum);
    setMealTypeInput('');
    setMealGradeInput('');
    setFeedbackMsg(`Added "${mealTypeInput.trim()}" (Grade ${gradeNum}) to Meal Table`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleStartEdit = (m: MealEntity) => {
    setEditingId(m.id);
    setEditingName(m.name);
    setEditingGrade(String(m.grade));
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    const gradeNum = Number(editingGrade) || 0;
    RoomDatabase.meals.update(id, editingName.trim(), gradeNum);
    setEditingId(null);
    setEditingName('');
    setEditingGrade('');
    setFeedbackMsg('Meal updated');
    setTimeout(() => setFeedbackMsg(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}" from Meal Table?`)) {
      RoomDatabase.meals.delete(id);
      setFeedbackMsg(`Deleted "${name}"`);
      setTimeout(() => setFeedbackMsg(null), 2000);
    }
  };

  const filteredMeals = meals.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGradeBadgeStyle = (grade: number) => {
    if (grade >= 80 && grade <= 100) {
      return 'bg-rose-950/70 border-rose-800/80 text-rose-400';
    }
    if (grade >= 50 && grade <= 79) {
      return 'bg-amber-950/70 border-amber-800/80 text-amber-400';
    }
    return 'bg-teal-950/60 border-teal-800/60 text-teal-300';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">Meal Management</h2>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-teal-950/60 border border-teal-800/80 rounded-xl text-xs text-teal-300 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Input Form as specifically required:
          "1. A input text titled Meal Type, input text Meal Grade is number only, and OK Button, when press, put to the Meal Table" */}
      <div className="bg-[#181a24] border border-slate-800 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Add New Meal</span>
        </h3>

        <form onSubmit={handleAddMeal} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meal Type
              </label>
              <input
                type="text"
                value={mealTypeInput}
                onChange={(e) => setMealTypeInput(e.target.value)}
                placeholder="e.g. Ayam Bakar, Oatmeal..."
                className="w-full px-3 py-2 bg-[#11131a] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meal Grade <span className="text-slate-400 font-normal">(number only)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={mealGradeInput}
                  onChange={(e) => setMealGradeInput(e.target.value)}
                  placeholder="e.g. 20, 50, 100"
                  className="flex-1 px-3 py-2 bg-[#11131a] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors tabular-nums"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 active:scale-95 shrink-0"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* List of Meal Table as specifically required:
          "2. List of Meal Table that already made, with edit and delete button
           3. put these to the Meal Table: Telur Dadar grade 20, Telur Rebus grade 10, Nasi Putih grade 50, Nasi Padang grade 100" */}
      <div className="bg-[#181a24] border border-slate-800/90 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-teal-400" />
              <span>Meal Table</span>
              <span className="text-xs font-mono text-teal-400 bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded-full">
                {meals.length} items
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
              placeholder="Search meals..."
              className="pl-8 pr-3 py-1.5 bg-[#11131a] border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 w-full sm:w-48"
            />
          </div>
        </div>

        {filteredMeals.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-[#12141c] rounded-2xl border border-slate-800/60">
            No meals found. Use the form above to add one.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 border border-slate-800/80 rounded-2xl overflow-hidden bg-[#12141c]">
            {filteredMeals.map((meal) => {
              const isEditing = editingId === meal.id;

              return (
                <div
                  key={meal.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-[#161822] transition-colors"
                >
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Meal Type"
                        className="flex-1 px-3 py-1.5 bg-[#0f1015] border border-teal-500 rounded-lg text-sm text-white focus:outline-none"
                        autoFocus
                      />
                      <input
                        type="number"
                        min="0"
                        value={editingGrade}
                        onChange={(e) => setEditingGrade(e.target.value)}
                        placeholder="Grade"
                        className="w-24 px-3 py-1.5 bg-[#0f1015] border border-teal-500 rounded-lg text-sm text-white focus:outline-none tabular-nums"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(meal.id)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                          title="Save Changes"
                          aria-label="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                          title="Cancel"
                          aria-label="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Name and colored Grade pill without number or portion preview */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm font-semibold text-slate-100 truncate">
                          {meal.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border shrink-0 ${getGradeBadgeStyle(meal.grade)}`}>
                          Grade: {meal.grade}
                        </span>
                      </div>

                      {/* Resized smaller Edit and Delete buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(meal)}
                          className="p-1 text-slate-400 hover:text-teal-300 hover:bg-teal-950/40 rounded transition-colors"
                          title="Edit Meal"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(meal.id, meal.name)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          title="Delete Meal"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
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
