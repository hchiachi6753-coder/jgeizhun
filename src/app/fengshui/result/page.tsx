'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyzeFengshui, FengshuiAnalysis, Direction, Star, STAR_INFO } from '@/lib/fengshui';
import fengshuiRules from '@/data/fengshui-rules.json';

// 方位對應角度
const DIRECTION_ANGLES: Record<Direction, number> = {
  '北': 0,
  '東北': 45,
  '東': 90,
  '東南': 135,
  '南': 180,
  '西南': 225,
  '西': 270,
  '西北': 315,
};

// 星曜顏色
const STAR_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  '大吉': { bg: 'rgba(34,197,94,0.3)', border: '#22c55e', text: '#4ade80' },
  '次吉': { bg: 'rgba(74,222,128,0.2)', border: '#4ade80', text: '#86efac' },
  '中吉': { bg: 'rgba(132,204,22,0.2)', border: '#84cc16', text: '#a3e635' },
  '小吉': { bg: 'rgba(163,230,53,0.15)', border: '#a3e635', text: '#bef264' },
  '大凶': { bg: 'rgba(239,68,68,0.3)', border: '#ef4444', text: '#f87171' },
  '次凶': { bg: 'rgba(249,115,22,0.25)', border: '#f97316', text: '#fb923c' },
  '中凶': { bg: 'rgba(234,179,8,0.2)', border: '#eab308', text: '#facc15' },
  '小凶': { bg: 'rgba(251,191,36,0.15)', border: '#fbbf24', text: '#fcd34d' },
};

