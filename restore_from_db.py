import json
import sqlite3
import os

data_path = os.path.join('react_app', 'public', 'data.json')
with open(data_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

posts = db['posts']

conn = sqlite3.connect('comics.db')
cursor = conn.cursor()

ratings_updated = 0
titles_updated = 0
categories_updated = 0
authors_updated = 0

for p in posts:
    post_id = p['id']
    if not isinstance(post_id, int):
        continue
    
    # Query comics.db
    cursor.execute("SELECT rating, title, category, author FROM comics WHERE id = ? AND status = 'success'", (post_id,))
    row = cursor.fetchone()
    if row:
        rating, title, category, author = row
        
        # Update rating if it is non-zero (or if the current rating is 0/None)
        if rating is not None and rating != 0:
            p['rating'] = rating
            ratings_updated += 1
            
        # Update title if it is missing or is just a VK snippet
        if title and (not p.get('title') or p.get('title').endswith('...')):
            # Decode windows-1251 if it was messed up
            # Wait, the title in DB is already decoded but let's check
            p['title'] = title
            titles_updated += 1
            
        # Update category if it is ВКонтакте
        if category and p.get('category') == 'ВКонтакте':
            p['category'] = category
            categories_updated += 1
            
        # Update author if it is VK or Unknown
        if author and p.get('author') in ['VK', 'Unknown']:
            p['author'] = author
            authors_updated += 1

db['posts'] = posts
with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, separators=(',', ':'))

print(f"Restored from comics.db:")
print(f"  Ratings updated: {ratings_updated}")
print(f"  Titles updated: {titles_updated}")
print(f"  Categories updated: {categories_updated}")
print(f"  Authors updated: {authors_updated}")
conn.close()
