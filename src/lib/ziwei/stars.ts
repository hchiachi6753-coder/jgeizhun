/**
 * 紫微斗數安星規則
 * 
 * 包含：
 * 1. 紫微星系（紫微、天機、太陽、武曲、天同、廉貞）
 * 2. 天府星系（天府、太陰、貪狼、巨門、天相、天梁、七殺、破軍）
 * 3. 輔星（左輔、右弼、文昌、文曲、天魁、天鉞）
 * 4. 煞星（擎羊、陀羅、火星、鈴星、地空、地劫）
 * 5. 其他（祿存、天馬）
 */

import { DI_ZHI, type JuNum } from './constants';

/**
 * 紫微星位置表
 * 
 * 根據五行局數和農曆生日查表
 * 返回紫微星所在的地支索引
 * 
 * 結構：[局數][日期-1] = 地支索引
 */
const ZIWEI_TABLE: Record<JuNum, number[]> = {
  // 水二局
  2: [
    2, 3, 3, 4, 4, 5, 5, 6, 6, 7,     // 1-10日
    7, 8, 8, 9, 9, 10, 10, 11, 11, 0, // 11-20日
    0, 1, 1, 2, 2, 3, 3, 4, 4, 5,     // 21-30日
  ],
  // 木三局
  3: [
    2, 3, 3, 3, 4, 4, 4, 5, 5, 5,     // 1-10日
    6, 6, 6, 7, 7, 7, 8, 8, 8, 9,     // 11-20日
    9, 9, 10, 10, 10, 11, 11, 11, 0, 0, // 21-30日
  ],
  // 金四局
  4: [
    2, 3, 3, 3, 3, 4, 4, 4, 4, 5,     // 1-10日
    5, 5, 5, 6, 6, 6, 6, 7, 7, 7,     // 11-20日
    7, 8, 8, 8, 8, 9, 9, 9, 9, 10,    // 21-30日
  ],
  // 土五局
  5: [
    2, 3, 3, 3, 3, 3, 4, 4, 4, 4,     // 1-10日
    4, 5, 5, 5, 5, 5, 6, 6, 6, 6,     // 11-20日
    6, 7, 7, 7, 7, 7, 8, 8, 8, 8,     // 21-30日
  ],
  // 火六局
  6: [
    2, 3, 3, 3, 3, 3, 3, 4, 4, 4,     // 1-10日
    4, 4, 4, 5, 5, 5, 5, 5, 5, 6,     // 11-20日
    6, 6, 6, 6, 6, 7, 7, 7, 7, 7,     // 21-30日
  ],
};

/**
 * 取得紫微星位置
 * @param juNum 五行局數
 * @param lunarDay 農曆日期 (1-30)
 * @returns 紫微星地支索引
 */
export function getZiweiPosition(juNum: JuNum, lunarDay: number): number {
  const day = Math.min(Math.max(lunarDay, 1), 30);
  return ZIWEI_TABLE[juNum][day - 1];
}

/**
 * 安紫微星系
 * 
 * 紫微星系排列順序：紫微→天機→(空)→太陽→武曲→天同→(空)→(空)→廉貞
 * 從紫微位置開始逆時針排列
 * 
 * @param ziweiPos 紫微星地支索引
 * @returns 紫微星系各星位置
 */
export function calculateZiweiStars(ziweiPos: number): Record<string, number> {
  // 紫微星系固定關係（逆時針偏移）
  // 紫微=0, 天機=-1, 太陽=-3, 武曲=-4, 天同=-5, 廉貞=-8
  const offsets = {
    '紫微': 0,
    '天機': -1,
    '太陽': -3,
    '武曲': -4,
    '天同': -5,
    '廉貞': -8,
  };

  const stars: Record<string, number> = {};
  for (const [star, offset] of Object.entries(offsets)) {
    stars[star] = (ziweiPos + offset + 12) % 12;
  }
  return stars;
}

/**
 * 安天府星系
 * 
 * 天府與紫微的關係：以寅-申線對稱
 * 天府星系排列順序（順時針）：天府→太陰→貪狼→巨門→天相→天梁→七殺→(空)→(空)→(空)→破軍
 * 
 * @param ziweiPos 紫微星地支索引
 * @returns 天府星系各星位置
 */
