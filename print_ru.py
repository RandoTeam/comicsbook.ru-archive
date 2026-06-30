import json
d = json.load(open('data_vk_full.json', 'r', encoding='utf-8'))
for p in d:
    if 'comicsbook.ru' in p.get('text','').lower():
        print(f"ID: {p['id']}")
        print(f"Text: {p['text'][:200]}")
        print("-" * 50)
