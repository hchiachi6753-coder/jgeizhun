/**
 * 六爻占卜計算模組
 */

import { BA_GUA, GUA_64, YaoType, YAO_NAMES, COIN_RESULT } from './constants';

export interface YaoResult {
  coinResult: number; // 正面數量 (0-3)
  yaoValue: YaoType;  // 6, 7, 8, 9
  yaoLine: string;    // ⚋ 或 ⚊
  isChanging: boolean; // 是否為動爻
  yaoName: string;    // 初爻、二爻...
}

export interface GuaResult {
  name: string;       // 卦名
  number: number;     // 卦序
  upperGua: string;   // 上卦名
  lowerGua: string;   // 下卦名
  yaos: string[];     // 六爻陣列（從下到上）
}

export interface LiuYaoResult {
  question: string;   // 問題
  yaos: YaoResult[];  // 六爻結果
  benGua: GuaResult;  // 本卦
  bianGua: GuaResult | null; // 變卦（如果有動爻）
  dongYao: number[];  // 動爻位置（1-6）
  timestamp: string;  // 占卜時間
}

/**
 * 模擬搖一次銅錢（三個銅錢）
 * @returns 正面的數量 (0-3)
 */
export function shakeCoinOnce(): number {
  let heads = 0;
  for (let i = 0; i < 3; i++) {
    if (Math.random() > 0.5) heads++;
  }
  return heads;
}

/**
 * 根據正面數量得到爻值
 */
export function getYaoValue(heads: number): YaoType {
  return COIN_RESULT[heads as keyof typeof COIN_RESULT];
}

/**
 * 判斷爻是陽還是陰
 */
export function isYangYao(yaoValue: YaoType): boolean {
  return yaoValue === 7 || yaoValue === 9;
}

/**
 * 判斷是否為動爻
 */
export function isChangingYao(yaoValue: YaoType): boolean {
  return yaoValue === 6 || yaoValue === 9;
}

/**
 * 獲取爻的符號
 */
export function getYaoSymbol(yaoValue: YaoType): string {
  return isYangYao(yaoValue) ? '⚊' : '⚋';
}

/**
 * 搖六次得到完整的六爻
 */
export function shakeAllYaos(): YaoResult[] {
  const yaos: YaoResult[] = [];
  
  for (let i = 0; i < 6; i++) {
    const coinResult = shakeCoinOnce();
    const yaoValue = getYaoValue(coinResult);
    
    yaos.push({
      coinResult,
      yaoValue,
      yaoLine: getYaoSymbol(yaoValue),
      isChanging: isChangingYao(yaoValue),
      yaoName: YAO_NAMES[i],
    });
  }
  
  return yaos;
}

/**
 * 從六爻得到卦象
 * @param yaos 六個爻（從下到上）
 * @param useChanged 是否使用變化後的爻
 */
export function getGuaFromYaos(yaos: YaoResult[], useChanged: boolean = false): GuaResult {
  // 將爻轉換為二進制字串
  const yaoLines = yaos.map(yao => {
    let isYang = isYangYao(yao.yaoValue);
    
    // 如果使用變卦，動爻要變化
    if (useChanged && yao.isChanging) {
      isYang = !isYang;
    }
    
    return isYang ? '1' : '0';
  });
  
  // 下卦（初爻到三爻）
  const lowerCode = yaoLines.slice(0, 3).join('');
  // 上卦（四爻到上爻）
  const upperCode = yaoLines.slice(3, 6).join('');
  
  const lowerGua = BA_GUA[lowerCode as keyof typeof BA_GUA];
  const upperGua = BA_GUA[upperCode as keyof typeof BA_GUA];
  
  const guaInfo = GUA_64[upperGua.name][lowerGua.name];
  
  return {
    name: guaInfo.name,
    number: guaInfo.number,
    upperGua: upperGua.name,
    lowerGua: lowerGua.name,
    yaos: yaoLines,
  };
}

/**
 * 完整的六爻占卜
 */
export function performLiuYao(question: string): LiuYaoResult {
  const yaos = shakeAllYaos();
  const benGua = getGuaFromYaos(yaos, false);
  
  // 找出動爻
  const dongYao = yaos
    .map((yao, index) => yao.isChanging ? index + 1 : 0)
    .filter(pos => pos > 0);
  
  // 如果有動爻，計算變卦
  const bianGua = dongYao.length > 0 ? getGuaFromYaos(yaos, true) : null;
  
  return {
    question,
    yaos,
    benGua,
    bianGua,
    dongYao,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 格式化卦象顯示
 */
export function formatGuaDisplay(gua: GuaResult): string {
  const lines: string[] = [];
  
  // 從上到下顯示（上爻在上）
  for (let i = 5; i >= 0; i--) {
    const line = gua.yaos[i] === '1' ? '━━━━━' : '━━ ━━';
    const position = i >= 3 ? '外' : '內';
    lines.push(`${YAO_NAMES[i]} ${line}`);
  }
  
  return lines.join('\n');
}

/**
 * 獲取爻辭位置名稱
 */
export function getYaoCiName(position: number, isYang: boolean): string {
  const positionNames = ['初', '二', '三', '四', '五', '上'];
  const yinYang = isYang ? '九' : '六';
  return `${positionNames[position - 1]}${position === 1 || position === 6 ? yinYang : yinYang}`;
}
