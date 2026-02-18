/**
 * 天干地支基礎計算模組
 */

import {
  TIAN_GAN, DI_ZHI, GAN_WU_XING, ZHI_WU_XING,
  GAN_YIN_YANG, ZHI_YIN_YANG, ZHI_CANG_GAN,
  GAN_CHANGSHENG, TWELVE_STAGES, SIXTY_JIAZI_NAYIN,
  TIAN_GAN_HE, TIAN_GAN_HE_HUA, DI_ZHI_LIU_HE, LIU_HE_HUA,
  DI_ZHI_SAN_HE, DI_ZHI_SAN_HUI, DI_ZHI_LIU_CHONG,
  DI_ZHI_XING, DI_ZHI_HAI,
  type TianGan, type DiZhi, type WuXing, type TwelveStage
} from './constants';

// ============ 基礎索引計算 ============

/**
 * 獲取天干的索引（0-9）
 */
export function getGanIndex(gan: TianGan): number {
  return TIAN_GAN.indexOf(gan);
}

/**
 * 獲取地支的索引（0-11）
 */
export function getZhiIndex(zhi: DiZhi): number {
  return DI_ZHI.indexOf(zhi);
}

/**
 * 根據索引獲取天干
 */
export function getGanByIndex(index: number): TianGan {
  return TIAN_GAN[((index % 10) + 10) % 10];
}

/**
 * 根據索引獲取地支
 */
export function getZhiByIndex(index: number): DiZhi {
  return DI_ZHI[((index % 12) + 12) % 12];
}

// ============ 干支組合計算 ============

/**
 * 計算六十甲子的索引（0-59）
 */
export function getJiaZiIndex(gan: TianGan, zhi: DiZhi): number {
  const ganIndex = getGanIndex(gan);
  const zhiIndex = getZhiIndex(zhi);
  // 六十甲子公式：(天干索引 * 6 + 地支索引 * 5) % 60 不對
  // 正確方式：找到滿足 x ≡ ganIndex (mod 10) 且 x ≡ zhiIndex (mod 12) 的最小 x
  for (let i = 0; i < 60; i++) {
    if (i % 10 === ganIndex && i % 12 === zhiIndex) {
      return i;
    }
  }
  return 0;
}

/**
 * 根據六十甲子索引獲取干支
 */
export function getGanZhiByIndex(index: number): { gan: TianGan; zhi: DiZhi } {
  const normalizedIndex = ((index % 60) + 60) % 60;
  return {
    gan: TIAN_GAN[normalizedIndex % 10],
    zhi: DI_ZHI[normalizedIndex % 12]
  };
}

/**
 * 組合干支字串
 */
export function combineGanZhi(gan: TianGan, zhi: DiZhi): string {
  return `${gan}${zhi}`;
}

/**
 * 解析干支字串
 */
export function parseGanZhi(ganZhi: string): { gan: TianGan; zhi: DiZhi } | null {
  if (ganZhi.length !== 2) return null;
  const gan = ganZhi[0] as TianGan;
  const zhi = ganZhi[1] as DiZhi;
  if (!TIAN_GAN.includes(gan) || !DI_ZHI.includes(zhi)) return null;
  return { gan, zhi };
}

// ============ 五行相關 ============

/**
 * 獲取天干五行
 */
export function getGanWuXing(gan: TianGan): WuXing {
  return GAN_WU_XING[gan];
}

/**
 * 獲取地支五行（本氣）
 */
export function getZhiWuXing(zhi: DiZhi): WuXing {
  return ZHI_WU_XING[zhi];
}

/**
 * 獲取天干陰陽
 * @returns 1 = 陽，0 = 陰
 */
export function getGanYinYang(gan: TianGan): 0 | 1 {
  return GAN_YIN_YANG[gan];
}

/**
 * 獲取地支陰陽
 */
export function getZhiYinYang(zhi: DiZhi): 0 | 1 {
  return ZHI_YIN_YANG[zhi];
}

/**
 * 獲取地支藏干
 * @returns [本氣, 中氣?, 餘氣?]
 */
export function getZhiCangGan(zhi: DiZhi): TianGan[] {
  return [...ZHI_CANG_GAN[zhi]];
}

/**
 * 獲取地支本氣（主氣）
 */
export function getZhiMainGan(zhi: DiZhi): TianGan {
  return ZHI_CANG_GAN[zhi][0];
}

// ============ 納音 ============

/**
 * 獲取干支納音
 */
export function getNaYin(gan: TianGan, zhi: DiZhi): string {
  const ganZhi = combineGanZhi(gan, zhi);
  return SIXTY_JIAZI_NAYIN[ganZhi] || '';
}

