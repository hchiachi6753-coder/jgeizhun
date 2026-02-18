# J給準 - 軟體設計規格書 (SDD)

> Software Design Document
> 
> 版本：1.0
> 更新日期：2026-02-18
> 作者：JJ & J1

---

## 1. 系統架構

### 1.1 整體架構

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
├─────────────────────────────────────────────────────┤
│  Pages                                               │
│  ├── /           Landing Page                        │
│  ├── /ziwei      紫微輸入頁                          │
│  ├── /ziwei/result  紫微命盤結果                     │
│  ├── /bazi       八字輸入頁                          │
│  └── /bazi/result   八字結果                         │
├─────────────────────────────────────────────────────┤
│  Libraries                                           │
│  ├── /lib/ziwei/    紫微計算引擎                     │
│  ├── /lib/bazi/     八字計算引擎                     │
│  └── /lib/lunar/    農曆轉換                         │
├─────────────────────────────────────────────────────┤
│  Components                                          │
│  ├── ZiweiChart.tsx    十二宮格命盤                  │
│  ├── JourneyMap.tsx    人生旅程圖                    │
│  └── StarBadge.tsx     星曜標籤                      │
└─────────────────────────────────────────────────────┘
```

### 1.2 目錄結構

```
jgeizhun/
├── docs/
│   ├── PRD.md           產品需求規格
│   ├── SDD.md           軟體設計規格（本文件）
│   └── ALGORITHM.md     算法詳細說明
├── src/
│   ├── app/             Next.js App Router
│   ├── components/      React 組件
│   └── lib/
│       ├── ziwei/       紫微斗數引擎
│       │   ├── index.ts       主入口
│       │   ├── constants.ts   常數定義
│       │   ├── gong.ts        宮位計算
│       │   ├── wuxing.ts      五行局計算
│       │   ├── stars.ts       星曜安置
│       │   ├── sihua.ts       四化計算
│       │   ├── minorStars.ts  雜曜計算
│       │   ├── daxian.ts      大限計算
│       │   ├── liunian.ts     流年計算
│       │   └── liuyue.ts      流月計算
│       └── bazi/        八字引擎
│           ├── calculator.ts  主計算
│           ├── pillars.ts     四柱計算
│           ├── dayun.ts       大運計算
│           └── timeline.ts    時間軸
├── knowledge-base/      RAG 知識庫
└── public/              靜態資源
```

---

## 2. 核心模組設計

### 2.1 紫微計算引擎 (`/lib/ziwei/`)

#### 2.1.1 主流程

```typescript
function calculateZiweiChart(input: {
  year: number;      // 西曆年
  month: number;     // 西曆月
  day: number;       // 西曆日
  hour: number;      // 時辰 (0-23)
  gender: 'male' | 'female';
}): ZiweiChart {
  // 1. 西曆轉農曆
  const lunar = solarToLunar(year, month, day);
  
  // 2. 計算命宮位置
  const mingGong = calculateMingGong(lunar.month, hourIndex);
  
  // 3. 計算五行局
  const juNum = calculateWuxingJu(mingGong, lunar.yearGan);
  
  // 4. 計算紫微星位置
  const ziweiPos = getZiweiPosition(juNum, lunar.day);
  
  // 5. 安紫微星系
  const ziweiStars = calculateZiweiStars(ziweiPos);
  
  // 6. 安天府星系
  const tianfuStars = calculateTianfuStars(ziweiPos);
  
  // 7. 安輔煞星
  const auxStars = calculateAuxiliaryStars(lunar, hourIndex);
  
  // 8. 計算四化
  const sihua = calculateSihua(lunar.yearGan);
  
  // 9. 組裝十二宮
  return assembleChart(...);
}
```

#### 2.1.2 關鍵函數

| 函數 | 檔案 | 說明 |
|------|------|------|
| `calculateMingGong()` | gong.ts | 計算命宮地支位置 |
| `calculateWuxingJu()` | wuxing.ts | 計算五行局數 |
| `getZiweiPosition()` | stars.ts | 計算紫微星位置 |
| `calculateZiweiStars()` | stars.ts | 安紫微星系六顆星 |
| `calculateTianfuStars()` | stars.ts | 安天府星系八顆星 |
| `calculateSihua()` | sihua.ts | 計算祿權科忌四化 |

### 2.2 常數定義 (`constants.ts`)

```typescript
// 天干
export const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];

