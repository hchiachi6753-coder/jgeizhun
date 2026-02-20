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
  
  // 五行配置 - 五角星位置（順時針：木在頂部）
  const elements = useMemo(() => [
    { name: '木', count: wood, color: '#22c55e', glow: 'rgba(34,197,94,0.8)', angle: -90 },   // 頂部
    { name: '火', count: fire, color: '#ef4444', glow: 'rgba(239,68,68,0.8)', angle: -18 },   // 右上
    { name: '土', count: earth, color: '#eab308', glow: 'rgba(234,179,8,0.8)', angle: 54 },    // 右下
    { name: '金', count: metal, color: '#94a3b8', glow: 'rgba(148,163,184,0.8)', angle: 126 }, // 左下
    { name: '水', count: water, color: '#3b82f6', glow: 'rgba(59,130,246,0.8)', angle: 198 },  // 左上
  ], [wood, fire, earth, metal, water]);

  // 計算節點位置
  const centerX = 140;
  const centerY = 140;
  const baseRadius = 95;
  
  const nodes = useMemo(() => {
    return elements.map((el) => {
      const angleRad = (el.angle * Math.PI) / 180;
      const x = centerX + baseRadius * Math.cos(angleRad);
      const y = centerY + baseRadius * Math.sin(angleRad);
      
      // 節點大小根據能量（20-50）
      const size = el.count === 0 ? 18 : 22 + (el.count / max) * 28;
      const opacity = el.count === 0 ? 0.3 : 0.7 + (el.count / max) * 0.3;
      
      return { ...el, x, y, size, opacity };
    });
  }, [elements, max]);

  // 計算內部形狀的點（根據能量縮放）
  const shapePoints = useMemo(() => {
    return nodes.map((node) => {
      const scale = node.count === 0 ? 0.2 : 0.3 + (node.count / max) * 0.6;
      const angleRad = (node.angle * Math.PI) / 180;
      const r = baseRadius * scale;
      const x = centerX + r * Math.cos(angleRad);
      const y = centerY + r * Math.sin(angleRad);
      return `${x},${y}`;
    }).join(' ');
  }, [nodes, max]);

  return (
    <div className="flex flex-col items-center py-6">
      {/* 標題 */}
      <h3 className="text-lg font-bold text-purple-300 mb-1 flex items-center gap-2">
        ✨ 五行能量分布
      </h3>
      <p className="text-gray-500 text-xs mb-4">節點大小 = 能量強弱</p>
      
      {/* 五角星圖 */}
      <div className="relative w-[280px] h-[280px]">
        <svg viewBox="0 0 280 280" className="w-full h-full">
          <defs>
            {/* 光暈濾鏡 */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* 漸變填充 */}
            <linearGradient id="shapeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.3)" />
              <stop offset="100%" stopColor="rgba(255,215,0,0.2)" />
            </linearGradient>
          </defs>
          
          {/* 外圈裝飾 */}
          <circle
            cx={centerX}
            cy={centerY}
            r={baseRadius + 15}
            fill="none"
            stroke="rgba(255,215,0,0.15)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          
          {/* 五角星連線（外框） */}
          <polygon
            points={nodes.map(n => `${n.x},${n.y}`).join(' ')}
            fill="none"
            stroke="rgba(255,215,0,0.25)"
            strokeWidth="1.5"
          />
          
          {/* 內部能量形狀 */}
          <polygon
            points={shapePoints}
            fill="url(#shapeGradient)"
            stroke="rgba(168,85,247,0.6)"
            strokeWidth="2"
            filter="url(#glow)"
          />
          
          {/* 中心點 */}
          <circle
            cx={centerX}
            cy={centerY}
            r="8"
            fill="rgba(255,215,0,0.8)"
            filter="url(#glow)"
          />
          
          {/* 節點 */}
          {nodes.map((node, i) => (
            <g key={node.name}>
              {/* 節點光暈 */}
              {node.count > 0 && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size + 8}
                  fill={node.glow}
                  opacity={0.3}
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              )}
              
              {/* 節點圓形 */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={node.color}
                opacity={node.opacity}
                stroke={node.count > 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
                strokeWidth={node.count > 0 ? 2 : 1}
                filter={node.count > 0 ? 'url(#glow)' : undefined}
              />
              
              {/* 節點文字 */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={node.count === 0 ? 'rgba(255,255,255,0.5)' : 'white'}
                fontSize={node.size > 35 ? '18' : '14'}
                fontWeight="bold"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
              >
                {node.name}
              </text>
              
              {/* 數量標籤 */}
              <text
                x={node.x}
                y={node.y + node.size + 14}
                textAnchor="middle"
                fill="rgba(255,255,255,0.7)"
                fontSize="11"
              >
                {node.count}個
              </text>
            </g>
          ))}
        </svg>
      </div>
      
      {/* 圖例 */}
      <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[300px]">
        {elements.map((el) => {
          const status = getStatus(el.count, total);
          return (
            <div 
              key={el.name} 
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-lg text-xs"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: el.color,
                  opacity: el.count === 0 ? 0.3 : 1,
                  boxShadow: el.count > 0 ? `0 0 6px ${el.glow}` : 'none'
                }}
              />
              <span className="text-gray-300">{el.name}</span>
              <span className="text-gray-500">{el.count}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${status.class}`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 缺的元素特別提示 */}
      {elements.some(el => el.count === 0) && (
        <div className="mt-3 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs">
          <span className="text-red-400">⚠️ 五行缺：</span>
          <span className="text-red-300 ml-1">
            {elements.filter(el => el.count === 0).map(el => el.name).join('、')}
          </span>
        </div>
      )}
    </div>
  );
}
