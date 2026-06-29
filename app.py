import os
import sqlite3
import random
import urllib.parse
from flask import Flask, render_template, request, send_from_directory, redirect, url_for, abort

app = Flask(__name__, template_folder='templates')
app.jinja_env.globals.update(max=max, min=min)

DB_PATH = os.path.join(os.path.dirname(__file__), 'comics.db')
BASE_DIR = os.path.dirname(__file__)

# Helper to execute DB queries
def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, args)
    rv = cursor.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv

def process_posts(posts):
    processed = []
    if not posts:
        return processed
        
    post_ids = [post['id'] for post in posts if post]
    if not post_ids:
        return processed
        
    # Fetch all comments for these posts in one query
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    placeholders = ','.join(['?'] * len(post_ids))
    cursor.execute(f"SELECT * FROM comments WHERE post_id IN ({placeholders})", post_ids)
    comments_rows = cursor.fetchall()
    conn.close()
    
    # Group comments by post_id
    comments_by_post = {}
    for comment in comments_rows:
        pid = comment['post_id']
        if pid not in comments_by_post:
            comments_by_post[pid] = []
        comments_by_post[pid].append(dict(comment))
        
    for post in posts:
        if not post:
            continue
        post_dict = dict(post)
        if post_dict.get('image_url'):
            filename = urllib.parse.unquote(post_dict['image_url'].split('/')[-1])
            # Make sure it matches the WebP file extension on disk
            if not filename.endswith('.webp'):
                base_name, _ = os.path.splitext(filename)
                filename = f"{base_name}.webp"
            local_path = os.path.join(BASE_DIR, 'upload', filename)
            post_dict['local_exists'] = os.path.exists(local_path) and os.path.getsize(local_path) > 0
            post_dict['filename'] = filename
        else:
            post_dict['local_exists'] = False
            post_dict['filename'] = None
            
        post_dict['comments'] = comments_by_post.get(post_dict['id'], [])
        processed.append(post_dict)
    return processed

# Route to serve css/
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'css'), filename)

# Route to serve js/
@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'js'), filename)

# Route to serve img/
@app.route('/img/<path:filename>')
def serve_img(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'img'), filename)

# Route to serve upload/
@app.route('/upload/<path:filename>')
def serve_upload(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'upload'), filename)

# Route for favicon
@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory(BASE_DIR, 'favicon.ico')

# Main homepage
@app.route('/')
@app.route('/all')
@app.route('/best')
def index():
    page = request.args.get('p', 1, type=int)
    sort_type = request.args.get('sort', 'best') # 'best' (by rating DESC) or 'new' (by id DESC)
    if request.path == '/all':
        sort_type = 'new'
    elif request.path == '/best':
        sort_type = 'best'
    
    per_page = 10
    offset = (page - 1) * per_page
    
    order_clause = "rating DESC, id DESC" if sort_type == 'best' else "id DESC"
    
    posts = query_db(f'''
        SELECT * FROM comics 
        WHERE status = 'success' AND image_url IS NOT NULL 
        ORDER BY {order_clause} 
        LIMIT ? OFFSET ?
    ''', (per_page, offset))
    
    # Get total count
    total_row = query_db('SELECT count(*) FROM comics WHERE status = "success" AND image_url IS NOT NULL', one=True)
    total_posts = total_row[0] if total_row else 0
    total_pages = (total_posts + per_page - 1) // per_page
    
    # Get active categories list for sidebar
    categories_rows = query_db('SELECT category, count(*) as count FROM comics WHERE status = "success" GROUP BY category ORDER BY count DESC')
    
    # Sidebar: Discussed/popular posts (top 5 by rating)
    discussed = query_db('SELECT * FROM comics WHERE status = "success" AND image_url IS NOT NULL ORDER BY rating DESC LIMIT 5')
    
    return render_template('index.html', 
                           posts=process_posts(posts), 
                           page=page, 
                           total_pages=total_pages, 
                           sort=sort_type, 
                           categories=categories_rows,
                           discussed=process_posts(discussed),
                           current_category=None)

