'use client';

import { useMemo } from 'react';

interface WuxingLotusProps {
  // 五行數量
  wood: number;  // 木
  fire: number;  // 火
  earth: number; // 土
  metal: number; // 金
  water: number; // 水
}

// 判斷能量狀態
function getStatus(count: number, max: number): { label: string; class: string } {
  const ratio = count / max;
  if (count === 0) return { label: '缺', class: 'status-lack' };
  if (ratio >= 0.4) return { label: '旺', class: 'status-peak' };
  if (ratio >= 0.25) return { label: '強', class: 'status-strong' };
  if (ratio >= 0.15) return { label: '中', class: 'status-normal' };
  return { label: '弱', class: 'status-weak' };
}

export default function WuxingLotus({ wood, fire, earth, metal, water }: WuxingLotusProps) {
  const total = wood + fire + earth + metal + water;
  const max = Math.max(wood, fire, earth, metal, water, 1);
  
  const elements = useMemo(() => [
    { 
      name: '木', 
      count: wood, 
      color: 'from-green-400 via-green-500 to-green-600',
      shadowColor: 'rgba(34,197,94,0.6)',
      textColor: 'text-green-900',
      dotBg: 'bg-gradient-to-b from-green-400 to-green-600',
      angle: 0,
    },
    { 
      name: '火', 
      count: fire, 
      color: 'from-red-400 via-red-500 to-red-600',
      shadowColor: 'rgba(239,68,68,0.6)',
      textColor: 'text-white',
      dotBg: 'bg-gradient-to-b from-red-400 to-red-600',
      angle: 72,
    },
    { 
      name: '土', 
      count: earth, 
      color: 'from-yellow-300 via-yellow-500 to-yellow-600',
      shadowColor: 'rgba(234,179,8,0.6)',
      textColor: 'text-yellow-900',
      dotBg: 'bg-gradient-to-b from-yellow-300 to-yellow-600',
      angle: 144,
    },
    { 
      name: '金', 
      count: metal, 
      color: 'from-gray-200 via-gray-400 to-gray-500',
      shadowColor: 'rgba(148,163,184,0.6)',
      textColor: 'text-gray-800',
      dotBg: 'bg-gradient-to-b from-gray-200 to-gray-500',
      angle: 216,
    },
    { 
      name: '水', 
      count: water, 
      color: 'from-blue-400 via-blue-500 to-blue-600',
      shadowColor: 'rgba(59,130,246,0.6)',
      textColor: 'text-white',
      dotBg: 'bg-gradient-to-b from-blue-400 to-blue-600',
      angle: 288,
    },
  ], [wood, fire, earth, metal, water]);

  // 計算花瓣尺寸 (基於數量)
  const getPetalSize = (count: number) => {
    if (count === 0) return { width: 35, height: 40 };
    const baseWidth = 45;
    const baseHeight = 60;
    const scale = 0.5 + (count / max) * 0.7;
    return {
      width: Math.round(baseWidth * scale),
      height: Math.round(baseHeight * scale),
    };
  };

  return (
    <div className="flex flex-col items-center py-6">
      {/* 標題 */}
      <h3 className="text-lg font-bold text-purple-300 mb-1 flex items-center gap-2">
        🪷 五行能量分布
      </h3>
      <p className="text-gray-500 text-xs mb-6">花瓣大小 = 能量強弱</p>
      
      {/* 蓮花圖 */}
      <div className="relative w-[280px] h-[280px]">
        {/* 背景光暈 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        
        {/* 花瓣 */}
        {elements.map((el, i) => {
          const size = getPetalSize(el.count);
          const status = getStatus(el.count, total);
          const opacity = el.count === 0 ? 'opacity-30' : 'opacity-90 hover:opacity-100';
          const shadow = el.count === 0 ? '' : `drop-shadow(0 0 15px ${el.shadowColor})`;
          
          return (
            <div
              key={el.name}
              className={`absolute left-1/2 top-1/2 bg-gradient-to-b ${el.color} ${opacity} rounded-[50%_50%_45%_45%] flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 cursor-default`}
              style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
                transformOrigin: 'center calc(100% + 20px)',
                transform: `translateX(-50%) translateY(-100%) rotate(${el.angle}deg)`,
                filter: shadow,
                animation: el.count > 0 ? `breathe-${el.name} 3s ease-in-out infinite` : undefined,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <span className={`text-xl font-bold ${el.textColor}`} style={{ transform: `rotate(-${el.angle}deg)` }}>
                {el.name}
              </span>
              <span className={`text-[10px] ${el.textColor} opacity-80`} style={{ transform: `rotate(-${el.angle}deg)` }}>
                {el.count}個
              </span>
            </div>
          );
        })}
        
        {/* 中心太極 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(255,215,0,0.5)] animate-pulse z-10">
          ☯
        </div>
      </div>
      
      {/* 圖例 */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {elements.map((el) => {
          const status = getStatus(el.count, total);
          return (
            <div key={el.name} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-sm">
              <div className={`w-4 h-4 rounded-full ${el.dotBg}`} />
              <span className="text-gray-300">{el.name}</span>
              <span className="text-gray-400">{el.count}個</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                status.class === 'status-peak' ? 'bg-yellow-500/30 text-yellow-300' :
                status.class === 'status-strong' ? 'bg-green-500/30 text-green-300' :
                status.class === 'status-normal' ? 'bg-gray-500/30 text-gray-300' :
                status.class === 'status-weak' ? 'bg-red-500/30 text-red-300' :
                'bg-red-500/50 text-red-200'
              }`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* CSS 動畫 */}
      <style jsx>{`
        @keyframes breathe-木 {
          0%, 100% { transform: translateX(-50%) translateY(-100%) rotate(0deg) scale(1); }
          50% { transform: translateX(-50%) translateY(-100%) rotate(0deg) scale(1.05); }
        }
        @keyframes breathe-火 {
          0%, 100% { transform: translateX(-50%) translateY(-100%) rotate(72deg) scale(1); }
          50% { transform: translateX(-50%) translateY(-100%) rotate(72deg) scale(1.05); }
        }
        @keyframes breathe-土 {
          0%, 100% { transform: translateX(-50%) translateY(-100%) rotate(144deg) scale(1); }
          50% { transform: translateX(-50%) translateY(-100%) rotate(144deg) scale(1.05); }
        }
        @keyframes breathe-金 {
          0%, 100% { transform: translateX(-50%) translateY(-100%) rotate(216deg) scale(1); }
          50% { transform: translateX(-50%) translateY(-100%) rotate(216deg) scale(1.05); }
        }
        @keyframes breathe-水 {
          0%, 100% { transform: translateX(-50%) translateY(-100%) rotate(288deg) scale(1); }
          50% { transform: translateX(-50%) translateY(-100%) rotate(288deg) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
