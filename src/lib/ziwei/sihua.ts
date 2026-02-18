/**
 * 四化計算
 * 
 * 四化：化祿、化權、化科、化忌
 * 根據年干決定哪些星曜化為四化
 */

import type { SiHuaName } from './constants';

/**
 * 四化對照表
 * 根據年干查詢化祿、化權、化科、化忌的星曜
 */
export const SI_HUA_TABLE: Record<string, {
  lu: string;    // 化祿
  quan: string;  // 化權
  ke: string;    // 化科
  ji: string;    // 化忌
}> = {
  '甲': { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
  '乙': { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
  '丙': { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
  '丁': { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
  '戊': { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
  '己': { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
  '庚': { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
  '辛': { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
  '壬': { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
  '癸': { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' },
};

/**
 * 四化類型
 */
export interface SiHuaResult {
  lu: { star: string; gongIndex?: number; gongName?: string };
  quan: { star: string; gongIndex?: number; gongName?: string };
  ke: { star: string; gongIndex?: number; gongName?: string };
  ji: { star: string; gongIndex?: number; gongName?: string };
}

/**
 * 計算四化
 * @param yearGan 年干
 * @returns 四化結果
 */
export function calculateSiHua(yearGan: string): SiHuaResult {
  const sihua = SI_HUA_TABLE[yearGan] || SI_HUA_TABLE['甲'];
  
  return {
    lu: { star: sihua.lu },
    quan: { star: sihua.quan },
    ke: { star: sihua.ke },
    ji: { star: sihua.ji },
  };
}

/**
 * 根據星曜位置填充四化的宮位資訊
 * @param sihua 四化結果
 * @param starPositions 星曜位置表（星曜名 -> 地支索引）
 * @param mingGongIndex 命宮地支索引
 * @param gongNames 宮位名稱表
 * @returns 填充宮位資訊後的四化結果
 */
export function fillSiHuaGongInfo(
  sihua: SiHuaResult,
  starPositions: Record<string, number>,
  mingGongIndex: number,
  gongNames: string[]
): SiHuaResult {
  const getGongInfo = (star: string) => {
    const gongIndex = starPositions[star];
    if (gongIndex === undefined) {
      return { star };
    }
    
    // 計算宮位名稱（從命宮開始逆時針）
    const gongNameIndex = (mingGongIndex - gongIndex + 12) % 12;
    const gongName = gongNames[gongNameIndex] || '未知';
    
    return { star, gongIndex, gongName };
  };

  return {
    lu: getGongInfo(sihua.lu.star),
    quan: getGongInfo(sihua.quan.star),
    ke: getGongInfo(sihua.ke.star),
    ji: getGongInfo(sihua.ji.star),
  };
}

/**
 * 取得某星曜的四化
 * @param yearGan 年干
 * @param starName 星曜名稱
 * @returns 四化名稱（祿/權/科/忌）或 undefined
 */
export function getStarSiHua(yearGan: string, starName: string): SiHuaName | undefined {
  const sihua = SI_HUA_TABLE[yearGan];
  if (!sihua) return undefined;

  if (sihua.lu === starName) return '祿';
  if (sihua.quan === starName) return '權';
  if (sihua.ke === starName) return '科';
  if (sihua.ji === starName) return '忌';
  
  return undefined;
}

/**
 * 取得所有可以化為四化的星曜列表
 * @returns 可四化的星曜名稱陣列
 */
export function getSiHuaStars(): string[] {
  const stars = new Set<string>();
  
  for (const sihua of Object.values(SI_HUA_TABLE)) {
    stars.add(sihua.lu);
    stars.add(sihua.quan);
    stars.add(sihua.ke);
    stars.add(sihua.ji);
  }
  
  return Array.from(stars);
}
