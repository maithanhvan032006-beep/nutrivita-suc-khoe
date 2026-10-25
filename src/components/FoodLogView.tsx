import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Copy,
  Search,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Flame,
  Filter,
} from 'lucide-react';
import { FoodDatabaseItem, FoodLog, MealType } from '../types';
import { VIETNAMESE_FOOD_DATABASE } from '../data/vietnameseFoods';
import { requestAIFoodAnalysis } from '../services/aiService';

interface FoodLogViewProps {
  userId: string;
  selectedDate: string;
  foodLogs: FoodLog[];
  onAddFood: (food: Omit<FoodLog, 'id'>) => Promise<void>;
  onUpdateFood: (logId: string, food: Partial<FoodLog>) => Promise<void>;
  onDeleteFood: (logId: string) => Promise<void>;
  onCopyMealsToDate: (targetDate: string, mealType?: MealType) => Promise<number>;
}

export const FoodLogView: React.FC<FoodLogViewProps> = ({
  userId,
  selectedDate,
  foodLogs,
  onAddFood,
  onUpdateFood,
  onDeleteFood,
  onCopyMealsToDate,
}) => {
  const [activeMealTypeModal, setActiveMealTypeModal] = useState<MealType | null>(null);
  const [modalMode, setModalMode] = useState<'database' | 'manual' | 'ai'>('database');
  const [filterMeal, setFilterMeal] = useState<MealType | 'all'>('all');

  // Search & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodDatabaseItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('khẩu phần');

  // Manual Form State
  const [manualName, setManualName] = useState('');
  const [manualQuantity, setManualQuantity] = useState(100);
  const [manualUnit, setManualUnit] = useState('g');
  const [manualCalories, setManualCalories] = useState(150);
  const [manualProtein, setManualProtein] = useState(10);
  const [manualCarbs, setManualCarbs] = useState(20);
  const [manualFat, setManualFat] = useState(5);
  const [manualFiber, setManualFiber] = useState(2);

  // AI Scanner State
  const [aiDescription, setAiDescription] = useState('');
  const [aiImageBase64, setAiImageBase64] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Copy meal state
  const [copyTargetDate, setCopyTargetDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyingMealType, setCopyingMealType] = useState<MealType | undefined>(undefined);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const mealSections: { type: MealType; label: string; time: string; defaultCalories: number }[] = [
    { type: 'breakfast', label: 'Bữa sáng', time: '06:00 - 09:00', defaultCalories: 400 },
    { type: 'lunch', label: 'Bữa trưa', time: '11:30 - 13:30', defaultCalories: 600 },
    { type: 'dinner', label: 'Bữa tối', time: '18:00 - 20:00', defaultCalories: 500 },
    { type: 'snack', label: 'Bữa phụ & Tráng miệng', time: 'Linh hoạt', defaultCalories: 200 },
  ];

  // Filtered food list from database
  const filteredDatabase = VIETNAMESE_FOOD_DATABASE.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate dynamic macros when user changes quantity for database food
  const computeFoodNutrition = (food: FoodDatabaseItem, qty: number) => {
    const ratio = food.isPer100g ? qty / 100 : qty / food.defaultServing;
    return {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      fiber: food.fiber ? Math.round(food.fiber * ratio * 10) / 10 : 0,
    };
  };

  const handleSelectDatabaseFood = (food: FoodDatabaseItem) => {
    setSelectedFoodItem(food);
    setQuantity(food.defaultServing);
    setUnit(food.unit);
  };

  const handleSaveDatabaseFood = async () => {
    if (!selectedFoodItem || !activeMealTypeModal) return;
    const computed = computeFoodNutrition(selectedFoodItem, quantity);

    await onAddFood({
      foodName: selectedFoodItem.name,
      date: selectedDate,
      mealType: activeMealTypeModal,
      quantity,
      unit,
      calories: computed.calories,
      protein: computed.protein,
      carbs: computed.carbs,
      fat: computed.fat,
      fiber: computed.fiber,
      source: 'database',
      createdAt: new Date().toISOString(),
    });

    closeModal();
  };

  const handleSaveManualFood = async () => {
    if (!manualName.trim() || !activeMealTypeModal) return;

    await onAddFood({
      foodName: manualName.trim(),
      date: selectedDate,
      mealType: activeMealTypeModal,
      quantity: manualQuantity,
      unit: manualUnit,
      calories: Number(manualCalories) || 0,
      protein: Number(manualProtein) || 0,
      carbs: Number(manualCarbs) || 0,
      fat: Number(manualFat) || 0,
      fiber: Number(manualFiber) || 0,
      source: 'manual',
      createdAt: new Date().toISOString(),
    });

    closeModal();
  };

  const handleRunAIScanner = async () => {
    if (!aiDescription.trim() && !aiImageBase64) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await requestAIFoodAnalysis(aiDescription, aiImageBase64 || undefined);
      setAiResult(result);
    } catch (err: any) {
      setAiError(err.message || 'Lỗi khi gọi AI phân tích món ăn');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAIRunResult = async () => {
    if (!aiResult || !activeMealTypeModal) return;

    await onAddFood({
      foodName: aiResult.foodName || 'Món ăn do AI ước tính',
      date: selectedDate,
      mealType: activeMealTypeModal,
      quantity: Number(aiResult.quantity) || 1,
      unit: aiResult.unit || 'phần',
      calories: Number(aiResult.calories) || 0,
      protein: Number(aiResult.protein) || 0,
      carbs: Number(aiResult.carbs) || 0,
      fat: Number(aiResult.fat) || 0,
      fiber: Number(aiResult.fiber) || 0,
      source: 'ai',
      createdAt: new Date().toISOString(),
    });

    closeModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setActiveMealTypeModal(null);
    setSelectedFoodItem(null);
    setAiResult(null);
    setAiImageBase64(null);
    setAiDescription('');
    setSearchQuery('');
  };

  const handleExecuteCopy = async () => {
    if (!copyTargetDate) return;
    const count = await onCopyMealsToDate(copyTargetDate, copyingMealType);
    setCopyFeedback(`Đã sao chép thành công ${count} món ăn sang ngày ${copyTargetDate}!`);
    setTimeout(() => {
      setCopyModalOpen(false);
      setCopyFeedback(null);
    }, 1800);
  };

  const totalCaloriesDay = foodLogs.reduce((s, i) => s + (i.calories || 0), 0);
  const totalProteinDay = foodLogs.reduce((s, i) => s + (i.protein || 0), 0);
  const totalCarbsDay = foodLogs.reduce((s, i) => s + (i.carbs || 0), 0);
  const totalFatDay = foodLogs.reduce((s, i) => s + (i.fat || 0), 0);
  const totalFiberDay = foodLogs.reduce((s, i) => s + (i.fiber || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-left">
      {/* View Header with Daily Macro Summary */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#343746] dark:text-white">
            Nhật ký ăn uống ({selectedDate})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ghi nhận từng bữa ăn để duy trì mục tiêu thâm hụt hoặc thặng dư calo an toàn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Daily Totals Pills */}
          <div className="bg-[#FFF8EF] dark:bg-gray-800 px-4 py-2 rounded-2xl border border-[#FCE8EF] dark:border-gray-700 flex items-center gap-3 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Tổng calo</span>
              <span className="text-sm font-extrabold text-[#343746] dark:text-white">
                {totalCaloriesDay} kcal
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Đạm</span>
              <span className="font-bold text-rose-500">{Math.round(totalProteinDay)}g</span>
            </div>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Carb</span>
              <span className="font-bold text-amber-500">{Math.round(totalCarbsDay)}g</span>
            </div>
            <span className="text-gray-300">|</span>
            <div>
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Béo</span>
              <span className="font-bold text-sky-500">{Math.round(totalFatDay)}g</span>
            </div>
          </div>

          <button
            onClick={() => {
              setCopyingMealType(undefined);
              setCopyModalOpen(true);
            }}
            disabled={foodLogs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
            title="Sao chép toàn bộ bữa ăn sang ngày khác"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép ngày</span>
          </button>
        </div>
      </div>

      {/* 4 Meals Categorized Sections */}
      <div className="space-y-4">
        {mealSections.map((section) => {
          const sectionLogs = foodLogs.filter((l) => l.mealType === section.type);
          const sectionCalories = sectionLogs.reduce((s, i) => s + (i.calories || 0), 0);
          const sectionProtein = sectionLogs.reduce((s, i) => s + (i.protein || 0), 0);
          const sectionCarbs = sectionLogs.reduce((s, i) => s + (i.carbs || 0), 0);
          const sectionFat = sectionLogs.reduce((s, i) => s + (i.fat || 0), 0);

          return (
            <div
              key={section.type}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm overflow-hidden"
            >
              {/* Meal Section Header */}
              <div className="p-4 sm:p-5 bg-[#FFF8EF]/50 dark:bg-gray-800/40 border-b border-[#FCE8EF] dark:border-gray-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#343746] dark:text-white">
                      {section.label}
                    </h3>
                    <span className="text-[11px] text-gray-400">({section.time})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="font-bold text-[#343746] dark:text-gray-200">
                      {sectionCalories} kcal
                    </span>
                    {sectionLogs.length > 0 && (
                      <span className="text-[11px] text-gray-400">
                        (Đạm: {Math.round(sectionProtein)}g · Carb: {Math.round(sectionCarbs)}g · Béo: {Math.round(sectionFat)}g)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sectionLogs.length > 0 && (
                    <button
                      onClick={() => {
                        setCopyingMealType(section.type);
                        setCopyModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-[#3978AE] hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Sao chép bữa này"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setActiveMealTypeModal(section.type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FCE8EF] hover:bg-[#F4A7C3]/40 text-[#3978AE] dark:bg-gray-800 dark:text-[#83BDEB] rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm món</span>
                  </button>
                </div>
              </div>

              {/* Meal Items List */}
              <div className="p-4 sm:p-5">
                {sectionLogs.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-xs text-gray-400">Chưa có món ăn nào trong bữa này.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {sectionLogs.map((log) => (
                      <div
                        key={log.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-[#343746] dark:text-white">
                              {log.foodName}
                            </h4>
                            {log.source === 'ai' && (
                              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> AI ước tính
                              </span>
                            )}
                            {log.source === 'database' && (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-md">
                                Chuẩn
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                            <span>{log.quantity} {log.unit}</span>
                            <span>·</span>
                            <span>Đạm: {log.protein}g</span>
                            <span>·</span>
                            <span>Carb: {log.carbs}g</span>
                            <span>·</span>
                            <span>Béo: {log.fat}g</span>
                            {log.fiber ? <span>· Xơ: {log.fiber}g</span> : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs sm:text-sm font-extrabold text-[#343746] dark:text-white">
                            {log.calories} kcal
                          </span>
                          <button
                            onClick={() => log.id && onDeleteFood(log.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-colors opacity-80 hover:opacity-100"
                            title="Xóa món này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD FOOD MODAL */}
      {activeMealTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl border border-[#FCE8EF] dark:border-gray-800 p-6 sm:p-7 my-8 text-left transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#343746] dark:text-white">
                  Thêm món vào {mealSections.find((m) => m.type === activeMealTypeModal)?.label}
                </h3>
                <span className="text-xs text-gray-400">Chọn nguồn thực phẩm bạn muốn nhập</span>
              </div>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => setModalMode('database')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  modalMode === 'database'
                    ? 'bg-white dark:bg-gray-700 text-[#3978AE] dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Món ăn Việt Nam ({VIETNAMESE_FOOD_DATABASE.length})
              </button>
              <button
                type="button"
                onClick={() => setModalMode('manual')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  modalMode === 'manual'
                    ? 'bg-white dark:bg-gray-700 text-[#3978AE] dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Nhập thủ công
              </button>
              <button
                type="button"
                onClick={() => setModalMode('ai')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                  modalMode === 'ai'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>AI Scanner</span>
              </button>
            </div>

            {/* TAB 1: VIETNAMESE DATABASE */}
            {modalMode === 'database' && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm: Phở, bún, cơm tấm, bánh mì, ức gà..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/40 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                  />
                </div>

                {/* Food List */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {filteredDatabase.map((food) => {
                    const isSelected = selectedFoodItem?.id === food.id;
                    return (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleSelectDatabaseFood(food)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-[#3978AE] bg-[#FCE8EF]/40 dark:bg-gray-800'
                            : 'border-gray-100 dark:border-gray-800 hover:border-[#F4A7C3]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-[#343746] dark:text-white">
                            {food.name}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            Khẩu phần chuẩn: {food.defaultServing} {food.unit} · {food.calories} kcal
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#3978AE]">
                          {food.calories} kcal
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Food Adjustment */}
                {selectedFoodItem && (
                  <div className="p-4 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 border border-[#F4A7C3]/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#343746] dark:text-white">
                        Điều chỉnh khẩu phần: {selectedFoodItem.name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Nguồn: {selectedFoodItem.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-28">
                        <label className="text-[10px] text-gray-500 block mb-0.5">Số lượng</label>
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-900"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500 block mb-0.5">Đơn vị</label>
                        <input
                          type="text"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-900"
                        />
                      </div>
                    </div>

                    {/* Real-time Recalculated Macros */}
                    {(() => {
                      const computed = computeFoodNutrition(selectedFoodItem, quantity);
                      return (
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#FCE8EF] dark:border-gray-700 font-semibold text-[#343746] dark:text-white">
                          <span>Thành tiền dinh dưỡng:</span>
                          <span className="text-[#3978AE] font-black">
                            {computed.calories} kcal (Đạm: {computed.protein}g · Carb: {computed.carbs}g · Béo: {computed.fat}g)
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-gray-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFoodItem || quantity <= 0}
                    onClick={handleSaveDatabaseFood}
                    className="px-5 py-2.5 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                  >
                    Lưu vào nhật ký
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL ENTRY */}
            {modalMode === 'manual' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tên món ăn hoặc thực phẩm
                  </label>
                  <input
                    type="text"
                    placeholder="Vd: Ức gà nướng thảo mộc..."
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualQuantity}
                      onChange={(e) => setManualQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Đơn vị (g, ml, đĩa, bát...)
                    </label>
                    <input
                      type="text"
                      value={manualUnit}
                      onChange={(e) => setManualUnit(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Calo (kcal)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={manualCalories}
                      onChange={(e) => setManualCalories(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-600 mb-1">
                      Đạm (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-600 mb-1">
                      Carb (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={manualCarbs}
                      onChange={(e) => setManualCarbs(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-sky-600 mb-1">
                      Béo (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={manualFat}
                      onChange={(e) => setManualFat(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-semibold text-gray-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={!manualName.trim()}
                    onClick={handleSaveManualFood}
                    className="px-5 py-2.5 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                  >
                    Lưu món thủ công
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: AI SCANNER */}
            {modalMode === 'ai' && (
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-900/40 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Nhập mô tả bữa ăn tự nhiên (ví dụ: "1 bát bún riêu cua thêm 1 bìa đậu và rau sống") hoặc tải ảnh món ăn lên để Nutrivita AI ước lượng dinh dưỡng.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả món ăn
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Vd: 1 đĩa cơm rang dưa bò khoảng 1 bát cơm con..."
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                {/* Upload Image Option */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tải ảnh món ăn (tùy chọn)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-400 cursor-pointer bg-white dark:bg-gray-800">
                    <Camera className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {aiImageBase64 ? 'Đã tải ảnh lên (Bấm để đổi)' : 'Chọn ảnh từ thiết bị'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {aiError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
                    {aiError}
                  </div>
                )}

                {!aiResult ? (
                  <button
                    type="button"
                    disabled={aiLoading || (!aiDescription.trim() && !aiImageBase64)}
                    onClick={handleRunAIScanner}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-[#83BDEB] hover:opacity-95 text-white font-bold rounded-xl text-xs transition-all shadow-sm disabled:opacity-40"
                  >
                    {aiLoading ? 'Nutrivita AI đang phân tích...' : 'Phân tích món ăn bằng AI'}
                  </button>
                ) : (
                  /* AI Review & Edit before save as required */
                  <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-gray-800 border border-purple-200 dark:border-purple-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Kết quả ước lượng của AI:
                      </span>
                      <button
                        type="button"
                        onClick={() => setAiResult(null)}
                        className="text-[11px] text-purple-600 hover:underline"
                      >
                        Phân tích lại
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Tên món:</span>
                        <input
                          type="text"
                          value={aiResult.foodName || ''}
                          onChange={(e) => setAiResult({ ...aiResult, foodName: e.target.value })}
                          className="w-full px-2.5 py-1 rounded-lg border border-purple-200 text-xs font-bold bg-white dark:bg-gray-900"
                        />
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Calo</span>
                          <input
                            type="number"
                            value={aiResult.calories || 0}
                            onChange={(e) => setAiResult({ ...aiResult, calories: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded-lg border border-purple-200 text-xs font-bold bg-white dark:bg-gray-900"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-500 block">Đạm (g)</span>
                          <input
                            type="number"
                            value={aiResult.protein || 0}
                            onChange={(e) => setAiResult({ ...aiResult, protein: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded-lg border border-purple-200 text-xs font-bold bg-white dark:bg-gray-900"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-500 block">Carb (g)</span>
                          <input
                            type="number"
                            value={aiResult.carbs || 0}
                            onChange={(e) => setAiResult({ ...aiResult, carbs: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded-lg border border-purple-200 text-xs font-bold bg-white dark:bg-gray-900"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-sky-500 block">Béo (g)</span>
                          <input
                            type="number"
                            value={aiResult.fat || 0}
                            onChange={(e) => setAiResult({ ...aiResult, fat: Number(e.target.value) })}
                            className="w-full px-2 py-1 rounded-lg border border-purple-200 text-xs font-bold bg-white dark:bg-gray-900"
                          />
                        </div>
                      </div>

                      {aiResult.notes && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 italic pt-1 border-t border-purple-200/50">
                          Ghi chú: {aiResult.notes}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAIRunResult}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                    >
                      Duyệt & Lưu món này vào nhật ký
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COPY MEALS MODAL */}
      {copyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#FCE8EF] dark:border-gray-800 text-left">
            <h3 className="font-extrabold text-base text-[#343746] dark:text-white mb-2">
              Sao chép {copyingMealType ? `bữa ăn` : `toàn bộ ngày`}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Nhân bản danh sách món ăn từ ngày {selectedDate} sang một ngày khác tiện lợi.
            </p>

            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Chọn ngày đích đến:
            </label>
            <input
              type="date"
              value={copyTargetDate}
              onChange={(e) => setCopyTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800 mb-4"
            />

            {copyFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold mb-4">
                {copyFeedback}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCopyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleExecuteCopy}
                className="px-4 py-2 bg-[#3978AE] text-white rounded-xl text-xs font-bold"
              >
                Tiến hành sao chép
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
