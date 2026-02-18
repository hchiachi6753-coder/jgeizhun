/**
 * 紫微斗數雜曜計算
 * 
 * 包含：
 * 1. 年支系星（龍池、鳳閣、天哭、天虛、紅鸞、天喜、孤辰、寡宿、破碎、蜚廉、華蓋、天德、月德）
 * 2. 月系星（天刑、天姚、解神、天巫、天月）
 * 3. 日系星（三台、八座、恩光、天貴）
 * 4. 時系星（台輔、封誥）
 * 5. 年干系星（天官、天福、天廚）
 * 6. 神煞（陰煞、截空、旬空）
 */

import { DI_ZHI } from './constants';

// ========== 年支系星 ==========

/**
 * 龍池位置表（根據年支）
 * 口訣：辰宮起子年，順行
 */
const LONG_CHI_TABLE: Record<string, number> = {
  '子': 4, '丑': 5, '寅': 6, '卯': 7, '辰': 8, '巳': 9,
  '午': 10, '未': 11, '申': 0, '酉': 1, '戌': 2, '亥': 3,
};

/**
 * 鳳閣位置表（根據年支）
 * 口訣：戌宮起子年，逆行
 */
const FENG_GE_TABLE: Record<string, number> = {
  '子': 10, '丑': 9, '寅': 8, '卯': 7, '辰': 6, '巳': 5,
  '午': 4, '未': 3, '申': 2, '酉': 1, '戌': 0, '亥': 11,
};

/**
 * 天哭位置表（根據年支）
 * 口訣：午宮起子年，逆行
 */
const TIAN_KU_TABLE: Record<string, number> = {
  '子': 6, '丑': 5, '寅': 4, '卯': 3, '辰': 2, '巳': 1,
  '午': 0, '未': 11, '申': 10, '酉': 9, '戌': 8, '亥': 7,
};

/**
 * 天虛位置表（根據年支）
 * 口訣：午宮起子年，順行
 */
const TIAN_XU_TABLE: Record<string, number> = {
  '子': 6, '丑': 7, '寅': 8, '卯': 9, '辰': 10, '巳': 11,
  '午': 0, '未': 1, '申': 2, '酉': 3, '戌': 4, '亥': 5,
};

/**
 * 紅鸞位置表（根據年支）
 * 口訣：卯宮起子年，逆行
 */
const HONG_LUAN_TABLE: Record<string, number> = {
  '子': 3, '丑': 2, '寅': 1, '卯': 0, '辰': 11, '巳': 10,
  '午': 9, '未': 8, '申': 7, '酉': 6, '戌': 5, '亥': 4,
};

/**
 * 天喜位置表（根據年支）
 * 與紅鸞對沖
 */
const TIAN_XI_TABLE: Record<string, number> = {
  '子': 9, '丑': 8, '寅': 7, '卯': 6, '辰': 5, '巳': 4,
  '午': 3, '未': 2, '申': 1, '酉': 0, '戌': 11, '亥': 10,
};

/**
 * 孤辰位置表（根據年支）
 */
const GU_CHEN_TABLE: Record<string, number> = {
  '寅': 5, '卯': 5, '辰': 5,   // 巳
  '巳': 8, '午': 8, '未': 8,   // 申
  '申': 11, '酉': 11, '戌': 11, // 亥
  '亥': 2, '子': 2, '丑': 2,   // 寅
};

/**
 * 寡宿位置表（根據年支）
 */
const GUA_SU_TABLE: Record<string, number> = {
  '寅': 1, '卯': 1, '辰': 1,   // 丑
  '巳': 4, '午': 4, '未': 4,   // 辰
  '申': 7, '酉': 7, '戌': 7,   // 未
  '亥': 10, '子': 10, '丑': 10, // 戌
};

/**
 * 破碎位置表（根據年支）
 * 校正為科技紫微網規則
 */
const PO_SUI_TABLE: Record<string, number> = {
  '子': 4, '丑': 0, '寅': 8, '卯': 4, '辰': 0, '巳': 8,
  '午': 4, '未': 0, '申': 8, '酉': 4, '戌': 0, '亥': 8,
};

/**
 * 蜚廉位置表（根據年支）
 */
const FEI_LIAN_TABLE: Record<string, number> = {
  '子': 8, '丑': 9, '寅': 10, '卯': 11, '辰': 0, '巳': 1,
  '午': 2, '未': 3, '申': 4, '酉': 5, '戌': 6, '亥': 7,
};

/**
 * 華蓋位置表（根據年支）
 */
