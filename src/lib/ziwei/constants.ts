/**
 * 紫微斗數常數定義
 */

// 十天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type TianGan = typeof TIAN_GAN[number];

// 十二地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type DiZhi = typeof DI_ZHI[number];

// 十二宮名稱（從命宮開始逆時針排列）
export const GONG_NAMES = [
  '命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄',
  '遷移', '交友', '官祿', '田宅', '福德', '父母'
] as const;
export type GongName = typeof GONG_NAMES[number];

// 十二時辰對應
// 子時(23-01)=0, 丑時(01-03)=1, 寅時(03-05)=2, 卯時(05-07)=3,
// 辰時(07-09)=4, 巳時(09-11)=5, 午時(11-13)=6, 未時(13-15)=7,
// 申時(15-17)=8, 酉時(17-19)=9, 戌時(19-21)=10, 亥時(21-23)=11
export const getHourIndex = (hour: number): number => {
  // 23點是子時（晚子）
  if (hour === 23) return 0;
  // 0點也是子時（早子）
  if (hour === 0) return 0;
  // 其他小時：(hour+1) / 2
  return Math.floor((hour + 1) / 2);
};

// 五行
export const WU_XING = ['金', '水', '木', '火', '土'] as const;
export type WuXing = typeof WU_XING[number];

// 五行局
export const WU_XING_JU = {
  2: '水二局',
  3: '木三局',
  4: '金四局',
  5: '土五局',
  6: '火六局',
} as const;
export type JuNum = 2 | 3 | 4 | 5 | 6;

// 十四主星
export const MAIN_STARS = [
  '紫微', '天機', '太陽', '武曲', '天同', '廉貞',
  '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'
] as const;
export type MainStar = typeof MAIN_STARS[number];

// 輔星（六吉星）
export const ASSIST_STARS = ['左輔', '右弼', '文昌', '文曲', '天魁', '天鉞'] as const;
export type AssistStar = typeof ASSIST_STARS[number];

// 煞星（六煞星）
export const SHA_STARS = ['擎羊', '陀羅', '火星', '鈴星', '地空', '地劫'] as const;
export type ShaStar = typeof SHA_STARS[number];

// 祿存
export const LU_CUN = '祿存';

// 天馬
export const TIAN_MA = '天馬';

// 四化
export const SI_HUA_NAMES = ['祿', '權', '科', '忌'] as const;
export type SiHuaName = typeof SI_HUA_NAMES[number];

// 星曜亮度
export const BRIGHTNESS = ['廟', '旺', '得地', '利', '平', '不得地', '落陷'] as const;
export type Brightness = typeof BRIGHTNESS[number];

// 六十甲子納音五行表
// 按照年干支順序排列：甲子、乙丑、丙寅... 共60組
export const SIXTY_JIAZI_NAYIN: Record<string, WuXing> = {
  // 海中金
  '甲子': '金', '乙丑': '金',
  // 爐中火
  '丙寅': '火', '丁卯': '火',
  // 大林木
  '戊辰': '木', '己巳': '木',
  // 路旁土
  '庚午': '土', '辛未': '土',
  // 劍鋒金
  '壬申': '金', '癸酉': '金',
  // 山頭火
  '甲戌': '火', '乙亥': '火',
  // 澗下水
  '丙子': '水', '丁丑': '水',
  // 城頭土
  '戊寅': '土', '己卯': '土',
  // 白蠟金
  '庚辰': '金', '辛巳': '金',
  // 楊柳木
  '壬午': '木', '癸未': '木',
  // 泉中水
  '甲申': '水', '乙酉': '水',
  // 屋上土
  '丙戌': '土', '丁亥': '土',
  // 霹靂火
  '戊子': '火', '己丑': '火',
  // 松柏木
  '庚寅': '木', '辛卯': '木',
  // 長流水
  '壬辰': '水', '癸巳': '水',
  // 沙中金
  '甲午': '金', '乙未': '金',
  // 山下火
  '丙申': '火', '丁酉': '火',
  // 平地木
  '戊戌': '木', '己亥': '木',
  // 壁上土
  '庚子': '土', '辛丑': '土',
  // 金箔金
  '壬寅': '金', '癸卯': '金',
  // 覆燈火
  '甲辰': '火', '乙巳': '火',
  // 天河水
  '丙午': '水', '丁未': '水',
  // 大驛土
  '戊申': '土', '己酉': '土',
  // 釵釧金
  '庚戌': '金', '辛亥': '金',
  // 桑柘木
  '壬子': '木', '癸丑': '木',
  // 大溪水
  '甲寅': '水', '乙卯': '水',
  // 沙中土
  '丙辰': '土', '丁巳': '土',
  // 天上火
  '戊午': '火', '己未': '火',
  // 石榴木
  '庚申': '木', '辛酉': '木',
  // 大海水
  '壬戌': '水', '癸亥': '水',
};
