export interface AIStatus {
  configured: boolean;
  message: string;
}

export async function checkAIStatus(): Promise<AIStatus> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) {
      return { configured: false, message: 'Máy chủ phản hồi trạng thái không hợp lệ.' };
    }
    return await res.json();
  } catch (err) {
    return { configured: false, message: 'Không thể kết nối đến máy chủ AI.' };
  }
}

export async function sendAIChatMessage(
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
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userContext }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi khi kết nối dịch vụ AI');
  }
  return data.reply;
}

export async function requestAIMealPlan(params: {
  calorieTarget: number;
  goalType: string;
  allergies?: string[];
  dietaryPreferences?: string[];
  notes?: string;
}): Promise<any> {
  const res = await fetch('/api/ai/meal-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi khi tạo thực đơn AI');
  }
  return data;
}

export async function requestAIFoodAnalysis(
  description: string,
  imageBase64?: string
): Promise<any> {
  const res = await fetch('/api/ai/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, imageBase64 }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi khi phân tích món ăn');
  }
  return data;
}
