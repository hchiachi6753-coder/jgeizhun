#!/usr/bin/env python3
"""
算命古書知識庫處理腳本
將 OCR 好的古書文字整理成結構化的 JSON 知識庫
"""
import os
import re
import json
from pathlib import Path

SOURCE_DIR = Path.home() / "Documents/算命書/文字檔"
OUTPUT_DIR = Path.home() / "Projects/jgeizhun/knowledge-base"

# 書籍配置
BOOKS = {
    "八字": {
        "子平真詮": {
            "file": "八字/子平真詮.txt",
            "author": "沈孝瞻",
            "dynasty": "清",
            "quality": 5,
            "chapter_pattern": r"^第(\d+)章\s+(.+)$"
        },
        "窮通寶鑑": {
            "file": "八字/窮通寶鑑.txt",
            "author": "余春台",
            "dynasty": "清",
            "quality": 5,
            "chapter_pattern": r"^第(\w+)部[：:]\s*(.+)$|^(\d+\.\d+)\s+(.+)$"
        },
        "淵海子平": {
            "file": "八字/淵海子平.txt",
            "author": "徐子平",
            "dynasty": "宋",
            "quality": 5,
            "chapter_pattern": r"^(\w+)[、.]\s*(.+)$"
        },
        "三命通會": {
            "file": "八字/三命通會.txt",
            "author": "萬民英",
            "dynasty": "明",
            "quality": 5,
            "chapter_pattern": r"^第(\d+)章\s+(.+)$"
        },
        "千里命稿": {
            "file": "八字/千里命稿.txt",
            "author": "韋千里",
            "dynasty": "民國",
            "quality": 5,
            "chapter_pattern": r"^(\w+)[、.]\s*(.+)$"
        },
        "八字命理學進階教程": {
            "file": "八字/八字命理學進階教程.txt",
            "author": "陸致極",
            "dynasty": "現代",
            "quality": 5,
            "chapter_pattern": r"^(序\w+|第\w+章)\s*(.*)$"
        },
        "滴天髓補注": {
            "file": "八字/滴天髓補注.txt",
            "author": "任鐵樵",
            "dynasty": "清",
            "quality": 3,
            "chapter_pattern": None
        }
    },
    "紫微": {
        "紫微四化": {
            "file": "紫微/紫微四化.txt",
            "author": "不詳",
            "dynasty": "現代",
            "quality": 5,
            "chapter_pattern": r"^第(\w+)章\s+(.+)$|^第(\w+)節\s+(.+)$"
        },
        "紫微探源": {
            "file": "紫微/紫微探源.txt",
            "author": "不詳",
            "dynasty": "現代",
            "quality": 5,
            "chapter_pattern": r"^第(\w+)篇\s+(.+)$|^第(\w+)章\s+(.+)$"
        }
    },
    "易經": {
        "傅佩榮易經入門課": {
            "file": "八字/傅佩榮易經入門課.txt",
            "author": "傅佩榮",
            "dynasty": "現代",
            "quality": 5,
            "chapter_pattern": r"^(卷\w+|[一二三四五六七八九十]+[、.])\s*(.+)$"
        },
        "梅花易數": {
            "file": "八字/梅花易數.txt",
            "author": "邵康節",
            "dynasty": "宋（現代解析）",
            "quality": 5,
            "chapter_pattern": r"^第(\w+)部分[：:]\s*(.+)$|^(\d+\.\d+)\s+(.+)$"
        },
        "易經雜說": {
            "file": "八字/易經雜說.txt",
            "author": "南懷瑾",
            "dynasty": "現代",
            "quality": 5,
            "chapter_pattern": None
        },
        "卜筮正宗": {
            "file": "八字/卜筮正宗.txt",
            "author": "王洪緒",
            "dynasty": "清",
            "quality": 4,
            "chapter_pattern": None
        }
    }
}

def clean_ocr_text(text):
    """清理 OCR 常見錯誤"""
    # 移除常見的 OCR 亂碼符號
    text = re.sub(r'[﹐﹒﹔﹕﹖﹗﹛﹜﹝﹞﹟﹠﹡﹢﹣﹤﹥﹦﹨﹩﹪﹫]', '', text)
    # 移除不可打印字符
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    # 標準化空白
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # 修正常見 OCR 錯誤
    text = text.replace('輿', '與')
    text = text.replace('於', '于')  # 有些地方需要保留
    return text.strip()

def split_into_sections(text, pattern):
    """將文本按章節分段"""
    if not pattern:
        # 沒有章節模式，用段落分割
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        sections = []
        current_section = {"title": "全文", "content": []}
        for p in paragraphs:
            if len(p) > 50:  # 有意義的段落
                current_section["content"].append(p)
        if current_section["content"]:
            sections.append(current_section)
        return sections
    
    sections = []
    current_section = None
    current_content = []
    
    for line in text.split('\n'):
        match = re.match(pattern, line.strip(), re.MULTILINE)
        if match:
            # 保存前一個章節
            if current_section:
                current_section["content"] = '\n'.join(current_content).strip()
                if current_section["content"]:
                    sections.append(current_section)
            
            # 開始新章節
            groups = [g for g in match.groups() if g]
            chapter_num = groups[0] if groups else ""
            chapter_title = groups[1] if len(groups) > 1 else groups[0]
            
            current_section = {
                "chapter": chapter_num,
                "title": chapter_title.strip()
            }
            current_content = []
        else:
            current_content.append(line)
    
    # 保存最後一個章節
    if current_section:
        current_section["content"] = '\n'.join(current_content).strip()
        if current_section["content"]:
            sections.append(current_section)
    
    return sections

