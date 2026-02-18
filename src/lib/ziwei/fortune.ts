/**
 * 流年流月運勢計算
 * 
 * 根據流年命宮、流月命宮所在位置的星曜組合，計算運勢吉凶
 */

import { DI_ZHI, GONG_NAMES, TIAN_GAN } from './constants';
import { calculateLiunian, getYearGanZhi, type LiunianInfo } from './liunian';
import { calculateLiuyue, type LiuyueInfo } from './liuyue';
import { calculateSiHua, type SiHuaResult } from './sihua';
import type { ZiweiChart, GongInfo, StarInfo } from './index';

/**
 * 運勢等級（1-10）
 * 1-3: 較差，需注意
 * 4-6: 平穩
 * 7-10: 順利，有機會
 */
export type FortuneLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * 運勢類型
 */
export type FortuneType = 'excellent' | 'good' | 'neutral' | 'caution' | 'challenge';

/**
 * 月運勢資訊
 */
export interface MonthlyFortune {
  /** 月份（1-12） */
  month: number;
  /** 農曆月份名稱 */
  monthName: string;
  /** 運勢等級（1-10） */
  level: FortuneLevel;
  /** 運勢類型 */
  type: FortuneType;
  /** 流月命宮所在宮位名稱（本命盤） */
  gongName: string;
  /** 流月命宮地支 */
  gongZhi: string;
  /** 該宮位的主星 */
  mainStars: string[];
  /** 該宮位的吉星 */
  goodStars: string[];
  /** 該宮位的煞星 */
  badStars: string[];
  /** 流月四化 */
  siHua: SiHuaResult;
  /** 關鍵字標籤 */
  keywords: string[];
  /** 簡短解析 */
  summary: string;
  /** 詳細解析 */
  detail: string;
}

/**
 * 年度運勢資訊
 */
export interface YearlyFortune {
  /** 西元年 */
  year: number;
  /** 流年干支 */
  ganZhi: string;
  /** 虛歲 */
  age: number;
  /** 年度總運勢等級 */
  overallLevel: number;
  /** 年度運勢類型 */
  overallType: FortuneType;
  /** 流年命宮所在宮位名稱 */
  gongName: string;
  /** 流年命宮地支 */
  gongZhi: string;
  /** 該宮位的主星 */
  mainStars: string[];
  /** 流年四化 */
  siHua: SiHuaResult;
  /** 年度關鍵字 */
  keywords: string[];
  /** 年度總評 */
  summary: string;
  /** 12 個月的運勢 */
  months: MonthlyFortune[];
  /** 最佳月份 */
  bestMonths: number[];
  /** 需注意月份 */
  cautionMonths: number[];
}

// 吉星列表
const GOOD_STARS = ['左輔', '右弼', '文昌', '文曲', '天魁', '天鉞', '祿存', '天馬'];

// 煞星列表
const BAD_STARS = ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'];

// 主星吉凶特性（基本判斷用）
const STAR_NATURE: Record<string, 'good' | 'neutral' | 'mixed'> = {
  '紫微': 'good',
  '天機': 'neutral',
  '太陽': 'good',
  '武曲': 'mixed',
  '天同': 'good',
  '廉貞': 'mixed',
  '天府': 'good',
  '太陰': 'good',
  '貪狼': 'mixed',
  '巨門': 'mixed',
  '天相': 'good',
  '天梁': 'good',
  '七殺': 'mixed',
  '破軍': 'mixed',
};

// 主星亮度加分
const BRIGHTNESS_BONUS: Record<string, number> = {
  '廟': 2,
  '旺': 1.5,
  '得地': 1,
  '利': 0.5,
  '平': 0,
  '不得地': -0.5,
  '落陷': -1,
};

// 月份名稱
const MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', 
                     '七月', '八月', '九月', '十月', '十一月', '十二月'];

/**
 * 根據宮位的星曜組合計算運勢分數
 */
