/**
 * 五行分析模組
 * 
 * 分析八字中的五行分佈、日主強弱、用神喜忌等。
 */

import {
  WU_XING, GAN_WU_XING, ZHI_WU_XING, ZHI_CANG_GAN,
  WU_XING_SHENG, WU_XING_KE, TWELVE_STAGES,
  type TianGan, type DiZhi, type WuXing
} from './constants';
import { getTwelveStage, checkSanHe, checkSanHui, checkBanHe } from './ganzhi';
import type { FourPillars, WuXingAnalysis } from './types';

// ============ 五行統計 ============

/**
 * 統計八字中各五行的數量（簡單計數）
 */
export function countWuXing(pillars: FourPillars): Record<WuXing, number> {
  const count: Record<WuXing, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  // 統計天干
  const gans: TianGan[] = [pillars.year.gan, pillars.month.gan, pillars.day.gan, pillars.hour.gan];
  for (const gan of gans) {
    count[GAN_WU_XING[gan]]++;
  }

  // 統計地支（以本氣計）
  const zhis: DiZhi[] = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
  for (const zhi of zhis) {
    count[ZHI_WU_XING[zhi]]++;
  }

  return count;
}

/**
 * 統計八字中各五行的力量分數（考慮藏干、得令、通根等因素）
 */
export function scoreWuXing(pillars: FourPillars): Record<WuXing, number> {
  const score: Record<WuXing, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

  // 天干計分（透出有力）
  const gans: TianGan[] = [pillars.year.gan, pillars.month.gan, pillars.day.gan, pillars.hour.gan];
  for (const gan of gans) {
    score[GAN_WU_XING[gan]] += 10;  // 天干透出 +10
  }

  // 地支藏干計分
  const zhis: DiZhi[] = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
  const pillarWeights = [1, 1.5, 1.2, 1];  // 月支權重最高

  for (let i = 0; i < zhis.length; i++) {
    const zhi = zhis[i];
    const weight = pillarWeights[i];
    const cangGan = ZHI_CANG_GAN[zhi];

    // 本氣最強，中氣次之，餘氣最弱
    const cangWeights = [7, 3, 2];  // 本氣、中氣、餘氣的權重

    for (let j = 0; j < cangGan.length; j++) {
      const gan = cangGan[j];
      score[GAN_WU_XING[gan]] += cangWeights[j] * weight;
    }
  }

  // 檢查三合局、三會方，加強對應五行
  const sanHe = checkSanHe(zhis);
  if (sanHe) {
    score[sanHe] += 15;  // 三合局加分
  }

  const sanHui = checkSanHui(zhis);
  if (sanHui) {
    score[sanHui] += 20;  // 三會方加分更多
  }

  const banHe = checkBanHe(zhis);
  if (banHe) {
    score[banHe.element] += 8;  // 半合加分
  }

  // 四捨五入到整數
  for (const wx of WU_XING) {
    score[wx] = Math.round(score[wx]);
  }

  return score;
}

// ============ 日主強弱分析 ============

/**
 * 分析日主強弱
 */
