/**
 * 調候分析模組
 * 
 * 調候是八字命理中的重要概念，根據出生月份的氣候特點，
 * 判斷命局是否需要調節寒暖燥濕，並找出調候用神。
 * 
 * 核心原則：
 * - 夏月生人，火炎土燥，喜水潤
 * - 冬月生人，天寒地凍，喜火暖
 * - 春月生人，餘寒猶在，也喜丙火暖局
 * - 秋月生人，金寒水冷，喜丁火調候
 */

import {
  TIAN_GAN, DI_ZHI, GAN_WU_XING, ZHI_WU_XING,
  GAN_HANRE_SCORE, ZHI_HANRE_SCORE, MONTH_HANRE_WEIGHT,
  TIAO_HOU_YONG_SHEN, ZHI_CANG_GAN,
  type TianGan, type DiZhi, type WuXing
} from './constants';
import type { FourPillars, TiaoHouAnalysis } from './types';

// ============ 寒暖燥濕計分 ============

/**
 * 計算八字的寒暖燥濕分數
 * 正值表示偏暖燥，負值表示偏寒濕
 */
export function calculateHanReScore(pillars: FourPillars): number {
  let score = 0;

  // 天干計分
  const gans: TianGan[] = [pillars.year.gan, pillars.month.gan, pillars.day.gan, pillars.hour.gan];
  for (const gan of gans) {
    score += GAN_HANRE_SCORE[gan] || 0;
  }

  // 地支計分（月支權重加倍）
  const zhis: DiZhi[] = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
  for (let i = 0; i < zhis.length; i++) {
    const zhi = zhis[i];
    const zhiScore = ZHI_HANRE_SCORE[zhi] || 0;

    // 月支是命局氣候的主要決定因素，權重加倍
    if (i === 1) {
      score += zhiScore * MONTH_HANRE_WEIGHT;
    } else {
      score += zhiScore;
    }
  }

  return score;
}

/**
 * 判斷調候狀態
 */
export function getTiaoHouStatus(score: number): 'cold' | 'balanced' | 'hot' {
  // 根據《八字命理學基礎教程》的建議：
  // -6 到 +6 之間為基本平衡
  // 小於 -6 為偏寒濕
  // 大於 +6 為偏暖燥
  if (score < -6) return 'cold';
  if (score > 6) return 'hot';
  return 'balanced';
}

// ============ 月令分析 ============

/**
 * 獲取月令的氣候特徵
 */
export function getMonthClimate(monthZhi: DiZhi): {
  season: string;
  climate: string;
  mainIssue: string;
} {
  const climateMap: Record<DiZhi, { season: string; climate: string; mainIssue: string }> = {
    '子': { season: '仲冬', climate: '寒冷', mainIssue: '天寒地凍' },
    '丑': { season: '季冬', climate: '寒濕', mainIssue: '餘寒未盡' },
    '寅': { season: '孟春', climate: '初暖', mainIssue: '餘寒猶存' },
    '卯': { season: '仲春', climate: '溫和', mainIssue: '木旺' },
    '辰': { season: '季春', climate: '溫潤', mainIssue: '濕土' },
    '巳': { season: '孟夏', climate: '漸熱', mainIssue: '火旺' },
    '午': { season: '仲夏', climate: '炎熱', mainIssue: '火炎土燥' },
    '未': { season: '季夏', climate: '燥熱', mainIssue: '土燥' },
    '申': { season: '孟秋', climate: '初涼', mainIssue: '金旺' },
    '酉': { season: '仲秋', climate: '涼爽', mainIssue: '金寒' },
    '戌': { season: '季秋', climate: '漸寒', mainIssue: '燥土' },
    '亥': { season: '孟冬', climate: '寒冷', mainIssue: '水旺寒侵' }
  };

  return climateMap[monthZhi];
}

/**
 * 判斷是否需要火暖局
 */
export function needsFireWarming(monthZhi: DiZhi): boolean {
  // 冬月（亥子丑）和初春（寅）需要火暖
  return ['亥', '子', '丑', '寅'].includes(monthZhi);
}

/**
 * 判斷是否需要水潤局
 */
export function needsWaterMoisture(monthZhi: DiZhi): boolean {
  // 夏月（巳午未）需要水潤
  return ['巳', '午', '未'].includes(monthZhi);
}

// ============ 調候用神查詢 ============

/**
 * 獲取調候用神
 * 根據日主和月令查詢《窮通寶鑑》的調候用神
 */
export function getTiaoHouYongShen(
  dayGan: TianGan,
  monthZhi: DiZhi
): { main: TianGan[]; auxiliary: TianGan[] } {
  const key = `${dayGan}${monthZhi}`;
  const cached = TIAO_HOU_YONG_SHEN[key];

  if (cached) {
    return cached;
  }

  // 如果沒有預定義的調候用神，根據基本規則推斷
  const dayWuXing = GAN_WU_XING[dayGan];
  const climate = getMonthClimate(monthZhi);

  // 冬月寒冷，喜丙火
  if (['亥', '子', '丑'].includes(monthZhi)) {
    return { main: ['丙'], auxiliary: ['丁', '甲'] };
  }

  // 夏月炎熱，喜壬癸水
  if (['巳', '午', '未'].includes(monthZhi)) {
    return { main: ['癸'], auxiliary: ['壬'] };
  }

  // 秋月金寒，喜丁火
  if (['申', '酉', '戌'].includes(monthZhi)) {
    return { main: ['丁'], auxiliary: ['丙'] };
  }

  // 春月餘寒，喜丙火
  if (['寅', '卯', '辰'].includes(monthZhi)) {
    return { main: ['丙'], auxiliary: ['癸'] };
  }

  return { main: [], auxiliary: [] };
}

