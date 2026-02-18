/**
 * 時間軸整合輸出模組
 * 
 * 將大運、流年、流月等資訊整合成完整的時間軸資料結構，
 * 方便前端製作「人生旅程圖」視覺化。
 */

// @ts-nocheck
import {
  type TianGan, type DiZhi, type WuXing, type ShiShen,
  GAN_WU_XING, ZHI_WU_XING
} from './constants';
import { combineGanZhi, getNaYin } from './ganzhi';
import { getShiShen, getZhiShiShen } from './shiShen';
import { calculateDaYun, getDaYunAtAge, analyzeDaYunTrend } from './dayun';
import { calculateLiuNianFromBirth, checkLiuNianWithPillars } from './liunian';
import { calculateLiuYueList, analyzeYearlyLiuYue } from './liuyue';
import { analyzeLifeStages, type LifeStageAnalysis, type LifeStage } from './stages';
import type { DaYunInfo, LiuNianInfo, BaziResult, Gender, FourPillars } from './types';
import type { LiuYueInfo, LiuYueAnalysis } from './liuyue';

// ============ 時間軸類型定義 ============

export interface TimelineYear {
  year: number;               // 西曆年
  age: number;                // 虛歲
  daYun: DaYunInfo | null;    // 所屬大運
  liuNian: LiuNianInfo;       // 流年資訊
  fortune: YearFortune;       // 年度運勢評估
  events: string[];           // 重要事件標記
  isTransition: boolean;      // 是否為大運交接年
  liuYue?: LiuYueInfo[];      // 流月（可選，需要時載入）
}

export interface YearFortune {
  overall: 'excellent' | 'good' | 'neutral' | 'caution' | 'challenging';
  aspects: {
    career: number;     // 事業運 0-100
    wealth: number;     // 財運
    relationship: number; // 感情運
    health: number;     // 健康運
  };
  keywords: string[];   // 關鍵詞
  advice: string;       // 簡短建議
}

export interface TimelineDecade {
  startAge: number;
  endAge: number;
  daYun: DaYunInfo;
  years: TimelineYear[];
  stage?: LifeStage;     // 對應的人生階段
  summary: string;       // 十年總結
}

export interface TimelineData {
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: Gender;
  };
  dayMaster: {
    gan: TianGan;
    wuXing: WuXing;
  };
  decades: TimelineDecade[];      // 按大運分的十年區塊
  stages: LifeStageAnalysis;      // 人生階段分析
  highlights: TimelineHighlight[]; // 重要時間點標記
  statistics: TimelineStatistics;  // 統計數據
}

export interface TimelineHighlight {
  year: number;
  age: number;
  type: 'peak' | 'valley' | 'turning' | 'special';
  title: string;
  description: string;
}

export interface TimelineStatistics {
  totalYears: number;
  bestDecade: { startAge: number; reason: string };
  challengingDecade: { startAge: number; reason: string };
  wuXingDistribution: Record<WuXing, number>;
  shiShenDistribution: Record<ShiShen, number>;
}

// ============ 時間軸生成 ============

/**
 * 生成完整的人生時間軸
 */
