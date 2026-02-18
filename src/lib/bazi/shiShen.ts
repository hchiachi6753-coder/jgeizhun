/**
 * 十神計算模組
 * 
 * 十神是以日主為中心，根據五行生剋關係和陰陽來定義的關係名稱。
 * 
 * 生剋關係：
 * - 同我：比肩、劫財
 * - 我生：食神、傷官
 * - 我剋：偏財、正財
 * - 剋我：七殺、正官
 * - 生我：偏印、正印
 * 
 * 陰陽關係：
 * - 同陰陽（陽見陽、陰見陰）：比肩、食神、偏財、七殺、偏印
 * - 異陰陽（陽見陰、陰見陽）：劫財、傷官、正財、正官、正印
 */

import {
  TIAN_GAN, GAN_WU_XING, GAN_YIN_YANG, WU_XING,
  ZHI_CANG_GAN, ZHI_WU_XING,
  type TianGan, type DiZhi, type WuXing, type ShiShen
} from './constants';

// ============ 核心計算 ============

/**
 * 計算十神
 * @param dayGan 日主（日干）
 * @param targetGan 目標天干
 * @returns 十神名稱
 */
export function getShiShen(dayGan: TianGan, targetGan: TianGan): ShiShen {
  const dayWuXing = GAN_WU_XING[dayGan];
  const targetWuXing = GAN_WU_XING[targetGan];
  const dayYinYang = GAN_YIN_YANG[dayGan];
  const targetYinYang = GAN_YIN_YANG[targetGan];
  const sameYinYang = dayYinYang === targetYinYang;

  // 計算五行關係（使用五行順序：木火土金水）
  const wuXingOrder: WuXing[] = ['木', '火', '土', '金', '水'];
  const dayIndex = wuXingOrder.indexOf(dayWuXing);
  const targetIndex = wuXingOrder.indexOf(targetWuXing);

  // 計算相對位置（0=同我, 1=我生, 2=我剋, 3=剋我, 4=生我）
  const diff = (targetIndex - dayIndex + 5) % 5;

  // 根據五行關係和陰陽返回十神
  switch (diff) {
    case 0: // 同我
      return sameYinYang ? '比肩' : '劫財';
    case 1: // 我生
      return sameYinYang ? '食神' : '傷官';
    case 2: // 我剋
      return sameYinYang ? '偏財' : '正財';
    case 3: // 剋我
      return sameYinYang ? '七殺' : '正官';
    case 4: // 生我
      return sameYinYang ? '偏印' : '正印';
    default:
      return '比肩'; // 不應該到達這裡
  }
}

/**
 * 根據五行計算十神（不考慮具體天干）
 * @param dayWuXing 日主五行
 * @param targetWuXing 目標五行
 * @param sameYinYang 是否同陰陽
 */
export function getShiShenByWuXing(
  dayWuXing: WuXing,
  targetWuXing: WuXing,
  sameYinYang: boolean
): ShiShen {
  const wuXingOrder: WuXing[] = ['木', '火', '土', '金', '水'];
  const dayIndex = wuXingOrder.indexOf(dayWuXing);
  const targetIndex = wuXingOrder.indexOf(targetWuXing);
  const diff = (targetIndex - dayIndex + 5) % 5;

  switch (diff) {
    case 0: return sameYinYang ? '比肩' : '劫財';
    case 1: return sameYinYang ? '食神' : '傷官';
    case 2: return sameYinYang ? '偏財' : '正財';
    case 3: return sameYinYang ? '七殺' : '正官';
    case 4: return sameYinYang ? '偏印' : '正印';
    default: return '比肩';
  }
}

/**
 * 計算地支本氣的十神
 */
export function getZhiShiShen(dayGan: TianGan, zhi: DiZhi): ShiShen {
  const mainGan = ZHI_CANG_GAN[zhi][0];
  return getShiShen(dayGan, mainGan);
}

/**
 * 計算地支藏干的所有十神
 */
export function getZhiCangGanShiShen(
  dayGan: TianGan,
  zhi: DiZhi
): { gan: TianGan; shiShen: ShiShen; type: 'main' | 'middle' | 'residual' }[] {
  const cangGan = ZHI_CANG_GAN[zhi];
  return cangGan.map((gan, index) => ({
    gan,
    shiShen: getShiShen(dayGan, gan),
    type: index === 0 ? 'main' : index === 1 ? 'middle' : 'residual'
  }));
}

// ============ 十神分類查詢 ============

/**
 * 獲取某十神的五行（相對於日主）
 */
export function getShiShenWuXing(dayGan: TianGan, shiShen: ShiShen): WuXing {
  const dayWuXing = GAN_WU_XING[dayGan];
  const wuXingOrder: WuXing[] = ['木', '火', '土', '金', '水'];
  const dayIndex = wuXingOrder.indexOf(dayWuXing);

  // 十神對應的五行偏移
  const shiShenOffset: Record<ShiShen, number> = {
    '比肩': 0, '劫財': 0,  // 同我
    '食神': 1, '傷官': 1,  // 我生
    '偏財': 2, '正財': 2,  // 我剋
    '七殺': 3, '正官': 3,  // 剋我
    '偏印': 4, '正印': 4   // 生我
  };

  const offset = shiShenOffset[shiShen];
  return wuXingOrder[(dayIndex + offset) % 5];
}

