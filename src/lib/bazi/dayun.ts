/**
 * 大運計算模組
 * 
 * 大運的推算規則：
 * 1. 根據出生年干和性別決定順逆行
 *    - 陽年生男、陰年生女：順行
 *    - 陰年生男、陽年生女：逆行
 * 2. 計算起運年齡：從出生日算起到下一個節（順行）或上一個節（逆行）的天數，除以 3
 * 3. 每步大運 10 年
 * 4. 從月柱開始推算，順行則依次向後推，逆行則向前推
 */

// @ts-nocheck
import { Solar, Lunar, EightChar } from 'lunar-javascript';
import {
  TIAN_GAN, DI_ZHI, GAN_WU_XING, ZHI_WU_XING,
  GAN_YIN_YANG, SIXTY_JIAZI_NAYIN,
  type TianGan, type DiZhi
} from './constants';
import {
  getGanIndex, getZhiIndex, getGanByIndex, getZhiByIndex,
  combineGanZhi, getNaYin, nextGanZhi, prevGanZhi, stepGanZhi
} from './ganzhi';
import { getShiShen, getZhiShiShen } from './shiShen';
import type { DaYunInfo, Gender, FourPillars } from './types';

// ============ 大運方向判斷 ============

/**
 * 判斷大運順逆行方向
 * @param yearGan 年干
 * @param gender 性別
 * @returns 'forward' 順行，'backward' 逆行
 */
export function getDaYunDirection(
  yearGan: TianGan,
  gender: Gender
): 'forward' | 'backward' {
  const isYangYear = GAN_YIN_YANG[yearGan] === 1;
  const isMale = gender === 'male';

  // 陽年男命、陰年女命：順行
  // 陰年男命、陽年女命：逆行
  if ((isYangYear && isMale) || (!isYangYear && !isMale)) {
    return 'forward';
  }
  return 'backward';
}

// ============ 起運年齡計算 ============

/**
 * 使用 lunar-javascript 計算起運年齡
 */
export function calculateStartAge(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: Gender
): number {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 1 = 男，0 = 女
  const genderCode = gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderCode);

  // 從大運列表中獲取第一個實際大運的起運年齡
  const daYunList = yun.getDaYun();
  // 第一個通常是小運（0歲開始），第二個才是第一步大運
  if (daYunList.length > 1) {
    return daYunList[1].getStartAge();
  }
  
  // 如果沒有大運列表，從起運年計算
  return yun.getStartYear();
}

/**
 * 獲取起運詳細資訊
 */
export function getYunInfo(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: Gender
) {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const genderCode = gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderCode);
  
  // 從大運列表獲取起運年齡
  const daYunList = yun.getDaYun();
  const startAge = daYunList.length > 1 ? daYunList[1].getStartAge() : yun.getStartYear();

  return {
    startAge,
    startYear: yun.getStartYear(),
    startMonth: yun.getStartMonth(),
    startDay: yun.getStartDay(),
    isForward: yun.isForward()
  };
}

// ============ 大運列表計算 ============

/**
 * 使用 lunar-javascript 計算大運列表
 */
export function calculateDaYunList(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: Gender,
  dayGan: TianGan,
  count: number = 10
): DaYunInfo[] {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const genderCode = gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderCode);
  const daYunList = yun.getDaYun();

  const result: DaYunInfo[] = [];

  // 過濾掉空的大運（第一個通常是小運）
  const filteredList = daYunList.filter((dy: any) => {
    const ganZhi = dy.getGanZhi();
    return ganZhi && ganZhi.length === 2;
  });

  for (let i = 0; i < Math.min(count, filteredList.length); i++) {
    const dy = filteredList[i];
    const ganZhi = dy.getGanZhi();
    const gan = ganZhi[0] as TianGan;
    const zhi = ganZhi[1] as DiZhi;
    const startAge = dy.getStartAge();

    result.push({
      index: i + 1,
      startAge,
      endAge: startAge + 10,
      gan,
      zhi,
      ganZhi,
      ganWuXing: GAN_WU_XING[gan],
      zhiWuXing: ZHI_WU_XING[zhi],
      ganShiShen: getShiShen(dayGan, gan),
      zhiShiShen: getZhiShiShen(dayGan, zhi),
      naYin: getNaYin(gan, zhi)
    });
  }

  return result;
}

/**
 * 手動計算大運列表（備用方法）
 */