export function generateTimeline(
  bazi: BaziResult,
  totalYears: number = 100
): TimelineData {
  const { birthInfo, fourPillars, dayMaster, daYun } = bazi;
  const { year: birthYear, month, day, hour, gender } = birthInfo.solar;

  // 計算流年列表
  const liuNianList = calculateLiuNianFromBirth(birthYear, dayMaster.gan, totalYears);

  // 人生階段分析
  const stagesAnalysis = analyzeLifeStages(
    daYun.list,
    dayMaster.gan,
    gender,
    birthYear
  );

  // 按大運生成十年區塊
  const decades: TimelineDecade[] = [];
  
  for (const dy of daYun.list) {
    const decadeYears: TimelineYear[] = [];
    
    for (let age = dy.startAge; age < dy.endAge && age <= totalYears; age++) {
      const year = birthYear + age - 1;
      const liuNian = liuNianList.find(ln => ln.year === year);
      
      if (!liuNian) continue;

      // 評估年度運勢
      const fortune = evaluateYearFortune(
        liuNian,
        dy,
        dayMaster.gan,
        fourPillars
      );

      // 檢查是否為大運交接年
      const isTransition = age === dy.startAge;

      // 標記重要事件
      const events = getYearEvents(liuNian, fourPillars, age);

      decadeYears.push({
        year,
        age,
        daYun: dy,
        liuNian,
        fortune,
        events,
        isTransition
      });
    }

    // 找出對應的人生階段
    const matchingStage = stagesAnalysis.stages.find(s =>
      dy.startAge >= s.startAge && dy.startAge < s.endAge
    );

    decades.push({
      startAge: dy.startAge,
      endAge: dy.endAge,
      daYun: dy,
      years: decadeYears,
      stage: matchingStage,
      summary: generateDecadeSummary(dy, decadeYears)
    });
  }

  // 找出重要時間點
  const highlights = findHighlights(decades, stagesAnalysis);

  // 統計數據
  const statistics = calculateStatistics(decades, daYun.list);

  return {
    birthInfo: { year: birthYear, month, day, hour, gender },
    dayMaster: { gan: dayMaster.gan, wuXing: dayMaster.wuXing },
    decades,
    stages: stagesAnalysis,
    highlights,
    statistics
  };
}

// ============ 年度運勢評估 ============

/**
 * 評估年度運勢
 */
function evaluateYearFortune(
  liuNian: LiuNianInfo,
  daYun: DaYunInfo,
  dayGan: TianGan,
  pillars: FourPillars
): YearFortune {
  let score = 50; // 基礎分數
  const keywords: string[] = [];
  
  // 評估流年天干十神
  const ganShiShen = liuNian.ganShiShen;
  score += getShiShenScore(ganShiShen);
  keywords.push(ganShiShen);

  // 評估流年與大運的關係
  if (liuNian.gan === daYun.gan) {
    score += 5;
    keywords.push('天干助力');
  }
  if (liuNian.zhi === daYun.zhi) {
    score += 5;
    keywords.push('地支助力');
  }

  // 檢查與原局的沖合
  const taiSuiCheck = checkLiuNianWithPillars(
    liuNian,
    pillars.year.zhi,
    pillars.month.zhi,
    pillars.day.zhi,
    pillars.hour.zhi
  );

  for (const detail of taiSuiCheck.details) {
    if (detail.includes('沖')) {
      score -= 15;
      keywords.push('犯太歲');
    } else if (detail.includes('合')) {
      score += 10;
      keywords.push('合太歲');
    } else if (detail.includes('本命年')) {
      score -= 5;
      keywords.push('本命年');
    }
  }

  // 計算各方面運勢
  const aspects = {
    career: calculateAspect(ganShiShen, 'career', daYun),
    wealth: calculateAspect(ganShiShen, 'wealth', daYun),
    relationship: calculateAspect(ganShiShen, 'relationship', daYun),
    health: calculateAspect(ganShiShen, 'health', daYun)
  };

  // 確定整體運勢等級
  let overall: YearFortune['overall'];
  if (score >= 80) overall = 'excellent';
  else if (score >= 60) overall = 'good';
  else if (score >= 40) overall = 'neutral';
  else if (score >= 25) overall = 'caution';
  else overall = 'challenging';

  // 生成建議
  const advice = generateYearAdvice(overall, ganShiShen, taiSuiCheck.details);

  return { overall, aspects, keywords, advice };
}

/**
 * 獲取十神的基礎分數
 */
function getShiShenScore(shiShen: ShiShen): number {
  const scores: Record<ShiShen, number> = {
    '正財': 15,
    '偏財': 12,
    '正官': 15,
    '七殺': -5,
    '正印': 12,
    '偏印': 5,
    '食神': 10,
    '傷官': -8,
    '比肩': 0,
    '劫財': -10
  };
  return scores[shiShen];
}

/**
 * 計算各方面運勢
 */
