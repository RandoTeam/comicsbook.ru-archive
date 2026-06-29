import os
import re
import json
import sqlite3
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import urllib.parse

DB_PATH = r"C:\G_3.1\comicsbook\comics.db"
CDX_FILE = r"C:\Users\Ilia V\.gemini\antigravity\brain\4c11db68-eaec-4a8a-9b40-f9033c508a59\scratch\cdx_data.json"

EXCLUDED_CATEGORIES = {
    'users', 'upload', 'images', 'gif', 'wall', 'all', 'hot', 'slider', 
    'templates', 'add', 'news', 'faq', 'rating', 'search', 'random', 
    'tags', 'wiki', 'contacts', 'advert', 'promo', 'comment'
}

thread_local = threading.local()

def get_session():
    if not hasattr(thread_local, "session"):
        session = requests.Session()
        # Set up retries
        retries = Retry(
            total=5,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504],
            raise_on_status=False
        )
        adapter = HTTPAdapter(max_retries=retries, pool_connections=1, pool_maxsize=1)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        thread_local.session = session
    return thread_local.session

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comics (
            id INTEGER PRIMARY KEY,
            title TEXT,
            category TEXT,
            author TEXT,
            date_str TEXT,
            image_url TEXT,
            rating INTEGER,
            archive_url TEXT,
            timestamp TEXT,
            status TEXT
        )
    ''')
    conn.commit()
    conn.close()

def get_posts_to_scrape():
    with open(CDX_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    rows = data[1:]
    
    posts = {}
    for row in rows:
        if len(row) < 5:
            continue
        orig, ts, mime, status, length = row
        if mime == 'text/html':
            parsed = urllib.parse.urlparse(orig)
            path_parts = parsed.path.strip('/').split('/')
            if len(path_parts) >= 2:
                category = path_parts[0].lower()
                id_part = path_parts[1]
                
                if category in EXCLUDED_CATEGORIES:
                    continue
                    
                match = re.match(r'^(\d+)', id_part)
                if match:
                    post_id = int(match.group(1))
                    if post_id > 500000:
                        continue
                        
                    if post_id not in posts or ts > posts[post_id]['timestamp']:
                        posts[post_id] = {
                            'id': post_id,
                            'category': category,
                            'original_url': orig,
                            'timestamp': ts
                        }
                        
    return list(posts.values())

def scrape_single_post(post):
    post_id = post['id']
    ts = post['timestamp']
    orig_url = post['original_url']
    
    # Check if already processed and successful
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM comics WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    if row and row[0] == 'success':
        conn.close()
        return 'skipped', post_id
        
    archive_url = f"http://web.archive.org/web/{ts}id_/{orig_url}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityCodeAssistant/1.0'
    }
    
    session = get_session()
    html = None
    
    try:
        response = session.get(archive_url, headers=headers, timeout=30)
        if response.status_code == 200:
            # Robust charset detection based on content & meta tags
            content_lower = response.content[:4000].lower()
            if b'charset=windows-1251' in content_lower or b'charset=cp1251' in content_lower:
                html = response.content.decode('windows-1251', errors='ignore')
            elif b'charset=utf-8' in content_lower:
                html = response.content.decode('utf-8', errors='ignore')
            else:
                try:
                    decoded_utf8 = response.content.decode('utf-8', errors='replace')
                    # If there are replacement characters, it is likely windows-1251
                    if decoded_utf8.count('\ufffd') > 5:
                        html = response.content.decode('windows-1251', errors='ignore')
                    else:
                        html = decoded_utf8
                except Exception:
                    try:
                        html = response.content.decode('windows-1251', errors='ignore')
                    except Exception:
                        html = response.content.decode('utf-8', errors='ignore')
    except Exception as e:
        pass
        
    if not html:
        cursor.execute("INSERT OR REPLACE INTO comics (id, status) VALUES (?, ?)", (post_id, 'failed'))
        conn.commit()
        conn.close()
        return 'failed', post_id
        
    # Parse fields
    title_match = re.search(r'<h3>([^<]+)</h3>', html)
    if not title_match:
        title_match = re.search(r'<h1[^>]*>([^<]+)</h1>', html)
    title = title_match.group(1).strip() if title_match else None
    
    cat_match = re.search(r'<h2 class="cat">([^<]+)</h2>', html)
    category = cat_match.group(1).strip() if cat_match else post['category']
    
    author_match = re.search(r'href="/users/\d+"[^>]*>([^<]+)</a>', html)
    author = author_match.group(1).strip() if author_match else None
    
    date_match = re.search(r'class="cat">.*?</h2></a>\s*<span>/</span>\s*([^<]+)', html, re.DOTALL)
    date_str = date_match.group(1).replace('&nbsp;', ' ').strip() if date_match else None
    
    img_match = re.search(r'<img[^>]*src="([^"]*wp-content/uploads/[^"]+)"', html)
    if not img_match:
        img_match = re.search(r'<img[^>]*src="(/upload/[^"]+)"', html)
    if not img_match:
        img_match = re.search(r'<img[^>]*src="(/upl/[^"]+)"', html)
    img_url = img_match.group(1).strip() if img_match else None
    
    rate_match = re.search(r'<p\s+id="c\d+">(-?\d+)</p>', html)
    rating = int(rate_match.group(1)) if rate_match else 0
    
    cursor.execute('''
        INSERT OR REPLACE INTO comics (id, title, category, author, date_str, image_url, rating, archive_url, timestamp, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (post_id, title, category, author, date_str, img_url, rating, archive_url, ts, 'success'))
    conn.commit()
    conn.close()
    
    return 'success', post_id

def main():
    print("Initializing SQLite database...")
    init_db()
    
    print("Filtering and extracting post URLs from CDX data...")
    posts = get_posts_to_scrape()
    print(f"Found {len(posts)} candidate posts to scrape.")
    
    # We clear previous failed attempts so we can retry them using the new robust session
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM comics WHERE status = 'failed'")
    conn.commit()
    
    cursor.execute("SELECT count(*) FROM comics WHERE status = 'success'")
    already_success = cursor.fetchone()[0]
    conn.close()
    print(f"Already scraped: {already_success} posts.")
    
    posts_to_scrape = [p for p in posts]
    
    success_count = 0
    skipped_count = 0
    fail_count = 0
    
    print("Scraping metadata in parallel (20 threads)...")
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(scrape_single_post, post): post for post in posts_to_scrape}
        
        last_progress_time = time.time()
        completed = 0
        total = len(futures)
        
        for future in as_completed(futures):
            status, post_id = future.result()
            completed += 1
            if status == 'success':
                success_count += 1
            elif status == 'skipped':
                skipped_count += 1
            else:
                fail_count += 1
                
            if time.time() - last_progress_time > 10:
                print(f"Progress: {completed}/{total} (Success: {success_count}, Skipped: {skipped_count}, Failed: {fail_count})")
                last_progress_time = time.time()
                
    print(f"\nScraping complete:")
    print(f"  Success: {success_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"  Failed: {fail_count}")

if __name__ == '__main__':
    main()
