#!/usr/bin/env python3
"""
算命古書知識庫處理腳本 v2
改進章節分割邏輯，支援更多格式
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
            "quality": 5
        },
        "窮通寶鑑": {
            "file": "八字/窮通寶鑑.txt",
            "author": "余春台",
            "dynasty": "清",
            "quality": 5
        },
        "淵海子平": {
            "file": "八字/淵海子平.txt",
            "author": "徐子平",
            "dynasty": "宋",
            "quality": 5
        },
        "三命通會": {
            "file": "八字/三命通會.txt",
            "author": "萬民英",
            "dynasty": "明",
            "quality": 5
        },
        "千里命稿": {
            "file": "八字/千里命稿.txt",
            "author": "韋千里",
            "dynasty": "民國",
            "quality": 5
        },
        "八字命理學進階教程": {
            "file": "八字/八字命理學進階教程.txt",
            "author": "陸致極",
            "dynasty": "現代",
            "quality": 5
        }
    },
    "紫微": {
        "紫微四化": {
            "file": "紫微/紫微四化.txt",
            "author": "王文華",
            "dynasty": "現代",
            "quality": 5
        },
        "紫微探源": {
            "file": "紫微/紫微探源.txt",
            "author": "王文華",
            "dynasty": "現代",
            "quality": 5
        }
    },
    "易經": {
        "傅佩榮易經入門課": {
            "file": "八字/傅佩榮易經入門課.txt",
            "author": "傅佩榮",
            "dynasty": "現代",
            "quality": 5
        },
        "梅花易數": {
            "file": "八字/梅花易數.txt",
            "author": "邵康節",
            "dynasty": "宋（現代解析）",
            "quality": 5
        },
        "易經雜說": {
            "file": "八字/易經雜說.txt",
            "author": "南懷瑾",
            "dynasty": "現代",
            "quality": 5
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
    return text.strip()

def smart_split(text, book_name):
    """智能章節分割"""
    sections = []
    
    # 各種章節模式
    patterns = [
        # 第X章 標題
        (r'^(第[一二三四五六七八九十\d]+章)\s*[:：]?\s*(.+?)$', 'chapter'),
        # 第X篇 標題
        (r'^(第[一二三四五六七八九十\d]+篇)\s*[:：]?\s*(.+?)$', 'part'),
        # 第X節 標題
        (r'^(第[一二三四五六七八九十\d]+節)\s*[:：]?\s*(.+?)$', 'section'),
        # X.X 標題
        (r'^(\d+\.\d+)\s+(.+?)$', 'subsection'),
        # 一、標題 / 1、標題
        (r'^([一二三四五六七八九十\d]+)[、.]\s*(.+?)$', 'item'),
    ]
    
    lines = text.split('\n')
    current_section = {"chapter": "前言", "title": "前言", "content": []}
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            current_section["content"].append("")
            continue
        
        matched = False
        for pattern, ptype in patterns:
            match = re.match(pattern, line)
            if match:
                # 檢查這是否只是目錄條目（下一行也是章節標題）
                next_line = lines[i+1].strip() if i+1 < len(lines) else ""
                is_toc = any(re.match(p[0], next_line) for p in patterns)
                
                # 如果當前內容很少且下一行也是章節標題，可能是目錄
                if is_toc and len('\n'.join(current_section["content"]).strip()) < 50:
                    continue
                
                # 保存前一個章節
                content_text = '\n'.join(current_section["content"]).strip()
                if len(content_text) >= 100:
                    current_section["content"] = content_text
                    sections.append(current_section)
                
                # 開始新章節
                current_section = {
                    "chapter": match.group(1),
                    "title": match.group(2).strip() if len(match.groups()) > 1 else match.group(1),
                    "content": []
                }
                matched = True
                break
        
        if not matched:
            current_section["content"].append(line)
    
    # 保存最後一個章節
    content_text = '\n'.join(current_section["content"]).strip()
    if len(content_text) >= 100:
        current_section["content"] = content_text
        sections.append(current_section)
    
    # 如果沒有分出章節，按固定長度分段
    if len(sections) < 3:
        sections = split_by_paragraphs(text, 2000)  # 每段約 2000 字
    
    return sections

def split_by_paragraphs(text, max_chars=2000):
    """按段落和字數分割"""
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    sections = []
    current_section = {"chapter": "1", "title": "第1部分", "content": []}
    current_length = 0
    section_num = 1
    
    for para in paragraphs:
        if current_length + len(para) > max_chars and current_section["content"]:
            # 保存當前段落
            current_section["content"] = '\n\n'.join(current_section["content"])
            sections.append(current_section)
            
            # 開始新段落
            section_num += 1
            current_section = {"chapter": str(section_num), "title": f"第{section_num}部分", "content": []}
            current_length = 0
        
        current_section["content"].append(para)
        current_length += len(para)
    
    # 保存最後一個段落
    if current_section["content"]:
        current_section["content"] = '\n\n'.join(current_section["content"])
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
        "相生", "相剋", "生克",
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
        "遷移宮", "交友宮", "事業宮", "田宅宮", "福德宮", "父母宮",
        "宮氣", "飛化", "疊宮"
    ]
    
    # 易經相關
    yijing_terms = [
        "太極", "兩儀", "四象", "八卦",
        "乾", "坤", "震", "巽", "坎", "離", "艮", "兌",
        "六十四卦", "爻", "卦辭", "爻辭",
        "體用", "動爻", "變卦", "占卜"
    ]
    
    all_terms = bazi_terms + ziwei_terms + yijing_terms
    for term in all_terms:
        if term in text:
            keywords.add(term)
    
    return list(keywords)[:20]

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
    
    # 智能分段
    sections = smart_split(text, book_name)
    
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
    
    # 清理標題
    safe_title = entry['title'][:30].strip()
    safe_chapter = entry['chapter'].replace('/', '_')
    filename = f"{safe_chapter}_{safe_title}.md"
    # 移除檔名中的非法字符
    filename = re.sub(r'[<>:"/\\|?*\n\r]', '_', filename)
    
    filepath = book_dir / filename
    
    keywords_str = json.dumps(entry["keywords"], ensure_ascii=False)
    
    content = f"""---
