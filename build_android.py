import os
import sqlite3
import json
import shutil
import subprocess
import sys

BASE_DIR = r"C:\G_3.1\comicsbook"
CORDOVA_DIR = os.path.join(BASE_DIR, "cordova_app")
DB_PATH = os.path.join(BASE_DIR, "comics.db")
UPLOAD_DIR = os.path.join(BASE_DIR, "upload")

def export_database():
    print("Exporting database to JSON...")
    if not os.path.exists(DB_PATH):
        print("Database not found! Run scrape_ratings.py first.")
        return False
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Fetch all successful posts
    cursor.execute("SELECT id, title, category, author, date_str, image_url, rating, timestamp FROM comics WHERE status = 'success'")
    posts = []
    for row in cursor.fetchall():
        post_dict = dict(row)
        # Extract WebP filename from image_url
        if post_dict['image_url']:
            filename = post_dict['image_url'].split('/')[-1]
            # Make sure it ends with webp
            if not filename.endswith('.webp'):
                base_name, _ = os.path.splitext(filename)
                filename = f"{base_name}.webp"
            post_dict['filename'] = filename
        else:
            post_dict['filename'] = None
        posts.append(post_dict)
        
    # 2. Fetch all comments
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
    
    www_dir = os.path.join(CORDOVA_DIR, "www")
    os.makedirs(www_dir, exist_ok=True)
    json_path = os.path.join(www_dir, "data.json")
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
        
    print(f"Database exported successfully to {json_path} ({len(posts)} posts).")
    return True

def create_cordova_app():
    if not os.path.exists(CORDOVA_DIR):
        print("Creating Cordova app project...")
        # Run npx cordova create
        try:
            # We run in BASE_DIR
            subprocess.run(
                ["npx", "cordova", "create", "cordova_app", "ru.comicsbook.app", "Comicsbook"],
                cwd=BASE_DIR,
                check=True,
                shell=True
            )
            print("Cordova app created successfully.")
        except Exception as e:
            print(f"Failed to create Cordova project: {e}")
            return False
    return True

def copy_assets():
    print("Copying assets (CSS, JS, Images) into Cordova www/ folder...")
    www_dir = os.path.join(CORDOVA_DIR, "www")
    
    # Create destinations
    os.makedirs(os.path.join(www_dir, "css"), exist_ok=True)
    os.makedirs(os.path.join(www_dir, "img", "cats"), exist_ok=True)
    os.makedirs(os.path.join(www_dir, "upload"), exist_ok=True)
    
    # 1. Copy style.css
    src_css = os.path.join(BASE_DIR, "css", "style.css")
    if os.path.exists(src_css):
        shutil.copy(src_css, os.path.join(www_dir, "css", "style.css"))
        
    # 2. Copy cats gif icons
    src_cats = os.path.join(BASE_DIR, "img", "cats")
    if os.path.exists(src_cats):
        for f in os.listdir(src_cats):
            if f.endswith('.gif'):
                shutil.copy(os.path.join(src_cats, f), os.path.join(www_dir, "img", "cats", f))
                
    # 3. Copy WebP images
    print("Copying WebP images from upload/ to www/upload/...")
    copied_count = 0
    if os.path.exists(UPLOAD_DIR):
        for f in os.listdir(UPLOAD_DIR):
            if f.endswith('.webp'):
                shutil.copy(os.path.join(UPLOAD_DIR, f), os.path.join(www_dir, "upload", f))
                copied_count += 1
    print(f"Copied {copied_count} WebP images.")
    return True

