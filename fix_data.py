import json
import os

data_path = os.path.join('react_app', 'public', 'data.json')
with open(data_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

for p in db.get('posts', []):
    # Fix category
    if p.get('category') == 'VK Archive':
        p['category'] = 'ВКонтакте'
        
    # Fix string ID
    if isinstance(p['id'], str) and p['id'].startswith('vk_'):
        try:
            base_vk_id = int(p['id'].replace('vk_', '').replace('_', ''))
            p['id'] = 10000000 + base_vk_id
        except ValueError:
            p['id'] = 10000000 + (hash(p['id']) % 10000000)

with open(data_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, separators=(',', ':'))

print("data.json fixed.")
