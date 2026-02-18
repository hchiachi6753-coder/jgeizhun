/**
 * 四柱計算模組
 * 
 * 八字命理的核心是四柱：年柱、月柱、日柱、時柱
 * 每柱由一個天干和一個地支組成
 * 
 * 重要規則：
 * 1. 年柱以「立春」為界，非農曆正月初一
 * 2. 月柱以「節」為界（立春、驚蟄、清明...），非農曆月份
 * 3. 日柱以子時（23:00）為界
 * 4. 時柱根據日干推算時干
 */

// @ts-nocheck
import { Solar, Lunar, EightChar } from 'lunar-javascript';
import {
  TIAN_GAN, DI_ZHI, GAN_WU_XING, ZHI_WU_XING,
  ZHI_CANG_GAN, SIXTY_JIAZI_NAYIN, SHI_CHEN,
  type TianGan, type DiZhi
} from './constants';
import {
  getGanIndex, getZhiIndex, getGanByIndex, getZhiByIndex,
  combineGanZhi, getNaYin, getTwelveStage
} from './ganzhi';
import { getShiShen, getZhiCangGanShiShen } from './shiShen';
import type { FourPillars, PillarDetail, GanZhiPillar, Gender } from './types';

// ============ 使用 lunar-javascript 庫計算四柱 ============

/**
 * 計算四柱（使用 lunar-javascript 庫）
 * @param year 西曆年
 * @param month 西曆月（1-12）
 * @param day 西曆日
 * @param hour 時（0-23）
 * @param minute 分（0-59）
 */
export function calculateFourPillars(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0
): FourPillars {
  // 使用 lunar-javascript 計算
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 獲取四柱天干地支
  const yearGan = eightChar.getYearGan() as TianGan;
  const yearZhi = eightChar.getYearZhi() as DiZhi;
  const monthGan = eightChar.getMonthGan() as TianGan;
  const monthZhi = eightChar.getMonthZhi() as DiZhi;
  const dayGan = eightChar.getDayGan() as TianGan;
  const dayZhi = eightChar.getDayZhi() as DiZhi;
  const hourGan = eightChar.getTimeGan() as TianGan;
  const hourZhi = eightChar.getTimeZhi() as DiZhi;

  // 建立四柱詳細資訊
  const createPillarDetail = (
    gan: TianGan,
    zhi: DiZhi,
    isDayPillar: boolean = false
  ): PillarDetail => {
    const ganZhi = combineGanZhi(gan, zhi);
    const cangGanInfo = getZhiCangGanShiShen(dayGan, zhi);

    return {
      gan,
      zhi,
      ganZhi,
      ganWuXing: GAN_WU_XING[gan],
      zhiWuXing: ZHI_WU_XING[zhi],
      naYin: getNaYin(gan, zhi),
      ganShiShen: isDayPillar ? null : getShiShen(dayGan, gan),
      cangGan: cangGanInfo.map((info, index) => ({
        gan: info.gan,
        wuXing: GAN_WU_XING[info.gan],
        shiShen: info.shiShen,
        type: info.type
      })),
      twelveStage: getTwelveStage(dayGan, zhi)
    };
  };

  return {
    year: createPillarDetail(yearGan, yearZhi),
    month: createPillarDetail(monthGan, monthZhi),
    day: createPillarDetail(dayGan, dayZhi, true),
    hour: createPillarDetail(hourGan, hourZhi)
  };
}

// ============ 手動計算四柱（備用方法）============

/**
 * 根據日干計算時干
 * 五鼠遁日起時口訣：
 * 甲己還加甲，乙庚丙作初，
 * 丙辛從戊起，丁壬庚子居，
 * 戊癸何方發，壬子是真途。
 */
export function getHourGan(dayGan: TianGan, hourZhi: DiZhi): TianGan {
  // 日干對應的子時天干
  const dayGanToZiGan: Record<TianGan, TianGan> = {
    '甲': '甲', '己': '甲',
    '乙': '丙', '庚': '丙',
    '丙': '戊', '辛': '戊',
    '丁': '庚', '壬': '庚',
    '戊': '壬', '癸': '壬'
  };

  const ziGan = dayGanToZiGan[dayGan];
  const ziGanIndex = getGanIndex(ziGan);
  const hourZhiIndex = getZhiIndex(hourZhi);

  return getGanByIndex(ziGanIndex + hourZhiIndex);
}

/**
 * 根據年干計算月干
 * 五虎遁年起月口訣：
 * 甲己之年丙作首，乙庚之歲戊為頭，
 * 丙辛之年尋庚上，丁壬壬位順行流，
 * 若問戊癸何處起，甲寅之上好追求。
 */
export function getMonthGan(yearGan: TianGan, monthZhi: DiZhi): TianGan {
  // 年干對應的寅月天干
  const yearGanToYinGan: Record<TianGan, TianGan> = {
    '甲': '丙', '己': '丙',
    '乙': '戊', '庚': '戊',
    '丙': '庚', '辛': '庚',
    '丁': '壬', '壬': '壬',
    '戊': '甲', '癸': '甲'
  };

  const yinGan = yearGanToYinGan[yearGan];
  const yinGanIndex = getGanIndex(yinGan);
  const monthZhiIndex = getZhiIndex(monthZhi);

  // 寅月地支索引是 2，所以要減去 2
  const offset = (monthZhiIndex - 2 + 12) % 12;

  return getGanByIndex(yinGanIndex + offset);
}

