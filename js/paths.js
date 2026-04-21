/* ══════════════════════════════════════════
   paths.js · 页面 / 数据路径辅助
   ══════════════════════════════════════════ */

const PAGE_FILES = new Set([
  'index.html',
  'play.html',
  'events.html',
  'study.html',
  'life.html',
  'fitness.html',
  'favorites.html',
]);

export function isPagesRoute() {
  return window.location.pathname.includes('/pages/');
}

export function pagePath(file) {
  if (file === 'index.html') return isPagesRoute() ? '../index.html' : 'index.html';
  return isPagesRoute() ? file : `pages/${file}`;
}

export function dataPath(file) {
  return isPagesRoute() ? `../${file}` : file;
}

export function installPageLinkRouting() {
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const link = target?.closest('a[href]');
    if (!link || link.target || event.defaultPrevented) return;

    const href = link.getAttribute('href') || '';
    const file = href.split('/').pop();
    if (!PAGE_FILES.has(file)) return;

    event.preventDefault();
    window.location.href = pagePath(file);
  });
}
