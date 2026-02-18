/**
 * 八字排盤 TypeScript 類型定義
 */

import type { TianGan, DiZhi, WuXing, ShiShen, TwelveStage } from './constants';

// ============ 性別 ============
export type Gender = 'male' | 'female';

// ============ 干支柱 ============
export interface GanZhiPillar {
  gan: TianGan;           // 天干
  zhi: DiZhi;             // 地支
  ganZhi: string;         // 干支組合，如 "甲子"
  ganWuXing: WuXing;      // 天干五行
  zhiWuXing: WuXing;      // 地支五行（本氣）
  naYin: string;          // 納音
}

// ============ 藏干與十神 ============
export interface CangGanInfo {
  gan: TianGan;           // 藏干
  wuXing: WuXing;         // 五行
  shiShen: ShiShen;       // 十神（相對於日主）
  type: 'main' | 'middle' | 'residual';  // 本氣/中氣/餘氣
}

// ============ 柱詳細資訊 ============
export interface PillarDetail extends GanZhiPillar {
  ganShiShen: ShiShen | null;  // 天干十神（日柱為 null）
  cangGan: CangGanInfo[];      // 地支藏干
  twelveStage: TwelveStage;    // 日主在此地支的十二長生狀態
}

// ============ 四柱 ============
export interface FourPillars {
  year: PillarDetail;     // 年柱
  month: PillarDetail;    // 月柱
  day: PillarDetail;      // 日柱
  hour: PillarDetail;     // 時柱
}

// ============ 大運 ============
export interface DaYunInfo {
  index: number;          // 大運序號（1-10）
  startAge: number;       // 起運年齡
  endAge: number;         // 結束年齡
  gan: TianGan;           // 天干
  zhi: DiZhi;             // 地支
  ganZhi: string;         // 干支組合
  ganWuXing: WuXing;      // 天干五行
  zhiWuXing: WuXing;      // 地支五行
  ganShiShen: ShiShen;    // 天干十神
  zhiShiShen: ShiShen;    // 地支十神（本氣）
  naYin: string;          // 納音
}

// ============ 流年 ============
export interface LiuNianInfo {
  year: number;           // 西曆年份
  age: number;            // 虛歲
  gan: TianGan;           // 天干
  zhi: DiZhi;             // 地支
  ganZhi: string;         // 干支組合
  ganWuXing: WuXing;      // 天干五行
  zhiWuXing: WuXing;      // 地支五行
  ganShiShen: ShiShen;    // 天干十神
  zhiShiShen: ShiShen;    // 地支十神（本氣）
  naYin: string;          // 納音
}

// ============ 五行分析 ============
export interface WuXingAnalysis {
  count: Record<WuXing, number>;         // 五行數量統計
  score: Record<WuXing, number>;         // 五行力量分數
  dayMasterElement: WuXing;              // 日主五行
  dayMasterStrength: 'weak' | 'medium' | 'strong' | 'very_strong';  // 日主強弱
  missingElements: WuXing[];             // 缺失的五行
  excessElements: WuXing[];              // 過旺的五行
}

// ============ 調候分析 ============
export interface TiaoHouAnalysis {
  score: number;                         // 寒暖燥濕分數（正=暖燥，負=寒濕）
  status: 'cold' | 'balanced' | 'hot';   // 調候狀態
  needsFire: boolean;                    // 是否需要火調候
  needsWater: boolean;                   // 是否需要水調候
  mainYongShen: TianGan[];               // 主要調候用神
  auxiliaryYongShen: TianGan[];          // 輔助調候用神
}

// ============ 用神喜忌 ============
export interface YongShenAnalysis {
  yongShen: TianGan | WuXing;            // 用神
  xiShen: TianGan | WuXing;              // 喜神
  jiShen: (TianGan | WuXing)[];          // 忌神
  chouShen: (TianGan | WuXing)[];        // 仇神
}

// ============ 神煞 ============
export interface ShenShaInfo {
  name: string;           // 神煞名稱
  type: 'auspicious' | 'inauspicious' | 'neutral';  // 吉/凶/中性
  pillar: 'year' | 'month' | 'day' | 'hour';        // 所在柱位
  position: 'gan' | 'zhi';                          // 在天干還是地支
  description: string;    // 說明
}

// ============ 農曆資訊 ============
export interface LunarInfo {
  year: number;           // 農曆年
  month: number;          // 農曆月
  day: number;            // 農曆日
  isLeapMonth: boolean;   // 是否閏月
  yearGanZhi: string;     // 年干支
  monthGanZhi: string;    // 月干支
  dayGanZhi: string;      // 日干支
  zodiac: string;         // 生肖
}

