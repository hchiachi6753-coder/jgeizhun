# 好運大師 🔮

融合千年古籍智慧的 AI 命理平台

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## ✨ 功能特色

- 🎴 **八字命理** — 四柱排盤 + AI 深度解讀
- ⭐ **紫微斗數** — 十二宮排盤 + 流年運勢
- ☯️ **綜合解命** — 八字+紫微雙系統合參
- ☰ **易經占卜** — 搖卦 + 六爻解讀
- 🧭 **居家風水** — AR 羅盤 + 空間導覽
- 💬 **追問功能** — 針對命盤深入提問
- 🪷 **五行分析** — 能量分布視覺化
- 📈 **流年曲線** — 運勢走勢圖

---

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 設定環境變數
```bash
cp .env.example .env.local
# 編輯 .env.local，填入你的 Anthropic API Key
```

### 3. 啟動開發伺服器
```bash
npm run dev
```

### 4. 打開瀏覽器
訪問 http://localhost:3000

---

## 📦 部署

詳見 [部署教學](docs/DEPLOYMENT.md)

---

## 🎨 自訂品牌

只需修改 `src/config/site.ts` 即可換成你的品牌。

詳見 [換品牌教學](docs/BRANDING.md)

---

## 📁 專案結構

```
├── src/
│   ├── app/              # Next.js 頁面
│   ├── components/       # React 元件
│   ├── config/
│   │   └── site.ts       # ⭐ 品牌設定檔
│   └── lib/
│       ├── bazi/         # 八字排盤邏輯
│       ├── ziwei/        # 紫微排盤邏輯
│       └── yijing/       # 易經卦象邏輯
├── docs/                 # 文件
├── public/               # 靜態資源
└── .env.example          # 環境變數範本
```

---

## 🔧 技術架構

- **框架**：Next.js 16 + React 19
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **AI**：Claude Sonnet 4 (Anthropic)
- **部署**：Vercel

---

## 📄 授權

本專案為商業授權軟體，未經授權不得複製或分發。

---

## 📞 聯絡

如需購買授權或技術支援，請聯繫：
- Email: [待填寫]

---

*版本：v1.0.0 | 最後更新：2026-02-21*
