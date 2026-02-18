/**
 * 八字排盤綜合計算器
 * 
 * 整合所有模組功能，提供完整的八字分析
 */

// @ts-nocheck
import { Solar, Lunar } from 'lunar-javascript';
import { GAN_WU_XING, GAN_YIN_YANG, type TianGan } from './constants';
import { calculateFourPillars, getLunarInfo, getJieQiInfo, getAllGan, getAllZhi } from './pillars';
import { countShiShen, analyzeShiShenDistribution } from './shiShen';
import { calculateDaYun, getDaYunDirection } from './dayun';
import { calculateLiuNianFromBirth, checkLiuNianWithPillars } from './liunian';
import { analyzeWuXing, inferYongShen, analyzeDayMasterStrength } from './wuxing';
import { analyzeTiaoHou, generateTiaoHouReport, getTiaoHouImportance } from './tiaohou';
import { calculateAllShenSha, generateShenShaReport } from './shensha';
import type { BaziInput, BaziResult, Gender } from './types';

// ============ 主計算函數 ============

/**
 * 計算完整的八字命盤
 */
export function calculateBazi(input: BaziInput): BaziResult {
  const { year, month, day, hour, minute = 0, gender } = input;

  // 計算四柱
  const fourPillars = calculateFourPillars(year, month, day, hour, minute);

  // 獲取日主資訊
  const dayGan = fourPillars.day.gan;
  const dayWuXing = GAN_WU_XING[dayGan];
  const dayYinYang = GAN_YIN_YANG[dayGan] === 1 ? 'yang' : 'yin';

  // 獲取農曆和節氣資訊
  const lunarInfo = getLunarInfo(year, month, day);
  const jieQiInfo = getJieQiInfo(year, month, day);

  // 五行分析
  const wuXingAnalysis = analyzeWuXing(fourPillars);

  // 調候分析
  const tiaoHouAnalysis = analyzeTiaoHou(fourPillars);

  // 用神喜忌（簡化版）
  const yongShenSimple = inferYongShen(fourPillars);

  // 大運計算
  const daYun = calculateDaYun(
    year, month, day, hour, minute,
    gender,
    dayGan,
    fourPillars.year.gan,
    10
  );

  // 神煞計算
  const shenSha = calculateAllShenSha(fourPillars);

  return {
    birthInfo: {
      solar: { year, month, day, hour, minute },
      lunar: {
        ...lunarInfo,
        isLeapMonth: lunarInfo.isLeapMonth || false
      },
      jieQi: {
        current: jieQiInfo.current,
        prev: jieQiInfo.prev || { name: '', date: new Date() },
        next: jieQiInfo.next || { name: '', date: new Date() }
      },
      gender
    },
    fourPillars,
    dayMaster: {
      gan: dayGan,
      wuXing: dayWuXing,
      yinYang: dayYinYang as 'yang' | 'yin'
    },
    wuXingAnalysis,
    tiaoHouAnalysis,
    yongShenAnalysis: {
      yongShen: yongShenSimple.yongShen,
      xiShen: yongShenSimple.xiShen,
      jiShen: yongShenSimple.jiShen,
      chouShen: []
    },
    daYun,
    shenSha
  };
}

// ============ 便捷函數 ============

/**
 * 快速計算八字（簡化輸入）
 */
export function quickBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: Gender
): BaziResult {
  return calculateBazi({ year, month, day, hour, minute: 0, gender });
}

/**
 * 從日期字串計算八字
 * @param dateStr 日期字串，格式：YYYY-MM-DD HH:mm
 * @param gender 性別
 */
export function baziFromDateString(dateStr: string, gender: Gender): BaziResult {
  const match = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):?(\d{0,2})?/);
  if (!match) {
    throw new Error('日期格式錯誤，請使用 YYYY-MM-DD HH:mm 格式');
  }

  const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = match;
  return calculateBazi({
    year: parseInt(yearStr),
    month: parseInt(monthStr),
    day: parseInt(dayStr),
    hour: parseInt(hourStr),
    minute: minuteStr ? parseInt(minuteStr) : 0,
    gender
  });
}

// ============ 報告生成 ============