function calculateAspect(
  ganShiShen: ShiShen,
  aspect: 'career' | 'wealth' | 'relationship' | 'health',
  daYun: DaYunInfo
): number {
  let base = 50;

  // 根據十神調整
  switch (aspect) {
    case 'career':
      if (['正官', '七殺'].includes(ganShiShen)) base += 20;
      if (['正印', '偏印'].includes(ganShiShen)) base += 10;
      if (['傷官'].includes(ganShiShen)) base -= 10;
      break;
    case 'wealth':
      if (['正財', '偏財'].includes(ganShiShen)) base += 25;
      if (['食神'].includes(ganShiShen)) base += 10;
      if (['劫財', '比肩'].includes(ganShiShen)) base -= 15;
      break;
    case 'relationship':
      if (['正財', '正官'].includes(ganShiShen)) base += 15;
      if (['食神'].includes(ganShiShen)) base += 10;
      if (['七殺', '傷官'].includes(ganShiShen)) base -= 10;
      break;
    case 'health':
      if (['正印', '食神'].includes(ganShiShen)) base += 10;
      if (['七殺', '傷官'].includes(ganShiShen)) base -= 10;
      if (['偏印'].includes(ganShiShen)) base -= 5;
      break;
  }

  // 結合大運調整
  if (['正財', '偏財'].includes(daYun.ganShiShen) && aspect === 'wealth') {
    base += 10;
  }
  if (['正官', '七殺'].includes(daYun.ganShiShen) && aspect === 'career') {
    base += 10;
  }

  return Math.max(0, Math.min(100, base));
}

/**
 * 生成年度建議
 */
function generateYearAdvice(
  overall: YearFortune['overall'],
  ganShiShen: ShiShen,
  taiSuiDetails: string[]
): string {
  const advices: string[] = [];

  // 根據整體運勢
  switch (overall) {
    case 'excellent':
      advices.push('運勢極佳，可積極把握機會');
      break;
    case 'good':
      advices.push('運勢平順，穩步前進');
      break;
    case 'neutral':
      advices.push('運勢平穩，宜守成');
      break;
    case 'caution':
      advices.push('宜低調行事，謹慎決策');
      break;
    case 'challenging':
      advices.push('多加謹慎，韜光養晦');
      break;
  }

  // 根據太歲關係
  if (taiSuiDetails.some(d => d.includes('沖') || d.includes('本命年'))) {
    advices.push('可考慮安太歲化解');
  }

  return advices.join('；');
}

// ============ 事件標記 ============

/**
 * 獲取年度重要事件
 */
function getYearEvents(
  liuNian: LiuNianInfo,
  pillars: FourPillars,
  age: number
): string[] {
  const events: string[] = [];

  // 本命年
  if (liuNian.zhi === pillars.year.zhi) {
    events.push('本命年');
  }

  // 逢六（沖）
  const chongMap: Record<DiZhi, DiZhi> = {
    '子': '午', '午': '子', '丑': '未', '未': '丑',
    '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
  };
  if (chongMap[liuNian.zhi] === pillars.year.zhi) {
    events.push('沖太歲');
  }

  // 特殊年齡節點
  const milestones: Record<number, string> = {
    18: '成年',
    22: '大學畢業',
    30: '而立之年',
    40: '不惑之年',
    50: '知命之年',
    60: '耳順之年',
    70: '古稀之年',
    80: '傘壽之年',
    90: '卒壽之年'
  };
  if (milestones[age]) {
    events.push(milestones[age]);
  }

  return events;
}

// ============ 十年總結 ============

/**
 * 生成十年總結
 */
function generateDecadeSummary(daYun: DaYunInfo, years: TimelineYear[]): string {
  const goodYears = years.filter(y =>
    y.fortune.overall === 'excellent' || y.fortune.overall === 'good'
  ).length;
  const badYears = years.filter(y =>
    y.fortune.overall === 'caution' || y.fortune.overall === 'challenging'
  ).length;

  let summary = `${daYun.ganZhi}大運（${daYun.ganShiShen}/${daYun.zhiShiShen}）`;

  if (goodYears >= 6) {
    summary += '，整體運勢佳，可積極發展';
  } else if (badYears >= 6) {
    summary += '，挑戰較多，宜穩健保守';
  } else {
    summary += '，有起有伏，平穩度過';
  }

  return summary;
}

// ============ 重要時間點 ============

/**
 * 找出重要時間點
 */
