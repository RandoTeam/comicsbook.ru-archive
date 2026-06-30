import re
html = open('sample_post.html', 'r', encoding='utf-8').read()
matches = re.findall(r'http[s]?://[^\s\"\'\(\)]+\.(?:jpg|png|webp|gif)', html)
for m in set(matches):
    print(m)
