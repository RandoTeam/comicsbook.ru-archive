import json
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from bs4 import BeautifulSoup

def scroll_and_scrape():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        stealth = Stealth()
        stealth.apply_stealth_sync(page)
        
        print("Navigating to VK page...")
        page.goto("https://vk.com/comicsbook", wait_until="networkidle")
        
        try:
            page.wait_for_selector("div[data-post-id]", timeout=15000)
            print("Found initial posts.")
        except Exception as e:
            print("Could not find posts on initial load:", e)
            
        parsed_ids = set()
        results = []
        target_count = 75
        
        for i in range(40):
            html = page.content()
            soup = BeautifulSoup(html, "html.parser")
            posts = soup.select("div[data-post-id]")
            
            for post in posts:
                post_id = post.get("data-post-id")
                # Filter out reply posts or ad posts if needed, but we'll just grab everything with a post-id
                if not post_id or post_id in parsed_ids:
                    continue
                
                parsed_ids.add(post_id)
                
                # Date and Link
                date_el = post.select_one("a[data-testid='post_date_block_preview']")
                if date_el:
                    link = "https://vk.com" + date_el.get("href")
                    date_str = date_el.get_text(strip=True)
                else:
                    link = f"https://vk.com/wall{post_id}"
                    date_str = ""
                
                # Text
                text_el = post.select_one("span[data-post-id]") or post.select_one("div[data-testid='showmoretext']")
                text = text_el.get_text(separator="\n", strip=True) if text_el else ""
                
                # Rating (Likes)
                likes_el = post.select_one("div[data-testid='post_footer_action_like']")
                likes = ""
                if likes_el:
                    likes_span = likes_el.select_one("span[class*='label']") or likes_el.select_one("span.vkitPostFooterAction__label--84hyA")
                    if likes_span:
                        likes = likes_span.get_text(strip=True)
                        
                # Image
                img_el = post.select_one("img[data-testid='primary-attachment-image-content']") or post.select_one("a[href^='/photo'] img")
                image_url = img_el.get("src") if img_el else ""
                
                results.append({
                    "id": post_id,
                    "date": date_str,
                    "title": text,
                    "link": link,
                    "rating": likes,
                    "image_url": image_url
                })
            
            print(f"Scroll {i}: Extracted {len(results)} posts so far.")
            if len(results) >= target_count:
                break
                
            # Scroll down
            page.evaluate("window.scrollBy(0, 3000)")
            page.wait_for_timeout(2000)
            
        browser.close()
        
        results = results[:100]  # Ensure max 100
        
        output_file = "c:\\G_3.1\\comicsbook\\data_extracted_vk.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Saved {len(results)} posts to {output_file}")

if __name__ == "__main__":
    scroll_and_scrape()
