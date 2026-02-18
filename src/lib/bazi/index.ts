/**
 * 八字排盤引擎入口
 * 
 * 統一匯出所有模組功能，方便外部使用。
 */

// ============ 常量 ============
export {
  TIAN_GAN, DI_ZHI, WU_XING, SHI_SHEN,
  GAN_WU_XING, ZHI_WU_XING, GAN_YIN_YANG, ZHI_YIN_YANG,
  ZHI_CANG_GAN, SHI_CHEN, JIE_QI,
  SIXTY_JIAZI_NAYIN, TWELVE_STAGES,
  WU_XING_SHENG, WU_XING_KE,
  DI_ZHI_LIU_HE, DI_ZHI_LIU_CHONG, DI_ZHI_HAI,
  DI_ZHI_SAN_HE, DI_ZHI_SAN_HUI,
  TIAN_GAN_HE, TIAN_GAN_CHONG,
  type TianGan, type DiZhi, type WuXing, type ShiShen, type TwelveStage
} from './constants';

// ============ 類型 ============
export type {
  Gender, GanZhiPillar, CangGanInfo, PillarDetail, FourPillars,
  DaYunInfo, LiuNianInfo, LiuYueInfo,
  WuXingAnalysis, TiaoHouAnalysis, YongShenAnalysis,
  ShenShaInfo, LunarInfo, JieQiInfo,
  BaziResult, BaziInput, LiuNianInput,
  GeJuType, GeJuAnalysis,
  StartAgeDetail, TimelineYear, LifeStageType, LifeStage
} from './types';

// ============ 干支計算 ============
export {
  getGanIndex, getZhiIndex, getGanByIndex, getZhiByIndex,
  getJiaZiIndex, getGanZhiByIndex,
  combineGanZhi, parseGanZhi,
  getGanWuXing, getZhiWuXing, getGanYinYang, getZhiYinYang,
  getZhiCangGan, getZhiMainGan, getNaYin,
  getTwelveStage, hasRoot,
  isGanHe, getGanHeHua, isGanChong,
  isZhiHe, getZhiHeHua, isZhiChong, isZhiHai,
  checkSanHe, checkBanHe, checkSanHui, checkXing,
  nextGanZhi, prevGanZhi, stepGanZhi,
  isValidGanZhi, generateSixtyJiaZi
} from './ganzhi';

// ============ 十神計算 ============
export {
  getShiShen, getShiShenByWuXing, getZhiShiShen, getZhiCangGanShiShen,
  getShiShenWuXing, getGanByShiShen,
  isCai, isGuanSha, isYin, isBiJie, isShiShang,
  getShiShenAbbr, countShiShen, analyzeShiShenDistribution,
  getMaleSixRelatives, getFemaleSixRelatives
} from './shiShen';

// ============ 四柱計算 ============
export {
  calculateFourPillars, getLunarInfo, getJieQiInfo,
  getAllGan, getAllZhi
} from './pillars';

// ============ 大運計算 ============
export {
  getDaYunDirection,
  calculateStartAge, getYunInfo,
  calculateDaYunList, calculateDaYunListManual,
  getDaYunAtAge, getDaYunAtYear,
  analyzeDaYunTrend, checkDaYunRelations,
  calculateDaYun,
  // 新增功能
  calculateStartAgeDetail,
  analyzeDaYunWuXingEnergy,
  rateDaYun,
  generateDaYunReport
} from './dayun';

// ============ 流年計算 ============
export {
  getYearGanZhi, calculateYearGanZhi,
  calculateLiuNianList, calculateLiuNianFromBirth,
  getMonthGanZhi, getDayGanZhi,
  checkLiuNianWithPillars, analyzeLiuNian,
  generateCenturyChart
} from './liunian';

// ============ 流月計算 ============
export {
  getFirstMonthGan,
  calculateMonthGanZhi, calculateMonthGanZhiByFormula,
  calculateLiuYueList, analyzeLiuYue, analyzeYearlyLiuYue,
  evaluateMonthFortune, generateMonthSummary
} from './liuyue';

// ============ 人生階段分析 ============
export {
  analyzeLifeStages,
  getCurrentLifeStage,
  generateLifeStageReport
} from './stages';

// ============ 時間軸整合 ============
export {
  generateTimeline,
  getYearDetail, getTimelineRange,
  generateSimpleTimeline,
  generateTimelineReport
} from './timeline';

// ============ 五行分析 ============
export {
  analyzeWuXing, inferYongShen, analyzeDayMasterStrength
} from './wuxing';

// ============ 調候分析 ============
export {
  analyzeTiaoHou, generateTiaoHouReport, getTiaoHouImportance
} from './tiaohou';

// ============ 神煞計算 ============
export {
  calculateAllShenSha, generateShenShaReport
} from './shensha';

// ============ 主計算器 ============
export {
  calculateBazi, quickBazi, baziFromDateString,
  generateBaziReport, formatFourPillars,
  analyzeSpecificYear
} from './calculator';

// ============ 便捷函數 ============

import { calculateBazi } from './calculator';
import { generateTimeline } from './timeline';
import { analyzeLifeStages, generateLifeStageReport } from './stages';
import type { BaziInput, BaziResult } from './types';

/**
 * 一站式八字分析
 * 包含完整的八字、大運、時間軸和人生階段分析
 */
export function fullBaziAnalysis(input: BaziInput) {
  // 計算八字
  const bazi = calculateBazi(input);
  
  // 生成時間軸
  const timeline = generateTimeline(bazi, 100);
  
  // 人生階段分析
  const currentAge = new Date().getFullYear() - input.year + 1;
  const stagesReport = generateLifeStageReport(timeline.stages);

  return {
    bazi,
    timeline,
    stagesReport,
    currentAge
  };
}

/**
 * 快速獲取特定年份運勢
 */
export function getYearFortune(bazi: BaziResult, targetYear: number) {
  const timeline = generateTimeline(bazi, targetYear - bazi.birthInfo.solar.year + 10);
  const { getYearDetail } = require('./timeline');
  return getYearDetail(timeline, targetYear);
}

/**
 * 獲取近期運勢（當年及未來幾年）
 */
export function getRecentFortune(bazi: BaziResult, years: number = 5) {
  const currentYear = new Date().getFullYear();
  const timeline = generateTimeline(bazi, currentYear - bazi.birthInfo.solar.year + years + 1);
  const { getTimelineRange } = require('./timeline');
  
  const currentAge = currentYear - bazi.birthInfo.solar.year + 1;
  return getTimelineRange(timeline, currentAge, currentAge + years);
}
