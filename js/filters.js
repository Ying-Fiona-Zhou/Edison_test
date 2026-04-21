/* ══════════════════════════════════════════
   filters.js · filter / 分类逻辑
   依赖：state.js
   ══════════════════════════════════════════ */

import { state } from './state.js?v=20260421c';

// ── 通用：激活选中的 chip ─────────────────
export function setFilter(chips, activeEl) {
  chips.forEach(c => c.classList.remove('on'));
  activeEl.classList.add('on');
}

// ── Play 筛选 ─────────────────────────────
export function filterPlay(type, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  document.querySelectorAll('.play-block').forEach(block => {
    block.style.display = (type === 'all' || block.dataset.block === type) ? '' : 'none';
  });
  state.activeFilter = type;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Seasonal 筛选 ─────────────────────────
export function filterSeasonal(type, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  document.querySelectorAll('.seasonal-block').forEach(block => {
    block.style.display = (type === 'all' || block.dataset.block === type) ? '' : 'none';
  });
}

export function filterPanel(selector, type, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  document.querySelectorAll(selector).forEach(block => {
    block.style.display = (type === 'all' || block.dataset.block === type) ? '' : 'none';
  });
}

export function filterFitnessDay(day, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  const area = document.getElementById('content-area');
  if (!area) return;
  area.dataset.fitnessDay = day;
  syncFitnessFilters();
}

export function filterFitnessSite(site, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  const area = document.getElementById('content-area');
  if (!area) return;
  area.dataset.fitnessSite = site;
  syncFitnessFilters();
}

function syncFitnessFilters() {
  const area = document.getElementById('content-area');
  const activeDay = area?.dataset.fitnessDay || 'Monday';
  const activeSite = area?.dataset.fitnessSite || 'all';

  document.querySelectorAll('.fitness-day').forEach(dayBlock => {
    const dayVisible = dayBlock.dataset.block === activeDay;
    dayBlock.style.display = dayVisible ? '' : 'none';
    if (!dayVisible) return;

    dayBlock.querySelectorAll('.fitness-session').forEach(session => {
      session.style.display = activeSite === 'all' || session.dataset.site === activeSite ? '' : 'none';
    });

    dayBlock.querySelectorAll('.timetable-group').forEach(group => {
      const visibleSessions = [...group.querySelectorAll('.fitness-session')]
        .some(session => session.style.display !== 'none');
      group.style.display = visibleSessions ? '' : 'none';
    });
  });
}

// ── Food 筛选 ─────────────────────────────
export function filter_food(type, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  document.querySelectorAll('.food-card').forEach(card => {
    card.style.display = (type === 'all' || card.classList.contains(`food-${type}`)) ? '' : 'none';
  });
}

// ── Classes 筛选 ──────────────────────────
export function filterClasses(type, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  document.querySelectorAll('.classes-block').forEach(block => {
    block.style.display = (type === 'all' || block.dataset.block === type) ? '' : 'none';
  });
}

// ── Category 筛选（doctor / daycare / house）
export function filter_doc(type, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  document.querySelectorAll('.doc-card').forEach(card => {
    card.style.display = (type === 'all' || card.classList.contains(`doc-${type}`)) ? '' : 'none';
  });
  syncCategoryHeaders('doc');
}

export function filter_daycare(type, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  document.querySelectorAll('.daycare-card').forEach(card => {
    card.style.display = (type === 'all' || card.classList.contains(`daycare-${type}`)) ? '' : 'none';
  });
  syncCategoryHeaders('daycare');
}

export function filter_house(type, el) {
  setFilter(el.parentElement.querySelectorAll('.filter-chip'), el);
  document.querySelectorAll('.house-card').forEach(card => {
    card.style.display = (type === 'all' || card.classList.contains(`house-${type}`)) ? '' : 'none';
  });
  syncCategoryHeaders('house');
}

function syncCategoryHeaders(prefix) {
  document.querySelectorAll('.category-block').forEach(block => {
    const visibleCards = [...block.querySelectorAll(`.${prefix}-card`)]
      .filter(c => c.style.display !== 'none');
    block.style.display = visibleCards.length ? '' : 'none';
  });
}