function findHighlights(
  decades: TimelineDecade[],
  stages: LifeStageAnalysis
): TimelineHighlight[] {
  const highlights: TimelineHighlight[] = [];

  // 從大運轉折點提取
  for (const tp of stages.keyTurningPoints.slice(0, 8)) {
    highlights.push({
      year: tp.year,
      age: tp.age,
      type: tp.type === 'opportunity' ? 'peak' :
            tp.type === 'challenge' ? 'valley' : 'turning',
      title: `${tp.daYun.ganZhi}運開始`,
      description: tp.description
    });
  }

  // 找出最好和最差的年份
  const allYears = decades.flatMap(d => d.years);
  const sorted = [...allYears].sort((a, b) => {
    const scoreA = a.fortune.overall === 'excellent' ? 5 :
                   a.fortune.overall === 'good' ? 4 :
                   a.fortune.overall === 'neutral' ? 3 :
                   a.fortune.overall === 'caution' ? 2 : 1;
    const scoreB = b.fortune.overall === 'excellent' ? 5 :
                   b.fortune.overall === 'good' ? 4 :
                   b.fortune.overall === 'neutral' ? 3 :
                   b.fortune.overall === 'caution' ? 2 : 1;
    return scoreB - scoreA;
  });

  // 最佳年份
  if (sorted.length > 0) {
    const best = sorted[0];
    highlights.push({
      year: best.year,
      age: best.age,
      type: 'peak',
      title: '運勢高峰',
      description: `${best.year}年（${best.age}歲）為運勢高峰期`
    });
  }

  // 需注意年份
  if (sorted.length > 1) {
    const worst = sorted[sorted.length - 1];
    highlights.push({
      year: worst.year,
      age: worst.age,
      type: 'valley',
      title: '需謹慎之年',
      description: `${worst.year}年（${worst.age}歲）需多加注意`
    });
  }

  return highlights.sort((a, b) => a.age - b.age);
}

// ============ 統計計算 ============

/**
 * 計算統計數據
 */
function calculateStatistics(
  decades: TimelineDecade[],
  daYunList: DaYunInfo[]
): TimelineStatistics {
  const totalYears = decades.reduce((sum, d) => sum + d.years.length, 0);

  // 計算五行分佈
  const wuXingDistribution: Record<WuXing, number> = {
    '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
  };
  for (const dy of daYunList) {
    wuXingDistribution[dy.ganWuXing] += 10;  // 每個大運10年
    wuXingDistribution[dy.zhiWuXing] += 10;
  }

  // 計算十神分佈
  const shiShenDistribution: Record<ShiShen, number> = {
    '比肩': 0, '劫財': 0, '食神': 0, '傷官': 0,
    '偏財': 0, '正財': 0, '七殺': 0, '正官': 0,
    '偏印': 0, '正印': 0
  };
  for (const dy of daYunList) {
    shiShenDistribution[dy.ganShiShen] += 10;
    shiShenDistribution[dy.zhiShiShen] += 10;
  }

  // 找出最佳和最具挑戰的大運
  const decadeScores = decades.map(d => {
    const goodCount = d.years.filter(y =>
      y.fortune.overall === 'excellent' || y.fortune.overall === 'good'
    ).length;
    return { startAge: d.startAge, score: goodCount, daYun: d.daYun };
  });

  const sortedDecades = [...decadeScores].sort((a, b) => b.score - a.score);

  const bestDecade = sortedDecades[0]
    ? { startAge: sortedDecades[0].startAge, reason: `${sortedDecades[0].daYun.ganZhi}運，吉年較多` }
    : { startAge: 0, reason: '無' };

  const challengingDecade = sortedDecades[sortedDecades.length - 1]
    ? { startAge: sortedDecades[sortedDecades.length - 1].startAge, reason: `${sortedDecades[sortedDecades.length - 1].daYun.ganZhi}運，挑戰較多` }
    : { startAge: 0, reason: '無' };

  return {
    totalYears,
    bestDecade,
    challengingDecade,
    wuXingDistribution,
    shiShenDistribution
  };
}

// ============ 便捷函數 ============

/**
 * 獲取特定年份的詳細資訊（含流月）
 */
