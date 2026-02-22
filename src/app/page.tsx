'use client';

import { useState, useEffect } from 'react';
import { siteConfig } from "@/config/site";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a14] via-[#12121f] to-[#0a0a14] text-white overflow-hidden relative">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 星星閃爍 */}
        {mounted && [...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white star-twinkle"
            style={{
              width: Math.random() * 2.5 + 0.5 + 'px',
              height: Math.random() * 2.5 + 0.5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
        
        {/* 漂浮金色光點 */}
        {mounted && [...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full floating-particle"
            style={{
              width: Math.random() * 3 + 2 + 'px',
              height: Math.random() * 3 + 2 + 'px',
              left: Math.random() * 100 + '%',
              bottom: '-10px',
              background: 'rgba(201, 169, 97, 0.6)',
              animationDelay: Math.random() * 10 + 's',
              animationDuration: Math.random() * 10 + 15 + 's',
            }}
          />
        ))}
        
        {/* 飄動雲霧 - 金色調 */}
        <div className="absolute top-1/4 left-0 w-[500px] h-[300px] bg-amber-900/15 rounded-full blur-[120px] nebula-drift" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[250px] bg-amber-800/10 rounded-full blur-[100px] nebula-drift-reverse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[128px] nebula-drift" style={{ animationDelay: '5s' }} />
        
        {/* 中心光暈 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[150px] animate-pulse" />
        
        {/* 底部雲霧 */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#0a0a14]/80 to-transparent" />
      </div>

      {/* 主內容 */}
      <div className="relative z-10">
        {/* 頂部裝飾線 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A961]/50 to-transparent" />

        {/* Hero 區域 */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          {/* 紫微星（北極星）*/}
          <div className="relative mb-8">
            <div className="w-36 h-36 relative animate-spin-slow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F0D78C" />
                    <stop offset="50%" stopColor="#C9A961" />
                    <stop offset="100%" stopColor="#F0D78C" />
                  </linearGradient>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F0D78C" />
                    <stop offset="50%" stopColor="#C9A961" />
                    <stop offset="100%" stopColor="#A68B4B" />
                  </linearGradient>
                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* 外圈裝飾 */}
                <circle cx="50" cy="50" r="46" fill="none" stroke="#C9A961" strokeWidth="1.5" opacity="1" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#C9A961" strokeWidth="1" opacity="0.6" />
                
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
                
                {/* 中心星 - 金色五角星 */}
                <polygon 
                  points="50,18 58,38 80,38 63,52 70,75 50,62 30,75 37,52 20,38 42,38"
                  fill="url(#goldGradient)"
                  stroke="#F0D78C"
                  strokeWidth="1"
                  filter="url(#softGlow)"
                  className="animate-pulse"
                />
                
                {/* 中心亮點 */}
                <circle cx="50" cy="50" r="8" fill="white" opacity="0.95" className="animate-pulse" />
                <circle cx="50" cy="50" r="4" fill="#C9A961" />
              </svg>
            </div>
            {/* 淡淡的背景光暈 */}
            <div className="absolute inset-2 bg-[#C9A961]/20 rounded-full blur-lg animate-pulse" />
          </div>

          {/* 標題 - 從設定檔讀取 */}
          <h1 className="text-7xl md:text-9xl font-bold mb-4 tracking-wider">
            <span className="bg-gradient-to-r from-[#F0D78C] via-[#C9A961] to-[#F0D78C] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(201,169,97,0.5)] animate-shimmer bg-[length:200%_100%]">
              {siteConfig.name}
            </span>
          </h1>
          
          {/* 副標題 - 從設定檔讀取 */}
          <p className="text-xl md:text-2xl text-[#C9A961]/80 mb-2 font-light tracking-widest">
            {siteConfig.hero.subtitle}
          </p>
          <p className="text-base text-gray-400 mb-12 max-w-md">
            {siteConfig.hero.slogan}
          </p>

          {/* CTA 按鈕 */}
          <div className="flex flex-col gap-5 items-center">
            {/* 最上面：綜合排盤（主打） */}
            <a href="/comprehensive" className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-[#A68B4B] via-[#C9A961] to-[#A68B4B] rounded-2xl font-bold text-2xl text-[#0a0a14] border-2 border-[#C9A961]/60 hover:border-[#F0D78C] transition-all duration-300 hover:scale-105 animate-glow-pulse">
              <span className="text-3xl animate-spin-slow">☯️</span>
              <span>八字+紫微 綜合解命</span>
              <span className="text-sm bg-white/30 px-3 py-1 rounded-full animate-bounce">推薦</span>
            </a>
            
            {/* 中間：八字 + 紫微 */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <a href="/bazi" className="px-10 py-5 animate-gradient-gold rounded-xl font-bold text-xl text-[#0a0a14] border-2 border-[#C9A961]/50 hover:border-[#F0D78C] transition-all duration-300 hover:scale-105">
                🎴 八字命理
              </a>
              <a href="/ziwei" className="px-10 py-5 bg-gradient-to-r from-[#A68B4B] to-[#C9A961] rounded-xl font-bold text-xl text-[#0a0a14] border-2 border-[#C9A961]/50 hover:border-[#F0D78C] transition-all duration-300 hover:scale-105">
                ⭐ 紫微斗數
              </a>
            </div>
            
            {/* 易經占卜 */}
            <a href="/yijing" className="px-10 py-5 bg-gradient-to-r from-[#A68B4B] to-[#C9A961] rounded-xl font-bold text-xl text-[#0a0a14] border-2 border-[#C9A961]/50 hover:border-[#F0D78C] transition-all duration-300 hover:scale-105">
              ☰ 易經占卜
            </a>
            
            {/* 居家風水 */}
            <a href="/fengshui" className="px-10 py-5 bg-gradient-to-r from-[#A68B4B]/80 to-[#C9A961]/80 rounded-xl font-bold text-xl text-white border-2 border-[#C9A961]/50 hover:border-[#F0D78C] transition-all duration-300 hover:scale-105">
              🧭 居家風水
            </a>
          </div>

        </section>

        {/* 特色區域 */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            {/* 標題 - 從設定檔讀取 */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-[#F0D78C] to-[#C9A961] bg-clip-text text-transparent">
                {siteConfig.features.title}
              </span>
            </h2>
            <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
              {siteConfig.features.subtitle}
            </p>

            {/* 特色卡片 */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📜',
                  title: '古籍為本',
                  desc: '融合 18 部命理經典，每一句分析皆有古籍依據，非 AI 空想臆測',
                  gradient: 'from-[#C9A961]/20 to-[#A68B4B]/10',
                  border: 'border-[#C9A961]/30',
                },
                {
                  icon: '⭐',
                  title: '雙盤合參',
                  desc: '八字論事件吉凶，紫微觀內心動機，易經點睛昇華，三者合一',
                  gradient: 'from-[#C9A961]/25 to-[#A68B4B]/15',
                  border: 'border-[#C9A961]/35',
                },
                {
                  icon: '🎯',
                  title: '精準調候',
                  desc: '依據出生月令診斷命局環境，開出專屬用神藥方，趨吉避凶',
                  gradient: 'from-cyan-400/20 to-blue-400/10',
                  border: 'border-cyan-400/30',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`relative group p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-md border ${feature.border} hover:border-[#C9A961]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-lg hover:shadow-[#C9A961]/10`}
                >
                  {/* 角落裝飾 */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A961]/30 rounded-tl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A961]/30 rounded-br-2xl" />
                  
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-[#F0D78C] mb-3">{feature.title}</h3>
                  <p className="text-gray-100 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 古籍引用區 - 從設定檔讀取 */}
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#C9A961]/5 via-transparent to-[#C9A961]/5" />
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="text-6xl mb-8 opacity-50">📖</div>
            <blockquote className="text-2xl md:text-3xl font-light text-[#F0D78C]/90 mb-6 leading-relaxed">
              「{siteConfig.quote.text.split('；').join('；')}<br />{siteConfig.quote.text.includes('；') ? '' : siteConfig.quote.text}」
            </blockquote>
            <p className="text-gray-400">— {siteConfig.quote.source}</p>
          </div>
        </section>

        {/* Footer - 從設定檔讀取 */}
        <footer className="py-12 border-t border-[#C9A961]/10">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-500 mb-2">
              {siteConfig.footer.text}
            </p>
            <p className="text-gray-600 text-sm">
              {siteConfig.footer.credit}
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
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .star-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        @keyframes float-up {
          0% { 
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
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
          animation: drift 25s ease-in-out infinite;
        }
        
        @keyframes drift-reverse {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-60px) translateY(15px); }
        }
        .nebula-drift-reverse {
          animation: drift-reverse 30s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
