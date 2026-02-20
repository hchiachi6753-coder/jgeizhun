'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { analyzeFengshui, FengshuiAnalysis, Direction, Star, getDirectionFromDegree } from '@/lib/fengshui';
import fengshuiRules from '@/data/fengshui-rules.json';

interface Room {
  id: string;
  name: string;
  degree: number | null;
  photo?: string;
  required?: boolean;
}

// 方位對應角度
const DIRECTION_ANGLES: Record<Direction, number> = {
  '北': 0, '東北': 45, '東': 90, '東南': 135,
  '南': 180, '西南': 225, '西': 270, '西北': 315,
};

// 每個星的理想用途
const STAR_IDEAL_ROOMS: Record<string, { rooms: string[], icon: string, priority: number }> = {
  '生氣': { rooms: ['客廳', '大門', '財位'], icon: '🤑', priority: 1 },
  '天醫': { rooms: ['主臥室', '長輩房'], icon: '💪', priority: 2 },
  '延年': { rooms: ['夫妻房', '主臥室'], icon: '💕', priority: 3 },
  '伏位': { rooms: ['書房', '小孩房'], icon: '📚', priority: 4 },
  '絕命': { rooms: ['廁所', '儲藏室'], icon: '🚽', priority: 8 },
  '五鬼': { rooms: ['廚房', '雜物間'], icon: '🍳', priority: 7 },
  '六煞': { rooms: ['浴室', '廁所'], icon: '🚿', priority: 6 },
  '禍害': { rooms: ['儲藏室', '少用空間'], icon: '📦', priority: 5 },
};

