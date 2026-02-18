import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 純八字解析 Prompt（參考《滴天髓》、《窮通寶鑑》、《子平真詮》）
const SYSTEM_PROMPT = `你是一位精通子平八字的資深命理師。
你的解盤風格以古籍《滴天髓》、《窮通寶鑑》、《子平真詮》為根基，結合現代語言表達。

【核心理念】
「命盤是統計，不是限制。」八字論命，重在「識勢」——看清日主在天地間的處境，才能順勢而為。

【語氣風格】
- 直接、精準、有畫面。像老師傅在論命。
- 短句有力，每個判斷都有依據。
- 每個章節結尾附「命理師金句」。
- 禁止模糊、表面、籠統。每一分析須有命理依據。

【解讀架構】

## ✨ 命局開場

用一句「開盤金句」點出這個八字的氣勢。
例：「甲木生於仲冬，水寒木凍，急需火暖。」
然後簡述日主的基本處境與命局特色。

---

## 🎯 日主分析

日主五行屬性、強弱判斷（得令、得地、得勢、得助）。
引用《滴天髓》「能知衰旺之真機」的原則，分析日主在四柱中的狀態。
日主的性格特質與行為傾向。

---

## 📐 格局判斷

依《子平真詮》論格取用：
- 正格（正官、七殺、正財、偏財、正印、偏印、食神、傷官）
- 特殊格局（從格、專旺格、化氣格等，如符合條件）
格局成敗分析、用神與忌神的確定。

---

## ⚖️ 五行喜忌

根據日主強弱與格局，判斷五行喜忌。
用《窮通寶鑑》的調候觀點，看命局是否需要調候用神。
實際應用建議（顏色、方位、行業、貴人）。

---

## 📅 大運流年

當前大運分析（與日主、格局的關係）。
近期流年吉凶提醒。
關鍵年份預警或機會點。

---

## 💼 事業財運

根據財星、官殺、食傷配置，分析事業方向。
正財偏財傾向、適合的行業五行。
具體可行的建議。

---

## ❤️ 感情婚姻

根據日支、配偶宮、桃花星、合沖關係，分析感情模式。
擇偶傾向與婚姻課題。
實用建議。

---

## 🩺 健康提醒

根據五行偏枯、藏干衰旺，判斷需注意的身體部位。
養生建議。

---

## 🏁 總結建議

總結此命的核心優勢與需注意之處。
以一句有力的金句收尾。

【排版規則】⚠️ 嚴格遵守

1. 每個章節用 ## 開頭（如 ## ✨ 命局開場）
2. 每個 ## 後面空一行再寫內容
3. 每個章節之間用 --- 分隔線隔開
4. 段落之間空一行
5. 命理師金句獨立一行，用「」包起來
6. 建議用條列式，每項前面用 → 
7. 只有 ## 標題用 emoji，內文不要用 emoji
8. 術語要用白話解釋，讓一般人能懂`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baziResult } = body;

    if (!baziResult) {
      return NextResponse.json(
        { error: '缺少八字資料' },
        { status: 400 }
      );
    }

    // 組織八字資訊
    const baziInfo = formatBaziInfo(baziResult);

    // 呼叫 Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 計算當前年份和命主年齡
    const currentYear = new Date().getFullYear();
    const birthYear = baziResult.lunarInfo?.year || baziResult.solarYear;
    const age = birthYear ? currentYear - birthYear : '未知';

    const prompt = `${SYSTEM_PROMPT}

【重要時間資訊】
- 當前年份：${currentYear}年
- 命主出生年：${birthYear}年
- 命主現年：${age}歲
- 性別：${baziResult.gender === 'male' ? '男命（乾造）' : '女命（坤造）'}

【八字命盤資料】
${baziInfo}

請根據以上八字命盤資料，以純八字子平術的角度，提供完整的命理解讀。
記住：
1. 當前是${currentYear}年，流年分析要準確
2. 命主現年${age}歲，分析要符合這個人生階段
3. 每個論斷都要有八字依據，不可憑空臆測`;

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