export function analyzeDayMasterStrength(
  pillars: FourPillars
): {
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
  factors: string[];
} {
  const dayGan = pillars.day.gan;
  const dayWuXing = GAN_WU_XING[dayGan];
  const monthZhi = pillars.month.zhi;

  let score = 0;
  const factors: string[] = [];

  // 1. 月令得失（最重要，佔 40%）
  const monthZhiWuXing = ZHI_WU_XING[monthZhi];
  const monthMainGan = ZHI_CANG_GAN[monthZhi][0];
  const monthMainWuXing = GAN_WU_XING[monthMainGan];

  // 得令：月支五行生日主或同日主
  if (monthMainWuXing === dayWuXing) {
    score += 30;
    factors.push(`月令${monthZhi}與日主同五行（得令）`);
  } else if (WU_XING_SHENG[monthMainWuXing] === dayWuXing) {
    // 不對，應該是生我的五行
    // 生我的五行索引 = (我的索引 + 4) % 5
  }

  // 檢查月令是否生日主
  const wuXingOrder: WuXing[] = ['木', '火', '土', '金', '水'];
  const dayIdx = wuXingOrder.indexOf(dayWuXing);
  const monthIdx = wuXingOrder.indexOf(monthMainWuXing);
  const relation = (dayIdx - monthIdx + 5) % 5;

  if (relation === 1) {
    // 月令生日主
    score += 25;
    factors.push(`月令${monthZhi}（${monthMainWuXing}）生日主（得令）`);
  } else if (relation === 4) {
    // 日主生月令（洩氣）
    score -= 15;
    factors.push(`日主生月令${monthZhi}（洩氣）`);
  } else if (relation === 2) {
    // 日主剋月令（耗氣）
    score -= 10;
    factors.push(`日主剋月令${monthZhi}（耗氣）`);
  } else if (relation === 3) {
    // 月令剋日主
    score -= 25;
    factors.push(`月令${monthZhi}剋日主（失令）`);
  }

  // 2. 通根情況（佔 30%）
  const zhis: DiZhi[] = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
  let rootCount = 0;

  for (const zhi of zhis) {
    const cangGan = ZHI_CANG_GAN[zhi];
    for (const gan of cangGan) {
      if (GAN_WU_XING[gan] === dayWuXing) {
        rootCount++;
        break;  // 每個地支只計一次
      }
    }
  }

  score += rootCount * 8;
  if (rootCount > 0) {
    factors.push(`日主通根 ${rootCount} 處`);
  }

  // 3. 十二長生狀態
  for (const zhi of zhis) {
    const stage = getTwelveStage(dayGan, zhi);
    if (stage === '帝旺') {
      score += 10;
      factors.push(`${zhi}為帝旺`);
    } else if (stage === '臨官') {
      score += 8;
      factors.push(`${zhi}為臨官（祿）`);
    } else if (stage === '長生') {
      score += 6;
      factors.push(`${zhi}為長生`);
    } else if (stage === '墓') {
      score += 4;
      factors.push(`${zhi}為墓庫`);
    } else if (stage === '死' || stage === '絕') {
      score -= 5;
    }
  }

  // 4. 比劫幫身
  const gans: TianGan[] = [pillars.year.gan, pillars.month.gan, pillars.hour.gan];
  for (const gan of gans) {
    if (GAN_WU_XING[gan] === dayWuXing) {
      score += 5;
      factors.push(`${gan}為比劫`);
    }
  }

  // 5. 印星生身
  const yinWuXing = wuXingOrder[(dayIdx + 4) % 5];  // 生我者為印
  for (const gan of gans) {
    if (GAN_WU_XING[gan] === yinWuXing) {
      score += 4;
      factors.push(`${gan}為印星`);
    }
  }

  // 判斷強弱等級
  let strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  if (score < 10) {
    strength = 'very_weak';
  } else if (score < 25) {
    strength = 'weak';
  } else if (score < 45) {
    strength = 'medium';
  } else if (score < 60) {
    strength = 'strong';
  } else {
    strength = 'very_strong';
  }

  return { strength, score, factors };
}

// ============ 完整五行分析 ============

/**
 * 完整的五行分析
 */
export function analyzeWuXing(pillars: FourPillars): WuXingAnalysis {
  const dayGan = pillars.day.gan;
  const dayWuXing = GAN_WU_XING[dayGan];

  const count = countWuXing(pillars);
  const score = scoreWuXing(pillars);
  const strengthAnalysis = analyzeDayMasterStrength(pillars);

  // 找出缺失的五行（數量為 0）
  const missingElements: WuXing[] = [];
  for (const wx of WU_XING) {
    if (count[wx] === 0) {
      missingElements.push(wx);
    }
  }

  // 找出過旺的五行（分數超過平均值的 2 倍）
  const avgScore = Object.values(score).reduce((a, b) => a + b, 0) / 5;
  const excessElements: WuXing[] = [];
  for (const wx of WU_XING) {
    if (score[wx] > avgScore * 2) {
      excessElements.push(wx);
    }
  }

  // 轉換強弱等級
  const strengthMap: Record<string, WuXingAnalysis['dayMasterStrength']> = {
    'very_weak': 'weak',
    'weak': 'weak',
    'medium': 'medium',
    'strong': 'strong',
    'very_strong': 'very_strong'
  };

  return {
    count,
    score,
    dayMasterElement: dayWuXing,
    dayMasterStrength: strengthMap[strengthAnalysis.strength],
    missingElements,
    excessElements
  };
}

