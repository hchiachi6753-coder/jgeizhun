/**
 * 易經六爻占卜常數
 */

// 八卦
export const BA_GUA = {
  '111': { name: '乾', nature: '天', element: '金' },
  '000': { name: '坤', nature: '地', element: '土' },
  '100': { name: '震', nature: '雷', element: '木' },
  '010': { name: '坎', nature: '水', element: '水' },
  '001': { name: '艮', nature: '山', element: '土' },
  '011': { name: '巽', nature: '風', element: '木' },
  '101': { name: '離', nature: '火', element: '火' },
  '110': { name: '兌', nature: '澤', element: '金' },
} as const;

// 64卦名稱對照表 [上卦][下卦]
export const GUA_64: Record<string, Record<string, { name: string; number: number }>> = {
  '乾': {
    '乾': { name: '乾為天', number: 1 },
    '坤': { name: '天地否', number: 12 },
    '震': { name: '天雷无妄', number: 25 },
    '坎': { name: '天水訟', number: 6 },
    '艮': { name: '天山遯', number: 33 },
    '巽': { name: '天風姤', number: 44 },
    '離': { name: '天火同人', number: 13 },
    '兌': { name: '天澤履', number: 10 },
  },
  '坤': {
    '乾': { name: '地天泰', number: 11 },
    '坤': { name: '坤為地', number: 2 },
    '震': { name: '地雷復', number: 24 },
    '坎': { name: '地水師', number: 7 },
    '艮': { name: '地山謙', number: 15 },
    '巽': { name: '地風升', number: 46 },
    '離': { name: '地火明夷', number: 36 },
    '兌': { name: '地澤臨', number: 19 },
  },
  '震': {
    '乾': { name: '雷天大壯', number: 34 },
    '坤': { name: '雷地豫', number: 16 },
    '震': { name: '震為雷', number: 51 },
    '坎': { name: '雷水解', number: 40 },
    '艮': { name: '雷山小過', number: 62 },
    '巽': { name: '雷風恆', number: 32 },
    '離': { name: '雷火豐', number: 55 },
    '兌': { name: '雷澤歸妹', number: 54 },
  },
  '坎': {
    '乾': { name: '水天需', number: 5 },
    '坤': { name: '水地比', number: 8 },
    '震': { name: '水雷屯', number: 3 },
    '坎': { name: '坎為水', number: 29 },
    '艮': { name: '水山蹇', number: 39 },
    '巽': { name: '水風井', number: 48 },
    '離': { name: '水火既濟', number: 63 },
    '兌': { name: '水澤節', number: 60 },
  },
  '艮': {
    '乾': { name: '山天大畜', number: 26 },
    '坤': { name: '山地剝', number: 23 },
    '震': { name: '山雷頤', number: 27 },
    '坎': { name: '山水蒙', number: 4 },
    '艮': { name: '艮為山', number: 52 },
    '巽': { name: '山風蠱', number: 18 },
    '離': { name: '山火賁', number: 22 },
    '兌': { name: '山澤損', number: 41 },
  },
  '巽': {
    '乾': { name: '風天小畜', number: 9 },
    '坤': { name: '風地觀', number: 20 },
    '震': { name: '風雷益', number: 42 },
    '坎': { name: '風水渙', number: 59 },
    '艮': { name: '風山漸', number: 53 },
    '巽': { name: '巽為風', number: 57 },
    '離': { name: '風火家人', number: 37 },
    '兌': { name: '風澤中孚', number: 61 },
  },
  '離': {
    '乾': { name: '火天大有', number: 14 },
    '坤': { name: '火地晉', number: 35 },
    '震': { name: '火雷噬嗑', number: 21 },
    '坎': { name: '火水未濟', number: 64 },
    '艮': { name: '火山旅', number: 56 },
    '巽': { name: '火風鼎', number: 50 },
    '離': { name: '離為火', number: 30 },
    '兌': { name: '火澤睽', number: 38 },
  },
  '兌': {
    '乾': { name: '澤天夬', number: 43 },
    '坤': { name: '澤地萃', number: 45 },
    '震': { name: '澤雷隨', number: 17 },
    '坎': { name: '澤水困', number: 47 },
    '艮': { name: '澤山咸', number: 31 },
    '巽': { name: '澤風大過', number: 28 },
    '離': { name: '澤火革', number: 49 },
    '兌': { name: '兌為澤', number: 58 },
  },
};

// 爻的類型
export type YaoType = 6 | 7 | 8 | 9; // 6=老陰, 7=少陽, 8=少陰, 9=老陽

// 爻的名稱
export const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

// 銅錢結果對應
export const COIN_RESULT = {
  3: 9,  // 3正面 = 老陽
  2: 8,  // 2正面1反面 = 少陰
  1: 7,  // 1正面2反面 = 少陽
  0: 6,  // 3反面 = 老陰
} as const;
