/* ══════════════════════════════════════════
   events.js · 所有点击 / 交互事件处理
   依赖：favorites.js, filters.js
   ══════════════════════════════════════════ */

import { CONFIG } from './config.js?v=20260421c';

// ── Checklist 交互 ────────────────────────
export function toggleCard(id) {
  const panel = document.getElementById(id + '-panel');
  const arrow = document.getElementById(id + '-arrow');
  if (!panel) return;
  const isOpen = panel.style.maxHeight !== '0px' && panel.style.maxHeight !== '';
  panel.style.maxHeight = isOpen ? '0' : '600px';
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

export function toggleItem(id) {
  document.getElementById(id)?.classList.toggle('checked');
}

export function resetCard(cardId) {
  document.querySelectorAll(`[id^="${cardId}-"]`).forEach(el => {
    if (el.classList.contains('check-item')) el.classList.remove('checked');
  });
}

// ── Event 卡片展开 ────────────────────────
export function toggleEventCard(id) {
  const body = document.getElementById('event-body-' + id);
  const arrow = document.getElementById('event-arrow-' + id);
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

// ── Activity 卡片展开 ─────────────────────
export function toggleActivityCard(id) {
  const body = document.getElementById('activity-body-' + id);
  const arrow = document.getElementById('activity-arrow-' + id);
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

// ── 精选农场展开 ──────────────────────────
export function toggleFarmFeatured() {
  const body = document.getElementById('farm-featured-body');
  const arrow = document.getElementById('farm-featured-arrow');
  if (!body) return;
  const isOpen = body.style.maxHeight !== '0px' && body.style.maxHeight !== '';
  body.style.maxHeight = isOpen ? '0' : '1200px';
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

// ── 兴趣班年龄面板展开 ────────────────────
export function toggleAgePanel(id) {
  const panel = document.getElementById(id);
  const arrow = document.getElementById(id + '-arrow');
  if (!panel) return;
  const isOpen = panel.style.maxHeight !== '0px' && panel.style.maxHeight !== '';
  panel.style.maxHeight = isOpen ? '0' : '2000px';
  if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

// ── Scene 快捷场景按钮 ────────────────────
export function sceneFilter(type, sceneCardEl) {
  if (sceneCardEl) {
    sceneCardEl.style.transition = 'background 0.15s';
    sceneCardEl.style.background = 'var(--sage-light)';
    setTimeout(() => { sceneCardEl.style.background = ''; }, 300);
  }

  const sceneConfig = CONFIG.scenes.find(s => s.filter === type);
  if (sceneConfig && sceneConfig.action) {
    window._showTab(sceneConfig.action);
    return;
  }

  window._showTab('play').then(() => {
    const chips = document.querySelectorAll('#content-area .filter-chip');
    let matchedChip = null;
    chips.forEach(c => {
      const onclick = c.getAttribute('onclick') || '';
      if (onclick.includes(`'${type}'`)) matchedChip = c;
    });
    if (matchedChip) {
      window._filterPlay(type, matchedChip);
      setTimeout(() => matchedChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }), 80);
    }
    const filterRow = document.querySelector('#content-area .filter-row');
    if (filterRow) setTimeout(() => filterRow.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  });
}
