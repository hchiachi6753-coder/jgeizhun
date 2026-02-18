'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { calculateZiweiChart, type ZiweiChart as ZiweiChartType } from '@/lib/ziwei/index';
import { calculateBazi, type BaziResult, DI_ZHI } from '@/lib/bazi';
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

function ComprehensiveResultContent() {
  const searchParams = useSearchParams();
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const year = parseInt(searchParams.get('year') || '0');
  const month = parseInt(searchParams.get('month') || '0');
  const day = parseInt(searchParams.get('day') || '0');
  const shichen = searchParams.get('shichen') || '';
  const gender = searchParams.get('gender') as 'male' | 'female';
  
  // 計算紫微命盤
  const ziweiChart = useMemo(() => {
    if (!year || !month || !day || !shichen || !gender) {
      return null;
    }
    
    const hour = SHICHEN_TO_HOUR[shichen] ?? 12;
    
    try {
      return calculateZiweiChart(year, month, day, hour, 0, gender);
    } catch (e) {
      console.error('紫微排盤失敗:', e);
      return null;
    }
  }, [year, month, day, shichen, gender]);

  // 計算八字命盤
  const baziResult = useMemo(() => {
    if (!year || !month || !day || !shichen || !gender) {
      return null;
    }
    
    try {
      const hourIndex = DI_ZHI.indexOf(shichen);
      const hour = hourIndex === 0 ? 23 : (hourIndex * 2 - 1);
      return calculateBazi(year, month, day, hour, 0, gender);
    } catch (e) {
      console.error('八字排盤失敗:', e);
      return null;
    }
  }, [year, month, day, shichen, gender]);

  // AI 綜合解讀
  const handleInterpret = async () => {
    if (!ziweiChart || !baziResult || isLoading) return;

    setIsLoading(true);
    setShowModal(true);
    setInterpretation(null);

    try {
      const response = await fetch('/api/interpret-comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ziweiChart, 
          baziResult,
          birthInfo: { year, month, day, shichen, gender }
        }),
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

  if (!ziweiChart || !baziResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">資料不完整或排盤失敗</p>
          <Link 
            href="/comprehensive" 
            className="text-purple-300 hover:text-amber-300 transition-colors"
          >
            ← 返回重新輸入
          </Link>
        </div>
      </div>
    );
  }

  const { yearPillar, monthPillar, dayPillar, hourPillar, yearShiShen, monthShiShen, hourShiShen } = baziResult;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      {/* 背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px]" />
      </div>

      {/* 頂部裝飾線（雙色漸層） */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-purple-500/50 z-20" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* 導航 */}
        <nav className="mb-6 flex items-center justify-between">
          <Link 
            href="/comprehensive" 
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
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-purple-400 bg-clip-text text-transparent">
              綜合排盤
            </span>
          </h1>
          <p className="text-gray-400 text-sm">
            {year}年{month}月{day}日 {shichen}時 · {gender === 'male' ? '男' : '女'}命
          </p>
          <p className="text-gray-500 text-xs mt-1">
            八字定客觀氣勢 · 紫微定內在心理
          </p>
        </header>

        {/* 八字四柱區塊 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
            🎴 八字四柱
            <span className="text-sm font-normal text-gray-400">（客觀氣勢）</span>
          </h2>
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {/* 年柱 */}
            <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-3 md:p-4 text-center">
              <div className="text-amber-300/60 text-xs md:text-sm mb-1">年柱</div>
              <div className="text-amber-400/80 text-xs mb-1">{yearShiShen}</div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">{yearPillar.gan}</div>
              <div className="text-2xl md:text-3xl font-bold text-purple-300">{yearPillar.zhi}</div>
              <div className="text-purple-400/60 text-xs mt-2">{yearPillar.ganWuXing}{yearPillar.zhiWuXing}</div>
            </div>

            {/* 月柱 */}
            <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-3 md:p-4 text-center">
              <div className="text-amber-300/60 text-xs md:text-sm mb-1">月柱</div>
              <div className="text-amber-400/80 text-xs mb-1">{monthShiShen}</div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">{monthPillar.gan}</div>
              <div className="text-2xl md:text-3xl font-bold text-purple-300">{monthPillar.zhi}</div>
              <div className="text-purple-400/60 text-xs mt-2">{monthPillar.ganWuXing}{monthPillar.zhiWuXing}</div>
            </div>

            {/* 日柱 */}
            <div className="bg-gradient-to-br from-amber-900/40 to-purple-900/40 border-2 border-amber-500/50 rounded-xl p-3 md:p-4 text-center shadow-lg shadow-amber-500/10">
              <div className="text-amber-300/80 text-xs md:text-sm mb-1 font-medium">日柱（日主）</div>
              <div className="text-amber-400/80 text-xs mb-1">日元</div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">{dayPillar.gan}</div>
              <div className="text-2xl md:text-3xl font-bold text-purple-300">{dayPillar.zhi}</div>
              <div className="text-purple-400/60 text-xs mt-2">{dayPillar.ganWuXing}{dayPillar.zhiWuXing}</div>
            </div>

            {/* 時柱 */}
            <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-3 md:p-4 text-center">
              <div className="text-amber-300/60 text-xs md:text-sm mb-1">時柱</div>
              <div className="text-amber-400/80 text-xs mb-1">{hourShiShen}</div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">{hourPillar.gan}</div>
              <div className="text-2xl md:text-3xl font-bold text-purple-300">{hourPillar.zhi}</div>
              <div className="text-purple-400/60 text-xs mt-2">{hourPillar.ganWuXing}{hourPillar.zhiWuXing}</div>
            </div>
          </div>

          {/* 藏干顯示 */}
          <div className="mt-4 bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-3">地支藏干</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                {baziResult.yearCangGan.map((cg, i) => (
                  <div key={i} className="text-purple-300">
                    {cg.gan} <span className="text-amber-400/70 text-xs">({cg.shiShen})</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                {baziResult.monthCangGan.map((cg, i) => (
                  <div key={i} className="text-purple-300">
                    {cg.gan} <span className="text-amber-400/70 text-xs">({cg.shiShen})</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                {baziResult.dayCangGan.map((cg, i) => (
                  <div key={i} className="text-purple-300">
                    {cg.gan} <span className="text-amber-400/70 text-xs">({cg.shiShen})</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                {baziResult.hourCangGan.map((cg, i) => (
                  <div key={i} className="text-purple-300">
                    {cg.gan} <span className="text-amber-400/70 text-xs">({cg.shiShen})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 大運 */}
          <div className="mt-4 bg-amber-900/20 border border-amber-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-3">大運流程</h3>
            <div className="flex flex-wrap gap-2">
              {baziResult.daYun.slice(0, 8).map((dy, i) => (
                <div key={i} className="bg-amber-800/30 px-3 py-2 rounded-lg text-center min-w-[55px]">
                  <div className="text-amber-400/60 text-xs">{dy.startAge}歲</div>
                  <div className="text-white font-bold text-sm">{dy.ganZhi}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 紫微命盤區塊 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
            ⭐ 紫微命盤
            <span className="text-sm font-normal text-gray-400">（內在心理）</span>
          </h2>
          <ZiweiChart chart={ziweiChart} showDetails={true} />
        </section>

        {/* AI 分析按鈕 */}
        <div className="text-center mb-8">
          <button
            onClick={handleInterpret}
            disabled={isLoading}
            className="px-10 py-5 bg-gradient-to-r from-amber-500 via-amber-600 to-purple-600 rounded-xl font-bold text-lg text-white border border-amber-500/50 hover:from-amber-400 hover:via-amber-500 hover:to-purple-500 transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI 綜合解讀中...
              </span>
            ) : (
              '🤖 AI 八字+紫微 綜合解讀'
            )}
          </button>
          <p className="text-gray-500 text-xs mt-2">Powered by Gemini AI · 雙系統深度分析</p>
        </div>

        {/* 說明 */}
        <div className="p-6 bg-slate-900/50 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-bold text-amber-200 mb-3">📖 雙系統說明</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-400">
            <div>
              <h4 className="text-amber-300 mb-2 font-medium">🎴 八字（客觀系統）</h4>
              <ul className="space-y-1">
                <li>• <span className="text-amber-200">格局</span>：分析命主的事業格局與人生走向</li>
                <li>• <span className="text-amber-200">五行</span>：判斷喜用神與忌神</li>
                <li>• <span className="text-amber-200">大運</span>：預測不同人生階段的吉凶起伏</li>
                <li>• <span className="text-amber-200">調候</span>：診斷命局環境與用神藥方</li>
              </ul>
            </div>
            <div>
              <h4 className="text-purple-300 mb-2 font-medium">⭐ 紫微（主觀系統）</h4>
              <ul className="space-y-1">
                <li>• <span className="text-purple-200">星曜</span>：揭示內在性格與心理特質</li>
                <li>• <span className="text-purple-200">宮位</span>：分析人生各面向的課題</li>
                <li>• <span className="text-purple-200">四化</span>：預測機會與挑戰的來源</li>
                <li>• <span className="text-purple-200">大限</span>：追蹤心理狀態的階段變化</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-gray-500 text-sm border-t border-gray-700/50 pt-4">
            💡 雙系統合參：八字看「客觀會發生什麼」，紫微看「主觀會怎麼感受」。事件與心理交叉印證，分析更精準。
          </p>
        </div>
      </div>

      {/* AI 解讀彈窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1a1a3a] to-[#0d0d2b] rounded-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* 標題 */}
            <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-amber-900/30 to-purple-900/30">
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-300 to-purple-300 bg-clip-text text-transparent">
                ☯️ AI 八字+紫微 綜合解讀
              </h2>
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
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4" />
                  <p className="text-amber-300">AI 正在進行八字+紫微雙系統分析...</p>
                  <p className="text-gray-500 text-sm mt-2">這可能需要 15-30 秒</p>
                </div>
              ) : interpretation ? (
                <div className="interpretation-content">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
              ) : null}
            </div>

            {/* 底部 */}
            {!isLoading && interpretation && (
              <div className="p-4 border-t border-amber-500/20 text-center">
                <p className="text-gray-500 text-xs">
                  ⚠️ AI 解讀僅供參考，命盤是統計不是限制。八字定客觀、紫微定主觀，雙系統互補印證。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function ComprehensiveResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] flex items-center justify-center">
        <div className="text-amber-300 animate-pulse">綜合排盤計算中...</div>
      </div>
    }>
      <ComprehensiveResultContent />
    </Suspense>
  );
}
