'use client';

import React, { useMemo } from 'react';
import type { ZiweiChart as ZiweiChartData, GongInfo, StarInfo } from '@/lib/ziwei/index';

/**
 * 紫微命盤 UI 組件
 * 
 * 設計風格：新中式 + 深色背景 + 金色邊框
 * 參考：文墨天機專業版 App
 */

interface ZiweiChartProps {
  /** 命盤資料 */
  chart: ZiweiChartData;
  /** 使用者姓名 */
  name?: string;
  /** 是否顯示詳細資訊 */
  showDetails?: boolean;
  /** 點擊宮位回調 */
  onGongClick?: (gong: GongInfo) => void;
}

// 傳統命盤格子位置（4x4 網格，中央 2x2 顯示資訊）
// 巳午未申
// 辰    酉
// 卯    戌
// 寅丑子亥
const GRID_POSITIONS: Record<string, { row: number; col: number }> = {
  '巳': { row: 0, col: 0 },
  '午': { row: 0, col: 1 },
  '未': { row: 0, col: 2 },
  '申': { row: 0, col: 3 },
  '辰': { row: 1, col: 0 },
  '酉': { row: 1, col: 3 },
  '卯': { row: 2, col: 0 },
  '戌': { row: 2, col: 3 },
  '寅': { row: 3, col: 0 },
  '丑': { row: 3, col: 1 },
  '子': { row: 3, col: 2 },
  '亥': { row: 3, col: 3 },
};

// 星曜亮度顏色
const BRIGHTNESS_COLORS: Record<string, string> = {
  '廟': 'text-yellow-400',      // 最旺
  '旺': 'text-orange-400',      // 次旺
  '得地': 'text-green-400',     // 得地
  '利': 'text-blue-400',        // 利
  '平': 'text-gray-400',        // 平
  '不得地': 'text-gray-500',    // 不得地
  '落陷': 'text-red-400',       // 落陷
};

// 四化顏色
const SIHUA_COLORS: Record<string, string> = {
  '祿': 'text-emerald-400',
  '權': 'text-orange-400',
  '科': 'text-cyan-400',
  '忌': 'text-red-500',
};

// 星曜類型顏色
const STAR_TYPE_COLORS = {
  main: 'text-purple-300',      // 主星：紫色
  assist: 'text-blue-400',      // 吉星：藍色
  sha: 'text-red-400',          // 煞星：紅色
  other: 'text-amber-400',      // 其他（祿存、天馬）：金色
};

/**
 * 單一星曜顯示
 */
function StarDisplay({ 
  star, 
  type 
}: { 
  star: StarInfo; 
  type: 'main' | 'assist' | 'sha' | 'other';
}) {
  const baseColor = STAR_TYPE_COLORS[type];
  const brightnessColor = star.brightness ? BRIGHTNESS_COLORS[star.brightness] : '';
  const sihuaColor = star.siHua ? SIHUA_COLORS[star.siHua] : '';
  
  return (
    <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
      <span className={`${baseColor} ${type === 'main' ? 'font-medium' : ''}`}>
        {star.name}
      </span>
      {star.brightness && (
        <span className={`text-[10px] ${brightnessColor}`}>
          {star.brightness}
        </span>
      )}
      {star.siHua && (
        <span className={`text-xs font-bold ${sihuaColor}`}>
          {star.siHua}
        </span>
      )}
    </span>
  );
}

/**
 * 單一宮位格子
 */
