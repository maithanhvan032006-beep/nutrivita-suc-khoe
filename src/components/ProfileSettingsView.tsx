import React, { useState } from 'react';
import {
  User,
  Settings,
  Shield,
  Bell,
  Trash2,
  LogOut,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Moon,
  Sun,
  Lock,
} from 'lucide-react';
import {
  ActivityLevel,
  GoalType,
  PrivateProfile,
  SexForCalculation,
  UserProfile,
} from '../types';
import {
  calculateAge,
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateDailyWaterTarget,
  ACTIVITY_MULTIPLIERS,
  GOAL_LABELS,
} from '../utils/nutritionCalculations';

interface ProfileSettingsViewProps {
  userId: string;
  userProfile: UserProfile | null;
  privateProfile: PrivateProfile | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdatePrivateProfile: (data: Partial<PrivateProfile>) => Promise<void>;
  onExportData: () => Promise<string>;
  onDeleteAccount: () => Promise<void>;
  onLogout: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  userId,
  userProfile,
  privateProfile,
  isDarkMode,
  onToggleDarkMode,
  onUpdatePrivateProfile,
  onExportData,
  onDeleteAccount,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'reminders' | 'privacy' | 'terms'>('profile');

  // Form states for profile edit
  const [heightCm, setHeightCm] = useState<number>(privateProfile?.heightCm || 160);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(privateProfile?.currentWeightKg || 55);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(privateProfile?.targetWeightKg || 50);
  const [birthDate, setBirthDate] = useState<string>(privateProfile?.birthDate || '2000-01-01');
  const [sex, setSex] = useState<SexForCalculation>(privateProfile?.sexForCalculation || 'female');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(privateProfile?.activityLevel || 'light');
  const [goalType, setGoalType] = useState<GoalType>(privateProfile?.goalType || 'lose_weight');
  const [aiConsent, setAiConsent] = useState<boolean>(privateProfile?.aiConsent ?? true);

  // Reminders state (stored locally in preferences)
  const [remindWater, setRemindWater] = useState<boolean>(true);
  const [waterIntervalHours, setWaterIntervalHours] = useState<number>(2);
  const [remindMeals, setRemindMeals] = useState<boolean>(true);
  const [remindWeight, setRemindWeight] = useState<boolean>(true);

  // UI feedback
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const age = calculateAge(birthDate);
      const bmr = calculateBMR(currentWeightKg, heightCm, age, sex);
      const tdee = calculateTDEE(bmr, activityLevel);
      const caloriePlan = calculateDailyCalorieTarget(tdee, goalType, sex);
      const waterTarget = calculateDailyWaterTarget(currentWeightKg);