# Category pages
@app.route('/<category>/')
@app.route('/<category>')
def category_feed(category):
    # Check if category is actually a file or static assets that shouldn't be handled here
    if category in ('css', 'js', 'img', 'upload', 'favicon.ico', 'templates', 'static'):
        abort(404)
        
    page = request.args.get('p', 1, type=int)
    sort_type = request.args.get('sort', 'best')
    
    per_page = 10
    offset = (page - 1) * per_page
    
    order_clause = "rating DESC, id DESC" if sort_type == 'best' else "id DESC"
    
    posts = query_db(f'''
        SELECT * FROM comics 
        WHERE status = 'success' AND image_url IS NOT NULL AND LOWER(category) = LOWER(?)
        ORDER BY {order_clause} 
        LIMIT ? OFFSET ?
    ''', (category, per_page, offset))
    
    # Get total count
    total_row = query_db('SELECT count(*) FROM comics WHERE status = "success" AND image_url IS NOT NULL AND LOWER(category) = LOWER(?)', (category,), one=True)
    total_posts = total_row[0] if total_row else 0
    total_pages = (total_posts + per_page - 1) // per_page
    
    categories_rows = query_db('SELECT category, count(*) as count FROM comics WHERE status = "success" GROUP BY category ORDER BY count DESC')
    discussed = query_db('SELECT * FROM comics WHERE status = "success" AND image_url IS NOT NULL ORDER BY rating DESC LIMIT 5')
    
    # Capitalize category name for display
    category_display = category
    if posts:
        category_display = posts[0]['category']
        
    return render_template('index.html', 
                           posts=process_posts(posts), 
                           page=page, 
                           total_pages=total_pages, 
                           sort=sort_type, 
                           categories=categories_rows,
                           discussed=process_posts(discussed),
                           current_category=category,
                           category_display=category_display)

# Post detail page
@app.route('/<category>/<int:post_id>')
def post_detail(category, post_id):
    post = query_db('SELECT * FROM comics WHERE id = ?', (post_id,), one=True)
    if not post:
        abort(404)
        
    categories_rows = query_db('SELECT category, count(*) as count FROM comics WHERE status = "success" GROUP BY category ORDER BY count DESC')
    discussed = query_db('SELECT * FROM comics WHERE status = "success" AND image_url IS NOT NULL ORDER BY rating DESC LIMIT 5')
    
    # Try to find next/prev post IDs for navigation
    # Next post (ID larger than current)
    next_post = query_db('SELECT id, category FROM comics WHERE id > ? AND status = "success" AND image_url IS NOT NULL ORDER BY id ASC LIMIT 1', (post_id,), one=True)
    # Prev post (ID smaller than current)
    prev_post = query_db('SELECT id, category FROM comics WHERE id < ? AND status = "success" AND image_url IS NOT NULL ORDER BY id DESC LIMIT 1', (post_id,), one=True)
    
    return render_template('index.html', 
                           posts=process_posts([post]), 
                           categories=categories_rows,
                           discussed=process_posts(discussed),
                           is_single=True,
                           next_post=next_post,
                           prev_post=prev_post,
                           current_category=category)

# Random post
@app.route('/random')
def random_post():
    row = query_db('SELECT id, category FROM comics WHERE status = "success" AND image_url IS NOT NULL ORDER BY RANDOM() LIMIT 1', one=True)
    if not row:
        return redirect(url_for('index'))
    return redirect(url_for('post_detail', category=row['category'].lower(), post_id=row['id']))

# Search route
@app.route('/search')
def search():
    query = request.args.get('s', '').strip()
    if not query:
        return redirect(url_for('index'))
        
    page = request.args.get('p', 1, type=int)
    per_page = 10
    offset = (page - 1) * per_page
    
    posts = query_db('''
        SELECT * FROM comics 
        WHERE status = 'success' AND image_url IS NOT NULL AND title LIKE ?
        ORDER BY rating DESC, id DESC 
        LIMIT ? OFFSET ?
    ''', (f'%{query}%', per_page, offset))
    
    total_row = query_db('SELECT count(*) FROM comics WHERE status = "success" AND image_url IS NOT NULL AND title LIKE ?', (f'%{query}%',), one=True)
    total_posts = total_row[0] if total_row else 0
    total_pages = (total_posts + per_page - 1) // per_page
    
    categories_rows = query_db('SELECT category, count(*) as count FROM comics WHERE status = "success" GROUP BY category ORDER BY count DESC')
    discussed = query_db('SELECT * FROM comics WHERE status = "success" AND image_url IS NOT NULL ORDER BY rating DESC LIMIT 5')
    
    return render_template('index.html', 
                           posts=process_posts(posts), 
                           page=page, 
                           total_pages=total_pages, 
                           categories=categories_rows,
                           discussed=process_posts(discussed),
                           search_query=query)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