// ============ 十二長生 ============

/**
 * 計算天干在某地支的十二長生狀態
 * @param gan 天干
 * @param zhi 地支
 * @returns 十二長生狀態
 */
export function getTwelveStage(gan: TianGan, zhi: DiZhi): TwelveStage {
  const changShengZhi = GAN_CHANGSHENG[gan];
  const zhiIndex = getZhiIndex(zhi);
  const changShengIndex = getZhiIndex(changShengZhi);
  
  // 陽干順行，陰干逆行
  const isYang = GAN_YIN_YANG[gan] === 1;
  
  let stageIndex: number;
  if (isYang) {
    stageIndex = (zhiIndex - changShengIndex + 12) % 12;
  } else {
    stageIndex = (changShengIndex - zhiIndex + 12) % 12;
  }
  
  return TWELVE_STAGES[stageIndex];
}

/**
 * 檢查天干是否在某地支得根（長生、祿、旺、墓）
 */
export function hasRoot(gan: TianGan, zhi: DiZhi): boolean {
  const stage = getTwelveStage(gan, zhi);
  // 有根的狀態：長生、臨官（祿）、帝旺、墓
  return ['長生', '臨官', '帝旺', '墓'].includes(stage);
}

// ============ 天干關係 ============

/**
 * 檢查兩天干是否相合
 */
export function isGanHe(gan1: TianGan, gan2: TianGan): boolean {
  return TIAN_GAN_HE[gan1] === gan2;
}

/**
 * 獲取天干合化後的五行（如果能合的話）
 */
export function getGanHeHua(gan1: TianGan, gan2: TianGan): WuXing | null {
  if (!isGanHe(gan1, gan2)) return null;
  const key = `${gan1}${gan2}`;
  return TIAN_GAN_HE_HUA[key] || null;
}

/**
 * 檢查兩天干是否相沖（同五行異陰陽的相沖）
 */
export function isGanChong(gan1: TianGan, gan2: TianGan): boolean {
  // 實際上天干相沖主要是克的概念
  // 甲庚沖、乙辛沖、丙壬沖、丁癸沖
  const chongPairs: [TianGan, TianGan][] = [
    ['甲', '庚'], ['乙', '辛'], ['丙', '壬'], ['丁', '癸']
  ];
  return chongPairs.some(([a, b]) => 
    (gan1 === a && gan2 === b) || (gan1 === b && gan2 === a)
  );
}

// ============ 地支關係 ============

/**
 * 檢查兩地支是否六合
 */
export function isZhiHe(zhi1: DiZhi, zhi2: DiZhi): boolean {
  return DI_ZHI_LIU_HE[zhi1] === zhi2;
}

/**
 * 獲取六合後化的五行
 */
export function getZhiHeHua(zhi1: DiZhi, zhi2: DiZhi): WuXing | null {
  if (!isZhiHe(zhi1, zhi2)) return null;
  const key = `${zhi1}${zhi2}`;
  return LIU_HE_HUA[key] || null;
}

/**
 * 檢查兩地支是否六沖
 */
export function isZhiChong(zhi1: DiZhi, zhi2: DiZhi): boolean {
  return DI_ZHI_LIU_CHONG[zhi1] === zhi2;
}

/**
 * 檢查兩地支是否相害
 */
export function isZhiHai(zhi1: DiZhi, zhi2: DiZhi): boolean {
  return DI_ZHI_HAI[zhi1] === zhi2;
}

/**
 * 檢查地支列表是否構成三合局
 * @returns 如果構成三合局，返回合局的五行；否則返回 null
 */
export function checkSanHe(zhiList: DiZhi[]): WuXing | null {
  if (zhiList.length < 3) return null;
  
  for (const [name, info] of Object.entries(DI_ZHI_SAN_HE)) {
    const { members, element } = info;
    if (members.every(m => zhiList.includes(m))) {
      return element;
    }
  }
  return null;
}

/**
 * 檢查地支列表是否構成半合
 * @returns 如果構成半合，返回相關資訊；否則返回 null
 */
