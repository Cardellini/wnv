import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const DIST = './dist';
const OUTPUT = './dist/search-index.json';

async function getHtmlFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('_') && entry.name !== 'pagefind') {
            files.push(...await getHtmlFiles(full));
        } else if (entry.name === 'index.html') {
            files.push(full);
        }
    }
    return files;
}

function extractText(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractTitle(html) {
    const match = html.match(/<title>(.*?)<\/title>/i);
    if (!match) return '';
    return match[1].replace(' — Wind & Verse', '').replace('Wind & Verse', '').trim();
}

function getType(url) {
    if (url.includes('/poem/')) return 'Poem';
    if (url.includes('/stories/')) return 'Story';
    if (url.includes('/blog/')) return 'Blog';
    if (url.includes('/about')) return 'About';
    return 'Page';
}

async function build() {
    const files = await getHtmlFiles(DIST);
    const index = [];

    for (const file of files) {
        const html = await readFile(file, 'utf-8');
        const url = '/' + path.relative(DIST, file)
            .replace(/\\/g, '/')
            .replace('index.html', '')
            .replace(/\/$/, '') || '/';
        
        const title = extractTitle(html);
        const text  = extractText(html);
        const excerpt = text.slice(0, 300);
        const type  = getType(url);

        if (!title || url === '/404' || url === '/') continue;

        index.push({ title, url, excerpt, type, text });
    }

    await writeFile(OUTPUT, JSON.stringify(index));
    console.log(`Search index built: ${index.length} pages indexed`);
}

build().catch(console.error);