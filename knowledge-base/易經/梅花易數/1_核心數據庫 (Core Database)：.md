---
source: 梅花易數
chapter: 1
title: 核心數據庫 (Core Database)：
category: 易經
author: 邵康節
dynasty: 宋（現代解析）
keywords: ["五行", "爻", "爻辭", "八卦", "卦辭"]
---

# 核心數據庫 (Core Database)：

o Gua_Info_Table (卦象信息表)：儲存 64 卦的卦畫、卦名、卦辭、爻辭、五行屬性、宮
位、以及傳統象義（如革卦主變革）等基礎信息。
o Bazi_Correspondence_Table (八卦萬物類象總表)：即報告第一部分構建的關鍵表格 1，
作為自然語言到卦象語言的「翻譯詞典」。
o Gua_Generation_Rules_Table (起卦方法速查表)：即報告第三部分構建的關鍵表格 2，作
為 GPTs 處理用戶輸入、執行起卦算法的規則庫。
