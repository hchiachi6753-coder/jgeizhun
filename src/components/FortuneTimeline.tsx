'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ZiweiChart } from '@/lib/ziwei/index';
import { calculateYearlyFortune, type YearlyFortune, type MonthlyFortune, type FortuneType } from '@/lib/ziwei/fortune';

interface FortuneTimelineProps {
  chart: ZiweiChart;
  year?: number;
}

// 運勢類型對應的顏色
const TYPE_COLORS: Record<FortuneType, { bg: string; border: string; text: string; glow: string }> = {
  excellent: { 
    bg: 'bg-emerald-500/30', 
    border: 'border-emerald-400', 
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/50'
  },
  good: { 
    bg: 'bg-green-500/25', 
    border: 'border-green-400', 
    text: 'text-green-300',
    glow: 'shadow-green-500/40'
  },
  neutral: { 
    bg: 'bg-amber-500/20', 
    border: 'border-amber-400/60', 
    text: 'text-amber-200',
    glow: 'shadow-amber-500/30'
  },
  caution: { 
    bg: 'bg-orange-500/25', 
    border: 'border-orange-400', 
    text: 'text-orange-300',
    glow: 'shadow-orange-500/40'
  },
  challenge: { 
    bg: 'bg-red-500/30', 
    border: 'border-red-400', 
    text: 'text-red-300',
    glow: 'shadow-red-500/50'
  },
};

// 運勢等級對應的 Y 座標（SVG 座標系，上方數值小）
function levelToY(level: number): number {
  // level 1-10 映射到 140-20（讓高分在上方）
  return 140 - ((level - 1) / 9) * 120;
}

// 月份標籤
const MONTH_LABELS = ['一月', '二月', '三月', '四月', '五月', '六月', 
                      '七月', '八月', '九月', '十月', '十一月', '十二月'];

/**
 * 流動波浪線組件
 */
function WavePath({ 
  points, 
  colors,
  animate = true 
}: { 
  points: { x: number; y: number; type: FortuneType }[];
  colors: typeof TYPE_COLORS;
  animate?: boolean;
}) {
  if (points.length < 2) return null;

  // 生成平滑曲線路徑（使用貝茲曲線）
  const generateSmoothPath = () => {
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      // Catmull-Rom 轉貝茲曲線控制點
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    
    return path;
  };

  const pathD = generateSmoothPath();

  // 創建漸變 ID
  const gradientId = 'fortune-gradient';

  return (
    <>
      {/* 漸變定義 */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {points.map((p, i) => {
            const color = p.type === 'excellent' ? '#10b981' :
                         p.type === 'good' ? '#22c55e' :
                         p.type === 'neutral' ? '#f59e0b' :
                         p.type === 'caution' ? '#f97316' : '#ef4444';
            return (
              <stop 
                key={i} 
                offset={`${(i / (points.length - 1)) * 100}%`} 
                stopColor={color} 
              />
            );
          })}
        </linearGradient>
        
        {/* 光暈濾鏡 */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* 流動動畫的虛線 */}
        <pattern id="flowPattern" patternUnits="userSpaceOnUse" width="20" height="1">
          <line x1="0" y1="0" x2="10" y2="0" stroke="white" strokeWidth="2" opacity="0.5">
            {animate && (
              <animate 
                attributeName="x1" 
                from="-20" 
                to="0" 
                dur="1s" 
                repeatCount="indefinite" 
              />
            )}
          </line>
        </pattern>
      </defs>

      {/* 背景光暈線 */}
      <path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.2"
        filter="url(#glow)"
      />
      
      {/* 主線條 */}
      <path
        d={pathD}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        className={animate ? 'animate-pulse-slow' : ''}
      />
      
      {/* 流動光點效果 */}
      {animate && (
        <circle r="6" fill="white" opacity="0.8" filter="url(#glow)">
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath href="#flowPath" />
          </animateMotion>
        </circle>
      )}
      
      {/* 隱藏的路徑供動畫使用 */}
      <path id="flowPath" d={pathD} fill="none" stroke="none" />
    </>
  );
}

/**
 * 月份點組件
 */
function MonthDot({ 
  fortune, 
  x, 
  y, 
  index,
  isExpanded,
  onClick 
}: { 
  fortune: MonthlyFortune;
  x: number;
  y: number;
  index: number;
  isExpanded: boolean;
  onClick: () => void;
}) {
  const colors = TYPE_COLORS[fortune.type];
  
  return (
    <g 
      className="cursor-pointer transition-transform hover:scale-110"
      onClick={onClick}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* 光暈背景 */}
      <circle
        cx={x}
        cy={y}
        r={isExpanded ? 18 : 12}
        className={`${colors.bg} transition-all duration-300`}
        filter="url(#glow)"
      />
      
      {/* 主圓點 */}
      <circle
        cx={x}
        cy={y}
        r={isExpanded ? 14 : 10}
        fill="currentColor"
        className={`${colors.text} transition-all duration-300`}
        stroke="white"
        strokeWidth="2"
        opacity="0.9"
      />
      
      {/* 月份數字 */}
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-white font-bold text-xs select-none"
        style={{ fontSize: isExpanded ? '12px' : '10px' }}
      >
        {index + 1}
      </text>
      
      {/* 運勢指示器 */}
      {fortune.type === 'excellent' && (
        <text x={x} y={y - 20} textAnchor="middle" className="fill-emerald-300 text-sm">
          🟢
        </text>
      )}
      {fortune.type === 'challenge' && (
        <text x={x} y={y - 20} textAnchor="middle" className="fill-red-300 text-sm">
          🔴
        </text>
      )}
    </g>
  );
}

