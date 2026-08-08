/* WIND & VERSE — JS SCRIPT
   One shared file for every page.*/

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

    /*  Card palettes  */
    const cardPalettes = [
        { bg: '#1a1a1e', text: '#e4d9c5', subtext: '#b8a994', accent: '#8a7a5a', border: '#3a352a', qMark: '#3a352a', pattern: 'dots' },
        { bg: '#6a5b74', text: '#f0e6d3', subtext: '#e5dcd0', accent: '#3a2c20', border: '#14150a', qMark: '#3a2c20', pattern: 'lines' },
        { bg: '#14150a', text: '#b8c9a0', subtext: '#75895b', accent: '#2b5420', border: '#4c563f', qMark: '#2b5420', pattern: 'diamonds' },
        { bg: '#4c563f', text: '#f0dcc0', subtext: '#dbc4a9', accent: '#964734', border: '#692721', qMark: '#b78953', pattern: 'waves' },
        { bg: '#0d0d0d', text: '#b49a83', subtext: '#8c7d72', accent: '#7e3e28', border: '#2c3e50', qMark: '#5b4636', pattern: 'grid' },
        { bg: '#3d2228', text: '#f4a971', subtext: '#de775f', accent: '#213241', border: '#272233', qMark: '#dd7057', pattern: 'dots' },
        { bg: '#d6d2c8', text: '#121212', subtext: '#6e3b46', accent: '#9a4e3a', border: '#3f4436', qMark: '#6e3b46', pattern: 'lines' },
        { bg: '#2b5420', text: '#f0e6d3', subtext: '#b3bea4', accent: '#4c563f', border: '#14150a', qMark: '#75895b', pattern: 'diamonds' },
        { bg: '#964734', text: '#f4e8d0', subtext: '#e5d5c2', accent: '#692721', border: '#4c563f', qMark: '#b78953', pattern: 'waves' },
        { bg: '#4b2e19', text: '#b49a83', subtext: '#c9a888', accent: '#7e3e28', border: '#2c3e50', qMark: '#b49a83', pattern: 'grid' },
        { bg: '#dd7057', text: '#1a1816', subtext: '#302116', accent: '#213241', border: '#272233', qMark: '#f4a971', pattern: 'dots' },
        { bg: '#3f4436', text: '#d6d2c8', subtext: '#cca69c', accent: '#6e3b46', border: '#2b3440', qMark: '#9a4e3a', pattern: 'lines' },
        { bg: '#121212', text: '#d6d2c8', subtext: '#99757d', accent: '#9a4e3a', border: '#2b3440', qMark: '#6e3b46', pattern: 'diamonds' },
        { bg: '#5e6253', text: '#f0e6d3', subtext: '#dfdcd8', accent: '#5a3d55', border: '#2c3e50', qMark: '#b49a83', pattern: 'waves' },
        { bg: '#2b3440', text: '#d6d2c8', subtext: '#b69da2', accent: '#9a4e3a', border: '#3f4436', qMark: '#6e3b46', pattern: 'grid' },
        { bg: '#1c2240', text: '#e8dfc8', subtext: '#a9a8c4', accent: '#6b5b95', border: '#3a3a5c', qMark: '#6b5b95', pattern: 'dots' },
        { bg: '#7a3b2e', text: '#f5e6d3', subtext: '#e0bba0', accent: '#c9783f', border: '#4a241c', qMark: '#e0bba0', pattern: 'diamonds' },
        { bg: '#16302e', text: '#d8ecdf', subtext: '#8fc7b8', accent: '#3f8f7a', border: '#0d1f1d', qMark: '#8fc7b8', pattern: 'waves' },
        { bg: '#3a1f33', text: '#f0d9e8', subtext: '#c896b8', accent: '#8a4f78', border: '#1f0f1c', qMark: '#c896b8', pattern: 'lines' },
        { bg: '#c9a876', text: '#2c1f12', subtext: '#49371f', accent: '#8a5a2e', border: '#7a6038', qMark: '#5c4527', pattern: 'grid' }
    ];

    /* Small deterministic string hash → stable palette index per poem/id.
       Same id always picks the same palette, but different ids spread
       across the full cardPalettes array instead of all landing on 0. */
    function hashStringToIndex(str, modulo) {
        let hash = 0;
        const s = String(str || '');
        for (let i = 0; i < s.length; i++) {
            hash = (hash * 31 + s.charCodeAt(i)) | 0; // |0 keeps it a 32-bit int
        }
        return Math.abs(hash) % modulo;
    }

    /*  DYNAMIC HEADER HEIGHT */
    const siteHeader = document.querySelector('header');
    function syncHeaderHeight() {
        if (!siteHeader) return;
        document.documentElement.style.setProperty('--header-height', `${siteHeader.offsetHeight}px`);
    }
    if (siteHeader) {
        syncHeaderHeight();
        window.addEventListener('resize', syncHeaderHeight);
        // Header height can also change when the rotating quote text wraps
        // differently after fonts finish loading.
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(syncHeaderHeight);
        }
    }

    /* SITE NAV */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const navOverlay = document.getElementById('navOverlay');
    const closeNavBtn = document.getElementById('closeNavBtn');

    function openNav() { mobileSidebar.classList.add('open'); navOverlay.classList.add('visible'); document.body.style.overflow = 'hidden'; }
    function closeNav() { mobileSidebar.classList.remove('open'); navOverlay.classList.remove('visible'); document.body.style.overflow = ''; }
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileSidebar.classList.contains('open');
    if (isOpen) {
        mobileSidebar.classList.remove('open');
        navOverlay.classList.remove('visible');
    } else {
        openNav();
    }
});
    if (closeNavBtn) closeNavBtn.addEventListener('click', closeNav);
    if (navOverlay) navOverlay.addEventListener('click', closeNav);
    document.querySelectorAll('.mobile-nav-links a').forEach(l => l.addEventListener('click', closeNav));

    /*  QUOTE SLIDESHOW */
    const quoteSlides = document.querySelectorAll('.quote-slide');
    if (quoteSlides.length) {
        let qi = 0;
        quoteSlides.forEach((q, i) => q.classList.toggle('active', i === 0));
        setInterval(() => {
            quoteSlides[qi].classList.remove('active');
            qi = (qi + 1) % quoteSlides.length;
            quoteSlides[qi].classList.add('active');
        }, 8000);
    }

    /* HERO SLIDESHOW */
    document.querySelectorAll('.hero-slideshow').forEach(box => {
        const slides = box.querySelectorAll('.hero-slide');
        if (!slides.length) return;
        let hi = 0;
        slides.forEach((s, i) => s.classList.toggle('active', i === 0));
        setInterval(() => {
            const next = (hi + 1) % slides.length;
            slides[next].classList.add('active');
            slides[hi].classList.remove('active');
            hi = next;
        }, 5000);
    });

    /*  BACK TO TOP */
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) backToTop.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /*  FLOATING "ALL POEMS" BUTTON / SIDEBAR */
    const collectionBtnWrap = document.getElementById('collectionBtnWrap');
    const collectionSidebar = document.getElementById('collectionSidebar');

    function openCollectionSidebar() {
        if (!collectionSidebar) return;
        collectionSidebar.classList.add('open');
        if (collectionBtnWrap) collectionBtnWrap.classList.add('hidden');
        const btn = document.getElementById('collectionBtn');
        if (btn) btn.setAttribute('aria-expanded', 'true');
    }
    function closeCollectionSidebar() {
        if (!collectionSidebar) return;
        collectionSidebar.classList.remove('open');
        if (collectionBtnWrap) collectionBtnWrap.classList.remove('hidden');
        const btn = document.getElementById('collectionBtn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }

// Unified Global Listener
document.addEventListener('click', (e) => {
    // search and theme toggle handle their own clicks
    if (e.target.closest('#searchToggle') || 
        e.target.closest('#themeToggle') ||
        e.target.closest('#searchOverlay')) {
        return;
    }

    // 1. Sidebar Logic (Unified)
    const collectionBtn = e.target.closest('#collectionBtn');
    const closeSidebarBtn = e.target.closest('#closeSidebar');
    const sidebar = document.getElementById('collectionSidebar');

    if (collectionBtn) {
        e.stopPropagation();
        openCollectionSidebar();
    }
    
    if (closeSidebarBtn) {
        closeCollectionSidebar();
    }

    if (sidebar && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !e.target.closest('#collectionBtn')) {
        closeCollectionSidebar();
    }

    delegateShareClick(e);
});

    /* SHARE SYSTEM */
    const SITE_URL = 'https://windandverse.com';

    const SHARE_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>`;

    const EXPAND_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>`;
    const COLLAPSE_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
        <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>`;

    function getShareOverlay() {
        let overlay = document.getElementById('shareOverlay');
        if (overlay) overlay.remove();
        overlay = document.createElement('div');
        overlay.id = 'shareOverlay';
        overlay.className = 'share-overlay';
        overlay.innerHTML = `
            <div class="share-panel">
                <div class="share-panel-header">
                    <h3>Share</h3>
                    <button class="share-panel-close" type="button" aria-label="Close">&times;</button>
                </div>
                <img class="share-card-preview" id="shareCardPreview" alt="Quote card preview">
                <div class="share-panel-actions">
                    <button class="share-action-btn primary" type="button" id="shareDownloadBtn">Download image</button>
                    <button class="share-action-btn" type="button" id="shareCopyLinkBtn">Copy link</button>
                    <button class="share-action-btn" type="button" id="shareNativeBtn" style="display:none">Share via&hellip;</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('.share-panel-close').addEventListener('click', closeShareOverlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) closeShareOverlay(); });
        return overlay;
    }

    function closeShareOverlay() {
        const o = document.getElementById('shareOverlay');
        if (!o) return;
        o.style.opacity = '0';
        o.style.transition = 'opacity 0.25s ease';
        setTimeout(() => {
            o.remove();
            const bar = document.getElementById('quoteSelectBar');
            if (bar && document.querySelector('#poem-body.selecting')) {
                bar.classList.add('visible');
            }
        }, 250);
    }

    function wrapCanvasText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = []; let cur = '';
        words.forEach(w => {
            const test = cur ? cur + ' ' + w : w;
            if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
            else cur = test;
        });
        if (cur) lines.push(cur);
        return lines;
    }

    function drawPattern(ctx, W, H, type, accent) {
        ctx.save();
        ctx.globalAlpha = 0.055;
        ctx.strokeStyle = accent;
        ctx.fillStyle = accent;
        ctx.lineWidth = 1.2;

        if (type === 'dots') {
            const gap = 52;
            for (let x = gap; x < W; x += gap)
                for (let y = gap; y < H; y += gap) {
                    ctx.beginPath(); ctx.arc(x, y, 2.8, 0, Math.PI * 2); ctx.fill();
                }
        } else if (type === 'lines') {
            const gap = 44;
            for (let i = -H; i < W + H; i += gap) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
            }
        } else if (type === 'diamonds') {
            const gap = 76, sz = 20;
            for (let x = gap / 2; x < W; x += gap)
                for (let y = gap / 2; y < H; y += gap) {
                    ctx.beginPath();
                    ctx.moveTo(x, y - sz); ctx.lineTo(x + sz, y);
                    ctx.lineTo(x, y + sz); ctx.lineTo(x - sz, y);
                    ctx.closePath(); ctx.stroke();
                }
        } else if (type === 'waves') {
            const gap = 54, amp = 13, freq = 0.014;
            for (let row = gap; row < H; row += gap) {
                ctx.beginPath();
                for (let x = 0; x <= W; x += 2) {
                    const y = row + Math.sin(x * freq * Math.PI * 2) * amp;
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        } else if (type === 'grid') {
            const gap = 58;
            for (let x = gap; x < W; x += gap) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
            for (let y = gap; y < H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        }
        ctx.restore();
    }

    function generateQuoteCardImage(quoteLines, label, paletteIndex) {
        const canvas = document.createElement('canvas');
        const W = 1080, H = 1080;
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        const p = cardPalettes[(paletteIndex || 0) % cardPalettes.length];

        ctx.fillStyle = p.bg;
        ctx.fillRect(0, 0, W, H);

        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, 'rgba(255,255,255,0.04)');
        grad.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

        drawPattern(ctx, W, H, p.pattern, p.accent);

        ctx.strokeStyle = p.border; ctx.lineWidth = 2;
        ctx.strokeRect(40, 40, W - 80, H - 80);

        ctx.fillStyle = p.qMark; ctx.font = '260px Georgia, serif';
        ctx.fillText('\u201C', 70, 260);

        const title = quoteLines[0];
        const bodyLines = quoteLines.slice(1);
        const maxW = W - 200;

        /* measure title */
        ctx.font = 'bold 56px Georgia, serif';
        const titleWrapped = wrapCanvasText(ctx, title, maxW);

        /* measure body */
        ctx.font = 'italic 38px Georgia, serif';
        let bodyWrapped = [];
        bodyLines.forEach(line => {
            bodyWrapped = bodyWrapped.concat(wrapCanvasText(ctx, line, maxW));
        });

        const titleLH = 72;
        const bodyLH = 56;
        const gap = 36;
        const totalH = (titleWrapped.length * titleLH) + gap + (bodyWrapped.length * bodyLH);
        let y = (H - totalH) / 2;

        /* Draw title — bold, large, full brightness */
        ctx.font = 'bold 56px Georgia, serif';
        ctx.fillStyle = p.text;
        titleWrapped.forEach(line => { ctx.fillText(line, 100, y); y += titleLH; });

        y += gap;

        /* Draw body — italic, smaller, muted */
        ctx.font = 'italic 38px Georgia, serif';
        ctx.fillStyle = p.subtext;
        bodyWrapped.forEach(line => { ctx.fillText(line, 100, y); y += bodyLH; });

        /* Footer */
        ctx.font = '28px Georgia, serif'; ctx.fillStyle = p.subtext;
        ctx.fillText(label || '', 100, H - 120);
        ctx.font = '24px Georgia, serif'; ctx.fillStyle = p.accent;
        ctx.fillText('Rom\u00e9on, windandverse.com', 100, H - 80);

        return canvas.toDataURL('image/png');
    }

    function openShareFlow({ quoteLines, label, url, shareText, paletteIndex }) {
        const bar = document.getElementById('quoteSelectBar');
        if (bar) bar.classList.remove('visible');
        closeCollectionSidebar();
        const overlay = getShareOverlay();
        const preview = overlay.querySelector('#shareCardPreview');
        const dlBtn = overlay.querySelector('#shareDownloadBtn');
        const copyBtn = overlay.querySelector('#shareCopyLinkBtn');
        const nativeBtn = overlay.querySelector('#shareNativeBtn');

        const imageData = generateQuoteCardImage(quoteLines, label, paletteIndex);
        preview.src = imageData;

        const fullUrl = url.startsWith('http') ? url : `${SITE_URL}/${url}`;
        const text = shareText || quoteLines.join(' / ');

        let slug = '';
        try {
            const segments = new URL(fullUrl).pathname.split('/').filter(Boolean);
            slug = segments.length ? segments[segments.length - 1] : '';
        } catch {
            slug = '';
        }
        const downloadName = slug ? `${slug}.png` : 'wind-and-verse-quote.png';

        dlBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = imageData; a.download = downloadName; a.click();
        };

        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(`${text} — ${fullUrl}`);
                copyBtn.textContent = '✓ Copied!';
                setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 1800);
            } catch {
                copyBtn.textContent = 'Could not copy';
                setTimeout(() => { copyBtn.textContent = 'Copy link'; }, 1800);
            }
        };

        // Native share sheet 
        if (nativeBtn) {
            if (navigator.share) {
                nativeBtn.style.display = '';
                nativeBtn.onclick = async () => {
                    try {
                        let shareData = { title: label || 'Wind & Verse', text, url: fullUrl };


                        if (navigator.canShare) {
                            const blob = await (await fetch(imageData)).blob();
                            const file = new File([blob], downloadName, { type: 'image/png' });
                            if (navigator.canShare({ files: [file] })) {
                                shareData = { title: label || 'Wind & Verse', text, files: [file] };
                            }
                        }

                        await navigator.share(shareData);
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            console.error('Share failed:', err);
                        }
                    }
                };
            } else {
                nativeBtn.style.display = 'none';
            }
        }

        overlay.classList.add('open');
    }


