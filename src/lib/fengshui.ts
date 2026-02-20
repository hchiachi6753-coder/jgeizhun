// 八宅派風水計算邏輯
// 參考：~/Projects/jgeizhun/docs/八宅派計算邏輯.md

export type Gua = '坎' | '坤' | '震' | '巽' | '乾' | '兌' | '艮' | '離';
export type Direction = '北' | '東北' | '東' | '東南' | '南' | '西南' | '西' | '西北';
export type Star = '生氣' | '延年' | '天醫' | '伏位' | '絕命' | '五鬼' | '六煞' | '禍害';
export type FourLife = '東四命' | '西四命';
export type Element = '水' | '土' | '木' | '金' | '火';

// 立春日期（約每年 2/4）
const LICHUN_DAY = 4;
const LICHUN_MONTH = 2;

// 餘數對應卦象
const REMAINDER_TO_GUA: Record<number, Gua> = {
  1: '坎',
  2: '坤',
  3: '震',
  4: '巽',
  6: '乾',
  7: '兌',
  8: '艮',
  9: '離',
};

// 卦象對應五行
const GUA_TO_ELEMENT: Record<Gua, Element> = {
  '坎': '水',
  '坤': '土',
  '震': '木',
  '巽': '木',
  '乾': '金',
  '兌': '金',
  '艮': '土',
  '離': '火',
};

// 卦象對應四命
const GUA_TO_FOUR_LIFE: Record<Gua, FourLife> = {
  '坎': '東四命',
  '離': '東四命',
  '震': '東四命',
  '巽': '東四命',
  '乾': '西四命',
  '坤': '西四命',
  '兌': '西四命',
  '艮': '西四命',
};

// 方位對應度數範圍
const DIRECTION_RANGES: { direction: Direction; min: number; max: number }[] = [
  { direction: '北', min: 337.5, max: 360 },
  { direction: '北', min: 0, max: 22.5 },
  { direction: '東北', min: 22.5, max: 67.5 },
  { direction: '東', min: 67.5, max: 112.5 },
  { direction: '東南', min: 112.5, max: 157.5 },
  { direction: '南', min: 157.5, max: 202.5 },
  { direction: '西南', min: 202.5, max: 247.5 },
  { direction: '西', min: 247.5, max: 292.5 },
  { direction: '西北', min: 292.5, max: 337.5 },
];

// 朝向對應坐山
const FACING_TO_SITTING: Record<Direction, Direction> = {
  '北': '南',
  '東北': '西南',
  '東': '西',
  '東南': '西北',
  '南': '北',
  '西南': '東北',
  '西': '東',
  '西北': '東南',
};

// 坐山對應宅卦
const SITTING_TO_GUA: Record<Direction, Gua> = {
  '北': '坎',
  '南': '離',
  '東': '震',
  '東南': '巽',
  '西': '兌',
  '西北': '乾',
  '西南': '坤',
  '東北': '艮',
};

// 八遊星排布表
const EIGHT_STARS: Record<Gua, Record<Direction, Star>> = {
  // 東四宅
  '離': { '東': '生氣', '北': '延年', '東南': '天醫', '南': '伏位', '西北': '絕命', '西': '五鬼', '西南': '六煞', '東北': '禍害' },
  '震': { '南': '生氣', '東南': '延年', '北': '天醫', '東': '伏位', '西': '絕命', '西北': '五鬼', '東北': '六煞', '西南': '禍害' },
  '巽': { '北': '生氣', '東': '延年', '南': '天醫', '東南': '伏位', '東北': '絕命', '西南': '五鬼', '西': '六煞', '西北': '禍害' },
  '坎': { '東南': '生氣', '南': '延年', '東': '天醫', '北': '伏位', '西南': '絕命', '東北': '五鬼', '西北': '六煞', '西': '禍害' },
  // 西四宅
  '乾': { '西': '生氣', '西南': '延年', '東北': '天醫', '西北': '伏位', '南': '絕命', '東': '五鬼', '北': '六煞', '東南': '禍害' },
  '坤': { '東北': '生氣', '西北': '延年', '西': '天醫', '西南': '伏位', '北': '絕命', '東南': '五鬼', '南': '六煞', '東': '禍害' },
  '兌': { '西北': '生氣', '東北': '延年', '西南': '天醫', '西': '伏位', '東': '絕命', '南': '五鬼', '東南': '六煞', '北': '禍害' },
  '艮': { '西南': '生氣', '西': '延年', '西北': '天醫', '東北': '伏位', '東南': '絕命', '北': '五鬼', '南': '六煞', '東': '禍害' },
};

// 遊星描述
export const STAR_INFO: Record<Star, { type: '吉' | '凶'; level: string; meaning: string }> = {
  '生氣': { type: '吉', level: '大吉', meaning: '財運、活力、事業發展' },
  '延年': { type: '吉', level: '次吉', meaning: '感情、婚姻、人際和諧' },
  '天醫': { type: '吉', level: '中吉', meaning: '健康、貴人、疾病康復' },
  '伏位': { type: '吉', level: '小吉', meaning: '穩定、平安、守成' },
  '絕命': { type: '凶', level: '大凶', meaning: '災禍、損財、健康問題' },
  '五鬼': { type: '凶', level: '次凶', meaning: '口舌是非、小人暗害' },
  '六煞': { type: '凶', level: '中凶', meaning: '桃花煞、情感糾紛' },
  '禍害': { type: '凶', level: '小凶', meaning: '拖延、阻礙、小病痛' },
};

