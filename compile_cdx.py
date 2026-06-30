import json
import os
import re
import urllib.parse

files = ['funny_cdx.json', 'comic_cdx.json', 'optipess_cdx.json', 'lunarbaboon_cdx.json', 'channelate_cdx.json', 'poorlydrawnlines_cdx.json', 'smbreakfastcereal_cdx.json']

compiled = {}

for filename in files:
    if not os.path.exists(filename):
        print(f"File {filename} not found, skipping.")
        continue
        
    category = filename.split('_')[0]
    print(f"Processing {filename}...")
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
        # Find columns by checking the header row
        header = data[0]
        try:
            orig_idx = header.index('original')
            ts_idx = header.index('timestamp')
            mime_idx = header.index('mimetype')
        except ValueError:
            # Fallback if header doesn't match
            orig_idx, ts_idx, mime_idx = 2, 1, 3
            
        rows = data[1:]
        for row in rows:
            if len(row) <= max(orig_idx, ts_idx, mime_idx):
                continue
            orig = row[orig_idx]
            ts = row[ts_idx]
            mime = row[mime_idx]
            if mime == 'text/html':
                parsed = urllib.parse.urlparse(orig)
                path_parts = parsed.path.strip('/').split('/')
                if len(path_parts) >= 2:
                    id_part = path_parts[1]
                    match = re.match(r'^(\d+)', id_part)
                    if match:
                        post_id = int(match.group(1))
                        if post_id > 500000:
                            continue
                        if post_id not in compiled or ts > compiled[post_id]['timestamp']:
                            compiled[post_id] = {
                                'id': post_id,
                                'category': category,
                                'original_url': orig,
                                'timestamp': ts
                            }

print(f"Compiled total of {len(compiled)} unique archived posts.")
with open('compiled_cdx.json', 'w', encoding='utf-8') as f:
    json.dump(compiled, f, indent=2)
print("Saved to compiled_cdx.json")