/* FULLSCREEN POEM MODE */
function toggleFullScreen() {
    const target = document.getElementById('poem-container') || document.querySelector('.poem-display');
    if (!target) return;

    const turningOn = !target.classList.contains('fullscreen');
    target.classList.toggle('fullscreen', turningOn);

    // Swap the expand/collapse icon + label so it's clear what tapping again will do.
    const expandBtn = document.getElementById('poemExpandBtn');
    if (expandBtn) {
        expandBtn.innerHTML = turningOn ? COLLAPSE_SVG : EXPAND_SVG;
        expandBtn.setAttribute('aria-label', turningOn ? 'Exit fullscreen' : 'Expand poem fullscreen');
    }
}
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        const target = document.getElementById('poem-container') || document.querySelector('.poem-display');
        if (target && target.classList.contains('fullscreen')) {
            target.classList.remove('fullscreen');
            const expandBtn = document.getElementById('poemExpandBtn');
            if (expandBtn) {
                expandBtn.innerHTML = EXPAND_SVG;
                expandBtn.setAttribute('aria-label', 'Expand poem fullscreen');
            }
        }
    }
});


window.addEventListener('resize', () => {
    if (window.innerWidth >= 1000) {
        const target = document.getElementById('poem-container') || document.querySelector('.poem-display');
        if (target && target.classList.contains('fullscreen')) {
            toggleFullScreen();
        }
    }
});

