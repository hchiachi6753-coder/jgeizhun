'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDirectionFromDegree } from '@/lib/fengshui';

interface Room {
  id: string;
  name: string;
  degree: number | null;
  photo?: string;
  required?: boolean;
}

type Step = 'permission' | 'capture' | 'confirm';

export default function FengshuiMeasurePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('permission');
  
  // 羅盤狀態
  const [compassState, setCompassState] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const [currentHeading, setCurrentHeading] = useState<number | null>(null);
  
  // 相機狀態
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // 結果
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedDegree, setCapturedDegree] = useState<number | null>(null);
  
  // 房間資訊
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    
    const measuringId = sessionStorage.getItem('fengshui_measuring');
    if (!measuringId) {
      router.push('/fengshui/tour');
      return;
    }
    setRoomId(measuringId);

    const roomsData = sessionStorage.getItem('fengshui_rooms');
    if (roomsData) {
      const rooms: Room[] = JSON.parse(roomsData);
      const room = rooms.find(r => r.id === measuringId);
      if (room) {
        setRoomName(room.name);
      }
    }

    // 檢查羅盤支援
    checkCompassSupport();

    return () => {
      stopCamera();
    };
  }, [router]);

  // ========== 羅盤功能 ==========
  const checkCompassSupport = () => {
    if (!window.DeviceOrientationEvent) {
      setCompassState('unsupported');
      return;
    }

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS 需要請求權限
      setCompassState('pending');
    } else {
      // Android 直接啟動
      setCompassState('granted');
      startCompass();
      startCamera();
      setStep('capture');
    }
  };

  const requestPermissions = async () => {
    try {
      // 請求羅盤權限 (iOS)
      const compassPermission = await (DeviceOrientationEvent as any).requestPermission();
      if (compassPermission === 'granted') {
        setCompassState('granted');
        startCompass();
        startCamera();
        setStep('capture');
      } else {
        setCompassState('denied');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setCompassState('denied');
    }
  };

  const startCompass = () => {
    let lastUpdate = 0;
    const throttleMs = 100; // 每 100ms 最多更新一次
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) return;
      lastUpdate = now;
      
      let heading: number | undefined;
      
      if ((event as any).webkitCompassHeading !== undefined) {
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        heading = 360 - event.alpha;
        if (heading >= 360) heading -= 360;
        if (heading < 0) heading += 360;
      }
      
      if (heading !== undefined && !isNaN(heading)) {
        setCurrentHeading(Math.round(heading));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('deviceorientationabsolute', handleOrientation as any);
  };

  // ========== 相機功能 ==========
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError(error.message || '無法存取相機');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || currentHeading === null) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setCapturedPhoto(dataUrl);
      setCapturedDegree(currentHeading);
      stopCamera();
      setStep('confirm');
    }
  };

  const skipPhoto = () => {
    if (currentHeading === null) return;
    setCapturedDegree(currentHeading);
    stopCamera();
    setStep('confirm');
  };

  const retake = () => {
    setCapturedPhoto(null);
    setCapturedDegree(null);
    startCamera();
    setStep('capture');
  };

  const saveAndReturn = () => {
    if (capturedDegree !== null && roomId) {
      const roomsData = sessionStorage.getItem('fengshui_rooms');
      if (roomsData) {
        const rooms: Room[] = JSON.parse(roomsData);
        const updatedRooms = rooms.map(r => 
          r.id === roomId 
            ? { ...r, degree: capturedDegree, photo: capturedPhoto || undefined } 
            : r
        );
        sessionStorage.setItem('fengshui_rooms', JSON.stringify(updatedRooms));
      }
      
      sessionStorage.removeItem('fengshui_measuring');
      router.push('/fengshui/tour');
    }
  };

  const directionText = currentHeading !== null ? getDirectionFromDegree(currentHeading) : '--';
  const capturedDirectionText = capturedDegree !== null ? getDirectionFromDegree(capturedDegree) : '--';

  // 根據房間類型取得測量指引
  const getMeasureGuide = () => {
    if (roomId === 'door') {
      return {
        title: '測量大門方位',
        position: '站在室內玄關',
        facing: '手機指向門外方向',
        icon: '🚪',
        diagram: '[ 室內 ] 👤➡️ [ 大門 ] ➡️ [ 室外 ]',
        tips: '這是最重要的測量，決定您的宅卦'
      };
    }
    
    // 各房間特定指引
    const guides: Record<string, any> = {
      'living': {
        position: '站在客廳中央',
        facing: '面向客廳主要入口',
        diagram: '[ 大門/走廊 ] ←👤 [ 客廳中央 ]',
        tips: '站在沙發區中間，面對進入客廳的主要方向'
      },
      'bedroom': {
        position: '站在床尾中央',
        facing: '面向床頭方向',
        diagram: '[ 床尾 ] 👤➡️ [ 床頭 ]',
        tips: '這個方位決定睡眠品質與健康運'
      },
      'bedroom2': {
        position: '站在床尾中央',
        facing: '面向床頭方向',
        diagram: '[ 床尾 ] 👤➡️ [ 床頭 ]',
        tips: '次臥方位影響家庭成員運勢'
      },
      'kids': {
        position: '站在床尾或書桌前',
        facing: '面向床頭或書桌方向',
        diagram: '[ 房門 ] → [ 房間中央 ] 👤➡️ [ 床/書桌 ]',
        tips: '小孩房方位影響學業和性格發展'
      },
      'study': {
        position: '坐在書桌椅上',
        facing: '面向書桌方向（工作時的朝向）',
        diagram: '[ 椅背 ] 👤➡️ [ 書桌 ] ➡️ [ 前方 ]',
        tips: '書桌朝向影響事業運和專注力'
      },
      'kitchen': {
        position: '站在爐灶前',
        facing: '面向爐灶方向',
        diagram: '[ 廚房入口 ] → [ 👤 ] ➡️ [ 爐灶 ]',
        tips: '爐灶方位影響財運和家人健康'
      },
      'dining': {
        position: '站在餐桌旁',
        facing: '面向餐桌中央',
        diagram: '[ 廚房 ] → [ 👤 ] ➡️ [ 餐桌 ]',
        tips: '餐廳方位影響家庭和諧'
      },
      'bathroom': {
        position: '站在門口',
        facing: '面向浴室內部',
        diagram: '[ 走廊 ] 👤➡️ [ 浴室 ]',
        tips: '浴室宜在凶位，可化解煞氣'
      }
    };
    
    const specific = (roomId ? guides[roomId] : null) || {
      position: '站在房間門口',
      facing: '面向房間內部',
      diagram: '[ 走廊 ] 👤➡️ [ 房間門口 ] ➡️ [ 房間內 ]',
      tips: '記錄此空間相對於房屋中心的方位'
    };
    
    return {
      title: `測量${roomName}方位`,
      icon: roomId === 'living' ? '🛋️' : 
            roomId?.includes('bedroom') ? '🛏️' : 
            roomId === 'kids' ? '🧒' :
            roomId === 'study' ? '📚' : 
            roomId === 'kitchen' ? '🍳' :
            roomId === 'dining' ? '🍽️' :
            roomId === 'bathroom' ? '🚿' : '📍',
      ...specific
    };
  };

  const guide = getMeasureGuide();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white overflow-hidden relative">
      {/* 星空背景 - 減少數量提升性能 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white star-twinkle"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
            }}
          />
        ))}
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-20" />

      {/* 返回 */}
      <Link href="/fengshui/tour" className="absolute top-6 left-6 z-30 text-purple-300/70 hover:text-amber-300 transition-colors flex items-center gap-2">
        <span className="text-xl">←</span>
        <span>返回</span>
      </Link>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 主內容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        
        {/* ========== Step 1: 授權 ========== */}
        {step === 'permission' && (
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">{guide.icon}</div>
              <h1 className="text-2xl font-bold mb-2 text-amber-300">{guide.title}</h1>
            </div>

            {/* 測量指引說明 */}
            <div className="p-5 rounded-2xl bg-purple-900/40 border border-purple-400/30 mb-6">
              <h3 className="text-amber-300 font-bold mb-3">📍 測量方式</h3>
              <div className="space-y-3 text-gray-200">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span><strong className="text-white">{guide.position}</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span><strong className="text-white">{guide.facing}</strong></span>
                </div>
              </div>
              
              {/* 示意圖 */}
              <div className="mt-4 p-3 rounded-xl bg-black/30 text-center">
                <p className="text-xs text-gray-400 mb-1">示意圖</p>
                <p className="text-lg font-mono text-amber-200">{guide.diagram}</p>
              </div>
              
              {/* 小提示 */}
              {guide.tips && (
                <p className="mt-3 text-sm text-purple-200/70 text-center">
                  💡 {guide.tips}
                </p>
              )}
            </div>

            {compassState === 'pending' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-400">
                <h3 className="text-lg font-bold text-center mb-3">📱 需要授權</h3>
                <p className="text-sm text-gray-300 text-center mb-4">需要使用羅盤和相機來測量方位</p>
                <button
                  onClick={requestPermissions}
                  className="w-full py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black"
                >
                  🔓 授權開始測量
                </button>
              </div>
            )}

            {compassState === 'denied' && (
              <div className="p-6 rounded-2xl bg-red-500/20 border border-red-400">
                <h3 className="text-lg font-bold text-center text-red-300 mb-3">❌ 權限被拒絕</h3>
                <p className="text-sm text-gray-300 text-center">請在瀏覽器設定中允許使用動態感測器和相機</p>
              </div>
            )}

            {compassState === 'unsupported' && (
              <div className="p-6 rounded-2xl bg-gray-500/20 border border-gray-400">
                <h3 className="text-lg font-bold text-center text-gray-300 mb-3">📵 不支援羅盤</h3>
                <p className="text-sm text-gray-400 text-center">請使用手機開啟此頁面</p>
              </div>
            )}
          </div>
        )}

        {/* ========== Step 2: 拍攝（羅盤+相機同時） ========== */}
        {step === 'capture' && (
          <div className="w-full max-w-sm">
            {/* 測量指引提示 */}
            <div className="text-center mb-3">
              <p className="text-sm text-purple-200/70">
                {guide.position}，{guide.facing}
              </p>
            </div>

            {/* 相機預覽 + 即時方位 */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-black mb-4">
              {cameraError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/30">
                  <div className="text-center p-4">
                    <p className="text-red-300 mb-2">❌ {cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-amber-500 text-black rounded-lg"
                    >
                      重試
                    </button>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* 取景框 */}
              <div className="absolute inset-4 border-2 border-amber-400/50 rounded-xl pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
              </div>
              
              {/* 即時方位顯示（浮動在相機畫面上） */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-amber-400/50">
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-300">
                    {currentHeading !== null ? `${currentHeading}°` : '--°'}
                  </p>
                  <p className="text-lg text-white font-medium">{directionText}</p>
                </div>
              </div>

              {/* 房間名稱 */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
                <p className="text-sm text-white">{guide.icon} {roomName}</p>
              </div>
            </div>

            {/* 按鈕 */}
            <div className="space-y-3">
              <button
                onClick={capturePhoto}
                disabled={!cameraReady || currentHeading === null}
                className="w-full py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-2xl">📸</span>
                <span>拍照記錄方位</span>
              </button>
              
              <button
                onClick={skipPhoto}
                disabled={currentHeading === null}
                className="w-full py-3 text-gray-400 hover:text-white transition-all"
              >
                只記錄方位，不拍照
              </button>
            </div>
          </div>
        )}

        {/* ========== Step 3: 確認 ========== */}
        {step === 'confirm' && (
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold text-emerald-300">{roomName} 測量完成</h1>
            </div>

            {/* 結果卡片 */}
            <div className="p-5 rounded-2xl bg-green-500/20 border-2 border-green-400 mb-6">
              {capturedPhoto && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-4">
                  <img src={capturedPhoto} alt="房間照片" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">記錄方位</p>
                <p className="text-4xl font-bold text-white mb-1">
                  {capturedDegree}°
                </p>
                <p className="text-2xl text-amber-300 font-medium">
                  {capturedDirectionText}
                </p>
              </div>
            </div>

            {/* 按鈕 */}
            <div className="space-y-3">
              <button
                onClick={saveAndReturn}
                className="w-full py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                儲存並返回 ✓
              </button>
              <button
                onClick={retake}
                className="w-full py-3 text-gray-400 hover:text-white transition-all"
              >
                重新測量
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .star-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
