'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FengshuiInputPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    month: '',
    day: '',
    gender: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 將資料存到 sessionStorage
    sessionStorage.setItem('fengshui_input', JSON.stringify(formData));
    // 清除舊的房間資料，開始新的巡禮
    sessionStorage.removeItem('fengshui_rooms');
    router.push('/fengshui/tour');
  };

  const years = Array.from({ length: 91 }, (_, i) => 1940 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent z-20" />

      {/* 返回 */}
      <Link href="/fengshui" className="absolute top-6 left-6 z-20 text-purple-300/70 hover:text-amber-300 transition-colors flex items-center gap-2">
        <span className="text-xl">←</span>
        <span>返回</span>
      </Link>

      {/* 進度指示 */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 text-sm text-gray-400">
        <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center">1</span>
        <span className="w-6 h-[2px] bg-gray-600"></span>
        <span className="w-8 h-8 rounded-full bg-gray-700 text-gray-400 font-bold flex items-center justify-center">2</span>
        <span className="w-6 h-[2px] bg-gray-600"></span>
        <span className="w-8 h-8 rounded-full bg-gray-700 text-gray-400 font-bold flex items-center justify-center">3</span>
      </div>

      {/* 主內容 */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* 標題區 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📅</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              輸入出生資料
            </span>
          </h1>
          <p className="text-purple-200/70">計算您的命卦</p>
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
              {/* 出生年月日 */}
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

              {/* 說明 */}
              <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-400/20">
                <p className="text-sm text-purple-200/70 leading-relaxed">
                  <span className="text-amber-300 font-medium">💡 為什麼需要這些資訊？</span><br />
                  八宅派風水根據出生年份和性別計算「命卦」，用以判定您屬於<strong className="text-purple-300">東四命</strong>或<strong className="text-purple-300">西四命</strong>，進而分析最適合的居住方位。
                </p>
              </div>

              {/* 提交按鈕 */}
              <button
                type="submit"
                disabled={!formData.year || !formData.month || !formData.day || !formData.gender}
                className="w-full mt-4 py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] active:scale-[0.98]"
              >
                下一步：測量方位 →
              </button>
            </div>
          </div>
        </form>
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
      `}</style>
    </main>
  );
}
