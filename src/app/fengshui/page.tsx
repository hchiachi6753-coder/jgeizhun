'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FengshuiPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        
        {mounted && [...Array(5)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full floating-particle"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              bottom: '-10px',
              background: i % 2 === 0 ? 'rgba(196, 181, 253, 0.6)' : 'rgba(255, 215, 0, 0.5)',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: Math.random() * 10 + 15 + 's',
            }}
          />
        ))}
        
        <div className="absolute top-1/4 left-0 w-[400px] h-[250px] bg-purple-600/20 rounded-full blur-[100px] nebula-drift" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[200px] bg-indigo-500/15 rounded-full blur-[80px] nebula-drift-reverse" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] nebula-drift" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-20" />

      {/* 返回首頁 */}
      <Link href="/" className="absolute top-6 left-6 z-20 text-purple-300/70 hover:text-amber-300 transition-colors flex items-center gap-2">
        <span className="text-xl">←</span>
        <span>返回</span>
      </Link>

      {/* 主內容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* 八卦羅盤圖示 */}
        <div className="relative mb-8">
          <div className="w-40 h-40 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
              <defs>
                <linearGradient id="guaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="50%" stopColor="#ff8c00" />
                  <stop offset="100%" stopColor="#ffd700" />
                </linearGradient>
              </defs>
              
              {/* 外圈 */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="url(#guaGold)" strokeWidth="2" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,215,0,0.5)" strokeWidth="1" />
              
              {/* 八卦符號 - 簡化版 */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <g key={i} transform={`rotate(${angle} 50 50)`}>
                  <line x1="50" y1="8" x2="50" y2="18" stroke="#ffd700" strokeWidth="2" />
                  {i % 2 === 0 && (
                    <>
                      <line x1="46" y1="13" x2="50" y2="13" stroke="#ffd700" strokeWidth="2" />
                      <line x1="50" y1="13" x2="54" y2="13" stroke="#ffd700" strokeWidth="2" />
                    </>
                  )}
                </g>
              ))}
              
              {/* 太極圖 */}
              <circle cx="50" cy="50" r="20" fill="none" stroke="#ffd700" strokeWidth="1.5" />
              <path d="M 50 30 A 10 10 0 0 1 50 50 A 10 10 0 0 0 50 70 A 20 20 0 0 1 50 30" fill="#ffd700" />
              <path d="M 50 30 A 10 10 0 0 0 50 50 A 10 10 0 0 1 50 70 A 20 20 0 0 0 50 30" fill="rgba(30,30,60,0.8)" />
              <circle cx="50" cy="40" r="3" fill="rgba(30,30,60,0.8)" />
              <circle cx="50" cy="60" r="3" fill="#ffd700" />
            </svg>
          </div>
          {/* 背景光暈 */}
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
        </div>

        {/* 標題 */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
            居家風水
          </span>
        </h1>
        
        <p className="text-xl text-purple-200/80 mb-2 text-center">
          ✦ 八宅派 · 宅命分析 ✦
        </p>
        
        <p className="text-gray-400 mb-10 max-w-md text-center">
          根據您的命卦與房屋坐向，<br />
          分析八方位吉凶，提供擺設建議
        </p>

        {/* 功能說明卡片 */}
        <div className="w-full max-w-md mb-10 space-y-4">
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/30 backdrop-blur-md border border-purple-400/30">
            {/* 角落裝飾 */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/40 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400/40 rounded-br-2xl" />
            
            <h3 className="text-amber-300 text-lg font-bold mb-4">🔮 分析內容</h3>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start gap-3">
                <span className="text-amber-400">☯</span>
                <span>計算您的<strong className="text-purple-300">命卦</strong>（東四命/西四命）</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">🏠</span>
                <span>判定房屋<strong className="text-purple-300">宅卦</strong>（根據大門朝向）</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">📐</span>
                <span>分析<strong className="text-purple-300">八方位吉凶</strong>（生氣、天醫、五鬼...）</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">✨</span>
                <span>提供各方位<strong className="text-purple-300">擺設建議</strong></span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30">
            <p className="text-amber-200/80 text-sm text-center">
              💡 需使用手機羅盤功能測量大門朝向
            </p>
          </div>
        </div>

        {/* 開始按鈕 */}
        <Link
          href="/fengshui/input"
          className="px-12 py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] active:scale-95"
        >
          🧭 開始分析
        </Link>
        
        {/* 底部提示 */}
        <p className="mt-8 text-gray-500 text-sm text-center max-w-sm">
          基於八宅派風水理論，<br />
          融合《八宅明鏡》等經典智慧
        </p>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .star-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        @keyframes float-up {
          0% { 
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { 
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        .floating-particle {
          animation: float-up 20s ease-in-out infinite;
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
      `}</style>
    </main>
  );
}
