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
  const [showModal, setShowModal] = useState(false);
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
    if (!benGua || loading) return;
    
    setLoading(true);
    setShowModal(true);
    setInterpretation('');
    
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
        setUsedModel(data.model || '');
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
  const renderGua = (gua: GuaResult | null, title: string, isMain: boolean = false) => {
    if (!gua) return null;
    
    return (
      <div className={`
        backdrop-blur-xl rounded-2xl p-6 border
        ${isMain 
          ? 'bg-amber-900/30 border-amber-500/40' 
          : 'bg-white/5 border-amber-500/20'
        }
      `}>
        <h3 className="text-amber-300 font-semibold mb-2 text-center">{title}</h3>
        <p className={`text-3xl font-bold text-center mb-4 ${isMain ? 'text-amber-400' : 'text-white'}`}>
          {gua.name}
        </p>
        <div className="flex flex-col items-center gap-1 font-mono text-lg">
          {/* 從上到下顯示 */}
          {[5, 4, 3, 2, 1, 0].map(i => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-amber-200/50 w-10 text-right">{YAO_NAMES[i]}</span>
              <span className={`${
                yaos[i]?.isChanging ? 'text-orange-400' : 'text-amber-100'
              }`}>
                {gua.yaos[i] === '1' ? '━━━━━━━━' : '━━━  ━━━'}
              </span>
              {yaos[i]?.isChanging && (
                <span className="text-orange-400 text-xs bg-orange-500/20 px-2 py-0.5 rounded">動</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-sm">
          <span className="text-amber-400/70">上卦 {gua.upperGua}</span>
          <span className="mx-3 text-gray-600">|</span>
          <span className="text-purple-400/70">下卦 {gua.lowerGua}</span>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[300px] bg-amber-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* 問題 */}
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-2">占問</p>
          <p className="text-xl text-amber-300">「{question}」</p>
        </div>

        {/* 卦象顯示 */}
        <div className={`grid gap-6 mb-8 ${bianGua ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
          {renderGua(benGua, '本卦', true)}
          {bianGua && (
            <>
              {/* 箭頭 - 只在大螢幕顯示 */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="text-3xl text-amber-500/50">→</span>
              </div>
              {renderGua(bianGua, '變卦')}
            </>
          )}
        </div>

        {/* 動爻提示 */}
        {dongYao.length > 0 && (
          <div className="text-center mb-8 bg-orange-500/10 border border-orange-500/30 rounded-xl py-3 px-6 inline-block mx-auto w-full">
            <span className="text-orange-400">
              ⚡ 動爻：{dongYao.map(d => YAO_NAMES[d - 1]).join('、')}
            </span>
          </div>
        )}

        {/* 說明 */}
        <div className="bg-slate-900/50 rounded-xl border border-gray-700/50 p-6 mb-6">
          <h3 className="text-lg font-bold text-amber-200 mb-3">📖 易經小知識</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h4 className="text-amber-300 mb-2">六爻</h4>
              <p>由下至上為初爻、二爻、三爻、四爻、五爻、上爻。陽爻「⚊」陰爻「⚋」。</p>
            </div>
            <div>
              <h4 className="text-orange-300 mb-2">動爻</h4>
              <p>老陽(9)變陰、老陰(6)變陽，即「動」。動爻是卦象變化的關鍵。</p>
            </div>
            <div>
              <h4 className="text-purple-300 mb-2">本卦與變卦</h4>
              <p>本卦是當前狀態，變卦是發展趨勢。有動爻時才有變卦。</p>
            </div>
            <div>
              <h4 className="text-yellow-300 mb-2">解卦原則</h4>
              <p>無動爻看卦辭，一動爻看該爻爻辭，多動爻綜合判斷。</p>
            </div>
          </div>
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-4">
          <a
            href="/yijing"
            className="flex-1 py-3 text-center border border-amber-500/50 rounded-xl text-amber-400 hover:bg-amber-500/10 transition-colors"
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

        {/* 浮動 AI 按鈕 */}
        <button
          onClick={getInterpretation}
          disabled={loading}
          className="fixed bottom-8 right-8 z-40 group"
        >
          <div className="relative">
            {/* 光暈效果 - 呼吸動畫 */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
            {/* 外圈光環 */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full blur-md opacity-50 animate-spin-slow" />
            {/* 按鈕本體 - 流動漸層 */}
            <div className="relative flex items-center gap-3 px-6 py-4 animate-gradient-gold rounded-full font-bold text-white border-2 border-amber-300/50 shadow-2xl shadow-amber-900/50 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300">
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>解卦中...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">☰</span>
                  <span>AI 解讀天機</span>
                </>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* AI 解讀彈窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#1a1a3a] to-[#0d0d2b] rounded-2xl border border-amber-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* 標題 */}
            <div className="p-4 border-b border-amber-500/20 flex items-center justify-between bg-amber-900/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">☰</span>
                <h2 className="text-xl font-bold text-amber-300">AI 易經解讀</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
              >
                ×
              </button>
            </div>

            {/* 卦象摘要 */}
            <div className="px-6 py-4 bg-amber-900/10 border-b border-amber-500/10">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-amber-400">本卦：{benGua?.name}</span>
                {bianGua && (
                  <>
                    <span className="text-gray-500">→</span>
                    <span className="text-purple-400">變卦：{bianGua.name}</span>
                  </>
                )}
                {dongYao.length > 0 && (
                  <span className="text-orange-400">動爻：{dongYao.map(d => YAO_NAMES[d - 1]).join('、')}</span>
                )}
              </div>
            </div>

            {/* 內容 */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[65vh]">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4" />
                  <p className="text-amber-300">AI 正在解讀卦象...</p>
                  <p className="text-gray-500 text-sm mt-2">這可能需要 10-20 秒</p>
                </div>
              ) : interpretation ? (
                <div className="interpretation-content">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
              ) : null}
            </div>

            {/* 底部 */}
            {!loading && interpretation && (
              <div className="p-4 border-t border-amber-500/20 flex items-center justify-between">
                <p className="text-gray-500 text-xs">
                  ⚠️ AI 解讀僅供參考，天機不可盡洩
                </p>
                {usedModel && (
                  <span className="text-xs text-gray-600">Model: {usedModel}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
