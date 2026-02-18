/**
 * 流月計算模組
 * 
 * 流月是每月的干支，用於結合大運和流年進行更細緻的運勢分析。
 * 月干支以「節」為界（立春、驚蟄、清明...），而非農曆初一。
 * 
 * 月干計算公式（以年干為基準）：
 * - 甲己年起丙寅月（正月）
 * - 乙庚年起戊寅月
 * - 丙辛年起庚寅月
 * - 丁壬年起壬寅月
 * - 戊癸年起甲寅月
 */

// @ts-nocheck
import { Solar, Lunar } from 'lunar-javascript';
import {
  TIAN_GAN, DI_ZHI, GAN_WU_XING, ZHI_WU_XING,
  type TianGan, type DiZhi, type WuXing, type ShiShen
} from './constants';
import { combineGanZhi, getNaYin, getGanByIndex, getZhiByIndex, getGanIndex, getZhiIndex } from './ganzhi';
import { getShiShen, getZhiShiShen } from './shiShen';
import type { DaYunInfo, LiuNianInfo } from './types';

// ============ 流月類型定義 ============

export interface LiuYueInfo {
  year: number;             // 西曆年
  month: number;            // 西曆月（1-12）
  lunarMonth: number;       // 農曆月（1-12，以節氣為界）
  gan: TianGan;             // 天干
  zhi: DiZhi;               // 地支
  ganZhi: string;           // 干支組合
  ganWuXing: WuXing;        // 天干五行
  zhiWuXing: WuXing;        // 地支五行
  ganShiShen: ShiShen;      // 天干十神
  zhiShiShen: ShiShen;      // 地支十神
  naYin: string;            // 納音
  jieQi?: string;           // 該月節氣
}

export interface LiuYueAnalysis {
  liuYue: LiuYueInfo;
  daYun?: DaYunInfo;        // 所屬大運
  liuNian?: LiuNianInfo;    // 所屬流年
  factors: {
    positive: string[];
    negative: string[];
  };
}

// ============ 月干起始計算 ============

/**
 * 根據年干計算正月（寅月）的天干
 * 五虎遁年起月訣：
 * 甲己之年丙作首，乙庚之歲戊為頭，
 * 丙辛必定庚寅起，丁壬壬位順行流，
 * 若問戊癸何處起，甲寅之上好追求。
 */
export function getFirstMonthGan(yearGan: TianGan): TianGan {
  const ganMap: Record<TianGan, TianGan> = {
    '甲': '丙', '己': '丙',  // 甲己年正月丙寅
    '乙': '戊', '庚': '戊',  // 乙庚年正月戊寅
    '丙': '庚', '辛': '庚',  // 丙辛年正月庚寅
    '丁': '壬', '壬': '壬',  // 丁壬年正月壬寅
    '戊': '甲', '癸': '甲',  // 戊癸年正月甲寅
  };
  return ganMap[yearGan];
}

// ============ 流月干支計算 ============

/**
 * 計算某年某月的月干支
 * @param year 西曆年
 * @param month 西曆月（1-12）
 * @returns 月干支
 */
export function calculateMonthGanZhi(year: number, month: number): { gan: TianGan; zhi: DiZhi } {
  // 使用 lunar-javascript 取得精確的月干支（會考慮節氣）
  const solar = Solar.fromYmd(year, month, 15);  // 取月中，避免節氣邊界問題
  const lunar = solar.getLunar();
  const monthGanZhi = lunar.getMonthInGanZhi();

  return {
    gan: monthGanZhi[0] as TianGan,
    zhi: monthGanZhi[1] as DiZhi
  };
}

/**
 * 使用公式計算月干支（備用方法）
 * @param yearGan 年干
 * @param lunarMonth 農曆月（1=寅月，2=卯月...）
 */
export function calculateMonthGanZhiByFormula(yearGan: TianGan, lunarMonth: number): { gan: TianGan; zhi: DiZhi } {
  // 正月地支為寅，順序為：寅卯辰巳午未申酉戌亥子丑
  const monthZhiIndex = (lunarMonth + 1) % 12;  // 寅=2 在地支中的索引
  const zhi = getZhiByIndex(monthZhiIndex);

  // 根據年干計算正月天干
  const firstMonthGan = getFirstMonthGan(yearGan);
  const firstMonthGanIndex = getGanIndex(firstMonthGan);
  
  // 正月為第1月，所以需要加上 (lunarMonth - 1)
  const ganIndex = (firstMonthGanIndex + lunarMonth - 1) % 10;
  const gan = getGanByIndex(ganIndex);

  return { gan, zhi };
}

// ============ 流月列表計算 ============

/**
 * 計算某年12個月的流月列表
 * @param year 西曆年
 * @param dayGan 日主天干
 */
export function calculateLiuYueList(
  year: number,
  dayGan: TianGan
): LiuYueInfo[] {
  const result: LiuYueInfo[] = [];

  // 節氣月對應表（西曆月份的大致對應）
  const jieQiMap: Record<number, string> = {
    1: '小寒', 2: '立春', 3: '驚蟄', 4: '清明',
    5: '立夏', 6: '芒種', 7: '小暑', 8: '立秋',
    9: '白露', 10: '寒露', 11: '立冬', 12: '大雪'
  };

  for (let month = 1; month <= 12; month++) {
    const { gan, zhi } = calculateMonthGanZhi(year, month);
    const ganZhi = combineGanZhi(gan, zhi);

    result.push({
      year,
      month,
      lunarMonth: getLunarMonthByJieQi(year, month),
      gan,
      zhi,
      ganZhi,
      ganWuXing: GAN_WU_XING[gan],
      zhiWuXing: ZHI_WU_XING[zhi],
      ganShiShen: getShiShen(dayGan, gan),
      zhiShiShen: getZhiShiShen(dayGan, zhi),
      naYin: getNaYin(gan, zhi),
      jieQi: jieQiMap[month]
    });
  }

  return result;
}

