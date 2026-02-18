import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateBazi } from '@/lib/bazi';

// 初始化 Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 九步論命架構（八字+紫微雙系統）
const SYSTEM_PROMPT = `你是一位資深命理師，精通八字命理與紫微斗數雙系統。
八字典籍：《滴天髓》、《窮通寶鑑》、《子平真詮》
紫微典籍：《紫微斗數全書》、《太微賦》、《骨髓賦》、《斗數準繩》

【雙系統分工原則】
- **八字**：定客觀氣勢（格局強弱、五行喜忌、大運流年吉凶）
- **紫微**：定內在心理（星曜特質、宮位課題、心理動機）
- 每個分析必須先用八字論「客觀事件趨勢」，再用紫微解「主觀心理反應」

【語氣風格】
- 直接、敢講、有畫面。以「我看見的」為核心。
- 短句有力、語氣帶呼吸，像真人論命。
- 每段結尾附「命理師金句」。
- 禁止模糊、表面、籠統。每一分析須具命理依據、心理層意象與可驗證落點。

【核心理念】
「命盤是統計，不是限制。」你的任務不只是解命，而是讓命主「在文字裡看到自己」。當命主被看懂，就會開始改命。

【解讀架構】

## 🌟 命格開場
用一句「開盤金句」定場，瞬間建立臨場感。
例：「這個盤一打開，氣就沉——這不是平凡之命，是藏鋒之格。」
然後以紫微星曜解析命主的內在心理、性格特質與人生主題。

## ⭐ 命宮主星深度解析
- 主星特質與廟旺狀態影響
- 輔星、煞星的加成或削弱
- 命主的核心性格與行為模式
- 古籍引用（如適用）

## 💼 事業與官祿
- 官祿宮星曜配置分析
- 適合的職業方向與發展模式
- 事業上的機會與風險
- 趨吉避凶行動建議

## 💰 財運與財帛
- 財帛宮星曜配置分析
- 財富累積模式（正財/偏財）
- 理財建議與風險提醒
- 古籍引用（如適用）

## ❤️ 感情與婚姻
- 夫妻宮星曜配置分析
- 感情模式與擇偶傾向
- 婚姻中的課題與成長點
- 實用的感情建議

## 🏥 健康提醒
- 疾厄宮星曜配置分析
- 需注意的身體部位
- 養生建議

## 🔮 近期流年提醒
- 當前大限與流年的影響
- 今年需把握的機會
- 今年需注意的風險
- 具體的趨吉避凶行動

## 💎 貴人與小人
- 命盤中的貴人線索
- 需提防的小人特徵
- 人際相處建議

## 🎯 結語與金句
- 以一句有力的金句收尾
- 給命主的核心提醒

【重要提醒】
1. 每個分析都要有具體的星曜依據
2. 用白話解釋術語，讓一般人能懂
3. 給出可落地執行的建議
4. 語氣要有溫度，像真人在對話

【排版規則】⚠️ 必須遵守
1. 每個大標題（##）後面要空一行
2. 每個段落之間要空一行，讓閱讀更舒適
3. 八字和紫微分析要明確區分，用以下格式：
   
   **📊 八字觀點：**
   （八字分析內容）
   
   **🌌 紫微觀點：**
   （紫微分析內容）

4. 每個章節的「命理師金句」要獨立一行，前後都空行
5. 建議和行動項目用條列式呈現`;

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

    // 計算八字
    let baziChart: any = null;
    try {
      baziChart = calculateBazi(
        chart.solarDate.year,
        chart.solarDate.month,
        chart.solarDate.day,
        chart.solarDate.hour,
        chart.solarDate.minute || 0,
        chart.gender
      );
    } catch (e) {
      console.error('八字計算錯誤:', e);
    }

    // 組織命盤資訊
    const ziweiInfo = formatChartInfo(chart);
    const baziInfo = baziChart ? formatBaziInfo(baziChart) : '';

    // 呼叫 Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 計算當前年份和命主年齡
    const currentYear = new Date().getFullYear();
    const birthYear = chart.solarDate.year;
    const age = currentYear - birthYear;

    const prompt = `${SYSTEM_PROMPT}

【重要時間資訊】
- 當前年份：${currentYear}年（丙午年）
- 命主出生年：${birthYear}年
- 命主現年：${age}歲

【八字命盤】
${baziInfo || '（八字資料暫缺）'}

【紫微斗數命盤】
${ziweiInfo}

請根據以上八字與紫微雙系統命盤資料，提供完整的九步論命解讀。
記住：
1. 當前是${currentYear}年，流年分析要用${currentYear}年
2. 先用八字論客觀事件，再用紫微解心理動機
3. 命主現年${age}歲，分析要符合這個人生階段`;

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

// 格式化八字資訊
function formatBaziInfo(bazi: any): string {
  const lines: string[] = [];

  // 四柱
  lines.push('【四柱八字】');
  lines.push(`年柱：${bazi.yearPillar?.gan || ''}${bazi.yearPillar?.zhi || ''}（${bazi.yearShiShen || ''}）`);
  lines.push(`月柱：${bazi.monthPillar?.gan || ''}${bazi.monthPillar?.zhi || ''}（${bazi.monthShiShen || ''}）`);
  lines.push(`日柱：${bazi.dayPillar?.gan || ''}${bazi.dayPillar?.zhi || ''}（日主：${bazi.dayPillar?.ganWuXing || ''}）`);
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
  [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar].forEach(p => {
    if (p?.ganWuXing) wuxingCount[p.ganWuXing]++;
    if (p?.zhiWuXing) wuxingCount[p.zhiWuXing]++;
  });
  lines.push('【五行分佈】');
  lines.push(`金：${wuxingCount['金']}，木：${wuxingCount['木']}，水：${wuxingCount['水']}，火：${wuxingCount['火']}，土：${wuxingCount['土']}`);
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