function GongCell({ 
  gong, 
  isMing, 
  isShen,
  daxianRange,
  onClick 
}: { 
  gong: GongInfo;
  isMing: boolean;
  isShen: boolean;
  daxianRange?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-2 min-h-[140px] rounded-sm
        border transition-all duration-200
        ${isMing 
          ? 'bg-purple-900/40 border-purple-500/60 shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
          : isShen 
            ? 'bg-rose-900/30 border-rose-500/50' 
            : 'bg-slate-900/60 border-amber-600/30 hover:border-amber-500/50'
        }
        ${onClick ? 'cursor-pointer hover:bg-slate-800/60' : ''}
      `}
    >
      {/* 宮位頂部：宮名 + 天干地支 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold ${isMing ? 'text-purple-300' : 'text-amber-200'}`}>
            {gong.name}
          </span>
          {isShen && !isMing && (
            <span className="text-[10px] text-rose-400 px-1 py-0.5 bg-rose-500/20 rounded">
              身
            </span>
          )}
          {isMing && isShen && (
            <span className="text-[10px] text-purple-300 px-1 py-0.5 bg-purple-500/20 rounded">
              命身
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {gong.gan}{gong.zhi}
        </span>
      </div>

      {/* 主星區（紫色） */}
      {gong.mainStars.length > 0 && (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1.5">
          {gong.mainStars.map((star, i) => (
            <StarDisplay key={i} star={star} type="main" />
          ))}
        </div>
      )}

      {/* 輔星區（藍色） */}
      {gong.assistStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mb-1">
          {gong.assistStars.map((star, i) => (
            <StarDisplay key={i} star={star} type="assist" />
          ))}
        </div>
      )}

      {/* 煞星區（紅色） */}
      {gong.shaStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 mb-1">
          {gong.shaStars.map((star, i) => (
            <StarDisplay key={i} star={star} type="sha" />
          ))}
        </div>
      )}

      {/* 其他星（祿存、天馬：金色） */}
      {gong.otherStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
          {gong.otherStars.map((star, i) => (
            <StarDisplay key={i} star={star} type="other" />
          ))}
        </div>
      )}

      {/* 大限標記（右下角） */}
      {daxianRange && (
        <div className="absolute bottom-1 right-1 text-[10px] text-gray-600">
          {daxianRange}
        </div>
      )}
    </div>
  );
}

/**
 * 中央資訊面板
 */
