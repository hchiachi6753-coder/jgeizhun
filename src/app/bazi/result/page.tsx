'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { calculateBazi, type BaziResult, DI_ZHI } from '@/lib/bazi';

function BaziResultContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      {/* 返回按鈕 */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link 
          href="/bazi" 
          className="inline-flex items-center text-amber-400/80 hover:text-amber-400 transition"
        >
          ← 重新排盤
        </Link>
      </div>

      {/* 標題 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">八字命盤</h1>
        <p className="text-purple-300/80">
          {gender === 'male' ? '乾造' : '坤造'} · {lunarInfo.yearGanZhi}年
        </p>
      </div>

      {/* 四柱顯示 */}
      <div className="max-w-2xl mx-auto">
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
