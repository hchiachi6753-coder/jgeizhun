'use client';

import { useState, useMemo } from 'react';
import type { TimelineData, TimelineDecade, TimelineYear, YearFortune } from '@/lib/bazi/timeline';

// ============ 類型定義 ============

interface JourneyMapProps {
  /** 時間軸資料（來自 generateTimeline） */
  timeline: TimelineData;
  /** 當前年齡（虛歲），用於標記「你在這裡」 */
  currentAge?: number;
  /** 出生年（西曆） */
  birthYear?: number;
  /** 點擊年份時的回調 */
  onYearClick?: (year: TimelineYear) => void;
  /** 是否顯示流年細節（預設只顯示大運） */
  showYearDetail?: boolean;
}

// 人生階段定義
interface LifeStageInfo {
  type: string;
  name: string;
  emoji: string;
  startAge: number;
  endAge: number;
  color: string;
  bgGradient: string;
}

const LIFE_STAGES: LifeStageInfo[] = [
  { type: 'growth', name: '成長期', emoji: '🌱', startAge: 0, endAge: 15, color: '#86efac', bgGradient: 'from-emerald-500/30 to-green-400/20' },
  { type: 'learning', name: '學習期', emoji: '📚', startAge: 16, endAge: 30, color: '#93c5fd', bgGradient: 'from-blue-500/30 to-sky-400/20' },
  { type: 'striving', name: '拼搏期', emoji: '🔥', startAge: 31, endAge: 45, color: '#fbbf24', bgGradient: 'from-orange-500/30 to-amber-400/20' },
  { type: 'harvesting', name: '收穫期', emoji: '💰', startAge: 46, endAge: 60, color: '#f9a825', bgGradient: 'from-yellow-500/30 to-amber-300/20' },
  { type: 'wisdom', name: '智慧期', emoji: '🧘', startAge: 61, endAge: 75, color: '#c4b5fd', bgGradient: 'from-purple-500/30 to-violet-400/20' },
  { type: 'retirement', name: '頤養期', emoji: '🌅', startAge: 76, endAge: 120, color: '#fda4af', bgGradient: 'from-rose-500/30 to-pink-400/20' },
];

// 運勢顏色定義
const FORTUNE_COLORS: Record<YearFortune['overall'], { bg: string; border: string; glow: string; text: string }> = {
  excellent: { bg: 'bg-emerald-500/60', border: 'border-emerald-400', glow: 'shadow-emerald-400/40', text: '大吉' },
  good: { bg: 'bg-green-500/50', border: 'border-green-400', glow: 'shadow-green-400/30', text: '吉' },
  neutral: { bg: 'bg-amber-500/50', border: 'border-amber-400', glow: 'shadow-amber-400/30', text: '平' },
  caution: { bg: 'bg-orange-500/50', border: 'border-orange-400', glow: 'shadow-orange-400/30', text: '注意' },
  challenging: { bg: 'bg-rose-500/50', border: 'border-rose-400', glow: 'shadow-rose-400/30', text: '挑戰' },
};

// ============ 輔助函數 ============

/** 獲取當前階段 */
function getCurrentStage(age: number): LifeStageInfo | undefined {
  return LIFE_STAGES.find(s => age >= s.startAge && age <= s.endAge);
}

/** 獲取大運對應的階段 */
function getStageForDecade(startAge: number, endAge: number): LifeStageInfo | undefined {
  const midAge = (startAge + endAge) / 2;
  return LIFE_STAGES.find(s => midAge >= s.startAge && midAge <= s.endAge);
}

/** 計算大運整體運勢（根據其中各年運勢加權） */
function calculateDecadeFortune(years: TimelineYear[]): YearFortune['overall'] {
  if (years.length === 0) return 'neutral';
  
  const scores = years.map(y => {
    switch (y.fortune.overall) {
      case 'excellent': return 5;
      case 'good': return 4;
      case 'neutral': return 3;
      case 'caution': return 2;
      case 'challenging': return 1;
    }
  });
  
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  if (avg >= 4.5) return 'excellent';
  if (avg >= 3.5) return 'good';
  if (avg >= 2.5) return 'neutral';
  if (avg >= 1.5) return 'caution';
  return 'challenging';
}

// ============ 子組件 ============

