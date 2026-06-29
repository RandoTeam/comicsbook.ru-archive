import os
import sqlite3
import json
import urllib.parse
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import scrape_ratings

DB_PATH = r"C:\G_3.1\comicsbook\comics.db"
CDX_FILE = r"C:\Users\Ilia V\.gemini\antigravity\brain\4c11db68-eaec-4a8a-9b40-f9033c508a59\scratch\cdx_data.json"

def get_failed_posts():
    # 1. Fetch failed IDs from database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM comics WHERE status = 'failed'")
    failed_ids = set(r[0] for r in cursor.fetchall())
    conn.close()
    
    print(f"Database contains {len(failed_ids)} failed posts.")
    if not failed_ids:
        return []
        
    # 2. Get original metadata from CDX file
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
                
                match = re.match(r'^(\d+)', id_part)
                if match:
                    post_id = int(match.group(1))
                    if post_id in failed_ids:
                        # Keep the latest timestamped archive URL
                        if post_id not in posts or ts > posts[post_id]['timestamp']:
                            posts[post_id] = {
                                'id': post_id,
                                'category': category,
                                'original_url': orig,
                                'timestamp': ts
                            }
    return list(posts.values())

def main():
    failed_posts = get_failed_posts()
    if not failed_posts:
        print("No failed posts to scrape. Everything is clean!")
        return
        
    print(f"Mapped {len(failed_posts)} failed posts to CDX archives.")
    
    # We run with 5 threads to avoid aggressive rate limiting.
    print("Starting recovery scrape (5 parallel threads)...")
    
    success_count = 0
    fail_count = 0
    skipped_count = 0
    
    total = len(failed_posts)
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(scrape_ratings.scrape_single_post, post): post for post in failed_posts}
        
        completed = 0
        last_progress_time = time.time()
        
        for future in as_completed(futures):
            try:
                status, post_id = future.result()
                completed += 1
                if status == 'success':
                    success_count += 1
                elif status == 'skipped':
                    skipped_count += 1
                else:
                    fail_count += 1
            except Exception as e:
                completed += 1
                fail_count += 1
                
            if completed % 50 == 0 or time.time() - last_progress_time > 15:
                elapsed = time.time() - start_time
                speed = completed / elapsed if elapsed > 0 else 0
                eta = (total - completed) / speed if speed > 0 else 0
                print(f"Scraped {completed}/{total} | Success: {success_count}, Skipped: {skipped_count}, Failed: {fail_count} | Speed: {speed:.1f} posts/s | ETA: {eta/60:.1f} min")
                last_progress_time = time.time()
                
    print("\nRecovery Scrape finished!")
    print(f"Total: {total}")
    print(f"Success: {success_count}")
    print(f"Failed: {fail_count}")

if __name__ == "__main__":
    main()
