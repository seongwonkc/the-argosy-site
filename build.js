// Minimal build: reads /articles/*.md, outputs articles.json + simple article HTML pages
const fs = require('fs'); const path = require('path');
const SRC = path.join(process.cwd(),'articles'); const OUT_JSON = path.join(process.cwd(),'articles.json'); const OUT_DIR = path.join(process.cwd(),'articles');
function parseFrontMatter(content){ const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/); if(!m) return [{}, content]; const yaml=m[1], body=m[2]; const data={}; yaml.split(/\r?\n/).forEach(line=>{ const mm=line.match(/^([A-Za-z0-9 _-]+):\s*(.*)$/); if(mm){ const key=mm[1].trim().toLowerCase().replace(/\s+/g,'_'); let val=mm[2].trim(); val=val.replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1'); if(val.startsWith('[')&&val.endsWith(']')){ val=val.slice(1,-1).split(',').map(s=>s.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1')); } data[key]=val; } }); const map={}; for(const k in data){ const v=data[k]; if(k==='title') map.title=v; else if(k==='date') map.date=v; else if(k==='author') map.author=v; else if(k==='section') map.section=v; else if(k==='tags') map.tags=Array.isArray(v)?v:(v?String(v).split(',').map(s=>s.trim()):[]); else if(k==='image') map.image=v; else if(k==='summary') map.summary=v; else map[k]=v; } return [map, body]; }
function esc(s){ return String(s||'').replace(/[&<>]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }
function mdToHtml(md){ let h=md; h=h.replace(/^###### (.*)$/gm,'<h6>$1</h6>'); h=h.replace(/^##### (.*)$/gm,'<h5>$1</h5>'); h=h.replace(/^#### (.*)$/gm,'<h4>$1</h4>'); h=h.replace(/^### (.*)$/gm,'<h3>$1</h3>'); h=h.replace(/^## (.*)$/gm,'<h2>$1</h2>'); h=h.replace(/^# (.*)$/gm,'<h1>$1</h1>'); h=h.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); h=h.replace(/\*(.+?)\*/g,'<em>$1</em>'); h=h.split(/\n\s*\n/).map(p=> p.match(/^<h\d|^<ul|^<ol|^<p|^<blockquote/)? p : `<p>${p.replace(/\n/g,'<br>')}</p>`).join('\n'); return h; }
function templateHTML(a, bodyHtml){ return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(a.title)} — The Argosy</title>
<meta name="description" content="${esc(a.summary||'Article from The Argosy')}">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="shortcut icon" href="/assets/favicon.ico">
<script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-50 text-gray-800 dark:bg-gray-950 dark:text-gray-100">
<header class="bg-white/90 dark:bg-gray-900/90 backdrop-blur sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <a href="/index.html" class="flex items-center gap-3 text-2xl font-serif font-bold tracking-tight">
        <img src="/assets/argosy-logo.png" alt="The Argosy logo" class="h-8 md:h-10" />
        <span>The Argosy</span>
      </a>
      <span class="hidden md:inline-block ml-3" style="font-family:Lato,system-ui,sans-serif;font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;color:#6b7280">Treasure from Every Horizon</span>
    </div>
  </div>
</header>
<main class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
  <p class="text-sm text-gray-500">${esc(a.section||'Article')} • ${esc(a.date||'')}</p>
  <h1 class="text-4xl font-serif font-bold mt-2">${esc(a.title)}</h1>
  ${a.image ? `<img src="${esc(a.image)}" alt="${esc(a.title)}" class="mt-6 rounded-xl shadow w-full object-cover">` : ''}
  <div class="prose prose-gray max-w-none mt-6">${bodyHtml}</div>
  <p class="text-xs text-gray-500 mt-8">By ${esc(a.author||'Staff Reporter')}</p>
</main>
<footer class="bg-gray-900 text-gray-300 mt-12"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"><p class="text-sm text-center">© 2025 The Argosy. All rights reserved.</p></div></footer>
</body></html>`; }
function main(){ if(!fs.existsSync(SRC)) fs.mkdirSync(SRC,{recursive:true}); const files=fs.readdirSync(SRC).filter(f=>f.toLowerCase().endsWith('.md')); const items=[]; for(const file of files){ const slug=file.replace(/\.md$/i,''); const raw=fs.readFileSync(path.join(SRC,file),'utf8'); const [meta, body]=parseFrontMatter(raw); meta.slug=slug; meta.url=`/articles/${slug}.html`; items.push(meta); const bodyHtml=mdToHtml(body); const outHtml=templateHTML(meta, bodyHtml); fs.writeFileSync(path.join(OUT_DIR,`${slug}.html`), outHtml,'utf8'); } items.sort((a,b)=> new Date(b.date||0) - new Date(a.date||0)); fs.writeFileSync(OUT_JSON, JSON.stringify(items,null,2),'utf8'); console.log(`Built ${items.length} articles`); }
main();
