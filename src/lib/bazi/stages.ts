/**
 * 人生階段分析模組
 * 
 * 根據大運將人生分成不同階段，並標記每個階段的重點與特色。
 * 
 * 傳統人生階段劃分：
 * - 0-15歲：成長期（依賴父母，學習基礎）
 * - 16-30歲：學習期（求學、立志、打基礎）
 * - 31-45歲：拼搏期（事業拓展、成家立業）
 * - 46-60歲：收穫期（積累成果、穩定發展）
 * - 61-75歲：智慧期（經驗傳承、享受生活）
 * - 76歲以上：頤養期（安享晚年）
 */

// @ts-nocheck
import {
  type TianGan, type DiZhi, type WuXing, type ShiShen,
  GAN_WU_XING
} from './constants';
import type { DaYunInfo, FourPillars, Gender } from './types';
import { getShiShen, getZhiShiShen, isCai, isGuanSha, isYin, isBiJie, isShiShang } from './shiShen';

// ============ 類型定義 ============

export type LifeStageType = 
  | 'growth'      // 成長期
  | 'learning'    // 學習期
  | 'striving'    // 拼搏期
  | 'harvesting'  // 收穫期
  | 'wisdom'      // 智慧期
  | 'retirement'; // 頤養期

export interface LifeStage {
  type: LifeStageType;
  name: string;             // 階段名稱
  startAge: number;         // 起始年齡
  endAge: number;           // 結束年齡
  daYunList: DaYunInfo[];   // 該階段包含的大運
  theme: string;            // 階段主題
  focus: string[];          // 階段重點
  challenges: string[];     // 可能挑戰
  opportunities: string[];  // 發展機會
  advice: string[];         // 建議
}

export interface LifeStageAnalysis {
  stages: LifeStage[];
  currentStage: LifeStage | null;
  keyTurningPoints: TurningPoint[];
  overallPattern: string;   // 整體人生模式
}

export interface TurningPoint {
  age: number;
  year: number;
  description: string;
  type: 'opportunity' | 'challenge' | 'transition';
  daYun: DaYunInfo;
}

// ============ 階段劃分 ============

const STAGE_DEFINITIONS: { type: LifeStageType; name: string; minAge: number; maxAge: number; theme: string }[] = [
  { type: 'growth', name: '成長期', minAge: 0, maxAge: 15, theme: '養育與啟蒙' },
  { type: 'learning', name: '學習期', minAge: 16, maxAge: 30, theme: '求學與立志' },
  { type: 'striving', name: '拼搏期', minAge: 31, maxAge: 45, theme: '開創與拼搏' },
  { type: 'harvesting', name: '收穫期', minAge: 46, maxAge: 60, theme: '積累與收成' },
  { type: 'wisdom', name: '智慧期', minAge: 61, maxAge: 75, theme: '傳承與總結' },
  { type: 'retirement', name: '頤養期', minAge: 76, maxAge: 100, theme: '安養與圓滿' }
];

// ============ 階段分析函數 ============

/**
 * 分析人生各階段
 */
export function analyzeLifeStages(
  daYunList: DaYunInfo[],
  dayGan: TianGan,
  gender: Gender,
  birthYear: number,
  currentAge?: number
): LifeStageAnalysis {
  const stages: LifeStage[] = [];
  
  for (const def of STAGE_DEFINITIONS) {
    // 找出屬於這個階段的大運
    const stageDaYun = daYunList.filter(dy => {
      // 大運與階段有重疊
      return dy.startAge < def.maxAge && dy.endAge > def.minAge;
    });

    if (stageDaYun.length === 0) continue;

    const stage = createLifeStage(def, stageDaYun, dayGan, gender);
    stages.push(stage);
  }

  // 找出當前階段
  const currentStage = currentAge 
    ? stages.find(s => currentAge >= s.startAge && currentAge <= s.endAge) || null
    : null;

  // 找出關鍵轉折點
  const keyTurningPoints = findTurningPoints(daYunList, dayGan, birthYear);

  // 分析整體模式
  const overallPattern = analyzeOverallPattern(daYunList, dayGan);

  return {
    stages,
    currentStage,
    keyTurningPoints,
    overallPattern
  };
}

