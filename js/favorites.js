/* ══════════════════════════════════════════
   favorites.js · 收藏逻辑（localStorage）
   依赖：state.js, render.js（renderFavoritesTab / renderTag）
   ══════════════════════════════════════════ */

import { state } from './state.js?v=20260421c';

export const FAVORITES_KEY = 'edison_favorites_v2';

export const FAV_LISTS = [
  { id: 'weekend',  label: '这个周末去', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  { id: 'wishlist', label: '想去',       color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  { id: 'visited',  label: '去过',       color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  { id: 'saved',    label: '收藏',       color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
];

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}');
  } catch { return {}; }
}

export function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function isFavorited(itemId) {
  return !!getFavorites()[itemId];
}

export function addToList(listId, itemId, itemData) {
  const favs = getFavorites();
  favs[itemId] = {
    ...itemData,
    _itemId: itemId,
    list: listId,
    savedAt: favs[itemId]?.savedAt || Date.now(),
    movedAt: Date.now()
  };
  saveFavorites(favs);
  refreshFavTab();
  if (state.activeTab === 'favorites') {
    // 动态 import 避免循环依赖
    import('./render.js').then(({ renderFavoritesTab }) => renderFavoritesTab());
  }
  document.querySelectorAll(`.like-btn[data-id="${CSS.escape(itemId)}"]`).forEach(btn => {
    btn.classList.add('liked');
    btn.title = '已收藏 · 点击取消';
  });
}

export function removeFromFavorites(itemId) {
  const favs = getFavorites();
  delete favs[itemId];
  saveFavorites(favs);
  refreshFavTab();
  if (state.activeTab === 'favorites') {
    import('./render.js').then(({ renderFavoritesTab }) => renderFavoritesTab());
  }
  document.querySelectorAll(`.like-btn[data-id="${CSS.escape(itemId)}"]`).forEach(btn => {
    btn.classList.remove('liked');
    btn.title = '收藏';
  });
}

export function toggleFavorite(itemId, itemData) {
  showListMenu(itemId, itemData);
  const btn = document.querySelector(`.like-btn[data-id="${CSS.escape(itemId)}"]`);
  if (btn) {
    btn.style.transform = 'scale(1.35)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  }
}

export function showListMenu(itemId, itemData) {
  document.getElementById('list-menu-overlay')?.remove();

  const favs = getFavorites();
  const current = favs[itemId]?.list || null;

  const overlay = document.createElement('div');
  overlay.id = 'list-menu-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.35);backdrop-filter:blur(2px);';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const encodedItem = encodeFavoritePayload(itemData);
  const listBtns = FAV_LISTS.map(lst => {
    const isActive = current === lst.id;
    return `<button onclick="window._addToList('${lst.id}','${itemId}',JSON.parse(decodeURIComponent('${encodedItem}'))); document.getElementById('list-menu-overlay').remove();"
      style="display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;background:${isActive ? lst.bg : 'transparent'};border:none;border-radius:10px;cursor:pointer;font-size:14px;font-weight:${isActive ? '700' : '500'};color:${isActive ? lst.color : 'var(--ink)'};text-align:left;transition:background 0.15s;">
      <span style="width:10px;height:10px;border-radius:50%;background:${lst.color};flex-shrink:0;"></span>
      <span>${lst.label}</span>
      ${isActive ? '<span style="margin-left:auto;font-size:12px;opacity:0.6;">当前</span>' : ''}
    </button>`;
  }).join('');

  const removeBtn = current ? `
    <button onclick="window._removeFromFavorites('${itemId}'); document.getElementById('list-menu-overlay').remove();"
      style="display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;background:transparent;border:none;border-radius:10px;cursor:pointer;font-size:14px;color:#ef4444;text-align:left;margin-top:4px;">
      <span style="width:10px;height:10px;border-radius:50%;background:#ef4444;flex-shrink:0;"></span><span>取消收藏</span>
    </button>` : '';

  overlay.innerHTML = `
    <div style="width:100%;max-width:480px;background:var(--white,#fff);border-radius:20px 20px 0 0;padding:20px 16px 32px;box-shadow:0 -4px 30px rgba(0,0,0,0.12);">
      <div style="width:36px;height:4px;background:#e5e7eb;border-radius:2px;margin:0 auto 16px;"></div>
      <div style="font-size:13px;font-weight:700;color:var(--ink-muted);margin-bottom:12px;letter-spacing:0.05em;text-transform:uppercase;">加入哪个列表？</div>
      <div style="font-size:15px;font-weight:600;color:var(--ink);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);">${itemData.name || ''}</div>
      ${listBtns}
      ${removeBtn}
    </div>`;

  document.body.appendChild(overlay);
}

export function makeItemId(item, prefix = '') {
  const key = (item.id || item.name || '').replace(/\s+/g, '_').replace(/[^\w\u4e00-\u9fff-]/g, '');
  return (prefix ? prefix + '_' : '') + key;
}

export function renderLikeBtn(itemId, itemData) {
  const faved = isFavorited(itemId);
  const favs = getFavorites();
  const listId = favs[itemId]?.list;
  const listInfo = FAV_LISTS.find(l => l.id === listId);
  const encoded = encodeFavoritePayload(itemData);
  const color = faved && listInfo ? listInfo.color : '';
  return `<button class="like-btn${faved ? ' liked' : ''}"
    data-id="${itemId}"
    title="${faved ? '已收藏 · 点击管理' : '收藏'}"
    style="${color ? `color:${color}` : ''}"
    onclick="event.stopPropagation();window._toggleFavorite('${itemId}', JSON.parse(decodeURIComponent('${encoded}')))">♥</button>`;
}

export function encodeFavoritePayload(itemData) {
  return encodeURIComponent(JSON.stringify(itemData))
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

export function refreshFavTab() {
  const btn = document.querySelector('[data-tab="favorites"]');
  if (!btn) return;
  const count = Object.keys(getFavorites()).length;
  btn.innerHTML = count > 0
    ? `❤️ 收藏 <span class="fav-count">${count}</span>`
    : '❤️ 收藏';
}
