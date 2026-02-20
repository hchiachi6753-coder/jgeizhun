'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDirectionFromDegree } from '@/lib/fengshui';

export default function FengshuiCompassPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [permissionState, setPermissionState] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const [currentHeading, setCurrentHeading] = useState<number | null>(null);
  const [confirmedDegree, setConfirmedDegree] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // 檢查是否有輸入資料
    const input = sessionStorage.getItem('fengshui_input');
    if (!input) {
      router.push('/fengshui/input');
      return;
    }

    // 初始化羅盤
    initCompass();
  }, [router]);

  const initCompass = useCallback(() => {
    if (!window.DeviceOrientationEvent) {
      setPermissionState('unsupported');
      return;
    }

    // iOS 13+ 需要請求權限
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setPermissionState('pending');
    } else {
      // Android 或舊版 iOS
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
      
      // iOS uses webkitCompassHeading
      if ((event as any).webkitCompassHeading !== undefined) {
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android: alpha is 0-360 counter-clockwise from north
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

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any);
    };
  };

  const confirmDirection = () => {
    if (currentHeading !== null) {
      setConfirmedDegree(currentHeading);
    }
  };

  const proceedToResult = () => {
    if (confirmedDegree !== null) {
      sessionStorage.setItem('fengshui_degree', String(confirmedDegree));
      router.push('/fengshui/result');
    }
  };

  const resetConfirmation = () => {
    setConfirmedDegree(null);
  };

  const directionText = currentHeading !== null ? getDirectionFromDegree(currentHeading) : '--';

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white overflow-hidden relative">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(15)].map((_, i) => (
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
        
        <div className="absolute top-1/4 left-0 w-[400px] h-[250px] bg-purple-600/20 rounded-full blur-[100px] nebula-drift" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[200px] bg-indigo-500/15 rounded-full blur-[80px] nebula-drift-reverse" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] nebula-drift" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-20" />

      {/* 返回 */}
      <Link href="/fengshui/input" className="absolute top-6 left-6 z-20 text-purple-300/70 hover:text-amber-300 transition-colors flex items-center gap-2">
        <span className="text-xl">←</span>
        <span>返回</span>
      </Link>

      {/* 進度指示 */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 text-sm text-gray-400">
        <span className="w-8 h-8 rounded-full bg-green-500 text-white font-bold flex items-center justify-center">✓</span>
        <span className="w-6 h-[2px] bg-amber-500"></span>
        <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center">2</span>
        <span className="w-6 h-[2px] bg-gray-600"></span>
        <span className="w-8 h-8 rounded-full bg-gray-700 text-gray-400 font-bold flex items-center justify-center">3</span>
      </div>

      {/* 主內容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* 標題 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              🧭 測量大門朝向
            </span>
          </h1>
          <p className="text-purple-200/70">站在室內，將手機對準門外方向</p>
        </div>

        {/* 授權狀態 */}
        {permissionState === 'pending' && (
          <div className="w-full max-w-sm mb-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-400 animate-pulse-border">
              <h3 className="text-lg font-bold text-center mb-3">📱 需要羅盤權限</h3>
              <p className="text-sm text-gray-300 text-center mb-4">請授權使用手機羅盤功能</p>
              <button
                onClick={requestPermission}
                className="w-full py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 transition-all"
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

        {permissionState === 'unsupported' && (
          <div className="w-full max-w-sm mb-6">
            <div className="p-6 rounded-2xl bg-gray-500/20 border border-gray-400">
              <h3 className="text-lg font-bold text-center text-gray-300 mb-3">📵 不支援羅盤</h3>
              <p className="text-sm text-gray-400 text-center">此裝置不支援羅盤功能，請使用手機開啟此頁面</p>
            </div>
          </div>
        )}

        {/* 羅盤 */}
        {permissionState === 'granted' && (
          <>
            <div className="relative w-72 h-72 mb-6">
              {/* 羅盤 SVG */}
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
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                
                {/* 外圈 */}
                <circle cx="130" cy="130" r="125" fill="url(#bgGrad)" stroke="url(#goldGrad)" strokeWidth="3" />
                
                {/* 刻度 */}
                {Array.from({ length: 72 }).map((_, i) => {
                  const angle = i * 5 * Math.PI / 180;
                  const isMajor = i % 6 === 0;
                  const isMedium = i % 2 === 0;
                  const outerR = 120;
                  const innerR = isMajor ? 100 : (isMedium ? 108 : 113);
                  const x1 = 130 + outerR * Math.sin(angle);
                  const y1 = 130 - outerR * Math.cos(angle);
                  const x2 = 130 + innerR * Math.sin(angle);
                  const y2 = 130 - innerR * Math.cos(angle);
                  
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isMajor ? 'rgba(255,215,0,0.8)' : 'rgba(255,215,0,0.4)'}
                      strokeWidth={isMajor ? 2 : 1}
                    />
                  );
                })}
                
                {/* 主要方位文字 */}
                <text x="130" y="35" textAnchor="middle" fill="#ef4444" fontSize="18" fontWeight="bold" filter="url(#glow)">北</text>
                <text x="130" y="235" textAnchor="middle" fill="#ffd700" fontSize="18" fontWeight="bold">南</text>
                <text x="230" y="135" textAnchor="middle" fill="#4ade80" fontSize="18" fontWeight="bold">東</text>
                <text x="30" y="135" textAnchor="middle" fill="#60a5fa" fontSize="18" fontWeight="bold">西</text>
                
                {/* 次要方位 */}
                <text x="200" y="55" textAnchor="middle" fill="rgba(255,215,0,0.6)" fontSize="12">東北</text>
                <text x="200" y="215" textAnchor="middle" fill="rgba(255,215,0,0.6)" fontSize="12">東南</text>
                <text x="60" y="215" textAnchor="middle" fill="rgba(255,215,0,0.6)" fontSize="12">西南</text>
                <text x="60" y="55" textAnchor="middle" fill="rgba(255,215,0,0.6)" fontSize="12">西北</text>
                
                {/* 內圈 */}
                <circle cx="130" cy="130" r="60" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1" />
                <circle cx="130" cy="130" r="40" fill="none" stroke="rgba(255,215,0,0.2)" strokeWidth="1" />
              </svg>
              
              {/* 指針 (會旋轉) */}
              <div
                className="absolute inset-0 transition-transform duration-200 ease-out"
                style={{ transform: `rotate(${currentHeading ?? 0}deg)` }}
              >
                <svg viewBox="0 0 260 260" className="w-full h-full">
                  {/* 北針 (紅) */}
                  <polygon points="130,30 125,130 135,130" fill="#ef4444" filter="url(#glow)" />
                  {/* 南針 (金) */}
                  <polygon points="130,230 125,130 135,130" fill="#ffd700" />
                  {/* 中心點 */}
                  <circle cx="130" cy="130" r="12" fill="url(#goldGrad)" />
                  <circle cx="130" cy="130" r="6" fill="#1a1a2e" />
                </svg>
              </div>
            </div>

            {/* 度數顯示 */}
            <div className="text-center mb-6">
              <div className="text-5xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                {currentHeading !== null ? `${currentHeading}°` : '--°'}
              </div>
              <div className="text-2xl text-green-400 mt-1">{directionText}</div>
            </div>

            {/* 確認/結果區域 */}
            {confirmedDegree === null ? (
              <div className="w-full max-w-sm space-y-4">
                <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-400/20">
                  <p className="text-sm text-purple-200/70 text-center leading-relaxed">
                    <span className="text-amber-300 font-medium">🚪 測量說明</span><br />
                    站在<strong className="text-white">室內門口</strong>，將手機對準<strong className="text-white">門外方向</strong>，待度數穩定後點擊「確認方位」
                  </p>
                </div>
                
                <button
                  onClick={confirmDirection}
                  disabled={currentHeading === null}
                  className="w-full py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] active:scale-[0.98]"
                >
                  ✓ 確認方位
                </button>
              </div>
            ) : (
              <div className="w-full max-w-sm space-y-4">
                <div className="p-6 rounded-2xl bg-green-500/20 border-2 border-green-400">
                  <h3 className="text-lg font-bold text-center text-green-300 mb-2">✅ 方位已記錄</h3>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">{confirmedDegree}° · {getDirectionFromDegree(confirmedDegree)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={resetConfirmation}
                    className="flex-1 py-4 text-lg font-bold rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-all"
                  >
                    重新測量
                  </button>
                  <button
                    onClick={proceedToResult}
                    className="flex-1 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
                  >
                    查看結果 →
                  </button>
                </div>
              </div>
            )}
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
        
        @keyframes drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(80px) translateY(-20px); }
        }
        .nebula-drift {
          animation: drift 20s ease-in-out infinite;
        }
        
        @keyframes drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-60px) translateY(15px); }
        }
        .nebula-drift-reverse {
          animation: drift-reverse 25s ease-in-out infinite;
        }
        
        @keyframes pulse-border {
          0%, 100% { border-color: #f59e0b; box-shadow: 0 0 20px rgba(245,158,11,0.3); }
          50% { border-color: #ffd700; box-shadow: 0 0 30px rgba(255,215,0,0.5); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