def write_mobile_index():
    print("Writing mobile frontend www/index.html...")
    www_dir = os.path.join(CORDOVA_DIR, "www")
    
    # Mobile optimized HTML/JS
    mobile_html = """<!DOCTYPE HTML>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5.0, user-scalable=yes">
    <title>Comicsbook.ru</title>
    <link href="css/style.css" rel="stylesheet" type="text/css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
            padding-bottom: 70px; /* Space for bottom nav */
        }
        
        /* Sticky Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #2b587a;
            color: #fff;
            padding: 12px 16px;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .logo {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .header-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        .header-btn {
            background: transparent;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .wrapper {
            max-width: 600px;
            margin: 0 auto;
            padding: 12px;
            box-sizing: border-box;
        }
        
        /* Search Box (collapsible) */
        .search-box {
            margin-bottom: 12px;
            display: none;
        }
        .search-box.visible {
            display: block;
        }
        .search-box input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #ccc;
            border-radius: 20px;
            box-sizing: border-box;
            font-size: 15px;
            outline: none;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
        }
        
        /* Sort filter sub-bar */
        .sort-bar {
            display: flex;
            background: #fff;
            border-radius: 8px;
            padding: 4px;
            margin-bottom: 12px;
            border: 1px solid #e0e0e0;
        }
        .sort-btn {
            flex: 1;
            background: transparent;
            border: none;
            padding: 8px;
            font-weight: bold;
            font-size: 13px;
            color: #555;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
        }
        .sort-btn.active {
            background: #e1e7ed;
            color: #2b587a;
        }
        
        /* Mobile Cards Layout */
        .item {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            margin-bottom: 16px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .item header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }
        .item header .ava {
            margin-right: 12px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
            border: 1px solid #e0e0e0;
        }
        .item header .ava img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .item header .text h2 {
            font-size: 14px;
            margin: 0;
            color: #2b587a;
        }
        .item header .text h3 {
            font-size: 16px;
            margin: 4px 0 0 0;
            color: #111;
            font-weight: 600;
        }
        .item section {
            text-align: center;
            margin: 12px 0;
            overflow: hidden;
            border-radius: 8px;
            background: #fafafa;
        }
        .item section img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .item footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #f0f0f0;
            padding-top: 12px;
            color: #666;
            font-size: 13px;
        }
        .item footer .comments-trigger {
            color: #2b587a;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .item footer .rate {
            display: flex;
            align-items: center;
            font-weight: bold;
            font-size: 16px;
            background: #f0f2f5;
            padding: 4px 10px;
            border-radius: 15px;
        }
        .item footer .rate p {
            margin: 0 10px;
            color: #2b587a;
        }
        
        /* Comments list */
        .comments-section {
            background: #fafafa;
            border-top: 1px dashed #ddd;
            padding: 10px;
            margin-top: 12px;
            display: none;
            border-radius: 8px;
        }
        .comment-item {
            display: flex;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
            font-size: 13px;
        }
        .comment-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .comment-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-right: 10px;
            background: #eee;
        }
        .comment-body {
            flex: 1;
        }
        .comment-author {
            font-weight: bold;
            color: #2b587a;
            margin-bottom: 2px;
        }
        
        /* Bottom Navigation Bar */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 56px;
            background: #fff;
            border-top: 1px solid #e0e0e0;
            display: flex;
            z-index: 1000;
            box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
        }
        .nav-tab {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #8e8e93;
            text-decoration: none;
            cursor: pointer;
            transition: color 0.2s;
        }
        .nav-tab.active {
            color: #2b587a;
        }
        .nav-tab .icon {
            font-size: 20px;
            margin-bottom: 2px;
        }
        .nav-tab .label {
            font-size: 11px;
            font-weight: 500;
        }
        
        /* Categories Grid */
        .categories-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            padding: 4px 0;
        }
        .category-card {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            transition: transform 0.1s, box-shadow 0.1s;
        }
        .category-card:active {
            transform: scale(0.98);
            background: #f7f9fa;
        }
        .category-card-name {
            font-weight: bold;
            color: #2b587a;
            font-size: 14px;
        }
        .category-card-count {
            color: #777;
            font-size: 12px;
            margin-top: 4px;
        }
        
        /* Loader */
        .loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 0;
            color: #666;
        }
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #2b587a;
            animation: spin 1s linear infinite;
            margin-bottom: 12px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo" id="header-title">Comicsbook</div>
        <div class="header-actions">
            <button class="header-btn" onclick="toggleSearch()" id="search-toggle-btn">🔍</button>
        </div>
    </header>

    <div class="wrapper">
        <!-- Collapsible Search Box -->
        <div class="search-box" id="search-box">
            <input type="text" id="search-input" placeholder="Поиск по названию..." oninput="doSearch()">
        </div>
        
        <!-- Feed Page -->
        <div id="feed-page">
            <div class="sort-bar" id="sort-bar">
                <button class="sort-btn active" id="sort-best" onclick="changeSort('best')">🔥 Популярные</button>
                <button class="sort-btn" id="sort-new" onclick="changeSort('new')">⏳ Свежие</button>
            </div>
            
            <div id="posts-container">
                <div class="loader">
                    <div class="spinner"></div>
                    <p>Загрузка базы данных...</p>
                </div>
            </div>
            
            <div style="text-align: center; padding: 10px 0;" id="load-more-container">
                <button class="sort-btn" style="width: 100%; padding: 12px; background: white; border: 1px solid #e0e0e0; font-size:14px;" onclick="loadMore()">Показать еще</button>
            </div>
        </div>
        
        <!-- Categories Page -->
        <div id="categories-page" style="display:none;">
            <div class="categories-grid" id="categories-grid"></div>
        </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <div class="bottom-nav">
        <div class="nav-tab active" id="tab-feed" onclick="switchTab('feed')">
            <span class="icon">📰</span>
            <span class="label">Лента</span>
        </div>
        <div class="nav-tab" id="tab-categories" onclick="switchTab('categories')">
            <span class="icon">📁</span>
            <span class="label">Категории</span>
        </div>
        <div class="nav-tab" id="tab-random" onclick="switchTab('random')">
            <span class="icon">🎲</span>
            <span class="label">Случайный</span>
        </div>
    </div>

    <script>
        let db = { posts: [], comments: {} };
        let currentFeed = [];
        let displayCount = 10;
        let activeSort = 'best'; // 'best' or 'new'
        let activeCategory = null;
        let searchKeyword = '';
        let activeTab = 'feed';

        // Load JSON database
        fetch('data.json')
            .then(res => res.json())
            .then(data => {
                db = data;
                initApp();
            })
            .catch(err => {
                document.getElementById('posts-container').innerHTML = 
                    '<p style="text-align: center; color: red; padding: 40px 0;">Ошибка загрузки базы данных.</p>';
            });

        function initApp() {
            // Render category list in categories grid
            const categories = {};
            db.posts.forEach(p => {
                categories[p.category] = (categories[p.category] || 0) + 1;
            });

            const sortedCats = Object.keys(categories).sort((a, b) => categories[b] - categories[a]);
            const grid = document.getElementById('categories-grid');
            grid.innerHTML = '';
            sortedCats.forEach(cat => {
                const card = document.createElement('div');
                card.className = 'category-card';
                card.innerHTML = `
                    <div class="category-card-name">${cat}</div>
                    <div class="category-card-count">${categories[cat]} постов</div>
                `;
                card.onclick = () => filterCategory(cat);
                grid.appendChild(card);
            });

            updateFeed();
        }

        function switchTab(tab) {
            activeTab = tab;
            
            // Update tab UI
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(`tab-${tab}`).classList.add('active');
            
            if (tab === 'feed') {
                document.getElementById('feed-page').style.display = 'block';
                document.getElementById('categories-page').style.display = 'none';
                document.getElementById('sort-bar').style.display = 'flex';
                document.getElementById('search-toggle-btn').style.display = 'block';
                
                // Update header title based on active category
                if (activeCategory) {
                    document.getElementById('header-title').innerText = activeCategory;
                } else {
                    document.getElementById('header-title').innerText = 'Comicsbook';
                }
            } else if (tab === 'categories') {
                document.getElementById('feed-page').style.display = 'none';
                document.getElementById('categories-page').style.display = 'block';
                document.getElementById('header-title').innerText = 'Категории';
                document.getElementById('search-toggle-btn').style.display = 'none';
                document.getElementById('search-box').classList.remove('visible');
            } else if (tab === 'random') {
                // If random, show random in feed view
                document.getElementById('feed-page').style.display = 'block';
                document.getElementById('categories-page').style.display = 'none';
                document.getElementById('sort-bar').style.display = 'none';
                document.getElementById('search-toggle-btn').style.display = 'none';
                document.getElementById('search-box').classList.remove('visible');
                
                // Switch tab selection back to feed visually to represent view state
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.getElementById('tab-feed').classList.add('active');
                
                showRandom();
            }
            
            // Scroll to top
            window.scrollTo(0, 0);
        }

        function toggleSearch() {
            const searchBox = document.getElementById('search-box');
            searchBox.classList.toggle('visible');
            if (searchBox.classList.contains('visible')) {
                document.getElementById('search-input').focus();
            } else {
                document.getElementById('search-input').value = '';
                if (searchKeyword) {
                    searchKeyword = '';
                    updateFeed();
                }
            }
        }

        function filterCategory(cat) {
            activeCategory = cat;
            switchTab('feed');
        }

        function changeSort(sort) {
            activeSort = sort;
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(`sort-${sort}`).classList.add('active');
            updateFeed();
        }

        function showRandom() {
            if (db.posts.length === 0) return;
            const randIndex = Math.floor(Math.random() * db.posts.length);
            const post = db.posts[randIndex];
            
            activeCategory = null;
            document.getElementById('header-title').innerText = 'Случайный комикс';
            currentFeed = [post];
            displayCount = 1;
            renderFeed();
        }

        function doSearch() {
            searchKeyword = document.getElementById('search-input').value.toLowerCase().trim();
            updateFeed();
        }

        function updateFeed() {
            let filtered = [...db.posts];
            
            // Category filter
            if (activeCategory) {
                filtered = filtered.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
            }

            // Search filter
            if (searchKeyword) {
                const queryWords = searchKeyword.toLowerCase().split(/\s+/).filter(Boolean);
                filtered = filtered.filter(p => {
                    const postComments = db.comments[p.id] || [];
                    const commentsText = postComments.map(c => (c.text || '') + ' ' + (c.name || '')).join(' ').toLowerCase();
                    
                    const title = (p.title || '').toLowerCase();
                    const category = (p.category || '').toLowerCase();
                    const author = (p.author || '').toLowerCase();
                    const idStr = String(p.id);

                    return queryWords.every(word => {
                        if (title.includes(word) || category.includes(word) || author.includes(word) || commentsText.includes(word) || idStr === word) {
                            return true;
                        }
                        
                        const titleWords = title.split(/[^a-zA-Z0-9а-яА-ЯёЁ]+/).filter(w => w.length >= 3);
                        if (titleWords.some(tw => word.includes(tw) || tw.includes(word))) {
                            return true;
                        }
                        
                        return false;
                    });
                });
            }

            // Sort
            if (activeSort === 'best') {
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            } else {
                filtered.sort((a, b) => b.id - a.id);
            }

            currentFeed = filtered;
            displayCount = 10;
            renderFeed();
        }

        function loadMore() {
            displayCount += 10;
            renderFeed();
        }

        function toggleComments(postId) {
            const el = document.getElementById(`comments-${postId}`);
            el.style.display = el.style.display === 'block' ? 'none' : 'block';
        }

        function getCatGif(cat) {
            let gif = "28.gif";
            if (cat === "FFFUUUuuu") gif = "2.gif";
            else if (cat === "Trollface") gif = "1.gif";
            else if (cat === "Poker Face") gif = "5.gif";
            else if (cat === "LOL") gif = "4.gif";
            else if (cat === "Me Gusta") gif = "7.gif";
            else if (cat === "Okay") gif = "26.gif";
            else if (cat === "Genius") gif = "61.gif";
            else if (cat === "Forever Alone") gif = "25.gif";
            else if (cat === "Yao Ming") gif = "19.gif";
            return gif;
        }

        function renderFeed() {
            const container = document.getElementById('posts-container');
            const loadMoreBtn = document.getElementById('load-more-container');
            
            if (currentFeed.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #777; padding: 40px 0;">Комиксы не найдены.</p>';
                loadMoreBtn.style.display = 'none';
                return;
            }

            const visible = currentFeed.slice(0, displayCount);
            let html = '';
            
            visible.forEach(post => {
                const comments = db.comments[post.id] || [];
                const commentsCount = comments.length;
                const gif = getCatGif(post.category);
                
                let commentsHtml = '';
                comments.forEach(c => {
                    commentsHtml += `
                        <div class="comment-item">
                            <img class="comment-avatar" src="${c.avatar}">
                            <div class="comment-body">
                                <div class="comment-author">${c.name}</div>
                                <div class="comment-text">${c.text}</div>
                            </div>
                        </div>
                    `;
                });

                html += `
                    <div class="item" id="post-${post.id}">
                        <header>
                            <div class="ava"><img src="img/cats/${gif}"></div>
                            <div class="text">
                                <div style="font-size:12px; color:#777;">Добавил: ${post.author || 'Аноним'} / ${post.date_str || 'Архив'}</div>
                                <h2>${post.category}</h2>
                                <h3>${post.title || ''}</h3>
                            </div>
                        </header>
                        <section>
                            <img src="upload/${post.filename}">
                        </section>
                        <footer>
                            <div onclick="toggleComments(${post.id})" class="comments-trigger">
                                💬 Комментарии (${commentsCount})
                            </div>
                            <div class="rate">
                                <span>–</span>
                                <p>${post.rating}</p>
                                <span>+</span>
                            </div>
                        </footer>
                        <div class="comments-section" id="comments-${post.id}">
                            ${commentsHtml || '<p style="color:#777; font-size:12px; margin:0;">Комментариев нет.</p>'}
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
            loadMoreBtn.style.display = displayCount < currentFeed.length ? 'block' : 'none';
        }
    </script>
</body>
</html>
"""
    with open(os.path.join(www_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write(mobile_html)
    print("Mobile index.html written.")

def build_release_apk():
    print("Running Cordova release APK build...")
    # 1. Add android platform if not added
    platforms_dir = os.path.join(CORDOVA_DIR, "platforms", "android")
    if not os.path.exists(platforms_dir):
        print("Adding Android platform to Cordova project...")
        try:
            subprocess.run(
                ["npx", "cordova", "platform", "add", "android"],
                cwd=CORDOVA_DIR,
                check=True,
                shell=True
            )
        except Exception as e:
            print(f"Failed to add android platform: {e}")
            return False
            
    # 2. Build release APK specifically using --packageType=apk
    print("Compiling release APK...")
    try:
        subprocess.run(
            ["npx", "cordova", "build", "android", "--release", "--", "--packageType=apk"],
            cwd=CORDOVA_DIR,
            check=True,
            shell=True
        )
        print("Compilation complete!")
        
        # Check output APK path
        apk_output_dir = os.path.join(CORDOVA_DIR, "platforms", "android", "app", "build", "outputs", "apk", "release")
        unsigned_apk = os.path.join(apk_output_dir, "app-release-unsigned.apk")
        
        # In newer cordova-android versions it might be app-release.apk (signed or unsigned)
        # Let's check both
        if not os.path.exists(unsigned_apk):
            unsigned_apk = os.path.join(apk_output_dir, "app-release.apk")
            
        if os.path.exists(unsigned_apk):
            print(f"Release APK found: {unsigned_apk}")
            
            # 3. Create keystore if not exists
            keystore_path = os.path.join(BASE_DIR, "comicsbook.keystore")
            if not os.path.exists(keystore_path):
                print("Generating keystore for signing...")
                keytool_exe = os.path.join(os.environ.get("JAVA_HOME", ""), "bin", "keytool.exe")
                if not os.path.exists(keytool_exe):
                    keytool_exe = "keytool"
                    
                subprocess.run([
                    keytool_exe, "-genkey", "-v",
                    "-keystore", keystore_path,
                    "-alias", "comicsbook",
                    "-keyalg", "RSA",
                    "-keysize", "2048",
                    "-validity", "10000",
                    "-storepass", "123456",
                    "-keypass", "123456",
                    "-dname", "CN=comicsbook.ru, O=Comicsbook, L=Moscow, C=RU"
                ], check=True, shell=True)
                print(f"Keystore created at: {keystore_path}")
                
            # 4. Find Android SDK build-tools for zipalign and apksigner
            sdk_dir = r"C:\Users\Ilia V\AppData\Local\Android\Sdk\build-tools"
            build_tools_dirs = os.listdir(sdk_dir) if os.path.exists(sdk_dir) else []
            # Filter directories that look like version numbers (e.g. 36.0.0, 37.0.0)
            versioned_dirs = sorted([d for d in build_tools_dirs if os.path.exists(os.path.join(sdk_dir, d, "zipalign.exe"))])
            
            if not versioned_dirs:
                print("Error: Could not locate Android build-tools with zipalign.exe!")
                return False
                
            latest_build_tools = os.path.join(sdk_dir, versioned_dirs[-1])
            zipalign_exe = os.path.join(latest_build_tools, "zipalign.exe")
            apksigner_bat = os.path.join(latest_build_tools, "apksigner.bat")
            
            print(f"Using Android SDK build-tools from: {latest_build_tools}")
            
            # 5. Run zipalign
            print("Aligning APK using zipalign...")
            aligned_apk_path = os.path.join(BASE_DIR, "comicsbook-aligned.apk")
            if os.path.exists(aligned_apk_path):
                os.remove(aligned_apk_path)
                
            subprocess.run([
                zipalign_exe, "-v", "-f", "4",
                unsigned_apk, aligned_apk_path
            ], check=True, shell=True)
            
            # 6. Sign APK using apksigner (enables v2/v3 signatures required by modern Android)
            print("Signing APK using apksigner (v2/v3 schemes)...")
            final_apk_path = os.path.join(BASE_DIR, "comicsbook-release.apk")
            if os.path.exists(final_apk_path):
                os.remove(final_apk_path)
                
            subprocess.run([
                apksigner_bat, "sign",
                "--ks", keystore_path,
                "--ks-pass", "pass:123456",
                "--ks-key-alias", "comicsbook",
                "--key-pass", "pass:123456",
                "--out", final_apk_path,
                aligned_apk_path
            ], check=True, shell=True)
            
            # Clean up aligned temp APK
            if os.path.exists(aligned_apk_path):
                os.remove(aligned_apk_path)
                
            print(f"\nSUCCESS! Signed release APK with v2/v3 signature created at: {final_apk_path}")
            
            # 7. Verify installation on connected phone using ADB
            print("\nAttempting to install APK on connected device via ADB...")
            adb_exe = r"C:\Users\Ilia V\AppData\Local\Android\Sdk\platform-tools\adb.exe"
            if os.path.exists(adb_exe):
                adb_res = subprocess.run([adb_exe, "install", "-r", final_apk_path], capture_output=True, text=True, shell=True)
                print(f"ADB output: {adb_res.stdout.strip()}")
                if adb_res.stderr:
                    print(f"ADB Stderr: {adb_res.stderr.strip()}")
            else:
                print("adb.exe not found in platform-tools, skipping auto-installation check.")
                
            return final_apk_path
        else:
            print("Could not locate compiled APK output.")
            return False
    except Exception as e:
        print(f"Build/Signing failed: {e}")
        return False

def build_react_app():
    print("Building React frontend SPA...")
    react_dir = os.path.join(BASE_DIR, "react_app")
    try:
        subprocess.run(
            ["npm", "run", "build"],
            cwd=react_dir,
            check=True,
            shell=True
        )
        print("React frontend build complete.")
        return True
    except Exception as e:
        print(f"Failed to build React frontend: {e}")
        return False

def main():
    # Inject local Gradle bin directory into PATH
    gradle_bin = r"C:\G_3.1\comicsbook\gradle\bin"
    if os.path.exists(gradle_bin):
        os.environ["PATH"] = gradle_bin + os.path.pathsep + os.environ["PATH"]
        print(f"Injected local Gradle to PATH: {gradle_bin}")
        
    if not create_cordova_app():
        return
        
    # Build React app first so it populates www/ folder
    if not build_react_app():
        return
        
    if not export_database():
        return
        
    if not copy_assets():
        return
        
    # Check if user wants to build APK now
    build_release_apk()

if __name__ == '__main__':
    main()
