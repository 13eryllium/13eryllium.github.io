'use strict';

/* =============================================
   Lambda Docs — script.js
   - Syntax highlighter for .lang-lambda and .lang-gml blocks
   - Active nav link on scroll
   - Mobile menu toggle
   ============================================= */

// ─── Tokenizer ───────────────────────────────────────────────────────────────

const KEYWORDS = new Set([
  'let','func','return','if','else','while','for','in',
  'break','continue','try','catch','throw','null','true','false',
]);

const STDLIB = new Set([
  'print','to_string','to_number','to_bool','type_of',
  'abs','floor','ceil','round','sqrt','pow','sign',
  'sin','cos','tan','arcsin','arccos','arctan','arctan2',
  'log2','log10','ln','exp',
  'min','max','clamp','lerp',
  'random','irandom','random_range','irandom_range',
  'distance','angle_between','deg_to_rad','rad_to_deg',
  'str_length','str_upper','str_lower','str_sub','str_pos',
  'str_replace','str_char_at','str_ord','str_chr','str_trim',
  'str_repeat','str_pad_left','str_pad_right','str_split',
  'str_starts_with','str_ends_with','str_contains',
  'array_length','array_push','array_pop','array_insert',
  'array_delete','array_slice','array_reverse','array_join',
  'array_contains','array_find','array_sort','array_sort_fn',
  'array_map','array_filter','array_reduce','array_each','array_flat',
  'struct_has','struct_keys','struct_delete','struct_merge',
  'is_null','is_number','is_string','is_bool',
  'is_array','is_struct','is_function','is_pointer',
  'assert','error','range','zip',
]);

const CONSTANTS = new Set(['PI','INF','NAN','LAMBDA_VERSION']);

// GML-specific keywords and functions (simplified)
const GML_KEYWORDS = new Set([
  'var','function','return','if','else','while','for','do','repeat',
  'break','continue','exit','try','catch','finally','throw',
  'with','until','switch','case','default','new','delete','static',
  'and','or','not','true','false','undefined','noone','self','other',
  'global','all',
]);

const GML_BUILTINS = new Set([
  'instance_create_layer','instance_number','show_debug_message',
  'working_directory','array_length','string','real','is_undefined',
  'draw_text','alarm','sprite_index','image_index','x','y',
]);

