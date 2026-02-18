/**
 * 流年計算
 * 
 * 流年是紫微斗數中一年一運的計算方式
 * 
 * 規則：
 * 1. 流年地支 = 該年的地支
 * 2. 流年命宮 = 流年地支所在宮位
 * 3. 流年四化 = 根據該年的天干決定
 */

import { TIAN_GAN, DI_ZHI, GONG_NAMES } from './constants';
import { calculateSiHua, type SiHuaResult } from './sihua';

/**
 * 流年資訊
 */
export interface LiunianInfo {
  /** 西元年 */
  year: number;
  /** 流年天干 */
  tianGan: string;
  /** 流年地支 */
  diZhi: string;
  /** 流年地支索引 */
  diZhiIndex: number;
  /** 流年干支 */
  ganZhi: string;
  /** 流年命宮地支索引（= 流年地支索引） */
  mingGongIndex: number;
  /** 流年命宮地支 */
  mingGongZhi: string;
  /** 流年命宮在本命盤中對應的宮位名稱 */
  mingGongName: string;
  /** 流年四化 */
  siHua: SiHuaResult;
  /** 流年十二宮（從流年命宮開始的宮位對應） */
  gongs: LiunianGongInfo[];
}

/**
 * 流年宮位資訊
 */
export interface LiunianGongInfo {
  /** 宮位名稱 */
  name: string;
  /** 地支索引 */
  zhiIndex: number;
  /** 地支 */
  zhi: string;
  /** 對應本命盤的宮位名稱 */
  benMingGongName: string;
}

/**
 * 計算年份的天干地支
 * 
 * 使用標準公式：
 * 天干 = (年 - 4) % 10
 * 地支 = (年 - 4) % 12
 * 
 * @param year 西元年
 * @returns { gan, zhi, ganIndex, zhiIndex }
 */
export function getYearGanZhi(year: number): {
  gan: string;
  zhi: string;
  ganIndex: number;
  zhiIndex: number;
} {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  
  return {
    gan: TIAN_GAN[ganIndex],
    zhi: DI_ZHI[zhiIndex],
    ganIndex,
    zhiIndex,
  };
}

/**
 * 計算流年
 * 
 * @param year 西元年
 * @param benMingGongIndex 本命命宮地支索引
 * @returns 流年資訊
 */
export function calculateLiunian(
  year: number,
  benMingGongIndex: number
): LiunianInfo {
  const { gan, zhi, zhiIndex } = getYearGanZhi(year);
  
  // 流年命宮 = 流年地支所在宮位
  const mingGongIndex = zhiIndex;
  const mingGongZhi = zhi;
  
  // 計算流年命宮在本命盤中對應的宮位名稱
  const benMingGongNameIndex = (benMingGongIndex - mingGongIndex + 12) % 12;
  const mingGongName = GONG_NAMES[benMingGongNameIndex];
  
  // 流年四化
  const siHua = calculateSiHua(gan);
  
  // 流年十二宮
  const gongs: LiunianGongInfo[] = [];
  for (let i = 0; i < 12; i++) {
    // 從流年命宮開始逆時針排列
    const gongZhiIndex = (mingGongIndex - i + 12) % 12;
    const gongZhi = DI_ZHI[gongZhiIndex];
    const gongName = GONG_NAMES[i];
    
    // 對應本命盤的宮位名稱
    const benMingIndex = (benMingGongIndex - gongZhiIndex + 12) % 12;
    const benMingGongName = GONG_NAMES[benMingIndex];
    
    gongs.push({
      name: gongName,
      zhiIndex: gongZhiIndex,
      zhi: gongZhi,
      benMingGongName,
    });
  }
  
  return {
    year,
    tianGan: gan,
    diZhi: zhi,
    diZhiIndex: zhiIndex,
    ganZhi: gan + zhi,
    mingGongIndex,
    mingGongZhi,
    mingGongName,
    siHua,
    gongs,
  };
}

/**
 * 計算多年流年（用於時間軸）
 * 
 * @param startYear 起始年
 * @param endYear 結束年
 * @param benMingGongIndex 本命命宮地支索引
 * @returns 各年流年資訊
 */
export function calculateLiunianRange(
  startYear: number,
  endYear: number,
  benMingGongIndex: number
): LiunianInfo[] {
  const result: LiunianInfo[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    result.push(calculateLiunian(year, benMingGongIndex));
  }
  
  return result;
}

/**
 * 根據虛歲計算流年
 * 
 * @param birthYear 出生西元年
 * @param age 虛歲
 * @param benMingGongIndex 本命命宮地支索引
 * @returns 該虛歲對應的流年資訊
 */
export function getLiunianByAge(
  birthYear: number,
  age: number,
  benMingGongIndex: number
): LiunianInfo {
  // 虛歲 = 當前年 - 出生年 + 1
  // 所以 當前年 = 出生年 + 虛歲 - 1
  const year = birthYear + age - 1;
  return calculateLiunian(year, benMingGongIndex);
}
