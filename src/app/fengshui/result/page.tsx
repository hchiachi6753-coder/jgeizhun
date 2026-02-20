'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyzeFengshui, FengshuiAnalysis, Direction, Star, STAR_INFO, getDirectionFromDegree } from '@/lib/fengshui';
import fengshuiRules from '@/data/fengshui-rules.json';

interface Room {
  id: string;
  name: string;
  degree: number | null;
  photo?: string; // base64
  required?: boolean;
}

// 方位對應角度
const DIRECTION_ANGLES: Record<Direction, number> = {
  '北': 0, '東北': 45, '東': 90, '東南': 135,
  '南': 180, '西南': 225, '西': 270, '西北': 315,
};

export default function FengshuiResultPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [analysis, setAnalysis] = useState<FengshuiAnalysis | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'directions'>('overview');

  useEffect(() => {
    setMounted(true);
    
    const inputStr = sessionStorage.getItem('fengshui_input');
    const roomsStr = sessionStorage.getItem('fengshui_rooms');
    
    // 向後兼容：支援舊的 fengshui_degree
    const legacyDegree = sessionStorage.getItem('fengshui_degree');
    
    if (!inputStr) {
      router.push('/fengshui/input');
      return;
    }

    try {
      const input = JSON.parse(inputStr);
      let doorDegree: number;
      let roomData: Room[] = [];
      
      if (roomsStr) {
        // 新版：多房間
        roomData = JSON.parse(roomsStr);
        const doorRoom = roomData.find(r => r.id === 'door');
        if (!doorRoom || doorRoom.degree === null) {
          router.push('/fengshui/tour');
          return;
        }
        doorDegree = doorRoom.degree;
      } else if (legacyDegree) {
        // 舊版：單一度數
        doorDegree = parseInt(legacyDegree, 10);
      } else {
        router.push('/fengshui/tour');
        return;
      }
      
      setRooms(roomData);
      
      const result = analyzeFengshui(
        parseInt(input.year, 10),
        parseInt(input.month, 10),
        parseInt(input.day, 10),
        input.gender as 'male' | 'female',
        doorDegree
      );
      
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      router.push('/fengshui/input');
    }
  }, [router]);

  const getStarAdvice = (star: Star) => {
    const rules = fengshuiRules.starPlacements[star as keyof typeof fengshuiRules.starPlacements];
    return rules || null;
  };

  // 根據房間方位取得該方位的星曜資訊
  const getRoomAnalysis = (room: Room) => {
    if (!analysis || room.degree === null) return null;
    const direction = getDirectionFromDegree(room.degree) as Direction;
    const dirInfo = analysis.directions[direction];
    return { direction, ...dirInfo };
  };

  if (!mounted || !analysis) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">🏠</div>
          <p className="text-xl text-purple-200">正在分析您的風水...</p>
        </div>
      </main>
    );
  }

  const directions: Direction[] = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
  const luckyDirs = directions.filter(d => analysis.directions[d].info.type === '吉');
  const unluckyDirs = directions.filter(d => analysis.directions[d].info.type === '凶');
  const measuredRooms = rooms.filter(r => r.id !== 'door' && r.degree !== null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      {/* 頂部裝飾線 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent z-50" />

      {/* 頂部導航 */}
      <div className="sticky top-0 z-40 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-amber-400/20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/fengshui/tour" className="text-purple-300 hover:text-amber-300 transition-colors">
            ← 返回
          </Link>
          <h1 className="text-lg font-bold text-amber-300">風水分析報告</h1>
          <div className="w-12"></div>
        </div>
      </div>

      {/* 主內容 */}
      <div className="max-w-lg mx-auto px-4 py-6">
        
        {/* ═══════════════════════════════════════════ */}
        {/* Section 1: 核心結果 - 宅命配對 */}
        {/* ═══════════════════════════════════════════ */}
        <section className="mb-8">
          {/* 大標題結果 */}
          <div className={`text-center py-8 px-6 rounded-3xl mb-6 ${
            analysis.isMatch 
              ? 'bg-gradient-to-br from-emerald-900/40 to-green-900/30 border-2 border-emerald-400/40' 
              : 'bg-gradient-to-br from-amber-900/40 to-orange-900/30 border-2 border-amber-400/40'
          }`}>
            <div className="text-6xl mb-4">{analysis.isMatch ? '✨' : '🔮'}</div>
            <h2 className={`text-3xl font-bold mb-2 ${analysis.isMatch ? 'text-emerald-300' : 'text-amber-300'}`}>
              {analysis.isMatch ? '宅命相合' : '宅命待調'}
            </h2>
            <p className="text-gray-300 text-lg">{analysis.matchAdvice}</p>
          </div>

          {/* 命卦 & 宅卦 - 大卡片 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 命卦 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/60 to-indigo-900/50 border border-purple-400/30 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
              <p className="text-purple-300 text-sm mb-2">您的命卦</p>
              <p className="text-5xl font-bold text-white mb-3">{analysis.ming.gua}</p>
              <div className="space-y-1">
                <p className="text-amber-300 text-lg">{analysis.ming.fourLife}</p>
                <p className="text-gray-400">五行屬{analysis.ming.element}</p>
              </div>
            </div>
            
            {/* 宅卦 */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/60 to-purple-900/50 border border-indigo-400/30 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
              <p className="text-indigo-300 text-sm mb-2">您的宅卦</p>
              <p className="text-5xl font-bold text-white mb-3">{analysis.zhai.gua}</p>
              <div className="space-y-1">
                <p className="text-amber-300 text-lg">{analysis.zhai.fourLife.replace('命', '宅')}</p>
                <p className="text-gray-400">坐{analysis.zhai.sitting}向{analysis.zhai.facingDirection}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section 2: Tab 切換 */}
        {/* ═══════════════════════════════════════════ */}
        <div className="flex rounded-xl bg-purple-900/30 p-1 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all text-sm ${
              activeTab === 'overview' 
                ? 'bg-amber-500 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 總覽
          </button>
          {measuredRooms.length > 0 && (
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all text-sm ${
                activeTab === 'rooms' 
                  ? 'bg-amber-500 text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🏠 各房間
            </button>
          )}
          <button
            onClick={() => setActiveTab('directions')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all text-sm ${
              activeTab === 'directions' 
                ? 'bg-amber-500 text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🧭 八方位
          </button>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* Tab Content: 總覽 */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <section className="space-y-6">
            {/* 吉位摘要 */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-900/30 to-green-900/20 border border-emerald-500/30 p-5">
              <h3 className="text-xl font-bold text-emerald-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span> 吉利方位
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {luckyDirs.map(dir => {
                  const info = analysis.directions[dir];
                  return (
                    <button
                      key={dir}
                      onClick={() => { setSelectedDirection(dir); setActiveTab('directions'); }}
                      className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all text-left"
                    >
                      <p className="text-2xl font-bold text-white">{dir}</p>
                      <p className="text-emerald-300">{info.star}</p>
                      <p className="text-sm text-gray-400">{info.info.level}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 凶位摘要 */}
            <div className="rounded-2xl bg-gradient-to-r from-red-900/20 to-orange-900/15 border border-red-500/20 p-5">
              <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> 需要化解
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {unluckyDirs.map(dir => {
                  const info = analysis.directions[dir];
                  return (
                    <button
                      key={dir}
                      onClick={() => { setSelectedDirection(dir); setActiveTab('directions'); }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-left"
                    >
                      <p className="text-2xl font-bold text-white">{dir}</p>
                      <p className="text-orange-300">{info.star}</p>
                      <p className="text-sm text-gray-400">{info.info.level}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 快速建議 */}
            <div className="rounded-2xl bg-purple-900/30 border border-purple-400/30 p-5">
              <h3 className="text-xl font-bold text-amber-300 mb-4">💡 快速建議</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex gap-3">
                  <span className="text-emerald-400">•</span>
                  <span>主臥室最佳方位：<strong className="text-emerald-300">
                    {directions.find(d => analysis.directions[d].star === '天醫') || directions.find(d => analysis.directions[d].star === '延年')}
                  </strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400">•</span>
                  <span>財位方向：<strong className="text-amber-300">
                    {directions.find(d => analysis.directions[d].star === '生氣')}
                  </strong>（放闊葉植物）</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-400">•</span>
                  <span>書房/工作區：<strong className="text-purple-300">
                    {directions.find(d => analysis.directions[d].star === '伏位')}
                  </strong></span>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* Tab Content: 各房間分析 */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'rooms' && (
          <section className="space-y-4">
            <p className="text-center text-purple-200/70 mb-4">
              根據您測量的房間位置，以下是各房間的風水分析
            </p>
            
            {measuredRooms.map(room => {
              const roomInfo = getRoomAnalysis(room);
              if (!roomInfo) return null;
              
              const isLucky = roomInfo.info.type === '吉';
              const advice = getStarAdvice(roomInfo.star);
              
              return (
                <div
                  key={room.id}
                  className={`p-5 rounded-2xl border ${
                    isLucky 
                      ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/20 border-emerald-500/30' 
                      : 'bg-gradient-to-br from-red-900/20 to-orange-900/15 border-red-500/20'
                  }`}
                >
                  {/* 房間照片 */}
                  {room.photo && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-4">
                      <img src={room.photo} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  {/* 房間標題 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {room.id.includes('bedroom') ? '🛏️' : 
                         room.id === 'living' ? '🛋️' :
                         room.id === 'study' ? '📚' :
                         room.id === 'kitchen' ? '🍳' :
                         room.id === 'kids' ? '🧒' : '📍'}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{room.name}</h3>
                        <p className="text-sm text-gray-400">
                          位於 <span className="text-amber-300">{roomInfo.direction}方</span> · {room.degree}°
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg font-bold ${
                      isLucky ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'
                    }`}>
                      {roomInfo.star}
                    </div>
                  </div>
                  
                  {/* 主管運勢領域 */}
                  <div className={`p-4 rounded-xl mb-4 ${
                    isLucky ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-bold ${isLucky ? 'text-emerald-300' : 'text-red-300'}`}>
                        {roomInfo.info.level}
                      </span>
                      {(advice as any)?.domain && (
                        <div className="flex gap-1">
                          {(advice as any).domain.map((d: string, i: number) => (
                            <span key={i} className={`px-2 py-0.5 rounded text-xs ${
                              isLucky ? 'bg-emerald-600/30 text-emerald-200' : 'bg-red-600/30 text-red-200'
                            }`}>
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm">{(advice as any)?.domainDesc || roomInfo.info.meaning}</p>
                  </div>
                  
                  {/* 對你的影響 */}
                  {isLucky ? (
                    <div className="space-y-4">
                      {/* 吉位說明 */}
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-emerald-300 font-medium mb-2">✨ 對你的影響</p>
                        <p className="text-gray-200 text-sm">{(advice as any)?.goodFor}</p>
                      </div>
                      
                      {/* 建議擺設 */}
                      {(advice as any)?.items && (
                        <div>
                          <p className="text-sm text-amber-300 mb-2">🎨 建議擺設：</p>
                          <div className="flex flex-wrap gap-2">
                            {(advice as any)?.items?.map((s: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 text-sm">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 凶位警告 */}
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                        <p className="text-red-300 font-medium mb-2">⚠️ 注意事項</p>
                        <p className="text-gray-200 text-sm mb-2">{(advice as any)?.warning}</p>
                        {(room.id.includes('bedroom') || room.name.includes('臥室') || room.name.includes('房')) && (advice as any)?.ifBedroom && (
                          <p className="text-orange-300 text-sm mt-2 p-2 rounded bg-orange-500/10">
                            🛏️ <strong>臥室在此位：</strong>{(advice as any).ifBedroom}
                          </p>
                        )}
                      </div>
                      
                      {/* 化解方法 */}
                      {(advice as any)?.remedy && (
                        <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                          <p className="text-green-300 font-medium mb-2">💡 化解方法：{(advice as any)?.remedy?.principle}</p>
                          <div className="flex flex-wrap gap-2">
                            {(advice as any)?.remedy?.items?.map((s: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-200 text-sm">{s}</span>
                            ))}
                          </div>
                          {(advice as any)?.remedy?.colors && (
                            <p className="text-gray-400 text-xs mt-2">建議色系：{(advice as any).remedy.colors.join('、')}</p>
                          )}
                        </div>
                      )}
                      
                      {/* 更好的選擇 */}
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                        <p className="text-amber-300 text-sm">
                          💫 更好的選擇：此位置較適合做{' '}
                          <span className="font-medium">
                            {(advice as any)?.recommendedSpaces?.join('、')}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* 新增更多房間提示 */}
            <Link
              href="/fengshui/tour"
              className="block p-4 rounded-xl border-2 border-dashed border-purple-400/40 text-center text-purple-300 hover:border-amber-400 hover:text-amber-300 transition-all"
            >
              + 測量更多房間
            </Link>
          </section>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* Tab Content: 八方位詳解 */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'directions' && (
          <section>
            {/* 八卦圓盤 */}
            <div className="relative w-72 h-72 mx-auto mb-8">
              {/* 中心 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-purple-800 to-indigo-900 border-2 border-amber-400/50 flex items-center justify-center z-10 shadow-lg shadow-purple-500/30">
                <div className="text-center">
                  <p className="text-amber-300 text-sm">坐{analysis.zhai.sitting}</p>
                  <p className="text-xl font-bold text-white">{analysis.zhai.gua}宅</p>
                </div>
              </div>
              
              {/* 八個方位按鈕 */}
              {directions.map((dir) => {
                const angle = DIRECTION_ANGLES[dir];
                const radians = (angle - 90) * Math.PI / 180;
                const radius = 105;
                const x = radius * Math.cos(radians);
                const y = radius * Math.sin(radians);
                const info = analysis.directions[dir];
                const isLucky = info.info.type === '吉';
                const isSelected = selectedDirection === dir;
                
                return (
                  <button
                    key={dir}
                    onClick={() => setSelectedDirection(selectedDirection === dir ? null : dir)}
                    className={`absolute w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                      isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                    } ${
                      isLucky 
                        ? 'bg-gradient-to-br from-emerald-600 to-green-700 border-2 border-emerald-400' 
                        : 'bg-gradient-to-br from-red-700 to-orange-800 border-2 border-red-400'
                    }`}
                    style={{
                      left: `calc(50% + ${x}px - 28px)`,
                      top: `calc(50% + ${y}px - 28px)`,
                      boxShadow: isSelected 
                        ? `0 0 30px ${isLucky ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.6)'}` 
                        : 'none',
                    }}
                  >
                    <span className="text-xs text-white/80">{dir}</span>
                    <span className="text-sm font-bold text-white">{info.star.slice(0,2)}</span>
                  </button>
                );
              })}
              
              {/* 裝飾圓圈 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 288">
                <circle cx="144" cy="144" r="105" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="1" />
                <circle cx="144" cy="144" r="60" fill="none" stroke="rgba(251,191,36,0.1)" strokeWidth="1" strokeDasharray="4,4" />
              </svg>
            </div>

            {/* 選中方位的詳情 */}
            {selectedDirection && (
              <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-indigo-900/40 border border-purple-400/30 animate-fadeIn">
                {(() => {
                  const info = analysis.directions[selectedDirection];
                  const advice = getStarAdvice(info.star);
                  const isLucky = info.info.type === '吉';
                  
                  return (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                          isLucky ? 'bg-emerald-500/30' : 'bg-red-500/30'
                        }`}>
                          {isLucky ? '✨' : '⚡'}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{selectedDirection}方 · {info.star}</h3>
                          <p className={`text-lg ${isLucky ? 'text-emerald-300' : 'text-orange-300'}`}>
                            {info.info.level} · {info.info.meaning}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {isLucky ? (
                          <>
                            <div>
                              <p className="text-amber-300 text-sm mb-2">✅ 適合用途</p>
                              <div className="flex flex-wrap gap-2">
                                {(advice as any)?.recommendedSpaces?.map((s: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200">{s}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-amber-300 text-sm mb-2">🎨 建議擺設</p>
                              <div className="flex flex-wrap gap-2">
                                {(advice as any)?.items?.map((s: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200">{s}</span>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-orange-300 text-sm mb-2">⚠️ 建議用途（以凶壓凶）</p>
                              <div className="flex flex-wrap gap-2">
                                {(advice as any)?.recommendedSpaces?.map((s: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-200">{s}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-green-300 text-sm mb-2">💡 化解方法：{(advice as any)?.remedy?.principle}</p>
                              <div className="flex flex-wrap gap-2">
                                {(advice as any)?.remedy?.items?.map((s: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-200">{s}</span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {!selectedDirection && (
              <p className="text-center text-gray-400 py-4">👆 點擊上方方位查看詳情</p>
            )}

            {/* 八方位列表 */}
            <div className="space-y-2">
              {directions.map(dir => {
                const info = analysis.directions[dir];
                const isLucky = info.info.type === '吉';
                return (
                  <button
                    key={dir}
                    onClick={() => setSelectedDirection(selectedDirection === dir ? null : dir)}
                    className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                      selectedDirection === dir 
                        ? 'bg-amber-500/20 border border-amber-400/50' 
                        : 'bg-purple-900/20 border border-transparent hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        isLucky ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'
                      }`}>
                        {dir}
                      </span>
                      <div className="text-left">
                        <p className="font-bold text-white">{info.star}</p>
                        <p className="text-sm text-gray-400">{info.info.level}</p>
                      </div>
                    </div>
                    <span className={`text-2xl ${isLucky ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isLucky ? '◉' : '○'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* 底部按鈕 */}
        {/* ═══════════════════════════════════════════ */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => {
              sessionStorage.removeItem('fengshui_input');
              sessionStorage.removeItem('fengshui_rooms');
              sessionStorage.removeItem('fengshui_degree');
              router.push('/fengshui');
            }}
            className="w-full py-4 text-lg font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-all"
          >
            🔄 重新分析
          </button>
          <Link
            href="/"
            className="block w-full py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-center hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            🏠 回首頁
          </Link>
        </div>

        {/* 底部說明 */}
        <p className="text-center text-gray-500 text-sm mt-6 pb-8">
          基於八宅派風水理論 · 僅供參考
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
