import React, { useState } from 'react';
import {
  Dumbbell,
  Clock,
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Zap,
  Info,
  Calendar,
  X,
} from 'lucide-react';
import {
  ExerciseDefinition,
  WorkoutFeeling,
  WorkoutIntensity,
  WorkoutLog,
  WorkoutPlan,
} from '../types';
import { EXERCISE_LIBRARY, calculateCaloriesBurned } from '../data/exerciseLibrary';

interface WorkoutViewProps {
  userId: string;
  selectedDate: string;
  currentWeightKg: number;
  workoutLogs: WorkoutLog[];
  workoutPlans: WorkoutPlan[];
  onAddWorkout: (workout: Omit<WorkoutLog, 'id'>) => Promise<void>;
  onDeleteWorkout: (logId: string) => Promise<void>;
  onSavePlan: (plan: Omit<WorkoutPlan, 'id'>) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  userId,
  selectedDate,
  currentWeightKg,
  workoutLogs,
  workoutPlans,
  onAddWorkout,
  onDeleteWorkout,
  onSavePlan,
  onDeletePlan,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Workout form values
  const [customName, setCustomName] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<WorkoutIntensity>('moderate');
  const [feelingAfter, setFeelingAfter] = useState<WorkoutFeeling>('good');
  const [notes, setNotes] = useState('');

  // Weekly Plan Modal State
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState('Lịch tập 4 buổi/tuần săn chắc');
  const [planDays, setPlanDays] = useState([
    { day: 'Thứ 2', title: 'Cardio & Đi bộ nhanh', exercises: [{ name: 'Đi bộ nhanh ngoài trời', sets: '1', reps: '1', duration: '30 phút', estimatedCalories: 150, notes: 'Khởi động 5p' }] },
    { day: 'Thứ 3', title: 'Nghỉ ngơi hồi phục', exercises: [] },
    { day: 'Thứ 4', title: 'Tập mông đùi tại nhà', exercises: [{ name: 'Tập mông đùi tại nhà (Squat & Lunge)', sets: '3', reps: '15', duration: '25 phút', estimatedCalories: 130, notes: 'Squat & Glute bridge' }] },
    { day: 'Thứ 5', title: 'Pilates siết eo & bụng', exercises: [{ name: 'Pilates thảm siết eo & bụng', sets: '1', reps: '1', duration: '20 phút', estimatedCalories: 90, notes: 'Hít thở khung sườn' }] },
    { day: 'Thứ 6', title: 'Nghỉ ngơi', exercises: [] },
    { day: 'Thứ 7', title: 'Yoga thư giãn', exercises: [{ name: 'Yoga Vinyasa năng động', sets: '1', reps: '1', duration: '35 phút', estimatedCalories: 120, notes: 'Giãn cơ sâu' }] },
    { day: 'Chủ nhật', title: 'Nghỉ ngơi chuẩn bị tuần mới', exercises: [] },
  ]);

  const categories = ['Tất cả', 'Đi bộ', 'Chạy bộ', 'Đạp xe', 'Yoga', 'Pilates', 'Tập tại nhà', 'Cardio', 'Giãn cơ', 'Tập sức mạnh'];

  const filteredExercises = selectedCategory === 'Tất cả'
    ? EXERCISE_LIBRARY
    : EXERCISE_LIBRARY.filter((e) => e.category === selectedCategory);

  const calculatedCalories = selectedExercise
    ? calculateCaloriesBurned(selectedExercise.met, currentWeightKg, duration)
    : Math.round(duration * 5); // default fallback

  const handleOpenAddModal = (exercise?: ExerciseDefinition) => {
    if (exercise) {
      setSelectedExercise(exercise);
      setCustomName(exercise.name);
    } else {
      setSelectedExercise(null);
      setCustomName('');
    }
    setDuration(30);
    setIntensity('moderate');
    setFeelingAfter('good');
    setNotes('');
    setModalOpen(true);
  };

