/**
 * 流年計算模組
 * 
 * 流年是每年的干支，用於結合八字和大運進行流年運勢分析。
 * 流年以「立春」為界，而非西曆或農曆新年。
 */

// @ts-nocheck
import { Solar, Lunar } from 'lunar-javascript';
import {
  TIAN_GAN, DI_ZHI, GAN_WU_XING, ZHI_WU_XING,
  SIXTY_JIAZI_NAYIN,
  type TianGan, type DiZhi
} from './constants';
import { combineGanZhi, getNaYin, getGanByIndex, getZhiByIndex } from './ganzhi';
import { getShiShen, getZhiShiShen } from './shiShen';
import type { LiuNianInfo } from './types';

// ============ 流年干支計算 ============

/**
 * 計算某西曆年份的年干支（以立春為界）
 * @param year 西曆年份
 */
export function getYearGanZhi(year: number): { gan: TianGan; zhi: DiZhi } {
  // 使用 lunar-javascript 計算（會自動考慮立春）
  // 注意：這裡我們取立春後的年干支
  const solar = Solar.fromYmd(year, 3, 1);  // 取 3 月 1 日，必定在立春後
  const lunar = solar.getLunar();
  const yearGanZhi = lunar.getYearInGanZhi();

  return {
    gan: yearGanZhi[0] as TianGan,
    zhi: yearGanZhi[1] as DiZhi
  };
}

/**
 * 使用公式計算年干支（不依賴外部庫）
 * 此方法以正月初一為界，如需精確到立春請使用 getYearGanZhi
 */
export function calculateYearGanZhi(year: number): { gan: TianGan; zhi: DiZhi } {
  // 天干：(年份 - 4) % 10
  // 地支：(年份 - 4) % 12
  // 因為公元 4 年是甲子年
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;

  return {
    gan: TIAN_GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10],
    zhi: DI_ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12]
  };
}

// ============ 流年列表計算 ============

/**
 * 計算指定年份範圍的流年列表
 * @param startYear 起始年份
 * @param endYear 結束年份
 * @param birthYear 出生年份（用於計算虛歲）
 * @param dayGan 日主天干（用於計算十神）
 */
export function calculateLiuNianList(
  startYear: number,
  endYear: number,
  birthYear: number,
  dayGan: TianGan
): LiuNianInfo[] {
  const result: LiuNianInfo[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const { gan, zhi } = getYearGanZhi(year);
    const ganZhi = combineGanZhi(gan, zhi);

    result.push({
      year,
      age: year - birthYear + 1,  // 虛歲
      gan,
      zhi,
      ganZhi,
      ganWuXing: GAN_WU_XING[gan],
      zhiWuXing: ZHI_WU_XING[zhi],
      ganShiShen: getShiShen(dayGan, gan),
      zhiShiShen: getZhiShiShen(dayGan, zhi),
      naYin: getNaYin(gan, zhi)
    });
  }

  return result;
}

/**
 * 計算從出生年起 N 年的流年
 */
export function calculateLiuNianFromBirth(
  birthYear: number,
  dayGan: TianGan,
  years: number = 100
): LiuNianInfo[] {
  return calculateLiuNianList(birthYear, birthYear + years - 1, birthYear, dayGan);
}

// ============ 流月計算 ============

/**
 * 計算某年某月的月干支
 * @param year 西曆年
 * @param month 西曆月（1-12）
 */
export function getMonthGanZhi(year: number, month: number): { gan: TianGan; zhi: DiZhi } {
  const solar = Solar.fromYmd(year, month, 15);  // 取月中，避免節氣邊界問題
  const lunar = solar.getLunar();
  const monthGanZhi = lunar.getMonthInGanZhi();

  return {
    gan: monthGanZhi[0] as TianGan,
    zhi: monthGanZhi[1] as DiZhi
  };
}

// ============ 流日計算 ============

/**
 * 計算某日的日干支
 */
export function getDayGanZhi(year: number, month: number, day: number): { gan: TianGan; zhi: DiZhi } {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const dayGanZhi = lunar.getDayInGanZhi();

  return {
    gan: dayGanZhi[0] as TianGan,
    zhi: dayGanZhi[1] as DiZhi
  };
}

// ============ 流年與原局/大運關係分析 ============

/**
 * 檢查流年與原局的沖合關係
 */
