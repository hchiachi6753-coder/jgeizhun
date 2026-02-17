'use client';

import { useState } from 'react';
import { calculateZiwei, ZiweiResult, DI_ZHI } from '@/lib/ziwei';
import Link from 'next/link';

// 四化顏色
const siHuaColors: Record<string, string> = {
  '祿': 'text-green-400',
  '權': 'text-orange-400',
  '科': 'text-blue-400',
  '忌': 'text-red-400',
};

// 時辰選項
const SHI_CHEN = [
  { name: '子時', range: '23:00-01:00', hour: 23 },
  { name: '丑時', range: '01:00-03:00', hour: 1 },
  { name: '寅時', range: '03:00-05:00', hour: 3 },
  { name: '卯時', range: '05:00-07:00', hour: 5 },
  { name: '辰時', range: '07:00-09:00', hour: 7 },
  { name: '巳時', range: '09:00-11:00', hour: 9 },
  { name: '午時', range: '11:00-13:00', hour: 11 },
  { name: '未時', range: '13:00-15:00', hour: 13 },
  { name: '申時', range: '15:00-17:00', hour: 15 },
  { name: '酉時', range: '17:00-19:00', hour: 17 },
  { name: '戌時', range: '19:00-21:00', hour: 19 },
  { name: '亥時', range: '21:00-23:00', hour: 21 },
];

