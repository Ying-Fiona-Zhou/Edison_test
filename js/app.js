/* ══════════════════════════════════════════
   app.js · 入口（初始化 + 页面调度）
   type="module" — 所有依赖通过 import 引入
   ══════════════════════════════════════════ */

import { CONFIG } from './config.js?v=20260421c';
import { state } from './state.js?v=20260421c';
import { loadJSON, preloadOtherTabs } from './api.js?v=20260421c';
import { loadWeather, toggleOutfitPanel } from './weather.js?v=20260421c';
import { renderSection, renderFavoritesTab, renderHome } from './render.js?v=20260421c';
import { getFavorites, addToList, removeFromFavorites, toggleFavorite } from './favorites.js?v=20260421c';
import {
  toggleCard, toggleItem, resetCard,
  toggleEventCard, toggleActivityCard,
  toggleFarmFeatured, toggleAgePanel, sceneFilter
} from './events.js?v=20260421c';
import {
  filterPlay, filterSeasonal, filter_food,
  filterClasses, filter_doc, filter_daycare, filter_house, filterPanel,
  filterFitnessDay, filterFitnessSite
} from './filters.js?v=20260421c';

// ════════════════════════════════════════
// 暴露函数到 window（供 HTML onclick 使用）
// ════════════════════════════════════════
window._toggleOutfitPanel   = toggleOutfitPanel;
window._toggleCard          = toggleCard;
window._toggleItem          = toggleItem;
window._resetCard           = resetCard;
window._toggleEventCard     = toggleEventCard;
window._toggleActivityCard  = toggleActivityCard;
window._toggleFarmFeatured  = toggleFarmFeatured;
window._toggleAgePanel      = toggleAgePanel;
window._sceneFilter         = sceneFilter;
window._filterPlay          = filterPlay;
window._filterSeasonal      = filterSeasonal;
window._filter_food         = filter_food;
window._filterClasses       = filterClasses;
window._filter_doc          = filter_doc;
window._filter_daycare      = filter_daycare;
window._filter_house        = filter_house;
window._filterPanel         = filterPanel;
window._filterFitnessDay    = filterFitnessDay;
window._filterFitnessSite   = filterFitnessSite;
window._addToList           = addToList;
window._removeFromFavorites = removeFromFavorites;
window._toggleFavorite      = toggleFavorite;
window._showTab             = showTab;   // 前向声明，函数在下方定义

// ── Tab 导航渲染 ──────────────────────────
function renderNavTabs() {
  const container = document.getElementById('nav-tabs');
  if (!container) return;
  const currentPage = getCurrentPage();
  const favCount = Object.keys(getFavorites()).length;
  const favBadge = favCount > 0 ? ` <span class="fav-count">${favCount}</span>` : '';
  container.innerHTML = CONFIG.tabs.map(tab => `
    <a class="tab-btn${currentPage === tab.id ? ' active' : ''}"
            data-tab="${tab.id}"
            href="${tab.href}">
      <span class="tab-icon" aria-hidden="true">${tab.icon || ''}</span>
      <span>${tab.label}</span>
    </a>
  `).join('') + `
    <a class="tab-btn fav-tab${currentPage === 'favorites' ? ' active' : ''}" data-tab="favorites" href="favorites.html">
      <span class="tab-icon" aria-hidden="true">❤️</span>
      <span>收藏</span>${favBadge}
    </a>`;
}

// ── Scene 格子渲染 ────────────────────────
function renderSceneGrid() {
  const grid = document.getElementById('scene-grid');
  if (!grid) return;
  grid.innerHTML = CONFIG.scenes.map(s => `
    <div class="scene-card" onclick="window._sceneFilter('${s.filter}', this)">
      <span class="scene-icon">${s.icon}</span>
      <div class="scene-label">${s.label}</div>
      <div class="scene-hint">${s.hint}</div>
    </div>
  `).join('');
}

