// 八字排盤計算工具
// @ts-nocheck
import { Solar, Lunar, EightChar } from 'lunar-javascript';

// 天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 五行
export const WU_XING = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
// 地支藏干
export const ZHI_CANG_GAN: Record<string, string[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

// 十神
export const SHI_SHEN = ['比肩', '劫財', '食神', '傷官', '偏財', '正財', '七殺', '正官', '偏印', '正印'];

// 天干五行
const GAN_WU_XING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 天干陰陽
const GAN_YIN_YANG: Record<string, number> = {
  '甲': 1, '乙': 0, '丙': 1, '丁': 0, '戊': 1,
  '己': 0, '庚': 1, '辛': 0, '壬': 1, '癸': 0
};

// 計算十神
export function getShiShen(dayGan: string, targetGan: string): string {
  const dayWuXing = GAN_WU_XING[dayGan];
  const targetWuXing = GAN_WU_XING[targetGan];
  const dayYinYang = GAN_YIN_YANG[dayGan];
  const targetYinYang = GAN_YIN_YANG[targetGan];
  const sameYinYang = dayYinYang === targetYinYang;

  // 五行生剋關係
  const wuXingOrder = ['木', '火', '土', '金', '水'];
  const dayIndex = wuXingOrder.indexOf(dayWuXing);
  const targetIndex = wuXingOrder.indexOf(targetWuXing);

  // 計算關係
  const diff = (targetIndex - dayIndex + 5) % 5;

  // 根據生剋關係和陰陽返回十神
  switch (diff) {
    case 0: // 同我
      return sameYinYang ? '比肩' : '劫財';
    case 1: // 我生
      return sameYinYang ? '食神' : '傷官';
    case 2: // 我剋
      return sameYinYang ? '偏財' : '正財';
    case 3: // 剋我
      return sameYinYang ? '七殺' : '正官';
    case 4: // 生我
      return sameYinYang ? '偏印' : '正印';
    default:
      return '';
  }
}

// 十二時辰
export const SHI_CHEN = [
  { name: '子時', range: '23:00-01:00', index: 0 },
  { name: '丑時', range: '01:00-03:00', index: 1 },
  { name: '寅時', range: '03:00-05:00', index: 2 },
  { name: '卯時', range: '05:00-07:00', index: 3 },
  { name: '辰時', range: '07:00-09:00', index: 4 },
  { name: '巳時', range: '09:00-11:00', index: 5 },
  { name: '午時', range: '11:00-13:00', index: 6 },
  { name: '未時', range: '13:00-15:00', index: 7 },
  { name: '申時', range: '15:00-17:00', index: 8 },
  { name: '酉時', range: '17:00-19:00', index: 9 },
  { name: '戌時', range: '19:00-21:00', index: 10 },
  { name: '亥時', range: '21:00-23:00', index: 11 },
];

// 從小時獲取時辰索引
export function getShiChenIndex(hour: number): number {
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2);
}

// 八字結果介面
export interface BaziResult {
  // 四柱
  yearPillar: { gan: string; zhi: string; ganWuXing: string; zhiWuXing: string };
  monthPillar: { gan: string; zhi: string; ganWuXing: string; zhiWuXing: string };
  dayPillar: { gan: string; zhi: string; ganWuXing: string; zhiWuXing: string };
  hourPillar: { gan: string; zhi: string; ganWuXing: string; zhiWuXing: string };
  // 十神
  yearShiShen: string;
  monthShiShen: string;
  hourShiShen: string;
  // 藏干
  yearCangGan: { gan: string; shiShen: string }[];
  monthCangGan: { gan: string; shiShen: string }[];
  dayCangGan: { gan: string; shiShen: string }[];
  hourCangGan: { gan: string; shiShen: string }[];
  // 農曆資訊
  lunarInfo: {
    year: number;
    month: number;
    day: number;
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
  };
  // 節氣
  jieQi: string;
  // 大運
  daYun: { startAge: number; ganZhi: string; wuXing: string }[];
  // 性別
  gender: 'male' | 'female';
}

// 計算八字
export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: 'male' | 'female'
): BaziResult {
  // 使用 lunar-javascript 計算
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  // 四柱
  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();
  const hourGan = eightChar.getTimeGan();
  const hourZhi = eightChar.getTimeZhi();

  // 獲取五行
  const getWuXing = (gan: string) => GAN_WU_XING[gan] || '';
  const getZhiWuXing = (zhi: string) => {
    const mainGan = ZHI_CANG_GAN[zhi]?.[0] || '';
    return GAN_WU_XING[mainGan] || '';
  };

  // 計算藏干和十神
  const getCangGanWithShiShen = (zhi: string, dayGan: string) => {
    const cangGanList = ZHI_CANG_GAN[zhi] || [];
    return cangGanList.map(gan => ({
      gan,
      shiShen: getShiShen(dayGan, gan)
    }));
  };

  // 大運計算
  const yun = eightChar.getYun(gender === 'male' ? 1 : 0);
  const daYunList = yun.getDaYun();
  // 過濾掉空的大運（第一個通常是空的）
  const daYun = daYunList
    .filter((dy: any) => dy.getGanZhi() && dy.getGanZhi().length > 0)
    .slice(0, 10)
    .map((dy: any) => ({
      startAge: dy.getStartAge(),
      ganZhi: dy.getGanZhi(),
      wuXing: getWuXing(dy.getGanZhi()[0])
    }));

  // 節氣
  const jieQi = lunar.getPrevJieQi()?.getName() || '';

  return {
    yearPillar: {
      gan: yearGan,
      zhi: yearZhi,
      ganWuXing: getWuXing(yearGan),
      zhiWuXing: getZhiWuXing(yearZhi)
    },
    monthPillar: {
      gan: monthGan,
      zhi: monthZhi,
      ganWuXing: getWuXing(monthGan),
      zhiWuXing: getZhiWuXing(monthZhi)
    },
    dayPillar: {
      gan: dayGan,
      zhi: dayZhi,
      ganWuXing: getWuXing(dayGan),
      zhiWuXing: getZhiWuXing(dayZhi)
    },
    hourPillar: {
      gan: hourGan,
      zhi: hourZhi,
      ganWuXing: getWuXing(hourGan),
      zhiWuXing: getZhiWuXing(hourZhi)
    },
    yearShiShen: getShiShen(dayGan, yearGan),
    monthShiShen: getShiShen(dayGan, monthGan),
    hourShiShen: getShiShen(dayGan, hourGan),
    yearCangGan: getCangGanWithShiShen(yearZhi, dayGan),
    monthCangGan: getCangGanWithShiShen(monthZhi, dayGan),
    dayCangGan: getCangGanWithShiShen(dayZhi, dayGan),
    hourCangGan: getCangGanWithShiShen(hourZhi, dayGan),
    lunarInfo: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      yearGanZhi: lunar.getYearInGanZhi(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi: lunar.getDayInGanZhi()
    },
    jieQi,
    daYun,
    gender
  };
}
