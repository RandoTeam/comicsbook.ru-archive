from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
            ]
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            viewport={'width': 1280, 'height': 720}
        )
        
        # Adding a fake navigator.webdriver
        context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        page = context.new_page()
        page.goto("https://pikabu.ru/tag/Comicsbook/new?page=1")
        
        try:
            page.wait_for_selector("article.story", timeout=20000)
            print("Found story element!")
        except Exception as e:
            print("Timeout waiting for story:", e)
        
        html = page.content()
        with open("c:\\G_3.1\\comicsbook\\pikabu_test2.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        browser.close()

if __name__ == "__main__":
    main()