const HUA_GAI_TABLE: Record<string, number> = {
  '子': 4, '丑': 1, '寅': 10, '卯': 7,
  '辰': 4, '巳': 1, '午': 10, '未': 7,
  '申': 4, '酉': 1, '戌': 10, '亥': 7,
};

/**
 * 天德位置表（根據年支）
 */
const TIAN_DE_TABLE: Record<string, number> = {
  '子': 9, '丑': 8, '寅': 7, '卯': 6, '辰': 5, '巳': 4,
  '午': 3, '未': 2, '申': 1, '酉': 0, '戌': 11, '亥': 10,
};

/**
 * 月德位置表（根據年支）
 */
const YUE_DE_TABLE: Record<string, number> = {
  '子': 5, '丑': 4, '寅': 3, '卯': 2, '辰': 1, '巳': 0,
  '午': 11, '未': 10, '申': 9, '酉': 8, '戌': 7, '亥': 6,
};

/**
 * 計算年支系星位置
 */
export function calculateYearZhiStars(yearZhi: string): Record<string, number> {
  return {
    '龍池': LONG_CHI_TABLE[yearZhi] ?? 0,
    '鳳閣': FENG_GE_TABLE[yearZhi] ?? 0,
    '天哭': TIAN_KU_TABLE[yearZhi] ?? 0,
    '天虛': TIAN_XU_TABLE[yearZhi] ?? 0,
    '紅鸞': HONG_LUAN_TABLE[yearZhi] ?? 0,
    '天喜': TIAN_XI_TABLE[yearZhi] ?? 0,
    '孤辰': GU_CHEN_TABLE[yearZhi] ?? 0,
    '寡宿': GUA_SU_TABLE[yearZhi] ?? 0,
    '破碎': PO_SUI_TABLE[yearZhi] ?? 0,
    '蜚廉': FEI_LIAN_TABLE[yearZhi] ?? 0,
    '華蓋': HUA_GAI_TABLE[yearZhi] ?? 0,
    '天德': TIAN_DE_TABLE[yearZhi] ?? 0,
    '月德': YUE_DE_TABLE[yearZhi] ?? 0,
  };
}

// ========== 月系星 ==========

/**
 * 天刑位置（根據生月）
 * 口訣：酉宮起正月，順行
 */
export function calculateTianXing(lunarMonth: number): number {
  return (9 + lunarMonth - 1) % 12;
}

/**
 * 天姚位置（根據生月）
 * 口訣：丑宮起正月，順行
 */
export function calculateTianYao(lunarMonth: number): number {
  return (1 + lunarMonth - 1) % 12;
}

/**
 * 解神位置（根據生月）
 * 口訣：申宮起正月，順行
 */
export function calculateJieShen(lunarMonth: number): number {
  return (8 + lunarMonth - 1) % 12;
}

/**
 * 天巫位置（根據生月）
 * 口訣：巳宮起正月，順行
 */
export function calculateTianWu(lunarMonth: number): number {
  return (5 + lunarMonth - 1) % 12;
}

/**
 * 天月位置（根據生月）
 */
const TIAN_YUE_TABLE = [7, 10, 4, 4, 1, 6, 0, 0, 4, 10, 6, 8]; // 1-12月

export function calculateTianYue(lunarMonth: number): number {
  return TIAN_YUE_TABLE[(lunarMonth - 1) % 12];
}

/**
 * 陰煞位置（根據生月）
 * 口訣：寅宮起正月，逆行
 */
export function calculateYinSha(lunarMonth: number): number {
  return (2 - lunarMonth + 1 + 12) % 12;
}

/**
 * 計算月系星位置
 */
export function calculateMonthStars(lunarMonth: number): Record<string, number> {
  return {
    '天刑': calculateTianXing(lunarMonth),
    '天姚': calculateTianYao(lunarMonth),
    '解神': calculateJieShen(lunarMonth),
    '天巫': calculateTianWu(lunarMonth),
    '天月': calculateTianYue(lunarMonth),
    '陰煞': calculateYinSha(lunarMonth),
  };
}

// ========== 日系星 ==========

/**
 * 三台位置（根據日數和左輔位置）
 * 口訣：初一與左輔同宮，順行
 */
export function calculateSanTai(lunarDay: number, zuofuPos: number): number {
  return (zuofuPos + lunarDay - 1) % 12;
}

/**
 * 八座位置（根據日數和右弼位置）
 * 口訣：初一與右弼同宮，逆行
 */
export function calculateBaZuo(lunarDay: number, youbiPos: number): number {
  return (youbiPos - lunarDay + 1 + 12) % 12;
}

/**
 * 恩光位置（根據日數和文昌位置）
 * 口訣：初一與文昌同宮，順行
 */