export function calculateTianfuStars(ziweiPos: number): Record<string, number> {
  // 天府與紫微對稱於寅-申軸
  // 對稱公式：天府位置 = (4 - 紫微位置 + 12) % 12 + 調整
  // 實際計算：天府 = (寅索引 × 2 - 紫微) = (2 × 2 - ziweiPos) 不對
  // 正確公式：紫微在X宮，天府在(14 - X) % 12 或查表
  
  // 紫微與天府對稱表（紫微索引 -> 天府索引）
  const tianfuMap: Record<number, number> = {
    0: 4,   // 紫微子 -> 天府辰
    1: 3,   // 紫微丑 -> 天府卯
    2: 2,   // 紫微寅 -> 天府寅
    3: 1,   // 紫微卯 -> 天府丑
    4: 0,   // 紫微辰 -> 天府子
    5: 11,  // 紫微巳 -> 天府亥
    6: 10,  // 紫微午 -> 天府戌
    7: 9,   // 紫微未 -> 天府酉
    8: 8,   // 紫微申 -> 天府申
    9: 7,   // 紫微酉 -> 天府未
    10: 6,  // 紫微戌 -> 天府午
    11: 5,  // 紫微亥 -> 天府巳
  };

  const tianfuPos = tianfuMap[ziweiPos];

  // 天府星系順時針排列
  const offsets = {
    '天府': 0,
    '太陰': 1,
    '貪狼': 2,
    '巨門': 3,
    '天相': 4,
    '天梁': 5,
    '七殺': 6,
    '破軍': 10, // 跳過3格
  };

  const stars: Record<string, number> = {};
  for (const [star, offset] of Object.entries(offsets)) {
    stars[star] = (tianfuPos + offset) % 12;
  }
  return stars;
}

/**
 * 安左輔、右弼（根據生月）
 * 
 * 左輔：辰宮起正月，順行
 * 右弼：戌宮起正月，逆行
 * 
 * @param lunarMonth 農曆月份 (1-12)
 * @returns 左輔右弼位置
 */
export function calculateZuoYou(lunarMonth: number): Record<string, number> {
  // 辰 = 4, 戌 = 10
  return {
    '左輔': (4 + lunarMonth - 1) % 12,
    '右弼': (10 - lunarMonth + 1 + 12) % 12,
  };
}

/**
 * 安文昌、文曲（根據生時）
 * 
 * 文昌：戌宮起子時，逆行
 * 文曲：辰宮起子時，順行
 * 
 * @param hourIndex 時辰索引 (0=子, 1=丑, ...)
 * @returns 文昌文曲位置
 */
export function calculateChangQu(hourIndex: number): Record<string, number> {
  // 戌 = 10, 辰 = 4
  return {
    '文昌': (10 - hourIndex + 12) % 12,
    '文曲': (4 + hourIndex) % 12,
  };
}

/**
 * 天魁天鉞位置表（根據年干）
 */
const KUIYUE_TABLE: Record<string, { kui: number; yue: number }> = {
  '甲': { kui: 1, yue: 7 },   // 丑、未
  '戊': { kui: 1, yue: 7 },   // 丑、未
  '庚': { kui: 1, yue: 7 },   // 丑、未
  '乙': { kui: 0, yue: 6 },   // 子、午
  '己': { kui: 0, yue: 6 },   // 子、午
  '丙': { kui: 11, yue: 9 },  // 亥、酉
  '丁': { kui: 11, yue: 9 },  // 亥、酉
  '壬': { kui: 3, yue: 5 },   // 卯、巳
  '癸': { kui: 3, yue: 5 },   // 卯、巳
  '辛': { kui: 6, yue: 2 },   // 午、寅
};

/**
 * 安天魁、天鉞（根據年干）
 * @param yearGan 年干
 * @returns 天魁天鉞位置
 */
export function calculateKuiYue(yearGan: string): Record<string, number> {
  const pos = KUIYUE_TABLE[yearGan] || { kui: 1, yue: 7 };
  return {
    '天魁': pos.kui,
    '天鉞': pos.yue,
  };
}

/**
 * 祿存位置表（根據年干）
 */
const LUCUN_TABLE: Record<string, number> = {
  '甲': 2,  // 寅
  '乙': 3,  // 卯
  '丙': 5,  // 巳
  '丁': 6,  // 午
  '戊': 5,  // 巳
  '己': 6,  // 午
  '庚': 8,  // 申
  '辛': 9,  // 酉
  '壬': 11, // 亥
  '癸': 0,  // 子
};

/**
 * 安祿存（根據年干）
 * @param yearGan 年干
 * @returns 祿存位置
 */
export function calculateLuCun(yearGan: string): number {
  return LUCUN_TABLE[yearGan] ?? 2;
}

/**
 * 安擎羊、陀羅（祿存前後）
 * 
 * 擎羊：祿存順行一位
 * 陀羅：祿存逆行一位
 * 
 * @param lucunPos 祿存地支索引
 * @returns 擎羊陀羅位置
 */
