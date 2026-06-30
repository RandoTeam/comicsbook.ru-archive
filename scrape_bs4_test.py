from curl_cffi import requests
from bs4 import BeautifulSoup
import json

def fetch_page(page_num):
    url = f"https://pikabu.ru/tag/Comicsbook/new?page={page_num}"
    response = requests.get(url, impersonate="chrome110")
    if response.status_code != 200:
        print(f"Failed to fetch page {page_num}: {response.status_code}")
        return None
    # Pikabu's charset might be windows-1251 according to meta, curl_cffi usually gets bytes right.
    # response.text is decoded.
    # The meta tag says windows-1251, so we should decode it manually if response.text is mangled.
    response.encoding = 'windows-1251'
    return response.text

def parse_html(html):
    soup = BeautifulSoup(html, "html.parser")
    posts = []
    # In Pikabu, articles are in <article class="story">
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
        # Might be in an img tag with class story-image__image, or similar
        # We will look for the first img or something inside the story__content
        content = article.find("div", class_="story__content")
        img_url = None
        if content:
            img_tag = content.find("img")
            if img_tag:
                # Sometimes images are lazy loaded (data-src, data-large-image)
                img_url = img_tag.get("data-large-image") or img_tag.get("data-src") or img_tag.get("src")
        
        post['image_url'] = img_url
        
        posts.append(post)
        
    return posts

def main():
    html = fetch_page(1)
    posts = parse_html(html)
    print(json.dumps(posts[:2], indent=4, ensure_ascii=False))

if __name__ == "__main__":
    main()
