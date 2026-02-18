'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { calculateZiweiChart, type ZiweiChart as ZiweiChartType } from '@/lib/ziwei/index';
import ZiweiChart from '@/components/ZiweiChart';

// 時辰對應小時
const SHICHEN_TO_HOUR: Record<string, number> = {
  '子': 23,
  '丑': 1,
  '寅': 3,
  '卯': 5,
  '辰': 7,
  '巳': 9,
  '午': 11,
  '未': 13,
  '申': 15,
  '酉': 17,
  '戌': 19,
  '亥': 21,
};

function ZiweiResultContent() {
  const searchParams = useSearchParams();
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const year = parseInt(searchParams.get('year') || '0');
  const month = parseInt(searchParams.get('month') || '0');
  const day = parseInt(searchParams.get('day') || '0');
  const shichen = searchParams.get('shichen') || '';
  const gender = searchParams.get('gender') as 'male' | 'female';
  
  const chart = useMemo(() => {
    if (!year || !month || !day || !shichen || !gender) {
      return null;
    }
    
    const hour = SHICHEN_TO_HOUR[shichen] ?? 12;
    
    try {
      return calculateZiweiChart(year, month, day, hour, 0, gender);
    } catch (e) {
      console.error('排盤失敗:', e);
      return null;
    }
  }, [year, month, day, shichen, gender]);

  // AI 解讀
  const handleInterpret = async () => {
    if (!chart || isLoading) return;

    setIsLoading(true);
    setShowModal(true);
    setInterpretation(null);

    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart }),
      });

      const data = await response.json();

      if (data.success) {
        setInterpretation(data.interpretation);
      } else {
        setInterpretation('❌ ' + (data.error || '解讀生成失敗'));
      }
    } catch (error) {
      console.error('API 錯誤:', error);
      setInterpretation('❌ 網路錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  if (!chart) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">資料不完整或排盤失敗</p>
          <Link 
            href="/ziwei" 
            className="text-purple-300 hover:text-amber-300 transition-colors"
          >
            ← 返回重新輸入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      {/* 背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* 導航 */}
        <nav className="mb-6 flex items-center justify-between">
          <Link 
            href="/ziwei" 
            className="text-purple-300 hover:text-amber-300 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>重新排盤</span>
          </Link>
          <Link 
            href="/" 
            className="text-gray-500 hover:text-purple-300 transition-colors text-sm"
          >
            返回首頁
          </Link>
        </nav>

        {/* 標題 */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
              紫微命盤
            </span>
          </h1>
          <p className="text-gray-400 text-sm">
            {year}年{month}月{day}日 {shichen}時 · {gender === 'male' ? '男' : '女'}命
          </p>
        </header>

        {/* 命盤組件 */}
        <ZiweiChart chart={chart} showDetails={true} />

        {/* 浮動 AI 按鈕 */}
        <button
          onClick={handleInterpret}
          disabled={isLoading}
          className="fixed bottom-8 right-8 z-40 group"
        >
          <div className="relative">
            {/* 光暈效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
            {/* 按鈕本體 */}
            <div className="relative flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-full font-bold text-white border-2 border-amber-400/50 shadow-2xl shadow-purple-900/50 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300 disabled:opacity-50">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>解讀中...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🔮</span>
                  <span>AI 解讀</span>
                </>
              )}
            </div>
          </div>
        </button>

        {/* 說明 */}
        <div className="mt-8 p-6 bg-slate-900/50 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-bold text-amber-200 mb-3">📖 命盤說明</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="text-purple-300 mb-2">十四主星</h4>
              <p>紫微、天機、太陽、武曲、天同、廉貞、天府、太陰、貪狼、巨門、天相、天梁、七殺、破軍。每顆主星有不同亮度（廟、旺、平、陷），影響吉凶程度。</p>
            </div>
            <div>
              <h4 className="text-blue-300 mb-2">六吉星</h4>
              <p>左輔、右弼、文昌、文曲、天魁、天鉞。吉星入命帶來助力與貴人運。</p>
            </div>
            <div>
              <h4 className="text-red-300 mb-2">六煞星</h4>
              <p>擎羊、陀羅、火星、鈴星、地空、地劫。煞星帶來挑戰，但也可能激發潛能。</p>
            </div>
            <div>
              <h4 className="text-emerald-300 mb-2">四化星</h4>
              <p>化祿（財運）、化權（權勢）、化科（名聲）、化忌（障礙）。四化依年干而定，是流年運勢的關鍵。</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI 解讀彈窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1a1a3a] to-[#0d0d2b] rounded-2xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* 標題 */}
            <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-amber-300">🔮 AI 命理解讀</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            {/* 內容 */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4" />
                  <p className="text-purple-300">AI 正在分析您的命盤...</p>
                  <p className="text-gray-500 text-sm mt-2">這可能需要 10-20 秒</p>
                </div>
              ) : interpretation ? (
                <div className="interpretation-content">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
              ) : null}
            </div>

            {/* 底部 */}
            {!isLoading && interpretation && (
              <div className="p-4 border-t border-purple-500/20 text-center">
                <p className="text-gray-500 text-xs">
                  ⚠️ AI 解讀僅供參考，命盤是統計不是限制
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function ZiweiResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] flex items-center justify-center">
        <div className="text-purple-300 animate-pulse">排盤計算中...</div>
      </div>
    }>
      <ZiweiResultContent />
    </Suspense>
  );
}
