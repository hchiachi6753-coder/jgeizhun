'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculateMingGua, getDirectionFromDegree } from '@/lib/fengshui';

interface Room {
  id: string;
  name: string;
  degree: number | null;
  required?: boolean;
}

const ROOM_PRESETS = [
  { id: 'living', name: '客廳', icon: '🛋️' },
  { id: 'bedroom', name: '主臥室', icon: '🛏️' },
  { id: 'bedroom2', name: '次臥室', icon: '🛏️' },
  { id: 'kids', name: '小孩房', icon: '🧒' },
  { id: 'study', name: '書房', icon: '📚' },
  { id: 'kitchen', name: '廚房', icon: '🍳' },
  { id: 'dining', name: '餐廳', icon: '🍽️' },
  { id: 'bathroom', name: '浴室', icon: '🚿' },
];

export default function FengshuiTourPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mingGua, setMingGua] = useState<any>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [customRoomName, setCustomRoomName] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // 檢查是否有輸入資料
    const input = sessionStorage.getItem('fengshui_input');
    if (!input) {
      router.push('/fengshui/input');
      return;
    }

    // 計算命卦
    const data = JSON.parse(input);
    const gua = calculateMingGua(
      parseInt(data.year), 
      parseInt(data.month), 
      parseInt(data.day), 
      data.gender
    );
    setMingGua(gua);

    // 載入已測量的房間
    const savedRooms = sessionStorage.getItem('fengshui_rooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    } else {
      // 初始化：大門 + 常用房間直接顯示（方案 A）
      const initialRooms: Room[] = [
        { id: 'door', name: '大門', degree: null, required: true },
        { id: 'living', name: '客廳', degree: null },
        { id: 'bedroom', name: '主臥室', degree: null },
        { id: 'bedroom2', name: '次臥室', degree: null },
        { id: 'kitchen', name: '廚房', degree: null },
        { id: 'study', name: '書房', degree: null },
        { id: 'bathroom', name: '浴室', degree: null },
      ];
      setRooms(initialRooms);
      sessionStorage.setItem('fengshui_rooms', JSON.stringify(initialRooms));
    }
    
    // 資料載入完成
    setIsLoading(false);
  }, [router]);

  const saveRooms = (newRooms: Room[]) => {
    setRooms(newRooms);
    sessionStorage.setItem('fengshui_rooms', JSON.stringify(newRooms));
  };

  const addRoom = (id: string, name: string) => {
    if (rooms.find(r => r.id === id)) return; // 已存在
    const newRooms = [...rooms, { id, name, degree: null }];
    saveRooms(newRooms);
    setShowAddRoom(false);
    setCustomRoomName('');
  };

  const addCustomRoom = () => {
    if (!customRoomName.trim()) return;
    const id = 'custom_' + Date.now();
    addRoom(id, customRoomName.trim());
  };

  const removeRoom = (id: string) => {
    if (id === 'door') return; // 大門不能刪
    const newRooms = rooms.filter(r => r.id !== id);
    saveRooms(newRooms);
  };

  const measureRoom = (roomId: string) => {
    sessionStorage.setItem('fengshui_measuring', roomId);
    router.push('/fengshui/tour/measure');
  };

  const canViewResult = rooms.find(r => r.id === 'door')?.degree !== null;

  const getPositionInfo = (degree: number) => {
    const direction = getDirectionFromDegree(degree);
    // 簡化顯示，詳細分析在結果頁
    return { direction };
  };

  // 載入中顯示
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏠</div>
          <p className="text-purple-300">載入中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white overflow-hidden relative">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(25)].map((_, i) => (
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
        <div className="absolute bottom-1/4 right-0 w-[350px] h-[200px] bg-indigo-500/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-20" />

      {/* 返回 */}
      <Link href="/fengshui/input" className="absolute top-6 left-6 z-20 text-purple-300/70 hover:text-amber-300 transition-colors flex items-center gap-2">
        <span className="text-xl">←</span>
        <span>返回</span>
      </Link>

      {/* 主內容 */}
      <div className="relative z-10 min-h-screen px-4 py-20">
        <div className="max-w-lg mx-auto">
          {/* 標題 */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                🏠 風水巡禮
              </span>
            </h1>
            <p className="text-purple-200/70">在家中各處測量方位</p>
          </div>

          {/* 命卦資訊 */}
          {mingGua && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/30 backdrop-blur-md border border-purple-400/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">您的命卦</p>
                  <p className="text-2xl font-bold text-amber-300">{mingGua.gua}卦</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">屬於</p>
                  <p className={`text-xl font-bold ${mingGua.fourLife === '東四命' ? 'text-green-400' : 'text-blue-400'}`}>
                    {mingGua.fourLife}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 房間列表 */}
          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-bold text-purple-200 flex items-center gap-2">
              📍 測量點
              <span className="text-sm font-normal text-gray-400">（點擊測量）</span>
            </h2>
            
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 rounded-xl border backdrop-blur-md transition-all ${
                  room.degree !== null
                    ? 'bg-green-500/10 border-green-400/50'
                    : 'bg-purple-900/30 border-purple-400/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {room.id === 'door' ? '🚪' : 
                       ROOM_PRESETS.find(p => p.id === room.id)?.icon || '📍'}
                    </span>
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        {room.name}
                        {room.required && (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/30 text-amber-300">必測</span>
                        )}
                      </p>
                      {room.degree !== null ? (
                        <p className="text-sm text-green-400">
                          ✓ {room.degree}° · {getPositionInfo(room.degree).direction}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">尚未測量</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => measureRoom(room.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        room.degree !== null
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-amber-500 text-black hover:bg-amber-400'
                      }`}
                    >
                      {room.degree !== null ? '重測' : '測量'}
                    </button>
                    
                    {!room.required && (
                      <button
                        onClick={() => removeRoom(room.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 新增房間 */}
          {!showAddRoom ? (
            <button
              onClick={() => setShowAddRoom(true)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-purple-400/40 text-purple-300 hover:border-amber-400 hover:text-amber-300 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>新增測量點</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-purple-900/40 border border-purple-400/30 space-y-4">
              <h3 className="font-bold text-amber-300">選擇房間</h3>
              
              {/* 預設房間 */}
              <div className="grid grid-cols-2 gap-2">
                {ROOM_PRESETS.filter(p => !rooms.find(r => r.id === p.id)).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => addRoom(preset.id, preset.name)}
                    className="p-3 rounded-lg bg-purple-950/50 border border-purple-400/20 hover:border-amber-400/50 transition-all text-left"
                  >
                    <span className="mr-2">{preset.icon}</span>
                    {preset.name}
                  </button>
                ))}
              </div>
              
              {/* 自訂房間 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRoomName}
                  onChange={(e) => setCustomRoomName(e.target.value)}
                  placeholder="自訂名稱（如：陽台）"
                  className="flex-1 px-4 py-3 rounded-lg bg-purple-950/50 border border-purple-400/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={addCustomRoom}
                  disabled={!customRoomName.trim()}
                  className="px-4 py-3 rounded-lg bg-amber-500 text-black font-medium disabled:bg-gray-600 disabled:text-gray-400 transition-all"
                >
                  新增
                </button>
              </div>
              
              <button
                onClick={() => setShowAddRoom(false)}
                className="w-full py-2 text-gray-400 hover:text-white transition-all"
              >
                取消
              </button>
            </div>
          )}

          {/* 查看結果按鈕 */}
          <div className="mt-8">
            <button
              onClick={() => router.push('/fengshui/result')}
              disabled={!canViewResult}
              className="w-full py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] active:scale-[0.98]"
            >
              📊 查看風水報告
            </button>
            
            {!canViewResult && (
              <p className="text-center text-sm text-gray-400 mt-2">
                請先測量大門方位
              </p>
            )}
          </div>

          {/* 提示 */}
          <div className="mt-6 p-4 rounded-xl bg-purple-950/30 border border-purple-400/20">
            <p className="text-sm text-purple-200/70 text-center leading-relaxed">
              <span className="text-amber-300 font-medium">💡 小提示</span><br />
              測量越多房間，報告越詳細！<br />
              可以測量客廳、臥室、書房等重要空間。
            </p>
          </div>
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
