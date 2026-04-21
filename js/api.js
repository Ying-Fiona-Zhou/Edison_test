/* ══════════════════════════════════════════
   api.js · 数据加载（fetch JSON / 缓存）
   依赖：state.js, config.js
   ══════════════════════════════════════════ */

import { state } from './state.js?v=20260421c';
import { CONFIG } from './config.js?v=20260421c';

// ── JSON Loader（支持多文件合并 + 缓存）────
export async function loadJSON(id) {
  if (state.cache[id]) return state.cache[id];

  if (id === 'play') {
    const [core, indoor, beach, playground, water, hiking, theme] = await Promise.all([
      fetch('data/play/play_core.json').then(r => r.json()),
      fetch('data/play/indoor.json').then(r => r.json()),
      fetch('data/play/beach.json').then(r => r.json()),
      fetch('data/play/playground.json').then(r => r.json()),
      fetch('data/play/water.json').then(r => r.json()),
      fetch('data/play/hiking.json').then(r => r.json()),
      fetch('data/play/theme.json').then(r => r.json()),
    ]);

    const data = {
      meta: core.meta,
      top3: core.top3,
      filters: core.filters,
      blocks: {
        ...core.blocks,
        ...indoor.blocks,
        ...beach.blocks,
        ...playground.blocks,
        ...water.blocks,
        ...hiking.blocks,
        ...theme.blocks,
      },
      block_meta: {
        ...core.block_meta,
        ...indoor.block_meta,
        ...beach.block_meta,
        ...playground.block_meta,
        ...water.block_meta,
        ...hiking.block_meta,
        ...theme.block_meta,
      }
    };

    state.cache[id] = data;
    return data;
  }

  if (id === 'seasonal') {
    const [events, farms, activities] = await Promise.all([
      fetch('data/seasonal/events.json').then(r => r.json()),
      fetch('data/seasonal/farms.json').then(r => r.json()),
      fetch('data/seasonal/activities.json').then(r => r.json()),
    ]);
    const data = { events, farms, activities };
    state.cache[id] = data;
    return data;
  }

  if (id === 'classes') {
    const [swim, classes] = await Promise.all([
      fetch('data/study/swim.json').then(r => r.json()),
      fetch('data/study/classes.json').then(r => r.json()),
    ]);
    const data = { swim, classes };
    state.cache[id] = data;
    return data;
  }

  if (id === 'study') {
    const [classes, daycare, swim] = await Promise.all([
      fetch('data/study/classes.json').then(r => r.json()),
      fetch('data/study/daycare.json').then(r => r.json()),
      fetch('data/study/swim.json').then(r => r.json()),
    ]);
    const data = { classes, daycare, swim };
    state.cache[id] = data;
    return data;
  }

  if (id === 'life') {
    const [doctor, food, house] = await Promise.all([
      fetch('data/life/doctor.json').then(r => r.json()),
      fetch('data/life/food.json').then(r => r.json()),
      fetch('data/life/house.json').then(r => r.json()),
    ]);
    const data = { doctor, food, house };
    state.cache[id] = data;
    return data;
  }

  if (id === 'fitness') {
    const [edison, piscataway, metuchen] = await Promise.all([
      fetch('data/fitness/ymca_edison.json').then(r => r.json()),
      fetch('data/fitness/ymca_piscataway.json').then(r => r.json()),
      fetch('data/fitness/metuchen.json').then(r => r.json()),
    ]);
    const data = { edison, piscataway, metuchen };
    state.cache[id] = data;
    return data;
  }

  const legacyPaths = {
    food: 'data/life/food.json',
    doctor: 'data/life/doctor.json',
    daycare: 'data/study/daycare.json',
    house: 'data/life/house.json',
  };
  const res = await fetch(legacyPaths[id] || `data/${id}.json`);
  const data = await res.json();
  state.cache[id] = data;
  return data;
}

// ── 后台预加载（不影响首屏速度）────────────
export function preloadOtherTabs(currentId) {
  const preloadId = id => id === 'events' ? 'seasonal' : id;
  const currentDataId = preloadId(currentId);
  const others = CONFIG.tabs
    .map(t => preloadId(t.id))
    .filter(id => id !== 'home' && id !== currentDataId);
  const schedule = window.requestIdleCallback || (fn => setTimeout(fn, 300));
  [...new Set(others)].forEach((id, i) => {
    schedule(() => {
      if (!state.cache[id]) loadJSON(id).catch(() => {});
    }, { timeout: 2000 + i * 500 });
  });
}