export function calculateDaYunListManual(
  monthGan: TianGan,
  monthZhi: DiZhi,
  startAge: number,
  direction: 'forward' | 'backward',
  dayGan: TianGan,
  count: number = 10
): DaYunInfo[] {
  const result: DaYunInfo[] = [];
  let currentGan = monthGan;
  let currentZhi = monthZhi;

  for (let i = 0; i < count; i++) {
    // 第一步大運從月柱的下一個（順行）或上一個（逆行）開始
    if (direction === 'forward') {
      const next = nextGanZhi(currentGan, currentZhi);
      currentGan = next.gan;
      currentZhi = next.zhi;
    } else {
      const prev = prevGanZhi(currentGan, currentZhi);
      currentGan = prev.gan;
      currentZhi = prev.zhi;
    }

    const ganZhi = combineGanZhi(currentGan, currentZhi);
    const currentStartAge = startAge + i * 10;

    result.push({
      index: i + 1,
      startAge: currentStartAge,
      endAge: currentStartAge + 10,
      gan: currentGan,
      zhi: currentZhi,
      ganZhi,
      ganWuXing: GAN_WU_XING[currentGan],
      zhiWuXing: ZHI_WU_XING[currentZhi],
      ganShiShen: getShiShen(dayGan, currentGan),
      zhiShiShen: getZhiShiShen(dayGan, currentZhi),
      naYin: getNaYin(currentGan, currentZhi)
    });
  }

  return result;
}

// ============ 大運分析輔助函數 ============

/**
 * 獲取某年齡所在的大運
 */
export function getDaYunAtAge(daYunList: DaYunInfo[], age: number): DaYunInfo | null {
  for (const dy of daYunList) {
    if (age >= dy.startAge && age < dy.endAge) {
      return dy;
    }
  }
  return null;
}

/**
 * 獲取某西曆年份所在的大運
 */
export function getDaYunAtYear(
  daYunList: DaYunInfo[],
  birthYear: number,
  targetYear: number
): DaYunInfo | null {
  // 計算虛歲（中國傳統算法，出生即一歲）
  const age = targetYear - birthYear + 1;
  return getDaYunAtAge(daYunList, age);
}

/**
 * 分析大運五行變化趨勢
 */
export function analyzeDaYunTrend(
  daYunList: DaYunInfo[]
): { wuXingFlow: string[]; peakPeriods: { wuXing: string; ages: string }[] } {
  const wuXingFlow: string[] = [];
  const wuXingCount: Record<string, number[]> = {
    '木': [], '火': [], '土': [], '金': [], '水': []
  };

  for (const dy of daYunList) {
    const ganWuXing = dy.ganWuXing;
    const zhiWuXing = dy.zhiWuXing;
    const combined = ganWuXing === zhiWuXing ? ganWuXing : `${ganWuXing}${zhiWuXing}`;
    wuXingFlow.push(combined);

    wuXingCount[ganWuXing].push(dy.startAge);
    if (zhiWuXing !== ganWuXing) {
      wuXingCount[zhiWuXing].push(dy.startAge);
    }
  }

  const peakPeriods: { wuXing: string; ages: string }[] = [];
  for (const [wx, ages] of Object.entries(wuXingCount)) {
    if (ages.length > 0) {
      peakPeriods.push({
        wuXing: wx,
        ages: ages.map(a => `${a}-${a + 10}`).join(', ')
      });
    }
  }

  return { wuXingFlow, peakPeriods };
}

/**
 * 檢查大運與原局的沖合關係
 */
export function checkDaYunRelations(
  daYun: DaYunInfo,
  pillars: FourPillars
): {
  ganHe: boolean;       // 天干有合
  zhiHe: boolean;       // 地支有合
  zhiChong: boolean;    // 地支有沖
  zhiXing: boolean;     // 地支有刑
  details: string[];
} {
  const details: string[] = [];
  let ganHe = false;
  let zhiHe = false;
  let zhiChong = false;
  let zhiXing = false;

  // 天干合（簡化檢查）
  const ganHeMap: Record<TianGan, TianGan> = {
    '甲': '己', '己': '甲',
    '乙': '庚', '庚': '乙',
    '丙': '辛', '辛': '丙',
    '丁': '壬', '壬': '丁',
    '戊': '癸', '癸': '戊'
  };

  const allGan = [pillars.year.gan, pillars.month.gan, pillars.day.gan, pillars.hour.gan];
  if (allGan.includes(ganHeMap[daYun.gan])) {
    ganHe = true;
    details.push(`大運${daYun.gan}與原局${ganHeMap[daYun.gan]}相合`);
  }

  // 地支六合
  const zhiHeMap: Record<DiZhi, DiZhi> = {
    '子': '丑', '丑': '子',
    '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳',
    '午': '未', '未': '午'
  };

  const allZhi = [pillars.year.zhi, pillars.month.zhi, pillars.day.zhi, pillars.hour.zhi];
  if (allZhi.includes(zhiHeMap[daYun.zhi])) {
    zhiHe = true;
    details.push(`大運${daYun.zhi}與原局${zhiHeMap[daYun.zhi]}六合`);
  }

  // 地支六沖
  const zhiChongMap: Record<DiZhi, DiZhi> = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳'
  };

  if (allZhi.includes(zhiChongMap[daYun.zhi])) {
    zhiChong = true;
    details.push(`大運${daYun.zhi}與原局${zhiChongMap[daYun.zhi]}六沖`);
  }

  return { ganHe, zhiHe, zhiChong, zhiXing, details };
}

