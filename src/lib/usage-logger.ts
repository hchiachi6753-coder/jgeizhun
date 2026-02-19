// 使用紀錄 - 送到 Google Sheet

// 簡易裝置指紋（不需要額外套件）
function getSimpleFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  const { screen, navigator } = window;
  const components = [
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.language,
    navigator.platform,
    new Date().getTimezoneOffset(),
  ];
  
  // 簡單 hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// 從 URL 取得命盤資料
function getChartDataFromUrl(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    name: params.get('name') || '',
    year: params.get('year') || '',
    month: params.get('month') || '',
    day: params.get('day') || '',
    shichen: params.get('shichen') || '',
    gender: params.get('gender') || '',
  };
}

// 記錄使用（非同步，不阻塞）
export async function logUsage(
  feature: '八字' | '紫微' | '綜合' | '易經',
  action: '解析' | '追問',
  question?: string
): Promise<void> {
  try {
    const chartData = getChartDataFromUrl();
    const fingerprint = getSimpleFingerprint();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    // 非同步送出，不等待結果
    fetch('/api/log-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature,
        action,
        chartData,
        question,
        fingerprint,
        userAgent,
      }),
    }).catch(() => {
      // 忽略錯誤，不影響用戶體驗
    });
  } catch {
    // 忽略錯誤
  }
}
