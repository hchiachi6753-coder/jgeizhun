/**
 * RAG 知識庫檢索模組
 * 根據命盤資訊搜尋相關的古書段落
 */

import ragData from '../../knowledge-base/rag_chunks.json';

interface RagChunk {
  id: string;
  text: string;
  source: string;
  chapter: string;
  title: string;
  category: string;
  keywords: string[];
}

interface RagDatabase {
  version: string;
  total_chunks: number;
  chunks: RagChunk[];
}

const db = ragData as RagDatabase;

/**
 * 根據關鍵字搜尋相關的古書段落
 * @param keywords 搜尋關鍵字陣列
 * @param category 限定分類（八字/紫微/易經）
 * @param limit 返回數量上限
 * @returns 相關的古書段落
 */
export function searchChunks(
  keywords: string[],
  category?: '八字' | '紫微' | '易經',
  limit: number = 5
): RagChunk[] {
  // 過濾分類
  let chunks = db.chunks;
  if (category) {
    chunks = chunks.filter(c => c.category === category);
  }

  // 計算每個 chunk 的匹配分數
  const scored = chunks.map(chunk => {
    let score = 0;
    const chunkKeywords = new Set(chunk.keywords);
    const chunkText = chunk.text.toLowerCase();
    
    for (const keyword of keywords) {
      // 關鍵字完全匹配
      if (chunkKeywords.has(keyword)) {
        score += 3;
      }
      // 文本中包含關鍵字
      if (chunkText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    return { chunk, score };
  });

  // 排序並返回前 N 個
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.chunk);
}

/**
 * 從八字命盤提取搜尋關鍵字
 */
export function extractBaziKeywords(baziResult: any): string[] {
  const keywords: string[] = [];
  
  // 天干
  if (baziResult.yearPillar?.gan) keywords.push(baziResult.yearPillar.gan);
  if (baziResult.monthPillar?.gan) keywords.push(baziResult.monthPillar.gan);
  if (baziResult.dayPillar?.gan) keywords.push(baziResult.dayPillar.gan);
  if (baziResult.hourPillar?.gan) keywords.push(baziResult.hourPillar.gan);
  
  // 地支
  if (baziResult.yearPillar?.zhi) keywords.push(baziResult.yearPillar.zhi);
  if (baziResult.monthPillar?.zhi) keywords.push(baziResult.monthPillar.zhi);
  if (baziResult.dayPillar?.zhi) keywords.push(baziResult.dayPillar.zhi);
  if (baziResult.hourPillar?.zhi) keywords.push(baziResult.hourPillar.zhi);
  
  // 五行
  if (baziResult.dayPillar?.ganWuXing) keywords.push(baziResult.dayPillar.ganWuXing);
  
  // 十神
  if (baziResult.yearShiShen) keywords.push(baziResult.yearShiShen);
  if (baziResult.monthShiShen) keywords.push(baziResult.monthShiShen);
  if (baziResult.hourShiShen) keywords.push(baziResult.hourShiShen);
  
  // 日主
  keywords.push('日主');
  
  return [...new Set(keywords)]; // 去重
}

/**
 * 從紫微命盤提取搜尋關鍵字
 */
export function extractZiweiKeywords(chart: any): string[] {
  const keywords: string[] = [];
  
  // 主星
  if (chart.gongs) {
    for (const gong of chart.gongs) {
      if (gong.mainStars) {
        for (const star of gong.mainStars) {
          keywords.push(star.name);
        }
      }
    }
  }
  
  // 四化
  if (chart.siHua) {
    keywords.push('化祿', '化權', '化科', '化忌');
    if (chart.siHua.lu?.star) keywords.push(chart.siHua.lu.star);
    if (chart.siHua.quan?.star) keywords.push(chart.siHua.quan.star);
    if (chart.siHua.ke?.star) keywords.push(chart.siHua.ke.star);
    if (chart.siHua.ji?.star) keywords.push(chart.siHua.ji.star);
  }
  
  // 宮位
  keywords.push('命宮', '財帛', '官祿', '夫妻', '疾厄');
  
  return [...new Set(keywords)]; // 去重
}

/**
 * 格式化檢索結果為 prompt 文字
 */
export function formatChunksForPrompt(chunks: RagChunk[]): string {
  if (chunks.length === 0) return '';
  
  const lines: string[] = ['【古書參考】\n'];
  
  for (const chunk of chunks) {
    lines.push(`📚 《${chunk.source}》${chunk.chapter}〈${chunk.title}〉`);
    lines.push(chunk.text.slice(0, 800)); // 限制長度
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * 為八字解析獲取相關古書內容
 */
export function getRelevantBaziContent(baziResult: any, limit: number = 3): string {
  const keywords = extractBaziKeywords(baziResult);
  const chunks = searchChunks(keywords, '八字', limit);
  return formatChunksForPrompt(chunks);
}

/**
 * 為紫微解析獲取相關古書內容
 */
export function getRelevantZiweiContent(chart: any, limit: number = 3): string {
  const keywords = extractZiweiKeywords(chart);
  const chunks = searchChunks(keywords, '紫微', limit);
  return formatChunksForPrompt(chunks);
}
// force deploy Wed Feb 18 20:47:00 CST 2026