// ── Tab 切换 ──────────────────────────────
async function showTab(id, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = btn || document.querySelector(`[data-tab="${id}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  state.activeTab = id;
  state.activeFilter = 'all';

  const sceneSection = document.getElementById('scene-section');
  if (sceneSection) sceneSection.style.display = id === 'play' ? '' : 'none';

  if (id === 'favorites') {
    document.getElementById('content-loading').style.display = 'none';
    document.getElementById('content-area').innerHTML = '';
    renderFavoritesTab();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  document.getElementById('content-loading').style.display = 'block';
  document.getElementById('content-area').innerHTML = '';

  const dataId = id === 'events' ? 'seasonal' : id;
  const data = await loadJSON(dataId);

  document.getElementById('content-loading').style.display = 'none';
  document.getElementById('content-area').innerHTML = renderSection(id, data);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getCurrentPage() {
  const file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const map = {
    '': 'home',
    'index.html': 'home',
    'play.html': 'play',
    'events.html': 'events',
    'study.html': 'study',
    'life.html': 'life',
    'fitness.html': 'fitness',
    'favorites.html': 'favorites',
  };
  return map[file] || 'home';
}

function updateHeroForPage(page) {
  const title = document.getElementById('hero-title');
  const greeting = document.getElementById('hero-page-label');
  const copy = {
    home: ['🧭', '今天怎么安排？', 'Edison 华人家庭 · 决策入口'],
    play: ['📍', '带娃出门，今天去哪好？', '遛娃地点 · 室内 / 水 / 公园'],
    events: ['🌸', '最近有什么活动？', '近期活动 · 农场 · 季节玩法'],
    study: ['🎓', '孩子学点什么？', '兴趣班 · Daycare · 游泳'],
    life: ['🧰', '生活里的大小事，这里都有准备。', '医生 · 餐厅 · 房屋维修'],
    fitness: ['🧘', '今天上哪节课？', 'YMCA / ECC 健身课表'],
    favorites: ['❤️', '这个周末，就从收藏里选。', '这个周末去 · 想去 · 去过 · 收藏'],
  };
  const pageCopy = copy[page] || copy.home;
  if (title) title.innerHTML = `<span class="hero-title-icon" aria-hidden="true">${pageCopy[0]}</span>${pageCopy[1]}`;
  if (greeting) greeting.textContent = pageCopy[2];
}

async function renderCurrentPage() {
  const page = getCurrentPage();
  updateHeroForPage(page);
  state.activeTab = page;

  const loading = document.getElementById('content-loading');
  const area = document.getElementById('content-area');
  const sceneSection = document.getElementById('scene-section');
  if (sceneSection) sceneSection.style.display = page === 'play' ? '' : 'none';

  if (page === 'favorites') {
    if (loading) loading.style.display = 'none';
    renderFavoritesTab();
    return;
  }

  if (loading) loading.style.display = 'block';
  if (area) area.innerHTML = '';

  if (page === 'home') {
    const [play, seasonal, fitness] = await Promise.all([
      loadJSON('play'),
      loadJSON('seasonal'),
      loadJSON('fitness'),
    ]);
    if (loading) loading.style.display = 'none';
    area.innerHTML = renderHome({ play, seasonal, fitness });
    preloadOtherTabs('home');
    return;
  }

  const dataId = page === 'events' ? 'seasonal' : page;
  const data = await loadJSON(dataId);
  if (loading) loading.style.display = 'none';
  area.innerHTML = renderSection(page, data);
  preloadOtherTabs(dataId);
}

// ── 启动 ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 注入 ❤️ 按钮 CSS
  const style = document.createElement('style');
  style.textContent = `
    .like-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: #ccc;
      line-height: 1;
      padding: 4px;
      border-radius: 50%;
      transition: color 0.18s, transform 0.18s;
      z-index: 2;
    }
    .like-btn:hover { color: #f87171; }
    .like-btn.liked { color: #ef4444; }
    .fav-count {
      display: inline-block;
      background: #ef4444;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      border-radius: 10px;
      padding: 1px 5px;
      margin-left: 2px;
      vertical-align: middle;
      line-height: 1.4;
    }
    .fav-tab { white-space: nowrap; }
    #list-menu-overlay button:hover {
      filter: brightness(0.97);
    }
  `;
  document.head.appendChild(style);

  renderNavTabs();
  renderSceneGrid();
  loadWeather();
  renderCurrentPage().catch(err => {
    console.error(err);
    document.getElementById('content-loading').textContent = '加载失败，请稍后再试';
  });
});
