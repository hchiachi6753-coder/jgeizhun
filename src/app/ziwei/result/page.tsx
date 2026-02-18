'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import Link from 'next/link';
import { calculateZiweiChart } from '@/lib/ziwei/index';
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

        {/* AI 分析按鈕 */}
        <div className="mt-8 text-center">
          <button
            disabled
            className="px-8 py-4 bg-gradient-to-r from-purple-600/40 to-indigo-600/40 rounded-xl font-bold text-purple-200 border border-purple-500/30 cursor-not-allowed hover:from-purple-500/50 hover:to-indigo-500/50 transition-all"
          >
            🤖 AI 命理分析（即將推出）
          </button>
        </div>

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
