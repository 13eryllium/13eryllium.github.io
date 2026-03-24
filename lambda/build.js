'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Frontmatter parser ───────────────────────────────────────────────────────

function parseFrontmatter(raw) {
  // Normalize line endings so the parser works on both Windows (CRLF) and Unix (LF)
  const src = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: src };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    meta[key] = val;
  }
  return { meta, body: match[2] };
}

// ─── Markdown + directive renderer ───────────────────────────────────────────

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Inline markdown: **bold**, `code`, *em*
function renderInline(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`([^`]+)`/g,     '<code>$1</code>');
}

// Parse a ::fn signature line into { sig, ret }
// e.g. "lambda_env() → env struct"  or  "abs(n)"
function parseFnSig(raw) {
  const arrow = raw.indexOf('→');
  if (arrow !== -1) {
    return {
      sig: raw.slice(0, arrow).trim(),
      ret: raw.slice(arrow + 1).trim(),
    };
  }
  return { sig: raw.trim(), ret: null };
}

function renderFnBlock(sigLine, descLines) {
  const { sig, ret } = parseFnSig(sigLine);
  // Highlight function name (first word up to '(')
  const highlighted = sig.replace(
    /^([a-zA-Z_][a-zA-Z0-9_]*)/,
    '<span class="fn-name">$1</span>'
  );
  const retHtml = ret ? ` <span class="fn-ret">→ ${escapeHtml(ret)}</span>` : '';
  const descHtml = descLines.length
    ? `<p>${renderInline(descLines.join(' '))}</p>`
    : '';
  return `<div class="fn-block"><div class="fn-sig">${highlighted}${retHtml}</div>${descHtml}</div>\n`;
}

function renderBody(body) {
  const lines  = body.split('\n');
  let html     = '';
  let i        = 0;

  // State
  let inFnGroup   = false;
  let fnGroupHtml = '';
  let inHtml      = false;
  let rawHtml     = '';
  let inParagraph = false;
  let paraLines   = [];

  function flushParagraph() {
    if (!paraLines.length) return;
    const text = paraLines.join(' ').trim();
    if (text) html += `<p>${renderInline(text)}</p>\n`;
    paraLines = [];
    inParagraph = false;
  }

  while (i < lines.length) {
    const line = lines[i];

    // ── Raw HTML pass-through block ──────────────────────────────────────────
    if (line.trimStart() === '::html') {
      flushParagraph();
      i++;
      rawHtml = '';
      inHtml = true;
      while (i < lines.length) {
        // End on next directive or end of file
        if (lines[i].trimStart().startsWith('::') || lines[i].startsWith('```')) break;
        rawHtml += lines[i] + '\n';
        i++;
      }
      html += rawHtml;
      inHtml = false;
      continue;
    }

    // ── Fenced code block ────────────────────────────────────────────────────
    if (line.startsWith('```')) {
      flushParagraph();
      const lang = line.slice(3).trim() || '';
      const langAttr = lang ? ` data-lang="${lang}"` : '';
      const cls  = lang ? ` class="lang-${lang}"` : '';
      i++;
      let code = '';
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += lines[i] + '\n';
        i++;
      }
      i++; // consume closing ```
      html += `<pre${langAttr}><code${cls}>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>\n`;
      continue;
    }

    // ── Headings ─────────────────────────────────────────────────────────────
    if (line.startsWith('### ')) {
      flushParagraph();
      html += `<h3>${renderInline(line.slice(4))}</h3>\n`;
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      html += `<h2>${renderInline(line.slice(3))}</h2>\n`;
      i++;
      continue;
    }

    // ── Unordered list ───────────────────────────────────────────────────────
    if (line.startsWith('- ')) {
      flushParagraph();
      html += '<ul>\n';
      while (i < lines.length && lines[i].startsWith('- ')) {
        html += `  <li>${renderInline(lines[i].slice(2))}</li>\n`;
        i++;
      }
      html += '</ul>\n';
      continue;
    }

    // ── ::hero ───────────────────────────────────────────────────────────────
    if (line.trimStart() === '::hero') {
      flushParagraph();
      html += `<div class="hero">
  <div class="hero-eyebrow">Scripting for GameMaker Studio 2</div>
  <img src="icons/wordmark.svg" alt="Lambda" class="hero-wordmark" />
  <p class="hero-subtitle">A lightweight, embeddable scripting language for GMS2.</p>
  <div class="hero-badges">
    <span class="badge">GMS2</span>
    <span class="badge">v1.2.0</span>
    <span class="badge badge-gold">.lam</span>
  </div>
</div>\n`;
      i++;
      continue;
    }

    // ── ::callout / ::callout-gold ───────────────────────────────────────────
    if (line.trimStart().startsWith('::callout')) {
      flushParagraph();
      const gold = line.includes('gold');
      const cls  = gold ? 'callout callout-gold' : 'callout';
      i++;
      let content = '';
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].trimStart().startsWith('::')) {
        content += lines[i] + ' ';
        i++;
      }
      html += `<div class="${cls}">${renderInline(content.trim())}</div>\n`;
      continue;
    }

    // ── ::fn-group / ::fn-group-end ──────────────────────────────────────────
    if (line.trimStart() === '::fn-group') {
      flushParagraph();
      inFnGroup = true;
      fnGroupHtml = '';
      i++;
      continue;
    }

    if (line.trimStart() === '::fn-group-end') {
      html += `<div class="fn-group">\n${fnGroupHtml}</div>\n`;
      inFnGroup = false;
      fnGroupHtml = '';
      i++;
      continue;
    }

    // ── ::fn <signature> ─────────────────────────────────────────────────────
    if (line.trimStart().startsWith('::fn ')) {
      flushParagraph();
      const sigLine  = line.trimStart().slice(5);
      const descLines = [];
      i++;
      // Collect indented or plain description lines (not directives, not code, not blank)
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].startsWith('```') &&
        !lines[i].trimStart().startsWith('::')
      ) {
        descLines.push(lines[i].trim());
        i++;
      }
      const blockHtml = renderFnBlock(sigLine, descLines);
      if (inFnGroup) {
        fnGroupHtml += blockHtml;
      } else {
        html += blockHtml;
        // Consume one following code block if present (for fn examples)
        if (i < lines.length && lines[i].startsWith('```')) {
          const lang = lines[i].slice(3).trim() || '';
          const langAttr = lang ? ` data-lang="${lang}"` : '';
          const cls  = lang ? ` class="lang-${lang}"` : '';
          i++;
          let code = '';
          while (i < lines.length && !lines[i].startsWith('```')) {
            code += lines[i] + '\n';
            i++;
          }
          i++;
          // Append code block inside the last fn-block
          html = html.replace(/<\/div>\n$/, `<pre${langAttr}><code${cls}>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>\n</div>\n`);
        }
      }
      continue;
    }

    // ── ::constants A B C ────────────────────────────────────────────────────
    if (line.trimStart().startsWith('::constants ')) {
      flushParagraph();
      const names = line.trimStart().slice(12).trim().split(/\s+/);
      const pills = names.map(n => `<span class="const-name">${escapeHtml(n)}</span>`).join('\n  ');
      html += `<div class="const-row">\n  ${pills}\n</div>\n`;
      i++;
      continue;
    }

    // ── Blank line ───────────────────────────────────────────────────────────
    if (line.trim() === '') {
      flushParagraph();
      i++;
      continue;
    }

    // ── Regular paragraph text ───────────────────────────────────────────────
    paraLines.push(line);
    inParagraph = true;
    i++;
  }

  flushParagraph();
  return html;
}