export function checkBanHe(zhiList: DiZhi[]): { type: string; element: WuXing } | null {
  // 半合：三合局中的任意兩個
  // 例如：申子（半合水）、子辰（半合水）、申辰（半合水但力量弱）
  const banHeRules: { pair: DiZhi[]; type: string; element: WuXing }[] = [
    { pair: ['申', '子'], type: '申子半合', element: '水' },
    { pair: ['子', '辰'], type: '子辰半合', element: '水' },
    { pair: ['亥', '卯'], type: '亥卯半合', element: '木' },
    { pair: ['卯', '未'], type: '卯未半合', element: '木' },
    { pair: ['寅', '午'], type: '寅午半合', element: '火' },
    { pair: ['午', '戌'], type: '午戌半合', element: '火' },
    { pair: ['巳', '酉'], type: '巳酉半合', element: '金' },
    { pair: ['酉', '丑'], type: '酉丑半合', element: '金' },
  ];
  
  for (const rule of banHeRules) {
    if (rule.pair.every(z => zhiList.includes(z))) {
      return { type: rule.type, element: rule.element };
    }
  }
  return null;
}

/**
 * 檢查地支列表是否構成三會方
 * @returns 如果構成三會，返回會局的五行；否則返回 null
 */
export function checkSanHui(zhiList: DiZhi[]): WuXing | null {
  if (zhiList.length < 3) return null;
  
  for (const [name, info] of Object.entries(DI_ZHI_SAN_HUI)) {
    const { members, element } = info;
    if (members.every(m => zhiList.includes(m))) {
      return element;
    }
  }
  return null;
}

/**
 * 檢查地支刑的關係
 * @returns 刑的類型列表
 */
export function checkXing(zhiList: DiZhi[]): string[] {
  const results: string[] = [];
  
  // 寅巳申三刑
  if (['寅', '巳', '申'].every(z => zhiList.includes(z as DiZhi))) {
    results.push('寅巳申三刑（無恩之刑）');
  }
  // 丑戌未三刑
  if (['丑', '戌', '未'].every(z => zhiList.includes(z as DiZhi))) {
    results.push('丑戌未三刑（恃勢之刑）');
  }
  // 子卯相刑
  if (zhiList.includes('子') && zhiList.includes('卯')) {
    results.push('子卯相刑（無禮之刑）');
  }
  // 自刑（同一地支出現兩次以上）
  const selfXingZhi: DiZhi[] = ['辰', '午', '酉', '亥'];
  for (const zhi of selfXingZhi) {
    const count = zhiList.filter(z => z === zhi).length;
    if (count >= 2) {
      results.push(`${zhi}${zhi}自刑`);
    }
  }
  
  return results;
}

// ============ 干支推算 ============

/**
 * 推算下一個干支
 */
export function nextGanZhi(gan: TianGan, zhi: DiZhi): { gan: TianGan; zhi: DiZhi } {
  const ganIndex = getGanIndex(gan);
  const zhiIndex = getZhiIndex(zhi);
  return {
    gan: TIAN_GAN[(ganIndex + 1) % 10],
    zhi: DI_ZHI[(zhiIndex + 1) % 12]
  };
}

/**
 * 推算上一個干支
 */
export function prevGanZhi(gan: TianGan, zhi: DiZhi): { gan: TianGan; zhi: DiZhi } {
  const ganIndex = getGanIndex(gan);
  const zhiIndex = getZhiIndex(zhi);
  return {
    gan: TIAN_GAN[(ganIndex + 9) % 10],  // +9 相當於 -1
    zhi: DI_ZHI[(zhiIndex + 11) % 12]    // +11 相當於 -1
  };
}

/**
 * 從某干支推算 n 步後的干支
 * @param n 正數順推，負數逆推
 */
export function stepGanZhi(gan: TianGan, zhi: DiZhi, n: number): { gan: TianGan; zhi: DiZhi } {
  const ganIndex = getGanIndex(gan);
  const zhiIndex = getZhiIndex(zhi);
  return {
    gan: getGanByIndex(ganIndex + n),
    zhi: getZhiByIndex(zhiIndex + n)
  };
}

// ============ 輔助函數 ============

/**
 * 檢查干支是否有效（陰陽一致）
 * 甲子、乙丑... 都是陽配陽或陰配陰
 */
export function isValidGanZhi(gan: TianGan, zhi: DiZhi): boolean {
  return GAN_YIN_YANG[gan] === ZHI_YIN_YANG[zhi];
}

/**
 * 生成六十甲子列表
 */
export function generateSixtyJiaZi(): { gan: TianGan; zhi: DiZhi; ganZhi: string }[] {
  const result: { gan: TianGan; zhi: DiZhi; ganZhi: string }[] = [];
  for (let i = 0; i < 60; i++) {
    const gan = TIAN_GAN[i % 10];
    const zhi = DI_ZHI[i % 12];
    result.push({ gan, zhi, ganZhi: `${gan}${zhi}` });
  }
  return result;
}
