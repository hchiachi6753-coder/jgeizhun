#!/usr/bin/env python3
"""
處理 ePub 電子書並加入知識庫
"""
import os
import re
import json
import zipfile
from pathlib import Path
from html.parser import HTMLParser

# ePub 檔案配置
EPUB_DIR = Path.home() / "Documents/電子書/Eddie電子書/命理書籍/命理相關epub word"
OUTPUT_DIR = Path.home() / "Projects/jgeizhun/knowledge-base"

EPUB_BOOKS = {
    "八字命理學進階教程_nodrm.epub": {
        "name": "八字命理學進階教程",
        "category": "八字",
        "author": "陸致極",
        "dynasty": "現代"
    },
    "子平真诠（原本）_nodrm.epub": {
        "name": "子平真詮（原本）",
        "category": "八字",
        "author": "沈孝瞻",
        "dynasty": "清"
    },
    "三命通会.epub": {
        "name": "三命通會",
        "category": "八字",
        "author": "萬民英",
        "dynasty": "明"
    },
    "紫微四化_nodrm.epub": {
        "name": "紫微四化",
        "category": "紫微",
        "author": "王文華",
        "dynasty": "現代"
    },
    "紫微探源_nodrm.epub": {
        "name": "紫微探源",
        "category": "紫微",
        "author": "王文華",
        "dynasty": "現代"
    },
    "傅佩榮的易經入門課（三版）(完整)_nodrm.epub": {
        "name": "傅佩榮易經入門課",
        "category": "易經",
        "author": "傅佩榮",
        "dynasty": "現代"
    }
}

class HTMLTextExtractor(HTMLParser):
    """從 HTML 中提取純文字"""
    def __init__(self):
        super().__init__()
        self.text = []
        self.skip_tags = {'script', 'style', 'head', 'meta', 'link'}
        self.current_skip = False
        self.in_paragraph = False
    
    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.current_skip = True
        if tag in ('p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'br'):
            self.text.append('\n')
    
    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.current_skip = False
        if tag in ('p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'):
            self.text.append('\n')
    
    def handle_data(self, data):
        if not self.current_skip:
            self.text.append(data)
    
    def get_text(self):
        return ''.join(self.text)

def extract_text_from_html(html_content):
    """從 HTML 內容提取文字"""
    parser = HTMLTextExtractor()
    try:
        parser.feed(html_content)
        return parser.get_text()
    except:
        # 備用方案：簡單的正則表達式
        text = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'&nbsp;', ' ', text)
        text = re.sub(r'&[a-z]+;', '', text)
        return text

def parse_epub(epub_path):
    """解析 ePub 檔案，提取所有章節文字"""
    chapters = []
    
    with zipfile.ZipFile(epub_path, 'r') as zf:
        # 找出所有 HTML/XHTML 檔案
        html_files = []
        for name in zf.namelist():
            if name.endswith(('.html', '.xhtml', '.htm')) and 'toc' not in name.lower():
                html_files.append(name)
        
        # 嘗試從 OPF 檔案中獲取正確順序
        opf_file = None
        for name in zf.namelist():
            if name.endswith('.opf'):
                opf_file = name
                break
        
        ordered_files = []
        if opf_file:
            opf_content = zf.read(opf_file).decode('utf-8', errors='ignore')
            # 提取 spine 順序
            spine_match = re.search(r'<spine[^>]*>(.*?)</spine>', opf_content, re.DOTALL)
            if spine_match:
                itemrefs = re.findall(r'idref="([^"]+)"', spine_match.group(1))
                # 從 manifest 獲取 id 到 href 的映射
                manifest_match = re.search(r'<manifest>(.*?)</manifest>', opf_content, re.DOTALL)
                if manifest_match:
                    id_to_href = {}
                    items = re.findall(r'<item\s+[^>]*id="([^"]+)"[^>]*href="([^"]+)"', manifest_match.group(1))
                    for item_id, href in items:
                        id_to_href[item_id] = href
                    
                    # 按 spine 順序排列檔案
                    opf_dir = os.path.dirname(opf_file)
                    for idref in itemrefs:
                        if idref in id_to_href:
                            href = id_to_href[idref]
                            if opf_dir:
                                full_path = opf_dir + '/' + href
                            else:
                                full_path = href
                            # 標準化路徑
                            full_path = full_path.replace('//', '/')
                            if full_path in html_files or any(h.endswith(href) for h in html_files):
                                for h in html_files:
                                    if h.endswith(href) or h == full_path:
                                        if h not in ordered_files:
                                            ordered_files.append(h)
                                        break
        
        # 如果無法從 OPF 獲取順序，使用文件名排序
        if not ordered_files:
            ordered_files = sorted(html_files)
        
        # 讀取每個 HTML 檔案
        for i, html_file in enumerate(ordered_files):
            try:
                content = zf.read(html_file).decode('utf-8', errors='ignore')
                text = extract_text_from_html(content)
                text = clean_text(text)
                
                if len(text.strip()) < 50:
                    continue
                
                # 嘗試從內容中提取章節標題
                title = extract_chapter_title(text, html_file, i+1)
                
                chapters.append({
                    "chapter": f"第{i+1}章",
                    "title": title,
                    "content": text.strip()
                })
            except Exception as e:
                print(f"    ⚠️ 無法讀取 {html_file}: {e}")
    
    return chapters

def clean_text(text):
    """清理文字"""
    # 移除多餘空白
    text = re.sub(r'[ \t]+', ' ', text)
    # 移除多餘換行
    text = re.sub(r'\n{3,}', '\n\n', text)
    # 移除行首行尾空白
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    return text.strip()