/**
 * 從小時獲取時辰地支
 */
export function getHourZhi(hour: number): DiZhi {
  // 子時：23:00-01:00
  if (hour === 23 || hour === 0) return '子';
  // 其他時辰
  const shiChenIndex = Math.floor((hour + 1) / 2);
  return DI_ZHI[shiChenIndex] as DiZhi;
}

/**
 * 獲取時辰資訊
 */
export function getShiChenInfo(hour: number): typeof SHI_CHEN[number] {
  if (hour === 23 || hour === 0) return SHI_CHEN[0];
  const index = Math.floor((hour + 1) / 2);
  return SHI_CHEN[index];
}

// ============ 農曆與節氣 ============

/**
 * 獲取農曆資訊
 */
export function getLunarInfo(year: number, month: number, day: number) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
    isLeapMonth: lunar.getMonth() < 0,
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    zodiac: lunar.getYearShengXiao()
  };
}

/**
 * 獲取節氣資訊
 */
export function getJieQiInfo(year: number, month: number, day: number) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  const prevJieQi = lunar.getPrevJieQi();
  const nextJieQi = lunar.getNextJieQi();
  const currentJieQi = lunar.getJieQi();

  // 將 Solar 對象轉為 Date
  const solarToDate = (solarObj: any): Date => {
    if (!solarObj) return new Date();
    // lunar-javascript 的 Solar 對象有 getYear/getMonth/getDay 方法
    return new Date(solarObj.getYear(), solarObj.getMonth() - 1, solarObj.getDay());
  };

  return {
    current: currentJieQi || '',
    prev: prevJieQi ? {
      name: prevJieQi.getName(),
      date: solarToDate(prevJieQi.getSolar())
    } : null,
    next: nextJieQi ? {
      name: nextJieQi.getName(),
      date: solarToDate(nextJieQi.getSolar())
    } : null
  };
}

// ============ 四柱分析輔助函數 ============

/**
 * 獲取四柱中所有天干
 */
export function getAllGan(pillars: FourPillars): TianGan[] {
  return [pillars.year.gan, pillars.month.gan, pillars.day.gan, pillars.hour.gan];
}

/**
 * 獲取四柱中所有地支
 */
export function getAllZhi(pillars: FourPillars): DiZhi[] {
  return [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
}

/**
 * 獲取四柱中所有藏干
 */
export function getAllCangGan(pillars: FourPillars): TianGan[] {
  const result: TianGan[] = [];
  for (const pillar of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    for (const cg of pillar.cangGan) {
      result.push(cg.gan);
    }
  }
  return result;
}

/**
 * 檢查某天干是否透出（出現在天干位置）
 */
export function isGanTouChu(pillars: FourPillars, gan: TianGan): boolean {
  return getAllGan(pillars).includes(gan);
}

/**
 * 檢查某天干是否藏於地支
 */
export function isGanCang(pillars: FourPillars, gan: TianGan): boolean {
  return getAllCangGan(pillars).includes(gan);
}

/**
 * 獲取透出的天干（除日主外）
 */
export function getTouChuGan(pillars: FourPillars): TianGan[] {
  const dayGan = pillars.day.gan;
  return getAllGan(pillars).filter(gan => gan !== dayGan);
}

/**
 * 檢查月令（月支）的本氣
 */
export function getMonthLingBenQi(pillars: FourPillars): TianGan {
  return ZHI_CANG_GAN[pillars.month.zhi][0];
}

/**
 * 檢查某天干是否得月令（通根於月支）
 */
export function isDeYueLing(pillars: FourPillars, gan: TianGan): boolean {
  const monthZhi = pillars.month.zhi;
  const cangGan = ZHI_CANG_GAN[monthZhi];
  return cangGan.includes(gan);
}

/**
 * 統計日主在各柱地支的根（通根情況）
 */
export function countDayMasterRoots(pillars: FourPillars): {
  total: number;
  details: { pillar: string; zhi: DiZhi; hasRoot: boolean; stage: string }[];
} {
  const dayGan = pillars.day.gan;
  const dayWuXing = GAN_WU_XING[dayGan];

  const details: { pillar: string; zhi: DiZhi; hasRoot: boolean; stage: string }[] = [];
  let total = 0;

  const pillarNames = ['year', 'month', 'day', 'hour'] as const;
  const pillarLabels = ['年', '月', '日', '時'];

  for (let i = 0; i < 4; i++) {
    const pillar = pillars[pillarNames[i]];
    const stage = getTwelveStage(dayGan, pillar.zhi);
    const hasRoot = ['長生', '臨官', '帝旺', '墓'].includes(stage);

    // 也檢查藏干中是否有同五行的
    const cangGanHasRoot = pillar.cangGan.some(cg => cg.wuXing === dayWuXing);

    const effectiveRoot = hasRoot || cangGanHasRoot;

    details.push({
      pillar: pillarLabels[i],
      zhi: pillar.zhi,
      hasRoot: effectiveRoot,
      stage
    });

    if (effectiveRoot) total++;
  }

  return { total, details };
}