/**
 * 判斷是否在立春前
 */
function isBeforeLichun(month: number, day: number): boolean {
  if (month < LICHUN_MONTH) return true;
  if (month === LICHUN_MONTH && day < LICHUN_DAY) return true;
  return false;
}

/**
 * 計算命卦
 * @param year 西元年
 * @param month 月
 * @param day 日
 * @param gender 'male' | 'female'
 */
export function calculateMingGua(
  year: number,
  month: number,
  day: number,
  gender: 'male' | 'female'
): { gua: Gua; element: Element; fourLife: FourLife } {
  // 立春前出生，用前一年計算
  let calcYear = year;
  if (isBeforeLichun(month, day)) {
    calcYear = year - 1;
  }

  const lastTwoDigits = calcYear % 100;
  let remainder: number;

  if (calcYear >= 1900 && calcYear <= 1999) {
    // 1900-1999
    if (gender === 'male') {
      remainder = (100 - lastTwoDigits) % 9;
    } else {
      remainder = (lastTwoDigits - 4) % 9;
    }
  } else if (calcYear >= 2000 && calcYear <= 2099) {
    // 2000-2099
    if (gender === 'male') {
      remainder = (100 - lastTwoDigits + 8) % 9;
    } else {
      remainder = (lastTwoDigits + 6) % 9;
    }
  } else {
    throw new Error('不支援的出生年份');
  }

  // 特殊處理
  if (remainder === 0) remainder = 9;
  if (remainder === 5) {
    remainder = gender === 'male' ? 2 : 8;
  }

  // 處理負數餘數
  if (remainder < 0) {
    remainder = ((remainder % 9) + 9) % 9;
    if (remainder === 0) remainder = 9;
  }

  const gua = REMAINDER_TO_GUA[remainder];
  return {
    gua,
    element: GUA_TO_ELEMENT[gua],
    fourLife: GUA_TO_FOUR_LIFE[gua],
  };
}

/**
 * 根據度數取得方位
 */
export function getDirectionFromDegree(degree: number): Direction {
  // 標準化到 0-360
  degree = ((degree % 360) + 360) % 360;
  
  for (const range of DIRECTION_RANGES) {
    if (range.min > range.max) {
      // 跨 0 度的情況（北）
      if (degree >= range.min || degree < range.max) {
        return range.direction;
      }
    } else {
      if (degree >= range.min && degree < range.max) {
        return range.direction;
      }
    }
  }
  return '北'; // fallback
}

/**
 * 根據大門朝向計算宅卦
 */
export function calculateZhaiGua(
  facingDirection: Direction
): { sitting: Direction; gua: Gua; fourLife: FourLife } {
  const sitting = FACING_TO_SITTING[facingDirection];
  const gua = SITTING_TO_GUA[sitting];
  return {
    sitting,
    gua,
    fourLife: GUA_TO_FOUR_LIFE[gua],
  };
}

/**
 * 取得八方位吉凶分布
 */
export function getEightDirections(zhaiGua: Gua): Record<Direction, { star: Star; info: typeof STAR_INFO[Star] }> {
  const stars = EIGHT_STARS[zhaiGua];
  const result: Record<Direction, { star: Star; info: typeof STAR_INFO[Star] }> = {} as any;
  
  const directions: Direction[] = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
  for (const dir of directions) {
    const star = stars[dir];
    result[dir] = {
      star,
      info: STAR_INFO[star],
    };
  }
  
  return result;
}

/**
 * 判斷宅命是否相合
 */
export function isZhaiMingMatch(mingFourLife: FourLife, zhaiFourLife: FourLife): boolean {
  return mingFourLife === zhaiFourLife;
}

/**
 * 完整風水分析
 */
export interface FengshuiAnalysis {
  // 命卦資訊
  ming: {
    gua: Gua;
    element: Element;
    fourLife: FourLife;
  };
  // 宅卦資訊
  zhai: {
    facingDirection: Direction;
    facingDegree: number;
    sitting: Direction;
    gua: Gua;
    fourLife: FourLife;
  };
  // 宅命相合
  isMatch: boolean;
  matchAdvice: string;
  // 八方位吉凶
  directions: Record<Direction, { star: Star; info: typeof STAR_INFO[Star] }>;
}

export function analyzeFengshui(
  year: number,
  month: number,
  day: number,
  gender: 'male' | 'female',
  facingDegree: number
): FengshuiAnalysis {
  const ming = calculateMingGua(year, month, day, gender);
  const facingDirection = getDirectionFromDegree(facingDegree);
  const zhai = calculateZhaiGua(facingDirection);
  const isMatch = isZhaiMingMatch(ming.fourLife, zhai.fourLife);
  
  let matchAdvice: string;
  if (isMatch) {
    matchAdvice = `恭喜！您是${ming.fourLife}，住${zhai.fourLife.replace('命', '宅')}，宅命相合，有助於運勢提升。`;
  } else {
    matchAdvice = `您是${ming.fourLife}，但住在${zhai.fourLife.replace('命', '宅')}，宅命不合。建議調整床頭或書桌朝向至吉方位來補償。`;
  }

  const directions = getEightDirections(zhai.gua);

  return {
    ming,
    zhai: {
      facingDirection,
      facingDegree,
      sitting: zhai.sitting,
      gua: zhai.gua,
      fourLife: zhai.fourLife,
    },
    isMatch,
    matchAdvice,
    directions,
  };
}
