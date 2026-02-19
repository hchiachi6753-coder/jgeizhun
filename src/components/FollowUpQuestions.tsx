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

  const handleBack = () => {
    if (showAnswer) {
      setShowAnswer(false);
      setAnswer('');
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const handleNewQuestion = () => {
    setShowAnswer(false);
    setAnswer('');
    setSelectedCategory(null);
    setCustomQuestion('');
  };

  return (
    <div className="mt-8 border-t border-purple-500/30 pt-8">
      <h3 className="text-xl font-bold text-center mb-6 text-purple-200">
        ✨ 想進一步了解嗎？
      </h3>

      {/* 答案顯示 */}
      {showAnswer && (
        <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="text-purple-300 hover:text-white transition-colors text-sm"
            >
              ← 返回
            </button>
            <button
              onClick={handleNewQuestion}
              className="text-purple-300 hover:text-white transition-colors text-sm"
            >
              問其他問題
            </button>
          </div>
          
          <div className="mb-4 p-3 bg-purple-800/30 rounded-lg">
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
                  className="p-4 bg-purple-900/40 hover:bg-purple-800/50 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all text-center group"
                >
                  <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className="text-purple-200 font-medium">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 具體問題選擇 */}
          {selectedCategory && (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-purple-300 hover:text-white transition-colors text-sm mb-2"
              >
                ← 返回分類
              </button>

              <h4 className="text-lg font-medium text-purple-200 mb-4">
                {selectedCategory.icon} {selectedCategory.name}
              </h4>

              {/* 預設問題 */}
              <div className="space-y-2">
                {selectedCategory.questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleAskQuestion(question)}
                    className="w-full text-left p-3 bg-purple-900/40 hover:bg-purple-800/50 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all text-purple-200 hover:text-white"
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
                    className="flex-1 px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={() => handleAskQuestion(customQuestion)}
                    disabled={!customQuestion.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-white hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
