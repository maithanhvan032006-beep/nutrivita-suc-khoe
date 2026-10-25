import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Flame,
  Utensils,
  Dumbbell,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { FoodLog, PrivateProfile, WaterLog } from '../types';
import { checkAIStatus, sendAIChatMessage } from '../services/aiService';

interface AIAssistantViewProps {
  userId: string;
  profile: PrivateProfile | null;
  todayFoodLogs: FoodLog[];
  todayWaterTotal: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  userId,
  profile,
  todayFoodLogs,
  todayWaterTotal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Restore non-sensitive chat session from session storage if present
    const saved = sessionStorage.getItem(`nutrivita_chat_${userId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        content: `Xin chào! Tôi là **Nutrivita AI** – Huấn luyện viên dinh dưỡng và sức khỏe cá nhân của bạn.\n\nTôi có thể giúp bạn:\n- Giải thích chi tiết chỉ số **BMR**, **TDEE** và lượng thâm hụt calo phù hợp.\n- Gợi ý các món ăn Việt Nam lành mạnh dưới mức calo yêu cầu.\n- Phân tích chất lượng các bữa ăn bạn đã ghi hôm nay.\n- Đề xuất bài tập tại nhà hoặc ngoài trời an toàn.\n\n*Lưu ý: Tôi không phải là bác sĩ và không đưa ra lời khuyên thay thế chỉ định y khoa.*`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; message: string }>({
    configured: true,
    message: '',
  });

  // User consent toggle to share today's metrics
  const [shareHealthContext, setShareHealthContext] = useState<boolean>(profile?.aiConsent ?? true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem(`nutrivita_chat_${userId}`, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, userId]);

  // Check backend Gemini API status on mount
  useEffect(() => {
    checkAIStatus().then((status) => {
      setAiStatus(status);
    });
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    if (!aiStatus.configured) {
      setError('Dịch vụ Gemini AI chưa được kích hoạt trên máy chủ backend. Vui lòng cấu hình GEMINI_API_KEY.');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputPrompt('');
    setLoading(true);
    setError(null);

    // Prepare context if user granted consent
    let userContext = undefined;
    if (shareHealthContext && profile) {
      const todayCalories = todayFoodLogs.reduce((s, i) => s + (i.calories || 0), 0);
      userContext = {
        calorieTarget: profile.dailyCalorieTarget,
        currentWeight: profile.currentWeightKg,
        targetWeight: profile.targetWeightKg,
        activityLevel: profile.activityLevel,
        goalType: profile.goalType,
        allergies: profile.allergies,
        dietaryPreferences: profile.dietaryPreferences,
        todayCalories,
        todayWater: todayWaterTotal,
      };
    }

    try {
      const apiMessages = newHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const reply = await sendAIChatMessage(apiMessages, userContext);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err?.message || 'Không thể liên lạc với Nutrivita AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    sessionStorage.removeItem(`nutrivita_chat_${userId}`);
    setMessages([
      {
        id: 'welcome_cleared',
        role: 'model',
        content: 'Lịch sử trò chuyện đã được xóa an toàn. Tôi có thể hỗ trợ điều gì cho bạn hôm nay?',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestedQuestions = [
    { label: 'Giải thích chỉ số BMR và TDEE của tôi', icon: Flame },
    { label: 'Gợi ý bữa tối dưới 500 kcal chuẩn món Việt', icon: Utensils },
    { label: 'Phân tích thực phẩm tôi đã ăn hôm nay', icon: Sparkles },
    { label: 'Bài tập 20 phút tại nhà đốt mỡ hiệu quả', icon: Dumbbell },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-left">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3978AE] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Trí tuệ nhân tạo Gemini 3.8</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#343746] dark:text-white">
            Trợ lý sức khỏe Nutrivita AI
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Được huấn luyện để tư vấn khoa học dinh dưỡng, món ăn Việt Nam và thói quen thể chất lành mạnh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Privacy Context Toggle */}
          <button
            onClick={() => setShareHealthContext(!shareHealthContext)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              shareHealthContext
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-500'
            }`}
            title="Bật/Tắt gửi thông số sức khỏe hôm nay vào câu hỏi"
          >
            {shareHealthContext ? (
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>{shareHealthContext ? 'Chia sẻ chỉ số cơ thể' : 'Chế độ ẩn danh'}</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
            title="Xóa toàn bộ lịch sử trò chuyện"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa hội thoại</span>
          </button>
        </div>
      </div>

      {/* Backend API Configuration Warning if not connected */}
      {!aiStatus.configured && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold">Chưa kết nối Gemini API</p>
            <p className="mt-0.5 leading-relaxed">
              Biến môi trường <code>GEMINI_API_KEY</code> chưa được thiết lập trên máy chủ.
              Hệ thống không giả lập câu trả lời ảo. Vui lòng cấu hình khóa API trong bảng Secrets để kích hoạt trợ lý AI.
            </p>
          </div>
        </div>
      )}

      {/* Suggested Quick Question Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {suggestedQuestions.map((q, idx) => {
          const Icon = q.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.label)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-900 hover:bg-[#FCE8EF]/40 border border-[#FCE8EF] dark:border-gray-800 rounded-xl text-xs font-semibold text-[#343746] dark:text-gray-300 whitespace-nowrap shadow-2xs transition-all hover:border-[#F4A7C3]"
            >
              <Icon className="w-3.5 h-3.5 text-[#3978AE]" />
              <span>{q.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F4A7C3] to-[#83BDEB] flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-xs">
                    NV
                  </div>
                )}

                <div>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-[#3978AE] text-white rounded-tr-xs'
                        : 'bg-[#FFF8EF] dark:bg-gray-800 text-[#343746] dark:text-gray-100 rounded-tl-xs border border-[#FCE8EF] dark:border-gray-700'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span
                    className={`text-[10px] text-gray-400 block mt-1 ${
                      isUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-3.5 py-2.5 rounded-2xl w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Nutrivita AI đang suy nghĩ câu trả lời...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3.5 bg-gray-50/70 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Đặt câu hỏi về dinh dưỡng, bài tập, thực đơn..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4A7C3] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="p-2.5 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white rounded-2xl transition-all disabled:opacity-40 shadow-xs"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-2">
            Nutrivita AI đưa ra lời khuyên hỗ trợ lối sống, không đưa ra kết luận y khoa hay kê đơn thuốc.
          </p>
        </div>
      </div>
    </div>
  );
};