/**
 * 月份詳情卡片
 */
function MonthDetailCard({ 
  fortune, 
  onClose 
}: { 
  fortune: MonthlyFortune;
  onClose: () => void;
}) {
  const colors = TYPE_COLORS[fortune.type];
  
  const typeLabel = {
    excellent: '🌟 大吉',
    good: '✨ 順利',
    neutral: '🌙 平穩',
    caution: '⚠️ 謹慎',
    challenge: '🔥 挑戰',
  };

  return (
    <div 
      className={`
        relative rounded-xl p-4 
        ${colors.bg} border ${colors.border}
        backdrop-blur-md shadow-xl ${colors.glow}
        animate-slide-up
      `}
    >
      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
      >
        ✕
      </button>
      
      {/* 標題 */}
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl font-bold ${colors.text}`}>
          {fortune.monthName}
        </span>
        <span className="text-sm text-gray-300 px-2 py-1 bg-slate-800/50 rounded-full">
          {typeLabel[fortune.type]}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < fortune.level 
                  ? fortune.type === 'excellent' || fortune.type === 'good'
                    ? 'bg-green-400'
                    : fortune.type === 'neutral'
                    ? 'bg-amber-400'
                    : 'bg-red-400'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 宮位資訊 */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className="text-gray-400">
          流月命宮：<span className="text-purple-300">{fortune.gongName}</span>
        </span>
        <span className="text-gray-400">
          地支：<span className="text-amber-300">{fortune.gongZhi}</span>
        </span>
      </div>

      {/* 星曜 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {fortune.mainStars.map((star, i) => (
          <span key={i} className="px-2 py-0.5 bg-purple-500/30 rounded text-purple-200 text-xs">
            {star}
          </span>
        ))}
        {fortune.goodStars.map((star, i) => (
          <span key={i} className="px-2 py-0.5 bg-blue-500/30 rounded text-blue-200 text-xs">
            {star}
          </span>
        ))}
        {fortune.badStars.map((star, i) => (
          <span key={i} className="px-2 py-0.5 bg-red-500/30 rounded text-red-200 text-xs">
            {star}
          </span>
        ))}
      </div>

      {/* 關鍵字 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {fortune.keywords.map((kw, i) => (
          <span key={i} className="px-2 py-0.5 bg-slate-700/50 rounded text-gray-300 text-xs">
            #{kw}
          </span>
        ))}
      </div>

      {/* 簡評 */}
      <p className="text-gray-200 text-sm leading-relaxed">
        {fortune.summary}
      </p>

      {/* 詳細解析（可展開） */}
      <details className="mt-3">
        <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-200">
          查看詳細解析 ▼
        </summary>
        <div className="mt-2 p-3 bg-slate-900/50 rounded-lg text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {fortune.detail}
        </div>
      </details>
    </div>
  );
}

/**
 * 流年運勢概覽
 */
function YearOverview({ fortune }: { fortune: YearlyFortune }) {
  const colors = TYPE_COLORS[fortune.overallType];
  
  return (
    <div className={`
      rounded-xl p-4 mb-6
      bg-gradient-to-r from-slate-900/80 via-purple-900/30 to-slate-900/80
      border ${colors.border} border-opacity-50
      backdrop-blur-md
    `}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 年度標題 */}
        <div>
          <h3 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
              {fortune.year}年 {fortune.ganZhi}年
            </span>
            <span className="ml-2 text-gray-400 text-sm">
              虛歲 {fortune.age}
            </span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            流年命宮落 <span className="text-purple-300">{fortune.gongName}</span>
            {fortune.mainStars.length > 0 && (
              <span className="ml-2">
                主星：<span className="text-amber-300">{fortune.mainStars.join('、')}</span>
              </span>
            )}
          </p>
        </div>

        {/* 運勢指標 */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${colors.text}`}>
              {fortune.overallLevel}
            </div>
            <div className="text-xs text-gray-500">綜合運勢</div>
          </div>
          
          <div className="h-12 w-px bg-gray-700" />
          
          <div className="text-sm">
            <div className="flex items-center gap-2 text-green-300">
              <span>🟢</span>
              <span>最佳：{fortune.bestMonths.map(m => `${m}月`).join('、')}</span>
            </div>
            {fortune.cautionMonths.length > 0 && (
              <div className="flex items-center gap-2 text-red-300 mt-1">
                <span>🔴</span>
                <span>注意：{fortune.cautionMonths.map(m => `${m}月`).join('、')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mt-3 leading-relaxed">
        {fortune.summary}
      </p>
    </div>
  );
}

/**
 * 流年流月運勢圖主組件
 */
export default function FortuneTimeline({ chart, year }: FortuneTimelineProps) {
  const currentYear = year || new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  // 計算年度運勢
  const fortune = useMemo(() => {
    return calculateYearlyFortune(chart, currentYear);
  }, [chart, currentYear]);

  // 計算 SVG 座標點
  const points = useMemo(() => {
    const width = 800;
    const padding = 50;
    const xStep = (width - padding * 2) / 11;
    
    return fortune.months.map((m, i) => ({
      x: padding + i * xStep,
      y: levelToY(m.level),
      type: m.type,
      fortune: m,
    }));
  }, [fortune]);

  // 初始動畫
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      {/* 標題 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
            ✨ 流年運勢
          </span>
        </h2>
        <div className="text-sm text-gray-500">
          點擊月份查看詳情
        </div>
      </div>

      {/* 年度概覽 */}
      <YearOverview fortune={fortune} />

      {/* 運勢圖表 */}
      <div className="relative bg-gradient-to-b from-slate-900/80 via-[#1a1a3a]/60 to-slate-900/80 rounded-xl border border-amber-600/30 p-4 overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px]" />
        </div>

        {/* SVG 圖表 */}
        <div className="relative overflow-x-auto pb-2">
          <svg
            ref={svgRef}
            viewBox="0 0 800 200"
            className="w-full min-w-[600px] h-[200px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 背景網格 */}
            <g className="text-gray-700" opacity="0.3">
              {[20, 60, 100, 140].map(y => (
                <line key={y} x1="40" y1={y} x2="760" y2={y} stroke="currentColor" strokeDasharray="4,4" />
              ))}
            </g>
            
            {/* Y 軸標籤 */}
            <g className="text-gray-500 text-xs">
              <text x="20" y="24" fill="currentColor">高</text>
              <text x="20" y="84" fill="currentColor">中</text>
              <text x="20" y="144" fill="currentColor">低</text>
            </g>

            {/* 波浪線 */}
            <WavePath 
              points={points} 
              colors={TYPE_COLORS}
              animate={isAnimating}
            />

            {/* 月份點 */}
            {points.map((point, i) => (
              <MonthDot
                key={i}
                fortune={point.fortune}
                x={point.x}
                y={point.y}
                index={i}
                isExpanded={selectedMonth === i}
                onClick={() => setSelectedMonth(selectedMonth === i ? null : i)}
              />
            ))}

            {/* X 軸月份標籤 */}
            <g className="text-gray-400 text-xs">
              {MONTH_LABELS.map((label, i) => (
                <text
                  key={i}
                  x={points[i]?.x || 0}
                  y="180"
                  textAnchor="middle"
                  fill="currentColor"
                  className="select-none"
                >
                  {label}
                </text>
              ))}
            </g>
          </svg>
        </div>

        {/* 圖例 */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-gray-400">大吉 (8-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-gray-400">順利 (6.5-7.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-gray-400">平穩 (4.5-6.4)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-gray-400">謹慎 (3-4.4)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-gray-400">挑戰 (1-2.9)</span>
          </div>
        </div>
      </div>

      {/* 月份詳情 */}
      {selectedMonth !== null && (
        <div className="mt-4">
          <MonthDetailCard
            fortune={fortune.months[selectedMonth]}
            onClose={() => setSelectedMonth(null)}
          />
        </div>
      )}

      {/* 提示 */}
      <div className="mt-4 text-center text-xs text-gray-500">
        ⚠️ 運勢僅供參考，命盤是統計不是限制，人定勝天！
      </div>
    </div>
  );
}
