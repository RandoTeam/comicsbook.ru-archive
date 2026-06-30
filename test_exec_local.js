const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('sample_vk_posts.html', 'utf-8');
const $ = cheerio.load(html);

$('div[data-post-id]').each((i, post) => {
    const id = $(post).attr('data-post-id');
    const cbLinks = [];
    
    // Find all elements with data-exec
    let els = $(post).find('[data-exec]').addBack('[data-exec]');
    
    els.each((j, el) => {
        const raw = $(el).attr('data-exec');
        try {
            const execData = JSON.parse(raw);
            const jsonStr = JSON.stringify(execData);
            const matches = jsonStr.match(/comicsbook\.ru[^\"]*/g) || [];
            matches.forEach(m => {
                cbLinks.push(m);
            });
        } catch(e) {
            console.log(`Failed to parse for post ${id}:`, e.message);
        }
    });
    
    if (cbLinks.length > 0) {
        console.log(`Post ${id} cbLinks:`, cbLinks);
    }
});