export default function ZiweiPage() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear() - 30,
    month: 1,
    day: 1,
    hour: 13,
    gender: 'male' as 'male' | 'female',
  });
  const [result, setResult] = useState<ZiweiResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const ziwei = calculateZiwei(
        formData.year,
        formData.month,
        formData.day,
        formData.hour,
        0,
        formData.gender
      );
      setResult(ziwei);
    } catch (err) {
      setError('計算失敗，請檢查輸入的日期是否正確');
      console.error(err);
    }
  };

  // 生成年份選項
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 命盤格子位置（按照傳統命盤排列）
  // 巳午未申
  // 辰    酉
  // 卯    戌
  // 寅丑子亥
  const gridPositions: Record<string, { row: number; col: number }> = {
    '寅': { row: 3, col: 0 },
    '卯': { row: 2, col: 0 },
    '辰': { row: 1, col: 0 },
    '巳': { row: 0, col: 0 },
    '午': { row: 0, col: 1 },
    '未': { row: 0, col: 2 },
    '申': { row: 0, col: 3 },
    '酉': { row: 1, col: 3 },
    '戌': { row: 2, col: 3 },
    '亥': { row: 3, col: 3 },
    '子': { row: 3, col: 2 },
    '丑': { row: 3, col: 1 },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      {/* 背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* 導航 */}
        <nav className="mb-8 flex gap-4">
          <Link href="/" className="text-purple-300 hover:text-purple-200 transition-colors">
            ← 返回首頁
          </Link>
          <Link href="/bazi" className="text-purple-300 hover:text-purple-200 transition-colors">
            八字排盤
          </Link>
        </nav>

        {/* 標題 */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              紫微斗數
            </span>
          </h1>
          <p className="text-purple-200/70">輸入出生資訊，排出紫微命盤</p>
        </header>

        {/* 輸入表單 */}
        <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 性別 */}
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">性別</label>
                <div className="flex gap-4">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: g as 'male' | 'female' })}
                      className={`flex-1 py-2 rounded-lg border transition-all ${
                        formData.gender === g
                          ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      {g === 'male' ? '👨 男' : '👩 女'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 年月日時 */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">年</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
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
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
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
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  {days.map((d) => (
                    <option key={d} value={d} className="bg-gray-900">{d}日</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">時辰</label>
                <select
                  value={formData.hour}
                  onChange={(e) => setFormData({ ...formData, hour: Number(e.target.value) })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                >
                  {SHI_CHEN.map((sc) => (
                    <option key={sc.hour} value={sc.hour} className="bg-gray-900">
                      {sc.name} ({sc.range})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold hover:from-purple-400 hover:to-pink-400 transition-all"
            >
              排盤
            </button>
          </form>
        </section>

        {/* 命盤結果 */}
        {result && (
          <section className="space-y-6">
            {/* 基本資訊 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-gray-400">
                農曆 {result.lunarYear}年{result.lunarMonth}月{result.lunarDay}日 {DI_ZHI[result.hour]}時
                <span className="mx-2">|</span>
                {result.yearGan}{result.yearZhi}年
                <span className="mx-2">|</span>
                <span className="text-purple-300">{result.wuXingJu}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                命宮：{result.mingGongZhi} | 身宮：{result.shenGongZhi}
              </p>
            </div>

            {/* 四化 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <h3 className="text-center text-gray-400 mb-3">四化</h3>
              <div className="flex justify-center gap-6 text-sm">
                <span><span className="text-green-400">祿</span>：{result.siHua.lu.star}</span>
                <span><span className="text-orange-400">權</span>：{result.siHua.quan.star}</span>
                <span><span className="text-blue-400">科</span>：{result.siHua.ke.star}</span>
                <span><span className="text-red-400">忌</span>：{result.siHua.ji.star}</span>
              </div>
            </div>

            {/* 命盤格子 */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 overflow-x-auto">
              <div className="grid grid-cols-4 gap-1 min-w-[600px]">
                {/* 按照傳統命盤排列 */}
                {[0, 1, 2, 3].map(row => (
                  [0, 1, 2, 3].map(col => {
                    // 中間兩格不顯示
                    if ((row === 1 || row === 2) && (col === 1 || col === 2)) {
                      if (row === 1 && col === 1) {
                        // 中央顯示命主資訊
                        return (
                          <div key={`${row}-${col}`} className="col-span-2 row-span-2 flex items-center justify-center bg-purple-900/20 rounded-lg border border-purple-500/30">
                            <div className="text-center p-4">
                              <p className="text-2xl font-bold text-purple-300 mb-2">紫微斗數</p>
                              <p className="text-sm text-gray-400">
                                {result.gender === 'male' ? '男' : '女'}命 · {result.wuXingJu}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                命宮在{result.mingGongZhi} · 身宮在{result.shenGongZhi}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }

                    // 找出這個位置對應的地支
                    const zhi = Object.entries(gridPositions).find(
                      ([, pos]) => pos.row === row && pos.col === col
                    )?.[0];
                    
                    if (!zhi) return null;
                    
                    const gong = result.gongs.find(g => g.zhi === zhi);
                    if (!gong) return null;

                    const isMingGong = gong.name === '命宮';
                    const isShenGong = result.shenGongZhi === zhi;

                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`p-2 rounded-lg border min-h-[120px] ${
                          isMingGong
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : isShenGong
                            ? 'bg-pink-500/20 border-pink-500/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {/* 宮位名稱 */}
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs ${isMingGong ? 'text-purple-300' : 'text-gray-500'}`}>
                            {gong.name}
                            {isShenGong && <span className="text-pink-400 ml-1">(身)</span>}
                          </span>
                          <span className="text-xs text-gray-600">{gong.gan}{gong.zhi}</span>
                        </div>
                        
                        {/* 主星 */}
                        <div className="space-y-0.5">
                          {gong.mainStars.map((star, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-sm font-medium text-amber-200">{star.name}</span>
                              {gong.siHua.map((hua, j) => {
                                const huaInfo = 
                                  result.siHua.lu.star === star.name && hua === '祿' ? '祿' :
                                  result.siHua.quan.star === star.name && hua === '權' ? '權' :
                                  result.siHua.ke.star === star.name && hua === '科' ? '科' :
                                  result.siHua.ji.star === star.name && hua === '忌' ? '忌' : null;
                                if (!huaInfo) return null;
                                return (
                                  <span key={j} className={`text-xs ${siHuaColors[huaInfo]}`}>
                                    {huaInfo}
                                  </span>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        
                        {/* 輔星 */}
                        {gong.assistStars.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {gong.assistStars.map((star, i) => (
                              <span key={i} className="text-xs text-gray-400">{star}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>

            {/* AI 分析按鈕 */}
            <div className="text-center">
              <button
                disabled
                className="px-8 py-3 bg-purple-500/30 rounded-lg font-bold text-purple-300 cursor-not-allowed"
              >
                🤖 AI 命理分析（即將推出）
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