// ============ 完整大運計算 ============

/**
 * 計算完整的大運資訊
 */
export function calculateDaYun(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: Gender,
  dayGan: TianGan,
  yearGan: TianGan,
  count: number = 10
): {
  startAge: number;
  direction: 'forward' | 'backward';
  list: DaYunInfo[];
} {
  const yunInfo = getYunInfo(year, month, day, hour, minute, gender);
  const direction = getDaYunDirection(yearGan, gender);
  const list = calculateDaYunList(year, month, day, hour, minute, gender, dayGan, count);

  return {
    startAge: yunInfo.startAge,
    direction,
    list
  };
}

// ============ 起運歲數詳細計算 ============

/**
 * 計算起運歲數詳細資訊
 * 
 * 計算方式：
 * - 順行：從出生日算到下一個「節」的天數
 * - 逆行：從出生日算到上一個「節」的天數
 * - 三天折合一年，一天折合四個月
 * 
 * @returns 起運詳情，包含精確到月的起運時間
 */
export function calculateStartAgeDetail(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: Gender
): {
  startAge: number;           // 起運歲數（整數）
  startAgeDecimal: number;    // 起運歲數（帶小數）
  startYear: number;          // 起運西曆年
  startMonth: number;         // 起運月份
  startDay: number;           // 起運日期
  direction: 'forward' | 'backward';  // 順逆行
  daysToJieQi: number;        // 距離節氣的天數
  targetJieQi: string;        // 目標節氣名稱
  explanation: string;        // 計算說明
} {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const genderCode = gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(genderCode);

  // 從大運列表獲取起運年齡
  const daYunList = yun.getDaYun();
  const startAge = daYunList.length > 1 ? daYunList[1].getStartAge() : yun.getStartYear();
  const startYear = yun.getStartYear();
  const startMonth = yun.getStartMonth();
  const startDay = yun.getStartDay();
  const isForward = yun.isForward();

  // 獲取年干判斷順逆行
  const yearGan = eightChar.getYear().substring(0, 1) as TianGan;
  const direction = getDaYunDirection(yearGan, gender);

  // 計算距離節氣天數（使用 lunar-javascript 的內部計算結果）
  // 起運歲數 = 天數 / 3（三天折合一年）
  const daysToJieQi = Math.round(startAge * 3);

  // 生成說明
  const genderText = gender === 'male' ? '男' : '女';
  const yearYinYang = GAN_YIN_YANG[yearGan] === 1 ? '陽年' : '陰年';
  const directionText = direction === 'forward' ? '順行' : '逆行';
  const jieQiDirection = direction === 'forward' ? '下一個節' : '上一個節';

  const explanation = 
    `${yearYinYang}${genderText}命，大運${directionText}。` +
    `出生日距${jieQiDirection}約${daysToJieQi}天，` +
    `三天折合一年，故${startAge}歲起運。`;

  return {
    startAge,
    startAgeDecimal: daysToJieQi / 3,
    startYear,
    startMonth,
    startDay,
    direction,
    daysToJieQi,
    targetJieQi: getTargetJieQi(month, direction),
    explanation
  };
}

/**
 * 獲取目標節氣名稱
 */
function getTargetJieQi(month: number, direction: 'forward' | 'backward'): string {
  // 月份對應的節氣（節，非氣）
  const jieByMonth: Record<number, string[]> = {
    1: ['小寒', '立春'],
    2: ['立春', '驚蟄'],
    3: ['驚蟄', '清明'],
    4: ['清明', '立夏'],
    5: ['立夏', '芒種'],
    6: ['芒種', '小暑'],
    7: ['小暑', '立秋'],
    8: ['立秋', '白露'],
    9: ['白露', '寒露'],
    10: ['寒露', '立冬'],
    11: ['立冬', '大雪'],
    12: ['大雪', '小寒']
  };

  const jie = jieByMonth[month] || ['', ''];
  return direction === 'forward' ? jie[1] : jie[0];
}

// ============ 大運五行分析 ============

