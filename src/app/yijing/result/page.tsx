'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGuaFromYaos, YaoResult, GuaResult, YAO_NAMES } from '@/lib/yijing';
import ReactMarkdown from 'react-markdown';

export default function YijingResultPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [yaos, setYaos] = useState<YaoResult[]>([]);
  const [benGua, setBenGua] = useState<GuaResult | null>(null);
  const [bianGua, setBianGua] = useState<GuaResult | null>(null);
  const [dongYao, setDongYao] = useState<number[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [usedModel, setUsedModel] = useState('');

  useEffect(() => {
    const q = sessionStorage.getItem('yijing_question');
    const y = sessionStorage.getItem('yijing_yaos');
    
    if (!q || !y) {
      router.push('/yijing');
      return;
    }
    
    setQuestion(q);
    const parsedYaos = JSON.parse(y) as YaoResult[];
    setYaos(parsedYaos);
    
    // 計算卦象
    const ben = getGuaFromYaos(parsedYaos, false);
    setBenGua(ben);
    
    // 找動爻
    const dong = parsedYaos
      .map((yao, index) => yao.isChanging ? index + 1 : 0)
      .filter(pos => pos > 0);
    setDongYao(dong);
    
    // 如果有動爻，計算變卦
    if (dong.length > 0) {
      const bian = getGuaFromYaos(parsedYaos, true);
      setBianGua(bian);
    }
  }, [router]);

  const getInterpretation = async () => {
    if (!benGua) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/interpret-yijing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          yaos,
          benGua,
          bianGua,
          dongYao,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setInterpretation(data.interpretation);
        setUsedModel(data.model);
      } else {
        setInterpretation('解讀生成失敗，請稍後再試。');
      }
    } catch (error) {
      setInterpretation('發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  // 繪製卦象
  const renderGua = (gua: GuaResult | null, title: string) => {
    if (!gua) return null;
    
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
        <h3 className="text-emerald-300 font-semibold mb-2">{title}</h3>
        <p className="text-2xl font-bold text-white mb-4">{gua.name}</p>
        <div className="flex flex-col items-center gap-1 font-mono text-xl">
          {/* 從上到下顯示 */}
          {[5, 4, 3, 2, 1, 0].map(i => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-12">{YAO_NAMES[i]}</span>
              <span className={`${
                yaos[i]?.isChanging ? 'text-amber-400' : 'text-white'
              }`}>
                {gua.yaos[i] === '1' ? '━━━━━━━' : '━━━ ━━━'}
              </span>
              {yaos[i]?.isChanging && (
                <span className="text-amber-400 text-xs">動</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-400">
          <span>上卦：{gua.upperGua}</span>
          <span className="mx-2">|</span>
          <span>下卦：{gua.lowerGua}</span>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[300px] bg-emerald-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* 問題 */}
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-2">占問</p>
          <p className="text-xl text-emerald-300">「{question}」</p>
        </div>

        {/* 卦象顯示 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {renderGua(benGua, '本卦')}
          {bianGua && renderGua(bianGua, '變卦')}
        </div>

        {/* 動爻提示 */}
        {dongYao.length > 0 && (
          <div className="text-center mb-8">
            <span className="text-amber-400">
              動爻：{dongYao.map(d => YAO_NAMES[d - 1]).join('、')}
            </span>
          </div>
        )}

        {/* AI 解讀按鈕 */}
        {!interpretation && (
          <button
            onClick={getInterpretation}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">☰</span>
                AI 解卦中...
              </span>
            ) : (
              '✨ AI 解讀卦象'
            )}
          </button>
        )}

        {/* AI 解讀結果 */}
        {interpretation && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-emerald-300 font-semibold">AI 解讀</h3>
              {usedModel && (
                <span className="text-xs text-gray-500">
                  Model: {usedModel}
                </span>
              )}
            </div>
            <div className="prose prose-invert prose-emerald max-w-none">
              <ReactMarkdown>{interpretation}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex gap-4 mt-8">
          <a
            href="/yijing"
            className="flex-1 py-3 text-center border border-emerald-500/50 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            再占一卦
          </a>
          <a
            href="/"
            className="flex-1 py-3 text-center bg-white/10 rounded-xl text-gray-300 hover:bg-white/20 transition-colors"
          >
            返回首頁
          </a>
        </div>
      </div>
    </main>
  );
}