// 地支
export const DI_ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 五行局
export type JuNum = 2 | 3 | 4 | 5 | 6;
export const JU_NAMES: Record<JuNum, string> = {
  2: '水二局',
  3: '木三局',
  4: '金四局',
  5: '土五局',
  6: '火六局',
};

// 十二宮名稱
export const GONG_NAMES = [
  '命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄',
  '遷移', '交友', '官祿', '田宅', '福德', '父母'
];

// 十四主星
export const MAIN_STARS = [
  '紫微', '天機', '太陽', '武曲', '天同', '廉貞',  // 紫微星系
  '天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'  // 天府星系
];
```

---

## 3. 資料結構

### 3.1 命盤資料結構

```typescript
interface ZiweiChart {
  // 基本資訊
  lunar: {
    year: number;
    month: number;
    day: number;
    yearGanZhi: string;  // 例：甲寅
    monthGanZhi: string;
    dayGanZhi: string;
    hourGanZhi: string;
  };
  
  // 命盤資訊
  mingGong: number;      // 命宮地支索引
  shenGong: number;      // 身宮地支索引
  juNum: JuNum;          // 五行局數
  gender: 'male' | 'female';
  
  // 十二宮
  palaces: GongInfo[];
  
  // 四化
  sihua: {
    lu: string;    // 化祿星名
    quan: string;  // 化權星名
    ke: string;    // 化科星名
    ji: string;    // 化忌星名
  };
  
  // 起運資訊
  qiyunAge: number;
  qiyunDirection: 'clockwise' | 'counterclockwise';
}

interface GongInfo {
  name: string;           // 宮位名稱
  position: number;       // 地支索引 (0-11)
  ganZhi: string;         // 宮位干支
  mainStars: StarInfo[];  // 主星
  auxStars: StarInfo[];   // 輔星
  minorStars: string[];   // 雜曜
  isMing: boolean;        // 是否為命宮
  isShen: boolean;        // 是否為身宮
  daxianRange: [number, number];  // 大限年齡範圍
}

interface StarInfo {
  name: string;           // 星名
  brightness?: string;    // 亮度（廟旺得利平不陷）
  sihua?: 'lu' | 'quan' | 'ke' | 'ji';  // 四化
}
```

---

## 4. 外部依賴

### 4.1 NPM 套件

| 套件 | 版本 | 用途 |
|------|------|------|
| next | 16.x | React 框架 |
| react | 19.x | UI 庫 |
| tailwindcss | 4.x | CSS 框架 |
| lunar-javascript | 1.x | 農曆轉換 |

### 4.2 外部服務

| 服務 | 用途 |
|------|------|
| Vercel | 部署與託管 |
| Claude API | AI 解讀（Phase 2） |

---

## 5. 錯誤處理

### 5.1 輸入驗證

```typescript
function validateInput(input: ZiweiInput): ValidationResult {
  // 日期範圍檢查
  if (year < 1900 || year > 2100) {
    return { valid: false, error: '年份超出範圍' };
  }
  
  // 時辰檢查
  if (hour < 0 || hour > 23) {
    return { valid: false, error: '時辰無效' };
  }
  
  // 農曆轉換檢查
  const lunar = solarToLunar(year, month, day);
  if (!lunar) {
    return { valid: false, error: '無法轉換農曆' };
  }
  
  return { valid: true };
}
```

---

## 6. 測試案例

### 6.1 驗證用測試案例

| 案例 | 輸入 | 預期結果 |
|------|------|----------|
| 案例 A | 1985/8/6 申時 男 | 命宮丁亥、土五局、天府在命宮 |
| 案例 B | 1974/4/19 未時 女 | 命宮癸酉、金四局、太陰在命宮 |

### 6.2 驗證標準

所有計算結果須與「科技紫微網」(https://ziwei.com.tw) 一致。

---

## 7. 相關文件

- [PRD.md](./PRD.md) - 產品需求規格
- [ALGORITHM.md](./ALGORITHM.md) - 算法詳細說明
