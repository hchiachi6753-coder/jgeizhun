'use client';

import { useMemo } from 'react';

interface WuxingLotusProps {
  wood: number;   // 木
  fire: number;   // 火
  earth: number;  // 土
  metal: number;  // 金
  water: number;  // 水
}

// 判斷能量狀態
function getStatus(count: number, total: number): { label: string; class: string } {
  if (count === 0) return { label: '缺', class: 'bg-red-500/50 text-red-200' };
  const ratio = count / total;
  if (ratio >= 0.35) return { label: '旺', class: 'bg-yellow-500/40 text-yellow-300' };
  if (ratio >= 0.25) return { label: '強', class: 'bg-green-500/40 text-green-300' };
  if (ratio >= 0.15) return { label: '中', class: 'bg-gray-500/40 text-gray-300' };
  return { label: '弱', class: 'bg-red-500/30 text-red-300' };
}

export default function WuxingLotus({ wood, fire, earth, metal, water }: WuxingLotusProps) {
  const total = wood + fire + earth + metal + water || 1;
  
  const elements = useMemo(() => [
    { name: '木', count: wood, color: '#22c55e', lightColor: '#4ade80' },
    { name: '火', count: fire, color: '#ef4444', lightColor: '#f87171' },
    { name: '土', count: earth, color: '#eab308', lightColor: '#facc15' },
    { name: '金', count: metal, color: '#94a3b8', lightColor: '#cbd5e1' },
    { name: '水', count: water, color: '#3b82f6', lightColor: '#60a5fa' },
  ], [wood, fire, earth, metal, water]);

  // 計算環形圖的弧度
  const radius = 90;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;
  
  // 計算每個元素的弧長和偏移
  const arcs = useMemo(() => {
    let offset = 0;
    return elements.map((el) => {
      const ratio = el.count / total;
      const length = ratio * circumference;
      const arc = {
        ...el,
        ratio,
        length,
        offset,
        dashArray: `${length} ${circumference}`,
        dashOffset: -offset,
      };
      offset += length;
      return arc;
    });
  }, [elements, total, circumference]);

  return (
    <div className="flex flex-col items-center py-6">
      {/* 標題 */}
      <h3 className="text-lg font-bold text-purple-300 mb-1 flex items-center gap-2">
        🪷 五行能量分布
      </h3>
      <p className="text-gray-500 text-xs mb-6">弧長 = 能量佔比</p>
      
      {/* 環形圖 */}
      <div className="relative w-[240px] h-[240px]">
        <svg 
          viewBox="0 0 240 240" 
          className="w-full h-full"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* 背景環 */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          
          {/* 五行弧形 */}
          {arcs.map((arc, i) => (
            arc.count > 0 && (
              <circle
                key={arc.name}
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={arc.dashArray}
                strokeDashoffset={arc.dashOffset}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${arc.color})`,
                  transition: 'all 0.5s ease',
                }}
              />
            )
          ))}
        </svg>
        
        {/* 中心內容 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl mb-1 animate-pulse">☯</div>
          <div className="text-gray-400 text-xs">五行平衡</div>
          <div className="text-amber-400 text-lg font-bold mt-1">{total}</div>
          <div className="text-gray-500 text-xs">個能量</div>
        </div>
      </div>
      
      {/* 圖例 - 兩行排列 */}
      <div className="grid grid-cols-3 gap-3 mt-6 w-full max-w-[320px]">
        {elements.map((el) => {
          const status = getStatus(el.count, total);
          const percentage = Math.round((el.count / total) * 100);
          return (
            <div 
              key={el.name} 
              className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl text-sm"
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${el.lightColor}, ${el.color})` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-white font-medium">{el.name}</span>
                  <span className="text-gray-400">{el.count}個</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-gray-500 text-xs">{percentage}%</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.class}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 缺的元素特別提示 */}
      {elements.some(el => el.count === 0) && (
        <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm">
          <span className="text-red-400">⚠️ 五行缺：</span>
          <span className="text-red-300 ml-1">
            {elements.filter(el => el.count === 0).map(el => el.name).join('、')}
          </span>
        </div>
      )}
    </div>
  );
}
