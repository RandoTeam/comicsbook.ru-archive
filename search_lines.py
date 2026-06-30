html = open('sample_post.html', 'r', encoding='utf-8').read()
with open('lines.txt', 'w', encoding='utf-8') as f:
    for line in html.split('\n'):
        if 'comicsbook.ru' in line.lower():
            f.write(line + "\n")