      await onUpdatePrivateProfile({
        heightCm,
        currentWeightKg,
        targetWeightKg,
        birthDate,
        sexForCalculation: sex,
        activityLevel,
        goalType,
        aiConsent,
        bmr,
        tdee,
        dailyCalorieTarget: caloriePlan.target,
        dailyWaterTargetMl: waterTarget,
        updatedAt: new Date().toISOString(),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText !== 'XOA TAI KHOAN') return;
    setDeleting(true);
    try {
      await onDeleteAccount();
    } catch (err: any) {
      setError(err?.message || 'Không thể xóa tài khoản.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-left">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-900 rounded-2xl border border-[#FCE8EF] dark:border-gray-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'profile', label: 'Hồ sơ & Mục tiêu', icon: User },
          { id: 'reminders', label: 'Nhắc nhở & Thói quen', icon: Bell },
          { id: 'privacy', label: 'Bảo mật & Quyền riêng tư', icon: Shield },
          { id: 'terms', label: 'Điều khoản sử dụng', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#FCE8EF] dark:bg-gray-800 text-[#3978AE] dark:text-[#83BDEB] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600">
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Hồ sơ sức khỏe và mục tiêu đã được lưu thành công vào Firestore!</span>
        </div>
      )}

      {/* TAB 1: PROFILE & HEALTH TARGETS */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex items-center gap-4">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Avatar"
                className="w-14 h-14 rounded-full border-2 border-[#F4A7C3] object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#FCE8EF] text-[#343746] font-extrabold text-lg flex items-center justify-center border-2 border-[#F4A7C3]">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
                {userProfile?.displayName || 'Người dùng Nutrivita'}
              </h3>
              <p className="text-xs text-gray-400">{userProfile?.email}</p>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-semibold mt-1 inline-block">
                Tài khoản Google đã xác minh
              </span>
            </div>
          </div>

          {/* Health Inputs Form */}
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
              Cập nhật thông số cơ thể
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cân nặng hiện tại (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="25"
                  max="300"
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cân nặng mục tiêu (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="25"
                  max="300"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mục tiêu dinh dưỡng
                </label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as GoalType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                >
                  {(Object.keys(GOAL_LABELS) as GoalType[]).map((k) => (
                    <option key={k} value={k}>
                      {GOAL_LABELS[k].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mức độ vận động
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                >
                  {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((k) => (
                    <option key={k} value={k}>
                      {ACTIVITY_MULTIPLIERS[k].label} (x{ACTIVITY_MULTIPLIERS[k].factor})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REMINDERS & HABITS */}
      {activeTab === 'reminders' && (
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-5">
          <div>
            <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
              Cài đặt nhắc nhở & thói quen
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Tùy chỉnh thông báo nhắc nhở uống nước và ghi nhật ký bữa ăn theo nhịp sinh học của bạn.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FFF8EF]/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#343746] dark:text-white">
                  Nhắc uống nước định kỳ
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Nhắc uống 1 ly nước mỗi {waterIntervalHours} tiếng để đạt mục tiêu hydration.
                </p>
              </div>
              <input
                type="checkbox"
                checked={remindWater}
                onChange={(e) => setRemindWater(e.target.checked)}
                className="w-4 h-4 text-[#3978AE] rounded focus:ring-[#3978AE]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8EF]/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#343746] dark:text-white">
                  Nhắc ghi nhận bữa ăn (Sáng, Trưa, Tối)
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Gửi thông báo nhẹ nhàng vào khung giờ ăn chính để không quên nhập món.
                </p>
              </div>
              <input
                type="checkbox"
                checked={remindMeals}
                onChange={(e) => setRemindMeals(e.target.checked)}
                className="w-4 h-4 text-[#3978AE] rounded focus:ring-[#3978AE]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8EF]/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#343746] dark:text-white">
                  Nhắc cân định kỳ vào đầu tuần
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Giúp bạn duy trì thói quen theo dõi đường xu hướng cân nặng ổn định.
                </p>
              </div>
              <input
                type="checkbox"
                checked={remindWeight}
                onChange={(e) => setRemindWeight(e.target.checked)}
                className="w-4 h-4 text-[#3978AE] rounded focus:ring-[#3978AE]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY & SECURITY */}
      {activeTab === 'privacy' && (
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
              Bảo mật dữ liệu & Quyền riêng tư
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Nutrivita tuân thủ nghiêm ngặt nguyên tắc Zero-Trust: toàn bộ dữ liệu thuộc quyền kiểm soát độc quyền của bạn.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <Shield className="w-4 h-4 text-sky-600" />
              <span>Chính sách lưu trữ Firestore</span>
            </div>
            <p className="leading-relaxed">
              Dữ liệu của bạn được lưu trong phân vùng <code>users/{userId}</code> và <code>private/profile</code>. Các quy tắc Firestore Security Rules mặc định từ chối mọi truy cập trái phép và chỉ cho phép duy nhất UID của bạn đọc và ghi.
            </p>
          </div>

          {/* AI Consent Management */}
          <div className="p-4 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 border border-[#FCE8EF] dark:border-gray-700 flex items-start justify-between gap-4">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#343746] dark:text-white">
                Đồng ý chia sẻ dữ liệu chỉ số cho Nutrivita AI
              </h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Khi bật, trợ lý AI sẽ nhận được các thông số tổng calo, dị ứng và món ăn hôm nay để đưa ra phân tích chính xác nhất. Khi tắt, AI sẽ hoạt động ở chế độ ẩn danh không lưu ngữ cảnh.
              </p>
            </div>
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(e) => {
                setAiConsent(e.target.checked);
                onUpdatePrivateProfile({ aiConsent: e.target.checked });
              }}
              className="w-4 h-4 text-[#3978AE] rounded focus:ring-[#3978AE] mt-1"
            />
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="pt-6 border-t border-rose-100 dark:border-gray-800 space-y-3">
            <h4 className="text-xs font-extrabold text-rose-600 uppercase tracking-wider">
              Vùng nguy hiểm
            </h4>
            <p className="text-xs text-gray-500">
              Xóa vĩnh viễn toàn bộ nhật ký ăn uống, nước, bài tập, cân nặng và hồ sơ cá nhân khỏi máy chủ Firestore. Hành động này không thể hoàn tác.
            </p>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa toàn bộ dữ liệu tài khoản</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: TERMS & POLICIES */}
      {activeTab === 'terms' && (
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
            Điều khoản sử dụng & Tuyên bố y tế
          </h3>

          <p>
            1. <b>Tính chất ước tính:</b> Nutrivita ứng dụng công thức Mifflin–St Jeor để tính toán năng lượng cơ bản (BMR) và tổng năng lượng tiêu hao hằng ngày (TDEE). Đây là công thức toán học ước tính, có thể chênh lệch tùy theo thành phần cơ thể thực tế (tỷ lệ mỡ, cơ, tuyến giáp).
          </p>
          <p>
            2. <b>Không thay thế bác sĩ:</b> Ứng dụng không đưa ra chẩn đoán y khoa, không điều trị bệnh chuyển hóa hay kê đơn dinh dưỡng lâm sàng. Hãy tham khảo ý kiến chuyên gia y tế trước khi thực hiện thâm hụt calo lớn.
          </p>
          <p>
            3. <b>An toàn thể chất:</b> Calo tiêu hao khi tập luyện phụ thuộc vào cường độ thực tế. Không ép bản thân tập luyện quá sức nếu có dấu hiệu chóng mặt, đau nhức khớp bất thường.
          </p>
        </div>
      )}

      {/* Logout Row */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 dark:bg-gray-800 dark:text-gray-300 rounded-xl text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất khỏi Nutrivita</span>
        </button>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900 text-left space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
              Xác nhận xóa tài khoản & toàn bộ dữ liệu?
            </h3>

            <p className="text-xs text-gray-500 leading-relaxed">
              Mọi dữ liệu bao gồm nhật ký ăn uống, nhật ký nước, bài tập, cân nặng và hồ sơ cá nhân sẽ bị xóa vĩnh viễn khỏi Cloud Firestore.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                Để xác nhận, vui lòng nhập chính xác chữ: <span className="text-rose-600 font-mono">XOA TAI KHOAN</span>
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="XOA TAI KHOAN"
                className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-mono bg-rose-50/40 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'XOA TAI KHOAN' || deleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
