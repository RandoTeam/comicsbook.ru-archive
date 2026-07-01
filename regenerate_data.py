import json
import sqlite3
import os

BASE_DIR = r"c:\G_3.1\comicsbook"
DB_PATH = os.path.join(BASE_DIR, "comics.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "upload")
OUTPUT_PATH = os.path.join(BASE_DIR, "react_app", "public", "data.json")

print("Regenerating database JSON...")
if not os.path.exists(DB_PATH):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# 1. Fetch successful posts
cursor.execute("SELECT id, title, category, author, date_str, image_url, rating, timestamp FROM comics WHERE status = 'success'")
posts = []
for row in cursor.fetchall():
    post_dict = dict(row)
    if post_dict['image_url']:
        filename = post_dict['image_url'].split('/')[-1]
        if not filename.endswith('.webp'):
            base_name, _ = os.path.splitext(filename)
            filename = f"{base_name}.webp"
        post_dict['filename'] = filename
        webp_path = os.path.join(UPLOAD_DIR, filename)
        post_dict['image_exists'] = os.path.exists(webp_path)
    else:
        post_dict['filename'] = None
        post_dict['image_exists'] = False
    posts.append(post_dict)

# 2. Fetch comments
cursor.execute("SELECT post_id, author_name, avatar_url, comment_text FROM comments")
comments_by_post = {}
for row in cursor.fetchall():
    post_id = row['post_id']
    if post_id not in comments_by_post:
        comments_by_post[post_id] = []
    comments_by_post[post_id].append({
        'name': row['author_name'],
        'avatar': row['avatar_url'],
        'text': row['comment_text']
    })

conn.close()

export_data = {
    'posts': posts,
    'comments': comments_by_post
}

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(export_data, f, ensure_ascii=False, separators=(',', ':'))

print(f"Successfully generated {OUTPUT_PATH} with {len(posts)} posts.")