export default function FengshuiResultPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [analysis, setAnalysis] = useState<FengshuiAnalysis | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'map'>('map');

  useEffect(() => {
    setMounted(true);
    
    const inputStr = sessionStorage.getItem('fengshui_input');
    const roomsStr = sessionStorage.getItem('fengshui_rooms');
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
        roomData = JSON.parse(roomsStr);
        const doorRoom = roomData.find(r => r.id === 'door');
        if (!doorRoom || doorRoom.degree === null) {
          router.push('/fengshui/tour');
          return;
        }
        doorDegree = doorRoom.degree;
      } else if (legacyDegree) {
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
      
      // 如果有測量房間，預設顯示「各房間」
      if (roomData.filter(r => r.id !== 'door' && r.degree !== null).length > 0) {
        setActiveTab('rooms');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      router.push('/fengshui/input');
    }
  }, [router]);

  // 使用 useCallback 快取函式，避免重複建立
  const getStarAdvice = useCallback((star: Star) => {
    return fengshuiRules.starPlacements[star as keyof typeof fengshuiRules.starPlacements] || null;
  }, []);

  const getRoomAnalysis = useCallback((room: Room) => {
    if (!analysis || room.degree === null) return null;
    const direction = getDirectionFromDegree(room.degree) as Direction;
    const dirInfo = analysis.directions[direction];
    return { direction, ...dirInfo };
  }, [analysis]);

  // 使用 useMemo 快取計算結果，只在 analysis 或 rooms 改變時重新計算
  const { correct, wrong } = useMemo(() => {
    if (!analysis) return { correct: [], wrong: [] };
    
    const measuredRooms = rooms.filter(r => r.id !== 'door' && r.degree !== null);
    const correctList: { room: Room, dir: Direction, star: string }[] = [];
    const wrongList: { room: Room, actualDir: Direction, actualStar: string, idealDir: Direction, idealStar: string }[] = [];
    
    measuredRooms.forEach(room => {
      const actualDir = getDirectionFromDegree(room.degree!) as Direction;
      const actualStar = analysis.directions[actualDir].star;
      const isLucky = analysis.directions[actualDir].info.type === '吉';
      
      const ideal = STAR_IDEAL_ROOMS[actualStar];
      const roomType = room.name.replace('主', '').replace('次', '');
      const isCorrect = ideal && ideal.rooms.some(r => room.name.includes(r) || r.includes(roomType));
      
      if (isCorrect || isLucky) {
        correctList.push({ room, dir: actualDir, star: actualStar });
      } else {
        let idealDir: Direction = actualDir;
        let idealStar = actualStar;
        
        const directions: Direction[] = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
        for (const dir of directions) {
          const star = analysis.directions[dir].star;
          const starIdeal = STAR_IDEAL_ROOMS[star];
          if (starIdeal && starIdeal.rooms.some(r => room.name.includes(r) || r.includes(roomType))) {
            idealDir = dir;
            idealStar = star;
            break;
          }
        }
        
        wrongList.push({ room, actualDir, actualStar, idealDir, idealStar });
      }
    });
    
    return { correct: correctList, wrong: wrongList };
  }, [analysis, rooms]);

  const measuredRooms = useMemo(() => 
    rooms.filter(r => r.id !== 'door' && r.degree !== null), 
    [rooms]
  );

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      {/* 頂部裝飾線 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent z-50" />

      {/* 頂部導航 */}
      <div className="sticky top-0 z-40 bg-[#0a0a1a]/95 backdrop-blur-md border-b border-amber-400/20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/fengshui/tour" className="text-purple-300 hover:text-amber-300 transition-colors">
            ← 返回
          </Link>
          <h1 className="text-lg font-bold text-amber-300">風水分析報告</h1>
          <div className="w-12"></div>
        </div>
      </div>

      {/* 主內容 */}
      <div className="max-w-lg mx-auto px-4 py-4">
        
        {/* 宅命配對 - 精簡版 */}
        <div className={`flex items-center justify-between p-4 rounded-2xl mb-4 ${
          analysis.isMatch 
            ? 'bg-gradient-to-r from-emerald-900/40 to-green-900/30 border border-emerald-400/30' 
            : 'bg-gradient-to-r from-amber-900/40 to-orange-900/30 border border-amber-400/30'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{analysis.isMatch ? '✨' : '🔮'}</span>
            <div>
              <h2 className={`text-xl font-bold ${analysis.isMatch ? 'text-emerald-300' : 'text-amber-300'}`}>
                {analysis.isMatch ? '宅命相合' : '宅命待調'}
              </h2>
              <p className="text-gray-400 text-sm">{analysis.ming.fourLife} · {analysis.zhai.fourLife.replace('命', '宅')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{analysis.ming.gua} / {analysis.zhai.gua}</p>
            <p className="text-xs text-gray-400">命卦 / 宅卦</p>
          </div>
        </div>

        {/* Tab 切換 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'map' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg' 
                : 'bg-purple-900/50 text-gray-300 hover:bg-purple-800/50'
            }`}
          >
            🧭 方位總覽
          </button>
          {measuredRooms.length > 0 && (
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'rooms' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg' 
                  : 'bg-purple-900/50 text-gray-300 hover:bg-purple-800/50'
              }`}
            >
              🏠 各房間
            </button>
          )}
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* Tab: 方位總覽（八方位圖 + 建議） */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'map' && (
          <section>
            {/* 配對狀態摘要 */}
            {measuredRooms.length > 0 && (
              <div className={`p-4 rounded-xl mb-4 ${
                wrong.length === 0 
                  ? 'bg-emerald-500/20 border border-emerald-400/30' 
                  : 'bg-amber-500/20 border border-amber-400/30'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {wrong.length === 0 ? '✅ 房間配置良好！' : `⚠️ ${wrong.length} 個房間需要調整`}
                  </span>
                  <span className="text-sm text-gray-300">
                    {correct.length}/{measuredRooms.length} 位置正確
                  </span>
                </div>
              </div>
            )}

            {/* 八方位圖 */}
            <div className="relative w-80 h-80 mx-auto mb-6">
              {/* 中心 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-purple-800 to-indigo-900 border-2 border-amber-400/50 flex items-center justify-center z-10 shadow-lg">
                <div className="text-center">
                  <p className="text-xs text-amber-300">坐{analysis.zhai.sitting}</p>
                  <p className="text-lg font-bold text-white">{analysis.zhai.gua}宅</p>
                </div>
              </div>
              
              {/* 八個方位 */}
              {directions.map((dir) => {
                const angle = DIRECTION_ANGLES[dir];
                const radians = (angle - 90) * Math.PI / 180;
                const radius = 115;
                const x = radius * Math.cos(radians);
                const y = radius * Math.sin(radians);
                const info = analysis.directions[dir];
                const isLucky = info.info.type === '吉';
                const isSelected = selectedDirection === dir;
                const ideal = STAR_IDEAL_ROOMS[info.star];
                
                // 找此方位的用戶房間
                const roomsHere = rooms.filter(r => {
                  if (r.id === 'door' || r.degree === null) return false;
                  return getDirectionFromDegree(r.degree) === dir;
                });
                
                return (
                  <button
                    key={dir}
                    onClick={() => setSelectedDirection(selectedDirection === dir ? null : dir)}
                    className={`absolute w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                      isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                    } ${
                      isLucky 
                        ? 'bg-gradient-to-br from-emerald-600/90 to-green-700/90 border-2 border-emerald-400' 
                        : 'bg-gradient-to-br from-red-700/90 to-orange-800/90 border-2 border-red-400'
                    }`}
                    style={{
                      left: `calc(50% + ${x}px - 32px)`,
                      top: `calc(50% + ${y}px - 32px)`,
                      boxShadow: isSelected ? `0 0 20px ${isLucky ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}` : 'none',
                    }}
                  >
                    <span className="text-[10px] px-1 rounded bg-white/20 text-white/90">{dir}</span>
                    <span className="text-base font-bold text-white">{info.star}</span>
                    <span className="text-xs">{ideal?.icon}</span>
                    
                    {/* 用戶房間標記 - 加大加明顯 */}
                    {roomsHere.length > 0 && (
                      <span className={`absolute -top-3 -right-3 px-2 py-1 rounded-lg text-xs font-bold shadow-lg border-2 ${
                        isLucky 
                          ? 'bg-amber-400 text-black border-amber-200' 
                          : 'bg-orange-500 text-white border-orange-300'
                      }`}
                      style={{ zIndex: 30 }}
                      >
                        {roomsHere[0].name.slice(0, 2)}
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* 裝飾圓圈 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 320">
                <circle cx="160" cy="160" r="115" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="1" />
                <circle cx="160" cy="160" r="55" fill="none" stroke="rgba(251,191,36,0.1)" strokeWidth="1" strokeDasharray="4,4" />
              </svg>
            </div>

            {/* 圖例 */}
            <div className="flex justify-center gap-4 mb-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> 吉位</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500"></span> 凶位</span>
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-amber-400 text-black rounded font-bold text-[10px]">主臥</span>
                你的房間
              </span>
            </div>

            {/* 選中方位的詳情 */}
            {selectedDirection && (
              <div className="p-5 rounded-2xl bg-purple-900/40 border border-purple-400/30 mb-4 animate-fadeIn">
                {(() => {
                  const info = analysis.directions[selectedDirection];
                  const advice = getStarAdvice(info.star);
                  const isLucky = info.info.type === '吉';
                  const ideal = STAR_IDEAL_ROOMS[info.star];
                  const roomsHere = rooms.filter(r => r.id !== 'door' && r.degree !== null && getDirectionFromDegree(r.degree!) === selectedDirection);
                  
                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-3xl p-2 rounded-xl ${isLucky ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}>
                            {ideal?.icon}
                          </span>
                          <div>
                            <h3 className="text-xl font-bold">
                              <span className="px-2 py-1 rounded bg-purple-600/50 text-purple-100">{selectedDirection}方</span>
                              <span className="ml-2 text-2xl text-white">{info.star}</span>
                            </h3>
                            <p className={`mt-1 ${isLucky ? 'text-emerald-300' : 'text-red-300'}`}>{info.info.level}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* 理想用途 */}
                      <div className="p-3 rounded-xl bg-black/20 mb-3">
                        <p className="text-amber-300 text-sm mb-1">📍 此位置適合：</p>
                        <p className="text-white">{ideal?.rooms.join('、')}</p>
                      </div>
                      
                      {/* 你的房間 */}
                      {roomsHere.length > 0 && (
                        <div className={`p-3 rounded-xl mb-3 ${isLucky ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                          <p className={`text-sm mb-1 ${isLucky ? 'text-emerald-300' : 'text-red-300'}`}>
                            {isLucky ? '✅ 你的房間：' : '⚠️ 你的房間：'}
                          </p>
                          <p className="text-white font-bold">{roomsHere.map(r => r.name).join('、')}</p>
                          {!isLucky && (
                            <p className="text-orange-200 text-sm mt-1">{(advice as any)?.warning}</p>
                          )}
                        </div>
                      )}
                      
                      {/* 化解/增強建議 */}
                      {isLucky ? (
                        (advice as any)?.enhance && (
                          <div className="p-3 rounded-xl bg-emerald-500/10">
                            <p className="text-emerald-300 text-sm mb-2">✨ 增強運勢：</p>
                            <div className="flex flex-wrap gap-1">
                              {(advice as any).enhance.items?.slice(0, 3).map((s: string, i: number) => (
                                <span key={i} className="text-xs px-2 py-1 rounded bg-emerald-600/30 text-emerald-200">{s}</span>
                              ))}
                            </div>
                          </div>
                        )
                      ) : (
                        (advice as any)?.remedy && (
                          <div className="p-3 rounded-xl bg-green-500/10">
                            <p className="text-green-300 text-sm mb-2">💡 化解方法：{(advice as any).remedy.principle}</p>
                            <div className="flex flex-wrap gap-1">
                              {(advice as any).remedy.items?.slice(0, 3).map((s: string, i: number) => (
                                <span key={i} className="text-xs px-2 py-1 rounded bg-green-600/30 text-green-200">{s}</span>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            
            {!selectedDirection && (
              <p className="text-center text-gray-400 text-sm mb-4">👆 點擊方位查看詳情</p>
            )}

            {/* 調整建議 */}
            {wrong.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-400/30">
                <h3 className="text-lg font-bold text-amber-300 mb-4">🔄 調整建議</h3>
                <div className="space-y-4">
                  {wrong.map(({ room, actualDir, actualStar, idealDir, idealStar }) => {
                    const advice = getStarAdvice(actualStar as Star);
                    const roomType = room.name.includes('小孩') ? '小孩房' : room.name.includes('次臥') ? '次臥' : room.name.includes('臥') ? '臥室' : room.name.includes('客') ? '客廳' : room.name.includes('書') ? '書房' : room.name.includes('廚') ? '廚房' : room.name.includes('浴') || room.name.includes('廁') ? '浴室' : room.name.includes('陽台') ? '陽台' : room.name.includes('玄關') ? '玄關' : null;
                    const byRoomAdvice = roomType && (advice as any)?.remedy?.byRoom?.[roomType];
                    
                    // 根據房間類型選擇適當的 icon
                    const roomIcon = room.name.includes('廚') ? '🍳' : room.name.includes('書') ? '📚' : room.name.includes('客') ? '🛋️' : room.name.includes('浴') || room.name.includes('廁') ? '🚿' : room.name.includes('陽台') ? '🌿' : room.name.includes('玄關') ? '🚪' : '🛏️';
                    
                    return (
                      <div key={room.id} className="p-4 rounded-xl bg-black/30 border border-red-500/20">
                        {/* 房間標題 */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">{roomIcon}</span>
                          <span className="font-bold text-xl px-2 py-1 rounded bg-amber-700/50 text-amber-100">{room.name}</span>
                          <span className="ml-auto px-3 py-1 rounded text-base font-bold bg-red-500/40 text-red-200">
                            {actualStar}
                          </span>
                        </div>
                        
                        {/* 現在 → 建議 */}
                        <div className="flex items-center gap-2 text-base mb-4">
                          <div className="px-3 py-1.5 rounded bg-red-500/30">
                            <span className="text-red-300 text-sm">現在：</span>
                            <span className="px-1.5 py-0.5 rounded bg-red-600/50 text-red-100">{actualDir}</span>
                            <span className="ml-1 font-bold text-white">{actualStar}</span>
                          </div>
                          <span className="text-amber-400 text-xl">→</span>
                          <div className="px-3 py-1.5 rounded bg-emerald-500/30">
                            <span className="text-emerald-300 text-sm">建議：</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-600/50 text-emerald-100">{idealDir}</span>
                            <span className="ml-1 font-bold text-white">{idealStar}</span>
                          </div>
                        </div>
                        
                        {/* 化解方法詳情 */}
                        {(advice as any)?.remedy && (
                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-green-300 text-base font-bold mb-3">
                              💡 化解方法：{(advice as any).remedy.principle}
                            </p>
                            
                            {/* 專屬房間建議（優先顯示） */}
                            {byRoomAdvice && (
                              <p className="text-amber-200 text-base mb-3 leading-relaxed">
                                🎯 {roomType}專屬：{byRoomAdvice}
                              </p>
                            )}
                            
                            {/* 化解物品 */}
                            {(advice as any).remedy.items && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {(advice as any).remedy.items.slice(0, 4).map((item: string, i: number) => (
                                  <span key={i} className="text-sm px-3 py-1.5 rounded bg-green-600/30 text-green-200">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* 禁忌 */}
                            {(advice as any).remedy.avoid && (
                              <p className="text-red-300 text-sm">
                                ⚠️ 避免：{(advice as any).remedy.avoid.join('、')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-gray-400 text-sm mt-4 text-center">
                  💡 如無法搬移房間，可按以上方法化解
                </p>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* Tab: 各房間詳細分析 */}
        {/* ═══════════════════════════════════════════ */}
        {activeTab === 'rooms' && (
          <section className="space-y-4">
            {measuredRooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">還沒有測量任何房間</p>
                <Link href="/fengshui/tour" className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold">
                  去測量房間
                </Link>
              </div>
            ) : (
              <>
                {measuredRooms.map(room => {
                  const roomInfo = getRoomAnalysis(room);
                  if (!roomInfo) return null;
                  
                  const isLucky = roomInfo.info.type === '吉';
                  const advice = getStarAdvice(roomInfo.star);
                  const ideal = STAR_IDEAL_ROOMS[roomInfo.star];
                  
                  // 判斷是否在正確位置
                  const roomType = room.name.replace('主', '').replace('次', '');
                  const isCorrectPlace = ideal && ideal.rooms.some(r => room.name.includes(r) || r.includes(roomType));
                  
                  return (
                    <div
                      key={room.id}
                      className={`p-5 rounded-2xl border ${
                        isLucky || isCorrectPlace
                          ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/20 border-emerald-500/30' 
                          : 'bg-gradient-to-br from-red-900/20 to-orange-900/15 border-red-500/20'
                      }`}
                    >
                      {/* 照片 */}
                      {room.photo && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden mb-4">
                          <img src={room.photo} alt={room.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      {/* 標題 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{ideal?.icon || '📍'}</span>
                          <div>
                            <h3 className="text-xl font-bold">
                              <span className="px-2 py-1 rounded bg-amber-700/50 text-amber-100">{room.name}</span>
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                              位於 <span className="px-1.5 py-0.5 rounded bg-purple-600/50 text-purple-200">{roomInfo.direction}方</span>
                              <span className="ml-1 text-lg font-bold text-white">{roomInfo.star}</span>
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg font-bold ${
                          isLucky || isCorrectPlace ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300'
                        }`}>
                          {isLucky || isCorrectPlace ? '✓ 位置佳' : '需調整'}
                        </span>
                      </div>
                      
                      {/* 分析 */}
                      <div className={`p-4 rounded-xl mb-4 ${isLucky ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        <p className={`font-bold mb-1 ${isLucky ? 'text-emerald-300' : 'text-red-300'}`}>
                          {roomInfo.info.level} · {(advice as any)?.domain?.join('、')}
                        </p>
                        <p className="text-gray-300 text-sm">{(advice as any)?.domainDesc}</p>
                      </div>
                      
                      {/* 建議 */}
                      {isLucky || isCorrectPlace ? (
                        <div className="space-y-3">
                          {(advice as any)?.enhance?.byRoom && (() => {
                            const roomType = room.name.includes('小孩') ? '小孩房' : room.name.includes('次臥') ? '次臥' : room.name.includes('臥') ? '臥室' : room.name.includes('客') ? '客廳' : room.name.includes('書') ? '書房' : room.name.includes('廚') ? '廚房' : room.name.includes('浴') || room.name.includes('廁') ? '浴室' : room.name.includes('陽台') ? '陽台' : room.name.includes('玄關') ? '玄關' : null;
                            const specific = roomType ? (advice as any).enhance.byRoom[roomType] : null;
                            return specific ? (
                              <div className="p-3 rounded-xl bg-amber-500/10">
                                <p className="text-amber-300 text-sm mb-1">🎯 專屬建議</p>
                                <p className="text-gray-200 text-sm">{specific}</p>
                              </div>
                            ) : null;
                          })()}
                          
                          {(advice as any)?.enhance?.items && (
                            <div>
                              <p className="text-sm text-amber-300 mb-2">✨ 增強運勢：</p>
                              <div className="flex flex-wrap gap-1">
                                {(advice as any).enhance.items.slice(0, 4).map((s: string, i: number) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded bg-purple-500/30 text-purple-200">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* 警告 */}
                          <div className="p-3 rounded-xl bg-red-500/10">
                            <p className="text-red-300 text-sm">{(advice as any)?.warning}</p>
                            {(advice as any)?.ifBedroom && room.name.includes('臥') && (
                              <p className="text-orange-300 text-sm mt-2">🛏️ {(advice as any).ifBedroom}</p>
                            )}
                          </div>
                          
                          {/* 化解 */}
                          {(advice as any)?.remedy && (
                            <div className="p-3 rounded-xl bg-green-500/10">
                              <p className="text-green-300 text-sm mb-2">💡 化解：{(advice as any).remedy.principle}</p>
                              <div className="flex flex-wrap gap-1">
                                {(advice as any).remedy.items?.slice(0, 3).map((s: string, i: number) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded bg-green-600/30 text-green-200">{s}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* 建議方位 */}
                          <div className="p-3 rounded-xl bg-amber-500/10">
                            <p className="text-amber-300 text-sm">
                              💫 {room.name}較適合在 <strong>{ideal?.rooms.join('、')}</strong> 對應的方位
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                <Link
                  href="/fengshui/tour"
                  className="block p-4 rounded-xl border-2 border-dashed border-purple-400/40 text-center text-purple-300 hover:border-amber-400 hover:text-amber-300 transition-all"
                >
                  + 測量更多房間
                </Link>
              </>
            )}
          </section>
        )}

        {/* 底部按鈕 */}
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
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </main>
  );
}
