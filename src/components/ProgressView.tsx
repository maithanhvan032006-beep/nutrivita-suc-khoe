import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Download,
  Target,
  ArrowRight,
  Sparkles,
  Scale,
  Award,
} from 'lucide-react';
import { PrivateProfile, WeightLog } from '../types';

interface ProgressViewProps {
  userId: string;
  profile: PrivateProfile | null;
  weightLogs: WeightLog[];
  onAddWeightLog: (log: Omit<WeightLog, 'id'>) => Promise<void>;
  onDeleteWeightLog: (logId: string) => Promise<void>;
  onExportData: () => Promise<string>;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userId,
  profile,
  weightLogs,
  onAddWeightLog,
  onDeleteWeightLog,
  onExportData,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState<number>(profile?.currentWeightKg || 55);
  const [waistInput, setWaistInput] = useState<number | ''>('');
  const [bodyFatInput, setBodyFatInput] = useState<number | ''>('');
  const [dateInput, setDateInput] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notesInput, setNotesInput] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  // Time range filter for chart: 7d, 30d, all
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const handleSaveLog = async () => {
    if (!weightInput || weightInput < 25 || weightInput > 300) return;

    await onAddWeightLog({
      weightKg: Number(weightInput),
      waistCm: waistInput ? Number(waistInput) : undefined,
      bodyFatPercent: bodyFatInput ? Number(bodyFatInput) : undefined,
      notes: notesInput.trim() || undefined,
      date: dateInput,
      createdAt: new Date().toISOString(),
    });

    setModalOpen(false);
    setNotesInput('');
  };

  const handleDownloadExport = async () => {
    setIsExporting(true);
    try {
      const dataStr = await onExportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nutrivita_health_report_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Sort chronologically for charting
  const chronologicalLogs = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));

  // Filter based on selected time range
  const filteredLogs = chronologicalLogs.filter((item) => {
    if (timeRange === 'all') return true;
    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(item.date) >= cutoff;
  });

  const latestWeight = weightLogs[0]?.weightKg || profile?.currentWeightKg;
  const initialWeight = chronologicalLogs[0]?.weightKg || profile?.currentWeightKg;
  const targetWeight = profile?.targetWeightKg;

  // Calculate progress toward goal
  let progressPercent = 0;
  if (initialWeight && targetWeight && latestWeight && initialWeight !== targetWeight) {
    const totalGoalDiff = Math.abs(targetWeight - initialWeight);
    const achievedDiff = Math.abs(latestWeight - initialWeight);
    progressPercent = Math.min(100, Math.round((achievedDiff / totalGoalDiff) * 100));
  }

  // SVG Chart Dimensions & Coordinates
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 35;

  let pointsString = '';
  let minW = 40;
  let maxW = 100;

  if (filteredLogs.length > 1) {
    const weights = filteredLogs.map((l) => l.weightKg);
    minW = Math.floor(Math.min(...weights) - 1);
    maxW = Math.ceil(Math.max(...weights) + 1);

    pointsString = filteredLogs
      .map((l, idx) => {
        const x = padding + (idx / (filteredLogs.length - 1)) * (chartWidth - padding * 2);
        const y = chartHeight - padding - ((l.weightKg - minW) / (maxW - minW)) * (chartHeight - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-left">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3978AE] uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-[#F4A7C3]" />
            <span>Theo dõi tiến trình & số đo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#343746] dark:text-white">
            Hành trình sức khỏe của bạn
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Biểu đồ và số liệu hoàn toàn dựa trên dữ liệu cân nặng thực tế bạn đã ghi nhận.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all"
            title="Tải về báo cáo JSON cá nhân"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Đang xuất...' : 'Xuất dữ liệu'}</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi cân nặng mới</span>
          </button>
        </div>
      </div>

      {/* Progress Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-[#FCE8EF] dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Cân nặng ban đầu
          </span>
          <p className="text-2xl font-black text-[#343746] dark:text-white mt-1">
            {initialWeight} <span className="text-xs font-normal text-gray-400">kg</span>
          </p>
          <span className="text-[11px] text-gray-400">Thời điểm bắt đầu</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-[#FCE8EF] dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold text-[#3978AE] uppercase tracking-wider">
            Cân nặng gần nhất
          </span>
          <p className="text-2xl font-black text-[#3978AE] mt-1">
            {latestWeight} <span className="text-xs font-normal text-gray-400">kg</span>
          </p>
          <span className="text-[11px] text-gray-400">
            {weightLogs[0]?.date ? `Ghi nhận: ${weightLogs[0].date}` : 'Theo hồ sơ'}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-[#FCE8EF] dark:border-gray-800 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Mục tiêu mong muốn
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {targetWeight} <span className="text-xs font-normal text-gray-400">kg</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Tiến độ: {progressPercent}%
          </span>
        </div>
      </div>

      {/* Real Weight Trend Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
              Biểu đồ biến thiên cân nặng
            </h3>
            <span className="text-xs text-gray-400">
              {filteredLogs.length > 0
                ? `Hiển thị ${filteredLogs.length} điểm dữ liệu thực tế`
                : 'Chưa có đủ điểm dữ liệu'}
            </span>
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-gray-700 text-[#3978AE] shadow-xs'
                  : 'text-gray-500'
              }`}
            >
              7 ngày
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === '30d'
                  ? 'bg-white dark:bg-gray-700 text-[#3978AE] shadow-xs'
                  : 'text-gray-500'
              }`}
            >
              30 ngày
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'all'
                  ? 'bg-white dark:bg-gray-700 text-[#3978AE] shadow-xs'
                  : 'text-gray-500'
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>

        {filteredLogs.length < 2 ? (
          <div className="py-12 text-center bg-[#FFF8EF]/50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-[#F4A7C3]/50">
            <Scale className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Cần ít nhất 2 lần ghi nhận cân nặng để dựng đường xu hướng
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Hãy nhấn nút "Ghi cân nặng mới" để bổ sung số đo của bạn.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[480px]">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48">
                {/* Horizontal gridlines */}
                {[0.25, 0.5, 0.75].map((ratio) => {
                  const y = padding + ratio * (chartHeight - padding * 2);
                  const val = Math.round(maxW - ratio * (maxW - minW));
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding}
                        y1={y}
                        x2={chartWidth - padding}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="4 4"
                        className="dark:stroke-gray-800"
                      />
                      <text
                        x={padding - 6}
                        y={y + 3}
                        fill="#94A3B8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        {val}kg
                      </text>
                    </g>
                  );
                })}

                {/* Polyline Path */}
                <polyline
                  fill="none"
                  stroke="#3978AE"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />

                {/* Data Points */}
                {filteredLogs.map((l, idx) => {
                  const x = padding + (idx / (filteredLogs.length - 1)) * (chartWidth - padding * 2);
                  const y = chartHeight - padding - ((l.weightKg - minW) / (maxW - minW)) * (chartHeight - padding * 2);
                  return (
                    <g key={l.id || idx}>
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#FFFFFF"
                        stroke="#F4A7C3"
                        strokeWidth="2.5"
                      />
                      <text
                        x={x}
                        y={chartHeight - 10}
                        fill="#94A3B8"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        {l.date.split('-').slice(1).join('/')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Weight History Table */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
          Lịch sử bản ghi ({weightLogs.length})
        </h3>

        {weightLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            Chưa có bản ghi nào. Hãy bắt đầu ghi nhận cân nặng hôm nay!
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {weightLogs.map((log) => (
              <div
                key={log.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#343746] dark:text-white">
                      {log.weightKg} kg
                    </span>
                    {log.waistCm && (
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                        Eo: {log.waistCm} cm
                      </span>
                    )}
                    {log.bodyFatPercent && (
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                        Mỡ: {log.bodyFatPercent}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{log.date}</span>
                    {log.notes && <span>· "{log.notes}"</span>}
                  </div>
                </div>

                <button
                  onClick={() => log.id && onDeleteWeightLog(log.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                  title="Xóa bản ghi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECORD WEIGHT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#FCE8EF] dark:border-gray-800 text-left">
            <h3 className="font-extrabold text-base text-[#343746] dark:text-white mb-2">
              Ghi nhận cân nặng & số đo mới
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Nên cân vào buổi sáng sau khi thức dậy và đi vệ sinh để có kết quả chính xác nhất.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cân nặng (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="25"
                  max="300"
                  value={weightInput}
                  onChange={(e) => setWeightInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Vòng eo (cm, tùy chọn)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Vd: 68"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    % Mỡ cơ thể (tùy chọn)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Vd: 22.5"
                    value={bodyFatInput}
                    onChange={(e) => setBodyFatInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ngày ghi nhận
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú cá nhân
                </label>
                <input
                  type="text"
                  placeholder="Vd: Cảm thấy cơ thể nhẹ nhõm hơn..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
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
                  onClick={handleSaveLog}
                  className="px-5 py-2 bg-[#3978AE] text-white rounded-xl text-xs font-bold"
                >
                  Lưu bản ghi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
