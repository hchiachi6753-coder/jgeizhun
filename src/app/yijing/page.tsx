'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function YijingPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');

  const handleStart = () => {
    if (!question.trim()) {
      alert('請輸入您想占問的問題');
      return;
    }
    // 將問題存到 sessionStorage，傳到搖卦頁面
    sessionStorage.setItem('yijing_question', question);
    router.push('/yijing/shake');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      {/* 背景裝飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[300px] bg-amber-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[250px] bg-yellow-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        {/* 標題 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 mb-6 shadow-lg shadow-amber-500/30">
            <span className="text-5xl">☰</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              易經占卜
            </span>
          </h1>
          <p className="text-amber-200/60">六爻搖卦 · 古法銅錢</p>
        </div>

        {/* 說明 */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-amber-500/20">
          <h2 className="text-lg font-semibold text-amber-300 mb-4">📖 占卜說明</h2>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• 心中默念您想占問的問題</li>
            <li>• 問題要具體明確，例如「這份工作適合我嗎？」</li>
            <li>• 避免問「是非題」以外的問題</li>
            <li>• 同一問題不宜反覆占卜</li>
            <li>• 誠心誠意，方得靈驗</li>
          </ul>
        </div>

        {/* 輸入問題 */}
        <div className="mb-8">
          <label className="block text-amber-300 mb-3 font-medium">
            🙏 請輸入您想占問的問題
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：這份工作機會適合我嗎？"
            className="w-full px-4 py-4 bg-white/10 border border-amber-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            rows={3}
          />
        </div>

        {/* 開始按鈕 */}
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl font-bold text-xl text-white hover:from-amber-400 hover:to-yellow-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30"
        >
          開始搖卦 ☰
        </button>

        {/* 返回 */}
        <div className="text-center mt-8">
          <a href="/" className="text-gray-500 hover:text-amber-400 transition-colors">
            ← 返回首頁
          </a>
        </div>
      </div>
    </main>
  );
}
