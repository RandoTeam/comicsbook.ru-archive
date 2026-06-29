import os
import json
import urllib.request
import urllib.parse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_asset_urls():
    cdx_file = r"C:\Users\Ilia V\.gemini\antigravity\brain\4c11db68-eaec-4a8a-9b40-f9033c508a59\scratch\cdx_data.json"
    with open(cdx_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    rows = data[1:]
    assets = {}
    
    for row in rows:
        if len(row) < 5:
            continue
        orig, ts, mime, status, length = row
        parsed = urllib.parse.urlparse(orig)
        path = parsed.path.lower()
        
        is_asset = False
        if '/css/' in path or '/js/' in path or '/img/' in path or path.endswith('favicon.ico'):
            if '/upload/' not in path and '/uploads/' not in path and '/upl/' not in path:
                is_asset = True
                
        if is_asset:
            rel_path = path.lstrip('/')
            if rel_path not in assets or ts > assets[rel_path][0]:
                assets[rel_path] = (ts, orig)
                
    return assets

def download_file(rel_path, ts, orig_url, base_dir):
    dest_path = os.path.join(base_dir, rel_path.replace('/', os.sep))
    
    # Idempotent check: if file exists and has size > 0, skip downloading
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return True, rel_path, os.path.getsize(dest_path), "skipped"
        
    wayback_url = f"https://web.archive.org/web/{ts}id_/{orig_url}"
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AntigravityCodeAssistant/1.0'
    }
    
    max_retries = 5
    for attempt in range(1, max_retries + 1):
        req = urllib.request.Request(wayback_url, headers=headers)
        try:
            # We wait 120 seconds for slow Wayback servers
            with urllib.request.urlopen(req, timeout=45) as response:
                data = response.read()
                with open(dest_path, 'wb') as f:
                    f.write(data)
            return True, rel_path, len(data), "downloaded"
        except Exception as e:
            if attempt == max_retries:
                print(f"Failed to download {rel_path} after {max_retries} attempts: {e}")
                return False, rel_path, 0, str(e)
            else:
                # Exponential backoff
                time.sleep(1 * attempt)
    return False, rel_path, 0, "unknown_error"

def main():
    base_dir = r"C:\G_3.1\comicsbook"
    print("Analyzing design assets from CDX data...")
    assets = get_asset_urls()
    print(f"Found {len(assets)} unique design assets.")
    
    download_list = []
    for rel_path, (ts, orig_url) in assets.items():
        ext = os.path.splitext(rel_path)[1].split('?')[0]
        if ext in ('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.ttf'):
            download_list.append((rel_path, ts, orig_url))
            
    print(f"Filtered to {len(download_list)} relevant files (.css, .js, images, icons).")
    
    success_count = 0
    skipped_count = 0
    fail_count = 0
    total_bytes = 0
    
    # We reduce workers to 5 to avoid triggering Archive.org SSL/connection resets
    print("Starting download of assets (5 parallel threads max)...")
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(download_file, rel_path, ts, orig, base_dir): rel_path 
                   for rel_path, ts, orig in download_list}
        
        for future in as_completed(futures):
            success, rel_path, size, status = future.result()
            if success:
                success_count += 1
                total_bytes += size
                if status == "skipped":
                    skipped_count += 1
            else:
                fail_count += 1
                
    print(f"\nDownload completed:")
    print(f"  Successfully verified/downloaded: {success_count}/{len(download_list)} files")
    print(f"  Skipped (already exist): {skipped_count}")
    print(f"  Failed: {fail_count}")
    print(f"  Total assets size: {total_bytes / (1024 * 1024):.2f} MB")

if __name__ == '__main__':
    main()
