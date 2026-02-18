'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { shakeCoinOnce, getYaoValue, getYaoSymbol, isChangingYao, YAO_NAMES } from '@/lib/yijing';

interface YaoResult {
  coinResult: number;
  yaoValue: 6 | 7 | 8 | 9;
  yaoLine: string;
  isChanging: boolean;
  yaoName: string;
}

export default function ShakePage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [currentYao, setCurrentYao] = useState(0); // 0-5
  const [yaos, setYaos] = useState<YaoResult[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [coins, setCoins] = useState<boolean[]>([true, true, true]); // true=正面

  useEffect(() => {
    const q = sessionStorage.getItem('yijing_question');
    if (!q) {
      router.push('/yijing');
      return;
    }
    setQuestion(q);
  }, [router]);

  const shake = () => {
    if (isShaking || currentYao >= 6) return;
    
    setIsShaking(true);
    
    // 動畫：銅錢翻轉
    let flipCount = 0;
    const flipInterval = setInterval(() => {
      setCoins([
        Math.random() > 0.5,
        Math.random() > 0.5,
        Math.random() > 0.5,
      ]);
      flipCount++;
      if (flipCount >= 10) {
        clearInterval(flipInterval);
        
        // 最終結果
        const coinResult = shakeCoinOnce();
        const yaoValue = getYaoValue(coinResult);
        const finalCoins = Array(3).fill(false).map((_, i) => i < coinResult);
        // 打亂順序
        finalCoins.sort(() => Math.random() - 0.5);
        setCoins(finalCoins);
        
        const newYao: YaoResult = {
          coinResult,
          yaoValue,
          yaoLine: getYaoSymbol(yaoValue),
          isChanging: isChangingYao(yaoValue),
          yaoName: YAO_NAMES[currentYao],
        };
        
        setYaos(prev => [...prev, newYao]);
        setCurrentYao(prev => prev + 1);
        setIsShaking(false);
      }
    }, 100);
  };

  const goToResult = () => {
    // 存儲結果
    sessionStorage.setItem('yijing_yaos', JSON.stringify(yaos));
    router.push('/yijing/result');
  };

  const getYaoDescription = (yaoValue: number): string => {
    switch (yaoValue) {
      case 9: return '老陽（三正面）→ 動爻';
      case 8: return '少陰（二正面）';
      case 7: return '少陽（一正面）';
      case 6: return '老陰（零正面）→ 動爻';
      default: return '';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[300px] bg-emerald-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        {/* 問題 */}
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-2">占問</p>
          <p className="text-xl text-emerald-300">「{question}」</p>
        </div>

        {/* 進度 */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < currentYao
                  ? 'bg-emerald-500 text-white'
                  : i === currentYao
                  ? 'bg-emerald-500/50 text-white animate-pulse'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              {i < currentYao ? yaos[i]?.yaoLine : i + 1}
            </div>
          ))}
        </div>

        {/* 銅錢顯示 */}
        <div className="flex justify-center gap-6 mb-8">
          {coins.map((isHead, i) => (
            <div
              key={i}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold border-4 transition-all duration-100 ${
                isShaking ? 'animate-bounce' : ''
              } ${
                isHead
                  ? 'bg-amber-500 border-amber-400 text-amber-900'
                  : 'bg-gray-600 border-gray-500 text-gray-300'
              }`}
            >
              {isHead ? '字' : '花'}
            </div>
          ))}
        </div>

        {/* 搖卦按鈕 */}
        {currentYao < 6 ? (
          <button
            onClick={shake}
            disabled={isShaking}
            className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
              isShaking
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30'
            }`}
          >
            {isShaking ? '搖卦中...' : `搖第 ${currentYao + 1} 爻`}
          </button>
        ) : (
          <button
            onClick={goToResult}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 hover:scale-105"
          >
            查看卦象解析 →
          </button>
        )}

        {/* 已搖出的爻 */}
        {yaos.length > 0 && (
          <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-emerald-300 font-semibold mb-4">已搖出的爻</h3>
            <div className="space-y-2">
              {yaos.map((yao, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{yao.yaoName}</span>
                  <span className="text-2xl">{yao.yaoLine}</span>
                  <span className={yao.isChanging ? 'text-amber-400' : 'text-gray-500'}>
                    {getYaoDescription(yao.yaoValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 返回 */}
        <div className="text-center mt-8">
          <a href="/yijing" className="text-gray-500 hover:text-emerald-400 transition-colors">
            ← 重新開始
          </a>
        </div>
      </div>
    </main>
  );
}