/**
 * 建立人生階段詳情
 */
function createLifeStage(
  def: typeof STAGE_DEFINITIONS[0],
  daYunList: DaYunInfo[],
  dayGan: TianGan,
  gender: Gender
): LifeStage {
  // 分析這個階段的大運特色
  const wuXingTrend = analyzeStageWuXing(daYunList);
  const shiShenTrend = analyzeStageShiShen(daYunList);
  
  // 根據階段類型和大運特色生成建議
  const { focus, challenges, opportunities, advice } = generateStageAnalysis(
    def.type, wuXingTrend, shiShenTrend, dayGan, gender
  );

  // 計算實際的起止年齡（取大運的實際範圍與階段定義的交集）
  const startAge = Math.max(def.minAge, Math.min(...daYunList.map(d => d.startAge)));
  const endAge = Math.min(def.maxAge, Math.max(...daYunList.map(d => d.endAge)));

  return {
    type: def.type,
    name: def.name,
    startAge,
    endAge,
    daYunList,
    theme: def.theme,
    focus,
    challenges,
    opportunities,
    advice
  };
}

/**
 * 分析階段五行趨勢
 */
function analyzeStageWuXing(daYunList: DaYunInfo[]): Record<WuXing, number> {
  const count: Record<WuXing, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  for (const dy of daYunList) {
    count[dy.ganWuXing]++;
    count[dy.zhiWuXing]++;
  }
  
  return count;
}

/**
 * 分析階段十神趨勢
 */
function analyzeStageShiShen(daYunList: DaYunInfo[]): Record<ShiShen, number> {
  const count: Record<ShiShen, number> = {
    '比肩': 0, '劫財': 0, '食神': 0, '傷官': 0,
    '偏財': 0, '正財': 0, '七殺': 0, '正官': 0,
    '偏印': 0, '正印': 0
  };

  for (const dy of daYunList) {
    count[dy.ganShiShen]++;
    count[dy.zhiShiShen]++;
  }

  return count;
}

/**
 * 根據階段和運勢特色生成分析
 */