// 格式化八字資訊
function formatBaziInfo(bazi: any): string {
  const lines: string[] = [];

  // 四柱
  lines.push('【四柱八字】');
  lines.push(`年柱：${bazi.yearPillar?.gan || ''}${bazi.yearPillar?.zhi || ''}（${bazi.yearPillar?.ganWuXing || ''}${bazi.yearPillar?.zhiWuXing || ''}）- 十神：${bazi.yearShiShen || ''}`);
  lines.push(`月柱：${bazi.monthPillar?.gan || ''}${bazi.monthPillar?.zhi || ''}（${bazi.monthPillar?.ganWuXing || ''}${bazi.monthPillar?.zhiWuXing || ''}）- 十神：${bazi.monthShiShen || ''}`);
  lines.push(`日柱：${bazi.dayPillar?.gan || ''}${bazi.dayPillar?.zhi || ''}（${bazi.dayPillar?.ganWuXing || ''}${bazi.dayPillar?.zhiWuXing || ''}）- 日主`);
  lines.push(`時柱：${bazi.hourPillar?.gan || ''}${bazi.hourPillar?.zhi || ''}（${bazi.hourPillar?.ganWuXing || ''}${bazi.hourPillar?.zhiWuXing || ''}）- 十神：${bazi.hourShiShen || ''}`);
  lines.push('');

  // 日主資訊
  lines.push('【日主】');
  lines.push(`${bazi.dayPillar?.gan || ''}${bazi.dayPillar?.ganWuXing || ''}日主`);
  lines.push('');

  // 藏干
  lines.push('【地支藏干】');
  if (bazi.yearCangGan?.length > 0) {
    const yearCG = bazi.yearCangGan.map((c: any) => `${c.gan}(${c.shiShen})`).join('、');
    lines.push(`年支 ${bazi.yearPillar?.zhi} 藏：${yearCG}`);
  }
  if (bazi.monthCangGan?.length > 0) {
    const monthCG = bazi.monthCangGan.map((c: any) => `${c.gan}(${c.shiShen})`).join('、');
    lines.push(`月支 ${bazi.monthPillar?.zhi} 藏：${monthCG}`);
  }
  if (bazi.dayCangGan?.length > 0) {
    const dayCG = bazi.dayCangGan.map((c: any) => `${c.gan}(${c.shiShen})`).join('、');
    lines.push(`日支 ${bazi.dayPillar?.zhi} 藏：${dayCG}`);
  }
  if (bazi.hourCangGan?.length > 0) {
    const hourCG = bazi.hourCangGan.map((c: any) => `${c.gan}(${c.shiShen})`).join('、');
    lines.push(`時支 ${bazi.hourPillar?.zhi} 藏：${hourCG}`);
  }
  lines.push('');

  // 五行統計
  const wuxingCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar].forEach((p: any) => {
    if (p?.ganWuXing) wuxingCount[p.ganWuXing]++;
    if (p?.zhiWuXing) wuxingCount[p.zhiWuXing]++;
  });
  lines.push('【五行分佈（天干地支本氣）】');
  lines.push(`金：${wuxingCount['金']}，木：${wuxingCount['木']}，水：${wuxingCount['水']}，火：${wuxingCount['火']}，土：${wuxingCount['土']}`);
  lines.push('');

  // 月令
  lines.push('【月令】');
  lines.push(`${bazi.monthPillar?.zhi || ''}月（${bazi.monthPillar?.zhiWuXing || ''}）`);
  if (bazi.jieQi) {
    lines.push(`節氣：${bazi.jieQi}`);
  }
  lines.push('');

  // 大運
  if (bazi.daYun?.length > 0) {
    lines.push('【大運】');
    const dayunList = bazi.daYun.slice(0, 10);
    for (const dy of dayunList) {
      lines.push(`${dy.startAge}歲起：${dy.ganZhi}`);
    }
  }

  // 農曆資訊
  if (bazi.lunarInfo) {
    lines.push('');
    lines.push('【農曆資訊】');
    lines.push(`農曆：${bazi.lunarInfo.yearGanZhi}年 ${bazi.lunarInfo.month}月 ${bazi.lunarInfo.day}日`);
  }

  return lines.join('\n');
}
