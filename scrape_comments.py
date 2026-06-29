import os
import re
import sqlite3
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

DB_PATH = r"C:\G_3.1\comicsbook\comics.db"

thread_local = threading.local()

def get_session():
    if not hasattr(thread_local, "session"):
        session = requests.Session()
        retries = Retry(
            total=2,
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
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER,
            author_name TEXT,
            avatar_url TEXT,
            comment_text TEXT,
            FOREIGN KEY(post_id) REFERENCES comics(id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comment_scrape_status (
            post_id INTEGER PRIMARY KEY,
            status TEXT,
            FOREIGN KEY(post_id) REFERENCES comics(id)
        )
    ''')
    conn.commit()
    conn.close()

def decode_field(l1_str):
    raw_bytes = l1_str.encode('latin1')
    try:
        # Try UTF-8 first
        return raw_bytes.decode('utf-8')
    except UnicodeDecodeError:
        # Fallback to CP1251
        return raw_bytes.decode('windows-1251', errors='ignore')

def scrape_comments_for_post(row):
    post_id, archive_url = row
    
    # Check if already scraped successfully
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM comment_scrape_status WHERE post_id = ?", (post_id,))
    res = cursor.fetchone()
    if res and res[0] == 'success':
        conn.close()
        return 'skipped', post_id, 0
        
    # Ensure it uses https to avoid redirect loops
    if archive_url.startswith('http://'):
        archive_url = archive_url.replace('http://', 'https://')
        
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityCodeAssistant/1.1'
    }
    
    session = get_session()
    html = None
    
    # Try fetching with retry on 429 and network errors
    for attempt in range(4):
        try:
            # Polite throttle delay
            time.sleep(0.5)
            response = session.get(archive_url, headers=headers, timeout=10)
            if response.status_code == 200:
                # Decode entire HTML as latin1 to preserve raw bytes
                html = response.content.decode('latin1')
                break
            elif response.status_code == 429:
                # Rate limited, backoff sleep
                time.sleep(4.0 * (attempt + 1))
                continue
            else:
                # Other status codes (404, etc.)
                break
        except Exception:
            time.sleep(2.0)
            continue
            
    if not html:
        cursor.execute("INSERT OR REPLACE INTO comment_scrape_status (post_id, status) VALUES (?, ?)", (post_id, 'failed'))
        conn.commit()
        conn.close()
        return 'failed', post_id, 0
        
    # Extract comments from noscript block using regex
    comment_pattern = re.compile(
        r"class='hc_comment'.*?src='([^']+)'.*?class='hc_comment_name'>([^<]+)</div>.*?class='hc_comment_text'>([^<]+)</div>",
        re.DOTALL
    )
    
    comments_found = comment_pattern.findall(html)
    
    if comments_found:
        cursor.execute("DELETE FROM comments WHERE post_id = ?", (post_id,))
        for avatar_l1, name_l1, text_l1 in comments_found:
            name = decode_field(name_l1)
            avatar = decode_field(avatar_l1)
            text = decode_field(text_l1)
            
            cursor.execute('''
                INSERT INTO comments (post_id, author_name, avatar_url, comment_text)
                VALUES (?, ?, ?, ?)
            ''', (post_id, name.strip(), avatar.strip(), text.strip()))
            
    cursor.execute("INSERT OR REPLACE INTO comment_scrape_status (post_id, status) VALUES (?, ?)", (post_id, 'success'))
    conn.commit()
    conn.close()
    
    return 'success', post_id, len(comments_found)

def main():
    init_db()
    
    print("Reading successful posts from database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, archive_url FROM comics WHERE status = 'success' AND archive_url IS NOT NULL")
    rows = cursor.fetchall()
    
    # Clean previous failed statuses so we can retry them
    cursor.execute("DELETE FROM comment_scrape_status WHERE status = 'failed'")
    conn.commit()
    
    cursor.execute("SELECT count(*) FROM comment_scrape_status WHERE status = 'success'")
    already_done = cursor.fetchone()[0]
    conn.close()
    
    print(f"Found {len(rows)} posts in database.")
    print(f"Already scraped comments for {already_done} posts.")
    
    success_count = 0
    skipped_count = 0
    fail_count = 0
    total_comments = 0
    
    # Use 4 threads for stability and politeness
    print("Starting scraping of comments in parallel (4 threads)...")
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(scrape_comments_for_post, row): row for row in rows}
        
        last_progress_time = time.time()
        completed = 0
        total = len(futures)
        
        for future in as_completed(futures):
            status, post_id, count = future.result()
            completed += 1
            total_comments += count
            if status == 'success':
                success_count += 1
            elif status == 'skipped':
                skipped_count += 1
            else:
                fail_count += 1
                
            if time.time() - last_progress_time > 10:
                print(f"Progress: {completed}/{total} (Success: {success_count}, Skipped: {skipped_count}, Failed: {fail_count}, Comments scraped: {total_comments})")
                last_progress_time = time.time()
                
    print(f"\nComments scraping complete:")
    print(f"  Success (new posts scraped): {success_count}")
    print(f"  Skipped (already done): {skipped_count}")
    print(f"  Failed: {fail_count}")
    print(f"  Total comments imported: {total_comments}")

if __name__ == '__main__':
    main()