/**
 * 生成八字排盤文字報告
 */
export function generateBaziReport(result: BaziResult): string {
  let report = '';

  // 標題
  report += '╔════════════════════════════════════╗\n';
  report += '║          八 字 命 盤              ║\n';
  report += '╚════════════════════════════════════╝\n\n';

  // 出生資訊
  const { solar, lunar, gender } = result.birthInfo;
  report += `【出生資訊】\n`;
  report += `西曆：${solar.year}年${solar.month}月${solar.day}日 ${solar.hour}時${solar.minute}分\n`;
  report += `農曆：${lunar.year}年${lunar.isLeapMonth ? '閏' : ''}${Math.abs(lunar.month)}月${lunar.day}日\n`;
  report += `生肖：${lunar.zodiac}    性別：${gender === 'male' ? '男' : '女'}\n\n`;

  // 四柱
  report += `【四柱八字】\n`;
  report += `        年柱      月柱      日柱      時柱\n`;
  report += `天干：  ${result.fourPillars.year.gan}        ${result.fourPillars.month.gan}        ${result.fourPillars.day.gan}        ${result.fourPillars.hour.gan}\n`;
  report += `地支：  ${result.fourPillars.year.zhi}        ${result.fourPillars.month.zhi}        ${result.fourPillars.day.zhi}        ${result.fourPillars.hour.zhi}\n`;
  report += `五行：  ${result.fourPillars.year.ganWuXing}${result.fourPillars.year.zhiWuXing}      ${result.fourPillars.month.ganWuXing}${result.fourPillars.month.zhiWuXing}      ${result.fourPillars.day.ganWuXing}${result.fourPillars.day.zhiWuXing}      ${result.fourPillars.hour.ganWuXing}${result.fourPillars.hour.zhiWuXing}\n`;
  report += `納音：  ${result.fourPillars.year.naYin}  ${result.fourPillars.month.naYin}  ${result.fourPillars.day.naYin}  ${result.fourPillars.hour.naYin}\n\n`;

  // 十神
  report += `【十神】\n`;
  report += `年干：${result.fourPillars.year.ganShiShen || '-'}    `;
  report += `月干：${result.fourPillars.month.ganShiShen || '-'}    `;
  report += `日干：日主    `;
  report += `時干：${result.fourPillars.hour.ganShiShen || '-'}\n\n`;

  // 藏干
  report += `【地支藏干】\n`;
  const pillars = ['year', 'month', 'day', 'hour'] as const;
  const pillarNames = ['年支', '月支', '日支', '時支'];
  for (let i = 0; i < 4; i++) {
    const pillar = result.fourPillars[pillars[i]];
    const cangGanStr = pillar.cangGan.map(cg => `${cg.gan}(${cg.shiShen})`).join(' ');
    report += `${pillarNames[i]}${pillar.zhi}：${cangGanStr}\n`;
  }
  report += '\n';

  // 日主強弱
  report += `【日主分析】\n`;
  report += `日主：${result.dayMaster.gan}（${result.dayMaster.wuXing}，${result.dayMaster.yinYang === 'yang' ? '陽' : '陰'}）\n`;
  report += `強弱：${getStrengthText(result.wuXingAnalysis.dayMasterStrength)}\n\n`;

  // 五行分佈
  report += `【五行分佈】\n`;
  report += `木：${result.wuXingAnalysis.count['木']}個（${result.wuXingAnalysis.score['木']}分）  `;
  report += `火：${result.wuXingAnalysis.count['火']}個（${result.wuXingAnalysis.score['火']}分）  `;
  report += `土：${result.wuXingAnalysis.count['土']}個（${result.wuXingAnalysis.score['土']}分）\n`;
  report += `金：${result.wuXingAnalysis.count['金']}個（${result.wuXingAnalysis.score['金']}分）  `;
  report += `水：${result.wuXingAnalysis.count['水']}個（${result.wuXingAnalysis.score['水']}分）\n`;
  if (result.wuXingAnalysis.missingElements.length > 0) {
    report += `缺失五行：${result.wuXingAnalysis.missingElements.join('、')}\n`;
  }
  report += '\n';

  // 調候
  report += `【調候分析】\n`;
  report += `寒暖燥濕：${getTiaoHouStatusText(result.tiaoHouAnalysis.status)}（分數：${result.tiaoHouAnalysis.score}）\n`;
  if (result.tiaoHouAnalysis.mainYongShen.length > 0) {
    report += `調候用神：${result.tiaoHouAnalysis.mainYongShen.join('、')}\n`;
  }
  report += '\n';

  // 用神喜忌
  if (result.yongShenAnalysis) {
    report += `【用神喜忌】\n`;
    report += `用神：${result.yongShenAnalysis.yongShen}    喜神：${result.yongShenAnalysis.xiShen}\n`;
    report += `忌神：${result.yongShenAnalysis.jiShen.join('、')}\n\n`;
  }

  // 大運
  report += `【大運】\n`;
  report += `起運年齡：${result.daYun.startAge}歲    方向：${result.daYun.direction === 'forward' ? '順行' : '逆行'}\n`;
  report += '序號  年齡    干支    十神\n';
  for (const dy of result.daYun.list.slice(0, 8)) {
    report += `${String(dy.index).padStart(2)}    ${String(dy.startAge).padStart(2)}-${String(dy.endAge).padStart(2)}  ${dy.ganZhi}    ${dy.ganShiShen}/${dy.zhiShiShen}\n`;
  }
  report += '\n';

  // 神煞
  if (result.shenSha && result.shenSha.length > 0) {
    report += `【神煞】\n`;
    const auspicious = result.shenSha.filter(ss => ss.type === 'auspicious');
    const inauspicious = result.shenSha.filter(ss => ss.type === 'inauspicious');

    if (auspicious.length > 0) {
      report += `吉神：${auspicious.map(ss => ss.name).join('、')}\n`;
    }
    if (inauspicious.length > 0) {
      report += `凶煞：${inauspicious.map(ss => ss.name).join('、')}\n`;
    }
  }

  return report;
}