/* POEM LINE NORMALIZATION */
function normalizePoemLines() {
    const body = document.getElementById('poem-body');
    if (!body || body.dataset.linesNormalized === 'true') return;

    const originalParagraphs = Array.from(body.querySelectorAll('p'));
    originalParagraphs.forEach(p => {
        const rawLines = p.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).filter(s => s.length > 0);

        if (rawLines.length === 0) return;

        const frag = document.createDocumentFragment();
        rawLines.forEach((lineHtml, i) => {
            const lineEl = document.createElement('p');
            lineEl.className = 'poem-line';
            lineEl.innerHTML = lineHtml;
            if (i === rawLines.length - 1) {
                lineEl.classList.add('stanza-break');
            }
            frag.appendChild(lineEl);
        });

        p.replaceWith(frag);
    });

    body.dataset.linesNormalized = 'true';
}

function initPoemUI() {
    // Normalize poem markup into one selectable element per line
    // BEFORE wiring up any click handling that depends on line structure.
    normalizePoemLines();

    document.querySelectorAll('.fullscreen-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const poemDisplay = document.getElementById('poem-container') || document.querySelector('.poem-display');
            if (poemDisplay && poemDisplay.classList.contains('fullscreen')) {
                sessionStorage.setItem('poemFullscreenNav', '1');
            } else {
                sessionStorage.removeItem('poemFullscreenNav');
            }
        });
    });

    if (sessionStorage.getItem('poemFullscreenNav') === '1') {
        sessionStorage.removeItem('poemFullscreenNav');
        if (typeof toggleFullScreen === 'function') {
            const poemDisplay = document.getElementById('poem-container') || document.querySelector('.poem-display');
            if (poemDisplay && !poemDisplay.classList.contains('fullscreen')) {
                toggleFullScreen();
            }
        }
    }

    // Check if the listener is already attached to avoid duplicates
    document.removeEventListener('click', delegateShareClick);
    document.addEventListener('click', delegateShareClick);
    
    console.log("Poem UI event delegation initialized");
}

