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
  const max = Math.max(wood, fire, earth, metal, water, 1);
  
  // 五行配置
  const elements = useMemo(() => [
    { name: '木', count: wood, color: '#22c55e', gradient: 'from-green-400 to-green-600' },
    { name: '火', count: fire, color: '#ef4444', gradient: 'from-red-400 to-red-600' },
    { name: '土', count: earth, color: '#eab308', gradient: 'from-yellow-400 to-yellow-600' },
    { name: '金', count: metal, color: '#94a3b8', gradient: 'from-gray-300 to-gray-500' },
    { name: '水', count: water, color: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
  ], [wood, fire, earth, metal, water]);

  // 計算花瓣高度（基於能量）
  const getPetalHeight = (count: number) => {
    if (count === 0) return 40;
    return 50 + (count / max) * 50; // 50-100px
  };

  return (
    <div className="flex flex-col items-center py-6">
      {/* 標題 */}
      <h3 className="text-lg font-bold text-purple-300 mb-1 flex items-center gap-2">
        🪷 五行能量分布
      </h3>
      <p className="text-gray-500 text-xs mb-6">花瓣大小 = 能量強弱</p>
      
      {/* 蓮花圖 - 橫向排列的花瓣 */}
      <div className="flex items-end justify-center gap-2 h-[140px] mb-4">
        {elements.map((el, i) => {
          const height = getPetalHeight(el.count);
          const opacity = el.count === 0 ? 0.3 : 1;
          const status = getStatus(el.count, total);
          
          return (
            <div
              key={el.name}
              className="flex flex-col items-center"
              style={{ opacity }}
            >
              {/* 花瓣 */}
              <div
                className={`relative flex items-center justify-center rounded-t-full bg-gradient-to-t ${el.gradient} transition-all duration-500`}
                style={{
                  width: '52px',
                  height: `${height}px`,
                  boxShadow: el.count > 0 ? `0 0 20px ${el.color}40, 0 -5px 30px ${el.color}30` : 'none',
                }}
              >
                {/* 花瓣內的文字 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-xl font-bold drop-shadow-md">{el.name}</span>
                  <span className="text-xs opacity-90">{el.count}個</span>
                </div>
                
                {/* 光澤效果 */}
                <div className="absolute inset-x-2 top-2 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
              </div>
              
              {/* 狀態標籤 */}
              <div className={`mt-2 text-[10px] px-2 py-0.5 rounded-full ${status.class}`}>
                {status.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 蓮花底座 */}
      <div className="relative w-[300px] h-[30px] flex items-center justify-center">
        {/* 花托 */}
        <div className="absolute w-[280px] h-[20px] bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-full opacity-80" />
        <div className="absolute top-[8px] w-[240px] h-[15px] bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-full opacity-60" />
        
        {/* 水面 */}
        <div className="absolute top-[15px] w-full h-[15px] bg-gradient-to-b from-cyan-500/20 to-transparent" />
      </div>

      {/* 缺的元素特別提示 */}
      {elements.some(el => el.count === 0) && (
        <div className="mt-4 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs">
          <span className="text-red-400">⚠️ 五行缺：</span>
          <span className="text-red-300 ml-1">
            {elements.filter(el => el.count === 0).map(el => el.name).join('、')}
          </span>
        </div>
      )}
    </div>
  );
}
