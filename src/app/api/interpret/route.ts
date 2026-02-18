import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 星曜解讀提示詞
const SYSTEM_PROMPT = `你是一位專業的紫微斗數命理師，精通古籍《紫微斗數全書》、《太微賦》、《骨髓賦》等經典。

你的任務是根據用戶的命盤資料，提供專業但易懂的解讀。

解讀原則：
1. 「命盤是統計，不是限制」- 賦能而非定命
2. 用白話文解釋，避免過多術語
3. 給出實用的趨吉避凶建議
4. 保持正面積極的語氣

解讀格式：
📊 命盤概覽
- 簡述命格特色

⭐ 性格特質
- 根據命宮主星分析

💼 事業財運
- 根據官祿宮、財帛宮分析

❤️ 感情婚姻
- 根據夫妻宮分析

🔮 流年提醒
- 近期需注意的事項

💡 開運建議
- 實用的建議`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chart } = body;

    if (!chart) {
      return NextResponse.json(
        { error: '缺少命盤資料' },
        { status: 400 }
      );
    }

    // 組織命盤資訊
    const chartInfo = formatChartInfo(chart);

    // 呼叫 Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${SYSTEM_PROMPT}

以下是用戶的紫微斗數命盤：

${chartInfo}

請根據以上命盤資料，提供完整的命理解讀。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      interpretation: text,
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: '解讀生成失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

// 格式化命盤資訊
function formatChartInfo(chart: any): string {
  const lines: string[] = [];

  // 基本資訊
  lines.push('【基本資訊】');
  lines.push(`性別：${chart.gender === 'male' ? '男' : '女'}`);
  lines.push(`農曆：${chart.lunarDate?.yearGanZhi}年 ${chart.lunarDate?.month}月 ${chart.lunarDate?.day}日`);
  lines.push(`五行局：${chart.wuXingJu?.name}`);
  lines.push(`命宮：${chart.mingGong?.gan}${chart.mingGong?.zhi}`);
  lines.push(`身宮：${chart.shenGong?.gongName}`);
  lines.push('');

  // 四化
  if (chart.siHua) {
    lines.push('【四化飛星】');
    lines.push(`化祿：${chart.siHua.lu?.star}（${chart.siHua.lu?.gongName}）`);
    lines.push(`化權：${chart.siHua.quan?.star}（${chart.siHua.quan?.gongName}）`);
    lines.push(`化科：${chart.siHua.ke?.star}（${chart.siHua.ke?.gongName}）`);
    lines.push(`化忌：${chart.siHua.ji?.star}（${chart.siHua.ji?.gongName}）`);
    lines.push('');
  }

  // 十二宮
  lines.push('【十二宮配置】');
  if (chart.gongs) {
    for (const gong of chart.gongs) {
      const mainStars = gong.mainStars?.map((s: any) => {
        let name = s.name;
        if (s.brightness) name += `(${s.brightness})`;
        if (s.siHua) name += s.siHua;
        return name;
      }).join('、') || '無主星';

      const assistStars = gong.assistStars?.map((s: any) => s.name).join('、') || '';
      const shaStars = gong.shaStars?.map((s: any) => s.name).join('、') || '';

      let starInfo = mainStars;
      if (assistStars) starInfo += ` / ${assistStars}`;
      if (shaStars) starInfo += ` / ${shaStars}`;

      const shenGongMark = gong.isShenGong ? ' 【身宮】' : '';
      lines.push(`${gong.name}（${gong.gan}${gong.zhi}）${shenGongMark}：${starInfo}`);
    }
  }

  // 大限
  if (chart.daxian) {
    lines.push('');
    lines.push('【大限運程】');
    lines.push(`起運歲數：${chart.daxian.startAge}歲`);
    lines.push(`運行方向：${chart.daxian.direction}`);
    if (chart.daxian.periods) {
      const periods = chart.daxian.periods.slice(0, 6);
      for (const p of periods) {
        lines.push(`${p.startAge}-${p.endAge}歲：${p.gongName}（${p.ganZhi}）`);
      }
    }
  }

  return lines.join('\n');
}