export default function FengshuiResultPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [analysis, setAnalysis] = useState<FengshuiAnalysis | null>(null);
  const [expandedDirection, setExpandedDirection] = useState<Direction | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // 取得輸入資料
    const inputStr = sessionStorage.getItem('fengshui_input');
    const degreeStr = sessionStorage.getItem('fengshui_degree');
    
    if (!inputStr || !degreeStr) {
      router.push('/fengshui/input');
      return;
    }

    try {
      const input = JSON.parse(inputStr);
      const degree = parseInt(degreeStr, 10);
      
      const result = analyzeFengshui(
        parseInt(input.year, 10),
        parseInt(input.month, 10),
        parseInt(input.day, 10),
        input.gender as 'male' | 'female',
        degree
      );
      
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      router.push('/fengshui/input');
    }
  }, [router]);

  const getStarAdvice = (star: Star) => {
    const rules = fengshuiRules.starPlacements[star as keyof typeof fengshuiRules.starPlacements];
    if (!rules) return null;
    return rules;
  };

  const toggleDirection = (dir: Direction) => {
    setExpandedDirection(expandedDirection === dir ? null : dir);
  };

  if (!mounted || !analysis) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🧭</div>
          <p className="text-purple-200">正在分析風水...</p>
        </div>
      </main>
    );
  }

  const directions: Direction[] = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white overflow-x-hidden relative">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white star-twinkle"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 3 + 1 + 's',
            }}
          />
        ))}
        
        <div className="absolute top-1/4 left-0 w-[400px] h-[250px] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[200px] bg-indigo-500/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-20" />

      {/* 返回/完成 */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/fengshui" className="text-purple-300/70 hover:text-amber-300 transition-colors flex items-center gap-2">
          <span className="text-xl">←</span>
          <span>返回</span>
        </Link>
      </div>

      {/* 進度指示 */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 text-sm text-gray-400">
        <span className="w-8 h-8 rounded-full bg-green-500 text-white font-bold flex items-center justify-center">✓</span>
        <span className="w-6 h-[2px] bg-green-500"></span>
        <span className="w-8 h-8 rounded-full bg-green-500 text-white font-bold flex items-center justify-center">✓</span>
        <span className="w-6 h-[2px] bg-amber-500"></span>
        <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center">3</span>
      </div>

      {/* 主內容 */}
      <div className="relative z-10 px-4 py-20 max-w-2xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              🏠 風水分析結果
            </span>
          </h1>
        </div>

        {/* 命卦 & 宅卦 卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 命卦 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-purple-900/50 to-indigo-900/40 border border-purple-400/30">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400/40 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400/40 rounded-br-2xl" />
            
            <div className="text-center">
              <div className="text-sm text-purple-300 mb-1">您的命卦</div>
              <div className="text-4xl font-bold text-amber-400 mb-2">{analysis.ming.gua}</div>
              <div className="flex justify-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-purple-500/30 text-purple-200">{analysis.ming.element}</span>
                <span className={`px-2 py-1 rounded-full ${analysis.ming.fourLife === '東四命' ? 'bg-green-500/30 text-green-200' : 'bg-orange-500/30 text-orange-200'}`}>
                  {analysis.ming.fourLife}
                </span>
              </div>
            </div>
          </div>
          
          {/* 宅卦 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/40 border border-indigo-400/30">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400/40 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400/40 rounded-br-2xl" />
            
            <div className="text-center">
              <div className="text-sm text-indigo-300 mb-1">您的宅卦</div>
              <div className="text-4xl font-bold text-amber-400 mb-2">{analysis.zhai.gua}</div>
              <div className="flex justify-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-indigo-500/30 text-indigo-200">坐{analysis.zhai.sitting}</span>
                <span className={`px-2 py-1 rounded-full ${analysis.zhai.fourLife === '東四命' ? 'bg-green-500/30 text-green-200' : 'bg-orange-500/30 text-orange-200'}`}>
                  {analysis.zhai.fourLife.replace('命', '宅')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 宅命相合判定 */}
        <div className={`p-5 rounded-2xl mb-8 ${analysis.isMatch 
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/40' 
          : 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/40'}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{analysis.isMatch ? '✅' : '⚠️'}</span>
            <div>
              <div className={`font-bold text-lg ${analysis.isMatch ? 'text-green-300' : 'text-orange-300'}`}>
                {analysis.isMatch ? '宅命相合' : '宅命不合'}
              </div>
              <p className="text-sm text-gray-300 mt-1">{analysis.matchAdvice}</p>
            </div>
          </div>
        </div>

        {/* 八方位吉凶圖 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-amber-300 mb-4 text-center">📐 八方位吉凶圖</h2>
          
          {/* 八卦圖 */}
          <div className="relative w-72 h-72 mx-auto mb-6">
            {/* 中心 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-2 border-amber-400/50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-xs text-amber-300">坐{analysis.zhai.sitting}</div>
                <div className="text-lg font-bold text-white">{analysis.zhai.gua}宅</div>
              </div>
            </div>
            
            {/* 八個方位 */}
            {directions.map((dir) => {
              const angle = DIRECTION_ANGLES[dir];
              const radians = (angle - 90) * Math.PI / 180;
              const radius = 100;
              const x = radius * Math.cos(radians);
              const y = radius * Math.sin(radians);
              const info = analysis.directions[dir];
              const colors = STAR_COLORS[info.info.level];
              
              return (
                <button
                  key={dir}
                  onClick={() => toggleDirection(dir)}
                  className="absolute w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
                  style={{
                    left: `calc(50% + ${x}px - 32px)`,
                    top: `calc(50% + ${y}px - 32px)`,
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    boxShadow: expandedDirection === dir ? `0 0 20px ${colors.border}` : 'none',
                  }}
                >
                  <span className="text-xs text-gray-300">{dir}</span>
                  <span className="text-sm font-bold" style={{ color: colors.text }}>{info.star}</span>
                </button>
              );
            })}
            
            {/* 連接線 */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 288">
              <circle cx="144" cy="144" r="100" fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth="1" strokeDasharray="5,5" />
            </svg>
          </div>
          
          {/* 圖例 */}
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500"></span>
              <span className="text-gray-400">吉</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500"></span>
              <span className="text-gray-400">凶</span>
            </div>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">點擊方位查看詳情</span>
          </div>
        </div>

        {/* 八方位詳細列表 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-amber-300 mb-4">🔮 各方位詳解</h2>
          
          <div className="space-y-3">
            {directions.map((dir) => {
              const info = analysis.directions[dir];
              const colors = STAR_COLORS[info.info.level];
              const advice = getStarAdvice(info.star);
              const isExpanded = expandedDirection === dir;
              
              return (
                <div
                  key={dir}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {/* 標題列 */}
                  <button
                    onClick={() => toggleDirection(dir)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.info.type === '吉' ? '✨' : '⚡'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{dir}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${colors.border}40`, color: colors.text }}>
                            {info.star}
                          </span>
                          <span className="text-xs text-gray-400">{info.info.level}</span>
                        </div>
                        <div className="text-sm text-gray-300 mt-0.5">{info.info.meaning}</div>
                      </div>
                    </div>
                    <span className={`text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {/* 展開內容 */}
                  {isExpanded && advice && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/10">
                      <div className="mt-3 space-y-3">
                        {info.info.type === '吉' ? (
                          <>
                            <div>
                              <div className="text-xs text-amber-300 mb-1">✅ 適合擺放空間</div>
                              <div className="flex flex-wrap gap-2">
                                {(advice as any).recommendedSpaces?.map((space: string, i: number) => (
                                  <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-sm text-white">{space}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-amber-300 mb-1">🎨 建議擺設</div>
                              <div className="flex flex-wrap gap-2">
                                {(advice as any).items?.map((item: string, i: number) => (
                                  <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-sm text-white">{item}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-amber-300 mb-1">🌈 適合顏色</div>
                              <div className="flex flex-wrap gap-2">
                                {(advice as any).colors?.map((color: string, i: number) => (
                                  <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-sm text-white">{color}</span>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div className="text-xs text-orange-300 mb-1">⚠️ 建議用途</div>
                              <div className="flex flex-wrap gap-2">
                                {(advice as any).recommendedSpaces?.map((space: string, i: number) => (
                                  <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-sm text-white">{space}</span>
                                ))}
                              </div>
                            </div>
                            {(advice as any).remedy && (
                              <>
                                <div>
                                  <div className="text-xs text-green-300 mb-1">💡 化解原理：{(advice as any).remedy.principle}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-green-300 mb-1">🛡️ 化解物品</div>
                                  <div className="flex flex-wrap gap-2">
                                    {(advice as any).remedy.items?.map((item: string, i: number) => (
                                      <span key={i} className="px-2 py-1 rounded-lg bg-green-500/20 text-sm text-green-200">{item}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-green-300 mb-1">🎨 化解顏色</div>
                                  <div className="flex flex-wrap gap-2">
                                    {(advice as any).remedy.colors?.map((color: string, i: number) => (
                                      <span key={i} className="px-2 py-1 rounded-lg bg-green-500/20 text-sm text-green-200">{color}</span>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 行動按鈕 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              sessionStorage.removeItem('fengshui_input');
              sessionStorage.removeItem('fengshui_degree');
              router.push('/fengshui');
            }}
            className="flex-1 py-4 text-lg font-bold rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all"
          >
            🔄 重新分析
          </button>
          <Link
            href="/"
            className="flex-1 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-center hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            🏠 回首頁
          </Link>
        </div>

        {/* 底部說明 */}
        <div className="text-center text-gray-500 text-sm">
          <p>基於八宅派風水理論分析</p>
          <p className="mt-1">僅供參考，請搭配實際環境考量</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .star-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