/**
 * 獲取代表某十神的天干列表
 */
export function getGanByShiShen(dayGan: TianGan, shiShen: ShiShen): TianGan[] {
  return TIAN_GAN.filter(gan => getShiShen(dayGan, gan) === shiShen);
}

/**
 * 檢查十神是否為財星（正財、偏財）
 */
export function isCai(shiShen: ShiShen): boolean {
  return shiShen === '正財' || shiShen === '偏財';
}

/**
 * 檢查十神是否為官殺（正官、七殺）
 */
export function isGuanSha(shiShen: ShiShen): boolean {
  return shiShen === '正官' || shiShen === '七殺';
}

/**
 * 檢查十神是否為印星（正印、偏印）
 */
export function isYin(shiShen: ShiShen): boolean {
  return shiShen === '正印' || shiShen === '偏印';
}

/**
 * 檢查十神是否為比劫（比肩、劫財）
 */
export function isBiJie(shiShen: ShiShen): boolean {
  return shiShen === '比肩' || shiShen === '劫財';
}

/**
 * 檢查十神是否為食傷（食神、傷官）
 */
export function isShiShang(shiShen: ShiShen): boolean {
  return shiShen === '食神' || shiShen === '傷官';
}

/**
 * 獲取十神的簡稱
 */
export function getShiShenAbbr(shiShen: ShiShen): string {
  const abbrMap: Record<ShiShen, string> = {
    '比肩': '比',
    '劫財': '劫',
    '食神': '食',
    '傷官': '傷',
    '偏財': '偏財',
    '正財': '財',
    '七殺': '殺',
    '正官': '官',
    '偏印': '梟',
    '正印': '印'
  };
  return abbrMap[shiShen];
}

// ============ 十神統計 ============

/**
 * 統計八字中各十神的數量
 */
export function countShiShen(
  dayGan: TianGan,
  pillarsGan: TianGan[],
  pillarsZhi: DiZhi[]
): Record<ShiShen, number> {
  const result: Record<ShiShen, number> = {
    '比肩': 0, '劫財': 0, '食神': 0, '傷官': 0,
    '偏財': 0, '正財': 0, '七殺': 0, '正官': 0,
    '偏印': 0, '正印': 0
  };

  // 統計天干（排除日主自身）
  for (const gan of pillarsGan) {
    if (gan !== dayGan) {
      const ss = getShiShen(dayGan, gan);
      result[ss]++;
    }
  }

  // 統計地支藏干
  for (const zhi of pillarsZhi) {
    const cangGan = ZHI_CANG_GAN[zhi];
    for (const gan of cangGan) {
      const ss = getShiShen(dayGan, gan);
      result[ss]++;
    }
  }

  return result;
}

/**
 * 分析十神分佈特徵
 */
export function analyzeShiShenDistribution(
  shiShenCount: Record<ShiShen, number>
): {
  dominant: ShiShen[];    // 最多的十神
  missing: ShiShen[];     // 缺失的十神
  balanced: boolean;      // 是否分佈均勻
} {
  const entries = Object.entries(shiShenCount) as [ShiShen, number][];
  const maxCount = Math.max(...entries.map(([_, c]) => c));
  const minCount = Math.min(...entries.map(([_, c]) => c));

  const dominant = entries.filter(([_, c]) => c === maxCount).map(([ss, _]) => ss);
  const missing = entries.filter(([_, c]) => c === 0).map(([ss, _]) => ss);
  const balanced = maxCount - minCount <= 2;

  return { dominant, missing, balanced };
}

// ============ 六親對應 ============

/**
 * 十神與六親的對應關係
 * 男命六親
 */
export function getMaleSixRelatives(shiShen: ShiShen): string {
  const map: Record<ShiShen, string> = {
    '比肩': '兄弟',
    '劫財': '異性兄弟姐妹',
    '食神': '子女（女兒）',
    '傷官': '子女（兒子）',
    '偏財': '父親、情人',
    '正財': '妻子',
    '七殺': '兒子',
    '正官': '女兒',
    '偏印': '偏母、繼母',
    '正印': '母親'
  };
  return map[shiShen];
}

/**
 * 女命六親
 */
export function getFemaleSixRelatives(shiShen: ShiShen): string {
  const map: Record<ShiShen, string> = {
    '比肩': '姐妹',
    '劫財': '異性兄弟姐妹',
    '食神': '子女（女兒）',
    '傷官': '子女（兒子）',
    '偏財': '父親',
    '正財': '父親',
    '七殺': '情人、偏夫',
    '正官': '丈夫',
    '偏印': '偏母、繼母',
    '正印': '母親'
  };
  return map[shiShen];
}