// Single handler that catches clicks on any .share-btn
function delegateShareClick(event) {
    const btn = event.target.closest('.share-btn');
    if (!btn) return;


    if (btn.closest('#poem-container')) {
        return; 
    }

    // 1. Get base data from button attributes
    let data = {
        label: btn.dataset.title || "Wind & Verse",
        shareText: btn.dataset.text || "Check out this content",
        url: window.location.href,
        paletteIndex: parseInt(btn.dataset.palette) || 0,
        quoteLines: []
    };

    // 2. Page-specific extraction logic
    const storyContainer = document.getElementById('story-container');
    const blogContainer = document.getElementById('blog-container');

    if (storyContainer) {
        // Title rendered bold/large as the card headline, description as the
        // muted body text beneath it — same visual treatment poems get,
        // since generateQuoteCardImage() styles quoteLines[0] vs the rest
        // identically regardless of page type.
        data.label = storyContainer.dataset.storyTitle || data.label;
        data.quoteLines = [storyContainer.dataset.storyTitle, storyContainer.dataset.storyExcerpt];
        data.paletteIndex = hashStringToIndex(storyContainer.dataset.storyTitle || '', cardPalettes.length);
    } else if (blogContainer) {
        data.label = blogContainer.dataset.blogTitle || data.label;
        data.quoteLines = [blogContainer.dataset.blogTitle, blogContainer.dataset.blogExcerpt];
        data.paletteIndex = hashStringToIndex(blogContainer.dataset.blogTitle || '', cardPalettes.length);
    }

    openShareFlow(data);
}

// Run on initial load and Astro navigations
document.addEventListener('DOMContentLoaded', initPoemUI);
document.addEventListener('astro:page-load', initPoemUI);
window.toggleFullScreen = toggleFullScreen;
window.openShareFlow = openShareFlow;
window.hashStringToIndex = hashStringToIndex;
window.cardPalettesLength = cardPalettes.length;