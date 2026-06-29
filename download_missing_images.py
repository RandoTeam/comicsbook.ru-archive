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

DB_PATH = r"C:\G_3.1\comicsbook\comics.db"
UPLOAD_DIR = r"C:\G_3.1\comicsbook\upload"

thread_local = threading.local()

def get_session():
    if not hasattr(thread_local, "session"):
        session = requests.Session()
        retries = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[500, 502, 503, 504],
            raise_on_status=False
        )
        adapter = HTTPAdapter(max_retries=retries, pool_connections=1, pool_maxsize=1)
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        thread_local.session = session
    return thread_local.session

def download_image(row):
    post_id, img_path, timestamp = row
    
    # Clean original filename and construct expected WebP filename
    parsed_path = urllib.parse.unquote(img_path)
    orig_filename = parsed_path.split('/')[-1]
    
    base_name, _ = os.path.splitext(orig_filename)
    webp_filename = f"{base_name}.webp"
    dest_path_webp = os.path.join(UPLOAD_DIR, webp_filename)
    
    if os.path.exists(dest_path_webp) and os.path.getsize(dest_path_webp) > 0:
        return 'skipped', post_id

    is_full_url = img_path.startswith('http://') or img_path.startswith('https://')
    original_url = img_path if is_full_url else f"http://comicsbook.ru{img_path}"
    
    wayback_url = f"https://web.archive.org/web/{timestamp}id_/{original_url}"
    
    try:
        session = get_session()
        r = session.get(wayback_url, timeout=15)
        if r.status_code == 200 and len(r.content) > 1000:
            content_type = r.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                return 'not_an_image', post_id
                
            try:
                img = Image.open(io.BytesIO(r.content))
                img = img.convert('RGB')
                img.save(dest_path_webp, 'WEBP', quality=85)
                return 'success', post_id
            except Exception as e:
                return 'image_error', post_id
        else:
            return f'http_{r.status_code}', post_id
    except Exception as e:
        return 'request_error', post_id

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, image_url, timestamp FROM comics WHERE status = 'success' AND image_url IS NOT NULL AND image_url != ''")
    rows = cursor.fetchall()
    conn.close()
    
    missing_rows = []
    for row in rows:
        post_id, img_path, timestamp = row
        parsed_path = urllib.parse.unquote(img_path)
        orig_filename = parsed_path.split('/')[-1]
        base_name, _ = os.path.splitext(orig_filename)
        webp_filename = f"{base_name}.webp"
        dest_path_webp = os.path.join(UPLOAD_DIR, webp_filename)
        
        if not os.path.exists(dest_path_webp) or os.path.getsize(dest_path_webp) == 0:
            missing_rows.append(row)
            
    print(f"Total missing images to try downloading: {len(missing_rows)}")
    if not missing_rows:
        return
        
    success = 0
    failed = 0
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(download_image, row): row for row in missing_rows}
        for i, future in enumerate(as_completed(futures), 1):
            try:
                status, post_id = future.result()
                if status == 'success':
                    success += 1
                elif status != 'skipped':
                    failed += 1
            except Exception as e:
                failed += 1
                
            if i % 100 == 0:
                print(f"Processed {i}/{len(missing_rows)}... (Success: {success}, Failed: {failed})")
                
    elapsed = time.time() - start_time
    print(f"Finished in {elapsed:.1f}s.")
    print(f"Successfully downloaded: {success}")
    print(f"Failed to download: {failed}")

if __name__ == '__main__':
    main()
