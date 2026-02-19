// 使用次數限制管理 - 按命盤計算

const STORAGE_KEY = 'jgeizhun_usage_v2';
const LIMIT_HOURS = 24;
const MAX_FOLLOWUP = 2;

interface ChartUsage {
  followUpCount: number;
  lastReset: number; // timestamp
}

interface UsageData {
  charts: Record<string, ChartUsage>; // key = chartId
}

// 檢查是否為開發模式（URL 有 ?dev=1）
function isDevMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('dev') === '1';
}

// 從 URL 取得命盤 ID
function getChartIdFromUrl(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const params = new URLSearchParams(window.location.search);
  const year = params.get('year') || '';
  const month = params.get('month') || '';
  const day = params.get('day') || '';
  const shichen = params.get('shichen') || '';
  const gender = params.get('gender') || '';
  
  // 產生唯一識別碼
  return `${year}-${month}-${day}-${shichen}-${gender}`;
}

// 取得使用記錄
function getUsageData(): UsageData {
  if (typeof window === 'undefined') {
    return { charts: {} };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { charts: {} };
    }
    return JSON.parse(stored);
  } catch {
    return { charts: {} };
  }
}

// 取得特定命盤的使用記錄
function getChartUsage(chartId: string): ChartUsage {
  const data = getUsageData();
  const chartUsage = data.charts[chartId];
  
  if (!chartUsage) {
    return { followUpCount: 0, lastReset: Date.now() };
  }
  
  // 檢查是否需要重置（超過 24 小時）
  const hoursPassed = (Date.now() - chartUsage.lastReset) / (1000 * 60 * 60);
  if (hoursPassed >= LIMIT_HOURS) {
    return { followUpCount: 0, lastReset: Date.now() };
  }
  
  return chartUsage;
}

// 儲存使用記錄
function saveChartUsage(chartId: string, usage: ChartUsage): void {
  if (typeof window === 'undefined') return;
  
  const data = getUsageData();
  data.charts[chartId] = usage;
  
  // 清理過期的記錄（超過 48 小時的）
  const now = Date.now();
  for (const key of Object.keys(data.charts)) {
    const hoursPassed = (now - data.charts[key].lastReset) / (1000 * 60 * 60);
    if (hoursPassed > 48) {
      delete data.charts[key];
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 檢查是否還能追問（當前命盤）
export function canAskFollowUp(): boolean {
  // TODO: 暫時關閉限制，等 JJ 測試完再打開
  // 恢復時把下面這行刪掉即可
  return true;
  
  // 開發模式不限制
  if (isDevMode()) return true;
  
  const chartId = getChartIdFromUrl();
  const usage = getChartUsage(chartId);
  return usage.followUpCount < MAX_FOLLOWUP;
}

// 取得剩餘次數（當前命盤）
export function getRemainingFollowUps(): number {
  // TODO: 暫時關閉限制，等 JJ 測試完再打開
  return 99;
  
  // 開發模式顯示 99
  if (isDevMode()) return 99;
  
  const chartId = getChartIdFromUrl();
  const usage = getChartUsage(chartId);
  return Math.max(0, MAX_FOLLOWUP - usage.followUpCount);
}

// 記錄一次追問（當前命盤）
export function recordFollowUp(): void {
  const chartId = getChartIdFromUrl();
  const usage = getChartUsage(chartId);
  usage.followUpCount += 1;
  if (usage.lastReset === 0) {
    usage.lastReset = Date.now();
  }
  saveChartUsage(chartId, usage);
}

// 取得下次重置時間（小時）
export function getHoursUntilReset(): number {
  const chartId = getChartIdFromUrl();
  const usage = getChartUsage(chartId);
  const hoursPassed = (Date.now() - usage.lastReset) / (1000 * 60 * 60);
  return Math.max(0, Math.ceil(LIMIT_HOURS - hoursPassed));
}

// 友善的達到上限訊息
export const LIMIT_MESSAGES = [
  '✨ 這組命盤今天的問命時光已圓滿～\n\n命理師需要休息，明天再來探索這個命盤的奧秘吧！\n想算其他人的命盤？沒問題，每個命盤都有獨立額度喔 🌙',
  '🌟 哇，這組命盤你今天問得真積極！\n\n不過天機不可多洩，讓這些啟示先沉澱一下～\n明天同一時間，命理師在這裡等你繼續探索 ✨',
  '🔮 這組命盤今日問命額度已滿～\n\n好的建議需要時間消化，\n先把今天的收穫記在心裡，明天再續前緣！',
];

// 隨機取得一則訊息
export function getLimitMessage(): string {
  const index = Math.floor(Math.random() * LIMIT_MESSAGES.length);
  return LIMIT_MESSAGES[index];
}
