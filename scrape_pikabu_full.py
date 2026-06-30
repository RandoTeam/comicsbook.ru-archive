from curl_cffi import requests
from bs4 import BeautifulSoup
import json
import time
import random

def fetch_page(page_num):
    url = f"https://pikabu.ru/tag/Comicsbook/new?page={page_num}"
    print(f"Fetching page {page_num}...")
    response = requests.get(url, impersonate="chrome110")
    if response.status_code != 200:
        print(f"Failed to fetch page {page_num}: {response.status_code}")
        return None
    
    # Correct encoding for Pikabu
    text = response.content.decode('windows-1251', errors='replace')
    return text

def parse_html(html):
    soup = BeautifulSoup(html, "html.parser")
    posts = []
    
    # Process each story
    for article in soup.find_all("article", class_="story"):
        post = {}
        
        # Link and Title
        title_tag = article.find("a", class_="story__title-link")
        if title_tag:
            post['title'] = title_tag.get_text(strip=True)
            post['link'] = title_tag.get('href')
        else:
            continue # maybe not a valid post or an ad
            
        # Date
        time_tag = article.find("time")
        if time_tag:
            post['date'] = time_tag.get('datetime', time_tag.get_text(strip=True))
        else:
            post['date'] = None
            
        # Rating
        rating_tag = article.find("div", class_="story__rating-count")
        if rating_tag:
            post['rating'] = rating_tag.get_text(strip=True)
        else:
            post['rating'] = None
            
        # Main image URL
        content = article.find("div", class_="story__content")
        img_url = None
        if content:
            img_tag = content.find("img")
            if img_tag:
                # Sometimes images are lazy loaded
                img_url = img_tag.get("data-large-image") or img_tag.get("data-src") or img_tag.get("src")
        
        post['image_url'] = img_url
        
        posts.append(post)
        
    return posts

def main():
    all_posts = []
    for i in range(1, 6):
        html = fetch_page(i)
        if html:
            posts = parse_html(html)
            all_posts.extend(posts)
        time.sleep(random.uniform(1.5, 3.5))
        
    output_path = "c:\\G_3.1\\comicsbook\\data_extracted_pikabu.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_posts, f, indent=4, ensure_ascii=False)
        
    print(f"Extraction complete. Found {len(all_posts)} posts.")
    print(f"Data saved to {output_path}")

if __name__ == "__main__":
    main()