export function getYearDetail(
  timeline: TimelineData,
  targetYear: number
): TimelineYear | null {
  for (const decade of timeline.decades) {
    const found = decade.years.find(y => y.year === targetYear);
    if (found) {
      // 載入流月資訊
      found.liuYue = calculateLiuYueList(targetYear, timeline.dayMaster.gan);
      return found;
    }
  }
  return null;
}

/**
 * 獲取特定年齡範圍的時間軸
 */
export function getTimelineRange(
  timeline: TimelineData,
  startAge: number,
  endAge: number
): TimelineYear[] {
  const years: TimelineYear[] = [];
  for (const decade of timeline.decades) {
    for (const year of decade.years) {
      if (year.age >= startAge && year.age <= endAge) {
        years.push(year);
      }
    }
  }
  return years;
}

/**
 * 生成簡化的時間軸（用於前端圖表）
 */
export function generateSimpleTimeline(
  timeline: TimelineData
): {
  labels: string[];           // 年份標籤
  fortuneScores: number[];    // 運勢分數 0-100
  decadeMarkers: number[];    // 大運交接位置
  stageColors: string[];      // 人生階段顏色
} {
  const labels: string[] = [];
  const fortuneScores: number[] = [];
  const decadeMarkers: number[] = [];
  const stageColors: string[] = [];

  let index = 0;
  for (const decade of timeline.decades) {
    decadeMarkers.push(index);

    for (const year of decade.years) {
      labels.push(`${year.year}`);

      // 將運勢轉為分數
      const score = year.fortune.overall === 'excellent' ? 100 :
                    year.fortune.overall === 'good' ? 75 :
                    year.fortune.overall === 'neutral' ? 50 :
                    year.fortune.overall === 'caution' ? 30 : 10;
      fortuneScores.push(score);

      // 階段顏色
      const stageType = decade.stage?.type || 'growth';
      const colorMap: Record<string, string> = {
        'growth': '#90EE90',     // 淺綠
        'learning': '#87CEEB',   // 天藍
        'striving': '#FFD700',   // 金色
        'harvesting': '#FFA500', // 橙色
        'wisdom': '#DDA0DD',     // 紫羅蘭
        'retirement': '#F0E68C'  // 卡其
      };
      stageColors.push(colorMap[stageType]);

      index++;
    }
  }

  return { labels, fortuneScores, decadeMarkers, stageColors };
}

/**
 * 生成時間軸報告（文字格式）
 */
export function generateTimelineReport(timeline: TimelineData): string {
  let report = '╔════════════════════════════════════╗\n';
  report += '║         人 生 時 間 軸             ║\n';
  report += '╚════════════════════════════════════╝\n\n';

  report += `【基本資訊】\n`;
  report += `日主：${timeline.dayMaster.gan}（${timeline.dayMaster.wuXing}）\n\n`;

  report += `【大運總覽】\n`;
  for (const decade of timeline.decades.slice(0, 8)) {
    report += `${decade.startAge}-${decade.endAge}歲 ${decade.daYun.ganZhi}`;
    report += ` (${decade.daYun.ganShiShen}/${decade.daYun.zhiShiShen})`;
    if (decade.stage) {
      report += ` [${decade.stage.name}]`;
    }
    report += '\n';
  }
  report += '\n';

  report += `【運勢高峰】\n`;
  const peaks = timeline.highlights.filter(h => h.type === 'peak').slice(0, 3);
  for (const peak of peaks) {
    report += `  ★ ${peak.age}歲（${peak.year}年）：${peak.description}\n`;
  }
  report += '\n';

  report += `【需注意時期】\n`;
  const valleys = timeline.highlights.filter(h => h.type === 'valley').slice(0, 3);
  for (const valley of valleys) {
    report += `  ⚠ ${valley.age}歲（${valley.year}年）：${valley.description}\n`;
  }
  report += '\n';

  report += `【統計】\n`;
  report += `最佳大運：${timeline.statistics.bestDecade.startAge}歲起 - ${timeline.statistics.bestDecade.reason}\n`;
  report += `挑戰大運：${timeline.statistics.challengingDecade.startAge}歲起 - ${timeline.statistics.challengingDecade.reason}\n`;

  return report;
}
