'use client';

import { useState } from 'react';
import { calculateBazi, BaziResult, SHI_CHEN } from '@/lib/bazi';
import Link from 'next/link';

// 五行顏色
const wuXingColors: Record<string, string> = {
  '木': 'text-green-400',
  '火': 'text-red-400',
  '土': 'text-yellow-500',
  '金': 'text-gray-300',
  '水': 'text-blue-400',
};

// 五行背景
const wuXingBg: Record<string, string> = {
  '木': 'bg-green-500/20 border-green-500/50',
  '火': 'bg-red-500/20 border-red-500/50',
  '土': 'bg-yellow-500/20 border-yellow-500/50',
  '金': 'bg-gray-500/20 border-gray-500/50',
  '水': 'bg-blue-500/20 border-blue-500/50',
};

export default function BaziPage() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    gender: 'male' as 'male' | 'female',
  });
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const bazi = calculateBazi(
        formData.year,
        formData.month,
        formData.day,
        formData.hour,
        formData.minute,
        formData.gender
      );
      setResult(bazi);
    } catch (err) {
      setError('計算失敗，請檢查輸入的日期是否正確');
      console.error(err);
    }
  };

  // 生成年份選項 (1900-2100)
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i);
  // 生成日期選項
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* 導航 */}
        <nav className="mb-8">
          <Link href="/" className="text-purple-300 hover:text-purple-200 transition-colors">
            ← 返回首頁
          </Link>
        </nav>

        {/* 標題 */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
              八字排盤
            </span>
          </h1>
          <p className="text-purple-200/70">輸入您的出生資訊，立即排出八字命盤</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 輸入表單 */}
          <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-amber-200 mb-6">📅 出生資訊</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 性別 */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">性別</label>
                <div className="flex gap-4">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g as 'male' | 'female' })}
                      className={`flex-1 py-3 rounded-lg border transition-all ${
                        formData.gender === g
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {g === 'male' ? '👨 男' : '👩 女'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 年月日 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">年</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-gray-900">{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">月</label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m} className="bg-gray-900">{m}月</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">日</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: Number(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    {days.map((d) => (
                      <option key={d} value={d} className="bg-gray-900">{d}日</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 時辰 */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">時辰</label>
                <select
                  value={formData.hour}
                  onChange={(e) => setFormData({ ...formData, hour: Number(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-amber-500"
                >
                  {SHI_CHEN.map((sc, i) => {
                    const hourValue = i === 0 ? 23 : i * 2 - 1;
                    return (
                      <option key={i} value={hourValue} className="bg-gray-900">
                        {sc.name} ({sc.range})
                      </option>
                    );
                  })}
                </select>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]"
              >
                排盤
              </button>
            </form>
          </section>

          {/* 結果顯示 */}
          <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-amber-200 mb-6">🎴 命盤</h2>
            
            {!result ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-6xl mb-4">🔮</p>
                <p>請輸入出生資訊後點擊「排盤」</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 農曆資訊 */}
                <div className="text-center text-sm text-gray-400 mb-4">
                  農曆 {result.lunarInfo.year}年{result.lunarInfo.month}月{result.lunarInfo.day}日
                  <span className="ml-2 text-purple-300">（{result.jieQi}）</span>
                </div>

                {/* 四柱 */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '時柱', pillar: result.hourPillar, shiShen: result.hourShiShen, cangGan: result.hourCangGan },
                    { label: '日柱', pillar: result.dayPillar, shiShen: '日主', cangGan: result.dayCangGan },
                    { label: '月柱', pillar: result.monthPillar, shiShen: result.monthShiShen, cangGan: result.monthCangGan },
                    { label: '年柱', pillar: result.yearPillar, shiShen: result.yearShiShen, cangGan: result.yearCangGan },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-gray-500 mb-2">{item.label}</div>
                      <div className={`text-xs mb-1 ${item.shiShen === '日主' ? 'text-amber-400' : 'text-purple-300'}`}>
                        {item.shiShen}
                      </div>
                      <div className={`border rounded-lg p-3 ${wuXingBg[item.pillar.ganWuXing]}`}>
                        <div className={`text-2xl font-bold ${wuXingColors[item.pillar.ganWuXing]}`}>
                          {item.pillar.gan}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{item.pillar.ganWuXing}</div>
                      </div>
                      <div className={`border rounded-lg p-3 mt-1 ${wuXingBg[item.pillar.zhiWuXing]}`}>
                        <div className={`text-2xl font-bold ${wuXingColors[item.pillar.zhiWuXing]}`}>
                          {item.pillar.zhi}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{item.pillar.zhiWuXing}</div>
                      </div>
                      {/* 藏干 */}
                      <div className="mt-2 text-xs space-y-1">
                        {item.cangGan.map((cg, j) => (
                          <div key={j} className="text-gray-400">
                            <span className={wuXingColors[cg.gan === '甲' || cg.gan === '乙' ? '木' : cg.gan === '丙' || cg.gan === '丁' ? '火' : cg.gan === '戊' || cg.gan === '己' ? '土' : cg.gan === '庚' || cg.gan === '辛' ? '金' : '水']}>
                              {cg.gan}
                            </span>
                            <span className="text-gray-500 ml-1">{cg.shiShen}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 大運 */}
                <div className="mt-8">
                  <h3 className="text-sm text-gray-400 mb-3">大運（{result.gender === 'male' ? '男' : '女'}命）</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {result.daYun.map((dy, i) => (
                      <div key={i} className="flex-shrink-0 text-center">
                        <div className="text-xs text-gray-500 mb-1">{dy.startAge}歲</div>
                        <div className={`px-3 py-2 rounded-lg border ${wuXingBg[dy.wuXing]}`}>
                          <span className={wuXingColors[dy.wuXing]}>{dy.ganZhi}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI 分析按鈕 */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    disabled
                    className="w-full py-4 bg-purple-500/30 rounded-lg font-bold text-purple-300 cursor-not-allowed"
                  >
                    🤖 AI 命理分析（即將推出）
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    將根據古籍知識庫為您深度解讀命盤
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
