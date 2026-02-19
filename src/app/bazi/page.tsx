'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { logUsage } from '@/lib/usage-logger';

const SHICHEN = [
  { value: '子', label: '子時 (23:00-01:00)' },
  { value: '丑', label: '丑時 (01:00-03:00)' },
  { value: '寅', label: '寅時 (03:00-05:00)' },
  { value: '卯', label: '卯時 (05:00-07:00)' },
  { value: '辰', label: '辰時 (07:00-09:00)' },
  { value: '巳', label: '巳時 (09:00-11:00)' },
  { value: '午', label: '午時 (11:00-13:00)' },
  { value: '未', label: '未時 (13:00-15:00)' },
  { value: '申', label: '申時 (15:00-17:00)' },
  { value: '酉', label: '酉時 (17:00-19:00)' },
  { value: '戌', label: '戌時 (19:00-21:00)' },
  { value: '亥', label: '亥時 (21:00-23:00)' },
];

export default function BaziPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    month: '',
    day: '',
    shichen: '',
    gender: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 記錄到 Google Sheet
    logUsage('八字', '填寫資料', undefined, formData);
    const params = new URLSearchParams(formData);
    router.push(`/bazi/result?${params.toString()}`);
  };

  const years = Array.from({ length: 91 }, (_, i) => 1940 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white overflow-hidden relative">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(100)].map((_, i) => (
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
        
        {mounted && [...Array(15)].map((_, i) => (
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
      <a href="/" className="absolute top-6 left-6 z-20 text-purple-300/70 hover:text-amber-300 transition-colors flex items-center gap-2">
        <span className="text-xl">←</span>
        <span>返回</span>
      </a>

      {/* 主內容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* 標題區 */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎴</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              八字排盤
            </span>
          </h1>
          <p className="text-purple-200/70 text-lg">請輸入您的出生資料</p>
        </div>

        {/* 表單卡片 */}
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-900/40 to-indigo-900/30 backdrop-blur-md border border-purple-400/30 shadow-2xl shadow-purple-500/10">
            {/* 角落裝飾 */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-3xl" />

            <div className="space-y-6">
              {/* 姓名 */}
              <div>
                <label className="block text-amber-300 text-lg font-medium mb-3">👤 稱呼</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="怎麼稱呼您？"
                  required
                  className="w-full px-4 py-4 text-lg bg-purple-950/50 border border-purple-400/30 rounded-xl text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
              </div>

              {/* 出生年月日 - 橫排 */}
              <div>
                <label className="block text-amber-300 text-lg font-medium mb-3">📅 出生日期</label>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                    className="w-full px-4 py-4 text-lg bg-purple-950/50 border border-purple-400/30 rounded-xl text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">年</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                    className="w-full px-4 py-4 text-lg bg-purple-950/50 border border-purple-400/30 rounded-xl text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">月</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m} 月</option>
                    ))}
                  </select>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    required
                    className="w-full px-4 py-4 text-lg bg-purple-950/50 border border-purple-400/30 rounded-xl text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">日</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d} 日</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 出生時辰 */}
              <div>
                <label className="block text-amber-300 text-lg font-medium mb-3">🕐 出生時辰</label>
                <select
                  value={formData.shichen}
                  onChange={(e) => setFormData({ ...formData, shichen: e.target.value })}
                  required
                  className="w-full px-4 py-4 text-lg bg-purple-950/50 border border-purple-400/30 rounded-xl text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">請選擇時辰</option>
                  {SHICHEN.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* 性別 */}
              <div>
                <label className="block text-amber-300 text-lg font-medium mb-3">👤 性別</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                    className={`py-4 text-xl rounded-xl border-2 transition-all duration-300 ${
                      formData.gender === 'male'
                        ? 'bg-gradient-to-r from-blue-600/50 to-indigo-600/50 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-purple-950/30 border-purple-400/30 text-purple-200 hover:border-purple-400/50'
                    }`}
                  >
                    ♂ 男
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                    className={`py-4 text-xl rounded-xl border-2 transition-all duration-300 ${
                      formData.gender === 'female'
                        ? 'bg-gradient-to-r from-pink-600/50 to-rose-600/50 border-pink-400 text-white shadow-lg shadow-pink-500/20'
                        : 'bg-purple-950/30 border-purple-400/30 text-purple-200 hover:border-purple-400/50'
                    }`}
                  >
                    ♀ 女
                  </button>
                </div>
              </div>

              {/* 提交按鈕 */}
              <button
                type="submit"
                disabled={!formData.year || !formData.month || !formData.day || !formData.shichen || !formData.gender}
                className="w-full mt-4 py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] active:scale-[0.98]"
              >
                ✨ 開始排盤
              </button>
            </div>
          </div>
        </form>

        {/* 底部提示 */}
        <p className="mt-8 text-gray-500 text-sm text-center max-w-sm">
          八字命理基於《窮通寶鑑》、《滴天髓》等經典，<br />
          分析您的先天命格與大運流年。
        </p>
      </div>

      <style jsx>{`
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
