/**
 * 紫微斗數排盤引擎
 * 
 * 主入口模組，整合所有計算功能
 */

import { Solar } from 'lunar-javascript';

// 導出常數
export * from './constants';

// 導出各模組函數
export * from './wuxing';
export * from './gong';
export * from './stars';
export * from './sihua';
export * from './daxian';
export * from './liunian';
export * from './liuyue';
export * from './minorStars';

// 導入內部函數
import {
  TIAN_GAN,
  DI_ZHI,
  GONG_NAMES,
  getHourIndex,
  type JuNum,
  type MainStar,
} from './constants';
import { calculateWuXingJu, getWuXingJuName, calculateGongGans } from './wuxing';
import { calculateMingGongIndex, calculateShenGongIndex, getShenGongName } from './gong';
import {
  getZiweiPosition,
  calculateZiweiStars,
  calculateTianfuStars,
  calculateZuoYou,
  calculateChangQu,
  calculateKuiYue,
  calculateLuCun,
  calculateYangTuo,
  calculateHuoLing,
  calculateKongJie,
  calculateTianMa,
  getStarBrightness,
} from './stars';
import { calculateSiHua, getStarSiHua, type SiHuaResult } from './sihua';
import { calculateDaxian, getDaxianByAge, getDaxianByYear, type DaxianOverview, type DaxianInfo } from './daxian';
import { calculateLiunian, calculateLiunianRange, getLiunianByAge, type LiunianInfo } from './liunian';
import { calculateLiuyueOverview, calculateLiuyue, type LiuyueOverview, type LiuyueInfo } from './liuyue';
import { calculateAllMinorStars, BOSHI_STARS, CHANGSHENG_STARS } from './minorStars';

/**
 * 單一星曜資訊
 */
export interface StarInfo {
  name: string;
  brightness?: string;
  siHua?: string;
}

/**
 * 宮位資訊
 */
export interface GongInfo {
  name: string;           // 宮位名稱（命宮、兄弟等）
  zhi: string;            // 地支
  zhiIndex: number;       // 地支索引
  gan: string;            // 天干
  mainStars: StarInfo[];  // 主星
  assistStars: StarInfo[]; // 輔星
  shaStars: StarInfo[];   // 煞星
  otherStars: StarInfo[]; // 其他星（祿存、天馬等）
  minorStars: StarInfo[]; // 雜曜
  boshiStars: StarInfo[]; // 博士十二星
  changshengStars: StarInfo[]; // 長生十二星
  isShenGong: boolean;    // 是否為身宮所在
}

/**
 * 時間軸上的某一時刻資訊
 */
export interface TimelinePoint {
  /** 西元年 */
  year: number;
  /** 虛歲 */
  age: number;
  /** 大限資訊 */
  daxian: DaxianInfo;
  /** 流年資訊 */
  liunian: LiunianInfo;
  /** 流年各月資訊 */
  liuyue: LiuyueOverview;
}

/**
 * 時間軸總覽（用於前端旅程圖）
 */
export interface TimelineOverview {
  /** 出生年 */
  birthYear: number;
  /** 起運歲數 */
  startAge: number;
  /** 大限方向 */
  daxianDirection: '順行' | '逆行';
  /** 大限總覽 */
  daxian: DaxianOverview;
  /** 時間軸點位 */
  points: TimelinePoint[];
}

/**
 * 紫微斗數命盤結果
 */
export interface ZiweiChart {
  // 輸入資訊
  solarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  
  // 農曆資訊
  lunarDate: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
    hourGanZhi: string;
  };
  
  // 基本資訊
  yearGan: string;
  yearZhi: string;
  hourIndex: number;
  gender: 'male' | 'female';
  
  // 五行局
  wuXingJu: {
    name: string;
    num: JuNum;
  };
  
  // 命宮身宮
  mingGong: {
    zhi: string;
    zhiIndex: number;
    gan: string;
  };
  shenGong: {
    zhi: string;
    zhiIndex: number;
    gongName: string; // 身宮所落的宮位名稱
  };
  
  // 十二宮
  gongs: GongInfo[];
  
  // 四化
  siHua: SiHuaResult;
  
  // 所有星曜位置（供查詢用）
  starPositions: Record<string, number>;
  
  // 大限總覽
  daxian: DaxianOverview;
}