  const handleSaveWorkout = async () => {
    const exerciseName = selectedExercise ? selectedExercise.name : customName.trim();
    if (!exerciseName) return;

    await onAddWorkout({
      workoutType: selectedExercise ? selectedExercise.category : 'Khác',
      exerciseName,
      durationMinutes: duration,
      intensity,
      estimatedCaloriesBurned: calculatedCalories,
      feelingAfter,
      notes: notes.trim(),
      date: selectedDate,
      createdAt: new Date().toISOString(),
    });

    setModalOpen(false);
  };

  const handleSaveWeeklyPlan = async () => {
    if (!planName.trim()) return;
    await onSavePlan({
      name: planName.trim(),
      days: planDays,
      createdAt: new Date().toISOString(),
    });
    setPlanModalOpen(false);
  };

  const totalWorkoutMinutes = workoutLogs.reduce((s, i) => s + (i.durationMinutes || 0), 0);
  const totalCaloriesBurned = workoutLogs.reduce((s, i) => s + (i.estimatedCaloriesBurned || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-left">
      {/* Header & Daily Workout Stats */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#343746] dark:text-white">
            Tập luyện & Vận động ({selectedDate})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ghi nhận thời lượng tập để kích hoạt trao đổi chất và bù trừ năng lượng an toàn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#FFF8EF] dark:bg-gray-800 px-4 py-2 rounded-2xl border border-[#FCE8EF] dark:border-gray-700 flex items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Thời lượng hôm nay</span>
              <span className="text-sm font-extrabold text-[#343746] dark:text-white">
                {totalWorkoutMinutes} phút
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Calo tiêu hao</span>
              <span className="text-sm font-extrabold text-emerald-600">
                ~{totalCaloriesBurned} kcal
              </span>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi bài tập tùy chọn</span>
          </button>
        </div>
      </div>

      {/* Today's Logged Workouts List */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm">
        <h3 className="font-extrabold text-sm sm:text-base text-[#343746] dark:text-white mb-3">
          Bài tập đã hoàn thành trong ngày
        </h3>

        {workoutLogs.length === 0 ? (
          <div className="py-8 text-center bg-[#FFF8EF]/50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-[#F4A7C3]/40">
            <Dumbbell className="w-8 h-8 mx-auto text-gray-400 opacity-50 mb-2" />
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Hôm nay bạn chưa ghi nhận bài tập nào.
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Chọn một bài tập từ thư viện bên dưới để bắt đầu ghi nhận!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {workoutLogs.map((log) => (
              <div
                key={log.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-bold text-xs sm:text-sm text-[#343746] dark:text-white">
                      {log.exerciseName}
                    </h4>
                    <span className="text-[10px] font-semibold text-[#3978AE] bg-[#FCE8EF] dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      {log.workoutType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.durationMinutes} phút
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <Flame className="w-3 h-3" /> ~{log.estimatedCaloriesBurned} kcal
                    </span>
                    {log.feelingAfter && (
                      <>
                        <span>·</span>
                        <span className="capitalize">Cảm giác: {log.feelingAfter}</span>
                      </>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-[11px] text-gray-500 mt-0.5 italic">
                      "{log.notes}"
                    </p>
                  )}
                </div>

                <button
                  onClick={() => log.id && onDeleteWorkout(log.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                  title="Xóa bài tập này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exercise Library Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#343746] dark:text-white">
              Thư viện bài tập khoa học
            </h3>
            <p className="text-xs text-gray-400">
              Chỉ số MET chuẩn hóa giúp ước tính lượng calo tiêu thụ theo trọng lượng cơ thể ({currentWeightKg} kg).
            </p>
          </div>

          <button
            onClick={() => setPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#FCE8EF] to-[#FFF8EF] dark:from-gray-800 dark:to-gray-800 text-[#3978AE] dark:text-[#83BDEB] border border-[#F4A7C3]/40 rounded-xl text-xs font-bold hover:shadow-xs transition-all self-start sm:self-auto"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kế hoạch tuần & Ngày nghỉ</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#3978AE] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            const burned30m = calculateCaloriesBurned(exercise.met, currentWeightKg, 30);
            return (
              <div
                key={exercise.id}
                className="p-5 rounded-2xl bg-[#FFF8EF]/50 dark:bg-gray-800/40 border border-[#FCE8EF] dark:border-gray-800 flex flex-col justify-between hover:border-[#F4A7C3] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#3978AE] uppercase tracking-wider bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md border border-[#F4A7C3]/30">
                      {exercise.category}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {exercise.difficulty}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-[#343746] dark:text-white">
                    {exercise.name}
                  </h4>

                  <div className="flex flex-wrap gap-1 mt-2 mb-3">
                    {exercise.muscleGroups.map((m) => (
                      <span key={m} className="text-[10px] text-gray-500 bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded">
                        {m}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {exercise.safetyNotes}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#FCE8EF] dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">
                    ~{burned30m} kcal / 30 phút
                  </span>

                  <button
                    onClick={() => handleOpenAddModal(exercise)}
                    className="px-3 py-1.5 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Ghi bài này
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECORD WORKOUT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#FCE8EF] dark:border-gray-800 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
                {selectedExercise ? selectedExercise.name : 'Ghi nhận bài tập'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!selectedExercise && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tên hoạt động
                  </label>
                  <input
                    type="text"
                    placeholder="Vd: Nhảy dây, leo cầu thang..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Thời lượng thực tế (phút)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
              </div>

              {/* Calculated preview */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>Ước tính calo tiêu thụ:</span>
                <span className="font-extrabold text-base text-emerald-600">
                  ~{calculatedCalories} kcal
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Cảm giác sau buổi tập
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'great', label: 'Tuyệt vời', icon: Smile },
                    { id: 'good', label: 'Khỏe', icon: Zap },
                    { id: 'tired', label: 'Mỏi nhẹ', icon: Meh },
                    { id: 'exhausted', label: 'Kiệt sức', icon: Frown },
                  ].map((f) => {
                    const Icon = f.icon;
                    const isSelected = feelingAfter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFeelingAfter(f.id as WorkoutFeeling)}
                        className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'border-[#3978AE] bg-[#FCE8EF] dark:bg-gray-800 font-bold text-[#3978AE]'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[10px]">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú buổi tập (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Vd: Hôm nay chạy rất sảng khoái, không đau gối..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveWorkout}
                  className="px-5 py-2.5 bg-[#3978AE] text-white rounded-xl text-xs font-bold"
                >
                  Hoàn tất & Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY WORKOUT PLAN MODAL */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#FCE8EF] dark:border-gray-800 my-8 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="font-extrabold text-base sm:text-lg text-[#343746] dark:text-white">
                Kế hoạch tập luyện theo tuần
              </h3>
              <button onClick={() => setPlanModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tên kế hoạch
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {planDays.map((d, index) => (
                  <div
                    key={d.day}
                    className="p-3 rounded-2xl bg-[#FFF8EF]/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-extrabold text-[#3978AE] uppercase">
                        {d.day}
                      </span>
                      <input
                        type="text"
                        value={d.title}
                        onChange={(e) => {
                          const updated = [...planDays];
                          updated[index].title = e.target.value;
                          setPlanDays(updated);
                        }}
                        className="block w-full text-xs font-bold text-[#343746] dark:text-white bg-transparent border-b border-dashed border-gray-300 focus:outline-none mt-0.5"
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {d.exercises.length > 0 ? `${d.exercises.length} bài tập` : 'Ngày nghỉ ngơi'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveWeeklyPlan}
                  className="px-5 py-2 bg-[#3978AE] text-white rounded-xl text-xs font-bold"
                >
                  Lưu kế hoạch tuần
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