def extract_keywords(text):
    """從文本中提取關鍵詞"""
    keywords = set()
    
    # 八字相關
    bazi_terms = [
        "天干", "地支", "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸",
        "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
        "陰陽", "五行", "金", "木", "水", "火", "土",
        "相生", "相剋", "生克", "生剋",
        "印綬", "比肩", "劫財", "食神", "傷官", "偏財", "正財", "偏官", "正官", "七殺",
        "格局", "用神", "喜神", "忌神",
        "長生", "沐浴", "冠帶", "臨官", "帝旺", "衰", "病", "死", "墓", "絕", "胎", "養",
        "日主", "月令", "調候", "大運", "流年"
    ]
    
    # 紫微相關
    ziwei_terms = [
        "紫微", "天府", "太陽", "太陰", "武曲", "天同", "廉貞", "天機",
        "貪狼", "巨門", "天相", "天梁", "七殺", "破軍",
        "文昌", "文曲", "左輔", "右弼", "天魁", "天鉞",
        "祿存", "天馬", "擎羊", "陀羅", "火星", "鈴星",
        "化祿", "化權", "化科", "化忌", "四化",
        "命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮",
        "遷移宮", "交友宮", "事業宮", "田宅宮", "福德宮", "父母宮"
    ]
    
    # 易經相關
    yijing_terms = [
        "太極", "兩儀", "四象", "八卦",
        "乾", "坤", "震", "巽", "坎", "離", "艮", "兌",
        "六十四卦", "爻", "卦辭", "爻辭",
        "體用", "動爻", "變卦"
    ]
    
    all_terms = bazi_terms + ziwei_terms + yijing_terms
    for term in all_terms:
        if term in text:
            keywords.add(term)
    
    return list(keywords)[:20]  # 最多返回20個關鍵詞

def process_book(category, book_name, config):
    """處理單本書籍"""
    file_path = SOURCE_DIR / config["file"]
    if not file_path.exists():
        print(f"  ⚠️ 找不到檔案: {file_path}")
        return []
    
    print(f"  📖 處理: {book_name}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # 清理 OCR 文本
    text = clean_ocr_text(text)
    
    # 分段
    sections = split_into_sections(text, config.get("chapter_pattern"))
    
    # 生成知識庫條目
    entries = []
    for i, section in enumerate(sections):
        entry_id = f"{book_name.replace(' ', '_')}_{i+1:03d}"
        
        content = section.get("content", "")
        if isinstance(content, list):
            content = '\n\n'.join(content)
        
        # 跳過太短的內容
        if len(content) < 100:
            continue
        
        entry = {
            "id": entry_id,
            "source": book_name,
            "category": category,
            "chapter": section.get("chapter", str(i+1)),
            "title": section.get("title", f"第{i+1}節"),
            "content": content,
            "keywords": extract_keywords(content),
            "metadata": {
                "author": config.get("author", "不詳"),
                "dynasty": config.get("dynasty", "不詳"),
                "quality": config.get("quality", 3)
            }
        }
        entries.append(entry)
    
    print(f"    ✅ 提取 {len(entries)} 個章節")
    return entries

def save_markdown(entry, output_dir):
    """儲存為 Markdown 格式"""
    book_dir = output_dir / entry["category"] / entry["source"].replace(" ", "_")
    book_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"{entry['chapter']}_{entry['title'][:20]}.md"
    # 移除檔名中的非法字符
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    filepath = book_dir / filename
    
    content = f"""---
source: {entry["source"]}
chapter: {entry["chapter"]}
title: {entry["title"]}
category: {entry["category"]}
author: {entry["metadata"]["author"]}
dynasty: {entry["metadata"]["dynasty"]}
keywords: {entry["keywords"]}
---

# {entry["title"]}

{entry["content"]}
"""
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    print("🚀 開始處理算命古書知識庫...\n")
    
    all_entries = []
    
    for category, books in BOOKS.items():
        print(f"\n📚 處理類別: {category}")
        for book_name, config in books.items():
            entries = process_book(category, book_name, config)
            all_entries.extend(entries)
            
            # 儲存 Markdown
            for entry in entries:
                save_markdown(entry, OUTPUT_DIR)
    
    # 儲存 JSON 索引
    index_path = OUTPUT_DIR / "index.json"
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump({
            "version": "1.0",
            "total_entries": len(all_entries),
            "categories": list(BOOKS.keys()),
            "entries": all_entries
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 完成！共處理 {len(all_entries)} 個條目")
    print(f"📁 輸出位置: {OUTPUT_DIR}")
    print(f"📄 索引檔案: {index_path}")

if __name__ == "__main__":
    main()