function CenterPanel({ 
  chart, 
  name 
}: { 
  chart: ZiweiChartData; 
  name?: string;
}) {
  return (
    <div className="col-span-2 row-span-2 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/80 via-purple-900/30 to-slate-900/80 rounded border-2 border-amber-600/50 p-4">
      {/* 標題 */}
      <div className="text-center mb-4">
        {name && (
          <h2 className="text-xl font-bold text-amber-200 mb-1 text-glow-gold">
            {name}
          </h2>
        )}
        <p className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
          紫微斗數命盤
        </p>
      </div>

      {/* 基本資訊 */}
      <div className="text-center space-y-2 text-sm">
        {/* 性別 + 五行局 */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-gray-400">
            {chart.gender === 'male' ? '乾造' : '坤造'}
          </span>
          <span className="text-purple-300 font-medium">
            {chart.wuXingJu.name}
          </span>
        </div>

        {/* 農曆 */}
        <div className="text-gray-400">
          <span>農曆 </span>
          <span className="text-gray-300">
            {chart.lunarDate.year}年
            {chart.lunarDate.isLeapMonth && '閏'}
            {chart.lunarDate.month}月
            {chart.lunarDate.day}日
          </span>
        </div>

        {/* 八字 */}
        <div className="flex items-center justify-center gap-2 text-gray-300">
          <span className="text-amber-300">{chart.lunarDate.yearGanZhi}</span>
          <span className="text-gray-600">年</span>
          <span className="text-amber-300">{chart.lunarDate.monthGanZhi}</span>
          <span className="text-gray-600">月</span>
          <span className="text-amber-300">{chart.lunarDate.dayGanZhi}</span>
          <span className="text-gray-600">日</span>
          <span className="text-amber-300">{chart.lunarDate.hourGanZhi}</span>
          <span className="text-gray-600">時</span>
        </div>

        {/* 命身宮 */}
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-700/50">
          <span className="text-purple-300">
            命宮：{chart.mingGong.gan}{chart.mingGong.zhi}
          </span>
          <span className="text-rose-300">
            身宮：{chart.shenGong.gongName}
          </span>
        </div>

        {/* 四化 */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="flex items-center gap-1">
            <span className={SIHUA_COLORS['祿']}>祿</span>
            <span className="text-gray-400">{chart.siHua.lu.star}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={SIHUA_COLORS['權']}>權</span>
            <span className="text-gray-400">{chart.siHua.quan.star}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={SIHUA_COLORS['科']}>科</span>
            <span className="text-gray-400">{chart.siHua.ke.star}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className={SIHUA_COLORS['忌']}>忌</span>
            <span className="text-gray-400">{chart.siHua.ji.star}</span>
          </span>
        </div>

        {/* 大限資訊 */}
        <div className="pt-2 text-xs text-gray-500">
          <span>{chart.daxian.startAge}歲起運 · </span>
          <span>{chart.daxian.direction}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 紫微命盤 UI 組件
 */
export default function ZiweiChart({ 
  chart, 
  name, 
  showDetails = true,
  onGongClick 
}: ZiweiChartProps) {
  // 建立地支到宮位的映射
  const zhiToGong = useMemo(() => {
    const map = new Map<string, GongInfo>();
    chart.gongs.forEach(gong => {
      map.set(gong.zhi, gong);
    });
    return map;
  }, [chart.gongs]);

  // 建立大限範圍映射
  const daxianRanges = useMemo(() => {
    const map = new Map<number, string>();
    chart.daxian.periods.forEach(period => {
      map.set(period.gongIndex, `${period.startAge}-${period.endAge}`);
    });
    return map;
  }, [chart.daxian.periods]);

  // 渲染網格
  const renderGrid = () => {
    const cells: React.JSX.Element[] = [];
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        // 中央 2x2 區域
        if ((row === 1 || row === 2) && (col === 1 || col === 2)) {
          if (row === 1 && col === 1) {
            cells.push(
              <CenterPanel key="center" chart={chart} name={name} />
            );
          }
          continue;
        }

        // 找出這個位置對應的地支
        const zhi = Object.entries(GRID_POSITIONS).find(
          ([, pos]) => pos.row === row && pos.col === col
        )?.[0];
        
        if (!zhi) continue;
        
        const gong = zhiToGong.get(zhi);
        if (!gong) continue;

        const isMing = gong.name === '命宮';
        const isShen = gong.isShenGong;
        const daxianRange = showDetails ? daxianRanges.get(gong.zhiIndex) : undefined;

        cells.push(
          <GongCell
            key={zhi}
            gong={gong}
            isMing={isMing}
            isShen={isShen}
            daxianRange={daxianRange}
            onClick={onGongClick ? () => onGongClick(gong) : undefined}
          />
        );
      }
    }

    return cells;
  };

  return (
    <div className="w-full">
      {/* 手機版提示 */}
      <div className="md:hidden text-center text-xs text-gray-500 mb-2">
        ← 可橫向滾動 →
      </div>
      
      {/* 命盤容器 */}
      <div className="overflow-x-auto pb-4">
        <div 
          className="grid grid-cols-4 gap-1 min-w-[640px] p-2 bg-gradient-to-br from-slate-900/90 via-[#1a1a3a]/90 to-slate-900/90 rounded-lg border border-amber-600/40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
            `
          }}
        >
          {renderGrid()}
        </div>
      </div>

      {/* 圖例 */}
      {showDetails && (
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/50 rounded-lg border border-gray-700/50">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-purple-500/50 border border-purple-400"></span>
              <span className="text-gray-400">主星</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-400"></span>
              <span className="text-gray-400">吉星</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500/50 border border-red-400"></span>
              <span className="text-gray-400">煞星</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500/50 border border-amber-400"></span>
              <span className="text-gray-400">祿馬</span>
            </span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-lg border border-gray-700/50">
            <span className={SIHUA_COLORS['祿']}>祿</span>
            <span className={SIHUA_COLORS['權']}>權</span>
            <span className={SIHUA_COLORS['科']}>科</span>
            <span className={SIHUA_COLORS['忌']}>忌</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 導出型別
export type { ZiweiChartProps };