function calculateFortuneScore(gong: GongInfo, siHua: SiHuaResult): number {
  let score = 5; // 基礎分數

  // 主星評分
  for (const star of gong.mainStars) {
    const nature = STAR_NATURE[star.name];
    if (nature === 'good') score += 1;
    else if (nature === 'mixed') score += 0.3;
    
    // 亮度加分
    if (star.brightness) {
      score += BRIGHTNESS_BONUS[star.brightness] || 0;
    }
    
    // 四化加分
    if (star.siHua === '祿') score += 1.5;
    else if (star.siHua === '權') score += 1;
    else if (star.siHua === '科') score += 0.8;
    else if (star.siHua === '忌') score -= 1.5;
  }

  // 吉星加分
  const goodStarCount = gong.assistStars.filter(s => 
    GOOD_STARS.includes(s.name)
  ).length;
  score += goodStarCount * 0.6;

  // 祿存天馬
  const hasLucun = gong.otherStars.some(s => s.name === '祿存');
  const hasTianma = gong.otherStars.some(s => s.name === '天馬');
  if (hasLucun) score += 0.8;
  if (hasTianma) score += 0.5;
  if (hasLucun && hasTianma) score += 0.5; // 祿馬交馳額外加分

  // 煞星扣分
  for (const star of gong.shaStars) {
    score -= 0.8;
    // 火鈴較輕，羊陀較重
    if (['擎羊', '陀羅'].includes(star.name)) {
      score -= 0.3;
    }
    // 空劫
    if (['地空', '地劫'].includes(star.name)) {
      score -= 0.5;
    }
  }

  // 確保分數在 1-10 之間
  return Math.max(1, Math.min(10, Math.round(score)));
}

/**
 * 將分數轉換為運勢類型
 */
function scoreToType(score: number): FortuneType {
  if (score >= 8) return 'excellent';
  if (score >= 6.5) return 'good';
  if (score >= 4.5) return 'neutral';
  if (score >= 3) return 'caution';
  return 'challenge';
}

/**
 * 生成月份關鍵字
 */
function generateKeywords(gong: GongInfo, siHua: SiHuaResult): string[] {
  const keywords: string[] = [];

  // 根據宮位名稱添加關鍵字
  const gongKeywords: Record<string, string[]> = {
    '命宮': ['自我', '行動力'],
    '兄弟': ['人際', '合作'],
    '夫妻': ['感情', '伴侶'],
    '子女': ['創意', '投資'],
    '財帛': ['財運', '收入'],
    '疾厄': ['健康', '壓力'],
    '遷移': ['外出', '機會'],
    '交友': ['社交', '貴人'],
    '官祿': ['事業', '考試'],
    '田宅': ['家庭', '不動產'],
    '福德': ['心情', '享受'],
    '父母': ['長輩', '文書'],
  };
  
  if (gongKeywords[gong.name]) {
    keywords.push(...gongKeywords[gong.name]);
  }

  // 根據四化添加關鍵字
  for (const star of gong.mainStars) {
    if (star.siHua === '祿') keywords.push('財運佳');
    else if (star.siHua === '權') keywords.push('掌權');
    else if (star.siHua === '科') keywords.push('名聲');
    else if (star.siHua === '忌') keywords.push('注意');
  }

  // 根據特殊星曜組合
  const hasLucun = gong.otherStars.some(s => s.name === '祿存');
  const hasTianma = gong.otherStars.some(s => s.name === '天馬');
  if (hasLucun && hasTianma) keywords.push('祿馬交馳');
  
  const hasSha = gong.shaStars.length > 0;
  if (hasSha && gong.shaStars.length >= 2) keywords.push('煞星聚');

  return keywords.slice(0, 4);
}

/**
 * 生成月份解析
 */
