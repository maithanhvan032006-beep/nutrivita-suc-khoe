import { ExerciseDefinition } from '../types';

export const EXERCISE_LIBRARY: ExerciseDefinition[] = [
  {
    id: 'di_bo_nhanh',
    name: 'Đi bộ nhanh ngoài trời',
    category: 'Đi bộ',
    met: 4.3,
    muscleGroups: ['Chân', 'Đùi', 'Bắp chân', 'Tim mạch'],
    equipment: 'Giày thể thao êm',
    difficulty: 'Cơ bản',
    instructions: [
      'Giữ lưng thẳng, mắt nhìn về phía trước khoảng 5-6 mét.',
      'Đánh tay tự nhiên theo nhịp bước chân, góc khuỷu tay khoảng 90 độ.',
      'Tiếp đất bằng gót chân rồi cuộn mượt mà sang mũi chân để đẩy tới.',
    ],
    safetyNotes: 'Mang giày vừa vặn để bảo vệ khớp cổ chân và gối. Uống nước trước và sau khi đi.',
  },
  {
    id: 'chay_bo_nhe',
    name: 'Chạy bộ thư giãn (Jogging)',
    category: 'Chạy bộ',
    met: 7.0,
    muscleGroups: ['Toàn thân', 'Tim mạch', 'Cơ đùi', 'Cơ mông'],
    equipment: 'Giày chạy chuyên dụng',
    difficulty: 'Trung bình',
    instructions: [
      'Khởi động kỹ cổ chân, khớp gối và hông trong 5 phút.',
      'Duy trì tốc độ nói chuyện được mà không hụt hơi.',
      'Thở đều theo nhịp 2 bước hít vào - 2 bước thở ra.',
    ],
    safetyNotes: 'Nếu cảm thấy đau nhói ở khớp gối hoặc ống đồng, giảm tốc độ thành đi bộ.',
  },
  {
    id: 'dap_xe_vua',
    name: 'Đạp xe tốc độ vừa',
    category: 'Đạp xe',
    met: 6.8,
    muscleGroups: ['Đùi trước', 'Bắp chuối', 'Hông'],
    equipment: 'Xe đạp / Xe đạp tập tại nhà',
    difficulty: 'Cơ bản',
    instructions: [
      'Điều chỉnh yên xe sao cho khi chân ở điểm thấp nhất, đầu gối hơi gập nhẹ khoảng 15-20 độ.',
      'Giữ lưng thẳng, thả lỏng vai và cổ.',
      'Duy trì guồng chân đều đặn từ 70-80 vòng/phút.',
    ],
    safetyNotes: 'Tránh để yên quá thấp gây áp lực lớn lên khớp gối.',
  },
  {
    id: 'yoga_vinyasa',
    name: 'Yoga Vinyasa năng động',
    category: 'Yoga',
    met: 3.5,
    muscleGroups: ['Toàn thân', 'Cơ lõi (Core)', 'Lưng', 'Vai'],
    equipment: 'Thảm tập yoga',
    difficulty: 'Trung bình',
    instructions: [
      'Kết nối nhịp thở sâu với từng chuỗi chuyển động mượt mà.',
      'Lắng nghe giới hạn của cơ thể, không cố ép căng quá mức.',
      'Giữ tư thế Chó úp mặt và Rắn hổ mang vững chắc.',
    ],
    safetyNotes: 'Dừng lại ngay nếu cảm thấy đau khớp cổ tay hoặc lưng dưới.',
  },
  {
    id: 'pilates_mat_core',
    name: 'Pilates thảm siết eo & bụng',
    category: 'Pilates',
    met: 3.8,
    muscleGroups: ['Cơ bụng sâu', 'Cơ sàn chậu', 'Cơ mông', 'Lưng'],
    equipment: 'Thảm tập mềm',
    difficulty: 'Trung bình',
    instructions: [
      'Thở bằng khung sườn (ngực nở rộng), hóp nhẹ rốn về phía cột sống.',
      'Thực hiện các động tác The Hundred, Roll Up và Single Leg Stretch chậm rãi có kiểm soát.',
      'Tập trung vào chất lượng chuyển động hơn là số lần lặp lại.',
    ],
    safetyNotes: 'Luôn giữ lưng dưới áp sát thảm khi nâng hai chân để bảo vệ cột sống.',
  },
  {
    id: 'tap_mong_dui_tai_nha',
    name: 'Tập mông đùi tại nhà (Squat & Lunge)',
    category: 'Tập tại nhà',
    met: 5.0,
    muscleGroups: ['Cơ mông', 'Đùi trước', 'Đùi sau'],
    equipment: 'Không cần dụng cụ (Bodyweight)',
    difficulty: 'Cơ bản',
    instructions: [
      'Squat: Đứng chân rộng bằng vai, hạ hông ra sau như ngồi vào ghế, đầu gối mở theo hướng mũi chân.',
      'Lunge: Bước một chân lên trước, hạ vuông góc 2 khớp gối.',
      'Glute Bridge: Nằm ngửa, siết chặt cơ mông khi đẩy hông lên trần nhà.',
    ],
    safetyNotes: 'Không để đầu gối chụm vào nhau khi đứng lên.',
  },
  {
    id: 'hiit_cardio_dot_mo',
    name: 'Cardio HIIT đốt calo tại nhà',
    category: 'Cardio',
    met: 8.0,
    muscleGroups: ['Toàn thân', 'Tim mạch'],
    equipment: 'Không cần dụng cụ',
    difficulty: 'Nâng cao',
    instructions: [
      'Thực hiện chuỗi: Jumping jacks (30s) -> Nghỉ (15s) -> High knees (30s) -> Nghỉ (15s) -> Mountain climbers (30s).',
      'Lặp lại 3-4 hiệp.',
    ],
    safetyNotes: 'Người có vấn đề về tim mạch hoặc huyết áp cần tham khảo ý kiến bác sĩ trước khi tập cường độ cao.',
  },
  {
    id: 'gian_co_toan_than',
    name: 'Giãn cơ & phục hồi thư giãn',
    category: 'Giãn cơ',
    met: 2.3,
    muscleGroups: ['Cơ cổ', 'Vai', 'Lưng', 'Gân kheo', 'Hông'],
    equipment: 'Thảm tập',
    difficulty: 'Cơ bản',
    instructions: [
      'Giữ mỗi tư thế giãn tĩnh từ 20 đến 30 giây trong khi thở chậm và sâu.',
      'Tập trung giải phóng căng thẳng ở cơ thang và vùng thắt lưng.',
    ],
    safetyNotes: 'Không nhấp giật khi giãn cơ; giữ êm ái ở điểm căng dễ chịu.',
  },
  {
    id: 'tap_suc_manh_ta_don',
    name: 'Tập sức mạnh với tạ đơn (Dumbbell)',
    category: 'Tập sức mạnh',
    met: 5.5,
    muscleGroups: ['Vai', 'Tay trước', 'Lưng xô', 'Ngực'],
    equipment: 'Đôi tạ đơn 2-5kg',
    difficulty: 'Trung bình',
    instructions: [
      'Thực hiện các bài: Dumbbell Shoulder Press, Bicep Curl, Bent-over Row.',
      'Mỗi bài 3 hiệp, mỗi hiệp 10-12 lần.',
    ],
    safetyNotes: 'Gồng chặt cơ bụng để cố định thân người, tránh đung đưa lưng khi nâng tạ.',
  },
];

export function calculateCaloriesBurned(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  if (!weightKg || !durationMinutes) return 0;
  // Standard Exercise Formula: Calories = MET * 3.5 * weightKg / 200 * durationMinutes
  const kcal = (met * 3.5 * weightKg * durationMinutes) / 200;
  return Math.round(kcal);
}
