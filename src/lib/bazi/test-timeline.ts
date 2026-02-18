/**
 * 時間軸和大運功能測試
 */

// @ts-nocheck
import {
  calculateBazi,
  generateTimeline,
  analyzeLifeStages,
  generateLifeStageReport,
  generateDaYunReport,
  calculateStartAgeDetail,
  calculateLiuYueList,
  generateTimelineReport
} from './index';

// 測試用例：1990年1月15日 12:00 男
const testInput = {
  year: 1990,
  month: 1,
  day: 15,
  hour: 12,
  minute: 0,
  gender: 'male' as const
};

console.log('='.repeat(60));
console.log('八字大運時間軸測試');
console.log('='.repeat(60));

// 1. 計算八字
console.log('\n【1. 八字計算】');
const bazi = calculateBazi(testInput);
console.log(`四柱：${bazi.fourPillars.year.ganZhi} ${bazi.fourPillars.month.ganZhi} ${bazi.fourPillars.day.ganZhi} ${bazi.fourPillars.hour.ganZhi}`);
console.log(`日主：${bazi.dayMaster.gan}（${bazi.dayMaster.wuXing}）`);

// 2. 起運詳情
console.log('\n【2. 起運詳情】');
const startDetail = calculateStartAgeDetail(
  testInput.year, testInput.month, testInput.day,
  testInput.hour, testInput.minute, testInput.gender
);
console.log(`起運年齡：${startDetail.startAge}歲`);
console.log(`起運時間：${startDetail.startYear}年${startDetail.startMonth}月${startDetail.startDay}日`);
console.log(`大運方向：${startDetail.direction === 'forward' ? '順行' : '逆行'}`);
console.log(`說明：${startDetail.explanation}`);

// 3. 大運報告
console.log('\n【3. 大運報告】');
console.log(generateDaYunReport(bazi.daYun.list, bazi.daYun.direction, bazi.daYun.startAge));

// 4. 人生階段分析
console.log('\n【4. 人生階段分析】');
const stagesAnalysis = analyzeLifeStages(
  bazi.daYun.list,
  bazi.dayMaster.gan,
  testInput.gender,
  testInput.year,
  35  // 假設當前35歲
);
console.log(generateLifeStageReport(stagesAnalysis));

// 5. 時間軸生成
console.log('\n【5. 時間軸總覽】');
const timeline = generateTimeline(bazi, 80);
console.log(generateTimelineReport(timeline));

// 6. 流月計算（測試2026年）
console.log('\n【6. 2026年流月】');
const liuYue2026 = calculateLiuYueList(2026, bazi.dayMaster.gan);
for (const ly of liuYue2026.slice(0, 6)) {
  console.log(`  ${ly.month}月 ${ly.ganZhi}（${ly.ganShiShen}/${ly.zhiShiShen}）`);
}
console.log('  ...');

// 7. 特定年份詳情
console.log('\n【7. 2026年詳情】');
const year2026 = timeline.decades
  .flatMap(d => d.years)
  .find(y => y.year === 2026);

if (year2026) {
  console.log(`年齡：${year2026.age}歲`);
  console.log(`流年：${year2026.liuNian.ganZhi}（${year2026.liuNian.ganShiShen}）`);
  console.log(`大運：${year2026.daYun?.ganZhi}（${year2026.daYun?.ganShiShen}）`);
  console.log(`整體運勢：${year2026.fortune.overall}`);
  console.log(`關鍵詞：${year2026.fortune.keywords.join('、')}`);
  console.log(`建議：${year2026.fortune.advice}`);
}

console.log('\n' + '='.repeat(60));
console.log('測試完成！');
console.log('='.repeat(60));