/**
 * 獲取某西曆月份對應的農曆月份（以節氣為界）
 */
function getLunarMonthByJieQi(year: number, month: number): number {
  // 簡化處理：西曆月份大致對應農曆月份
  // 2月≈正月，3月≈二月...以此類推
  // 實際應該用節氣精確判斷，這裡簡化處理
  const mapping = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // 索引0=1月=農曆12月
  return mapping[month - 1] || month;
}

// ============ 流月分析 ============

/**
 * 分析單個流月
 */
export function analyzeLiuYue(
  liuYue: LiuYueInfo,
  dayGan: TianGan,
  daYun?: DaYunInfo,
  liuNian?: LiuNianInfo
): LiuYueAnalysis {
  const positive: string[] = [];
  const negative: string[] = [];

  // 分析流月天干十神
  const ganShiShen = liuYue.ganShiShen;
  const favorableShiShen = ['正財', '正官', '正印', '食神'];
  const unfavorableShiShen = ['七殺', '傷官', '劫財'];

  if (favorableShiShen.includes(ganShiShen)) {
    positive.push(`流月天干${liuYue.gan}為${ganShiShen}，主吉`);
  }
  if (unfavorableShiShen.includes(ganShiShen)) {
    negative.push(`流月天干${liuYue.gan}為${ganShiShen}，需注意`);
  }

  // 如果有大運，分析流月與大運的關係
  if (daYun) {
    // 流月與大運天干相同
    if (liuYue.gan === daYun.gan) {
      positive.push(`流月${liuYue.gan}與大運${daYun.gan}同氣，能量加強`);
    }
    // 流月與大運地支六合
    if (isZhiHe(liuYue.zhi, daYun.zhi)) {
      positive.push(`流月${liuYue.zhi}與大運${daYun.zhi}六合，有助力`);
    }
    // 流月與大運地支六沖
    if (isZhiChong(liuYue.zhi, daYun.zhi)) {
      negative.push(`流月${liuYue.zhi}與大運${daYun.zhi}六沖，變動較大`);
    }
  }

  // 如果有流年，分析流月與流年的關係
  if (liuNian) {
    if (liuYue.gan === liuNian.gan) {
      positive.push(`流月${liuYue.gan}與流年${liuNian.gan}同氣`);
    }
    if (isZhiHe(liuYue.zhi, liuNian.zhi)) {
      positive.push(`流月${liuYue.zhi}與流年${liuNian.zhi}六合`);
    }
    if (isZhiChong(liuYue.zhi, liuNian.zhi)) {
      negative.push(`流月${liuYue.zhi}與流年${liuNian.zhi}六沖`);
    }
  }

  return {
    liuYue,
    daYun,
    liuNian,
    factors: { positive, negative }
  };
}

/**
 * 計算並分析整年流月
 */
export function analyzeYearlyLiuYue(
  year: number,
  dayGan: TianGan,
  daYun?: DaYunInfo,
  liuNian?: LiuNianInfo
): LiuYueAnalysis[] {
  const liuYueList = calculateLiuYueList(year, dayGan);
  return liuYueList.map(ly => analyzeLiuYue(ly, dayGan, daYun, liuNian));
}

// ============ 輔助函數（簡化版，避免循環依賴）============

function isZhiHe(zhi1: DiZhi, zhi2: DiZhi): boolean {
  const heMap: Record<DiZhi, DiZhi> = {
    '子': '丑', '丑': '子',
    '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳',
    '午': '未', '未': '午'
  };
  return heMap[zhi1] === zhi2;
}

function isZhiChong(zhi1: DiZhi, zhi2: DiZhi): boolean {
  const chongMap: Record<DiZhi, DiZhi> = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳'
  };
  return chongMap[zhi1] === zhi2;
}

// ============ 月份吉凶評估 ============

/**
 * 評估月份整體吉凶
 */
export function evaluateMonthFortune(
  analysis: LiuYueAnalysis
): 'very_good' | 'good' | 'neutral' | 'bad' | 'very_bad' {
  const positiveCount = analysis.factors.positive.length;
  const negativeCount = analysis.factors.negative.length;
  const diff = positiveCount - negativeCount;

  if (diff >= 3) return 'very_good';
  if (diff >= 1) return 'good';
  if (diff <= -3) return 'very_bad';
  if (diff <= -1) return 'bad';
  return 'neutral';
}

/**
 * 生成月份簡評
 */
export function generateMonthSummary(analysis: LiuYueAnalysis): string {
  const fortune = evaluateMonthFortune(analysis);
  const fortuneText: Record<string, string> = {
    'very_good': '大吉',
    'good': '小吉',
    'neutral': '平穩',
    'bad': '小凶',
    'very_bad': '謹慎'
  };

  const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return `${monthNames[analysis.liuYue.month]}（${analysis.liuYue.ganZhi}）：${fortuneText[fortune]}`;
}
