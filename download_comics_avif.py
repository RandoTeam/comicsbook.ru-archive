import os
import sqlite3
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import urllib.parse
from PIL import Image
import io
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import json

DB_PATH = r"C:\G_3.1\comicsbook\comics.db"
UPLOAD_DIR = r"C:\G_3.1\comicsbook\upload"

thread_local = threading.local()
img_map = {}

CDX_FILE = r"C:\Users\Ilia V\.gemini\antigravity\brain\4c11db68-eaec-4a8a-9b40-f9033c508a59\scratch\cdx_data.json"

def get_session():
    if not hasattr(thread_local, "session"):
        session = requests.Session()
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

def download_and_convert_avif(row, quality=75):
    post_id, ts, img_path = row
    
    parsed_path = urllib.parse.unquote(img_path)
    orig_filename = parsed_path.split('/')[-1]
    
    # Replace extension with .avif
    base_name, _ = os.path.splitext(orig_filename)
    avif_filename = f"{base_name}.avif"
    
    dest_path_avif = os.path.join(UPLOAD_DIR, avif_filename)
    db_avif_path = f"/upload/{avif_filename}"
    
    # Check if AVIF already exists
    if os.path.exists(dest_path_avif) and os.path.getsize(dest_path_avif) > 0:
        if not img_path.endswith('.avif'):
            conn = sqlite3.connect(DB_PATH)
            conn.execute("UPDATE comics SET image_url = ? WHERE id = ?", (db_avif_path, post_id))
            conn.commit()
            conn.close()
        return 'skipped', post_id

    # Check if a WebP version exists locally to convert directly to AVIF without downloading
    dest_path_webp = os.path.join(UPLOAD_DIR, f"{base_name}.webp")
    if os.path.exists(dest_path_webp) and os.path.getsize(dest_path_webp) > 0:
        try:
            with Image.open(dest_path_webp) as img:
                img.save(dest_path_avif, "AVIF", quality=quality)
            conn = sqlite3.connect(DB_PATH)
            conn.execute("UPDATE comics SET image_url = ? WHERE id = ?", (db_avif_path, post_id))
            conn.commit()
            conn.close()
            return 'converted_local', post_id
        except Exception:
            pass

    # Look up original URL from CDX map
    parsed_img = urllib.parse.urlparse(img_path)
    lookup_path = parsed_img.path.lower()
    for ext in ['.avif', '.webp', '.jpg']:
        if lookup_path.endswith(ext):
            lookup_path = lookup_path.replace(ext, '.jpg')
            break
        
    cdx_info = img_map.get(lookup_path)
    if not cdx_info:
        for alt_ext in ['.png', '.gif', '.jpeg']:
            alt_path = os.path.splitext(lookup_path)[0] + alt_ext
            cdx_info = img_map.get(alt_path)
            if cdx_info:
                break
                
    if not cdx_info:
        big_path = os.path.splitext(lookup_path)[0] + "_big" + os.path.splitext(lookup_path)[1]
        cdx_info = img_map.get(big_path)
        
    if not cdx_info:
        return 'failed', post_id
        
    exact_ts, original_url = cdx_info
    wayback_url = f"http://web.archive.org/web/{exact_ts}id_/{original_url}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ComicsbookArchiver/1.0.6'
    }
    
    session = get_session()
    time.sleep(0.15)
    
    response = None
    try:
        response = session.get(wayback_url, headers=headers, timeout=20)
    except Exception:
        pass
        
    if not response or response.status_code != 200:
        return 'failed', post_id
        
    try:
        img = Image.open(io.BytesIO(response.content))
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        img.save(dest_path_avif, "AVIF", quality=quality)
        
        conn = sqlite3.connect(DB_PATH)
        conn.execute("UPDATE comics SET image_url = ? WHERE id = ?", (db_avif_path, post_id))
        conn.commit()
        conn.close()
        return 'success', post_id
    except Exception:
        return 'failed', post_id

def main():
    global img_map
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    if not os.path.exists(DB_PATH):
        print("Database not found! comics.db is required.")
        return
        
    if not os.path.exists(CDX_FILE):
        print("CDX file not found! Required for accurate image mapping.")
        return
        
    print("Loading CDX mapping data...")
    with open(CDX_FILE, 'r', encoding='utf-8') as f:
        cdx_data = json.load(f)
        
    rows = cdx_data[1:]
    print("Building CDX image map...")
    for row in rows:
        orig = row[0]
        ts = row[1]
        if 'comicsbook.ru/upload/' in orig or 'comicsbook.ru/wp-content/uploads/' in orig or 'comicsbook.ru/upl/' in orig:
            parsed = urllib.parse.urlparse(orig)
            path_bytes = urllib.parse.unquote_to_bytes(parsed.path)
            try:
                decoded_path = path_bytes.decode('utf-8')
            except Exception:
                decoded_path = path_bytes.decode('windows-1251', errors='ignore')
            img_map[decoded_path.lower()] = (ts, orig)
            
    print(f"Mapped {len(img_map)} unique images from CDX.")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, timestamp, image_url FROM comics WHERE status = 'success' AND image_url IS NOT NULL ORDER BY rating DESC")
    db_rows = cursor.fetchall()
    conn.close()
    
    print(f"Found {len(db_rows)} records in database.")
    
    success_count = 0
    skipped_count = 0
    converted_count = 0
    fail_count = 0
    
    print("Starting AVIF processing (4 parallel threads, quality=75)...")
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(download_and_convert_avif, r, 75): r for r in db_rows}
        
        last_progress_time = time.time()
        completed = 0
        total = len(futures)
        
        for future in as_completed(futures):
            status, post_id = future.result()
            completed += 1
            if status == 'success':
                success_count += 1
            elif status == 'converted_local':
                converted_count += 1
            elif status == 'skipped':
                skipped_count += 1
            else:
                fail_count += 1
                
            if time.time() - last_progress_time > 10:
                print(f"Progress: {completed}/{total} (Downloaded: {success_count}, Converted Local: {converted_count}, Skipped: {skipped_count}, Failed: {fail_count})")
                last_progress_time = time.time()
                
    print(f"\nAVIF optimization finished:")
    print(f"  Successfully downloaded & converted: {success_count}")
    print(f"  Converted from local cache: {converted_count}")
    print(f"  Skipped (already exists): {skipped_count}")
    print(f"  Failed: {fail_count}")

if __name__ == '__main__':
    main()
