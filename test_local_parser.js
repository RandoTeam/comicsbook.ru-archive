const fs = require('fs');
const cheerio = require('cheerio'); // cheerio is a fast DOM parser for Node

const html = fs.readFileSync('sample_vk_posts.html', 'utf-8');
const $ = cheerio.load(html);

$('div[data-post-id]').each((i, post) => {
    const id = $(post).attr('data-post-id');
    const cbLinks = [];
    
    // Find all data-exec attributes inside the post
    let els = $(post).find('[data-exec]').addBack('[data-exec]');
    
    els.each((j, el) => {
        try {
            const raw = $(el).attr('data-exec');
            const execData = JSON.parse(raw);
            const jsonStr = JSON.stringify(execData);
            const matches = jsonStr.match(/comicsbook\.ru[^\"]*/g) || [];
            matches.forEach(m => {
                let cleaned = m.replace(/\\\\\\//g, '/').replace(/\\/g, '');
                cbLinks.push(cleaned);
            });
        } catch(e) {}
    });
    
    console.log(`Post ID: ${id}, cbLinks:`, cbLinks);
});
