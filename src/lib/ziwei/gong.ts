/**
 * 命宮與身宮計算
 * 
 * 命宮：以生月、生時定位
 * 身宮：以生月、生時定位
 */

import { DI_ZHI, GONG_NAMES } from './constants';

/**
 * 計算命宮地支索引
 * 
 * 口訣：「寅宮起正月，順數至生月，逆數至生時」
 * 
 * @param lunarMonth 農曆月份 (1-12)
 * @param hourIndex 時辰索引 (0=子, 1=丑, 2=寅, ...)
 * @returns 命宮地支索引
 */
export function calculateMingGongIndex(lunarMonth: number, hourIndex: number): number {
  // 寅宮 = 索引 2
  // 從寅起正月，順數至生月：寅 + (月 - 1)
  // 然後逆數至生時：上述位置 - 時辰索引
  const monthPos = (2 + lunarMonth - 1) % 12;
  const mingGongIndex = (monthPos - hourIndex + 12) % 12;
  return mingGongIndex;
}

/**
 * 計算身宮地支索引
 * 
 * 口訣：「寅宮起正月，順數至生月，順數至生時」
 * 
 * @param lunarMonth 農曆月份 (1-12)
 * @param hourIndex 時辰索引 (0=子, 1=丑, 2=寅, ...)
 * @returns 身宮地支索引
 */
export function calculateShenGongIndex(lunarMonth: number, hourIndex: number): number {
  // 寅宮 = 索引 2
  // 從寅起正月，順數至生月：寅 + (月 - 1)
  // 然後順數至生時：上述位置 + 時辰索引
  const monthPos = (2 + lunarMonth - 1) % 12;
  const shenGongIndex = (monthPos + hourIndex) % 12;
  return shenGongIndex;
}

/**
 * 取得命宮地支
 * @param mingGongIndex 命宮地支索引
 * @returns 命宮地支
 */
export function getMingGongZhi(mingGongIndex: number): string {
  return DI_ZHI[mingGongIndex];
}

/**
 * 取得身宮地支
 * @param shenGongIndex 身宮地支索引
 * @returns 身宮地支
 */
export function getShenGongZhi(shenGongIndex: number): string {
  return DI_ZHI[shenGongIndex];
}

/**
 * 計算十二宮位置（從命宮開始逆時針排列）
 * 
 * @param mingGongIndex 命宮地支索引
 * @returns 十二宮資訊陣列
 */
export function calculateTwelveGongs(mingGongIndex: number): Array<{
  name: string;
  zhiIndex: number;
  zhi: string;
}> {
  const gongs: Array<{ name: string; zhiIndex: number; zhi: string }> = [];
  
  for (let i = 0; i < 12; i++) {
    // 從命宮開始，逆時針（即地支索引遞減）
    const zhiIndex = (mingGongIndex - i + 12) % 12;
    gongs.push({
      name: GONG_NAMES[i],
      zhiIndex,
      zhi: DI_ZHI[zhiIndex],
    });
  }
  
  return gongs;
}

/**
 * 找出身宮所在的宮位名稱
 * 
 * @param mingGongIndex 命宮地支索引
 * @param shenGongIndex 身宮地支索引
 * @returns 身宮所在的宮位名稱
 */
export function getShenGongName(mingGongIndex: number, shenGongIndex: number): string {
  // 計算身宮相對命宮的位置差
  const diff = (mingGongIndex - shenGongIndex + 12) % 12;
  return GONG_NAMES[diff];
}

/**
 * 根據地支索引找出對應的宮位名稱
 * 
 * @param targetZhiIndex 目標地支索引
 * @param mingGongIndex 命宮地支索引
 * @returns 宮位名稱
 */
export function getGongNameByZhiIndex(targetZhiIndex: number, mingGongIndex: number): string {
  const diff = (mingGongIndex - targetZhiIndex + 12) % 12;
  return GONG_NAMES[diff];
}
