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

// 古銅錢組件
function AncientCoin({ isHead, isShaking }: { isHead: boolean; isShaking: boolean }) {
  return (
    <div className={`relative ${isShaking ? 'animate-coin-flip' : ''}`}>
      {/* 外圈光暈 */}
      <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-md" />
      
      {/* 銅錢本體 */}
      <div
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200
          ${isHead 
            ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600' 
            : 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900'
          }
          border-4 ${isHead ? 'border-amber-300' : 'border-amber-600'}
          shadow-lg shadow-amber-900/50
        `}
        style={{
          backgroundImage: isHead 
            ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)'
            : 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
      >
        {/* 外圈紋理 */}
        <div className="absolute inset-1 rounded-full border-2 border-amber-600/30" />
        
        {/* 中間方孔 */}
        <div className={`
          w-6 h-6 rounded-sm flex items-center justify-center
          ${isHead 
            ? 'bg-gradient-to-br from-amber-900 to-amber-950 border-2 border-amber-700' 
            : 'bg-gradient-to-br from-amber-950 to-black border-2 border-amber-800'
          }
        `}>
          {/* 方孔內的字 */}
          <span className={`text-xs font-bold ${isHead ? 'text-amber-400' : 'text-amber-600'}`}>
            {isHead ? '錢' : '花'}
          </span>
        </div>
        
        {/* 四個角的裝飾紋（正面才有） */}
        {isHead && (
          <>
            <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-amber-800/80">乾</span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-amber-800/80">坤</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-800/80">陰</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-800/80">陽</span>
          </>
        )}
      </div>
    </div>
  );
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
      if (flipCount >= 12) {
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
    }, 80);
  };

  const goToResult = () => {
    // 存儲結果
    sessionStorage.setItem('yijing_yaos', JSON.stringify(yaos));
    router.push('/yijing/result');
  };

  const getYaoDescription = (yaoValue: number): string => {
    switch (yaoValue) {
      case 9: return '老陽 → 動爻';
      case 8: return '少陰';
      case 7: return '少陽';
      case 6: return '老陰 → 動爻';
      default: return '';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[300px] bg-amber-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        {/* 問題 */}
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-2">占問</p>
          <p className="text-xl text-amber-300">「{question}」</p>
        </div>

        {/* 進度 */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < currentYao
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                  : i === currentYao
                  ? 'bg-amber-500/50 text-white animate-pulse border-2 border-amber-400'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              {i < currentYao ? yaos[i]?.yaoLine : i + 1}
            </div>
          ))}
        </div>

        {/* 銅錢顯示 */}
        <div className="flex justify-center gap-6 mb-10">
          {coins.map((isHead, i) => (
            <AncientCoin key={i} isHead={isHead} isShaking={isShaking} />
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
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30'
            }`}
          >
            {isShaking ? '搖卦中...' : `搖第 ${currentYao + 1} 爻`}
          </button>
        ) : (
          <button
            onClick={goToResult}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-bold text-xl hover:from-amber-400 hover:to-orange-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30"
          >
            查看卦象解析 →
          </button>
        )}

        {/* 已搖出的爻 */}
        {yaos.length > 0 && (
          <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20">
            <h3 className="text-amber-300 font-semibold mb-4">已搖出的爻</h3>
            <div className="space-y-3">
              {yaos.map((yao, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-amber-900/20 rounded-lg px-4 py-2">
                  <span className="text-amber-200/70 w-16">{yao.yaoName}</span>
                  <span className="text-3xl">{yao.yaoLine}</span>
                  <span className={`text-right w-28 ${yao.isChanging ? 'text-orange-400 font-semibold' : 'text-gray-500'}`}>
                    {getYaoDescription(yao.yaoValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 返回 */}
        <div className="text-center mt-8">
          <a href="/yijing" className="text-gray-500 hover:text-amber-400 transition-colors">
            ← 重新開始
          </a>
        </div>
      </div>

      {/* 銅錢翻轉動畫 */}
      <style jsx global>{`
        @keyframes coin-flip {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
          25% { transform: rotateY(180deg) rotateX(15deg); }
          50% { transform: rotateY(360deg) rotateX(0deg); }
          75% { transform: rotateY(540deg) rotateX(-15deg); }
        }
        .animate-coin-flip {
          animation: coin-flip 0.3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