/**
 * 生成簡潔的四柱顯示
 */
export function formatFourPillars(result: BaziResult): string {
  const { fourPillars } = result;
  return `${fourPillars.year.ganZhi} ${fourPillars.month.ganZhi} ${fourPillars.day.ganZhi} ${fourPillars.hour.ganZhi}`;
}

// ============ 輔助函數 ============

function getStrengthText(strength: string): string {
  const map: Record<string, string> = {
    'weak': '偏弱',
    'medium': '中和',
    'strong': '偏強',
    'very_strong': '極強'
  };
  return map[strength] || strength;
}

function getTiaoHouStatusText(status: string): string {
  const map: Record<string, string> = {
    'cold': '偏寒濕',
    'balanced': '平衡',
    'hot': '偏暖燥'
  };
  return map[status] || status;
}

// ============ 進階分析 ============

/**
 * 分析特定流年
 */
export function analyzeSpecificYear(
  result: BaziResult,
  targetYear: number
): {
  liuNian: { gan: TianGan; zhi: string; ganZhi: string };
  daYun: typeof result.daYun.list[0] | null;
  relations: string[];
} {
  const birthYear = result.birthInfo.solar.year;
  const age = targetYear - birthYear + 1;

  // 獲取流年
  const liuNianList = calculateLiuNianFromBirth(birthYear, result.dayMaster.gan, age);
  const liuNian = liuNianList.find(ln => ln.year === targetYear);

  // 獲取大運
  const daYun = result.daYun.list.find(dy => age >= dy.startAge && age < dy.endAge) || null;

  // 分析關係
  const relations: string[] = [];
  if (liuNian) {
    const check = checkLiuNianWithPillars(
      liuNian,
      result.fourPillars.year.zhi,
      result.fourPillars.month.zhi,
      result.fourPillars.day.zhi,
      result.fourPillars.hour.zhi
    );
    relations.push(...check.details);
  }

  return {
    liuNian: liuNian ? {
      gan: liuNian.gan,
      zhi: liuNian.zhi,
      ganZhi: liuNian.ganZhi
    } : { gan: '甲' as TianGan, zhi: '子', ganZhi: '甲子' },
    daYun,
    relations
  };
}
