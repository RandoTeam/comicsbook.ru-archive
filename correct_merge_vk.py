import json
import re
import os
from datetime import datetime

# Path to clean original data.json
data_path = 'temp_apk_extract/assets/www/data.json'
if not os.path.exists(data_path):
    # Fallback to local data.json if temp doesn't exist yet
    data_path = os.path.join('react_app', 'public', 'data.json')

with open(data_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

posts = db.get('posts', [])

# Since we want to load the CLEAN original database, let's filter out any existing vk_ posts
posts = [p for p in posts if isinstance(p['id'], int)]
posts_by_id = {str(p['id']): p for p in posts}

print(f"Loaded {len(posts)} clean posts to start merge.")

# Load VK data
vk_data_path = 'data_vk_full.json'
with open(vk_data_path, 'r', encoding='utf-8') as f:
    vk_posts = json.load(f)

new_posts_added = 0
likes_updated = 0

EXCLUDED_CATEGORIES = {
    'users', 'user', 'upload', 'images', 'gif', 'wall', 'all', 'hot', 'slider', 
    'templates', 'add', 'news', 'faq', 'rating', 'search', 'random', 
    'tags', 'tag', 'wiki', 'contacts', 'advert', 'promo', 'comment'
}

for vp in vk_posts:
    text = vp.get('text', '')
    link = vp.get('link', '')
    cb_links = vp.get('cbLinks', [])
    likes_str = vp.get('likes', '0').replace(' ', '').replace('K', '000').replace(',', '.')
    
    try:
        if 'K' in vp.get('likes', ''):
            likes = int(float(vp.get('likes').replace('K', '')) * 1000)
        else:
            likes = int(''.join(filter(str.isdigit, likes_str)) or 0)
    except:
        likes = 0
        
    search_space = ' '.join([text, link] + cb_links)
    
    # Robust regex matching category and ID
    matches = re.findall(r'comicsbook\.ru/([^/]+)/(\d+)', search_space, re.IGNORECASE)
    
    valid_id = None
    for cat, post_id in matches:
        if cat.lower() not in EXCLUDED_CATEGORIES:
            valid_id = post_id
            break
            
    if valid_id:
        post_id = str(valid_id)
        if post_id in posts_by_id:
            p = posts_by_id[post_id]
            p['rating'] = likes
            likes_updated += 1
        else:
            new_post = {
                'id': int(post_id),
                'title': text[:100] + '...' if len(text) > 100 else text,
                'category': 'VK Archive',
                'author': 'Unknown',
                'date_str': vp.get('dateStr', ''),
                'image_url': vp.get('imgUrl', ''),
                'rating': likes,
                'timestamp': datetime.now().strftime('%Y%m%d%H%M%S'),
                'filename': None
            }
            posts.append(new_post)
            posts_by_id[post_id] = new_post
            new_posts_added += 1

db['posts'] = posts
output_path = os.path.join('react_app', 'public', 'data.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, separators=(',', ':'))

print(f"Updated {likes_updated} ratings from VK.")
print(f"Added {new_posts_added} new posts from VK.")
print(f"Total posts now: {len(db['posts'])}")
