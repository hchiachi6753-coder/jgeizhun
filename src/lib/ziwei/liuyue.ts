/**
 * 流月計算
 * 
 * 流月是紫微斗數中一月一運的計算方式
 * 
 * 規則：
 * 1. 流月命宮：以流年命宮為基準，從流年命宮起正月順數
 * 2. 流月天干：根據流年天干起月干（五虎遁）
 * 3. 流月四化：根據流月天干決定
 */

import { TIAN_GAN, DI_ZHI, GONG_NAMES } from './constants';
import { calculateSiHua, type SiHuaResult } from './sihua';

/**
 * 流月資訊
 */
export interface LiuyueInfo {
  /** 農曆月份（1-12） */
  month: number;
  /** 流月天干 */
  tianGan: string;
  /** 流月地支 */
  diZhi: string;
  /** 流月地支索引 */
  diZhiIndex: number;
  /** 流月干支 */
  ganZhi: string;
  /** 流月命宮地支索引 */
  mingGongIndex: number;
  /** 流月命宮地支 */
  mingGongZhi: string;
  /** 流月命宮在本命盤中對應的宮位名稱 */
  mingGongName: string;
  /** 流月四化 */
  siHua: SiHuaResult;
}

/**
 * 流年各月資訊
 */
export interface LiuyueOverview {
  /** 流年（西元年） */
  year: number;
  /** 流年天干 */
  yearTianGan: string;
  /** 流年命宮地支索引 */
  liunianMingGongIndex: number;
  /** 各月詳情 */
  months: LiuyueInfo[];
}

/**
 * 五虎遁月訣
 * 根據年干推算正月天干
 * 
 * 甲己之年丙作首（正月為丙寅）
 * 乙庚之歲戊為頭（正月為戊寅）
 * 丙辛之年尋庚上（正月為庚寅）
 * 丁壬壬寅順水流（正月為壬寅）
 * 戊癸之年甲寅始（正月為甲寅）
 */
const MONTH_GAN_START: Record<string, number> = {
  '甲': 2,  // 丙
  '己': 2,  // 丙
  '乙': 4,  // 戊
  '庚': 4,  // 戊
  '丙': 6,  // 庚
  '辛': 6,  // 庚
  '丁': 8,  // 壬
  '壬': 8,  // 壬
  '戊': 0,  // 甲
  '癸': 0,  // 甲
};

/**
 * 根據年干和月份計算月干
 * 
 * @param yearGan 年干
 * @param month 農曆月份（1-12）
 * @returns 月干
 */
export function getMonthGan(yearGan: string, month: number): string {
  const startGanIndex = MONTH_GAN_START[yearGan] ?? 2;
  // 正月從寅開始，月干從 startGanIndex 開始
  const ganIndex = (startGanIndex + month - 1) % 10;
  return TIAN_GAN[ganIndex];
}

/**
 * 根據月份計算月支
 * 正月為寅月（寅=2），二月卯月，以此類推
 * 
 * @param month 農曆月份（1-12）
 * @returns { zhi, zhiIndex }
 */
export function getMonthZhi(month: number): { zhi: string; zhiIndex: number } {
  // 正月寅（索引2），二月卯（索引3）...
  const zhiIndex = (month + 1) % 12;
  return {
    zhi: DI_ZHI[zhiIndex],
    zhiIndex,
  };
}

/**
 * 計算單月流月
 * 
 * @param yearGan 流年天干
 * @param liunianMingGongIndex 流年命宮地支索引
 * @param month 農曆月份（1-12）
 * @param benMingGongIndex 本命命宮地支索引
 * @returns 流月資訊
 */
export function calculateLiuyue(
  yearGan: string,
  liunianMingGongIndex: number,
  month: number,
  benMingGongIndex: number
): LiuyueInfo {
  // 流月天干
  const tianGan = getMonthGan(yearGan, month);
  
  // 流月地支
  const { zhi: diZhi, zhiIndex: diZhiIndex } = getMonthZhi(month);
  
  // 流月命宮：從流年命宮起正月順數
  // 正月在流年命宮，二月順行一位...
  const mingGongIndex = (liunianMingGongIndex + month - 1) % 12;
  const mingGongZhi = DI_ZHI[mingGongIndex];
  
  // 流月命宮在本命盤中對應的宮位名稱
  const benMingGongNameIndex = (benMingGongIndex - mingGongIndex + 12) % 12;
  const mingGongName = GONG_NAMES[benMingGongNameIndex];
  
  // 流月四化
  const siHua = calculateSiHua(tianGan);
  
  return {
    month,
    tianGan,
    diZhi,
    diZhiIndex,
    ganZhi: tianGan + diZhi,
    mingGongIndex,
    mingGongZhi,
    mingGongName,
    siHua,
  };
}

/**
 * 計算全年流月
 * 
 * @param year 西元年
 * @param yearGan 流年天干
 * @param liunianMingGongIndex 流年命宮地支索引
 * @param benMingGongIndex 本命命宮地支索引
 * @returns 流年各月資訊
 */
export function calculateLiuyueOverview(
  year: number,
  yearGan: string,
  liunianMingGongIndex: number,
  benMingGongIndex: number
): LiuyueOverview {
  const months: LiuyueInfo[] = [];
  
  for (let month = 1; month <= 12; month++) {
    months.push(
      calculateLiuyue(yearGan, liunianMingGongIndex, month, benMingGongIndex)
    );
  }
  
  return {
    year,
    yearTianGan: yearGan,
    liunianMingGongIndex,
    months,
  };
}

/**
 * 計算流日命宮（簡化版）
 * 
 * 流日規則：以流月命宮為基準，初一在流月命宮，初二順行一位...
 * 
 * @param liuyueMingGongIndex 流月命宮地支索引
 * @param day 農曆日（1-30）
 * @returns 流日命宮地支索引
 */
export function getLiuriMingGongIndex(
  liuyueMingGongIndex: number,
  day: number
): number {
  return (liuyueMingGongIndex + day - 1) % 12;
}

/**
 * 計算流時命宮（簡化版）
 * 
 * 流時規則：以流日命宮為基準，子時在流日命宮，丑時順行一位...
 * 
 * @param liuriMingGongIndex 流日命宮地支索引
 * @param hourIndex 時辰索引（0=子時，1=丑時...）
 * @returns 流時命宮地支索引
 */
export function getLiushiMingGongIndex(
  liuriMingGongIndex: number,
  hourIndex: number
): number {
  return (liuriMingGongIndex + hourIndex) % 12;
}
