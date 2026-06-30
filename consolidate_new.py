import json
import os
import requests
from urllib.parse import urlparse

# Paths
BASE_DIR = r"c:\G_3.1\comicsbook"
DB_PATH = os.path.join(BASE_DIR, r"react_app\public\data.json")
VK_JSON = os.path.join(BASE_DIR, "data_extracted_vk.json")
PIKABU_JSON = os.path.join(BASE_DIR, "data_extracted_pikabu.json")
UPLOAD_DIR = os.path.join(BASE_DIR, "upload")

def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Load existing db
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    existing_posts = db.get("posts", [])
    print(f"Existing posts: {len(existing_posts)}")
    
    # Track existing titles and image names to avoid duplicates
    existing_titles = set(p.get("title") for p in existing_posts if p.get("title"))
    existing_links = set(p.get("source_link") for p in existing_posts if p.get("source_link"))
    
    max_id = 0
    for p in existing_posts:
        try:
            pid = int(p.get("id", 0))
            if pid > max_id:
                max_id = pid
        except:
            pass

    # Load new data
    new_data = load_json(VK_JSON) + load_json(PIKABU_JSON)
    print(f"Extracted posts found: {len(new_data)}")
    
    added_count = 0
    for item in new_data:
        title = item.get("title", "") or ""
        link = item.get("link", "")
        
        # Check by link to prevent duplicate
        if link and link in existing_links:
            continue
            
        img_url = item.get("image_url")
        if not img_url:
            continue
            
        max_id += 1
        new_id = max_id
        
        # Download image
        ext = ".jpg"
        if ".png" in img_url.lower(): ext = ".png"
        elif ".webp" in img_url.lower(): ext = ".webp"
        
        filename = f"ext_{new_id}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        if not os.path.exists(filepath):
            try:
                print(f"Downloading {img_url} ...")
                r = requests.get(img_url, timeout=(5, 10))
                r.raise_for_status()
                with open(filepath, 'wb') as f:
                    f.write(r.content)
            except Exception as e:
                print(f"Failed to download {img_url}: {e}")
                continue
            
        # Parse rating
        rating_str = item.get("rating", "0")
        if isinstance(rating_str, str):
            rating_str = rating_str.replace(",", "").replace(" ", "").strip()
        try:
            rating = int(rating_str)
        except:
            rating = 0
            
        new_post = {
            "id": new_id,
            "title": title,
            "category": "Extracted Archive",
            "author": "Archivist",
            "date_str": item.get("date", ""),
            "image_url": f"/upload/{filename}",
            "rating": rating,
            "timestamp": "20260630000000",
            "filename": filename,
            "source_link": link
        }
        
        existing_posts.append(new_post)
        existing_titles.add(title)
        existing_links.add(link)
        added_count += 1
        
        # Save on every success
        db["posts"] = existing_posts
        with open(DB_PATH, 'w', encoding='utf-8') as f:
            json.dump(db, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully added {added_count} new posts!")

if __name__ == "__main__":
    main()
