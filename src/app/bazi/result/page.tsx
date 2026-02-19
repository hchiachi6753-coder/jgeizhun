'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { calculateBazi, type BaziResult, DI_ZHI } from '@/lib/bazi';
import LoadingAnimation from '@/components/LoadingAnimation';
import FollowUpQuestions from '@/components/FollowUpQuestions';

interface FollowUpItem {
  question: string;
  answer: string;
}

function BaziResultContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpItem[]>([]);
  const interpretationRef = useRef<HTMLDivElement>(null);

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

  // 當解讀完成後滾動到解讀區域
  useEffect(() => {
    if (interpretation && interpretationRef.current) {
      interpretationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [interpretation]);

  // 處理新追問
  const handleNewFollowUp = (item: FollowUpItem) => {
    setFollowUpHistory(prev => [...prev, item]);
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
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white p-4 print:bg-white print:text-black">
      {/* 背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20 print:hidden" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* 返回按鈕 */}
        <div className="mb-6 flex items-center justify-between print:hidden">
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
          <h1 className="text-3xl font-bold mb-2 print:text-black">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent print:text-black print:bg-none">
              八字命盤
            </span>
          </h1>
          <p className="text-purple-300/80 print:text-gray-600">
            {gender === 'male' ? '乾造' : '坤造'} · {lunarInfo.yearGanZhi}年
          </p>
        </div>

        {/* 四柱顯示 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* 年柱 */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center print:bg-purple-50 print:border-purple-300">
            <div className="text-purple-300/60 text-sm mb-2 print:text-purple-600">年柱</div>
            <div className="text-amber-400/80 text-xs mb-1 print:text-amber-600">{yearShiShen}</div>
            <div className="text-3xl font-bold text-amber-400 print:text-amber-600">{yearPillar.gan}</div>
            <div className="text-3xl font-bold text-purple-300 print:text-purple-600">{yearPillar.zhi}</div>
            <div className="text-purple-400/60 text-xs mt-2 print:text-purple-500">{yearPillar.ganWuXing}{yearPillar.zhiWuXing}</div>
          </div>

          {/* 月柱 */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center print:bg-purple-50 print:border-purple-300">
            <div className="text-purple-300/60 text-sm mb-2 print:text-purple-600">月柱</div>
            <div className="text-amber-400/80 text-xs mb-1 print:text-amber-600">{monthShiShen}</div>
            <div className="text-3xl font-bold text-amber-400 print:text-amber-600">{monthPillar.gan}</div>
            <div className="text-3xl font-bold text-purple-300 print:text-purple-600">{monthPillar.zhi}</div>
            <div className="text-purple-400/60 text-xs mt-2 print:text-purple-500">{monthPillar.ganWuXing}{monthPillar.zhiWuXing}</div>
          </div>

          {/* 日柱 */}
          <div className="bg-amber-900/30 border border-amber-500/50 rounded-xl p-4 text-center print:bg-amber-50 print:border-amber-400">
            <div className="text-amber-300/60 text-sm mb-2 print:text-amber-700">日柱（日主）</div>
            <div className="text-amber-400/80 text-xs mb-1 print:text-amber-600">日元</div>
            <div className="text-3xl font-bold text-amber-400 print:text-amber-600">{dayPillar.gan}</div>
            <div className="text-3xl font-bold text-purple-300 print:text-purple-600">{dayPillar.zhi}</div>
            <div className="text-purple-400/60 text-xs mt-2 print:text-purple-500">{dayPillar.ganWuXing}{dayPillar.zhiWuXing}</div>
          </div>

          {/* 時柱 */}
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center print:bg-purple-50 print:border-purple-300">
            <div className="text-purple-300/60 text-sm mb-2 print:text-purple-600">時柱</div>
            <div className="text-amber-400/80 text-xs mb-1 print:text-amber-600">{hourShiShen}</div>
            <div className="text-3xl font-bold text-amber-400 print:text-amber-600">{hourPillar.gan}</div>
            <div className="text-3xl font-bold text-purple-300 print:text-purple-600">{hourPillar.zhi}</div>
            <div className="text-purple-400/60 text-xs mt-2 print:text-purple-500">{hourPillar.ganWuXing}{hourPillar.zhiWuXing}</div>
          </div>
        </div>

        {/* 藏干顯示 */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 mb-6 print:bg-purple-50 print:border-purple-300">
          <h2 className="text-lg font-semibold text-amber-400 mb-4 print:text-amber-700">地支藏干</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              {result.yearCangGan.map((cg, i) => (
                <div key={i} className="text-purple-300 print:text-purple-600">
                  {cg.gan} <span className="text-amber-400/70 text-xs print:text-amber-600">({cg.shiShen})</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              {result.monthCangGan.map((cg, i) => (
                <div key={i} className="text-purple-300 print:text-purple-600">
                  {cg.gan} <span className="text-amber-400/70 text-xs print:text-amber-600">({cg.shiShen})</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              {result.dayCangGan.map((cg, i) => (
                <div key={i} className="text-purple-300 print:text-purple-600">
                  {cg.gan} <span className="text-amber-400/70 text-xs print:text-amber-600">({cg.shiShen})</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              {result.hourCangGan.map((cg, i) => (
                <div key={i} className="text-purple-300 print:text-purple-600">
                  {cg.gan} <span className="text-amber-400/70 text-xs print:text-amber-600">({cg.shiShen})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 大運 */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 mb-6 print:bg-purple-50 print:border-purple-300">
          <h2 className="text-lg font-semibold text-amber-400 mb-4 print:text-amber-700">大運流程</h2>
          <div className="flex flex-wrap gap-3">
            {result.daYun.slice(0, 8).map((dy, i) => (
              <div key={i} className="bg-purple-800/30 px-3 py-2 rounded-lg text-center min-w-[60px] print:bg-purple-100">
                <div className="text-amber-400/60 text-xs print:text-amber-600">{dy.startAge}歲</div>
                <div className="text-white font-bold print:text-purple-800">{dy.ganZhi}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 基本資訊 */}
        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-6 mb-6 print:bg-purple-50 print:border-purple-300">
          <h2 className="text-lg font-semibold text-amber-400 mb-4 print:text-amber-700">基本資訊</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-300/60 print:text-purple-600">農曆：</span>
              <span className="text-white print:text-black">{lunarInfo.yearGanZhi}年 {lunarInfo.month}月 {lunarInfo.day}日</span>
            </div>
            <div>
              <span className="text-purple-300/60 print:text-purple-600">節氣：</span>
              <span className="text-white print:text-black">{result.jieQi || '—'}</span>
            </div>
            <div>
              <span className="text-purple-300/60 print:text-purple-600">日主：</span>
              <span className="text-amber-400 print:text-amber-600">{dayPillar.gan}{dayPillar.ganWuXing}</span>
            </div>
          </div>
        </div>

        {/* 浮動 AI 按鈕 - 只在沒有解讀時顯示 */}
        {!interpretation && !isLoading && (
          <button
            onClick={handleInterpret}
            disabled={isLoading}
            className="fixed bottom-8 right-8 z-40 group print:hidden"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3 px-6 py-4 animate-gradient-gold rounded-full font-bold text-white border-2 border-amber-300/50 shadow-2xl shadow-amber-900/50 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300 disabled:opacity-50">
                <span className="text-2xl">🔮</span>
                <span>解讀命運密碼</span>
              </div>
            </div>
          </button>
        )}

        {/* 說明 */}
        <div className="bg-slate-900/50 rounded-xl border border-gray-700/50 p-6 mb-6 print:bg-gray-100 print:border-gray-300">
          <h3 className="text-lg font-bold text-amber-200 mb-3 print:text-amber-700">📖 八字說明</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400 print:text-gray-600">
            <div>
              <h4 className="text-amber-300 mb-2 print:text-amber-600">四柱</h4>
              <p>年柱、月柱、日柱、時柱，共八個字。日柱天干為「日主」，代表命主本人。</p>
            </div>
            <div>
              <h4 className="text-purple-300 mb-2 print:text-purple-600">十神</h4>
              <p>比肩、劫財、食神、傷官、正財、偏財、正官、七殺、正印、偏印。描述其他干支與日主的關係。</p>
            </div>
            <div>
              <h4 className="text-emerald-300 mb-2 print:text-emerald-600">藏干</h4>
              <p>地支中暗藏的天干，反映更深層的五行能量。</p>
            </div>
            <div>
              <h4 className="text-blue-300 mb-2 print:text-blue-600">大運</h4>
              <p>每十年一個運程，影響人生不同階段的運勢起伏。</p>
            </div>
          </div>
        </div>

        {/* AI 解讀區域 - 內嵌顯示 */}
        {(isLoading || interpretation) && (
          <div 
            ref={interpretationRef}
            className="mt-8 p-6 md:p-8 bg-gradient-to-b from-amber-900/30 to-orange-900/20 rounded-2xl border border-amber-500/30 print:bg-white print:border-gray-300"
          >
            <h2 className="text-2xl font-bold text-amber-300 mb-6 flex items-center gap-3 print:text-amber-700">
              <span>🔮</span>
              <span>AI 八字解讀</span>
            </h2>

            {isLoading ? (
              <LoadingAnimation type="bazi" />
            ) : interpretation ? (
              <>
                <div className="interpretation-content">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
                
                {/* 追問區 */}
                <FollowUpQuestions
                  chartType="bazi"
                  chartData={{ baziResult: result }}
                  originalInterpretation={interpretation}
                  followUpHistory={followUpHistory}
                  onNewFollowUp={handleNewFollowUp}
                />
              </>
            ) : null}

            {/* 底部提示 */}
            {!isLoading && interpretation && (
              <div className="mt-8 pt-4 border-t border-amber-500/20 text-center print:border-gray-300">
                <p className="text-gray-500 text-xs print:text-gray-600">
                  ⚠️ AI 解讀僅供參考，命盤是統計不是限制
                </p>
              </div>
            )}
          </div>
        )}
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