function generateStageAnalysis(
  stageType: LifeStageType,
  wuXing: Record<WuXing, number>,
  shiShen: Record<ShiShen, number>,
  dayGan: TianGan,
  gender: Gender
): { focus: string[]; challenges: string[]; opportunities: string[]; advice: string[] } {
  const focus: string[] = [];
  const challenges: string[] = [];
  const opportunities: string[] = [];
  const advice: string[] = [];

  // 找出主要十神
  const mainShiShen = Object.entries(shiShen)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([ss]) => ss as ShiShen);

  // 根據階段添加通用建議
  switch (stageType) {
    case 'growth':
      focus.push('培養良好習慣', '建立學習基礎', '發展興趣愛好');
      advice.push('此時重要的是打好基礎，不必過於強求成績');
      break;
    case 'learning':
      focus.push('確立人生方向', '積累專業技能', '建立人脈網絡');
      advice.push('把握學習黃金期，不斷充實自己');
      break;
    case 'striving':
      focus.push('事業發展', '家庭建設', '財富積累');
      advice.push('這是人生的關鍵期，需要全力以赴');
      break;
    case 'harvesting':
      focus.push('鞏固成果', '培養後進', '規劃退休');
      advice.push('穩中求進，不宜冒進');
      break;
    case 'wisdom':
      focus.push('經驗傳承', '身心調養', '家庭和睦');
      advice.push('享受生活，但也要保持適度活動');
      break;
    case 'retirement':
      focus.push('身體健康', '精神生活', '天倫之樂');
      advice.push('放慢腳步，享受當下');
      break;
  }

  // 根據主要十神添加具體建議
  for (const ss of mainShiShen) {
    switch (ss) {
      case '正財':
      case '偏財':
        opportunities.push('財運亨通，有投資理財機會');
        if (stageType === 'striving' || stageType === 'harvesting') {
          advice.push('適合穩健投資，注意財務規劃');
        }
        break;
      case '正官':
        opportunities.push('有晉升機會，適合從政或管理工作');
        advice.push('注重名譽，謹言慎行');
        break;
      case '七殺':
        challenges.push('競爭壓力較大，需注意健康');
        opportunities.push('適合開創事業，有突破機會');
        advice.push('化壓力為動力，但要注意休息');
        break;
      case '正印':
      case '偏印':
        opportunities.push('學業運佳，適合進修深造');
        if (stageType === 'learning') {
          advice.push('把握學習機會，考取證照或學位');
        }
        break;
      case '食神':
        opportunities.push('創意豐富，適合藝術或技術工作');
        advice.push('發揮才華，但要注意實際效益');
        break;
      case '傷官':
        challenges.push('思想活躍但易與人衝突');
        opportunities.push('適合創新、創業或自由職業');
        advice.push('收斂鋒芒，學會圓融處事');
        break;
      case '比肩':
      case '劫財':
        challenges.push('競爭較多，需防小人');
        opportunities.push('適合合作創業，團隊合作');
        advice.push('廣結善緣，但要慎選合作夥伴');
        break;
    }
  }

  // 五行相關建議
  const dominantWuXing = Object.entries(wuXing)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as WuXing;

  if (dominantWuXing) {
    switch (dominantWuXing) {
      case '木':
        advice.push('適宜向東方發展，從事文教、醫療相關行業');
        break;
      case '火':
        advice.push('精力充沛時期，適合拓展業務');
        break;
      case '土':
        advice.push('穩定期，適合置產、發展不動產');
        break;
      case '金':
        advice.push('適合從事金融、機械相關行業');
        break;
      case '水':
        advice.push('適合流通、旅遊相關事業');
        break;
    }
  }

  return { focus, challenges, opportunities, advice };
}

// ============ 轉折點分析 ============

/**
 * 找出人生關鍵轉折點
 */
function findTurningPoints(
  daYunList: DaYunInfo[],
  dayGan: TianGan,
  birthYear: number
): TurningPoint[] {
  const turningPoints: TurningPoint[] = [];

  for (let i = 0; i < daYunList.length - 1; i++) {
    const current = daYunList[i];
    const next = daYunList[i + 1];

    // 檢查大運交接點
    const transitionAge = next.startAge;
    const transitionYear = birthYear + transitionAge - 1;

    // 判斷轉折類型
    let type: 'opportunity' | 'challenge' | 'transition' = 'transition';
    let description = `進入${next.ganZhi}大運`;

    // 分析新舊大運的變化
    const currentMainShiShen = current.ganShiShen;
    const nextMainShiShen = next.ganShiShen;

    // 財官印食神大運通常是機會
    if (['正財', '偏財', '正官', '正印', '食神'].includes(nextMainShiShen)) {
      type = 'opportunity';
      description += `，${nextMainShiShen}運，運勢向好`;
    }
    // 七殺傷官劫財大運需要注意
    else if (['七殺', '傷官', '劫財'].includes(nextMainShiShen)) {
      type = 'challenge';
      description += `，${nextMainShiShen}運，需謹慎應對`;
    }

    // 五行大變化也是轉折點
    if (current.ganWuXing !== next.ganWuXing && current.zhiWuXing !== next.zhiWuXing) {
      description += `，五行由${current.ganWuXing}${current.zhiWuXing}轉${next.ganWuXing}${next.zhiWuXing}`;
    }

    turningPoints.push({
      age: transitionAge,
      year: transitionYear,
      description,
      type,
      daYun: next
    });
  }

  return turningPoints;
}

// ============ 整體模式分析 ============

/**
 * 分析整體人生模式
 */