// ============ 用神推斷 ============

/**
 * 根據日主強弱推斷用神喜忌（簡化版）
 * 
 * 基本原則：
 * - 身強：喜財、官、食傷；忌印、比劫
 * - 身弱：喜印、比劫；忌財、官、食傷
 */
export function inferYongShen(
  pillars: FourPillars
): {
  yongShen: WuXing;       // 用神五行
  xiShen: WuXing;         // 喜神五行
  jiShen: WuXing[];       // 忌神五行
} {
  const dayGan = pillars.day.gan;
  const dayWuXing = GAN_WU_XING[dayGan];
  const strengthAnalysis = analyzeDayMasterStrength(pillars);

  const wuXingOrder: WuXing[] = ['木', '火', '土', '金', '水'];
  const dayIdx = wuXingOrder.indexOf(dayWuXing);

  // 各關係的五行
  const biJieWuXing = dayWuXing;  // 同我
  const shiShangWuXing = wuXingOrder[(dayIdx + 1) % 5];  // 我生
  const caiWuXing = wuXingOrder[(dayIdx + 2) % 5];  // 我剋
  const guanShaWuXing = wuXingOrder[(dayIdx + 3) % 5];  // 剋我
  const yinWuXing = wuXingOrder[(dayIdx + 4) % 5];  // 生我

  if (strengthAnalysis.strength === 'weak' || strengthAnalysis.strength === 'very_weak') {
    // 身弱：用印或比劫
    return {
      yongShen: yinWuXing,
      xiShen: biJieWuXing,
      jiShen: [caiWuXing, guanShaWuXing, shiShangWuXing]
    };
  } else if (strengthAnalysis.strength === 'strong' || strengthAnalysis.strength === 'very_strong') {
    // 身強：用財或官殺或食傷
    return {
      yongShen: caiWuXing,
      xiShen: shiShangWuXing,
      jiShen: [yinWuXing, biJieWuXing]
    };
  } else {
    // 身中和：根據命局具體情況
    // 簡化處理：取調候需要
    return {
      yongShen: caiWuXing,
      xiShen: guanShaWuXing,
      jiShen: [biJieWuXing]
    };
  }
}

// ============ 五行關係描述 ============

/**
 * 獲取兩五行的關係描述
 */
export function getWuXingRelation(wx1: WuXing, wx2: WuXing): string {
  if (wx1 === wx2) return '同類';
  if (WU_XING_SHENG[wx1] === wx2) return '相生';
  if (WU_XING_KE[wx1] === wx2) return '相剋';

  // 反向
  if (WU_XING_SHENG[wx2] === wx1) return '被生';
  if (WU_XING_KE[wx2] === wx1) return '被剋';

  return '無直接關係';
}

/**
 * 獲取五行特性描述
 */
export function getWuXingTraits(wx: WuXing): {
  nature: string;
  direction: string;
  season: string;
  organ: string;
  emotion: string;
} {
  const traits: Record<WuXing, any> = {
    '木': { nature: '仁', direction: '東', season: '春', organ: '肝膽', emotion: '怒' },
    '火': { nature: '禮', direction: '南', season: '夏', organ: '心小腸', emotion: '喜' },
    '土': { nature: '信', direction: '中', season: '四季末', organ: '脾胃', emotion: '思' },
    '金': { nature: '義', direction: '西', season: '秋', organ: '肺大腸', emotion: '悲' },
    '水': { nature: '智', direction: '北', season: '冬', organ: '腎膀胱', emotion: '恐' }
  };

  return traits[wx];
}
