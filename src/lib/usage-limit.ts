// 使用次數限制管理

const STORAGE_KEY = 'jgeizhun_usage';
const LIMIT_HOURS = 24;
const MAX_FOLLOWUP = 2;

// 檢查是否為開發模式（URL 有 ?dev=1）
function isDevMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('dev') === '1';
}

interface UsageData {
  followUpCount: number;
  lastReset: number; // timestamp
}

// 取得使用記錄
function getUsageData(): UsageData {
  if (typeof window === 'undefined') {
    return { followUpCount: 0, lastReset: Date.now() };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { followUpCount: 0, lastReset: Date.now() };
    }
    
    const data: UsageData = JSON.parse(stored);
    
    // 檢查是否需要重置（超過 24 小時）
    const hoursPassed = (Date.now() - data.lastReset) / (1000 * 60 * 60);
    if (hoursPassed >= LIMIT_HOURS) {
      const newData = { followUpCount: 0, lastReset: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    }
    
    return data;
  } catch {
    return { followUpCount: 0, lastReset: Date.now() };
  }
}

// 儲存使用記錄
function saveUsageData(data: UsageData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 檢查是否還能追問
export function canAskFollowUp(): boolean {
  // 開發模式不限制
  if (isDevMode()) return true;
  
  const data = getUsageData();
  return data.followUpCount < MAX_FOLLOWUP;
}

// 取得剩餘次數
export function getRemainingFollowUps(): number {
  // 開發模式顯示 99
  if (isDevMode()) return 99;
  
  const data = getUsageData();
  return Math.max(0, MAX_FOLLOWUP - data.followUpCount);
}

// 記錄一次追問
export function recordFollowUp(): void {
  const data = getUsageData();
  data.followUpCount += 1;
  saveUsageData(data);
}

// 取得下次重置時間（小時）
export function getHoursUntilReset(): number {
  const data = getUsageData();
  const hoursPassed = (Date.now() - data.lastReset) / (1000 * 60 * 60);
  return Math.max(0, Math.ceil(LIMIT_HOURS - hoursPassed));
}

// 友善的達到上限訊息
export const LIMIT_MESSAGES = [
  '✨ 今天的問命時光已圓滿～\n\n命理師需要休息，明天再來探索人生奧秘吧！\n記得，最好的答案往往在沉澱後浮現 🌙',
  '🌟 哇，你今天問得真積極！\n\n不過天機不可多洩，讓這些啟示先沉澱一下～\n明天同一時間，命理師在這裡等你 ✨',
  '🔮 今日問命額度已滿～\n\n好的建議需要時間消化，\n先把今天的收穫記在心裡，明天再續前緣！',
];

// 隨機取得一則訊息
export function getLimitMessage(): string {
  const index = Math.floor(Math.random() * LIMIT_MESSAGES.length);
  return LIMIT_MESSAGES[index];
}