export function checkLiuNianWithPillars(
  liuNian: LiuNianInfo,
  yearZhi: DiZhi,
  monthZhi: DiZhi,
  dayZhi: DiZhi,
  hourZhi: DiZhi
): {
  chongTaiSui: boolean;      // 沖太歲（流年與年支沖）
  xingTaiSui: boolean;       // 刑太歲
  heTaiSui: boolean;         // 合太歲
  details: string[];
} {
  const details: string[] = [];
  const allZhi = [yearZhi, monthZhi, dayZhi, hourZhi];

  // 六沖對照表
  const chongMap: Record<DiZhi, DiZhi> = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳'
  };

  // 六合對照表
  const heMap: Record<DiZhi, DiZhi> = {
    '子': '丑', '丑': '子',
    '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳',
    '午': '未', '未': '午'
  };

  // 檢查沖太歲（流年地支與年支沖）
  const chongTaiSui = chongMap[liuNian.zhi] === yearZhi;
  if (chongTaiSui) {
    details.push(`${liuNian.year}年沖太歲（${liuNian.zhi}沖${yearZhi}）`);
  }

  // 檢查合太歲
  const heTaiSui = heMap[liuNian.zhi] === yearZhi;
  if (heTaiSui) {
    details.push(`${liuNian.year}年合太歲（${liuNian.zhi}合${yearZhi}）`);
  }

  // 檢查刑太歲（簡化判斷）
  const xingPairs: [DiZhi, DiZhi][] = [
    ['子', '卯'], ['卯', '子'],
    ['寅', '巳'], ['巳', '寅'], ['申', '寅'],
    ['丑', '戌'], ['戌', '丑'], ['未', '丑']
  ];
  const xingTaiSui = xingPairs.some(([a, b]) =>
    (liuNian.zhi === a && yearZhi === b)
  );
  if (xingTaiSui) {
    details.push(`${liuNian.year}年刑太歲（${liuNian.zhi}刑${yearZhi}）`);
  }

  // 犯太歲（本命年）
  if (liuNian.zhi === yearZhi) {
    details.push(`${liuNian.year}年值太歲（本命年）`);
  }

  // 害太歲
  const haiMap: Record<DiZhi, DiZhi> = {
    '子': '未', '未': '子',
    '丑': '午', '午': '丑',
    '寅': '巳', '巳': '寅',
    '卯': '辰', '辰': '卯',
    '申': '亥', '亥': '申',
    '酉': '戌', '戌': '酉'
  };
  if (haiMap[liuNian.zhi] === yearZhi) {
    details.push(`${liuNian.year}年害太歲（${liuNian.zhi}害${yearZhi}）`);
  }

  return { chongTaiSui, xingTaiSui, heTaiSui, details };
}

/**
 * 流年吉凶概要分析
 */
export function analyzeLiuNian(
  liuNian: LiuNianInfo,
  dayGan: TianGan,
  yearZhi: DiZhi,
  xiShen: TianGan[],  // 喜神
  jiShen: TianGan[]   // 忌神
): {
  overall: 'auspicious' | 'neutral' | 'inauspicious';
  factors: { positive: string[]; negative: string[] };
} {
  const positive: string[] = [];
  const negative: string[] = [];

  // 檢查流年天干是否為喜神或忌神
  if (xiShen.includes(liuNian.gan)) {
    positive.push(`流年天干${liuNian.gan}為喜神`);
  }
  if (jiShen.includes(liuNian.gan)) {
    negative.push(`流年天干${liuNian.gan}為忌神`);
  }

  // 檢查太歲關係
  const taiSuiCheck = checkLiuNianWithPillars(
    liuNian,
    yearZhi,
    '子' as DiZhi,  // 這裡簡化，實際應傳入月日時支
    '子' as DiZhi,
    '子' as DiZhi
  );

  if (taiSuiCheck.chongTaiSui) {
    negative.push('沖太歲，宜謹慎');
  }
  if (taiSuiCheck.heTaiSui) {
    positive.push('合太歲，有貴人相助');
  }

  // 根據正負因素判斷整體吉凶
  let overall: 'auspicious' | 'neutral' | 'inauspicious' = 'neutral';
  if (positive.length > negative.length) {
    overall = 'auspicious';
  } else if (negative.length > positive.length) {
    overall = 'inauspicious';
  }

  return { overall, factors: { positive, negative } };
}

// ============ 百歲流年表 ============

/**
 * 生成百歲流年表
 */
export function generateCenturyChart(
  birthYear: number,
  dayGan: TianGan
): {
  liuNian: LiuNianInfo[];
  summary: {
    mostCommonGanShiShen: string;
    mostCommonZhiShiShen: string;
  };
} {
  const liuNian = calculateLiuNianFromBirth(birthYear, dayGan, 100);

  // 統計最常見的十神
  const ganShiShenCount: Record<string, number> = {};
  const zhiShiShenCount: Record<string, number> = {};

  for (const ln of liuNian) {
    ganShiShenCount[ln.ganShiShen] = (ganShiShenCount[ln.ganShiShen] || 0) + 1;
    zhiShiShenCount[ln.zhiShiShen] = (zhiShiShenCount[ln.zhiShiShen] || 0) + 1;
  }

  const mostCommonGanShiShen = Object.entries(ganShiShenCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const mostCommonZhiShiShen = Object.entries(zhiShiShenCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return {
    liuNian,
    summary: { mostCommonGanShiShen, mostCommonZhiShiShen }
  };
}
