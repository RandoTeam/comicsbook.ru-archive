import urllib.parse
import re

html = open('sample_vk_posts.html', 'r', encoding='utf-8').read()
decoded = urllib.parse.unquote(html)

with open('contexts.txt', 'w', encoding='utf-8') as f:
    for m in re.finditer(r'comicsbook\.ru', decoded, re.IGNORECASE):
        start = max(0, m.start() - 150)
        end = min(len(decoded), m.end() + 150)
        f.write("CONTEXT:\n" + decoded[start:end] + "\n" + "="*50 + "\n")
