'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white overflow-hidden relative">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 星星閃爍 */}
        {mounted && [...Array(120)].map((_, i) => (
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
        
        {/* 流星 */}
        {mounted && [...Array(3)].map((_, i) => (
          <div
            key={`meteor-${i}`}
            className="absolute shooting-star"
            style={{
              left: 20 + i * 30 + '%',
              top: '0%',
              animationDelay: i * 4 + 's',
            }}
          />
        ))}
        
        {/* 漂浮光點 */}
        {mounted && [...Array(20)].map((_, i) => (
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
        
        {/* 飄動雲霧 */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[300px] bg-purple-600/20 rounded-full blur-[120px] nebula-drift" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[250px] bg-indigo-500/15 rounded-full blur-[100px] nebula-drift-reverse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] nebula-drift" style={{ animationDelay: '5s' }} />
        
        {/* 中心光暈 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" />
        
        {/* 底部雲霧 */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-purple-900/30 to-transparent" />
      </div>

      {/* 主內容 */}
      <div className="relative z-10">
        {/* 頂部裝飾線 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        {/* Hero 區域 */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          {/* 紫微星（北極星）*/}
          <div className="relative mb-8">
            <div className="w-36 h-36 relative animate-spin-slow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="50%" stopColor="#ffaa00" />
                    <stop offset="100%" stopColor="#ffd700" />
                  </linearGradient>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e9d5ff" />
                    <stop offset="50%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* 外圈裝飾 */}
                <circle cx="50" cy="50" r="46" fill="none" stroke="#ffd700" strokeWidth="1.5" opacity="1" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.7" />
                
                {/* 四方向長光芒 */}
                {[0, 90, 180, 270].map((angle, i) => (
                  <line
                    key={`long-${i}`}
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="8"
                    stroke="url(#starGradient)"
                    strokeWidth="2"
                    opacity="0.9"
                    transform={`rotate(${angle} 50 50)`}
                  />
                ))}
                
                {/* 斜向中光芒 */}
                {[45, 135, 225, 315].map((angle, i) => (
                  <line
                    key={`mid-${i}`}
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="18"
                    stroke="url(#starGradient)"
                    strokeWidth="1.5"
                    opacity="0.7"
                    transform={`rotate(${angle} 50 50)`}
                  />
                ))}
                
                {/* 中心紫微星 - 厚實五角星 */}
                <polygon 
                  points="50,18 58,38 80,38 63,52 70,75 50,62 30,75 37,52 20,38 42,38"
                  fill="url(#purpleGradient)"
                  stroke="#ffd700"
                  strokeWidth="1"
                  filter="url(#softGlow)"
                  className="animate-pulse"
                />
                
                {/* 中心亮點 */}
                <circle cx="50" cy="50" r="8" fill="white" opacity="0.95" className="animate-pulse" />
                <circle cx="50" cy="50" r="4" fill="#ffd700" />
              </svg>
            </div>
            {/* 淡淡的背景光暈 */}
            <div className="absolute inset-2 bg-purple-400/20 rounded-full blur-lg animate-pulse" />
          </div>

          {/* 標題 */}
          <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-wider">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]">
              J給準
            </span>
          </h1>
          
          {/* 副標題 */}
          <p className="text-xl md:text-2xl text-purple-200/80 mb-2 font-light tracking-widest">
            ✦ 八字命理 · 紫微斗數 ✦
          </p>
          <p className="text-base text-gray-400 mb-12 max-w-md">
            融合千年古籍智慧，以 AI 科技為您解讀命盤
          </p>

          {/* CTA 按鈕 - 三個並排 */}
          <div className="flex flex-col gap-4 items-center">
            {/* 上排：八字 + 紫微 */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <a href="/bazi" className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg font-medium text-lg text-black hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                <span className="relative z-10">🎴 探索先天格局</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity" />
              </a>
              <a href="/ziwei" className="px-8 py-4 border border-purple-400/50 rounded-lg font-medium text-lg text-purple-200 hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300">
                ⭐ 解讀星曜密碼
              </a>
            </div>
            
            {/* 下排：綜合排盤（主打） */}
            <a href="/comprehensive" className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-600 via-purple-600 to-amber-600 rounded-xl font-bold text-lg text-white border-2 border-amber-400/60 hover:border-amber-300 transition-all duration-300 hover:scale-105 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]">
              <span className="text-xl">☯️</span>
              <span>雙系統深度解命</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">推薦</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-purple-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity" />
            </a>
          </div>

          {/* 滾動提示 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-purple-400/50 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </section>

        {/* 特色區域 */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            {/* 標題 */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                千年智慧 · 現代詮釋
              </span>
            </h2>
            <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
              結合《窮通寶鑑》、《滴天髓》、《紫微斗數大全》等 18 部命理經典
            </p>

            {/* 特色卡片 */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📜',
                  title: '古籍為本',
                  desc: '融合 18 部命理經典，每一句分析皆有古籍依據，非 AI 空想臆測',
                  gradient: 'from-amber-400/40 to-orange-400/30',
                  border: 'border-amber-400/40',
                },
                {
                  icon: '⭐',
                  title: '雙盤合參',
                  desc: '八字論事件吉凶，紫微觀內心動機，易經點睛昇華，三者合一',
                  gradient: 'from-purple-400/40 to-pink-400/30',
                  border: 'border-purple-400/40',
                },
                {
                  icon: '🎯',
                  title: '精準調候',
                  desc: '依據出生月令診斷命局環境，開出專屬用神藥方，趨吉避凶',
                  gradient: 'from-cyan-400/40 to-blue-400/30',
                  border: 'border-cyan-400/40',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`relative group p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-md ${feature.border} hover:border-amber-300/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg hover:shadow-purple-500/20`}
                >
                  {/* 角落裝飾 */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/30 rounded-tl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400/30 rounded-br-2xl" />
                  
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-amber-300 mb-3">{feature.title}</h3>
                  <p className="text-gray-100 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 古籍引用區 */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-purple-900/20" />
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="text-6xl mb-8 opacity-50">📖</div>
            <blockquote className="text-2xl md:text-3xl font-light text-purple-100 mb-6 leading-relaxed">
              「氣若定，命自轉；<br />心若亂，運難通。」
            </blockquote>
            <p className="text-gray-400">— 神感派命理心法</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-500 mb-2">
              J給準 · 融合古籍智慧的 AI 命理平台
            </p>
            <p className="text-gray-600 text-sm">
              Made with ✨ by JJ & J1 🦞
            </p>
          </div>
        </footer>
      </div>

      {/* 自定義動畫 */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .star-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        @keyframes shooting {
          0% { 
            transform: translateX(0) translateY(0) rotate(45deg);
            opacity: 1;
          }
          100% { 
            transform: translateX(400px) translateY(400px) rotate(45deg);
            opacity: 0;
          }
        }
        .shooting-star {
          width: 100px;
          height: 2px;
          background: linear-gradient(to right, transparent, white, transparent);
          animation: shooting 2s ease-out infinite;
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
          50% { transform: translateX(100px) translateY(-30px); }
        }
        .nebula-drift {
          animation: drift 20s ease-in-out infinite;
        }
        
        @keyframes drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-80px) translateY(20px); }
        }
        .nebula-drift-reverse {
          animation: drift-reverse 25s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
