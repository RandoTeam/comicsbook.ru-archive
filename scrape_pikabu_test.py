from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def main():
    with Stealth().use_sync(sync_playwright()) as p:
        browser = p.chromium.launch(headless=False) # sometimes headless=False helps with Cloudflare / DDOS-Guard
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        )
        page.goto("https://pikabu.ru/tag/Comicsbook/new?page=1")
        
        # wait for an article or at least 15s
        try:
            page.wait_for_selector("article.story", timeout=20000)
            print("Found story element!")
        except Exception as e:
            print("Timeout waiting for story:", e)
        
        html = page.content()
        with open("c:\\G_3.1\\comicsbook\\pikabu_test.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        browser.close()

if __name__ == "__main__":
    main()
