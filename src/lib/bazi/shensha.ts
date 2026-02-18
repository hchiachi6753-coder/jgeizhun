/**
 * 神煞計算模組
 * 
 * 神煞是八字命理中的輔助判斷因素，包括吉神（如天乙貴人、文昌）
 * 和凶煞（如羊刃、亡神）。
 * 
 * 注意：神煞只是輔助參考，不能單獨論斷吉凶。
 */

import {
  TIAN_GAN, DI_ZHI, GAN_YIN_YANG,
  type TianGan, type DiZhi
} from './constants';
import type { FourPillars, ShenShaInfo } from './types';

// ============ 神煞定義 ============

/**
 * 天乙貴人（以日干查）
 * 歌訣：甲戊庚牛羊，乙己鼠猴鄉，丙丁豬雞位，壬癸兔蛇藏，六辛逢馬虎，此是貴人方。
 */
const TIAN_YI_GUI_REN: Record<TianGan, DiZhi[]> = {
  '甲': ['丑', '未'],
  '戊': ['丑', '未'],
  '庚': ['丑', '未'],
  '乙': ['子', '申'],
  '己': ['子', '申'],
  '丙': ['亥', '酉'],
  '丁': ['亥', '酉'],
  '壬': ['卯', '巳'],
  '癸': ['卯', '巳'],
  '辛': ['午', '寅']
};

/**
 * 文昌星（以日干查）
 * 甲乙巳午報君知，丙戊申宮丁己雞，庚豬辛鼠壬逢虎，癸人見卯入雲梯。
 */
const WEN_CHANG: Record<TianGan, DiZhi> = {
  '甲': '巳', '乙': '午',
  '丙': '申', '丁': '酉',
  '戊': '申', '己': '酉',
  '庚': '亥', '辛': '子',
  '壬': '寅', '癸': '卯'
};

/**
 * 羊刃（以日干查，只有陽干有羊刃）
 */
const YANG_REN: Record<TianGan, DiZhi | null> = {
  '甲': '卯', '乙': null,
  '丙': '午', '丁': null,
  '戊': '午', '己': null,
  '庚': '酉', '辛': null,
  '壬': '子', '癸': null
};

/**
 * 祿神（以日干查）
 */
const LU_SHEN: Record<TianGan, DiZhi> = {
  '甲': '寅', '乙': '卯',
  '丙': '巳', '丁': '午',
  '戊': '巳', '己': '午',
  '庚': '申', '辛': '酉',
  '壬': '亥', '癸': '子'
};

/**
 * 驛馬（以日支或年支查）
 * 申子辰馬在寅，寅午戌馬在申，巳酉丑馬在亥，亥卯未馬在巳
 */
const YI_MA: Record<DiZhi, DiZhi> = {
  '申': '寅', '子': '寅', '辰': '寅',
  '寅': '申', '午': '申', '戌': '申',
  '巳': '亥', '酉': '亥', '丑': '亥',
  '亥': '巳', '卯': '巳', '未': '巳'
};

/**
 * 桃花（咸池）（以日支或年支查）
 * 申子辰桃花在酉，寅午戌桃花在卯，巳酉丑桃花在午，亥卯未桃花在子
 */
const TAO_HUA: Record<DiZhi, DiZhi> = {
  '申': '酉', '子': '酉', '辰': '酉',
  '寅': '卯', '午': '卯', '戌': '卯',
  '巳': '午', '酉': '午', '丑': '午',
  '亥': '子', '卯': '子', '未': '子'
};

/**
 * 華蓋（以日支或年支查）
 * 申子辰見辰，寅午戌見戌，巳酉丑見丑，亥卯未見未
 */
const HUA_GAI: Record<DiZhi, DiZhi> = {
  '申': '辰', '子': '辰', '辰': '辰',
  '寅': '戌', '午': '戌', '戌': '戌',
  '巳': '丑', '酉': '丑', '丑': '丑',
  '亥': '未', '卯': '未', '未': '未'
};

/**
 * 劫煞（以日支或年支查）
 * 申子辰劫在巳，寅午戌劫在亥，巳酉丑劫在寅，亥卯未劫在申
 */
const JIE_SHA: Record<DiZhi, DiZhi> = {
  '申': '巳', '子': '巳', '辰': '巳',
  '寅': '亥', '午': '亥', '戌': '亥',
  '巳': '寅', '酉': '寅', '丑': '寅',
  '亥': '申', '卯': '申', '未': '申'
};

/**
 * 亡神（以日支或年支查）
 */
const WANG_SHEN: Record<DiZhi, DiZhi> = {
  '申': '亥', '子': '亥', '辰': '亥',
  '寅': '巳', '午': '巳', '戌': '巳',
  '巳': '申', '酉': '申', '丑': '申',
  '亥': '寅', '卯': '寅', '未': '寅'
};

/**
 * 將星（以日支或年支查）
 */
const JIANG_XING: Record<DiZhi, DiZhi> = {
  '申': '子', '子': '子', '辰': '子',
  '寅': '午', '午': '午', '戌': '午',
  '巳': '酉', '酉': '酉', '丑': '酉',
  '亥': '卯', '卯': '卯', '未': '卯'
};

// ============ 神煞計算函數 ============

/**
 * 檢查天乙貴人
 */
export function checkTianYiGuiRen(
  dayGan: TianGan,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const guiRenZhis = TIAN_YI_GUI_REN[dayGan];

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (guiRenZhis.includes(zhis[i])) {
      result.push({
        name: '天乙貴人',
        type: 'auspicious',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '遇難呈祥，逢凶化吉，有貴人相助'
      });
    }
  }

  return result;
}

/**
 * 檢查文昌星
 */