function span(cls, text) {
  return `<span class="${cls}">${text}</span>`;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightLambda(src) {
  let out = '';
  let i = 0;

  while (i < src.length) {
    // Line comment
    if (src[i] === '/' && src[i+1] === '/') {
      let j = i;
      while (j < src.length && src[j] !== '\n') j++;
      out += span('tok-comment', escapeHtml(src.slice(i, j)));
      i = j;
      continue;
    }

    // Interpolated string $"..."
    if (src[i] === '$' && src[i+1] === '"') {
      let j = i + 2;
      let depth = 0;
      let raw = '$"';
      while (j < src.length) {
        const ch = src[j];
        if (ch === '\\') { raw += escapeHtml(src[j] + src[j+1]); j += 2; continue; }
        if (ch === '{') { depth++; raw += span('tok-interp', '{'); j++; continue; }
        if (ch === '}') {
          depth--;
          raw += span('tok-interp', '}');
          j++;
          continue;
        }
        if (ch === '"' && depth === 0) { raw += '"'; j++; break; }
        raw += escapeHtml(ch);
        j++;
      }
      out += span('tok-string', raw);
      i = j;
      continue;
    }

    // Regular string
    if (src[i] === '"') {
      let j = i + 1;
      let raw = '"';
      while (j < src.length) {
        const ch = src[j];
        if (ch === '\\') { raw += escapeHtml(src[j] + src[j+1]); j += 2; continue; }
        raw += escapeHtml(ch);
        if (ch === '"') { j++; break; }
        j++;
      }
      out += span('tok-string', raw);
      i = j;
      continue;
    }

    // Single-quoted string (GML style)
    if (src[i] === "'") {
      let j = i + 1;
      let raw = "'";
      while (j < src.length) {
        const ch = src[j];
        if (ch === '\\') { raw += escapeHtml(src[j] + src[j+1]); j += 2; continue; }
        raw += escapeHtml(ch);
        if (ch === "'") { j++; break; }
        j++;
      }
      out += span('tok-string', raw);
      i = j;
      continue;
    }

    // Number
    if (/[0-9]/.test(src[i]) || (src[i] === '.' && /[0-9]/.test(src[i+1]))) {
      let j = i;
      while (j < src.length && /[0-9._xXa-fA-F]/.test(src[j])) j++;
      out += span('tok-number', escapeHtml(src.slice(i, j)));
      i = j;
      continue;
    }

    // Pointer operator >=>
    if (src[i] === '>' && src[i+1] === '=' && src[i+2] === '>') {
      out += span('tok-keyword', '&gt;=&gt;');
      i += 3;
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(src[i])) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);

      // Check if followed by '(' — it's a function call
      let k = j;
      while (k < src.length && (src[k] === ' ' || src[k] === '\t')) k++;
      const isCall = src[k] === '(';

      if (KEYWORDS.has(word) || GML_KEYWORDS.has(word)) {
        out += span('tok-keyword', escapeHtml(word));
      } else if (CONSTANTS.has(word)) {
        out += span('tok-const', escapeHtml(word));
      } else if (STDLIB.has(word) || GML_BUILTINS.has(word)) {
        out += span('tok-fn', escapeHtml(word));
      } else if (isCall) {
        out += span('tok-fn', escapeHtml(word));
      } else {
        out += span('tok-ident', escapeHtml(word));
      }
      i = j;
      continue;
    }

    // Operators
    const two = src.slice(i, i+2);
    if (['==','!=','<=','>=','&&','||','+=','-=','*=','/='].includes(two)) {
      out += span('tok-operator', escapeHtml(two));
      i += 2;
      continue;
    }

    // Single-char operators
    if ('=+-*/%!<>'.includes(src[i])) {
      out += span('tok-operator', escapeHtml(src[i]));
      i++;
      continue;
    }

    // Punctuation
    if ('{}[]();,.:'.includes(src[i])) {
      out += span('tok-punct', escapeHtml(src[i]));
      i++;
      continue;
    }

    // Everything else (whitespace, newlines)
    out += escapeHtml(src[i]);
    i++;
  }

  return out;
}

// ─── Apply highlighting ───────────────────────────────────────────────────────

function applyHighlighting() {
  document.querySelectorAll('pre > code').forEach(block => {
    const pre = block.parentElement;
    const langClass = [...block.classList].find(c => c.startsWith('lang-'));
    const lang = langClass ? langClass.replace('lang-', '') : '';

    // Label the block
    if (lang) {
      const label = lang === 'gml' ? 'GML' : lang === 'lambda' ? 'Lambda' : lang;
      pre.setAttribute('data-lang', label);
    }

    // Highlight all lambda and gml blocks
    if (lang === 'lambda' || lang === 'gml' || lang === '') {
      const raw = block.textContent;
      block.innerHTML = highlightLambda(raw);
    }
  });
}

// ─── Active nav link on scroll ───────────────────────────────────────────────

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
            // Scroll into view in sidebar if needed
            link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        });
      }
    });
  }, {
    rootMargin: '-10% 0px -80% 0px',
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
}

// ─── Mobile menu ─────────────────────────────────────────────────────────────

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close when a nav link is clicked
  sidebar.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  });
}

// ─── Copy buttons ─────────────────────────────────────────────────────────────

function initCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    // Wrap pre in a relative-positioned div so the button isn't clipped by overflow-x
    const wrapper = document.createElement('div');
    wrapper.className = 'pre-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';

    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      const text = code ? code.textContent : pre.textContent;

      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });

    wrapper.appendChild(btn);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyHighlighting();
  initScrollSpy();
  initMobileMenu();
  initCopyButtons();
  initSectionLinks();
});

// ─── Section link copy ────────────────────────────────────────────────────────

function initSectionLinks() {
  document.querySelectorAll('.section-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id  = link.dataset.id;
      const url = `${location.origin}${location.pathname}#${id}`;

      navigator.clipboard.writeText(url).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });

      // Push the hash to the URL bar without triggering a jump (already there)
      history.pushState(null, '', `#${id}`);

      link.classList.add('copied');
      setTimeout(() => link.classList.remove('copied'), 2000);
    });
  });
}