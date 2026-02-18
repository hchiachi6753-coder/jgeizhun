/**
 * 五行局計算
 * 
 * 五行局是根據命宮地支和年干的納音五行來決定
 * 是紫微斗數起紫微星的關鍵
 */

import { TIAN_GAN, DI_ZHI, SIXTY_JIAZI_NAYIN, WU_XING_JU, type JuNum, type WuXing } from './constants';

/**
 * 五行局對照表
 * 根據命宮地支和納音五行查表
 * 
 * 結構：[命宮地支索引][納音五行] = 局數
 * 納音五行索引：金=0, 水=1, 木=2, 火=3, 土=4
 */
const JU_TABLE: number[][] = [
  // 子: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 丑: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 寅: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 卯: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 辰: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 巳: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 午: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 未: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 申: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 酉: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 戌: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
  // 亥: 金四局、水二局、木三局、火六局、土五局
  [4, 2, 3, 6, 5],
];

// 五行對應索引
const WUXING_INDEX: Record<WuXing, number> = {
  '金': 0,
  '水': 1,
  '木': 2,
  '火': 3,
  '土': 4,
};

/**
 * 根據命宮天干地支計算五行局
 * 
 * 計算步驟：
 * 1. 找出命宮的天干（根據年干起寅宮推算）
 * 2. 組合命宮干支，查納音五行
 * 3. 根據命宮地支和納音五行查五行局表
 * 
 * @param mingGongIndex 命宮地支索引 (0=子, 1=丑, ...)
 * @param yearGan 年干
 * @returns 五行局數
 */
export function calculateWuXingJu(mingGongIndex: number, yearGan: string): JuNum {
  // 1. 計算命宮天干
  // 年干起寅宮規則：
  // 甲己年：丙寅起（丙=2）
  // 乙庚年：戊寅起（戊=4）
  // 丙辛年：庚寅起（庚=6）
  // 丁壬年：壬寅起（壬=8）
  // 戊癸年：甲寅起（甲=0）
  const ganStartMap: Record<string, number> = {
    '甲': 2, '己': 2,
    '乙': 4, '庚': 4,
    '丙': 6, '辛': 6,
    '丁': 8, '壬': 8,
    '戊': 0, '癸': 0,
  };

  const ganStart = ganStartMap[yearGan] ?? 0;
  
  // 命宮地支索引轉換為從寅起算的位置
  // 寅=2, 所以命宮從寅算起的偏移 = (mingGongIndex - 2 + 12) % 12
  const offsetFromYin = (mingGongIndex - 2 + 12) % 12;
  
  // 命宮天干 = 寅宮天干 + 偏移量
  const mingGongGanIndex = (ganStart + offsetFromYin) % 10;
  const mingGongGan = TIAN_GAN[mingGongGanIndex];
  const mingGongZhi = DI_ZHI[mingGongIndex];
  
  // 2. 組合命宮干支，查納音五行
  const ganZhi = mingGongGan + mingGongZhi;
  const nayin = SIXTY_JIAZI_NAYIN[ganZhi];
  
  if (!nayin) {
    // 預設金四局
    console.warn(`找不到納音：${ganZhi}，使用預設金四局`);
    return 4;
  }
  
  // 3. 根據命宮地支和納音五行查五行局表
  const wuxingIndex = WUXING_INDEX[nayin];
  const ju = JU_TABLE[mingGongIndex][wuxingIndex] as JuNum;
  
  return ju;
}

/**
 * 取得五行局名稱
 * @param juNum 局數
 * @returns 五行局名稱
 */
export function getWuXingJuName(juNum: JuNum): string {
  return WU_XING_JU[juNum];
}

/**
 * 計算命宮天干
 * @param mingGongIndex 命宮地支索引
 * @param yearGan 年干
 * @returns 命宮天干
 */
export function getMingGongGan(mingGongIndex: number, yearGan: string): string {
  const ganStartMap: Record<string, number> = {
    '甲': 2, '己': 2,
    '乙': 4, '庚': 4,
    '丙': 6, '辛': 6,
    '丁': 8, '壬': 8,
    '戊': 0, '癸': 0,
  };

  const ganStart = ganStartMap[yearGan] ?? 0;
  const offsetFromYin = (mingGongIndex - 2 + 12) % 12;
  const mingGongGanIndex = (ganStart + offsetFromYin) % 10;
  
  return TIAN_GAN[mingGongGanIndex];
}

/**
 * 計算十二宮的天干
 * @param yearGan 年干
 * @returns 十二宮天干陣列（從子宮開始）
 */
export function calculateGongGans(yearGan: string): string[] {
  const ganStartMap: Record<string, number> = {
    '甲': 2, '己': 2,  // 丙寅
    '乙': 4, '庚': 4,  // 戊寅
    '丙': 6, '辛': 6,  // 庚寅
    '丁': 8, '壬': 8,  // 壬寅
    '戊': 0, '癸': 0,  // 甲寅
  };

  const ganStart = ganStartMap[yearGan] ?? 0;
  const gongGans: string[] = [];

  for (let i = 0; i < 12; i++) {
    // 從子宮算起，寅宮是第2個
    const offsetFromYin = (i - 2 + 12) % 12;
    const ganIndex = (ganStart + offsetFromYin) % 10;
    gongGans.push(TIAN_GAN[ganIndex]);
  }

  return gongGans;
}