// ─── HTML shell template ───────────────────────────────────────────────────────

function buildShell(topnavLinks, sidebarHtml, contentHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lambda - Documentation</title>
  <link rel="icon" type="image/svg+xml" href="icons/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Sans:wght@300;400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <header id="topnav">
    <div class="topnav-logo">
      <img src="icons/favicon.svg" alt="Lambda" class="topnav-icon" />
      <span class="topnav-version">v1.1.0</span>
    </div>
    <nav class="topnav-links">
      ${topnavLinks}
    </nav>
    <button id="menu-toggle" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </header>

  <div id="shell">
    <nav id="sidebar">
      ${sidebarHtml}
    </nav>
    <main id="content">
      ${contentHtml}
    </main>
  </div>

  <script src="script.js"></script>
</body>
</html>`;
}

// ─── Main build ───────────────────────────────────────────────────────────────

function build() {
  const sectionsDir = path.join(__dirname, 'sections');
  const outputFile  = path.join(__dirname, 'index.html');

  // Read and sort section files
  const files = fs.readdirSync(sectionsDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  // Parse each file
  const sections = files.map(file => {
    const raw = fs.readFileSync(path.join(sectionsDir, file), 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    return { meta, body, file };
  });

  // ── Build sidebar ──────────────────────────────────────────────────────────
  // Group sections by their 'group' field, preserving order
  const groups = [];
  const groupMap = new Map();

  for (const s of sections) {
    const g = s.meta.group || 'Other';
    if (!groupMap.has(g)) {
      groupMap.set(g, []);
      groups.push(g);
    }
    groupMap.get(g).push(s);
  }

  let sidebarHtml = '';
  for (let gi = 0; gi < groups.length; gi++) {
    const groupName = groups[gi];
    const items     = groupMap.get(groupName);

    sidebarHtml += `<span class="nav-group-label">${escapeHtml(groupName)}</span>\n`;
    sidebarHtml += `<ul class="nav-list">\n`;
    for (const s of items) {
      const nav = s.meta.nav || s.meta.title || s.meta.id;
      const id  = s.meta.id;
      if (!nav || !id) {
        console.warn(`WARNING: Section in file "${s.file}" is missing frontmatter fields (id, nav, or title). Skipping.`);
        continue;
      }
      sidebarHtml += `  <li><a href="#${id}" class="nav-link">${escapeHtml(nav)}</a></li>\n`;
    }
    sidebarHtml += `</ul>\n`;

    if (gi < groups.length - 1) {
      sidebarHtml += `<div class="sidebar-rule"></div>\n`;
    }
  }

  // ── Build top nav links ────────────────────────────────────────────────────
  // One link per group, pointing to first section in that group
  const topnavLinks = groups.map((g, gi) => {
    const first = groupMap.get(g)[0];
    const active = gi === 0 ? ' active' : '';
    // Shorten group names for the top bar
    const label = g.replace('Standard Library', 'Stdlib');
    return `<a href="#${first.meta.id}" class="topnav-link${active}">${escapeHtml(label)}</a>`;
  }).join('\n      ');

  // ── Build content ──────────────────────────────────────────────────────────
  let contentHtml = '';
  for (const s of sections) {
    const bodyHtml = renderBody(s.body);
    const isHero   = s.body.trimStart().startsWith('::hero');
    const label    = escapeHtml(s.meta.group || '');
    const title    = escapeHtml(s.meta.title || '');
    const id       = s.meta.id;

    const sectionHeader = isHero ? '' : `<div class="section-header">
  <div class="section-label">${label}</div>
  <h2 class="section-title">${title}<a href="#${id}" class="section-link" title="Copy link to this section" data-id="${id}">#</a></h2>
</div>\n`;

    contentHtml += `<section id="${id}">\n${sectionHeader}${bodyHtml}</section>\n\n`;
  }

  // ── Write output ───────────────────────────────────────────────────────────
  const html = buildShell(topnavLinks, sidebarHtml, contentHtml);
  fs.writeFileSync(outputFile, html, 'utf8');

  console.log(`Built index.html from ${sections.length} sections:`);
  sections.forEach(s => console.log(`  ${s.file} → #${s.meta.id}`));
}

build();