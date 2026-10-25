import express, { Request, Response } from 'express';
import {
  isGeminiConfigured,
  askGeminiAssistant,
  generateAIVietnameseMealPlan,
  analyzeFoodNutritionWithAI,
} from './geminiHandler';

const apiApp = express();
apiApp.use(express.json({ limit: '10mb' }));

// Health / Status check
apiApp.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    configured: isGeminiConfigured(),
    message: isGeminiConfigured()
      ? 'Gemini AI đang sẵn sàng'
      : 'Chưa cấu hình GEMINI_API_KEY trên môi trường server.',
  });
});

// AI Chat endpoint
apiApp.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    if (!isGeminiConfigured()) {
      res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'Dịch vụ AI chưa được cấu hình khóa GEMINI_API_KEY. Vui lòng cấu hình biến môi trường server.',
      });
      return;
    }

    const { messages, userContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'INVALID_REQUEST', message: 'Danh sách tin nhắn không hợp lệ.' });
      return;
    }

    const reply = await askGeminiAssistant(messages, userContext);
    res.json({ reply });
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    res.status(500).json({
      error: 'AI_ERROR',
      message: error?.message || 'Lỗi khi gọi dịch vụ AI. Vui lòng thử lại sau.',
    });
  }
});

// AI Meal Plan endpoint
apiApp.post('/api/ai/meal-plan', async (req: Request, res: Response) => {
  try {
    if (!isGeminiConfigured()) {
      res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'Chưa cấu hình GEMINI_API_KEY.',
      });
      return;
    }

    const { calorieTarget, goalType, allergies, dietaryPreferences, notes } = req.body;
    const plan = await generateAIVietnameseMealPlan({
      calorieTarget: Number(calorieTarget) || 1800,
      goalType: goalType || 'maintain',
      allergies,
      dietaryPreferences,
      notes,
    });

    res.json(plan);
  } catch (error: any) {
    console.error('API /api/ai/meal-plan error:', error);
    res.status(500).json({
      error: 'MEAL_PLAN_ERROR',
      message: error?.message || 'Không thể tạo thực đơn AI.',
    });
  }
});

// AI Food Analyze endpoint
apiApp.post('/api/ai/analyze-food', async (req: Request, res: Response) => {
  try {
    if (!isGeminiConfigured()) {
      res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'Chưa cấu hình GEMINI_API_KEY.',
      });
      return;
    }

    const { description, imageBase64 } = req.body;
    if (!description && !imageBase64) {
      res.status(400).json({ error: 'MISSING_DATA', message: 'Vui lòng cung cấp mô tả hoặc ảnh món ăn.' });
      return;
    }

    const analysis = await analyzeFoodNutritionWithAI(description || 'Món ăn trong ảnh', imageBase64);
    res.json(analysis);
  } catch (error: any) {
    console.error('API /api/ai/analyze-food error:', error);
    res.status(500).json({
      error: 'ANALYZE_ERROR',
      message: error?.message || 'Không thể phân tích món ăn.',
    });
  }
});

export default apiApp;