/**
 * 計算紫微斗數命盤
 * 
 * @param year 西曆年
 * @param month 西曆月
 * @param day 西曆日
 * @param hour 時（0-23）
 * @param minute 分
 * @param gender 性別
 * @returns 命盤資訊
 */
export function calculateZiweiChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: 'male' | 'female'
): ZiweiChart {
  // 1. 西曆轉農曆
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  
  const lunarYear = lunar.getYear();
  const lunarMonth = Math.abs(lunar.getMonth());
  const lunarDay = lunar.getDay();
  const isLeapMonth = lunar.getMonth() < 0;
  
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearGan = yearGanZhi[0];
  const yearZhi = yearGanZhi[1];
  
  // 2. 計算時辰
  const hourIndex = getHourIndex(hour);
  
  // 3. 計算命宮
  const mingGongIndex = calculateMingGongIndex(lunarMonth, hourIndex);
  const mingGongZhi = DI_ZHI[mingGongIndex];
  
  // 4. 計算身宮
  const shenGongIndex = calculateShenGongIndex(lunarMonth, hourIndex);
  const shenGongZhi = DI_ZHI[shenGongIndex];
  const shenGongName = getShenGongName(mingGongIndex, shenGongIndex);
  
  // 5. 計算五行局
  const juNum = calculateWuXingJu(mingGongIndex, yearGan);
  const juName = getWuXingJuName(juNum);
  
  // 6. 計算宮位天干
  const gongGans = calculateGongGans(yearGan);
  const mingGongGan = gongGans[mingGongIndex];
  
  // 7. 安主星
  const ziweiPos = getZiweiPosition(juNum, lunarDay);
  const ziweiStars = calculateZiweiStars(ziweiPos);
  const tianfuStars = calculateTianfuStars(ziweiPos);
  const mainStarPositions = { ...ziweiStars, ...tianfuStars };
  
  // 8. 安輔星
  const zuoYou = calculateZuoYou(lunarMonth);
  const changQu = calculateChangQu(hourIndex);
  const kuiYue = calculateKuiYue(yearGan);
  const assistStarPositions = { ...zuoYou, ...changQu, ...kuiYue };
  
  // 9. 安煞星
  const yangTuo = calculateYangTuo(calculateLuCun(yearGan));
  const huoLing = calculateHuoLing(yearZhi, hourIndex);
  const kongJie = calculateKongJie(hourIndex);
  const shaStarPositions = { ...yangTuo, ...huoLing, ...kongJie };
  
  // 10. 安其他星
  const lucunPos = calculateLuCun(yearGan);
  const tianmaPos = calculateTianMa(yearZhi);
  const otherStarPositions = {
    '祿存': lucunPos,
    '天馬': tianmaPos,
  };
  
  // 10.5 計算雜曜
  const dayGanZhi = lunar.getDayInGanZhi();
  const dayGanIndex = (TIAN_GAN as readonly string[]).indexOf(dayGanZhi[0]);
  const dayZhiIndex = (DI_ZHI as readonly string[]).indexOf(dayGanZhi[1]);
  
  const minorStars = calculateAllMinorStars({
    yearGan,
    yearZhi,
    lunarMonth,
    lunarDay,
    hourIndex,
    dayGanIndex,
    dayZhiIndex,
    gender,
    juNum,
    lucunPos,
    zuofuPos: zuoYou['左輔'],
    youbiPos: zuoYou['右弼'],
    wenchangPos: changQu['文昌'],
    wenquPos: changQu['文曲'],
  });
  
  // 合併雜曜位置
  const minorStarPositions: Record<string, number> = {
    ...minorStars.yearZhiStars,
    ...minorStars.monthStars,
    ...minorStars.dayStars,
    ...minorStars.hourStars,
    ...minorStars.yearGanStars,
  };
  
  // 合併所有星曜位置
  const starPositions: Record<string, number> = {
    ...mainStarPositions,
    ...assistStarPositions,
    ...shaStarPositions,
    ...otherStarPositions,
    ...minorStarPositions,
    ...minorStars.boshiStars,
    ...minorStars.changshengStars,
  };
  
  // 11. 計算四化
  const siHua = calculateSiHua(yearGan);
  // 填充宮位資訊
  for (const key of ['lu', 'quan', 'ke', 'ji'] as const) {
    const star = siHua[key].star;
    const pos = starPositions[star];
    if (pos !== undefined) {
      siHua[key].gongIndex = pos;
      const gongNameIndex = (mingGongIndex - pos + 12) % 12;
      siHua[key].gongName = GONG_NAMES[gongNameIndex];
    }
  }
  
  // 12. 建構十二宮資訊
  const gongs: GongInfo[] = [];
  
  for (let i = 0; i < 12; i++) {
    // 從命宮開始逆時針排列
    const zhiIndex = (mingGongIndex - i + 12) % 12;
    const zhi = DI_ZHI[zhiIndex];
    const gan = gongGans[zhiIndex];
    const gongName = GONG_NAMES[i];
    const isShenGong = zhiIndex === shenGongIndex;
    
    // 收集該宮位的星曜
    const mainStars: StarInfo[] = [];
    const assistStars: StarInfo[] = [];
    const shaStars: StarInfo[] = [];
    const otherStars: StarInfo[] = [];
    const minorStarsList: StarInfo[] = [];
    const boshiStarsList: StarInfo[] = [];
    const changshengStarsList: StarInfo[] = [];
    
    // 主星
    for (const [star, pos] of Object.entries(mainStarPositions)) {
      if (pos === zhiIndex) {
        mainStars.push({
          name: star,
          brightness: getStarBrightness(star, zhiIndex),
          siHua: getStarSiHua(yearGan, star),
        });
      }
    }
    
    // 輔星
    for (const [star, pos] of Object.entries(assistStarPositions)) {
      if (pos === zhiIndex) {
        assistStars.push({
          name: star,
          siHua: getStarSiHua(yearGan, star),
        });
      }
    }
    
    // 煞星
    for (const [star, pos] of Object.entries(shaStarPositions)) {
      if (pos === zhiIndex) {
        shaStars.push({ name: star });
      }
    }
    
    // 其他星
    for (const [star, pos] of Object.entries(otherStarPositions)) {
      if (pos === zhiIndex) {
        otherStars.push({ name: star });
      }
    }
    
    // 雜曜
    for (const [star, pos] of Object.entries(minorStarPositions)) {
      if (pos === zhiIndex) {
        minorStarsList.push({ name: star });
      }
    }
    
    // 博士十二星
    for (const [star, pos] of Object.entries(minorStars.boshiStars)) {
      if (pos === zhiIndex) {
        boshiStarsList.push({ name: star });
      }
    }
    
    // 長生十二星
    for (const [star, pos] of Object.entries(minorStars.changshengStars)) {
      if (pos === zhiIndex) {
        changshengStarsList.push({ name: star });
      }
    }
    
    gongs.push({
      name: gongName,
      zhi,
      zhiIndex,
      gan,
      mainStars,
      assistStars,
      shaStars,
      otherStars,
      minorStars: minorStarsList,
      boshiStars: boshiStarsList,
      changshengStars: changshengStarsList,
      isShenGong,
    });
  }
  
  // 13. 計算大限
  const daxian = calculateDaxian(
    mingGongIndex,
    juNum,
    yearGan,
    gender,
    gongGans
  );
  
  // 14. 返回完整命盤
  return {
    solarDate: { year, month, day, hour, minute },
    lunarDate: {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeapMonth,
      yearGanZhi: lunar.getYearInGanZhi(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi: lunar.getDayInGanZhi(),
      hourGanZhi: lunar.getTimeInGanZhi(),
    },
    yearGan,
    yearZhi,
    hourIndex,
    gender,
    wuXingJu: {
      name: juName,
      num: juNum,
    },
    mingGong: {
      zhi: mingGongZhi,
      zhiIndex: mingGongIndex,
      gan: mingGongGan,
    },
    shenGong: {
      zhi: shenGongZhi,
      zhiIndex: shenGongIndex,
      gongName: shenGongName,
    },
    gongs,
    siHua,
    starPositions,
    daxian,
  };
}

/**
 * 計算時間軸（用於前端旅程圖視覺化）
 * 
 * @param chart 命盤資訊
 * @param startYear 起始年（預設出生年）
 * @param endYear 結束年（預設出生年+100）
 * @returns 時間軸總覽
 */
export function calculateTimeline(
  chart: ZiweiChart,
  startYear?: number,
  endYear?: number
): TimelineOverview {
  const birthYear = chart.solarDate.year;
  const start = startYear ?? birthYear;
  const end = endYear ?? (birthYear + 100);
  
  const points: TimelinePoint[] = [];
  
  for (let year = start; year <= end; year++) {
    // 虛歲
    const age = year - birthYear + 1;
    
    // 該年的大限
    const daxianInfo = getDaxianByAge(age, chart.daxian);
    if (!daxianInfo) continue;
    
    // 該年的流年
    const liunianInfo = calculateLiunian(year, chart.mingGong.zhiIndex);
    
    // 該年的流月
    const liuyueInfo = calculateLiuyueOverview(
      year,
      liunianInfo.tianGan,
      liunianInfo.mingGongIndex,
      chart.mingGong.zhiIndex
    );
    
    points.push({
      year,
      age,
      daxian: daxianInfo,
      liunian: liunianInfo,
      liuyue: liuyueInfo,
    });
  }
  
  return {
    birthYear,
    startAge: chart.daxian.startAge,
    daxianDirection: chart.daxian.direction,
    daxian: chart.daxian,
    points,
  };
}

/**
 * 取得某年某月的完整運勢資訊
 * 
 * @param chart 命盤資訊
 * @param year 西元年
 * @param month 農曆月份（1-12）
 * @returns 該時間點的運勢資訊
 */
export function getFortuneAt(
  chart: ZiweiChart,
  year: number,
  month: number
): {
  age: number;
  daxian: DaxianInfo | undefined;
  liunian: LiunianInfo;
  liuyue: LiuyueInfo;
} {
  const birthYear = chart.solarDate.year;
  const age = year - birthYear + 1;
  
  const daxian = getDaxianByAge(age, chart.daxian);
  const liunian = calculateLiunian(year, chart.mingGong.zhiIndex);
  const liuyue = calculateLiuyue(
    liunian.tianGan,
    liunian.mingGongIndex,
    month,
    chart.mingGong.zhiIndex
  );
  
  return {
    age,
    daxian,
    liunian,
    liuyue,
  };
}

/**
 * 取得當前運勢（根據系統日期）
 * 
 * @param chart 命盤資訊
 * @returns 當前運勢資訊
 */
export function getCurrentFortune(chart: ZiweiChart): {
  age: number;
  daxian: DaxianInfo | undefined;
  liunian: LiunianInfo;
  liuyue: LiuyueInfo;
} {
  const now = new Date();
  const solar = Solar.fromDate(now);
  const lunar = solar.getLunar();
  
  const year = lunar.getYear();
  const month = Math.abs(lunar.getMonth());
  
  return getFortuneAt(chart, year, month);
}

// 保持向後相容，導出舊函數名
export { calculateZiweiChart as calculateZiwei };
