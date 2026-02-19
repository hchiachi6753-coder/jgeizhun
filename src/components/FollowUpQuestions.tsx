'use client';

import { useState } from 'react';
import { FOLLOW_UP_CATEGORIES, QuestionCategory } from '@/lib/followup-questions';

interface FollowUpQuestionsProps {
  chartType: 'bazi' | 'ziwei' | 'comprehensive' | 'yijing';
  chartData: any;
  originalInterpretation: string;
}

export default function FollowUpQuestions({
  chartType,
  chartData,
  originalInterpretation,
}: FollowUpQuestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleAskQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    setCurrentQuestion(question);
    setLoading(true);
    setShowAnswer(true);
    setAnswer('');

    try {
      const response = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          chartType,
          chartData,
          originalInterpretation,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnswer(data.answer);
      } else {
        setAnswer('抱歉，回答生成失敗，請稍後再試。');
      }
    } catch (error) {
      setAnswer('網路錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCategories = () => {
    setShowAnswer(false);
    setAnswer('');
    setSelectedCategory(null);
    setCustomQuestion('');
  };

  return (
    <div className="mt-8 border-t border-purple-500/30 pt-8">
      <h3 className="text-xl font-bold text-center mb-6 text-purple-200">
        ✨ 想問更多？
      </h3>

      {/* 答案顯示 */}
      {showAnswer && (
        <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={handleBackToCategories}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-medium hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              再問一題
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-800/50 to-purple-700/30 rounded-lg border border-purple-500/30">
            <span className="text-purple-400 text-sm">你的問題：</span>
            <p className="text-white mt-1">{currentQuestion}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              <span className="ml-3 text-purple-300">正在分析命盤...</span>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {answer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 問題選擇區 */}
      {!showAnswer && (
        <>
          {/* 分類選擇 */}
          {!selectedCategory && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FOLLOW_UP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className="group relative p-4 rounded-xl text-center overflow-hidden transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-800/60 via-purple-700/50 to-purple-900/60 border-2 border-amber-500/50 hover:border-amber-400"
                  style={{
                    boxShadow: '0 0 15px rgba(245, 158, 11, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
                >
                  {/* 內容 */}
                  <div className="relative z-10">
                    <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </span>
                    <span className="text-white font-medium">
                      {category.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 具體問題選擇 */}
          {selectedCategory && (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-medium hover:from-amber-400 hover:to-orange-400 transition-all text-sm"
              >
                ← 返回分類
              </button>

              <h4 className="text-lg font-medium text-purple-200 mb-4">
                {selectedCategory.icon} {selectedCategory.name}
              </h4>

              {/* 預設問題 - 加淡漸層 */}
              <div className="space-y-2">
                {selectedCategory.questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleAskQuestion(question)}
                    className="w-full text-left p-3 bg-gradient-to-r from-purple-800/40 via-purple-700/30 to-purple-800/40 hover:from-purple-700/50 hover:via-purple-600/40 hover:to-purple-700/50 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all text-purple-200 hover:text-white"
                  >
                    {question}
                  </button>
                ))}
              </div>

              {/* 自訂問題 */}
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <p className="text-purple-400 text-sm mb-2">或者，輸入你自己的問題：</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customQuestion.trim()) {
                        handleAskQuestion(customQuestion);
                      }
                    }}
                    placeholder="輸入你想問的問題..."
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-purple-900/40 border border-purple-500/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={() => handleAskQuestion(customQuestion)}
                    disabled={!customQuestion.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-medium text-white hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    送出
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
