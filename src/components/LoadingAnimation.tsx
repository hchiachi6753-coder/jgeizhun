'use client';

import { useState, useEffect } from 'react';

interface LoadingAnimationProps {
  type: 'bazi' | 'ziwei' | 'yijing' | 'comprehensive';
}

const STEPS = {
  bazi: [
    { icon: '📜', text: '解析八字命盤...' },
    { icon: '🔍', text: '查閱《子平真詮》...' },
    { icon: '📚', text: '參考《窮通寶鑑》...' },
    { icon: '⚖️', text: '分析五行生剋...' },
    { icon: '✨', text: '生成命理報告...' },
  ],
  ziwei: [
    { icon: '⭐', text: '排列紫微命盤...' },
    { icon: '🔍', text: '查閱《紫微斗數全書》...' },
    { icon: '🌟', text: '分析十四主星...' },
    { icon: '🔮', text: '解讀四化飛星...' },
    { icon: '✨', text: '生成命理報告...' },
  ],
  yijing: [
    { icon: '☰', text: '解析卦象...' },
    { icon: '📖', text: '查閱《易經》原文...' },
    { icon: '🔍', text: '參考《易經雜說》...' },
    { icon: '🎯', text: '分析動爻變化...' },
    { icon: '✨', text: '生成解卦報告...' },
  ],
  comprehensive: [
    { icon: '🎴', text: '解析八字四柱...' },
    { icon: '⭐', text: '排列紫微命盤...' },
    { icon: '📚', text: '查閱古籍典藏...' },
    { icon: '🔗', text: '雙盤交叉比對...' },
    { icon: '✨', text: '生成綜合報告...' },
  ],
};

const BAGUA = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

export default function LoadingAnimation({ type }: LoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [baguaIndex, setBaguaIndex] = useState(0);
  const steps = STEPS[type];

  useEffect(() => {
    // 每 3 秒換一個步驟
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    // 每 500ms 換一個八卦符號
    const baguaInterval = setInterval(() => {
      setBaguaIndex((prev) => (prev + 1) % BAGUA.length);
    }, 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(baguaInterval);
    };
  }, [steps.length]);

  return (
    <div className="text-center py-8">
      {/* 八卦旋轉動畫 */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        {/* 外圈八卦 */}
        <div className="absolute inset-0 animate-spin-slow">
          {BAGUA.map((gua, i) => (
            <span
              key={i}
              className="absolute text-2xl text-amber-400/60"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-48px)`,
              }}
            >
              {gua}
            </span>
          ))}
        </div>
        
        {/* 中心符號 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl animate-pulse">{steps[currentStep].icon}</span>
        </div>
        
        {/* 光暈效果 */}
        <div className="absolute inset-4 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
      </div>

      {/* 步驟文字 */}
      <div className="space-y-3">
        <p className="text-amber-300 text-lg font-medium animate-pulse">
          {steps[currentStep].text}
        </p>
        
        {/* 進度點 */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === currentStep
                  ? 'bg-amber-400 scale-125'
                  : i < currentStep
                  ? 'bg-amber-400/50'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <p className="text-gray-500 text-sm mt-4">
          融合千年古籍智慧，為您深度解析...
        </p>
      </div>
    </div>
  );
}
