import json
import re
import os
from datetime import datetime

# Load data.json
data_path = os.path.join('react_app', 'public', 'data.json')
with open(data_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

posts = db.get('posts', [])
posts_by_id = {str(p['id']): p for p in posts}

# Load VK data
vk_data_path = 'data_vk_full.json'
if not os.path.exists(vk_data_path):
    print("data_vk_full.json not found yet.")
    exit(1)

with open(vk_data_path, 'r', encoding='utf-8') as f:
    vk_posts = json.load(f)

print(f"Loaded {len(posts)} existing posts and {len(vk_posts)} VK posts.")

new_posts_added = 0
likes_updated = 0

for vp in vk_posts:
    text = vp.get('text', '')
    link = vp.get('link', '')
    likes_str = vp.get('likes', '0').replace(' ', '').replace('K', '000').replace(',', '.')
    
    # Try to parse likes
    try:
        if 'K' in vp.get('likes', ''):
            likes = int(float(vp.get('likes').replace('K', '')) * 1000)
        else:
            likes = int(''.join(filter(str.isdigit, likes_str)) or 0)
    except:
        likes = 0
        
    # Find IDs in text or link
    matches = re.findall(r'comicsbook\.ru/(?:funny|comic)/(\d+)', text + ' ' + link)
    if matches:
        # Match found! Use the first ID
        post_id = str(matches[0])
        if post_id in posts_by_id:
            # Update rating
            p = posts_by_id[post_id]
            if not p.get('rating') or p.get('rating') == 0 or p.get('rating') < likes:
                p['rating'] = likes
                likes_updated += 1
        else:
            # Create new post
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
    else:
        # No comicsbook ID found. Generate a VK ID.
        vk_id = vp.get('id', '')
        # Only add if it has an image
        if vk_id and vp.get('imgUrl'):
            post_id = 'vk_' + str(vk_id).replace('-', '_')
            if post_id not in posts_by_id:
                new_post = {
                    'id': post_id,
                    'title': text[:100] + '...' if len(text) > 100 else text,
                    'category': 'VK Archive',
                    'author': 'VK',
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
with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, separators=(',', ':'))

print(f"Updated {likes_updated} ratings from VK.")
print(f"Added {new_posts_added} new posts from VK.")
print(f"Total posts now: {len(db['posts'])}")