function generateSummary(
  gong: GongInfo, 
  type: FortuneType, 
  month: number
): string {
  const gongDesc: Record<string, string> = {
    '命宮': '自身運勢',
    '兄弟': '人際互動',
    '夫妻': '感情關係',
    '子女': '創意投資',
    '財帛': '財務狀況',
    '疾厄': '身心健康',
    '遷移': '外出發展',
    '交友': '社交人脈',
    '官祿': '事業表現',
    '田宅': '家庭房產',
    '福德': '心靈狀態',
    '父母': '長輩文書',
  };

  const typeDesc: Record<FortuneType, string> = {
    'excellent': '大吉，把握機會積極行動',
    'good': '順利，穩步向前',
    'neutral': '平穩，維持現狀',
    'caution': '宜謹慎，避免衝動',
    'challenge': '有挑戰，韜光養晦',
  };

  const desc = gongDesc[gong.name] || gong.name;
  return `${MONTH_NAMES[month - 1]}流月命宮落${gong.name}，${desc}${typeDesc[type]}。`;
}

/**
 * 生成詳細解析
 */
function generateDetail(
  gong: GongInfo,
  type: FortuneType,
  month: number,
  siHua: SiHuaResult
): string {
  const lines: string[] = [];
  
  lines.push(`本月流月命宮落在本命${gong.name}（${gong.gan}${gong.zhi}）。`);

  // 主星描述
  if (gong.mainStars.length > 0) {
    const starNames = gong.mainStars.map(s => {
      let name = s.name;
      if (s.brightness) name += `(${s.brightness})`;
      if (s.siHua) name += `化${s.siHua}`;
      return name;
    }).join('、');
    lines.push(`宮內主星：${starNames}。`);
  } else {
    lines.push('本宮無主星，借對宮星曜判斷。');
  }

  // 吉星
  if (gong.assistStars.length > 0) {
    const names = gong.assistStars.map(s => s.name).join('、');
    lines.push(`有吉星${names}相助，增添助力。`);
  }

  // 煞星
  if (gong.shaStars.length > 0) {
    const names = gong.shaStars.map(s => s.name).join('、');
    lines.push(`但有${names}煞星，行事宜謹慎。`);
  }

  // 祿馬
  const hasLucun = gong.otherStars.some(s => s.name === '祿存');
  const hasTianma = gong.otherStars.some(s => s.name === '天馬');
  if (hasLucun && hasTianma) {
    lines.push('祿存天馬同宮，祿馬交馳，財運亨通。');
  } else if (hasLucun) {
    lines.push('祿存守照，財運穩定。');
  } else if (hasTianma) {
    lines.push('天馬星動，利於外出與變動。');
  }

  // 建議
  const suggestions: Record<FortuneType, string> = {
    'excellent': '本月運勢極佳，適合大膽行動、把握機會。',
    'good': '本月運勢不錯，穩中求進，可有所作為。',
    'neutral': '本月運勢平穩，維持現狀，靜待時機。',
    'caution': '本月運勢需注意，避免冒進，凡事三思。',
    'challenge': '本月運勢較弱，宜韜光養晦，積蓄能量。',
  };
  lines.push(suggestions[type]);

  return lines.join('\n');
}

/**
 * 計算單月運勢
 */
