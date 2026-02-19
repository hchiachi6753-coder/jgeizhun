import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `你是一位資深命理師，正在回答用戶針對他們命盤的追問。

【回答原則】
1. 直接切入重點，不要重複命盤基本資訊
2. 針對用戶的具體問題給出明確建議
3. 結合命盤特質回答，有依據、不空泛
4. 語氣親切但專業，像朋友聊天
5. 給出可執行的具體建議
6. 回答控制在 300-500 字

【回答格式】
直接回答問題，不需要標題或分段標記。
可以用「→」列出建議事項。
結尾可以給一句鼓勵或提醒。`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, chartType, chartData, originalInterpretation } = body;

    if (!question || !chartData) {
      return NextResponse.json(
        { error: '缺少必要資料' },
        { status: 400 }
      );
    }

    // 組織命盤摘要（精簡版，避免 token 太多）
    const chartSummary = formatChartSummary(chartType, chartData);

    const prompt = `${SYSTEM_PROMPT}

【命盤類型】${chartType === 'ziwei' ? '紫微斗數' : chartType === 'bazi' ? '八字命理' : chartType === 'comprehensive' ? '八字+紫微綜合' : '易經占卜'}

【命盤摘要】
${chartSummary}

【原本解讀重點】
${originalInterpretation ? originalInterpretation.slice(0, 1500) + '...' : '（無）'}

【用戶追問】
${question}

請針對用戶的問題，結合命盤特質給出具體回答：`;

    // 使用 Claude Sonnet（追問）
    let text: string;
    
    try {
      console.log('🚀 使用 Claude Sonnet (追問)...');
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          { role: 'user', content: prompt }
        ],
      });
      text = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log('✅ Claude Sonnet 成功');
    } catch (err: any) {
      console.error('❌ Claude Sonnet 失敗:', err?.message || err);
      throw err;
    }

    return NextResponse.json({
      success: true,
      answer: text,
    });

  } catch (error) {
    console.error('Followup API error:', error);
    return NextResponse.json(
      { error: '回答生成失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

// 格式化命盤摘要（精簡版）
function formatChartSummary(chartType: string, data: any): string {
  const lines: string[] = [];

  if (chartType === 'bazi' || chartType === 'comprehensive') {
    // 八字摘要
    if (data.baziResult || data.dayPillar) {
      const bazi = data.baziResult || data;
      lines.push('【八字】');
      lines.push(`日主：${bazi.dayPillar?.gan || ''}${bazi.dayPillar?.ganWuXing || ''}`);
      lines.push(`四柱：${bazi.yearPillar?.gan || ''}${bazi.yearPillar?.zhi || ''} ${bazi.monthPillar?.gan || ''}${bazi.monthPillar?.zhi || ''} ${bazi.dayPillar?.gan || ''}${bazi.dayPillar?.zhi || ''} ${bazi.hourPillar?.gan || ''}${bazi.hourPillar?.zhi || ''}`);
    }
  }

  if (chartType === 'ziwei' || chartType === 'comprehensive') {
    // 紫微摘要
    const chart = data.chart || data;
    if (chart.mingGong || chart.gongs) {
      lines.push('【紫微】');
      lines.push(`命宮：${chart.mingGong?.gan || ''}${chart.mingGong?.zhi || ''}`);
      lines.push(`五行局：${chart.wuXingJu?.name || ''}`);
      
      // 找命宮主星
      const mingGong = chart.gongs?.find((g: any) => g.name === '命宮');
      if (mingGong?.mainStars?.length > 0) {
        const stars = mingGong.mainStars.map((s: any) => s.name).join('、');
        lines.push(`命宮主星：${stars}`);
      }
    }
  }

  if (chartType === 'yijing') {
    // 易經摘要
    if (data.mainGua) {
      lines.push('【易經】');
      lines.push(`本卦：${data.mainGua.name || ''}`);
      if (data.changedGua) {
        lines.push(`變卦：${data.changedGua.name || ''}`);
      }
      if (data.movingLines?.length > 0) {
        lines.push(`動爻：${data.movingLines.join('、')}`);
      }
    }
  }

  // 基本資訊
  if (data.gender) {
    lines.push(`性別：${data.gender === 'male' ? '男' : '女'}`);
  }

  return lines.join('\n') || '（命盤資料）';
}
