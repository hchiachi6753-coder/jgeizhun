import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchChunks, formatChunksForPrompt } from '@/lib/rag';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const SYSTEM_PROMPT = `你是一位精通易經占卜的資深易學家。
你的解卦風格以古籍《周易》、《易經繫辭》、《卜筮正宗》為根基，結合現代語言表達。

【核心理念】
「易者，變也。」易經不是預言吉凶，而是指引方向。卦象告訴我們處境，如何應對在於自己。

【語氣風格】
- 深邃、睿智、有哲理。像老師在解惑。
- 引用原典但用白話解釋。
- 不說死話，強調變化與主動。
- 每個章節結尾附一句「易學箴言」。

【解讀架構】

## ☰ 卦象總論

先用一句話點出此卦的核心意象。
解釋卦名含義、上下卦的象徵、整體氣象。

---

## 📖 卦辭解讀

引用並解釋該卦的卦辭。
連結到問卜者的問題，說明整體方向。

---

## 🔥 動爻分析

（如果有動爻）
逐一解釋動爻的爻辭及其含義。
動爻是變化的關鍵，要重點分析。

---

## 🔄 變卦啟示

（如果有變卦）
解釋變卦的意涵。
本卦是現況，變卦是發展方向。

---

## 🎯 針對問題的解答

直接回應問卜者的問題。
給出具體、可行的建議。
不迴避問題，但也不武斷。

---

## 💡 行動建議

→ 具體建議 1
→ 具體建議 2
→ 具體建議 3

---

## 🏁 總結

以一句易學箴言或古訓收尾。

【排版規則】
1. 章節用 ## 開頭
2. 章節之間用 --- 分隔
3. 引用古文用「」標示
4. 建議用 → 條列
5. 只有標題用 emoji，內文不用`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, yaos, benGua, bianGua, dongYao } = body;

    if (!question || !benGua) {
      return NextResponse.json(
        { error: '缺少必要資料' },
        { status: 400 }
      );
    }

    // 搜尋易經相關古書內容 - 優化關鍵字
    const keywords = [
      benGua.name,           // 如 "乾"
      benGua.name + '卦',    // 如 "乾卦"
      benGua.upperGua,       // 上卦名
      benGua.lowerGua,       // 下卦名
      benGua.upperGua + '卦',
      benGua.lowerGua + '卦',
    ];
    if (bianGua) {
      keywords.push(bianGua.name, bianGua.name + '卦');
    }
    // 動爻相關
    if (dongYao && dongYao.length > 0) {
      keywords.push('動爻', '爻辭');
    }
    const chunks = searchChunks(keywords, '易經', 5); // 增加到5筆
    const ragContent = formatChunksForPrompt(chunks);

    // 組織卦象資訊
    const guaInfo = formatGuaInfo(yaos, benGua, bianGua, dongYao);

    const prompt = `${SYSTEM_PROMPT}

【占問問題】
${question}

【卦象資訊】
${guaInfo}

${ragContent ? `${ragContent}\n\n請參考以上古書內容，在解讀時適當引用。\n` : ''}
請根據以上卦象，為問卜者提供詳細的解讀和建議。`;

    // 使用 Gemini Pro 2.5
    let text: string;
    const usedModel = 'gemini-2.5-pro';
    
    console.log('🚀 使用 Gemini Pro 2.5...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-preview-05-06' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();
    console.log('✅ Gemini Pro 2.5 成功');

    return NextResponse.json({
      success: true,
      interpretation: text,
      model: usedModel,
    });

  } catch (error) {
    console.error('Yijing API error:', error);
    return NextResponse.json(
      { error: '解讀生成失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

function formatGuaInfo(yaos: any[], benGua: any, bianGua: any, dongYao: number[]): string {
  const lines: string[] = [];
  
  lines.push(`【本卦】${benGua.name}`);
  lines.push(`上卦：${benGua.upperGua}，下卦：${benGua.lowerGua}`);
  lines.push('');
  
  // 六爻詳情
  lines.push('【六爻】（從初爻到上爻）');
  yaos.forEach((yao: any, i: number) => {
    const yaoType = yao.yaoValue === 9 ? '老陽（動）' :
                    yao.yaoValue === 6 ? '老陰（動）' :
                    yao.yaoValue === 7 ? '少陽' : '少陰';
    lines.push(`${yao.yaoName}：${yao.yaoLine} ${yaoType}`);
  });
  lines.push('');
  
  if (dongYao.length > 0) {
    lines.push(`【動爻】第 ${dongYao.join('、')} 爻`);
    lines.push('');
  }
  
  if (bianGua) {
    lines.push(`【變卦】${bianGua.name}`);
    lines.push(`上卦：${bianGua.upperGua}，下卦：${bianGua.lowerGua}`);
  } else {
    lines.push('【變卦】無（六爻皆靜）');
  }
  
  return lines.join('\n');
}