export function checkWenChang(
  dayGan: TianGan,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const wenChangZhi = WEN_CHANG[dayGan];

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (zhis[i] === wenChangZhi) {
      result.push({
        name: '文昌星',
        type: 'auspicious',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '聰明好學，利於考試升學，文章出眾'
      });
    }
  }

  return result;
}

/**
 * 檢查羊刃
 */
export function checkYangRen(
  dayGan: TianGan,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const yangRenZhi = YANG_REN[dayGan];

  if (!yangRenZhi) return result;

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (zhis[i] === yangRenZhi) {
      result.push({
        name: '羊刃',
        type: 'inauspicious',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '性剛果斷，易有血光之災，需官殺制之則吉'
      });
    }
  }

  return result;
}

/**
 * 檢查祿神
 */
export function checkLuShen(
  dayGan: TianGan,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const luShenZhi = LU_SHEN[dayGan];

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (zhis[i] === luShenZhi) {
      result.push({
        name: '祿神',
        type: 'auspicious',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '衣食無憂，主財祿豐足'
      });
    }
  }

  return result;
}

/**
 * 檢查驛馬
 */
export function checkYiMa(
  yearZhi: DiZhi,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const yiMaZhi = YI_MA[yearZhi];

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (zhis[i] === yiMaZhi) {
      result.push({
        name: '驛馬',
        type: 'neutral',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '主遷移、出行、變動，利於外出發展'
      });
    }
  }

  return result;
}

/**
 * 檢查桃花
 */
export function checkTaoHua(
  yearZhi: DiZhi,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const taoHuaZhi = TAO_HUA[yearZhi];

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (zhis[i] === taoHuaZhi) {
      result.push({
        name: '桃花',
        type: 'neutral',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '主異性緣，人緣好，才藝出眾'
      });
    }
  }

  return result;
}

/**
 * 檢查華蓋
 */
export function checkHuaGai(
  yearZhi: DiZhi,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const huaGaiZhi = HUA_GAI[yearZhi];

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (zhis[i] === huaGaiZhi) {
      result.push({
        name: '華蓋',
        type: 'neutral',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '聰明孤傲，有藝術才華，喜研究玄學'
      });
    }
  }

  return result;
}

/**
 * 檢查劫煞
 */
export function checkJieSha(
  yearZhi: DiZhi,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const jieShaZhi = JIE_SHA[yearZhi];

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (zhis[i] === jieShaZhi) {
      result.push({
        name: '劫煞',
        type: 'inauspicious',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '主劫難、破財、是非，需謹慎'
      });
    }
  }

  return result;
}

/**
 * 檢查將星
 */
export function checkJiangXing(
  yearZhi: DiZhi,
  zhis: DiZhi[]
): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const jiangXingZhi = JIANG_XING[yearZhi];

  const pillarNames: ('year' | 'month' | 'day' | 'hour')[] = ['year', 'month', 'day', 'hour'];

  for (let i = 0; i < zhis.length; i++) {
    if (zhis[i] === jiangXingZhi) {
      result.push({
        name: '將星',
        type: 'auspicious',
        pillar: pillarNames[i],
        position: 'zhi',
        description: '有領導才能，利於從政從軍'
      });
    }
  }

  return result;
}

// ============ 綜合神煞計算 ============

/**
 * 計算所有神煞
 */
export function calculateAllShenSha(pillars: FourPillars): ShenShaInfo[] {
  const result: ShenShaInfo[] = [];
  const dayGan = pillars.day.gan;
  const yearZhi = pillars.year.zhi;
  const zhis: DiZhi[] = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];

  // 以日干為主的神煞
  result.push(...checkTianYiGuiRen(dayGan, zhis));
  result.push(...checkWenChang(dayGan, zhis));
  result.push(...checkYangRen(dayGan, zhis));
  result.push(...checkLuShen(dayGan, zhis));

  // 以年支為主的神煞
  result.push(...checkYiMa(yearZhi, zhis));
  result.push(...checkTaoHua(yearZhi, zhis));
  result.push(...checkHuaGai(yearZhi, zhis));
  result.push(...checkJieSha(yearZhi, zhis));
  result.push(...checkJiangXing(yearZhi, zhis));

  return result;
}

/**
 * 按類型分類神煞
 */
export function categorizeShehSha(shenShaList: ShenShaInfo[]): {
  auspicious: ShenShaInfo[];
  inauspicious: ShenShaInfo[];
  neutral: ShenShaInfo[];
} {
  return {
    auspicious: shenShaList.filter(ss => ss.type === 'auspicious'),
    inauspicious: shenShaList.filter(ss => ss.type === 'inauspicious'),
    neutral: shenShaList.filter(ss => ss.type === 'neutral')
  };
}

/**
 * 生成神煞報告
 */
export function generateShenShaReport(pillars: FourPillars): string {
  const shenShaList = calculateAllShenSha(pillars);
  const categorized = categorizeShehSha(shenShaList);

  let report = '【神煞分析】\n\n';

  if (categorized.auspicious.length > 0) {
    report += '吉神：\n';
    for (const ss of categorized.auspicious) {
      report += `  ${ss.name}（${ss.pillar}支）：${ss.description}\n`;
    }
    report += '\n';
  }

  if (categorized.inauspicious.length > 0) {
    report += '凶煞：\n';
    for (const ss of categorized.inauspicious) {
      report += `  ${ss.name}（${ss.pillar}支）：${ss.description}\n`;
    }
    report += '\n';
  }

  if (categorized.neutral.length > 0) {
    report += '中性神煞：\n';
    for (const ss of categorized.neutral) {
      report += `  ${ss.name}（${ss.pillar}支）：${ss.description}\n`;
    }
  }

  if (shenShaList.length === 0) {
    report += '未見明顯神煞。\n';
  }

  report += '\n（神煞僅供參考，需結合整體命局判斷）';

  return report;
}