function analyzeOverallPattern(daYunList: DaYunInfo[], dayGan: TianGan): string {
  // 統計各階段的十神分佈
  const earlyDaYun = daYunList.filter(d => d.startAge < 30);
  const midDaYun = daYunList.filter(d => d.startAge >= 30 && d.startAge < 50);
  const lateDaYun = daYunList.filter(d => d.startAge >= 50);

  const patterns: string[] = [];

  // 早年運分析
  if (earlyDaYun.length > 0) {
    const earlyShiShen = earlyDaYun.map(d => d.ganShiShen);
    if (earlyShiShen.some(s => isYin(s))) {
      patterns.push('早年得印，學業運佳');
    }
    if (earlyShiShen.some(s => isGuanSha(s))) {
      patterns.push('少年多磨練，可成大器');
    }
    if (earlyShiShen.some(s => isCai(s))) {
      patterns.push('早年見財，家境優渥');
    }
  }

  // 中年運分析
  if (midDaYun.length > 0) {
    const midShiShen = midDaYun.map(d => d.ganShiShen);
    if (midShiShen.some(s => isCai(s))) {
      patterns.push('中年財運亨通');
    }
    if (midShiShen.some(s => isGuanSha(s))) {
      patterns.push('中年事業有成');
    }
    if (midShiShen.some(s => isShiShang(s))) {
      patterns.push('中年創意發揮，適合自主發展');
    }
  }

  // 晚年運分析
  if (lateDaYun.length > 0) {
    const lateShiShen = lateDaYun.map(d => d.ganShiShen);
    if (lateShiShen.some(s => isYin(s))) {
      patterns.push('晚年得子女福，安享天年');
    }
    if (lateShiShen.some(s => isCai(s))) {
      patterns.push('晚年財運不斷，生活無憂');
    }
    if (lateShiShen.some(s => isBiJie(s))) {
      patterns.push('晚年人緣佳，但需防破財');
    }
  }

  // 整體趨勢
  const allWuXing = daYunList.flatMap(d => [d.ganWuXing, d.zhiWuXing]);
  const wuXingCount: Record<WuXing, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  allWuXing.forEach(wx => wuXingCount[wx]++);

  const dominant = Object.entries(wuXingCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([wx]) => wx);

  patterns.push(`一生運勢以${dominant.join('')}為主調`);

  return patterns.join('；') + '。';
}

// ============ 便捷函數 ============

/**
 * 獲取當前人生階段
 */
export function getCurrentLifeStage(
  daYunList: DaYunInfo[],
  dayGan: TianGan,
  gender: Gender,
  birthYear: number,
  currentAge: number
): LifeStage | null {
  const analysis = analyzeLifeStages(daYunList, dayGan, gender, birthYear, currentAge);
  return analysis.currentStage;
}

/**
 * 生成人生階段報告
 */
export function generateLifeStageReport(analysis: LifeStageAnalysis): string {
  let report = '【人生階段分析】\n\n';

  for (const stage of analysis.stages) {
    report += `▸ ${stage.name}（${stage.startAge}-${stage.endAge}歲）\n`;
    report += `  主題：${stage.theme}\n`;
    
    if (stage.daYunList.length > 0) {
      report += `  大運：${stage.daYunList.map(d => d.ganZhi).join(' → ')}\n`;
    }
    
    if (stage.focus.length > 0) {
      report += `  重點：${stage.focus.join('、')}\n`;
    }
    
    if (stage.opportunities.length > 0) {
      report += `  機會：${stage.opportunities.join('；')}\n`;
    }
    
    if (stage.challenges.length > 0) {
      report += `  挑戰：${stage.challenges.join('；')}\n`;
    }
    
    if (stage.advice.length > 0) {
      report += `  建議：${stage.advice[0]}\n`;
    }
    
    report += '\n';
  }

  if (analysis.keyTurningPoints.length > 0) {
    report += '【關鍵轉折點】\n';
    for (const tp of analysis.keyTurningPoints.slice(0, 5)) {
      const icon = tp.type === 'opportunity' ? '⬆' : tp.type === 'challenge' ? '⬇' : '↔';
      report += `  ${icon} ${tp.age}歲（${tp.year}年）：${tp.description}\n`;
    }
    report += '\n';
  }

  report += `【整體評析】\n  ${analysis.overallPattern}\n`;

  return report;
}
