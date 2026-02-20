'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDirectionFromDegree } from '@/lib/fengshui';

interface Room {
  id: string;
  name: string;
  degree: number | null;
  photo?: string; // base64
  required?: boolean;
}

type Step = 'photo' | 'compass' | 'confirm';

export default function FengshuiMeasurePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('photo');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  
  const [permissionState, setPermissionState] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const [currentHeading, setCurrentHeading] = useState<number | null>(null);
  const [confirmedDegree, setConfirmedDegree] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    
    // 取得要測量的房間 ID
    const measuringId = sessionStorage.getItem('fengshui_measuring');
    if (!measuringId) {
      router.push('/fengshui/tour');
      return;
    }
    setRoomId(measuringId);

    // 取得房間名稱
    const roomsData = sessionStorage.getItem('fengshui_rooms');
    if (roomsData) {
      const rooms: Room[] = JSON.parse(roomsData);
      const room = rooms.find(r => r.id === measuringId);
      if (room) {
        setRoomName(room.name);
      }
    }

    // 啟動相機
    startCamera();

    return () => {
      stopCamera();
    };
  }, [router]);

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

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setCapturedPhoto(dataUrl);
      stopCamera();
      setStep('compass');
      initCompass();
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setStep('photo');
    startCamera();
  };

  const skipPhoto = () => {
    stopCamera();
    setStep('compass');
    initCompass();
  };

  // ========== 羅盤功能 ==========
  const initCompass = useCallback(() => {
    if (!window.DeviceOrientationEvent) {
      setPermissionState('unsupported');
      return;
    }

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setPermissionState('pending');
    } else {
      setPermissionState('granted');
      startCompass();
    }
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission === 'granted') {
        setPermissionState('granted');
        startCompass();
      } else {
        setPermissionState('denied');
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setPermissionState('denied');
    }
  };

  const startCompass = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
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

  const confirmDirection = () => {
    if (currentHeading !== null) {
      setConfirmedDegree(currentHeading);
      setStep('confirm');
    }
  };

  const saveAndReturn = () => {
    if (confirmedDegree !== null && roomId) {
      const roomsData = sessionStorage.getItem('fengshui_rooms');
      if (roomsData) {
        const rooms: Room[] = JSON.parse(roomsData);
        const updatedRooms = rooms.map(r => 
          r.id === roomId 
            ? { ...r, degree: confirmedDegree, photo: capturedPhoto || undefined } 
            : r
        );
        sessionStorage.setItem('fengshui_rooms', JSON.stringify(updatedRooms));
      }
      
      sessionStorage.removeItem('fengshui_measuring');
      router.push('/fengshui/tour');
    }
  };

  const resetMeasurement = () => {
    setConfirmedDegree(null);
    setStep('compass');
  };

  const directionText = currentHeading !== null ? getDirectionFromDegree(currentHeading) : '--';

  const getMeasureHint = () => {
    if (roomId === 'door') {
      return '站在室內門口，將手機對準門外方向';
    }
    return `站在${roomName}中央，將手機對準主要入口方向`;
  };

  const getPhotoHint = () => {
    if (roomId === 'door') {
      return '拍一張大門/玄關的照片';
    }
    return `拍一張${roomName}的照片`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white overflow-hidden relative">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(60)].map((_, i) => (
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
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-20" />

      {/* 返回 */}
      <Link href="/fengshui/tour" className="absolute top-6 left-6 z-20 text-purple-300/70 hover:text-amber-300 transition-colors flex items-center gap-2">
        <span className="text-xl">←</span>
        <span>返回</span>
      </Link>

      {/* 進度指示 */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 text-sm">
        <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center ${
          step === 'photo' ? 'bg-amber-500 text-black' : 'bg-green-500 text-white'
        }`}>{step === 'photo' ? '1' : '✓'}</span>
        <span className={`w-6 h-[2px] ${step !== 'photo' ? 'bg-amber-500' : 'bg-gray-600'}`}></span>
        <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center ${
          step === 'compass' ? 'bg-amber-500 text-black' : step === 'confirm' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
        }`}>{step === 'confirm' ? '✓' : '2'}</span>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 主內容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        
        {/* ========== Step 1: 拍照 ========== */}
        {step === 'photo' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📸</div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                  {roomName}
                </span>
              </h1>
              <p className="text-purple-200/70">{getPhotoHint()}</p>
            </div>

            {/* 相機預覽 */}
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden bg-black mb-6">
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
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
              </div>
            </div>

            {/* 按鈕 */}
            <div className="w-full max-w-sm space-y-3">
              <button
                onClick={takePhoto}
                disabled={!cameraReady}
                className="w-full py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
              >
                📸 拍照
              </button>
              <button
                onClick={skipPhoto}
                className="w-full py-3 text-gray-400 hover:text-white transition-all"
              >
                跳過拍照，直接測方位
              </button>
            </div>
          </>
        )}

        {/* ========== Step 2: 羅盤測量 ========== */}
        {step === 'compass' && (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🧭</div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                  測量{roomName}方位
                </span>
              </h1>
              <p className="text-purple-200/70">{getMeasureHint()}</p>
            </div>

            {/* 已拍照片預覽 */}
            {capturedPhoto && (
              <div className="w-32 h-24 rounded-xl overflow-hidden border-2 border-green-400/50 mb-4">
                <img src={capturedPhoto} alt="已拍照片" className="w-full h-full object-cover" />
              </div>
            )}

            {/* 授權狀態 */}
            {permissionState === 'pending' && (
              <div className="w-full max-w-sm mb-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-400">
                  <h3 className="text-lg font-bold text-center mb-3">📱 需要羅盤權限</h3>
                  <button
                    onClick={requestPermission}
                    className="w-full py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black"
                  >
                    🔓 點我授權羅盤
                  </button>
                </div>
              </div>
            )}

            {permissionState === 'denied' && (
              <div className="w-full max-w-sm mb-6">
                <div className="p-6 rounded-2xl bg-red-500/20 border border-red-400">
                  <h3 className="text-lg font-bold text-center text-red-300 mb-3">❌ 權限被拒絕</h3>
                  <p className="text-sm text-gray-300 text-center">請在瀏覽器設定中允許使用動態感測器</p>
                </div>
              </div>
            )}

            {/* 羅盤 */}
            {permissionState === 'granted' && (
              <>
                <div className="relative w-64 h-64 mb-4">
                  <svg viewBox="0 0 260 260" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                    <defs>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffd700" />
                        <stop offset="100%" stopColor="#ff8c00" />
                      </linearGradient>
                      <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#2a2a4a" />
                        <stop offset="100%" stopColor="#0a0a1a" />
                      </radialGradient>
                    </defs>
                    
                    <circle cx="130" cy="130" r="125" fill="url(#bgGrad)" stroke="url(#goldGrad)" strokeWidth="3" />
                    
                    {Array.from({ length: 72 }).map((_, i) => {
                      const angle = i * 5 * Math.PI / 180;
                      const isMajor = i % 6 === 0;
                      const outerR = 120;
                      const innerR = isMajor ? 100 : 110;
                      return (
                        <line
                          key={i}
                          x1={130 + outerR * Math.sin(angle)}
                          y1={130 - outerR * Math.cos(angle)}
                          x2={130 + innerR * Math.sin(angle)}
                          y2={130 - innerR * Math.cos(angle)}
                          stroke={isMajor ? 'rgba(255,215,0,0.8)' : 'rgba(255,215,0,0.3)'}
                          strokeWidth={isMajor ? 2 : 1}
                        />
                      );
                    })}
                    
                    <text x="130" y="35" textAnchor="middle" fill="#ef4444" fontSize="18" fontWeight="bold">北</text>
                    <text x="130" y="235" textAnchor="middle" fill="#ffd700" fontSize="18" fontWeight="bold">南</text>
                    <text x="230" y="135" textAnchor="middle" fill="#4ade80" fontSize="18" fontWeight="bold">東</text>
                    <text x="30" y="135" textAnchor="middle" fill="#60a5fa" fontSize="18" fontWeight="bold">西</text>
                  </svg>
                  
                  <div
                    className="absolute inset-0 transition-transform duration-200"
                    style={{ transform: `rotate(${currentHeading ?? 0}deg)` }}
                  >
                    <svg viewBox="0 0 260 260" className="w-full h-full">
                      <polygon points="130,30 125,130 135,130" fill="#ef4444" />
                      <polygon points="130,230 125,130 135,130" fill="#ffd700" />
                      <circle cx="130" cy="130" r="10" fill="url(#goldGrad)" />
                    </svg>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-amber-300">
                    {currentHeading !== null ? `${currentHeading}°` : '--°'}
                  </div>
                  <div className="text-xl text-green-400">{directionText}</div>
                </div>

                <button
                  onClick={confirmDirection}
                  disabled={currentHeading === null}
                  className="w-full max-w-sm py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 transition-all"
                >
                  ✓ 確認方位
                </button>
              </>
            )}
          </>
        )}

        {/* ========== Step 3: 確認儲存 ========== */}
        {step === 'confirm' && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
                  {roomName} 測量完成
                </span>
              </h1>
            </div>

            {/* 結果摘要 */}
            <div className="w-full max-w-sm p-6 rounded-2xl bg-green-500/20 border-2 border-green-400 mb-6">
              {capturedPhoto && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-4">
                  <img src={capturedPhoto} alt="房間照片" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-center">
                <p className="text-gray-400 mb-1">方位</p>
                <p className="text-3xl font-bold text-white">
                  {confirmedDegree}° · {getDirectionFromDegree(confirmedDegree!)}
                </p>
              </div>
            </div>

            {/* 按鈕 */}
            <div className="w-full max-w-sm space-y-3">
              <button
                onClick={saveAndReturn}
                className="w-full py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                儲存並返回 ✓
              </button>
              <button
                onClick={resetMeasurement}
                className="w-full py-3 text-gray-400 hover:text-white transition-all"
              >
                重新測量
              </button>
            </div>
          </>
        )}
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