export function calculateYangTuo(lucunPos: number): Record<string, number> {
  return {
    '擎羊': (lucunPos + 1) % 12,
    '陀羅': (lucunPos - 1 + 12) % 12,
  };
}

/**
 * 火星位置表（根據年支和時辰）
 * 寅午戌年：卯宮起子時，順行
 * 申子辰年：寅宮起子時，順行
 * 巳酉丑年：卯宮起子時，順行
 * 亥卯未年：酉宮起子時，順行
 */
const HUO_XING_START: Record<string, number> = {
  '寅': 3, '午': 3, '戌': 3,  // 卯
  '申': 2, '子': 2, '辰': 2,  // 寅
  '巳': 3, '酉': 3, '丑': 3,  // 卯
  '亥': 9, '卯': 9, '未': 9,  // 酉
};

/**
 * 鈴星位置表（根據年支和時辰）
 * 寅午戌年：戌宮起子時，順行
 * 申子辰年：戌宮起子時，順行
 * 巳酉丑年：戌宮起子時，順行
 * 亥卯未年：戌宮起子時，順行
 */
const LING_XING_START: Record<string, number> = {
  '寅': 10, '午': 10, '戌': 10,  // 戌
  '申': 10, '子': 10, '辰': 10,  // 戌
  '巳': 10, '酉': 10, '丑': 10,  // 戌
  '亥': 10, '卯': 10, '未': 10,  // 戌
};

/**
 * 安火星、鈴星（根據年支和時辰）
 * @param yearZhi 年支
 * @param hourIndex 時辰索引
 * @returns 火星鈴星位置
 */
export function calculateHuoLing(yearZhi: string, hourIndex: number): Record<string, number> {
  const huoStart = HUO_XING_START[yearZhi] ?? 2;
  const lingStart = LING_XING_START[yearZhi] ?? 10;
  
  return {
    '火星': (huoStart + hourIndex) % 12,
    '鈴星': (lingStart + hourIndex) % 12,
  };
}

/**
 * 安地空、地劫（根據時辰）
 * 
 * 地空：亥宮起子時，逆行
 * 地劫：亥宮起子時，順行
 * 
 * @param hourIndex 時辰索引
 * @returns 地空地劫位置
 */
export function calculateKongJie(hourIndex: number): Record<string, number> {
  // 亥 = 11
  return {
    '地空': (11 - hourIndex + 12) % 12,
    '地劫': (11 + hourIndex) % 12,
  };
}

/**
 * 天馬位置表（根據年支）
 */
const TIANMA_TABLE: Record<string, number> = {
  '寅': 8, '午': 8, '戌': 8,   // 申
  '申': 2, '子': 2, '辰': 2,   // 寅
  '巳': 11, '酉': 11, '丑': 11, // 亥
  '亥': 5, '卯': 5, '未': 5,   // 巳
};

/**
 * 安天馬（根據年支）
 * @param yearZhi 年支
 * @returns 天馬位置
 */
export function calculateTianMa(yearZhi: string): number {
  return TIANMA_TABLE[yearZhi] ?? 2;
}

/**
 * 星曜亮度表
 * 簡化版本，實際需要更詳細的表格
 */
const BRIGHTNESS_TABLE: Record<string, Record<number, string>> = {
  '紫微': { 2: '廟', 3: '廟', 5: '旺', 6: '旺', 8: '廟', 9: '廟', 11: '旺', 0: '旺' },
  '天機': { 3: '廟', 6: '廟', 9: '廟', 0: '廟' },
  '太陽': { 3: '廟', 4: '廟', 5: '旺', 6: '旺' },
  '武曲': { 4: '廟', 10: '廟' },
  '天同': { 2: '廟', 5: '廟', 11: '廟' },
  '廉貞': { 2: '廟', 5: '廟' },
  '天府': { 2: '廟', 5: '廟', 6: '廟', 9: '廟', 10: '廟' },
  '太陰': { 9: '廟', 10: '廟', 11: '廟', 0: '廟' },
  '貪狼': { 2: '廟', 6: '廟' },
  '巨門': { 0: '廟', 1: '廟' },
  '天相': { 2: '廟', 3: '廟', 6: '廟', 7: '廟' },
  '天梁': { 0: '廟', 6: '廟' },
  '七殺': { 2: '廟', 6: '廟', 8: '廟', 10: '廟' },
  '破軍': { 0: '廟', 2: '廟', 4: '廟', 8: '廟' },
};

/**
 * 取得星曜亮度
 * @param star 星曜名稱
 * @param zhiIndex 地支索引
 * @returns 亮度等級
 */
export function getStarBrightness(star: string, zhiIndex: number): string | undefined {
  return BRIGHTNESS_TABLE[star]?.[zhiIndex];
}
