from curl_cffi import requests
import json

r = requests.get('https://pikabu.ru/tag/Comicsbook/new?page=1', impersonate='chrome110')
content = r.content
try:
    utf8 = content.decode('utf-8')
except Exception as e:
    utf8 = str(e)
    
try:
    win = content.decode('windows-1251')
except Exception as e:
    win = str(e)

with open('test_encoding.json', 'w', encoding='utf-8') as f:
    json.dump({'utf8': utf8[:200], 'win': win[:200]}, f, ensure_ascii=False)