source: {entry["source"]}
chapter: {entry["chapter"]}
title: {entry["title"]}
category: {entry["category"]}
author: {entry["metadata"]["author"]}
dynasty: {entry["metadata"]["dynasty"]}
keywords: {keywords_str}
---

# {entry["title"]}

{entry["content"]}
"""
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def generate_rag_chunks(entries):
    """生成適合 RAG 使用的分塊"""
    chunks = []
    chunk_size = 1000  # 每塊約 1000 字
    
    for entry in entries:
        content = entry["content"]
        
        # 如果內容不長，直接作為一塊
        if len(content) <= chunk_size:
            chunks.append({
                "id": f"{entry['id']}_chunk_001",
                "text": content,
                "source": entry["source"],
                "chapter": entry["chapter"],
                "title": entry["title"],
                "category": entry["category"],
                "keywords": entry["keywords"]
            })
        else:
            # 分成多塊
            paragraphs = content.split('\n\n')
            current_chunk = []
            current_length = 0
            chunk_num = 1
            
            for para in paragraphs:
                if current_length + len(para) > chunk_size and current_chunk:
                    chunks.append({
                        "id": f"{entry['id']}_chunk_{chunk_num:03d}",
                        "text": '\n\n'.join(current_chunk),
                        "source": entry["source"],
                        "chapter": entry["chapter"],
                        "title": entry["title"],
                        "category": entry["category"],
                        "keywords": entry["keywords"]
                    })
                    chunk_num += 1
                    current_chunk = []
                    current_length = 0
                
                current_chunk.append(para)
                current_length += len(para)
            
            # 保存最後一塊
            if current_chunk:
                chunks.append({
                    "id": f"{entry['id']}_chunk_{chunk_num:03d}",
                    "text": '\n\n'.join(current_chunk),
                    "source": entry["source"],
                    "chapter": entry["chapter"],
                    "title": entry["title"],
                    "category": entry["category"],
                    "keywords": entry["keywords"]
                })
    
    return chunks

def main():
    print("🚀 開始處理算命古書知識庫 v2...\n")
    
    all_entries = []
    
    for category, books in BOOKS.items():
        print(f"\n📚 處理類別: {category}")
        for book_name, config in books.items():
            entries = process_book(category, book_name, config)
            all_entries.extend(entries)
            
            # 儲存 Markdown
            for entry in entries:
                save_markdown(entry, OUTPUT_DIR)
    
    # 生成 RAG 分塊
    rag_chunks = generate_rag_chunks(all_entries)
    
    # 儲存 JSON 索引
    index_path = OUTPUT_DIR / "index.json"
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump({
            "version": "2.0",
            "total_entries": len(all_entries),
            "total_chunks": len(rag_chunks),
            "categories": list(BOOKS.keys()),
            "books": [{"name": book, "category": cat} for cat, books in BOOKS.items() for book in books],
            "entries": all_entries
        }, f, ensure_ascii=False, indent=2)
    
    # 儲存 RAG 分塊
    chunks_path = OUTPUT_DIR / "rag_chunks.json"
    with open(chunks_path, 'w', encoding='utf-8') as f:
        json.dump({
            "version": "1.0",
            "total_chunks": len(rag_chunks),
            "chunks": rag_chunks
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 完成！")
    print(f"📊 統計：")
    print(f"   - 章節條目: {len(all_entries)}")
    print(f"   - RAG 分塊: {len(rag_chunks)}")
    print(f"📁 輸出位置: {OUTPUT_DIR}")
    print(f"📄 索引檔案: {index_path}")
    print(f"📄 RAG 分塊: {chunks_path}")

if __name__ == "__main__":
    main()
