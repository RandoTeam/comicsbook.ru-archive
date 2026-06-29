import os
import sqlite3
import urllib.request
import urllib.parse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

DB_PATH = r"C:\G_3.1\comicsbook\comics.db"
UPLOAD_DIR = r"C:\G_3.1\comicsbook\upload"

def download_image(row):
    post_id, ts, img_path = row
    
    # Extract filename
    filename = urllib.parse.unquote(img_path.split('/')[-1])
    dest_path = os.path.join(UPLOAD_DIR, filename)
    
    # Skip if file already exists and is non-empty
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return 'skipped', post_id
        
    # Construct wayback image URL
    img_url = f"http://comicsbook.ru{img_path}"
    wayback_url = f"http://web.archive.org/web/{ts}id_/{img_url}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityCodeAssistant/1.0'
    }
    
    req = urllib.request.Request(wayback_url, headers=headers)
    max_retries = 3
    
    for attempt in range(1, max_retries + 1):
        try:
            # Sleep 0.5s to avoid rate limiting
            time.sleep(0.5)
            with urllib.request.urlopen(req, timeout=45) as response:
                data = response.read()
                with open(dest_path, 'wb') as f:
                    f.write(data)
            return 'success', post_id
        except Exception as e:
            if attempt == max_retries:
                # print(f"Failed to download image for post {post_id} after {max_retries} attempts: {e}")
                return 'failed', post_id
            time.sleep(2 * attempt)
            
    return 'failed', post_id

def main():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    if not os.path.exists(DB_PATH):
        print("Database does not exist yet. Please wait for scrape_ratings.py to start saving records.")
        return
        
    print("Reading images list from database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, timestamp, image_url FROM comics WHERE status = 'success' AND image_url IS NOT NULL")
    rows = cursor.fetchall()
    conn.close()
    
    print(f"Found {len(rows)} image records in database.")
    
    success_count = 0
    skipped_count = 0
    fail_count = 0
    
    print("Starting download of images in parallel (2 threads)...")
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {executor.submit(download_image, row): row for row in rows}
        
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
                
    print(f"\nImage download complete:")
    print(f"  Success: {success_count}")
    print(f"  Skipped (already exists): {skipped_count}")
    print(f"  Failed: {fail_count}")

if __name__ == '__main__':
    main()
