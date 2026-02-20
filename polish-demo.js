const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

// 模擬從資料庫查出來的「草稿」內容
const draftContent = `
## ☯️ 命格總論

此命太陽化祿坐命宮，天生具領袖氣質，光明磊落，別人會被你吸引。
破軍同宮，不甘平凡，勇於創新變革，總想打破現狀。
福德宮紫微天府雙星，內心有帝王格局，自我期許極高。

八字庚金日主，性格剛強果斷。生於巳月火旺，七殺當令。
比劫成群（庚庚辛辛），競爭意識強烈，不服輸。

整體格局：外在競爭激烈，內在格局極高。

---

## 🎭 性格分析

【八字觀點】
庚金日主屬陽金，如刀劍之金，剛強鋒利。
生於巳月丙火七殺當令，殺旺攻身。
四柱比劫林立（年庚、月辛、時辛），群雄爭霸格局。
無水洩秀，容易剛強過頭，與人衝突。

【紫微觀點】
命宮太陽化祿，主名聲威望，領袖氣質天生。
破軍同宮，主變革創新，不走尋常路。
福德宮紫微天府廟旺，內心深處是帝王，格局視野極高。

【綜合】此人外顯競爭鋒芒，內藏帝王氣度。

---

## 💼 事業財運

【八字觀點】
庚金配丙火七殺，適合軍警武職、金屬機械、競爭性行業。
比劫成群可合夥，但注意分配。
目前甲申大運，有升職機會但競爭激烈。

【紫微觀點】
官祿宮貪狼地劫，事業先破後立，多才多藝但起伏大。
財帛宮天梁鈴星，對錢態度瀟灑，不為小錢委屈。

適合：軍警、金融、房地產、機械、創新科技。
`;

async function polishDemo() {
  console.log('=== 📝 草稿內容（模擬從資料庫組裝）===\n');
  console.log(draftContent);
  console.log('\n=== 🤖 發送給 AI 潤飾中... ===\n');
  
  const startTime = Date.now();
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `你是資深命理師。以下是命盤解讀的草稿，請潤飾成流暢自然的文章。

規則：
1. 保留所有資訊，不要刪減內容
2. 調整語句讓段落之間更連貫
3. 加入適當的語氣詞讓文字更有溫度
4. 每個章節結尾加一句「命理師金句」（用引號包起來）
5. 不要增加草稿沒有的命理內容

【草稿】
${draftContent}

請輸出潤飾後的版本：`
    }]
  });
  
  const elapsed = Date.now() - startTime;
  
  console.log('=== ✨ 潤飾後結果 ===\n');
  console.log(response.content[0].text);
  
  console.log('\n\n========================================');
  console.log('📊 Token 使用統計');
  console.log('========================================');
  console.log('輸入 tokens:', response.usage.input_tokens);
  console.log('輸出 tokens:', response.usage.output_tokens);
  console.log('總 tokens:', response.usage.input_tokens + response.usage.output_tokens);
  console.log('耗時:', elapsed, 'ms');
  
  // 估算成本 (Sonnet 4: $3/M input, $15/M output)
  const inputCost = (response.usage.input_tokens / 1000000) * 3;
  const outputCost = (response.usage.output_tokens / 1000000) * 15;
  console.log('估算成本: $' + (inputCost + outputCost).toFixed(4));
  console.log('========================================');
}

polishDemo().catch(console.error);
