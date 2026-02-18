'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { calculateBazi, type BaziResult, DI_ZHI } from '@/lib/bazi';

function BaziResultContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      const year = parseInt(searchParams.get('year') || '');
      const month = parseInt(searchParams.get('month') || '');
      const day = parseInt(searchParams.get('day') || '');
      const shichen = searchParams.get('shichen') || '';
      const gender = searchParams.get('gender') as 'male' | 'female';

      if (!year || !month || !day || !shichen || !gender) {
        setError('缺少必要參數');
        return;
      }

      // 將時辰轉換為小時
      const hourIndex = DI_ZHI.indexOf(shichen);
      const hour = hourIndex === 0 ? 23 : (hourIndex * 2 - 1);

      const bazi = calculateBazi(year, month, day, hour, 0, gender);
      setResult(bazi);
    } catch (e) {
      console.error('計算錯誤:', e);
      setError('計算發生錯誤');
    }
  }, [searchParams]);

  // AI 解讀
  const handleInterpret = async () => {
    if (!result || isLoading) return;

    setIsLoading(true);
    setShowModal(true);
    setInterpretation(null);

    try {
      const response = await fetch('/api/interpret-bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baziResult: result }),
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

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/bazi" className="text-amber-400 hover:underline">返回重新輸入</Link>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">命盤排列中...</div>
      </main>
    );
  }

  const { yearPillar, monthPillar, dayPillar, hourPillar, yearShiShen, monthShiShen, hourShiShen, lunarInfo, gender } = result;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white p-4">
      {/* 背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* 返回按鈕 */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/bazi" 
            className="inline-flex items-center text-amber-400/80 hover:text-amber-400 transition"
          >
            ← 重新排盤
          </Link>
          <Link 
            href="/" 
            className="text-gray-500 hover:text-purple-300 transition-colors text-sm"
          >
            返回首頁
          </Link>
        </div>

        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              八字命盤
            </span>
          </h1>
          <p className="text-purple-300/80">
            {gender === 'male' ? '乾造' : '坤造'} · {lunarInfo.yearGanZhi}年
          </p>
        </div>

        {/* 四柱顯示 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* 年柱 */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-purple-300/60 text-sm mb-2">年柱</div>
            <div className="text-amber-400/80 text-xs mb-1">{yearShiShen}</div>
            <div className="text-3xl font-bold text-amber-400">{yearPillar.gan}</div>
            <div className="text-3xl font-bold text-purple-300">{yearPillar.zhi}</div>
            <div className="text-purple-400/60 text-xs mt-2">{yearPillar.ganWuXing}{yearPillar.zhiWuXing}</div>
          </div>

          {/* 月柱 */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-purple-300/60 text-sm mb-2">月柱</div>
            <div className="text-amber-400/80 text-xs mb-1">{monthShiShen}</div>
            <div className="text-3xl font-bold text-amber-400">{monthPillar.gan}</div>
            <div className="text-3xl font-bold text-purple-300">{monthPillar.zhi}</div>
            <div className="text-purple-400/60 text-xs mt-2">{monthPillar.ganWuXing}{monthPillar.zhiWuXing}</div>
          </div>

          {/* 日柱 */}
          <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-4 text-center">
            <div className="text-amber-300/60 text-sm mb-2">日柱（日主）</div>
            <div className="text-amber-400/80 text-xs mb-1">日元</div>
            <div className="text-3xl font-bold text-amber-400">{dayPillar.gan}</div>
            <div className="text-3xl font-bold text-purple-300">{dayPillar.zhi}</div>
            <div className="text-purple-400/60 text-xs mt-2">{dayPillar.ganWuXing}{dayPillar.zhiWuXing}</div>
          </div>

          {/* 時柱 */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-purple-300/60 text-sm mb-2">時柱</div>
            <div className="text-amber-400/80 text-xs mb-1">{hourShiShen}</div>
            <div className="text-3xl font-bold text-amber-400">{hourPillar.gan}</div>
            <div className="text-3xl font-bold text-purple-300">{hourPillar.zhi}</div>
            <div className="text-purple-400/60 text-xs mt-2">{hourPillar.ganWuXing}{hourPillar.zhiWuXing}</div>
          </div>
        </div>

        {/* 藏干顯示 */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">地支藏干</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              {result.yearCangGan.map((cg, i) => (
                <div key={i} className="text-purple-300">
                  {cg.gan} <span className="text-amber-400/70 text-xs">({cg.shiShen})</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              {result.monthCangGan.map((cg, i) => (
                <div key={i} className="text-purple-300">
                  {cg.gan} <span className="text-amber-400/70 text-xs">({cg.shiShen})</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              {result.dayCangGan.map((cg, i) => (
                <div key={i} className="text-purple-300">
                  {cg.gan} <span className="text-amber-400/70 text-xs">({cg.shiShen})</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              {result.hourCangGan.map((cg, i) => (
                <div key={i} className="text-purple-300">
                  {cg.gan} <span className="text-amber-400/70 text-xs">({cg.shiShen})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 大運 */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">大運流程</h2>
          <div className="flex flex-wrap gap-3">
            {result.daYun.slice(0, 8).map((dy, i) => (
              <div key={i} className="bg-purple-800/30 px-3 py-2 rounded-lg text-center min-w-[60px]">
                <div className="text-amber-400/60 text-xs">{dy.startAge}歲</div>
                <div className="text-white font-bold">{dy.ganZhi}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 基本資訊 */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">基本資訊</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-300/60">農曆：</span>
              <span className="text-white">{lunarInfo.yearGanZhi}年 {lunarInfo.month}月 {lunarInfo.day}日</span>
            </div>
            <div>
              <span className="text-purple-300/60">節氣：</span>
              <span className="text-white">{result.jieQi || '—'}</span>
            </div>
            <div>
              <span className="text-purple-300/60">日主：</span>
              <span className="text-amber-400">{dayPillar.gan}{dayPillar.ganWuXing}</span>
            </div>
          </div>
        </div>

        {/* 浮動 AI 按鈕 */}
        <button
          onClick={handleInterpret}
          disabled={isLoading}
          className="fixed bottom-8 right-8 z-40 group"
        >
          <div className="relative">
            {/* 光暈效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
            {/* 按鈕本體 - 流動漸層 */}
            <div className="relative flex items-center gap-3 px-6 py-4 animate-gradient-gold rounded-full font-bold text-white border-2 border-amber-300/50 shadow-2xl shadow-amber-900/50 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300 disabled:opacity-50">
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
                  <span>解讀命運密碼</span>
                </>
              )}
            </div>
          </div>
        </button>

        {/* 說明 */}
        <div className="bg-slate-900/50 rounded-xl border border-gray-700/50 p-6 mb-6">
          <h3 className="text-lg font-bold text-amber-200 mb-3">📖 八字說明</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="text-amber-300 mb-2">四柱</h4>
              <p>年柱、月柱、日柱、時柱，共八個字。日柱天干為「日主」，代表命主本人。</p>
            </div>
            <div>
              <h4 className="text-purple-300 mb-2">十神</h4>
              <p>比肩、劫財、食神、傷官、正財、偏財、正官、七殺、正印、偏印。描述其他干支與日主的關係。</p>
            </div>
            <div>
              <h4 className="text-emerald-300 mb-2">藏干</h4>
              <p>地支中暗藏的天干，反映更深層的五行能量。</p>
            </div>
            <div>
              <h4 className="text-blue-300 mb-2">大運</h4>
              <p>每十年一個運程，影響人生不同階段的運勢起伏。</p>
            </div>
          </div>
        </div>

        {/* 返回首頁按鈕 */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition shadow-lg"
          >
            返回首頁
          </Link>
        </div>
      </div>

      {/* AI 解讀彈窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1a1a3a] to-[#0d0d2b] rounded-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* 標題 */}
            <div className="p-4 border-b border-amber-500/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-amber-300">🔮 AI 八字解讀</h2>
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
                  <p className="text-amber-300">AI 正在分析您的八字命盤...</p>
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
              <div className="p-4 border-t border-amber-500/20 text-center">
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

export default function BaziResultPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white flex items-center justify-center">
        <div className="text-amber-400 animate-pulse">載入中...</div>
      </main>
    }>
      <BaziResultContent />
    </Suspense>
  );
}