// ============ 節氣資訊 ============
export interface JieQiInfo {
  current: string;        // 當前節氣
  prev: {                 // 上一個節
    name: string;
    date: Date;
  };
  next: {                 // 下一個節
    name: string;
    date: Date;
  };
}

// ============ 八字完整結果 ============
export interface BaziResult {
  // 基本資訊
  birthInfo: {
    solar: { year: number; month: number; day: number; hour: number; minute: number };
    lunar: LunarInfo;
    jieQi: JieQiInfo;
    gender: Gender;
  };

  // 四柱
  fourPillars: FourPillars;

  // 日主
  dayMaster: {
    gan: TianGan;
    wuXing: WuXing;
    yinYang: 'yang' | 'yin';
  };

  // 五行分析
  wuXingAnalysis: WuXingAnalysis;

  // 調候分析
  tiaoHouAnalysis: TiaoHouAnalysis;

  // 用神喜忌（可選，需要進階分析）
  yongShenAnalysis?: YongShenAnalysis;

  // 大運（通常 8-10 步）
  daYun: {
    startAge: number;       // 起運年齡
    direction: 'forward' | 'backward';  // 順行或逆行
    list: DaYunInfo[];
  };

  // 神煞（可選）
  shenSha?: ShenShaInfo[];
}

// ============ 計算輸入參數 ============
export interface BaziInput {
  year: number;           // 西曆年
  month: number;          // 西曆月（1-12）
  day: number;            // 西曆日
  hour: number;           // 時（0-23）
  minute?: number;        // 分（0-59），預設為 0
  gender: Gender;         // 性別
}

// ============ 流年分析輸入 ============
export interface LiuNianInput {
  bazi: BaziResult;       // 八字結果
  startYear: number;      // 起始年份
  endYear: number;        // 結束年份
}

// ============ 流月資訊 ============
export interface LiuYueInfo {
  year: number;             // 西曆年
  month: number;            // 西曆月（1-12）
  lunarMonth: number;       // 農曆月（以節氣為界）
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

// ============ 起運詳情 ============
export interface StartAgeDetail {
  startAge: number;           // 起運歲數（整數）
  startAgeDecimal: number;    // 起運歲數（帶小數）
  startYear: number;          // 起運西曆年
  startMonth: number;         // 起運月份
  startDay: number;           // 起運日期
  direction: 'forward' | 'backward';  // 順逆行
  daysToJieQi: number;        // 距離節氣的天數
  targetJieQi: string;        // 目標節氣名稱
  explanation: string;        // 計算說明
}

// ============ 時間軸相關類型 ============
export interface TimelineYear {
  year: number;               // 西曆年
  age: number;                // 虛歲
  daYun: DaYunInfo | null;    // 所屬大運
  liuNian: LiuNianInfo;       // 流年資訊
  fortune: {
    overall: 'excellent' | 'good' | 'neutral' | 'caution' | 'challenging';
    aspects: {
      career: number;
      wealth: number;
      relationship: number;
      health: number;
    };
    keywords: string[];
    advice: string;
  };
  events: string[];           // 重要事件標記
  isTransition: boolean;      // 是否為大運交接年
  liuYue?: LiuYueInfo[];      // 流月
}

// ============ 人生階段 ============
export type LifeStageType = 
  | 'growth'      // 成長期
  | 'learning'    // 學習期
  | 'striving'    // 拼搏期
  | 'harvesting'  // 收穫期
  | 'wisdom'      // 智慧期
  | 'retirement'; // 頤養期

export interface LifeStage {
  type: LifeStageType;
  name: string;
  startAge: number;
  endAge: number;
  daYunList: DaYunInfo[];
  theme: string;
  focus: string[];
  challenges: string[];
  opportunities: string[];
  advice: string[];
}

// ============ 格局類型 ============
export type GeJuType = 
  // 正格
  | '正官格' | '七殺格' | '正印格' | '偏印格'
  | '正財格' | '偏財格' | '食神格' | '傷官格'
  | '建祿格' | '月刃格'
  // 特殊格局
  | '從財格' | '從官殺格' | '從兒格' | '從勢格'
  | '化氣格' | '專旺格'
  // 其他
  | '雜格' | '無格';

// ============ 格局分析 ============
export interface GeJuAnalysis {
  mainGeJu: GeJuType;            // 主要格局
  subGeJu?: GeJuType;            // 次要格局（如果有）
  yongShen: TianGan | DiZhi;     // 格局用神
  quality: 'high' | 'medium' | 'low';  // 格局品質
  description: string;            // 格局說明
}