export function calculateMonthlyFortune(
  chart: ZiweiChart,
  year: number,
  month: number,
  liunianInfo: LiunianInfo
): MonthlyFortune {
  // 計算流月
  const liuyue = calculateLiuyue(
    liunianInfo.tianGan,
    liunianInfo.mingGongIndex,
    month,
    chart.mingGong.zhiIndex
  );

  // 找到流月命宮對應的本命宮位
  const gong = chart.gongs.find(g => g.zhiIndex === liuyue.mingGongIndex);
  
  if (!gong) {
    // 如果找不到，返回預設值
    return {
      month,
      monthName: MONTH_NAMES[month - 1],
      level: 5 as FortuneLevel,
      type: 'neutral',
      gongName: liuyue.mingGongName,
      gongZhi: liuyue.mingGongZhi,
      mainStars: [],
      goodStars: [],
      badStars: [],
      siHua: liuyue.siHua,
      keywords: [],
      summary: `${MONTH_NAMES[month - 1]}運勢平穩。`,
      detail: '',
    };
  }

  // 計算分數
  const score = calculateFortuneScore(gong, liuyue.siHua);
  const level = score as FortuneLevel;
  const type = scoreToType(score);

  // 提取星曜名稱
  const mainStars = gong.mainStars.map(s => s.name);
  const goodStars = gong.assistStars
    .filter(s => GOOD_STARS.includes(s.name))
    .map(s => s.name)
    .concat(gong.otherStars.filter(s => GOOD_STARS.includes(s.name)).map(s => s.name));
  const badStars = gong.shaStars.map(s => s.name);

  // 生成解析
  const keywords = generateKeywords(gong, liuyue.siHua);
  const summary = generateSummary(gong, type, month);
  const detail = generateDetail(gong, type, month, liuyue.siHua);

  return {
    month,
    monthName: MONTH_NAMES[month - 1],
    level,
    type,
    gongName: liuyue.mingGongName,
    gongZhi: liuyue.mingGongZhi,
    mainStars,
    goodStars,
    badStars,
    siHua: liuyue.siHua,
    keywords,
    summary,
    detail,
  };
}

/**
 * 計算年度運勢（含 12 個月）
 */
export function calculateYearlyFortune(
  chart: ZiweiChart,
  year: number
): YearlyFortune {
  // 計算虛歲
  const age = year - chart.solarDate.year + 1;
  
  // 計算流年
  const liunianInfo = calculateLiunian(year, chart.mingGong.zhiIndex);
  
  // 找到流年命宮對應的本命宮位
  const yearGong = chart.gongs.find(g => g.zhiIndex === liunianInfo.mingGongIndex);
  
  // 計算 12 個月的運勢
  const months: MonthlyFortune[] = [];
  for (let m = 1; m <= 12; m++) {
    months.push(calculateMonthlyFortune(chart, year, m, liunianInfo));
  }

  // 計算年度總分（加權平均）
  const avgScore = months.reduce((sum, m) => sum + m.level, 0) / 12;
  const overallLevel = Math.round(avgScore);
  const overallType = scoreToType(avgScore);

  // 找出最佳和需注意的月份
  const sortedMonths = [...months].sort((a, b) => b.level - a.level);
  const bestMonths = sortedMonths.slice(0, 3).map(m => m.month);
  const cautionMonths = sortedMonths.slice(-3).filter(m => m.level <= 4).map(m => m.month);

  // 生成年度關鍵字
  const yearKeywords: string[] = [];
  if (yearGong) {
    yearKeywords.push(yearGong.name);
    if (yearGong.mainStars.length > 0) {
      yearKeywords.push(yearGong.mainStars[0].name);
    }
  }
  yearKeywords.push(liunianInfo.ganZhi + '年');

  // 年度總評
  const yearSummary = `${year}年（${liunianInfo.ganZhi}年）流年命宮落${liunianInfo.mingGongName}，` +
    `整體運勢${overallType === 'excellent' ? '大吉' : overallType === 'good' ? '順利' : 
      overallType === 'neutral' ? '平穩' : overallType === 'caution' ? '需謹慎' : '有挑戰'}。` +
    `最佳月份為${bestMonths.map(m => MONTH_NAMES[m-1]).join('、')}。`;

  return {
    year,
    ganZhi: liunianInfo.ganZhi,
    age,
    overallLevel,
    overallType,
    gongName: liunianInfo.mingGongName,
    gongZhi: liunianInfo.mingGongZhi,
    mainStars: yearGong?.mainStars.map(s => s.name) || [],
    siHua: liunianInfo.siHua,
    keywords: yearKeywords,
    summary: yearSummary,
    months,
    bestMonths,
    cautionMonths,
  };
}

/**
 * 計算當年運勢
 */
export function getCurrentYearFortune(chart: ZiweiChart): YearlyFortune {
  const now = new Date();
  const year = now.getFullYear();
  return calculateYearlyFortune(chart, year);
}
