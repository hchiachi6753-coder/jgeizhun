'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getGuaFromYaos, YaoResult, GuaResult, YAO_NAMES } from '@/lib/yijing';
import ReactMarkdown from 'react-markdown';
import LoadingAnimation from '@/components/LoadingAnimation';
import FollowUpQuestions from '@/components/FollowUpQuestions';

interface FollowUpItem {
  question: string;
  answer: string;
}

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
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpItem[]>([]);
  const interpretationRef = useRef<HTMLDivElement>(null);

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

  // 當解讀完成後滾動到解讀區域
  useEffect(() => {
    if (interpretation && interpretationRef.current) {
      interpretationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [interpretation]);

  // 處理新追問
  const handleNewFollowUp = (item: FollowUpItem) => {
    setFollowUpHistory(prev => [...prev, item]);
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
        print:bg-amber-50 print:border-amber-300
      `}>
        <h3 className="text-amber-300 font-semibold mb-2 text-center print:text-amber-700">{title}</h3>
        <p className={`text-3xl font-bold text-center mb-4 ${isMain ? 'text-amber-400' : 'text-white'} print:text-amber-600`}>
          {gua.name}
        </p>
        <div className="flex flex-col items-center gap-1 font-mono text-lg">
          {/* 從上到下顯示 */}
          {[5, 4, 3, 2, 1, 0].map(i => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-amber-200/50 w-10 text-right print:text-amber-600">{YAO_NAMES[i]}</span>
              <span className={`${
                yaos[i]?.isChanging ? 'text-orange-400' : 'text-amber-100'
              } print:text-amber-700`}>
                {gua.yaos[i] === '1' ? '━━━━━━━━' : '━━━  ━━━'}
              </span>
              {yaos[i]?.isChanging && (
                <span className="text-orange-400 text-xs bg-orange-500/20 px-2 py-0.5 rounded print:bg-orange-100 print:text-orange-600">動</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-sm">
          <span className="text-amber-400/70 print:text-amber-600">上卦 {gua.upperGua}</span>
          <span className="mx-3 text-gray-600">|</span>
          <span className="text-purple-400/70 print:text-purple-600">下卦 {gua.lowerGua}</span>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2b] text-white print:bg-white print:text-black">
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-1/4 left-0 w-[500px] h-[300px] bg-amber-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px]" />
      </div>

      {/* 頂部裝飾線 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20 print:hidden" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* 列印時間戳記 */}
        <div className="hidden print-timestamp">
          報告產生時間：{new Date().toLocaleString('zh-TW', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false 
          }).replace(/\//g, '-')}
        </div>

        {/* 頂部導航 */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <a 
            href="/yijing" 
            className="inline-flex items-center text-amber-400/80 hover:text-amber-400 transition"
          >
            ← 重新占卦
          </a>
          <a 
            href="/" 
            className="text-gray-500 hover:text-amber-300 transition-colors text-sm"
          >
            返回首頁
          </a>
        </div>

        {/* 問題 */}
        <div className="text-center mb-8">
          <p className="text-gray-400 mb-2 print:text-gray-600">占問</p>
          <p className="text-xl text-amber-300 print:text-amber-700">「{question}」</p>
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
          <div className="text-center mb-8 bg-orange-500/10 border border-orange-500/30 rounded-xl py-3 px-6 inline-block mx-auto w-full print:bg-orange-50 print:border-orange-300">
            <span className="text-orange-400 print:text-orange-600">
              ⚡ 動爻：{dongYao.map(d => YAO_NAMES[d - 1]).join('、')}
            </span>
          </div>
        )}

        {/* 說明 */}
        <div className="bg-slate-900/50 rounded-xl border border-gray-700/50 p-6 mb-6 print:bg-gray-100 print:border-gray-300">
          <h3 className="text-lg font-bold text-amber-200 mb-3 print:text-amber-700">📖 易經小知識</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400 print:text-gray-600">
            <div>
              <h4 className="text-amber-300 mb-2 print:text-amber-600">六爻</h4>
              <p>由下至上為初爻、二爻、三爻、四爻、五爻、上爻。陽爻「⚊」陰爻「⚋」。</p>
            </div>
            <div>
              <h4 className="text-orange-300 mb-2 print:text-orange-600">動爻</h4>
              <p>老陽(9)變陰、老陰(6)變陽，即「動」。動爻是卦象變化的關鍵。</p>
            </div>
            <div>
              <h4 className="text-purple-300 mb-2 print:text-purple-600">本卦與變卦</h4>
              <p>本卦是當前狀態，變卦是發展趨勢。有動爻時才有變卦。</p>
            </div>
            <div>
              <h4 className="text-yellow-300 mb-2 print:text-yellow-600">解卦原則</h4>
              <p>無動爻看卦辭，一動爻看該爻爻辭，多動爻綜合判斷。</p>
            </div>
          </div>
        </div>

        {/* 浮動 AI 按鈕 - 只在沒有解讀時顯示 */}
        {!interpretation && !loading && (
          <button
            onClick={getInterpretation}
            disabled={loading}
            className="fixed bottom-8 right-8 z-40 group print:hidden"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="relative flex items-center gap-3 px-6 py-4 animate-gradient-gold rounded-full font-bold text-white border-2 border-amber-300/50 shadow-2xl shadow-amber-900/50 group-hover:scale-105 group-hover:border-amber-300 transition-all duration-300">
                <span className="text-2xl">☰</span>
                <span>AI 解讀天機</span>
              </div>
            </div>
          </button>
        )}

        {/* AI 解讀區域 - 內嵌顯示 */}
        {(loading || interpretation) && (
          <div 
            ref={interpretationRef}
            className="mt-8 p-6 md:p-8 bg-gradient-to-b from-amber-900/30 to-orange-900/20 rounded-2xl border border-amber-500/30 print:bg-white print:border-gray-300"
          >
            {/* 標題 */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">☰</span>
              <h2 className="text-xl font-bold text-amber-300 print:text-amber-700">AI 易經解讀</h2>
            </div>

            {/* 卦象摘要 */}
            <div className="mb-6 p-4 bg-amber-900/20 rounded-lg border border-amber-500/20 print:bg-amber-50 print:border-amber-300">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-amber-400 print:text-amber-600">本卦：{benGua?.name}</span>
                {bianGua && (
                  <>
                    <span className="text-gray-500">→</span>
                    <span className="text-purple-400 print:text-purple-600">變卦：{bianGua.name}</span>
                  </>
                )}
                {dongYao.length > 0 && (
                  <span className="text-orange-400 print:text-orange-600">動爻：{dongYao.map(d => YAO_NAMES[d - 1]).join('、')}</span>
                )}
              </div>
            </div>

            {/* 內容 */}
            {loading ? (
              <LoadingAnimation type="yijing" />
            ) : interpretation ? (
              <>
                <div className="interpretation-content">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
                
                {/* 追問區 */}
                <FollowUpQuestions
                  chartType="yijing"
                  chartData={{ benGua, bianGua, dongYao, yaos, question }}
                  originalInterpretation={interpretation}
                  followUpHistory={followUpHistory}
                  onNewFollowUp={handleNewFollowUp}
                />
              </>
            ) : null}

            {/* 底部 */}
            {!loading && interpretation && (
              <div className="mt-8 pt-4 border-t border-amber-500/20 print:border-gray-300">
                {/* 按鈕區 */}
                <div className="flex justify-center gap-4 mb-3 print:hidden">
                  <button
                    onClick={() => router.push('/yijing')}
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-medium hover:from-amber-400 hover:to-orange-400 transition-all"
                  >
                    🔮 再問一卦
                  </button>
                </div>
                
                {/* 提示文字 */}
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs print:text-gray-600">
                    ⚠️ AI 解讀僅供參考，天機不可盡洩
                  </p>
                  {usedModel && (
                    <span className="text-xs text-gray-600 print:hidden">Model: {usedModel}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
