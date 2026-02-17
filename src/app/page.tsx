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
        {/* 星星 */}
        {mounted && [...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
        
        {/* 神秘光暈 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        
        {/* 雲霧效果 */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-purple-900/20 to-transparent" />
      </div>

      {/* 主內容 */}
      <div className="relative z-10">
        {/* 頂部裝飾線 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        {/* Hero 區域 */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          {/* 太極/八卦裝飾 */}
          <div className="relative mb-8">
            <div className="w-32 h-32 relative animate-spin-slow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* 外圈 */}
                <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldGradient)" strokeWidth="1" />
                {/* 八卦線條 */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="10"
                    x2="50"
                    y2="20"
                    stroke="url(#goldGradient)"
                    strokeWidth="2"
                    transform={`rotate(${angle} 50 50)`}
                  />
                ))}
                {/* 內圈太極 */}
                <circle cx="50" cy="50" r="25" fill="none" stroke="url(#goldGradient)" strokeWidth="1" />
                <path d="M50 25 A25 25 0 0 1 50 75 A12.5 12.5 0 0 1 50 50 A12.5 12.5 0 0 0 50 25" fill="rgba(255,215,0,0.3)" />
                <path d="M50 75 A25 25 0 0 1 50 25 A12.5 12.5 0 0 1 50 50 A12.5 12.5 0 0 0 50 75" fill="rgba(138,43,226,0.3)" />
                <circle cx="50" cy="37.5" r="4" fill="rgba(138,43,226,0.5)" />
                <circle cx="50" cy="62.5" r="4" fill="rgba(255,215,0,0.5)" />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="50%" stopColor="#ffaa00" />
                    <stop offset="100%" stopColor="#ffd700" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* 光暈 */}
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-pulse" />
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

          {/* CTA 按鈕 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/bazi" className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg font-medium text-lg text-black hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]">
              <span className="relative z-10">🎴 八字排盤</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg blur opacity-0 group-hover:opacity-50 transition-opacity" />
            </a>
            <button disabled className="px-8 py-4 border border-purple-400/30 rounded-lg font-medium text-lg text-purple-300/50 cursor-not-allowed">
              ⭐ 紫微斗數（即將推出）
            </button>
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
                  gradient: 'from-amber-500/20 to-orange-500/20',
                },
                {
                  icon: '⭐',
                  title: '雙盤合參',
                  desc: '八字論事件吉凶，紫微觀內心動機，易經點睛昇華，三者合一',
                  gradient: 'from-purple-500/20 to-pink-500/20',
                },
                {
                  icon: '🎯',
                  title: '精準調候',
                  desc: '依據出生月令診斷命局環境，開出專屬用神藥方，趨吉避凶',
                  gradient: 'from-blue-500/20 to-cyan-500/20',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`relative group p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/10 hover:border-amber-400/30 transition-all duration-500 hover:-translate-y-2`}
                >
                  {/* 角落裝飾 */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/30 rounded-tl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400/30 rounded-br-2xl" />
                  
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-amber-200 mb-3">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
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
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
      `}</style>
    </main>
  );
}
