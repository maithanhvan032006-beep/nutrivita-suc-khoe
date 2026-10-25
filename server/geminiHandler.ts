import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export function getGeminiClient(): GoogleGenAI | null {
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
}

const SYSTEM_INSTRUCTION_HEALTH_ASSISTANT = `
Bạn là Nutrivita AI – Chuyên gia tư vấn dinh dưỡng và huấn luyện viên sức khỏe cá nhân chuyên nghiệp, tận tâm và khoa học.
Ngôn ngữ trả lời: Tiếng Việt tự nhiên, ấm áp, rõ ràng, gãy gọn.
Đơn vị tính: kg, cm, kcal, gam, ml, phút.

NGUYÊN TẮC QUAN TRỌNG:
1. Bạn KHÔNG PHẢI là bác sĩ và KHÔNG thay thế chẩn đoán y tế, không kê đơn thuốc.
2. Nếu người dùng hỏi về triệu chứng cấp cứu, khó thở, ngực đau, bệnh lý phức tạp hoặc đang mang thai/cho con bú, hãy khuyên họ tham khảo bác sĩ chuyên khoa hoặc đến cơ sở y tế.
3. Ưu tiên hướng dẫn dinh dưỡng theo thói quen ăn uống của người Việt Nam (rau xanh, canh, cá, thịt nạc, gạo lứt, phở, bún ít dầu mỡ, đậu phụ, trái cây theo mùa).
4. Khuyến khích thay đổi thói quen dần dần, bền vững, kiên quyết phản đối nhịn ăn tiêu cực hoặc giảm cân siêu tốc có hại.
5. Giải thích rõ ràng các chỉ số BMR (năng lượng chuyển hóa cơ bản), TDEE (tổng năng lượng tiêu hao hằng ngày) và nguyên lý thâm hụt/thặng dư calo khi được hỏi.
`.trim();

export async function askGeminiAssistant(
  messages: { role: 'user' | 'model'; content: string }[],
  userContext?: {
    calorieTarget?: number;
    currentWeight?: number;
    targetWeight?: number;
    activityLevel?: string;
    goalType?: string;
    allergies?: string[];
    dietaryPreferences?: string[];
    todayCalories?: number;
    todayWater?: number;
  }
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  let contextPrompt = '';
  if (userContext) {
    contextPrompt = `
[Thông tin hồ sơ sức khỏe người dùng (đã cho phép chia sẻ)]:
- Cân nặng hiện tại: ${userContext.currentWeight ?? 'chưa rõ'} kg | Mục tiêu: ${userContext.targetWeight ?? 'chưa rõ'} kg
- Mục tiêu: ${userContext.goalType ?? 'sức khỏe tổng quát'}
- Mức vận động: ${userContext.activityLevel ?? 'vừa'}
- Mục tiêu calo: ${userContext.calorieTarget ?? 'chưa cài đặt'} kcal/ngày
- Đã nạp hôm nay: ${userContext.todayCalories ?? 0} kcal | Nước: ${userContext.todayWater ?? 0} ml
- Dị ứng: ${userContext.allergies?.join(', ') || 'Không có'}
- Sở thích/chế độ ăn: ${userContext.dietaryPreferences?.join(', ') || 'Bình thường'}
`.trim();
  }

  const promptContents = messages.map(m => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Append context to the last user message
  if (contextPrompt && promptContents.length > 0) {
    const last = promptContents[promptContents.length - 1];
    if (last.role === 'user') {
      last.parts[0].text = `${last.parts[0].text}\n\n${contextPrompt}`;
    }
  }

  const response = await client.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: promptContents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_HEALTH_ASSISTANT,
      temperature: 0.7,
    },
  });

  return response.text || 'Xin lỗi, tôi chưa thể trả lời vào lúc này. Vui lòng thử lại sau.';
}

export async function generateAIVietnameseMealPlan(params: {
  calorieTarget: number;
  goalType: string;
  allergies?: string[];
  dietaryPreferences?: string[];
  mealsCount?: number;
  notes?: string;
}): Promise<any> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const prompt = `
Hãy thiết kế thực đơn 1 ngày chuẩn món ăn Việt Nam lành mạnh, ngon miệng cho người dùng với yêu cầu:
- Tổng calo mục tiêu: ${params.calorieTarget} kcal (chênh lệch không quá ±50 kcal)
- Mục tiêu thể hình: ${params.goalType}
- Dị ứng thực phẩm cần tránh: ${params.allergies?.join(', ') || 'Không có'}
- Sở thích ăn uống: ${params.dietaryPreferences?.join(', ') || 'Ẩm thực Việt Nam đa dạng, lành mạnh'}
- Ghi chú: ${params.notes || 'Cân đối đạm, tinh bột chậm và chất xơ'}

Yêu cầu trả về đúng định dạng JSON thuần túy (không bọc trong markdown tick nếu có thể, hoặc chỉ trả JSON hợp lệ):
{
  "name": "Thực đơn dinh dưỡng lành mạnh",
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "meals": [
    {
      "mealType": "breakfast" | "lunch" | "dinner" | "snack",
      "name": "Tên món ăn Việt Nam",
      "portion": "Khẩu phần (vd: 1 tô vừa, 1 đĩa)",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "ingredients": ["Nguyên liệu 1", "Nguyên liệu 2"],
      "instructions": "Hướng dẫn ngắn gọn cách chế biến lành mạnh"
    }
  ]
}
`.trim();

  const response = await client.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.4,
    },
  });

  const text = response.text?.trim() || '{}';
  return JSON.parse(text);
}

export async function analyzeFoodNutritionWithAI(
  description: string,
  imageBase64?: string
): Promise<any> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const prompt = `
Phân tích món ăn hoặc bữa ăn sau và ước tính dinh dưỡng khoa học:
Mô tả từ người dùng: "${description}"

Hãy trả về kết quả dưới định dạng JSON:
{
  "foodName": "Tên món ăn chuẩn hóa",
  "estimatedServing": "Khẩu phần ước tính (vd: 1 đĩa 200g, 1 bát tô)",
  "quantity": number,
  "unit": "g" | "bát" | "đĩa" | "phần" | "quả",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "notes": "Nhận xét dinh dưỡng và lời khuyên ăn uống lành mạnh (tiếng Việt)"
}
`.trim();

  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    // Strip data URL header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64,
      },
    });
  }

  const response = await client.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: { parts },
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const text = response.text?.trim() || '{}';
  return JSON.parse(text);
}
