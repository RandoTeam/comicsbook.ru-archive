from bs4 import BeautifulSoup
import json

soup = BeautifulSoup(open('sample_post.html', 'r', encoding='utf-8').read(), 'html.parser')
def find_key(d, key):
    if isinstance(d, dict):
        for k, v in d.items():
            if k == key:
                yield v
            yield from find_key(v, key)
    elif isinstance(d, list):
        for item in d:
            yield from find_key(item, key)

with open('exec_out.txt', 'w', encoding='utf-8') as f:
    for el in soup.find_all(attrs={'data-exec': True}):
        data = json.loads(el['data-exec'])
        f.write(f"EL keys: {list(data.keys())}\n")
        t = list(find_key(data, 'text'))
        if t: f.write(f"  texts: {t}\n")
        u = list(find_key(data, 'url'))
        if u: f.write(f"  urls: {u}\n")