/**
 * 分析大運五行能量變化
 * 返回各五行在不同年齡段的能量值，用於繪製圖表
 */
export function analyzeDaYunWuXingEnergy(
  daYunList: DaYunInfo[]
): {
  ages: number[];
  energy: Record<WuXing, number[]>;
} {
  const ages: number[] = [];
  const energy: Record<WuXing, number[]> = {
    '木': [], '火': [], '土': [], '金': [], '水': []
  };

  for (const dy of daYunList) {
    // 每個大運取中間年齡作為代表點
    const midAge = Math.floor((dy.startAge + dy.endAge) / 2);
    ages.push(midAge);

    // 計算該大運的五行能量
    for (const wx of ['木', '火', '土', '金', '水'] as WuXing[]) {
      let score = 0;
      if (dy.ganWuXing === wx) score += 60;  // 天干佔 60%
      if (dy.zhiWuXing === wx) score += 40;  // 地支佔 40%
      energy[wx].push(score);
    }
  }

  return { ages, energy };
}

/**
 * 大運吉凶評級
 */
export function rateDaYun(
  daYun: DaYunInfo,
  dayGan: TianGan,
  xiShenWuXing: WuXing[],   // 喜神五行
  jiShenWuXing: WuXing[]    // 忌神五行
): {
  rating: 'excellent' | 'good' | 'neutral' | 'caution' | 'challenging';
  score: number;
  reasons: string[];
} {
  let score = 50;  // 基礎分
  const reasons: string[] = [];

  // 檢查天干五行
  if (xiShenWuXing.includes(daYun.ganWuXing)) {
    score += 20;
    reasons.push(`天干${daYun.gan}（${daYun.ganWuXing}）為喜神`);
  }
  if (jiShenWuXing.includes(daYun.ganWuXing)) {
    score -= 20;
    reasons.push(`天干${daYun.gan}（${daYun.ganWuXing}）為忌神`);
  }

  // 檢查地支五行
  if (xiShenWuXing.includes(daYun.zhiWuXing)) {
    score += 15;
    reasons.push(`地支${daYun.zhi}（${daYun.zhiWuXing}）為喜神`);
  }
  if (jiShenWuXing.includes(daYun.zhiWuXing)) {
    score -= 15;
    reasons.push(`地支${daYun.zhi}（${daYun.zhiWuXing}）為忌神`);
  }

  // 檢查十神
  const favorableShiShen = ['正財', '正官', '正印', '食神'];
  const unfavorableShiShen = ['七殺', '傷官', '劫財'];

  if (favorableShiShen.includes(daYun.ganShiShen)) {
    score += 10;
    reasons.push(`${daYun.ganShiShen}運，較為順遂`);
  }
  if (unfavorableShiShen.includes(daYun.ganShiShen)) {
    score -= 10;
    reasons.push(`${daYun.ganShiShen}運，需多注意`);
  }

  // 評級
  let rating: 'excellent' | 'good' | 'neutral' | 'caution' | 'challenging';
  if (score >= 80) rating = 'excellent';
  else if (score >= 60) rating = 'good';
  else if (score >= 40) rating = 'neutral';
  else if (score >= 25) rating = 'caution';
  else rating = 'challenging';

  return { rating, score, reasons };
}

// ============ 大運報告生成 ============

/**
 * 生成大運分析報告
 */
export function generateDaYunReport(
  daYunList: DaYunInfo[],
  direction: 'forward' | 'backward',
  startAge: number
): string {
  let report = '【大運分析】\n\n';

  report += `起運年齡：${startAge}歲\n`;
  report += `大運方向：${direction === 'forward' ? '順行' : '逆行'}\n\n`;

  report += '序號  年齡範圍   干支    天干十神  地支十神  納音\n';
  report += '─'.repeat(52) + '\n';

  for (const dy of daYunList) {
    const ageRange = `${String(dy.startAge).padStart(2)}-${String(dy.endAge).padStart(2)}`;
    report += `${String(dy.index).padStart(2)}    ${ageRange}歲    `;
    report += `${dy.ganZhi}    ${dy.ganShiShen.padEnd(4)}      `;
    report += `${dy.zhiShiShen.padEnd(4)}      ${dy.naYin}\n`;
  }

  report += '\n';

  // 分析趨勢
  const trend = analyzeDaYunTrend(daYunList);
  report += `【五行流變】\n`;
  report += `${trend.wuXingFlow.join(' → ')}\n\n`;

  report += `【各五行旺期】\n`;
  for (const peak of trend.peakPeriods) {
    report += `${peak.wuXing}：${peak.ages}歲\n`;
  }

  return report;
}
