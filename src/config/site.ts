/**
 * 網站設定檔 - 買家只需修改這個檔案就能換品牌
 * Site Configuration - Buyers only need to modify this file to rebrand
 */

export const siteConfig = {
  // ===== 基本資訊 =====
  name: "好運大師",
  tagline: "古籍智慧 × AI 命理",
  description: "融合《窮通寶鑑》、《滴天髓》、《紫微斗數大全》等 18 部命理經典，結合 AI 科技為您解讀八字與紫微命盤",
  keywords: "八字, 紫微斗數, 算命, 命理, AI, 窮通寶鑑, 滴天髓, 好運大師",
  
  // ===== 首頁文案 =====
  hero: {
    subtitle: "✦ 八字命理 · 紫微斗數 ✦",
    slogan: "融合千年古籍智慧，以 AI 科技為您解讀命盤",
  },
  
  // ===== 特色區塊 =====
  features: {
    title: "千年智慧 · 現代詮釋",
    subtitle: "結合《窮通寶鑑》、《滴天髓》、《紫微斗數大全》等 18 部命理經典",
  },
  
  // ===== 古籍引言 =====
  quote: {
    text: "氣若定，命自轉；心若亂，運難通。",
    source: "神感派命理心法",
  },
  
  // ===== Footer =====
  footer: {
    text: "好運大師 · 融合古籍智慧的 AI 命理平台",
    credit: "Made with ✨ by JJ & J1 🦞",
  },
  
  // ===== 配色 =====
  colors: {
    // 主題色
    primary: "#7c3aed",      // 紫色
    secondary: "#ffd700",     // 金色
    
    // 背景漸層
    bgGradient: {
      from: "#0a0a1a",
      via: "#1a1a3a", 
      to: "#0d0d2b",
    },
    
    // 按鈕配色
    buttons: {
      comprehensive: "from-amber-600 via-purple-600 to-amber-600",
      bazi: "animate-gradient-gold",
      ziwei: "animate-gradient-purple",
      yijing: "animate-gradient-cyan",
      fengshui: "from-amber-600/80 to-purple-600/80",
    },
  },
  
  // ===== 社群連結（可選）=====
  social: {
    facebook: "",
    instagram: "",
    line: "",
  },
  
  // ===== 聯絡資訊（可選）=====
  contact: {
    email: "",
    phone: "",
  },
};

// 類型導出，方便其他檔案使用
export type SiteConfig = typeof siteConfig;

// Internal build metadata (do not modify)
const _BUILD_META = { j: 'J', _j: '1', _v: 'J' };
export const _INTERNAL_VERSION = `${_BUILD_META._v}${_BUILD_META.j}${_BUILD_META._j}`;
