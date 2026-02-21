# 部署教學

本文件說明如何將「好運大師」部署到 Vercel。

---

## 前置準備

### 1. 註冊帳號
- [Vercel](https://vercel.com) — 網站託管（免費方案可用）
- [Anthropic](https://console.anthropic.com) — AI API（需儲值）

### 2. 取得 Anthropic API Key
1. 前往 [Anthropic Console](https://console.anthropic.com)
2. 註冊/登入帳號
3. 點擊「API Keys」
4. 點擊「Create Key」
5. 複製 API Key（格式：`sk-ant-api03-...`）
6. **儲值**：建議先儲值 $10-20 美元測試

---

## 部署步驟

### Step 1：取得源碼

**方式 A：GitHub（推薦）**
```bash
# 將源碼 fork 或上傳到你的 GitHub
```

**方式 B：上傳 zip**
- 將源碼解壓縮後上傳到你的 GitHub repo

### Step 2：連結 Vercel

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊「Add New Project」
3. 選擇「Import Git Repository」
4. 授權並選擇你的 repo
5. 點擊「Import」

### Step 3：設定環境變數

在 Vercel 部署頁面：
1. 展開「Environment Variables」
2. 新增以下變數：

| 變數名稱 | 值 | 說明 |
|----------|-----|------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Anthropic API Key |

### Step 4：部署

1. 點擊「Deploy」
2. 等待 1-2 分鐘
3. 完成！點擊產生的網址即可訪問

---

## 自訂網域（選用）

1. 在 Vercel Dashboard 點擊你的專案
2. 前往「Settings」→「Domains」
3. 輸入你的網域（如 `fortune.example.com`）
4. 依照指示設定 DNS

---

## 常見問題

### Q: 部署失敗怎麼辦？
A: 檢查 Vercel 的 Build Logs，常見原因：
- 環境變數沒設定
- API Key 格式錯誤

### Q: AI 解讀沒反應？
A: 檢查：
- Anthropic 帳戶是否有餘額
- API Key 是否正確

### Q: 如何更新網站？
A: 推送到 GitHub，Vercel 會自動重新部署

---

*文件版本：v1.0 | 最後更新：2026-02-21*
