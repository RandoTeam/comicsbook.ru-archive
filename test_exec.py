from bs4 import BeautifulSoup
import json
import re
soup = BeautifulSoup(open('sample_post.html', 'r', encoding='utf-8').read(), 'html.parser')
for el in soup.find_all(attrs={'data-exec': True}):
    val = el['data-exec']
    print('RAW ATTR VAL CONTAINS comicsbook.ru:', 'comicsbook.ru' in val)
    try:
        data = json.loads(val)
        print('PARSED SUCCESS')
        json_str = json.dumps(data)
        print('JSON STR CONTAINS comicsbook.ru:', 'comicsbook.ru' in json_str)
        matches = re.findall(r'comicsbook\.ru[^\"]*', json_str)
        print('MATCHES:', matches)
    except Exception as e:
        print('FAILED TO PARSE:', e)
