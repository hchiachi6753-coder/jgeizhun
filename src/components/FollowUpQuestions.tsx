'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FOLLOW_UP_CATEGORIES, QuestionCategory } from '@/lib/followup-questions';
import { canAskFollowUp, getRemainingFollowUps, recordFollowUp, getLimitMessage, getHoursUntilReset } from '@/lib/usage-limit';
import { logUsage } from '@/lib/usage-logger';

interface FollowUpItem {
  question: string;
  answer: string;
}

interface FollowUpQuestionsProps {
  chartType: 'bazi' | 'ziwei' | 'comprehensive' | 'yijing';
  chartData: any;
  originalInterpretation: string;
  // 新增：追問歷史由父組件管理
  followUpHistory: FollowUpItem[];
  onNewFollowUp: (item: FollowUpItem) => void;
}

export default function FollowUpQuestions({
  chartType,
  chartData,
  originalInterpretation,
  followUpHistory,
  onNewFollowUp,
}: FollowUpQuestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [remaining, setRemaining] = useState(2);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const [hoursUntilReset, setHoursUntilReset] = useState(0);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  // 更新限制狀態
  const updateLimitStatus = () => {
    const canAsk = canAskFollowUp();
    const remainingCount = getRemainingFollowUps();
    setRemaining(remainingCount);
    setLimitReached(!canAsk);
    if (!canAsk) {
      setLimitMessage(getLimitMessage());
      setHoursUntilReset(getHoursUntilReset());
    }
  };

  // 初始化檢查剩餘次數
  useEffect(() => {
    updateLimitStatus();
  }, []);

  const handleAskQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    // 再次檢查是否還有額度
    if (!canAskFollowUp()) {
      setLimitReached(true);
      setLimitMessage(getLimitMessage());
      setHoursUntilReset(getHoursUntilReset());
      return;
    }
    
    setCurrentQuestion(question);
    setLoading(true);
    setCurrentAnswer('');
    setShowQuestionPicker(false);
    setSelectedCategory(null);
    setCustomQuestion('');

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
        // 記錄使用次數
        recordFollowUp();
        setCurrentAnswer(data.answer);
        
        // 通知父組件新增追問記錄
        onNewFollowUp({ question, answer: data.answer });
        
        // 記錄到 Google Sheet
        const featureMap: Record<string, '八字' | '紫微' | '綜合' | '易經'> = {
          bazi: '八字',
          ziwei: '紫微',
          comprehensive: '綜合',
          yijing: '易經',
        };
        logUsage(featureMap[chartType] || '綜合', '追問', question);
        
        // 更新限制狀態
        updateLimitStatus();
        
        // 清除當前問答狀態（已經加到歷史了）
        setCurrentQuestion('');
        setCurrentAnswer('');
      } else {
        setCurrentAnswer('抱歉，回答生成失敗，請稍後再試。');
      }
    } catch (error) {
      setCurrentAnswer('網路錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 border-t border-purple-500/30 pt-8">
      {/* 追問歷史記錄 */}
      {followUpHistory.length > 0 && (
        <div className="space-y-6 mb-8">
          {followUpHistory.map((item, index) => (
            <div 
              key={index} 
              className="rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.2) 0%, rgba(75, 0, 130, 0.2) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              {/* 問題 */}
              <div className="px-5 py-4 bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-b border-amber-500/20">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <div className="text-amber-400/70 text-xs mb-1">追問 {index + 1}</div>
                    <p className="text-amber-200 font-medium">{item.question}</p>
                  </div>
                </div>
              </div>
              
              {/* 回答 */}
              <div className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔮</span>
                  <div className="flex-1 interpretation-content">
                    <ReactMarkdown>{item.answer}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 當前正在回答的問題 */}
      {loading && (
        <div 
          className="rounded-xl overflow-hidden mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.2) 0%, rgba(75, 0, 130, 0.2) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div className="px-5 py-4 bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-b border-amber-500/20">
            <div className="flex items-start gap-3">
              <span className="text-xl">💬</span>
              <div>
                <div className="text-amber-400/70 text-xs mb-1">追問 {followUpHistory.length + 1}</div>
                <p className="text-amber-200 font-medium">{currentQuestion}</p>
              </div>
            </div>
          </div>
          <div className="px-5 py-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              <span className="ml-3 text-purple-300">正在分析命盤...</span>
            </div>
          </div>
        </div>
      )}

      {/* 底部操作區 */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* 繼續追問按鈕 */}
        {!limitReached && !showQuestionPicker && (
          <button
            onClick={() => setShowQuestionPicker(true)}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            <span>🤖</span>
            <span>{followUpHistory.length === 0 ? '追問命盤' : '繼續追問'}</span>
            <span className="text-purple-200/70 text-sm">({remaining} 題)</span>
          </button>
        )}

        {/* 列印按鈕 */}
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl text-white font-medium hover:from-gray-600 hover:to-gray-500 transition-all flex items-center gap-2 shadow-lg print:hidden"
        >
          <span>📄</span>
          <span>列印報告</span>
        </button>
      </div>

      {/* 已達上限提示 */}
      {limitReached && !loading && (
        <div className="mt-6 p-6 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-purple-800/40 rounded-xl border border-purple-500/30 text-center">
          <div className="text-4xl mb-4">🌙</div>
          <p className="text-purple-200 whitespace-pre-line leading-relaxed mb-4">
            {limitMessage}
          </p>
          <p className="text-purple-400/70 text-sm">
            ⏰ 約 {hoursUntilReset} 小時後重置
          </p>
        </div>
      )}

      {/* 問題選擇區 */}
      {showQuestionPicker && !limitReached && (
        <div className="mt-6 p-6 bg-purple-900/30 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-purple-200">選擇追問方向</h4>
            <button
              onClick={() => {
                setShowQuestionPicker(false);
                setSelectedCategory(null);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

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

              {/* 預設問題 */}
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
        </div>
      )}
    </div>
  );
}
