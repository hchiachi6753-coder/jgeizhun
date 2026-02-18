'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { calculateZiweiChart, type ZiweiChart as ZiweiChartType } from '@/lib/ziwei/index';
import { calculateBazi, type BaziResult, DI_ZHI } from '@/lib/bazi';
import ZiweiChart from '@/components/ZiweiChart';
import LoadingAnimation from '@/components/LoadingAnimation';

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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px]" />
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
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-purple-400 bg-clip-text text-transparent text-glow-gold">
              ☯️ 綜合排盤
            </span>
          </h1>
          <p className="text-gray-300 text-base">
            {year}年{month}月{day}日 {shichen}時 · {gender === 'male' ? '乾造（男）' : '坤造（女）'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            八字定客觀氣勢 · 紫微定內在心理
          </p>
        </header>

        {/* ===== 八字四柱區塊 ===== */}
        <section className="mb-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-amber-950/30 border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
          {/* 區塊標題 */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-500/30">
            <span className="text-3xl">🎴</span>
            <div>
              <h2 className="text-2xl font-bold text-amber-300 text-glow-gold">八字四柱</h2>
              <p className="text-amber-400/60 text-sm">客觀氣勢 · 格局五行 · 大運流年</p>
            </div>
          </div>

          {/* 四柱顯示 */}
          <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
            {/* 年柱 */}
            <div className="bg-gradient-to-b from-amber-900/50 to-amber-950/50 border border-amber-500/40 rounded-xl p-3 md:p-4 text-center shadow-lg">
              <div className="text-amber-400/70 text-xs md:text-sm mb-2 font-medium">年柱</div>
              <div className="text-amber-300 text-xs mb-1 opacity-80">{yearShiShen}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{yearPillar.gan}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-200/90">{yearPillar.zhi}</div>
              <div className="text-amber-400/50 text-xs mt-2">{yearPillar.ganWuXing}{yearPillar.zhiWuXing}</div>
            </div>

            {/* 月柱 */}
            <div className="bg-gradient-to-b from-amber-900/50 to-amber-950/50 border border-amber-500/40 rounded-xl p-3 md:p-4 text-center shadow-lg">
              <div className="text-amber-400/70 text-xs md:text-sm mb-2 font-medium">月柱</div>
              <div className="text-amber-300 text-xs mb-1 opacity-80">{monthShiShen}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{monthPillar.gan}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-200/90">{monthPillar.zhi}</div>
              <div className="text-amber-400/50 text-xs mt-2">{monthPillar.ganWuXing}{monthPillar.zhiWuXing}</div>
            </div>

            {/* 日柱（日主）- 特別突出 */}
            <div className="bg-gradient-to-b from-amber-800/60 to-amber-900/60 border-2 border-amber-400 rounded-xl p-3 md:p-4 text-center shadow-[0_0_20px_rgba(251,191,36,0.2)] relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded">日主</div>
              <div className="text-amber-300 text-xs md:text-sm mb-2 font-medium mt-1">日柱</div>
              <div className="text-amber-200 text-xs mb-1">日元</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">{dayPillar.gan}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-100">{dayPillar.zhi}</div>
              <div className="text-amber-300/60 text-xs mt-2">{dayPillar.ganWuXing}{dayPillar.zhiWuXing}</div>
            </div>

            {/* 時柱 */}
            <div className="bg-gradient-to-b from-amber-900/50 to-amber-950/50 border border-amber-500/40 rounded-xl p-3 md:p-4 text-center shadow-lg">
              <div className="text-amber-400/70 text-xs md:text-sm mb-2 font-medium">時柱</div>
              <div className="text-amber-300 text-xs mb-1 opacity-80">{hourShiShen}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{hourPillar.gan}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-200/90">{hourPillar.zhi}</div>
              <div className="text-amber-400/50 text-xs mt-2">{hourPillar.ganWuXing}{hourPillar.zhiWuXing}</div>
            </div>
          </div>

          {/* 藏干 + 大運 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* 藏干顯示 */}
            <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                地支藏干
              </h3>
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-amber-500/50 text-xs mb-1">年支</div>
                  {baziResult.yearCangGan.map((cg, i) => (
                    <div key={i} className="text-amber-200">
                      {cg.gan} <span className="text-amber-400/60 text-xs">({cg.shiShen})</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-amber-500/50 text-xs mb-1">月支</div>
                  {baziResult.monthCangGan.map((cg, i) => (
                    <div key={i} className="text-amber-200">
                      {cg.gan} <span className="text-amber-400/60 text-xs">({cg.shiShen})</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-amber-500/50 text-xs mb-1">日支</div>
                  {baziResult.dayCangGan.map((cg, i) => (
                    <div key={i} className="text-amber-200">
                      {cg.gan} <span className="text-amber-400/60 text-xs">({cg.shiShen})</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-amber-500/50 text-xs mb-1">時支</div>
                  {baziResult.hourCangGan.map((cg, i) => (
                    <div key={i} className="text-amber-200">
                      {cg.gan} <span className="text-amber-400/60 text-xs">({cg.shiShen})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 大運 */}
            <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                大運流程
              </h3>
              <div className="flex flex-wrap gap-2">
                {baziResult.daYun.slice(0, 8).map((dy, i) => (
                  <div key={i} className="bg-amber-900/50 border border-amber-600/30 px-3 py-2 rounded-lg text-center min-w-[55px] hover:border-amber-500/60 transition-colors">
                    <div className="text-amber-400/60 text-xs">{dy.startAge}歲</div>
                    <div className="text-amber-200 font-bold text-sm">{dy.ganZhi}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== 紫微命盤區塊 ===== */}
        <section className="mb-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-900/20 to-purple-950/30 border-2 border-purple-500/40 shadow-[0_0_40px_rgba(147,51,234,0.1)]">
          {/* 區塊標題 */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-500/30">
            <span className="text-3xl">⭐</span>
            <div>
              <h2 className="text-2xl font-bold text-purple-300 text-glow-purple">紫微命盤</h2>
              <p className="text-purple-400/60 text-sm">內在心理 · 星曜宮位 · 大限流年</p>
            </div>
          </div>

          {/* 紫微命盤 */}
          <ZiweiChart chart={ziweiChart} showDetails={true} />
        </section>

        {/* 浮動 AI 按鈕 */}
        <button
          onClick={handleInterpret}
          disabled={isLoading}
          className="fixed bottom-8 right-8 z-40 group"
        >
          <div className="relative">
            {/* 光暈效果 - 雙色漸層 */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
            {/* 按鈕本體 - 流動漸層 */}
            <div className="relative flex items-center gap-3 px-6 py-4 animate-gradient-dual rounded-full font-bold text-white border-2 border-amber-300/50 shadow-2xl shadow-purple-900/50 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300 disabled:opacity-50">
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
                  <span className="text-2xl">☯️</span>
                  <span>全盤深度解命</span>
                </>
              )}
            </div>
          </div>
        </button>

        {/* 說明 */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-2xl border border-gray-700/50 shadow-lg">
          <h3 className="text-xl font-bold text-amber-200 mb-6 flex items-center gap-2">
            📖 雙系統說明
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 八字說明 */}
            <div className="p-5 bg-amber-950/30 rounded-xl border border-amber-500/20">
              <h4 className="text-amber-300 mb-4 font-bold text-lg flex items-center gap-2">
                🎴 八字（客觀系統）
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">→</span>
                  <span><span className="text-amber-200 font-medium">格局</span>：分析命主的事業格局與人生走向</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">→</span>
                  <span><span className="text-amber-200 font-medium">五行</span>：判斷喜用神與忌神</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">→</span>
                  <span><span className="text-amber-200 font-medium">大運</span>：預測不同人生階段的吉凶起伏</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">→</span>
                  <span><span className="text-amber-200 font-medium">調候</span>：診斷命局環境與用神藥方</span>
                </li>
              </ul>
            </div>

            {/* 紫微說明 */}
            <div className="p-5 bg-purple-950/30 rounded-xl border border-purple-500/20">
              <h4 className="text-purple-300 mb-4 font-bold text-lg flex items-center gap-2">
                ⭐ 紫微（主觀系統）
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  <span><span className="text-purple-200 font-medium">星曜</span>：揭示內在性格與心理特質</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  <span><span className="text-purple-200 font-medium">宮位</span>：分析人生各面向的課題</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  <span><span className="text-purple-200 font-medium">四化</span>：預測機會與挑戰的來源</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">→</span>
                  <span><span className="text-purple-200 font-medium">大限</span>：追蹤心理狀態的階段變化</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-950/30 to-purple-950/30 rounded-xl border border-amber-500/10">
            <p className="text-gray-400 text-sm flex items-start gap-2">
              <span className="text-amber-400 text-lg">💡</span>
              <span><span className="text-amber-200 font-medium">雙系統合參</span>：八字看「客觀會發生什麼」，紫微看「主觀會怎麼感受」。事件與心理交叉印證，分析更精準。</span>
            </p>
          </div>
        </div>
      </div>

      {/* AI 解讀彈窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#1a1a3a] via-[#151530] to-[#0d0d2b] rounded-3xl border-2 border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.15)]">
            {/* 標題 */}
            <div className="p-5 border-b border-amber-500/20 flex items-center justify-between bg-gradient-to-r from-amber-900/30 via-purple-900/20 to-amber-900/30">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">☯️</span>
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-purple-300 bg-clip-text text-transparent">
                  AI 八字+紫微 綜合解讀
                </span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all text-2xl"
              >
                ×
              </button>
            </div>

            {/* 內容 */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
              {isLoading ? (
                <LoadingAnimation type="comprehensive" />
              ) : interpretation ? (
                <div className="interpretation-content">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
              ) : null}
            </div>

            {/* 底部 */}
            {!isLoading && interpretation && (
              <div className="p-4 border-t border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-purple-950/20">
                <p className="text-gray-500 text-xs text-center">
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
        <div className="text-amber-300 animate-pulse text-lg">綜合排盤計算中...</div>
      </div>
    }>
      <ComprehensiveResultContent />
    </Suspense>
  );
}
