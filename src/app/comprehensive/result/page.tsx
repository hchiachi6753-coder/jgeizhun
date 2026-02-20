'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { calculateZiweiChart, type ZiweiChart as ZiweiChartType } from '@/lib/ziwei/index';
import { calculateBazi, type BaziResult, DI_ZHI } from '@/lib/bazi';
import ZiweiChart from '@/components/ZiweiChart';
import LoadingAnimation from '@/components/LoadingAnimation';
import FollowUpQuestions from '@/components/FollowUpQuestions';
import WuxingLotus from '@/components/WuxingLotus';
import FortuneTimeline from '@/components/FortuneTimeline';

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

interface FollowUpItem {
  question: string;
  answer: string;
}

function ComprehensiveResultContent() {
  const searchParams = useSearchParams();
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpItem[]>([]);
  const interpretationRef = useRef<HTMLDivElement>(null);
  
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
    setInterpretation(null);
    
    // 自動滾動到解讀區域
    setTimeout(() => {
      interpretationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

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

  // 計算五行能量分布
  const wuxingCount = useMemo(() => {
    if (!baziResult) return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    const count = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    
    // 天干五行
    [yearPillar.ganWuXing, monthPillar.ganWuXing, dayPillar.ganWuXing, hourPillar.ganWuXing].forEach(wx => {
      if (wx && count[wx as keyof typeof count] !== undefined) count[wx as keyof typeof count]++;
    });
    
    // 地支五行
    [yearPillar.zhiWuXing, monthPillar.zhiWuXing, dayPillar.zhiWuXing, hourPillar.zhiWuXing].forEach(wx => {
      if (wx && count[wx as keyof typeof count] !== undefined) count[wx as keyof typeof count]++;
    });
    
    return {
      wood: count['木'],
      fire: count['火'],
      earth: count['土'],
      metal: count['金'],
      water: count['水'],
    };
  }, [baziResult, yearPillar, monthPillar, dayPillar, hourPillar]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white print:bg-white print:text-black">
      {/* 背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px]" />
      </div>

      {/* 頂部裝飾線（雙色漸層） */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-purple-500/50 z-20 print:hidden" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* 列印時間戳記 */}
        <div className="hidden print-timestamp">
          報告產生時間：{new Date().toLocaleString('zh-TW', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
          }).replace(/\//g, '-')}
        </div>

        {/* 導航 */}
        <nav className="mb-6 flex items-center justify-between print:hidden">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-3 print:text-black">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-purple-400 bg-clip-text text-transparent text-glow-gold print:text-black print:bg-none">
              ☯️ 綜合排盤
            </span>
          </h1>
          <p className="text-gray-300 text-base print:text-gray-600">
            {year}年{month}月{day}日 {shichen}時 · {gender === 'male' ? '乾造（男）' : '坤造（女）'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            八字定客觀氣勢 · 紫微定內在心理
          </p>
        </header>

        {/* ===== 八字四柱區塊 ===== */}
        <section className="mb-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-amber-950/30 border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.1)] print:bg-amber-50 print:border-amber-300">
          {/* 區塊標題 */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-500/30 print:border-amber-300">
            <span className="text-3xl">🎴</span>
            <div>
              <h2 className="text-2xl font-bold text-amber-300 text-glow-gold print:text-amber-700">八字四柱</h2>
              <p className="text-amber-400/60 text-sm print:text-amber-600">客觀氣勢 · 格局五行 · 大運流年</p>
            </div>
          </div>

          {/* 四柱顯示 */}
          <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
            {/* 年柱 */}
            <div className="bg-gradient-to-b from-amber-900/50 to-amber-950/50 border border-amber-500/40 rounded-xl p-3 md:p-4 text-center shadow-lg print:bg-amber-100 print:border-amber-300">
              <div className="text-amber-400/70 text-xs md:text-sm mb-2 font-medium print:text-amber-700">年柱</div>
              <div className="text-amber-300 text-xs mb-1 opacity-80 print:text-amber-600">{yearShiShen}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] print:text-amber-600">{yearPillar.gan}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-200/90 print:text-amber-800">{yearPillar.zhi}</div>
              <div className="text-amber-400/50 text-xs mt-2 print:text-amber-600">{yearPillar.ganWuXing}{yearPillar.zhiWuXing}</div>
            </div>

            {/* 月柱 */}
            <div className="bg-gradient-to-b from-amber-900/50 to-amber-950/50 border border-amber-500/40 rounded-xl p-3 md:p-4 text-center shadow-lg print:bg-amber-100 print:border-amber-300">
              <div className="text-amber-400/70 text-xs md:text-sm mb-2 font-medium print:text-amber-700">月柱</div>
              <div className="text-amber-300 text-xs mb-1 opacity-80 print:text-amber-600">{monthShiShen}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] print:text-amber-600">{monthPillar.gan}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-200/90 print:text-amber-800">{monthPillar.zhi}</div>
              <div className="text-amber-400/50 text-xs mt-2 print:text-amber-600">{monthPillar.ganWuXing}{monthPillar.zhiWuXing}</div>
            </div>

            {/* 日柱（日主）- 特別突出 */}
            <div className="bg-gradient-to-b from-amber-800/60 to-amber-900/60 border-2 border-amber-400 rounded-xl p-3 md:p-4 text-center shadow-[0_0_20px_rgba(251,191,36,0.2)] relative print:bg-amber-200 print:border-amber-500">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded">日主</div>
              <div className="text-amber-300 text-xs md:text-sm mb-2 font-medium mt-1 print:text-amber-700">日柱</div>
              <div className="text-amber-200 text-xs mb-1 print:text-amber-600">日元</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] print:text-amber-700">{dayPillar.gan}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-100 print:text-amber-800">{dayPillar.zhi}</div>
              <div className="text-amber-300/60 text-xs mt-2 print:text-amber-600">{dayPillar.ganWuXing}{dayPillar.zhiWuXing}</div>
            </div>

            {/* 時柱 */}
            <div className="bg-gradient-to-b from-amber-900/50 to-amber-950/50 border border-amber-500/40 rounded-xl p-3 md:p-4 text-center shadow-lg print:bg-amber-100 print:border-amber-300">
              <div className="text-amber-400/70 text-xs md:text-sm mb-2 font-medium print:text-amber-700">時柱</div>
              <div className="text-amber-300 text-xs mb-1 opacity-80 print:text-amber-600">{hourShiShen}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] print:text-amber-600">{hourPillar.gan}</div>
              <div className="text-3xl md:text-4xl font-bold text-amber-200/90 print:text-amber-800">{hourPillar.zhi}</div>
              <div className="text-amber-400/50 text-xs mt-2 print:text-amber-600">{hourPillar.ganWuXing}{hourPillar.zhiWuXing}</div>
            </div>
          </div>

          {/* 藏干 + 大運 */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* 藏干顯示 */}
            <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-4 print:bg-amber-100 print:border-amber-300">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2 print:text-amber-700">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full print:bg-amber-600"></span>
                地支藏干
              </h3>
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-amber-500/50 text-xs mb-1 print:text-amber-600">年支</div>
                  {baziResult.yearCangGan.map((cg, i) => (
                    <div key={i} className="text-amber-200 print:text-amber-800">
                      {cg.gan} <span className="text-amber-400/60 text-xs print:text-amber-600">({cg.shiShen})</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-amber-500/50 text-xs mb-1 print:text-amber-600">月支</div>
                  {baziResult.monthCangGan.map((cg, i) => (
                    <div key={i} className="text-amber-200 print:text-amber-800">
                      {cg.gan} <span className="text-amber-400/60 text-xs print:text-amber-600">({cg.shiShen})</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-amber-500/50 text-xs mb-1 print:text-amber-600">日支</div>
                  {baziResult.dayCangGan.map((cg, i) => (
                    <div key={i} className="text-amber-200 print:text-amber-800">
                      {cg.gan} <span className="text-amber-400/60 text-xs print:text-amber-600">({cg.shiShen})</span>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className="text-amber-500/50 text-xs mb-1 print:text-amber-600">時支</div>
                  {baziResult.hourCangGan.map((cg, i) => (
                    <div key={i} className="text-amber-200 print:text-amber-800">
                      {cg.gan} <span className="text-amber-400/60 text-xs print:text-amber-600">({cg.shiShen})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 大運 */}
            <div className="bg-amber-950/40 border border-amber-500/20 rounded-xl p-4 print:bg-amber-100 print:border-amber-300">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2 print:text-amber-700">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full print:bg-amber-600"></span>
                大運流程
              </h3>
              <div className="flex flex-wrap gap-2">
                {baziResult.daYun.slice(0, 8).map((dy, i) => (
                  <div key={i} className="bg-amber-900/50 border border-amber-600/30 px-3 py-2 rounded-lg text-center min-w-[55px] hover:border-amber-500/60 transition-colors print:bg-amber-200 print:border-amber-400">
                    <div className="text-amber-400/60 text-xs print:text-amber-700">{dy.startAge}歲</div>
                    <div className="text-amber-200 font-bold text-sm print:text-amber-800">{dy.ganZhi}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 五行能量分布 蓮花圖 */}
          <div className="mt-6 bg-gradient-to-br from-purple-950/30 to-indigo-950/30 border border-purple-500/20 rounded-xl print:bg-purple-50 print:border-purple-300">
            <WuxingLotus {...wuxingCount} />
          </div>
        </section>

        {/* ===== 紫微命盤區塊 ===== */}
        <section className="mb-10 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-900/20 to-purple-950/30 border-2 border-purple-500/40 shadow-[0_0_40px_rgba(147,51,234,0.1)] print:bg-purple-50 print:border-purple-300">
          {/* 區塊標題 */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-500/30 print:border-purple-300">
            <span className="text-3xl">⭐</span>
            <div>
              <h2 className="text-2xl font-bold text-purple-300 text-glow-purple print:text-purple-700">紫微命盤</h2>
              <p className="text-purple-400/60 text-sm print:text-purple-600">內在心理 · 星曜宮位 · 大限流年</p>
            </div>
          </div>

          {/* 紫微命盤 */}
          <ZiweiChart chart={ziweiChart} showDetails={true} />
          
          {/* 流年運勢曲線圖 */}
          <div className="mt-6">
            <FortuneTimeline chart={ziweiChart} />
          </div>
        </section>

        {/* 浮動 AI 按鈕 - 只在沒有解讀時顯示 */}
        {!interpretation && !isLoading && (
          <button
            onClick={handleInterpret}
            disabled={isLoading}
            className="fixed bottom-8 right-8 z-40 group print:hidden"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3 px-6 py-4 animate-gradient-dual rounded-full font-bold text-white border-2 border-amber-300/50 shadow-2xl shadow-purple-900/50 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300 disabled:opacity-50">
                <span className="text-2xl">☯️</span>
                <span>全盤深度解命</span>
              </div>
            </div>
          </button>
        )}

        {/* 說明 */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-2xl border border-gray-700/50 shadow-lg print:bg-gray-100 print:border-gray-300">
          <h3 className="text-xl font-bold text-amber-200 mb-6 flex items-center gap-2 print:text-amber-700">
            📖 雙系統說明
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 八字說明 */}
            <div className="p-5 bg-amber-950/30 rounded-xl border border-amber-500/20 print:bg-amber-50 print:border-amber-300">
              <h4 className="text-amber-300 mb-4 font-bold text-lg flex items-center gap-2 print:text-amber-700">
                🎴 八字（客觀系統）
              </h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 print:text-amber-600">→</span>
                  <span><span className="text-amber-200 font-medium print:text-amber-700">格局</span>：分析命主的事業格局與人生走向</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 print:text-amber-600">→</span>
                  <span><span className="text-amber-200 font-medium print:text-amber-700">五行</span>：判斷喜用神與忌神</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 print:text-amber-600">→</span>
                  <span><span className="text-amber-200 font-medium print:text-amber-700">大運</span>：預測不同人生階段的吉凶起伏</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5 print:text-amber-600">→</span>
                  <span><span className="text-amber-200 font-medium print:text-amber-700">調候</span>：診斷命局環境與用神藥方</span>
                </li>
              </ul>
            </div>

            {/* 紫微說明 */}
            <div className="p-5 bg-purple-950/30 rounded-xl border border-purple-500/20 print:bg-purple-50 print:border-purple-300">
              <h4 className="text-purple-300 mb-4 font-bold text-lg flex items-center gap-2 print:text-purple-700">
                ⭐ 紫微（主觀系統）
              </h4>
              <ul className="space-y-2 text-sm text-gray-300 print:text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5 print:text-purple-600">→</span>
                  <span><span className="text-purple-200 font-medium print:text-purple-700">星曜</span>：揭示內在性格與心理特質</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5 print:text-purple-600">→</span>
                  <span><span className="text-purple-200 font-medium print:text-purple-700">宮位</span>：分析人生各面向的課題</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5 print:text-purple-600">→</span>
                  <span><span className="text-purple-200 font-medium print:text-purple-700">四化</span>：預測機會與挑戰的來源</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5 print:text-purple-600">→</span>
                  <span><span className="text-purple-200 font-medium print:text-purple-700">大限</span>：追蹤心理狀態的階段變化</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-950/30 to-purple-950/30 rounded-xl border border-amber-500/10 print:bg-gray-200 print:border-gray-300">
            <p className="text-gray-400 text-sm flex items-start gap-2 print:text-gray-600">
              <span className="text-amber-400 text-lg print:text-amber-600">💡</span>
              <span><span className="text-amber-200 font-medium print:text-amber-700">雙系統合參</span>：八字看「客觀會發生什麼」，紫微看「主觀會怎麼感受」。事件與心理交叉印證，分析更精準。</span>
            </p>
          </div>
        </div>

        {/* AI 解讀區域 - 內嵌顯示 */}
        {(isLoading || interpretation) && (
          <div 
            ref={interpretationRef}
            className="mt-8 p-6 md:p-8 bg-gradient-to-b from-[#1a1a3a] via-[#151530] to-[#0d0d2b] rounded-3xl border-2 border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.15)] print:bg-white print:border-gray-300"
          >
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 print:text-amber-700">
              <span className="text-3xl">☯️</span>
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-purple-300 bg-clip-text text-transparent print:text-amber-700 print:bg-none">
                AI 八字+紫微 綜合解讀
              </span>
            </h2>

            {isLoading ? (
              <LoadingAnimation type="comprehensive" />
            ) : interpretation ? (
              <>
                <div className="interpretation-content">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
                
                {/* 追問區 */}
                <FollowUpQuestions
                  chartType="comprehensive"
                  chartData={{ chart: ziweiChart, baziResult }}
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
                  ⚠️ AI 解讀僅供參考，命盤是統計不是限制。八字定客觀、紫微定主觀，雙系統互補印證。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
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
