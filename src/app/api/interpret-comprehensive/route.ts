import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRelevantBaziContent, getRelevantZiweiContent } from '@/lib/rag';

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 發送模型切換通知
async function notifyModelSwitch(apiName: string, errorMsg: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `⚠️ **J給準 模型切換通知**\n\n📍 API: ${apiName}\n🔄 Pro 額度用完，已切換到 Flash\n💬 錯誤: ${errorMsg.slice(0, 100)}\n⏰ 時間: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`
      })
    });
  } catch (e) {
    console.error('通知發送失敗:', e);
  }
}

// 八字+紫微雙系統綜合分析 Prompt
const SYSTEM_PROMPT = `你是一位資深命理師，精通八字命理與紫微斗數雙系統。
八字典籍：《滴天髓》、《窮通寶鑑》、《子平真詮》、《神峰通考》
紫微典籍：《紫微斗數全書》、《太微賦》、《骨髓賦》、《斗數準繩》

【雙系統核心分工】
- **八字**：定「客觀氣勢」——格局強弱、五行喜忌、大運流年吉凶、事件走向
- **紫微**：定「內在心理」——星曜特質、宮位課題、心理動機、主觀感受

【分析原則】
每一個主題都必須：
1. 先用八字分析「客觀會發生什麼」（事件、機會、阻礙）
2. 再用紫微分析「主觀會怎麼感受」（心理、態度、選擇）
3. 最後做「雙系統交叉印證」，讓分析更立體

【語氣風格】
- 直接、敢講、有畫面。以「我看見的」為核心。
- 短句有力、語氣帶呼吸，像真人論命。
- 每段結尾附「命理師金句」。
- 禁止模糊、表面、籠統。每一分析須具命理依據。

【核心理念】
「命盤是統計，不是限制。」當命主被看懂，就會開始改命。

【解讀架構】

## ☯️ 命格總論：八字×紫微雙系統定調

用一句「開盤金句」定場，同時點出八字格局與紫微主星的核心特質。
說明這個人「外在氣勢」（八字）與「內在本質」（紫微）的關係。

---

## 🎭 性格深度剖析

**【八字觀點】** 從日主五行、十神結構分析命主的行為模式與處世風格。

**【紫微觀點】** 從命宮主星、輔煞星分析命主的內在心理與人格特質。

**【雙系統交叉】** 綜合八字與紫微，描繪這個人的完整性格面貌。

「命理師金句」

---

## 💼 事業與財運

**【八字觀點】** 格局、用神、官殺財印的配置，分析適合的事業方向與發財模式。

**【紫微觀點】** 官祿宮、財帛宮的星曜配置，分析職場特質與財富心理。

**【雙系統交叉】** 客觀機會（八字）+ 主觀選擇（紫微）= 最佳策略。

→ 具體建議（職業方向、注意事項）

「命理師金句」

---

## ❤️ 感情與婚姻

**【八字觀點】** 配偶星（正財/正官）、桃花神煞、大運婚姻時機。

**【紫微觀點】** 夫妻宮星曜、感情模式、擇偶傾向。

**【雙系統交叉】** 會遇到什麼人（八字）+ 會怎麼經營（紫微）。

→ 具體建議（擇偶方向、相處之道）

「命理師金句」

---

## 🩺 健康提醒

**【八字觀點】** 五行偏枯、大運衝剋，需注意的身體系統。

**【紫微觀點】** 疾厄宮星曜配置，心理壓力來源。

→ 養生建議

---

## 📅 當前運勢分析

**【八字流年】** 當前大運與流年的五行喜忌影響。

**【紫微大限】** 當前大限的星曜能量與心理課題。

**【雙系統交叉】** 今年的機會、風險與具體行動建議。

---

## 👥 貴人與人際

**【八字觀點】** 天乙貴人、六合三合，貴人來源方位。

**【紫微觀點】** 僕役宮、遷移宮，人際模式與貴人特徵。

→ 具體建議（結交什麼人、避開什麼人）

---

## 🏁 命理師總結

以一句有力的金句收尾，點出這個命盤最重要的核心課題與人生提醒。
強調八字與紫微的互補關係：「外在走勢」與「內在選擇」如何配合。

【重要提醒】
1. 每個分析都要有具體的命理依據（星曜、五行、十神）
2. 用白話解釋術語，讓一般人能懂
3. 給出可落地執行的建議
4. 語氣要有溫度，像真人在對話
5. 八字和紫微的分析要明確分開再交叉整合

【排版規則】⚠️ 嚴格遵守

1. 每個章節用 ## 開頭
2. 每個 ## 後面空一行再寫內容
3. 每個章節之間用 --- 分隔線隔開
4. **【八字觀點】** 和 **【紫微觀點】** 要加粗
5. 命理師金句獨立一行，用「」包起來
6. 建議用條列式，每項前面用 → 
7. 只有 ## 標題用 emoji，內文不要用 emoji`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ziweiChart, baziResult, birthInfo } = body;

    if (!ziweiChart || !baziResult) {
      return NextResponse.json(
        { error: '缺少命盤資料' },
        { status: 400 }
      );
    }

    // 組織命盤資訊
    const ziweiInfo = formatZiweiInfo(ziweiChart);
    const baziInfo = formatBaziInfo(baziResult);

    // 🔥 RAG：搜尋相關古書內容
    const baziRagContent = getRelevantBaziContent(baziResult, 2);
    const ziweiRagContent = getRelevantZiweiContent(ziweiChart, 2);
    const ragContent = [baziRagContent, ziweiRagContent].filter(Boolean).join('\n');

    // 計算當前年份和命主年齡
    const currentYear = new Date().getFullYear();
    const birthYear = birthInfo.year;
    const age = currentYear - birthYear;

    const prompt = `${SYSTEM_PROMPT}

【重要時間資訊】
- 當前年份：${currentYear}年
- 命主出生年：${birthYear}年
- 命主現年：${age}歲
- 性別：${birthInfo.gender === 'male' ? '男' : '女'}

【八字命盤】
${baziInfo}

【紫微斗數命盤】
${ziweiInfo}

${ragContent ? `${ragContent}\n\n請特別參考以上古書內容，在解讀時引用相關段落。\n` : ''}
請根據以上八字與紫微雙系統命盤資料，提供完整的綜合解讀。
記住：
1. 當前是${currentYear}年，流年分析要用${currentYear}年
2. 每個主題都要先八字（客觀）再紫微（主觀）再交叉印證
3. 命主現年${age}歲，分析要符合這個人生階段
4. 八字定「會發生什麼」，紫微定「會怎麼感受」
5. 如果有古書參考內容，請適當引用`;

    // Pro 優先，失敗自動切 Flash
    let text: string;
    let usedModel = 'flash';
    
    try {
      const proModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const proResult = await proModel.generateContent(prompt);
      text = proResult.response.text();
      usedModel = 'pro';
    } catch (proErr: any) {
      console.log('⚠️ Pro 失敗，切換 Flash:', proErr?.message || proErr);
      
      // 發送通知
      notifyModelSwitch('interpret-comprehensive (綜合)', proErr?.message || String(proErr));
      
      const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const flashResult = await flashModel.generateContent(prompt);
      text = flashResult.response.text();
      usedModel = 'flash';
    }

    return NextResponse.json({
      success: true,
      interpretation: text,
      model: usedModel,
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: '解讀生成失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

// 格式化紫微命盤資訊
function formatZiweiInfo(chart: any): string {
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

// 格式化八字資訊
function formatBaziInfo(bazi: any): string {
  const lines: string[] = [];

  // 四柱
  lines.push('【四柱八字】');
  lines.push(`年柱：${bazi.yearPillar?.gan || ''}${bazi.yearPillar?.zhi || ''}（${bazi.yearShiShen || ''}）`);
  lines.push(`月柱：${bazi.monthPillar?.gan || ''}${bazi.monthPillar?.zhi || ''}（${bazi.monthShiShen || ''}）`);
  lines.push(`日柱：${bazi.dayPillar?.gan || ''}${bazi.dayPillar?.zhi || ''}（日主：${bazi.dayPillar?.gan || ''}${bazi.dayPillar?.ganWuXing || ''}）`);
  lines.push(`時柱：${bazi.hourPillar?.gan || ''}${bazi.hourPillar?.zhi || ''}（${bazi.hourShiShen || ''}）`);
  lines.push('');

  // 藏干（月令）
  if (bazi.monthCangGan?.length > 0) {
    lines.push('【月令藏干】');
    const cangGanStr = bazi.monthCangGan.map((c: any) => `${c.gan}(${c.shiShen})`).join('、');
    lines.push(cangGanStr);
    lines.push('');
  }

  // 五行統計
  const wuxingCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar].forEach((p: any) => {
    if (p?.ganWuXing) wuxingCount[p.ganWuXing]++;
    if (p?.zhiWuXing) wuxingCount[p.zhiWuXing]++;
  });
  lines.push('【五行分佈】');
  lines.push(`金：${wuxingCount['金']}，木：${wuxingCount['木']}，水：${wuxingCount['水']}，火：${wuxingCount['火']}，土：${wuxingCount['土']}`);
  lines.push('');

  // 十神分佈
  lines.push('【十神結構】');
  const shiShenList = [
    bazi.yearShiShen,
    bazi.monthShiShen,
    bazi.hourShiShen,
  ].filter(Boolean);
  lines.push(`天干十神：${shiShenList.join('、')}`);
  
  // 藏干十神
  const allCangGan = [
    ...(bazi.yearCangGan || []),
    ...(bazi.monthCangGan || []),
    ...(bazi.dayCangGan || []),
    ...(bazi.hourCangGan || []),
  ];
  const cangGanShiShen = allCangGan.map((c: any) => c.shiShen).filter(Boolean);
  if (cangGanShiShen.length > 0) {
    lines.push(`藏干十神：${cangGanShiShen.join('、')}`);
  }
  lines.push('');

  // 大運
  if (bazi.daYun?.length > 0) {
    lines.push('【大運】');
    const dayunList = bazi.daYun.slice(0, 8);
    for (const dy of dayunList) {
      lines.push(`${dy.startAge}歲起：${dy.ganZhi}`);
    }
  }

  return lines.join('\n');
}