export function calculateEnGuang(lunarDay: number, wenchangPos: number): number {
  return (wenchangPos + lunarDay - 1) % 12;
}

/**
 * 天貴位置（根據日數和文曲位置）
 * 口訣：初一與文曲同宮，逆行
 */
export function calculateTianGui(lunarDay: number, wenquPos: number): number {
  return (wenquPos - lunarDay + 1 + 12) % 12;
}

// ========== 時系星 ==========

/**
 * 台輔位置（根據生時）
 * 口訣：午宮起子時，順行
 */
export function calculateTaiFu(hourIndex: number): number {
  return (6 + hourIndex) % 12;
}

/**
 * 封誥位置（根據生時）
 * 口訣：丑宮起子時，順行（校正為科技紫微網規則）
 */
export function calculateFengGao(hourIndex: number): number {
  return (1 + hourIndex) % 12;
}

/**
 * 計算時系星位置
 */
export function calculateHourStars(hourIndex: number): Record<string, number> {
  return {
    '台輔': calculateTaiFu(hourIndex),
    '封誥': calculateFengGao(hourIndex),
  };
}

// ========== 年干系星 ==========

/**
 * 天官位置表（根據年干）
 */
const TIAN_GUAN_TABLE: Record<string, number> = {
  '甲': 7, '乙': 4, '丙': 0, '丁': 9, '戊': 3,
  '己': 9, '庚': 7, '辛': 0, '壬': 3, '癸': 4,
};

/**
 * 天福位置表（根據年干）
 * 校正為科技紫微網規則
 */
const TIAN_FU_TABLE: Record<string, number> = {
  '甲': 8, '乙': 7, '丙': 11, '丁': 10, '戊': 2,
  '己': 1, '庚': 5, '辛': 4, '壬': 5, '癸': 4,
};

/**
 * 天廚位置表（根據年干）
 */
const TIAN_CHU_TABLE: Record<string, number> = {
  '甲': 5, '乙': 6, '丙': 5, '丁': 6, '戊': 5,
  '己': 6, '庚': 8, '辛': 9, '壬': 11, '癸': 0,
};

/**
 * 計算年干系星位置
 */
export function calculateYearGanStars(yearGan: string): Record<string, number> {
  return {
    '天官': TIAN_GUAN_TABLE[yearGan] ?? 0,
    '天福': TIAN_FU_TABLE[yearGan] ?? 0,
    '天廚': TIAN_CHU_TABLE[yearGan] ?? 0,
  };
}

// ========== 截空、旬空 ==========

/**
 * 計算旬空（根據日柱）
 * 返回兩個空亡的地支位置
 */
export function calculateXunKong(dayGanIndex: number, dayZhiIndex: number): [number, number] {
  // 旬空是日干支所在旬的最後兩個地支
  // 旬首：甲子、甲戌、甲申、甲午、甲辰、甲寅
  // 每旬10天，旬空是該旬沒有的兩個地支
  
  // 計算當前日干支在哪個旬
  // 日干索引 - 日支索引 的差值決定旬首
  const diff = (dayGanIndex - dayZhiIndex + 12) % 12;
  
  // 根據差值確定旬空
  // 差值0: 甲子旬，空戌亥
  // 差值2: 甲戌旬，空申酉
  // 差值4: 甲申旬，空午未
  // 差值6: 甲午旬，空辰巳
  // 差值8: 甲辰旬，空寅卯
  // 差值10: 甲寅旬，空子丑
  
  const kongMap: Record<number, [number, number]> = {
    0: [10, 11],  // 戌亥
    2: [8, 9],    // 申酉
    4: [6, 7],    // 午未
    6: [4, 5],    // 辰巳
    8: [2, 3],    // 寅卯
    10: [0, 1],   // 子丑
  };
  
  return kongMap[diff] ?? [0, 1];
}

/**
 * 計算截空（截路空亡）
 * 根據年干計算
 */
const JIE_KONG_TABLE: Record<string, [number, number]> = {
  '甲': [8, 9],   // 申酉
  '乙': [6, 7],   // 午未
  '丙': [4, 5],   // 辰巳
  '丁': [2, 3],   // 寅卯
  '戊': [0, 1],   // 子丑
  '己': [0, 1],   // 子丑
  '庚': [10, 11], // 戌亥
  '辛': [8, 9],   // 申酉
  '壬': [6, 7],   // 午未
  '癸': [4, 5],   // 辰巳
};

export function calculateJieKong(yearGan: string): [number, number] {
  return JIE_KONG_TABLE[yearGan] ?? [0, 1];
}

// ========== 博士十二星 ==========

/**
 * 博士十二星名稱
 */
