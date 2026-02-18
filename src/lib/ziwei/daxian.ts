/**
 * 大限計算
 * 
 * 大限是紫微斗數中十年一運的計算方式
 * 
 * 規則：
 * 1. 起運歲數根據五行局：水二局2歲、木三局3歲、金四局4歲、土五局5歲、火六局6歲
 * 2. 每個大限10年
 * 3. 行運方向：陽男陰女順行，陰男陽女逆行
 */

import { TIAN_GAN, DI_ZHI, GONG_NAMES, type JuNum, type TianGan } from './constants';
import { calculateSiHua, type SiHuaResult } from './sihua';

/**
 * 五行局對應的起運歲數
 */
const JU_START_AGE: Record<JuNum, number> = {
  2: 2,  // 水二局
  3: 3,  // 木三局
  4: 4,  // 金四局
  5: 5,  // 土五局
  6: 6,  // 火六局
};

/**
 * 判斷是否為陽年（年干為陽）
 * 陽干：甲丙戊庚壬（索引0,2,4,6,8）
 * 陰干：乙丁己辛癸（索引1,3,5,7,9）
 */
export function isYangYear(yearGan: string): boolean {
  const index = TIAN_GAN.indexOf(yearGan as TianGan);
  return index >= 0 && index % 2 === 0;
}

/**
 * 判斷大限行運方向
 * 陽男陰女順行，陰男陽女逆行
 * 
 * @param yearGan 年干
 * @param gender 性別
 * @returns true=順行，false=逆行
 */
export function isDaxianShunXing(yearGan: string, gender: 'male' | 'female'): boolean {
  const isYang = isYangYear(yearGan);
  const isMale = gender === 'male';
  
  // 陽男陰女順行
  if ((isYang && isMale) || (!isYang && !isMale)) {
    return true;
  }
  // 陰男陽女逆行
  return false;
}

/**
 * 單個大限資訊
 */
export interface DaxianInfo {
  /** 第幾大限（從1開始） */
  order: number;
  /** 起始年齡 */
  startAge: number;
  /** 結束年齡 */
  endAge: number;
  /** 大限宮位地支索引 */
  gongIndex: number;
  /** 大限宮位地支 */
  gongZhi: string;
  /** 大限宮位名稱 */
  gongName: string;
  /** 大限天干 */
  gongGan: string;
  /** 大限四化 */
  siHua: SiHuaResult;
}

/**
 * 大限總覽
 */
export interface DaxianOverview {
  /** 起運歲數 */
  startAge: number;
  /** 行運方向：順行或逆行 */
  direction: '順行' | '逆行';
  /** 各大限詳情（通常算12個大限，覆蓋人生各階段） */
  periods: DaxianInfo[];
}

/**
 * 計算大限
 * 
 * @param mingGongIndex 命宮地支索引
 * @param juNum 五行局數
 * @param yearGan 年干
 * @param gender 性別
 * @param gongGans 十二宮天干陣列
 * @returns 大限總覽
 */
export function calculateDaxian(
  mingGongIndex: number,
  juNum: JuNum,
  yearGan: string,
  gender: 'male' | 'female',
  gongGans: string[]
): DaxianOverview {
  const startAge = JU_START_AGE[juNum];
  const isShunXing = isDaxianShunXing(yearGan, gender);
  
  const periods: DaxianInfo[] = [];
  
  // 計算12個大限（0-121歲左右）
  for (let i = 0; i < 12; i++) {
    const order = i + 1;
    const periodStartAge = startAge + i * 10;
    const periodEndAge = periodStartAge + 9;
    
    // 大限宮位計算
    // 第一大限從命宮開始，順行往前數（逆時針增加索引），逆行往後數（順時針減少索引）
    let gongIndex: number;
    if (isShunXing) {
      // 順行：命宮→父母→福德→田宅...（地支索引 +1）
      gongIndex = (mingGongIndex + i) % 12;
    } else {
      // 逆行：命宮→兄弟→夫妻→子女...（地支索引 -1）
      gongIndex = (mingGongIndex - i + 12) % 12;
    }
    
    const gongZhi = DI_ZHI[gongIndex];
    const gongGan = gongGans[gongIndex];
    
    // 計算該宮位對應的宮位名稱
    const gongNameIndex = (mingGongIndex - gongIndex + 12) % 12;
    const gongName = GONG_NAMES[gongNameIndex];
    
    // 大限四化（根據大限宮位的天干）
    const siHua = calculateSiHua(gongGan);
    
    periods.push({
      order,
      startAge: periodStartAge,
      endAge: periodEndAge,
      gongIndex,
      gongZhi,
      gongName,
      gongGan,
      siHua,
    });
  }
  
  return {
    startAge,
    direction: isShunXing ? '順行' : '逆行',
    periods,
  };
}

/**
 * 根據年齡查詢所在大限
 * 
 * @param age 虛歲
 * @param daxianOverview 大限總覽
 * @returns 當前大限資訊，若超出範圍則返回 undefined
 */
export function getDaxianByAge(age: number, daxianOverview: DaxianOverview): DaxianInfo | undefined {
  return daxianOverview.periods.find(
    period => age >= period.startAge && age <= period.endAge
  );
}

/**
 * 根據西元年和出生年計算所在大限
 * 
 * @param currentYear 當前西元年
 * @param birthYear 出生西元年
 * @param daxianOverview 大限總覽
 * @returns 當前大限資訊
 */
export function getDaxianByYear(
  currentYear: number,
  birthYear: number,
  daxianOverview: DaxianOverview
): DaxianInfo | undefined {
  // 虛歲 = 當前年 - 出生年 + 1
  const age = currentYear - birthYear + 1;
  return getDaxianByAge(age, daxianOverview);
}
