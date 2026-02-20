// 生成 PWA 圖示的腳本
// 執行: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// 創建 SVG 圖示
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#4c1d95"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24"/>
      <stop offset="100%" style="stop-color:#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <text x="50%" y="55%" font-size="${size * 0.5}" text-anchor="middle" dominant-baseline="middle" fill="url(#gold)" font-family="serif" font-weight="bold">運</text>
</svg>`;

// 寫入 SVG 檔案（可以之後轉換成 PNG）
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 192x192
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), createSVG(192));
console.log('Created icon-192.svg');

// 512x512  
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), createSVG(512));
console.log('Created icon-512.svg');

console.log('\\n⚠️  SVG 已建立！請用工具轉換成 PNG：');
console.log('   可以用 https://svgtopng.com/ 或 Figma 轉換');