/** 人生階段標籤 */
function StageLabel({ stage, isActive }: { stage: LifeStageInfo; isActive: boolean }) {
  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-70'}`}>
      <span className="text-2xl mb-1">{stage.emoji}</span>
      <span className={`text-xs font-medium ${isActive ? 'text-amber-300' : 'text-gray-400'}`}>
        {stage.name}
      </span>
      <span className="text-[10px] text-gray-500">
        {stage.startAge}-{stage.endAge === 120 ? '∞' : stage.endAge}歲
      </span>
    </div>
  );
}

/** 大運區塊 */
function DecadeBlock({
  decade,
  isCurrentDecade,
  currentAge,
  isExpanded,
  onToggle,
  onYearClick,
}: {
  decade: TimelineDecade;
  isCurrentDecade: boolean;
  currentAge?: number;
  isExpanded: boolean;
  onToggle: () => void;
  onYearClick?: (year: TimelineYear) => void;
}) {
  const decadeFortune = calculateDecadeFortune(decade.years);
  const fortuneStyle = FORTUNE_COLORS[decadeFortune];
  const stage = getStageForDecade(decade.startAge, decade.endAge);

  return (
    <div className="flex flex-col items-center min-w-[80px] md:min-w-[100px]">
      {/* 大運標題 */}
      <button
        onClick={onToggle}
        className={`
          relative px-3 py-2 rounded-xl transition-all duration-300 cursor-pointer
          ${fortuneStyle.bg} ${fortuneStyle.border} border-2
          ${isCurrentDecade ? `ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0a0a1a] shadow-lg ${fortuneStyle.glow}` : ''}
          hover:scale-105 hover:shadow-xl
        `}
      >
        {/* 當前位置標記 */}
        {isCurrentDecade && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-lg animate-bounce">
            📍
          </div>
        )}
        
        {/* 大運干支 */}
        <div className="text-center">
          <div className="text-lg font-bold text-white drop-shadow-lg">
            {decade.daYun.ganZhi}
          </div>
          <div className="text-[10px] text-gray-300">
            {decade.startAge}-{decade.endAge}歲
          </div>
        </div>

        {/* 運勢標籤 */}
        <div className={`mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${fortuneStyle.bg} text-white`}>
          {fortuneStyle.text}
        </div>

        {/* 展開指示器 */}
        <div className={`mt-1 text-gray-400 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* 展開的年份詳情 */}
      {isExpanded && (
        <div className="mt-3 p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 w-[220px] md:w-[280px] absolute z-20 shadow-2xl">
          <div className="text-sm font-medium text-amber-300 mb-2 flex items-center gap-2">
            <span>{stage?.emoji}</span>
            <span>{decade.daYun.ganZhi}大運詳情</span>
          </div>
          
          <div className="text-xs text-gray-400 mb-3">
            {decade.summary}
          </div>
          
          {/* 十神資訊 */}
          <div className="flex gap-2 mb-3 text-xs">
            <span className="px-2 py-1 rounded bg-purple-500/30 text-purple-200">
              天干: {decade.daYun.ganShiShen}
            </span>
            <span className="px-2 py-1 rounded bg-indigo-500/30 text-indigo-200">
              地支: {decade.daYun.zhiShiShen}
            </span>
          </div>

          {/* 年份列表 */}
          <div className="grid grid-cols-5 gap-1.5 max-h-[200px] overflow-y-auto">
            {decade.years.map((year) => {
              const yearFortune = FORTUNE_COLORS[year.fortune.overall];
              const isCurrentYear = currentAge === year.age;
              
              return (
                <button
                  key={year.year}
                  onClick={() => onYearClick?.(year)}
                  className={`
                    relative p-1.5 rounded-lg text-center transition-all
                    ${yearFortune.bg} hover:scale-110 hover:z-10
                    ${isCurrentYear ? 'ring-2 ring-amber-400' : ''}
                  `}
                  title={`${year.year}年（${year.age}歲）- ${year.fortune.advice}`}
                >
                  {isCurrentYear && (
                    <span className="absolute -top-2 -right-1 text-xs">📍</span>
                  )}
                  <div className="text-[10px] font-bold text-white">{year.age}</div>
                  <div className="text-[8px] text-gray-300">{year.year}</div>
                </button>
              );
            })}
          </div>

          {/* 年度事件標記 */}
          {decade.years.filter(y => y.events.length > 0).length > 0 && (
            <div className="mt-3 pt-2 border-t border-white/10">
              <div className="text-[10px] text-gray-400 mb-1">重要年份：</div>
              <div className="flex flex-wrap gap-1">
                {decade.years
                  .filter(y => y.events.length > 0)
                  .slice(0, 3)
                  .map(y => (
                    <span key={y.year} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
                      {y.age}歲 {y.events[0]}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 年份詳情面板 */
function YearDetailPanel({
  year,
  onClose,
}: {
  year: TimelineYear;
  onClose: () => void;
}) {
  const fortuneStyle = FORTUNE_COLORS[year.fortune.overall];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-md bg-gradient-to-br from-[#1a1a3a] to-[#0d0d2b] rounded-2xl border border-amber-400/30 shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* 關閉按鈕 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* 標題 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">
            {year.fortune.overall === 'excellent' ? '🌟' :
             year.fortune.overall === 'good' ? '☀️' :
             year.fortune.overall === 'neutral' ? '🌤️' :
             year.fortune.overall === 'caution' ? '⛅' : '🌧️'}
          </div>
          <h3 className="text-2xl font-bold text-amber-300">
            {year.year}年 · {year.age}歲
          </h3>
          <p className="text-sm text-gray-400">
            {year.liuNian.ganZhi}年 · {year.daYun?.ganZhi}大運
          </p>
        </div>

        {/* 運勢總評 */}
        <div className={`p-4 rounded-xl ${fortuneStyle.bg} border ${fortuneStyle.border} mb-4`}>
          <div className="text-lg font-bold text-white text-center mb-2">
            {fortuneStyle.text}
          </div>
          <p className="text-sm text-center text-gray-200">
            {year.fortune.advice}
          </p>
        </div>

        {/* 四維運勢 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: '💼 事業', value: year.fortune.aspects.career },
            { label: '💰 財運', value: year.fortune.aspects.wealth },
            { label: '❤️ 感情', value: year.fortune.aspects.relationship },
            { label: '🏥 健康', value: year.fortune.aspects.health },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">{label}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      value >= 70 ? 'bg-emerald-400' : 
                      value >= 50 ? 'bg-amber-400' : 
                      value >= 30 ? 'bg-orange-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-white w-8">{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 關鍵詞 */}
        {year.fortune.keywords.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">關鍵詞</div>
            <div className="flex flex-wrap gap-2">
              {year.fortune.keywords.map((kw, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-full bg-purple-500/30 text-purple-200">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 重要事件 */}
        {year.events.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/30">
            <div className="text-xs text-amber-400 mb-1">📌 標記</div>
            <div className="text-sm text-amber-200">
              {year.events.join('、')}
            </div>
          </div>
        )}

        {/* 大運交接提示 */}
        {year.isTransition && (
          <div className="mt-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/30">
            <div className="text-xs text-indigo-400">⚡ 大運交接年</div>
            <div className="text-sm text-indigo-200">
              此年進入新的十年大運，運勢可能有明顯轉變
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ 主組件 ============

export default function JourneyMap({
  timeline,
  currentAge,
  birthYear,
  onYearClick,
  showYearDetail = true,
}: JourneyMapProps) {
  const [expandedDecadeIndex, setExpandedDecadeIndex] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<TimelineYear | null>(null);

  // 計算當前年齡（如果未提供）
  const computedCurrentAge = useMemo(() => {
    if (currentAge !== undefined) return currentAge;
    if (birthYear) {
      return new Date().getFullYear() - birthYear + 1; // 虛歲
    }
    return undefined;
  }, [currentAge, birthYear]);

  // 找出當前所在的大運索引
  const currentDecadeIndex = useMemo(() => {
    if (computedCurrentAge === undefined) return -1;
    return timeline.decades.findIndex(d => 
      computedCurrentAge >= d.startAge && computedCurrentAge <= d.endAge
    );
  }, [timeline.decades, computedCurrentAge]);

  // 當前階段
  const currentStage = computedCurrentAge ? getCurrentStage(computedCurrentAge) : undefined;

  // 處理年份點擊
  const handleYearClick = (year: TimelineYear) => {
    if (showYearDetail) {
      setSelectedYear(year);
    }
    onYearClick?.(year);
  };

  return (
    <div className="w-full">
      {/* 標題區 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
            ✦ 人生旅程圖 ✦
          </span>
        </h2>
        <p className="text-gray-400 text-sm">
          日主 {timeline.dayMaster.gan}（{timeline.dayMaster.wuXing}） · 
          {computedCurrentAge ? ` 現年 ${computedCurrentAge} 歲` : ''} 
          {currentStage ? ` · ${currentStage.emoji} ${currentStage.name}` : ''}
        </p>
      </div>

      {/* 人生階段導航 */}
      <div className="flex justify-center gap-4 md:gap-8 mb-8 overflow-x-auto pb-2">
        {LIFE_STAGES.map((stage) => (
          <StageLabel
            key={stage.type}
            stage={stage}
            isActive={currentStage?.type === stage.type}
          />
        ))}
      </div>

      {/* 時間軸主體 */}
      <div className="relative">
        {/* 時間軸線 */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-amber-500/50 to-rose-500/50 rounded-full -translate-y-1/2" />
        
        {/* 階段背景色帶 */}
        <div className="absolute top-0 left-0 right-0 h-full flex pointer-events-none">
          {LIFE_STAGES.map((stage, i) => {
            const stageDecades = timeline.decades.filter(d => {
              const midAge = (d.startAge + d.endAge) / 2;
              return midAge >= stage.startAge && midAge <= stage.endAge;
            });
            const width = stageDecades.length > 0 
              ? `${(stageDecades.length / timeline.decades.length) * 100}%` 
              : '0%';
            
            return (
              <div 
                key={stage.type}
                className={`h-full bg-gradient-to-b ${stage.bgGradient} first:rounded-l-xl last:rounded-r-xl`}
                style={{ width }}
              />
            );
          })}
        </div>

        {/* 大運區塊容器 */}
        <div className="relative flex gap-2 md:gap-4 overflow-x-auto py-8 px-4 scroll-smooth">
          {timeline.decades.map((decade, index) => (
            <div key={index} className="relative">
              <DecadeBlock
                decade={decade}
                isCurrentDecade={index === currentDecadeIndex}
                currentAge={computedCurrentAge}
                isExpanded={expandedDecadeIndex === index}
                onToggle={() => setExpandedDecadeIndex(
                  expandedDecadeIndex === index ? null : index
                )}
                onYearClick={handleYearClick}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 圖例說明 */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">運勢：</span>
        </div>
        {Object.entries(FORTUNE_COLORS).map(([key, style]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${style.bg} ${style.border} border`} />
            <span className="text-gray-400 text-xs">{style.text}</span>
          </div>
        ))}
      </div>

      {/* 統計摘要 */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-lg font-bold text-amber-300">{timeline.statistics.totalYears}</div>
          <div className="text-xs text-gray-400">預測年數</div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <div className="text-2xl mb-1">🌟</div>
          <div className="text-lg font-bold text-emerald-300">{timeline.statistics.bestDecade.startAge}歲起</div>
          <div className="text-xs text-gray-400">最佳大運</div>
        </div>
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-lg font-bold text-rose-300">{timeline.statistics.challengingDecade.startAge}歲起</div>
          <div className="text-xs text-gray-400">挑戰大運</div>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-lg font-bold text-purple-300">
            {timeline.highlights.filter(h => h.type === 'peak').length}
          </div>
          <div className="text-xs text-gray-400">運勢高峰年</div>
        </div>
      </div>

      {/* 重要時間點 */}
      {timeline.highlights.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-center mb-4 text-purple-200">
            ✦ 關鍵時間點 ✦
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {timeline.highlights.slice(0, 6).map((hl, i) => (
              <div 
                key={i}
                className={`
                  px-4 py-2 rounded-lg text-sm
                  ${hl.type === 'peak' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' :
                    hl.type === 'valley' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30' :
                    'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'}
                `}
              >
                <span className="font-medium">{hl.age}歲</span>
                <span className="mx-1 opacity-50">·</span>
                <span>{hl.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 年份詳情彈窗 */}
      {selectedYear && (
        <YearDetailPanel
          year={selectedYear}
          onClose={() => setSelectedYear(null)}
        />
      )}

      {/* 樣式 */}
      <style jsx>{`
        /* 水平滾動條美化 */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #9d4edd, #ffd700);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