/**
 * 檢查調候用神是否在命局中
 */
export function checkTiaoHouYongShenPresence(
  pillars: FourPillars,
  yongShen: TianGan[]
): {
  present: boolean;
  touChu: boolean;    // 是否透出天干
  cangZhi: boolean;   // 是否藏於地支
  details: string[];
} {
  const details: string[] = [];
  let touChu = false;
  let cangZhi = false;

  const gans: TianGan[] = [pillars.year.gan, pillars.month.gan, pillars.day.gan, pillars.hour.gan];
  const zhis: DiZhi[] = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];

  for (const ys of yongShen) {
    // 檢查是否透出
    if (gans.includes(ys)) {
      touChu = true;
      details.push(`調候用神${ys}透出天干`);
    }

    // 檢查是否藏於地支
    for (const zhi of zhis) {
      if (ZHI_CANG_GAN[zhi].includes(ys)) {
        cangZhi = true;
        details.push(`調候用神${ys}藏於${zhi}`);
      }
    }
  }

  return {
    present: touChu || cangZhi,
    touChu,
    cangZhi,
    details
  };
}

// ============ 完整調候分析 ============

/**
 * 進行完整的調候分析
 */
export function analyzeTiaoHou(pillars: FourPillars): TiaoHouAnalysis {
  const dayGan = pillars.day.gan;
  const monthZhi = pillars.month.zhi;

  // 計算寒暖燥濕分數
  const score = calculateHanReScore(pillars);
  const status = getTiaoHouStatus(score);

  // 獲取調候用神
  const yongShen = getTiaoHouYongShen(dayGan, monthZhi);

  // 判斷是否需要火或水調候
  const needsFire = needsFireWarming(monthZhi);
  const needsWater = needsWaterMoisture(monthZhi);

  return {
    score,
    status,
    needsFire,
    needsWater,
    mainYongShen: yongShen.main,
    auxiliaryYongShen: yongShen.auxiliary
  };
}

// ============ 調候重要性判斷 ============

/**
 * 判斷調候對此命局的重要程度
 * 
 * 調候重要的情況：
 * 1. 夏月（巳午未）生人，尤其是火土日主
 * 2. 冬月（亥子丑）生人，尤其是水木日主
 * 3. 命局偏燥或偏濕嚴重
 */
export function getTiaoHouImportance(
  pillars: FourPillars
): 'critical' | 'important' | 'moderate' | 'low' {
  const score = calculateHanReScore(pillars);
  const dayGan = pillars.day.gan;
  const monthZhi = pillars.month.zhi;
  const dayWuXing = GAN_WU_XING[dayGan];

  // 極端寒暖
  if (Math.abs(score) > 12) {
    return 'critical';
  }

  // 夏月火土日主
  if (['巳', '午', '未'].includes(monthZhi) && ['火', '土'].includes(dayWuXing)) {
    return 'critical';
  }

  // 冬月水木日主
  if (['亥', '子', '丑'].includes(monthZhi) && ['水', '木'].includes(dayWuXing)) {
    return 'critical';
  }

  // 偏燥偏濕
  if (Math.abs(score) > 8) {
    return 'important';
  }

  // 需要調候的季節
  if (needsFireWarming(monthZhi) || needsWaterMoisture(monthZhi)) {
    return 'moderate';
  }

  return 'low';
}

/**
 * 生成調候分析報告
 */
export function generateTiaoHouReport(pillars: FourPillars): string {
  const analysis = analyzeTiaoHou(pillars);
  const importance = getTiaoHouImportance(pillars);
  const monthClimate = getMonthClimate(pillars.month.zhi);
  const presence = checkTiaoHouYongShenPresence(pillars, analysis.mainYongShen);

  let report = '';

  // 月令氣候
  report += `月令${pillars.month.zhi}（${monthClimate.season}），氣候${monthClimate.climate}。\n`;
  report += `主要問題：${monthClimate.mainIssue}。\n\n`;

  // 寒暖燥濕
  report += `寒暖燥濕分數：${analysis.score}（`;
  if (analysis.status === 'cold') {
    report += '偏寒濕';
  } else if (analysis.status === 'hot') {
    report += '偏暖燥';
  } else {
    report += '基本平衡';
  }
  report += '）。\n\n';

  // 調候用神
  if (analysis.mainYongShen.length > 0) {
    report += `調候用神：${analysis.mainYongShen.join('、')}`;
    if (analysis.auxiliaryYongShen.length > 0) {
      report += `，輔助：${analysis.auxiliaryYongShen.join('、')}`;
    }
    report += '。\n';

    // 用神是否出現
    if (presence.present) {
      report += '調候用神現於命局：';
      report += presence.details.join('；') + '。\n';
    } else {
      report += '調候用神不現，需要運程補充。\n';
    }
  }

  // 調候重要性
  report += '\n調候重要性：';
  switch (importance) {
    case 'critical':
      report += '極重要（調候為先）';
      break;
    case 'important':
      report += '重要';
      break;
    case 'moderate':
      report += '中等';
      break;
    case 'low':
      report += '較低';
      break;
  }

  return report;
}
