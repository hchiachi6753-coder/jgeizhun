// 紫微斗數排盤計算工具
// @ts-nocheck
import { Solar } from 'lunar-javascript';

// 十二宮名稱
export const GONG_NAMES = ['命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '官祿', '田宅', '福德', '父母'];

// 十二地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 宮位天干（根據年干起寅宮）
// 甲己年：丙寅、丁卯、戊辰...
// 乙庚年：戊寅、己卯、庚辰...
// 丙辛年：庚寅、辛卯、壬辰...
// 丁壬年：壬寅、癸卯、甲辰...
// 戊癸年：甲寅、乙卯、丙辰...
const GONG_GAN_START = {
  '甲': 2, '己': 2,  // 丙寅起
  '乙': 4, '庚': 4,  // 戊寅起
  '丙': 6, '辛': 6,  // 庚寅起
  '丁': 8, '壬': 8,  // 壬寅起
  '戊': 0, '癸': 0,  // 甲寅起
};

// 五行局數對照表 [命宮地支][納音五行]
// 納音五行：金木水火土 = 0,1,2,3,4
const WU_XING_JU: Record<string, Record<string, number>> = {
  '子': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '丑': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '寅': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '卯': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '辰': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '巳': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '午': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '未': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '申': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '酉': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '戌': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
  '亥': { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 },
};

// 五行局對照表（簡化版：根據命宮地支）
const JU_MAP: Record<string, { name: string; num: number }> = {
  '寅': { name: '水二局', num: 2 },
  '卯': { name: '水二局', num: 2 },
  '辰': { name: '金四局', num: 4 },
  '巳': { name: '金四局', num: 4 },
  '午': { name: '火六局', num: 6 },
  '未': { name: '火六局', num: 6 },
  '申': { name: '土五局', num: 5 },
  '酉': { name: '土五局', num: 5 },
  '戌': { name: '木三局', num: 3 },
  '亥': { name: '木三局', num: 3 },
  '子': { name: '火六局', num: 6 },
  '丑': { name: '火六局', num: 6 },
};

// 主星列表
export const MAIN_STARS = [
  '紫微', '天機', '太陽', '武曲', '天同', '廉貞',
  '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'
];

// 紫微星安星表（根據五行局數和農曆生日）
// 返回紫微星所在的地支索引
function getZiweiPosition(ju: number, day: number): number {
  // 紫微星位置計算
  // 這是簡化的計算方式
  const positions = [
    // 局數2: 日數1在寅...
    [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
    // 局數3
    [2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11],
    // 局數4
    [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9],
    // 局數5
    [2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7],
    // 局數6
    [2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6],
  ];
  
  const juIndex = [2, 3, 4, 5, 6].indexOf(ju);
  if (juIndex === -1 || day < 1 || day > 30) return 2; // 預設寅
  return positions[juIndex][day - 1];
}

// 紫微星系安星（根據紫微位置）
// 紫微→天機→空→太陽→武曲→天同→空→廉貞
function getZiweiStars(ziweiPos: number): Record<string, number> {
  const stars: Record<string, number> = {};
  stars['紫微'] = ziweiPos;
  stars['天機'] = (ziweiPos + 11) % 12; // 逆1
  stars['太陽'] = (ziweiPos + 9) % 12;  // 逆3
  stars['武曲'] = (ziweiPos + 8) % 12;  // 逆4
  stars['天同'] = (ziweiPos + 7) % 12;  // 逆5
  stars['廉貞'] = (ziweiPos + 4) % 12;  // 逆8
  return stars;
}

// 天府星系安星（天府與紫微對稱）
function getTianfuStars(ziweiPos: number): Record<string, number> {
  const tianfuPos = (4 - ziweiPos + 12) % 12 + 2; // 天府位置計算
  const actualTianfu = (14 - ziweiPos) % 12;
  
  const stars: Record<string, number> = {};
  stars['天府'] = actualTianfu;
  stars['太陰'] = (actualTianfu + 1) % 12;
  stars['貪狼'] = (actualTianfu + 2) % 12;
  stars['巨門'] = (actualTianfu + 3) % 12;
  stars['天相'] = (actualTianfu + 4) % 12;
  stars['天梁'] = (actualTianfu + 5) % 12;
  stars['七殺'] = (actualTianfu + 6) % 12;
  stars['破軍'] = (actualTianfu + 10) % 12;
  return stars;
}

// 輔星
export const ASSIST_STARS = ['左輔', '右弼', '文昌', '文曲', '天魁', '天鉞', '祿存', '擎羊', '陀羅', '火星', '鈴星', '地空', '地劫', '天馬'];

// 左輔右弼（根據農曆月）
function getZuoYou(month: number): Record<string, number> {
  // 左輔：辰順數月份
  // 右弼：戌逆數月份
  return {
    '左輔': (4 + month - 1) % 12,  // 正月在辰
    '右弼': (10 - month + 1 + 12) % 12,  // 正月在戌
  };
}

// 文昌文曲（根據時辰）
function getChangQu(hour: number): Record<string, number> {
  // 文昌：戌逆數時辰
  // 文曲：辰順數時辰
  return {
    '文昌': (10 - hour + 12) % 12,
    '文曲': (4 + hour) % 12,
  };
}

// 天魁天鉞（根據年干）
const KUIYUE: Record<string, { kui: number; yue: number }> = {
  '甲': { kui: 1, yue: 7 },   // 丑未
  '戊': { kui: 1, yue: 7 },
  '庚': { kui: 1, yue: 7 },
  '乙': { kui: 0, yue: 6 },   // 子午
  '己': { kui: 0, yue: 6 },
  '丙': { kui: 11, yue: 9 },  // 亥酉
  '丁': { kui: 11, yue: 9 },
  '壬': { kui: 3, yue: 5 },   // 卯巳
  '癸': { kui: 3, yue: 5 },
  '辛': { kui: 6, yue: 2 },   // 午寅
};

// 祿存位置（根據年干）
const LUCUN: Record<string, number> = {
  '甲': 2, '乙': 3, '丙': 5, '丁': 6, '戊': 5,
  '己': 6, '庚': 8, '辛': 9, '壬': 11, '癸': 0,
};

// 擎羊陀羅（祿存前後）
function getYangTuo(lucunPos: number): Record<string, number> {
  return {
    '擎羊': (lucunPos + 1) % 12,
    '陀羅': (lucunPos + 11) % 12,
  };
}

// 四化（根據年干）
export const SI_HUA: Record<string, { lu: string; quan: string; ke: string; ji: string }> = {
  '甲': { lu: '廉貞', quan: '破軍', ke: '武曲', ji: '太陽' },
  '乙': { lu: '天機', quan: '天梁', ke: '紫微', ji: '太陰' },
  '丙': { lu: '天同', quan: '天機', ke: '文昌', ji: '廉貞' },
  '丁': { lu: '太陰', quan: '天同', ke: '天機', ji: '巨門' },
  '戊': { lu: '貪狼', quan: '太陰', ke: '右弼', ji: '天機' },
  '己': { lu: '武曲', quan: '貪狼', ke: '天梁', ji: '文曲' },
  '庚': { lu: '太陽', quan: '武曲', ke: '太陰', ji: '天同' },
  '辛': { lu: '巨門', quan: '太陽', ke: '文曲', ji: '文昌' },
  '壬': { lu: '天梁', quan: '紫微', ke: '左輔', ji: '武曲' },
  '癸': { lu: '破軍', quan: '巨門', ke: '太陰', ji: '貪狼' },
};

// 紫微斗數結果介面
export interface ZiweiResult {
  // 基本資訊
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  hour: number;
  yearGan: string;
  yearZhi: string;
  gender: 'male' | 'female';
  
  // 五行局
  wuXingJu: string;
  juNum: number;
  
  // 命宮身宮
  mingGongZhi: string;
  shenGongZhi: string;
  mingGongIndex: number;
  shenGongIndex: number;
  
  // 十二宮
  gongs: {
    name: string;
    zhi: string;
    gan: string;
    mainStars: { name: string; brightness?: string }[];
    assistStars: string[];
    siHua: string[];
  }[];
  
  // 四化
  siHua: {
    lu: { star: string; gong: string };
    quan: { star: string; gong: string };
    ke: { star: string; gong: string };
    ji: { star: string; gong: string };
  };
}

// 計算命宮位置
function getMingGongIndex(month: number, hour: number): number {
  // 命宮公式：寅宮起正月，順數至生月，再逆數至生時
  // month: 1-12, hour: 0-11 (子丑寅卯...)
  const base = 2; // 寅 = 2
  const monthPos = (base + month - 1) % 12;
  const mingPos = (monthPos - hour + 12) % 12;
  return mingPos;
}

// 計算身宮位置
function getShenGongIndex(month: number, hour: number): number {
  // 身宮公式：寅宮起正月，順數至生月，再順數至生時
  const base = 2;
  const monthPos = (base + month - 1) % 12;
  const shenPos = (monthPos + hour) % 12;
  return shenPos;
}

// 主要計算函數
export function calculateZiwei(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  gender: 'male' | 'female'
): ZiweiResult {
  // 轉換為農曆
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  
  const lunarYear = lunar.getYear();
  const lunarMonth = Math.abs(lunar.getMonth()); // 處理閏月
  const lunarDay = lunar.getDay();
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearGan = yearGanZhi[0];
  const yearZhi = yearGanZhi[1];
  
  // 計算時辰索引 (0=子, 1=丑, ...)
  const hourIndex = hour === 23 ? 0 : Math.floor((hour + 1) / 2);
  
  // 計算命宮位置
  const mingGongIndex = getMingGongIndex(lunarMonth, hourIndex);
  const mingGongZhi = DI_ZHI[mingGongIndex];
  
  // 計算身宮位置
  const shenGongIndex = getShenGongIndex(lunarMonth, hourIndex);
  const shenGongZhi = DI_ZHI[shenGongIndex];
  
  // 五行局（簡化：根據命宮地支和年干納音）
  // 這裡使用簡化算法，實際需要更複雜的納音計算
  const juInfo = JU_MAP[mingGongZhi] || { name: '金四局', num: 4 };
  
  // 計算紫微星位置
  const ziweiPos = getZiweiPosition(juInfo.num, lunarDay);
  
  // 安主星
  const ziweiStars = getZiweiStars(ziweiPos);
  const tianfuStars = getTianfuStars(ziweiPos);
  const allMainStars = { ...ziweiStars, ...tianfuStars };
  
  // 安輔星
  const zuoYou = getZuoYou(lunarMonth);
  const changQu = getChangQu(hourIndex);
  const kuiYue = KUIYUE[yearGan] || { kui: 1, yue: 7 };
  const lucunPos = LUCUN[yearGan] || 2;
  const yangTuo = getYangTuo(lucunPos);
  
  const allAssistStars: Record<string, number> = {
    ...zuoYou,
    ...changQu,
    '天魁': kuiYue.kui,
    '天鉞': kuiYue.yue,
    '祿存': lucunPos,
    ...yangTuo,
  };
  
  // 四化
  const siHuaInfo = SI_HUA[yearGan] || SI_HUA['甲'];
  
  // 宮位天干
  const gongGanStart = GONG_GAN_START[yearGan] || 0;
  
  // 建立十二宮
  const gongs = DI_ZHI.map((zhi, index) => {
    // 宮位名稱（從命宮開始）
    const gongNameIndex = (index - mingGongIndex + 12) % 12;
    const gongName = GONG_NAMES[gongNameIndex];
    
    // 宮位天干
    const gongGanIndex = (gongGanStart + index) % 10;
    const gongGan = TIAN_GAN[gongGanIndex];
    
    // 該宮的主星
    const mainStars: { name: string; brightness?: string }[] = [];
    Object.entries(allMainStars).forEach(([star, pos]) => {
      if (pos === index) {
        mainStars.push({ name: star });
      }
    });
    
    // 該宮的輔星
    const assistStars: string[] = [];
    Object.entries(allAssistStars).forEach(([star, pos]) => {
      if (pos === index) {
        assistStars.push(star);
      }
    });
    
    // 該宮的四化
    const siHua: string[] = [];
    mainStars.forEach(star => {
      if (star.name === siHuaInfo.lu) siHua.push('祿');
      if (star.name === siHuaInfo.quan) siHua.push('權');
      if (star.name === siHuaInfo.ke) siHua.push('科');
      if (star.name === siHuaInfo.ji) siHua.push('忌');
    });
    
    return {
      name: gongName,
      zhi,
      gan: gongGan,
      mainStars,
      assistStars,
      siHua,
    };
  });
  
  // 找出四化所在宮位
  const findStarGong = (starName: string): string => {
    const gong = gongs.find(g => g.mainStars.some(s => s.name === starName));
    return gong?.name || '';
  };
  
  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    hour: hourIndex,
    yearGan,
    yearZhi,
    gender,
    wuXingJu: juInfo.name,
    juNum: juInfo.num,
    mingGongZhi,
    shenGongZhi,
    mingGongIndex,
    shenGongIndex,
    gongs,
    siHua: {
      lu: { star: siHuaInfo.lu, gong: findStarGong(siHuaInfo.lu) },
      quan: { star: siHuaInfo.quan, gong: findStarGong(siHuaInfo.quan) },
      ke: { star: siHuaInfo.ke, gong: findStarGong(siHuaInfo.ke) },
      ji: { star: siHuaInfo.ji, gong: findStarGong(siHuaInfo.ji) },
    },
  };
}