def extract_chapter_title(text, filename, chapter_num):
    """從文字中提取章節標題"""
    lines = text.strip().split('\n')
    
    # 找第一行非空文字作為標題
    for line in lines[:5]:
        line = line.strip()
        if line and len(line) < 100:
            # 清理標題
            title = re.sub(r'^\d+[\.、\s]+', '', line)  # 移除開頭的數字
            title = re.sub(r'^第[一二三四五六七八九十\d]+[章節篇回]\s*', '', title)  # 移除章節標記
            if title:
                return title[:50]
    
    # 從文件名提取
    name = os.path.basename(filename)
    name = re.sub(r'\.(html|xhtml|htm)$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^\d+[-_]?', '', name)
    if name and name not in ['index', 'cover', 'copyright', 'toc']:
        return name[:50]
    
    return f"第{chapter_num}節"

def merge_short_chapters(chapters, min_length=500):
    """合併過短的章節"""
    merged = []
    buffer = None
    
    for chapter in chapters:
        content = chapter["content"]
        
        if buffer:
            # 與上一個章節合併
            buffer["content"] += "\n\n" + content
            buffer["title"] += " / " + chapter["title"]
            
            if len(buffer["content"]) >= min_length:
                merged.append(buffer)
                buffer = None
        elif len(content) < min_length:
            buffer = chapter.copy()
        else:
            merged.append(chapter)
    
    if buffer:
        merged.append(buffer)
    
    return merged

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

def process_epub_book(epub_filename, config):
    """處理單本 ePub 書籍"""
    epub_path = EPUB_DIR / epub_filename
    
    if not epub_path.exists():
        print(f"  ⚠️ 找不到檔案: {epub_path}")
        return []
    
    print(f"  📖 處理: {config['name']}")
    
    # 解析 ePub
    chapters = parse_epub(epub_path)
    
    if not chapters:
        print(f"    ⚠️ 無法提取任何章節")
        return []
    
    # 合併過短的章節
    chapters = merge_short_chapters(chapters)
    
    print(f"    📄 提取 {len(chapters)} 個章節")
    
    # 生成知識庫條目
    entries = []
    for i, chapter in enumerate(chapters):
        entry_id = f"{config['name'].replace(' ', '_')}_{i+1:03d}"
        
        entry = {
            "id": entry_id,
            "source": config["name"],
            "category": config["category"],
            "chapter": chapter["chapter"],
            "title": chapter["title"],
            "content": chapter["content"],
            "keywords": extract_keywords(chapter["content"]),
            "metadata": {
                "author": config["author"],
                "dynasty": config["dynasty"],
                "quality": 5,
                "format": "epub"
            }
        }
        entries.append(entry)
    
    return entries

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
format: epub
keywords: {keywords_str}
---

# {entry["title"]}

{entry["content"]}
"""
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    print("🚀 開始處理 ePub 電子書...\n")
    
    all_entries = []
    
    for epub_filename, config in EPUB_BOOKS.items():
        entries = process_epub_book(epub_filename, config)
        all_entries.extend(entries)
        
        # 儲存 Markdown
        for entry in entries:
            save_markdown(entry, OUTPUT_DIR)
    
    if not all_entries:
        print("\n❌ 沒有成功處理任何書籍")
        return
    
    # 讀取現有的 rag_chunks.json
    chunks_path = OUTPUT_DIR / "rag_chunks.json"
    existing_chunks = []
    existing_sources = set()
    
    if chunks_path.exists():
        with open(chunks_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            existing_chunks = data.get("chunks", [])
            
            # 記錄現有來源，避免重複
            for chunk in existing_chunks:
                existing_sources.add(chunk.get("source", ""))
    
    # 過濾掉已存在的書籍
    new_entries = []
    for entry in all_entries:
        if entry["source"] not in existing_sources:
            new_entries.append(entry)
    
    if not new_entries:
        print("\n⚠️ 所有書籍已經在知識庫中")
        return
    
    # 生成新的 RAG 分塊
    new_chunks = generate_rag_chunks(new_entries)
    
    # 合併分塊
    all_chunks = existing_chunks + new_chunks
    
    # 儲存更新後的 rag_chunks.json
    with open(chunks_path, 'w', encoding='utf-8') as f:
        json.dump({
            "version": "1.0",
            "total_chunks": len(all_chunks),
            "chunks": all_chunks
        }, f, ensure_ascii=False, indent=2)
    
    # 更新 index.json
    index_path = OUTPUT_DIR / "index.json"
    if index_path.exists():
        with open(index_path, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
        
        # 添加新條目
        existing_entries = index_data.get("entries", [])
        existing_entries.extend(new_entries)
        
        # 更新書籍列表
        existing_books = set((b["name"], b["category"]) for b in index_data.get("books", []))
        for entry in new_entries:
            book_tuple = (entry["source"], entry["category"])
            if book_tuple not in existing_books:
                index_data.setdefault("books", []).append({
                    "name": entry["source"],
                    "category": entry["category"]
                })
        
        index_data["entries"] = existing_entries
        index_data["total_entries"] = len(existing_entries)
        index_data["total_chunks"] = len(all_chunks)
        
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 完成！")
    print(f"📊 新增統計：")
    print(f"   - 新增章節條目: {len(new_entries)}")
    print(f"   - 新增 RAG 分塊: {len(new_chunks)}")
    print(f"   - 總 RAG 分塊: {len(all_chunks)}")

if __name__ == "__main__":
    main()