export const BOSHI_STARS = [
  '博士', '力士', '青龍', '小耗', '將軍', '奏書',
  '飛廉', '喜神', '病符', '大耗', '伏兵', '官府'
] as const;

/**
 * 計算博士十二星位置
 * 口訣：祿存宮起博士，陽男陰女順行，陽女陰男逆行
 */
export function calculateBoshiStars(
  lucunPos: number,
  yearGan: string,
  gender: 'male' | 'female'
): Record<string, number> {
  // 判斷陽干還是陰干
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  const isYangGan = yangGan.includes(yearGan);
  
  // 陽男陰女順行，陽女陰男逆行
  const isShun = (isYangGan && gender === 'male') || (!isYangGan && gender === 'female');
  
  const stars: Record<string, number> = {};
  
  for (let i = 0; i < 12; i++) {
    const pos = isShun
      ? (lucunPos + i) % 12
      : (lucunPos - i + 12) % 12;
    stars[BOSHI_STARS[i]] = pos;
  }
  
  return stars;
}

// ========== 長生十二星 ==========

/**
 * 長生十二星名稱
 */
export const CHANGSHENG_STARS = [
  '長生', '沐浴', '冠帶', '臨官', '帝旺', '衰',
  '病', '死', '墓', '絕', '胎', '養'
] as const;

/**
 * 長生起宮表（根據五行局）
 */
const CHANGSHENG_START: Record<number, number> = {
  2: 8,   // 水二局，申起長生
  3: 11,  // 木三局，亥起長生
  4: 5,   // 金四局，巳起長生
  5: 8,   // 土五局，申起長生
  6: 2,   // 火六局，寅起長生
};

/**
 * 計算長生十二星位置
 * 口訣：根據五行局定起宮，陽男陰女順行，陽女陰男逆行
 */
export function calculateChangshengStars(
  juNum: number,
  yearGan: string,
  gender: 'male' | 'female'
): Record<string, number> {
  const startPos = CHANGSHENG_START[juNum] ?? 8;
  
  // 判斷陽干還是陰干
  const yangGan = ['甲', '丙', '戊', '庚', '壬'];
  const isYangGan = yangGan.includes(yearGan);
  
  // 陽男陰女順行，陽女陰男逆行
  const isShun = (isYangGan && gender === 'male') || (!isYangGan && gender === 'female');
  
  const stars: Record<string, number> = {};
  
  for (let i = 0; i < 12; i++) {
    const pos = isShun
      ? (startPos + i) % 12
      : (startPos - i + 12) % 12;
    stars[CHANGSHENG_STARS[i]] = pos;
  }
  
  return stars;
}

// ========== 匯出所有雜曜計算 ==========

export interface MinorStarsResult {
  yearZhiStars: Record<string, number>;
  monthStars: Record<string, number>;
  dayStars: Record<string, number>;
  hourStars: Record<string, number>;
  yearGanStars: Record<string, number>;
  boshiStars: Record<string, number>;
  changshengStars: Record<string, number>;
  xunKong: [number, number];
  jieKong: [number, number];
}

/**
 * 計算所有雜曜位置
 */
export function calculateAllMinorStars(params: {
  yearGan: string;
  yearZhi: string;
  lunarMonth: number;
  lunarDay: number;
  hourIndex: number;
  dayGanIndex: number;
  dayZhiIndex: number;
  gender: 'male' | 'female';
  juNum: number;
  lucunPos: number;
  zuofuPos: number;
  youbiPos: number;
  wenchangPos: number;
  wenquPos: number;
}): MinorStarsResult {
  const {
    yearGan, yearZhi, lunarMonth, lunarDay, hourIndex,
    dayGanIndex, dayZhiIndex, gender, juNum,
    lucunPos, zuofuPos, youbiPos, wenchangPos, wenquPos,
  } = params;
  
  return {
    yearZhiStars: calculateYearZhiStars(yearZhi),
    monthStars: calculateMonthStars(lunarMonth),
    dayStars: {
      '三台': calculateSanTai(lunarDay, zuofuPos),
      '八座': calculateBaZuo(lunarDay, youbiPos),
      '恩光': calculateEnGuang(lunarDay, wenchangPos),
      '天貴': calculateTianGui(lunarDay, wenquPos),
    },
    hourStars: calculateHourStars(hourIndex),
    yearGanStars: calculateYearGanStars(yearGan),
    boshiStars: calculateBoshiStars(lucunPos, yearGan, gender),
    changshengStars: calculateChangshengStars(juNum, yearGan, gender),
    xunKong: calculateXunKong(dayGanIndex, dayZhiIndex),
    jieKong: calculateJieKong(yearGan),
  };
}
