/* ══════════════════════════════════════════
   render.js · UI 渲染（cards / sections）
   依赖：favorites.js, filters.js, config.js
   ══════════════════════════════════════════ */

import { CONFIG } from './config.js?v=20260421c';
import { FAV_LISTS, getFavorites, isFavorited, makeItemId, renderLikeBtn, addToList, removeFromFavorites, encodeFavoritePayload } from './favorites.js?v=20260421c';

// ════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════

export function renderTag(tag) {
  return `<span class="tag tag-${tag.type}">${tag.text}</span>`;
}

function extractDist(addr) {
  if (!addr) return '';
  const m = addr.match(/(本地|约[\d–\.]+\s*(?:min|小时|hours?))/);
  return m ? m[1] : '';
}

function extractAge(tags) {
  if (!tags) return '';
  const t = tags.find(t => t.type === 'age' || /岁/.test(t.text));
  return t ? t.text : '';
}

function renderSummaryBar(item) {
  const dist = extractDist(item.addr);
  const age  = extractAge(item.tags);
  const tip  = item.tip || '';
  const parts = [];
  if (dist) parts.push(`📍 ${dist}`);
  if (age)  parts.push(`👶 ${age}`);
  if (tip)  parts.push(`💡 ${tip}`);
  if (!parts.length) return '';
  return `<div style="display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 2px;font-size:11px;color:var(--ink-muted);line-height:1.5;">${parts.map(p => `<span>${p}</span>`).join('<span style="color:var(--border);">·</span>')}</div>`;
}

export function renderCard(item, extraClass = '') {
  const tags = (item.tags || []).map(renderTag).join('');
  const note = item.note ? `<div class="card-note">${item.note}</div>` : '';
  const phone = item.phone
    ? `<a class="map-btn" href="tel:${item.phone}">📞 ${item.phone}</a>` : '';
  const map = item.mapQ
    ? `<a class="map-btn" href="https://maps.google.com/?q=${item.mapQ}" target="_blank">地图 →</a>` : '';
  const web = item.website
    ? `<a class="web-btn" href="${item.website}" target="_blank">官网 →</a>` : '';
  const addr = item.addr ? `<span class="card-addr">${item.addr}</span>` : '';
  const footer = (addr || phone || map || web)
    ? `<div class="card-footer">${addr}${phone}${map}${web}</div>` : '';
  const summaryBar = renderSummaryBar(item);

  const itemId = makeItemId(item, extraClass.split(' ')[0] || '');
  const likeData = {
    _itemId: itemId, name: item.name, note: item.note || '',
    tags: item.tags || [], addr: item.addr || '', mapQ: item.mapQ || '',
    phone: item.phone || '', website: item.website || '',
    checklist: item.checklist || null
  };
  const likeBtn = renderLikeBtn(itemId, likeData);

  if (item.checklist) {
    const cardId = 'cl-' + Math.random().toString(36).slice(2, 8);
    const checklist = renderChecklist(item, cardId);
    return `
      <div class="card${extraClass ? ' ' + extraClass : ''}" id="${cardId}" style="padding:0;overflow:hidden;position:relative;">
        ${likeBtn}
        <div style="padding:14px 16px 0;padding-right:44px;">
          <div class="card-name">${item.name}</div>
          ${summaryBar}
          ${tags ? `<div class="card-tags">${tags}</div>` : ''}
          ${note}
        </div>
        <div onclick="window._toggleCard('${cardId}')"
             style="padding:8px 16px 10px;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <span style="font-size:11px;color:var(--sage-dark);font-weight:600;letter-spacing:0.03em;">🧾 出发 Checklist</span>
          <span id="${cardId}-arrow"
                style="font-size:12px;color:var(--ink-muted);transition:transform 0.2s;display:inline-block;flex-shrink:0;">▼</span>
        </div>
        ${checklist}
        ${footer ? `<div style="padding:0 16px 14px;">${footer}</div>` : ''}
      </div>`;
  }

  return `
    <div class="card${extraClass ? ' ' + extraClass : ''}" style="position:relative;">
      ${likeBtn}
      <div class="card-name" style="padding-right:28px;">${item.name}</div>
      ${summaryBar}
      ${tags ? `<div class="card-tags">${tags}</div>` : ''}
      ${note}
      ${footer}
    </div>`;
}

function renderRedirectCard(item) {
  return `
    <div class="card" style="background:linear-gradient(135deg,#FFF8F0 0%,#FDF6FF 100%);border:1.5px dashed #F4A261;cursor:pointer;" onclick="window._showTab('${item.action}')">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:22px;">${item.icon}</span>
        <div class="card-name" style="margin:0;">${item.title}</div>
      </div>
      <div class="card-note">${item.note}</div>
      <div style="margin-top:12px;">
        <span style="display:inline-block;background:var(--sage);color:#fff;font-size:12px;font-weight:600;padding:6px 16px;border-radius:20px;">
          ${item.btnText}
        </span>
      </div>
    </div>`;
}

function renderTop3(top3, label = '群友强推') {
  if (!top3 || !top3.length) return '';
  const pills = top3.map(item => {
    const href = item.mapQ
      ? `https://maps.google.com/?q=${item.mapQ}`
      : item.phone ? `tel:${item.phone}` : '#';
    const target = item.phone ? '' : ' target="_blank"';
    return `<a class="top3-pill" href="${href}"${target}>${item.label} <span class="top3-pill-tag">${item.tag}</span></a>`;
  }).join('');
  return `
    <div class="top3-strip">
      <span class="top3-strip-label">${label}</span>
      ${pills}
    </div>`;
}

function renderAvoid(avoid) {
  if (!avoid || !avoid.length) return '';
  const cards = avoid.map(a => `
    <div class="avoid-card">
      <div class="avoid-name">${a.name}</div>
      <div class="avoid-reason">${a.reason}</div>
    </div>`).join('');
  return `<div class="list-header">⚠️ 避坑</div>${cards}`;
}

function renderFilterRow(filters, onclickFn) {
  return `
    <div class="filter-row">
      ${filters.map((f, i) => {
        const id = typeof f === 'string' ? f : f.id;
        const label = typeof f === 'string' ? id : f.label;
        const active = i === 0 ? ' on' : '';
        return `<button class="filter-chip${active}" onclick="window._${onclickFn}('${id}', this)">${label}</button>`;
      }).join('')}
    </div>`;
}

function renderDisclaimer() {
  return `<div class="disclaimer">${CONFIG.site.disclaimer}</div>`;
}

function withoutDisclaimer(html) {
  return html.replace(/\s*<div class="disclaimer">[\s\S]*?<\/div>\s*$/m, '');
}

function renderBadge(text, style = 'green') {
  const styles = {
    green:  'color:var(--sage-dark);background:var(--sage-light);border:1px solid var(--sage);',
    blue:   'color:#1565C0;background:#E3F2FD;border:1px solid #90CAF9;',
    purple: 'color:#6A1B9A;background:#F3E5F5;border:1px solid #CE93D8;',
  };
  const s = styles[style] || styles.green;
  return `<div style="font-size:11px;font-weight:600;padding:6px 12px;border-radius:20px;display:inline-block;margin-bottom:12px;${s}">${text}</div>`;
}

function renderSubLabel(label, badge, badgeColor) {
  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;margin-top:20px;">
      <span style="font-size:13px;font-weight:700;color:var(--ink);">${label}</span>
      ${badge ? `<span style="font-size:11px;color:var(--ink-muted);background:#FFF8E1;padding:3px 9px;border-radius:20px;border:1px solid #FFE082;">${badge}</span>` : ''}
    </div>`;
}

// ════════════════════════════════════════
// CHECKLIST
// ════════════════════════════════════════

function renderChecklist(item, cardId) {
  const cl = item.checklist;

  const group = (emoji, label, items) => {
    if (!items?.length) return '';
    const itemsHtml = items.map((text, i) => {
      const isWarn = text.startsWith('⚠️');
      const id = `${cardId}-${label}-${i}`;
      return `
        <div class="check-item${isWarn ? ' warn-item' : ''}"
             id="${id}" onclick="window._toggleItem('${id}')">
          <div class="check-box"></div>
          <span>${text}</span>
        </div>`;
    }).join('');
    return `
      <div class="checklist-group">
        <div class="group-label">${emoji} ${label}</div>
        <div class="item-list">${itemsHtml}</div>
      </div>`;
  };

  return `
    <div class="checklist-panel" id="${cardId}-panel"
         style="max-height:0;overflow:hidden;transition:max-height 0.35s ease;">
      <div style="border-top:1px solid var(--border);padding:14px 16px 16px;background:linear-gradient(to bottom,var(--sage-light,#f4f2ed),var(--white,#fff));">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:var(--ink-muted);margin-bottom:12px;">🧾 出发 Checklist</div>
        ${group('🎒', '必带（所有人）', cl.base)}
        ${group('🛻', '带推车', cl.with_stroller)}
        ${group('👜', '不带推车', cl.no_stroller)}
        ${group('🚼', '如厕训练阶段', cl.potty_training)}
        <button onclick="window._resetCard('${cardId}')"
                style="font-size:11px;color:var(--ink-muted);background:none;border:none;cursor:pointer;margin-top:8px;text-decoration:underline;">重置勾选</button>
      </div>
    </div>`;
}

// ════════════════════════════════════════
// FAVORITES TAB
// ════════════════════════════════════════

export function renderFavoritesTab() {
  const area = document.getElementById('content-area');
  const favs = getFavorites();
  const allItems = Object.values(favs).sort((a, b) => (b.movedAt || b.savedAt) - (a.movedAt || a.savedAt));

  if (!allItems.length) {
    area.innerHTML = `
      <div style="text-align:center;padding:60px 20px 40px;">
        <div style="font-size:48px;margin-bottom:16px;">🤍</div>
        <div style="font-size:16px;font-weight:600;color:var(--ink);margin-bottom:10px;">还没有收藏</div>
        <div style="font-size:13px;color:var(--ink-muted);line-height:1.7;">点击卡片上的 ♥ 按钮<br>把喜欢的地方加入清单</div>
      </div>`;
    return;
  }

  const sections = FAV_LISTS.map(lst => {
    const items = allItems.filter(i => i.list === lst.id);
    if (!items.length) return `
      <div style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <span style="font-size:15px;font-weight:700;color:${lst.color};">${lst.label}</span>
          <span style="font-size:11px;color:var(--ink-muted);background:#f3f4f6;padding:1px 8px;border-radius:10px;">暂无</span>
        </div>
        <div style="border:1.5px dashed ${lst.border};border-radius:12px;padding:16px;text-align:center;color:var(--ink-muted);font-size:12px;">
          还没有加入这个列表的地方
        </div>
      </div>`;

    const cards = items.map(item => {
      const itemId = item._itemId || item.name;
      const tags = (item.tags || []).map(renderTag).join('');
      const note = item.note ? `<div class="card-note" style="font-size:12px;">${item.note}</div>` : '';
      const map = item.mapQ ? `<a class="map-btn" href="https://maps.google.com/?q=${item.mapQ}" target="_blank">地图 →</a>` : '';
      const phone = item.phone ? `<a class="map-btn" href="tel:${item.phone}">📞 ${item.phone}</a>` : '';
      const web = item.website ? `<a class="web-btn" href="${item.website}" target="_blank">官网 →</a>` : '';
      const addr = item.addr ? `<span class="card-addr">${item.addr}</span>` : '';
      const footer = (addr || map || phone || web) ? `<div class="card-footer">${addr}${phone}${map}${web}</div>` : '';
      const encoded = encodeFavoritePayload(item);

      const moveChips = FAV_LISTS.filter(l => l.id !== lst.id).map(l =>
        `<button onclick="window._addToList('${l.id}','${itemId}',JSON.parse(decodeURIComponent('${encoded}')))"
          style="font-size:10px;padding:3px 9px;border-radius:10px;border:1px solid ${l.border};background:${l.bg};color:${l.color};cursor:pointer;font-weight:600;white-space:nowrap;">
          → ${l.label}
        </button>`
      ).join('');

      if (lst.id === 'weekend' && item.checklist) {
        const cardId = 'fav-cl-' + itemId.replace(/[^\w]/g, '_');
        const checklist = renderChecklist(item, cardId);
        return `
          <div class="card" id="${cardId}" style="padding:0;overflow:hidden;position:relative;border-left:3px solid ${lst.color};">
            <button onclick="window._removeFromFavorites('${itemId}')"
              style="position:absolute;top:10px;right:10px;background:none;border:none;cursor:pointer;font-size:16px;color:#d1d5db;padding:4px;border-radius:50%;transition:color 0.15s;z-index:2;"
              onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#d1d5db'"
              title="取消收藏">♥</button>
            <div style="padding:14px 16px 0;padding-right:40px;">
              <div class="card-name">${item.name}</div>
              ${tags ? `<div class="card-tags">${tags}</div>` : ''}
              ${note}
              ${footer}
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">${moveChips}</div>
            </div>
            <div onclick="window._toggleCard('${cardId}')"
                 style="padding:8px 16px 10px;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <span style="font-size:11px;color:var(--sage-dark);font-weight:600;letter-spacing:0.03em;">🧾 出发 Checklist</span>
              <span id="${cardId}-arrow" style="font-size:12px;color:var(--ink-muted);transition:transform 0.2s;display:inline-block;">▼</span>
            </div>
            ${checklist}
          </div>`;
      }

      return `
        <div class="card" style="position:relative;border-left:3px solid ${lst.color};">
          <button onclick="window._removeFromFavorites('${itemId}')"
            style="position:absolute;top:10px;right:10px;background:none;border:none;cursor:pointer;font-size:16px;color:#d1d5db;padding:4px;border-radius:50%;transition:color 0.15s;"
            onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#d1d5db'"
            title="取消收藏">♥</button>
          <div class="card-name" style="padding-right:32px;">${item.name}</div>
          ${tags ? `<div class="card-tags">${tags}</div>` : ''}
          ${note}
          ${footer}
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">${moveChips}</div>
        </div>`;
    }).join('');

    return `
      <div style="margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:15px;font-weight:700;color:${lst.color};">${lst.label}</span>
          <span style="font-size:11px;color:#fff;background:${lst.color};padding:1px 8px;border-radius:10px;font-weight:700;">${items.length}</span>
        </div>
        <div class="card-grid">${cards}</div>
      </div>`;
  }).join('');

  area.innerHTML = `
    <div style="padding:8px 0 16px;">
      <div class="favorites-overview">
        <div>
          <div class="decision-kicker">我的清单</div>
          <div class="decision-title">这个周末去哪里，从这里定</div>
        </div>
        <div class="mini-count">${allItems.length} 个</div>
      </div>
      ${sections}
    </div>
    ${renderDisclaimer()}`;
}

// ════════════════════════════════════════
// HOME / DECISION ENTRY
// ════════════════════════════════════════

export function renderHome({ play, seasonal, fitness }) {
  const todayName = getTodayName();
  const todayFitness = pickTodayFitness(fitness, todayName, { futureOnly: true }).slice(0, 4);
  const weekendPicks = getWeekendPicks(play, seasonal).slice(0, 3);
  const hot = getRecentHot(play, seasonal).slice(0, 4);

  return `
    <div class="decision-stack">
      <section class="decision-panel today-panel">
        <div class="decision-kicker">今天推荐</div>
        <div class="decision-title">先选一个最省心的安排</div>
        <div class="today-choice-grid">
          ${renderTodayChoice('play.html', '遛娃放电', weekendPicks[0]?.name || weekendPicks[0]?.label || '找一个近一点的公园', '适合临时出门')}
          ${renderTodayChoice('events.html', '近期活动', getFirstActiveEvent(seasonal)?.title || '看看本周活动', '适合周末计划')}
          ${renderTodayChoice('fitness.html', '自己动一动', todayFitness[0] ? `${startTimeLabel(todayFitness[0].time)} ${todayFitness[0].class}` : '查看今日课表', todayName)}
        </div>
      </section>

      <section class="decision-panel">
        <div class="section-heading-row">
          <div>
            <div class="decision-kicker">今日</div>
            <div class="decision-title">🧘 推荐健身课</div>
          </div>
          <a class="soft-link" href="fitness.html">完整课表</a>
        </div>
        <div class="fitness-mini-list">
          ${todayFitness.length ? todayFitness.map(renderFitnessMini).join('') : '<div class="empty-mini">今天剩下的时间暂无推荐课，去完整课表看看明后天。</div>'}
        </div>
      </section>

      <section class="decision-panel">
        <div class="section-heading-row">
          <div>
            <div class="decision-kicker">Top 3</div>
            <div class="decision-title">📍 周末去哪</div>
          </div>
          <a class="soft-link" href="play.html">看全部</a>
        </div>
        <div class="weekend-grid">
          ${weekendPicks.map((item, i) => renderWeekendPick(item, i)).join('')}
        </div>
      </section>

      <section class="decision-panel">
        <div class="decision-kicker">快速入口</div>
        <div class="quick-entry-grid">
          ${renderQuickEntry('play.html', '📍 遛娃', '室内 / 水 / 公园')}
          ${renderQuickEntry('events.html', '🌸 活动', '近期活动 / 农场')}
          ${renderQuickEntry('study.html', '🎓 学习', '兴趣班 / Daycare / 游泳')}
          ${renderQuickEntry('life.html', '🧰 生活', '医生 / 餐厅 / 维修')}
        </div>
      </section>

      <section class="decision-panel">
        <div class="section-heading-row">
          <div>
            <div class="decision-kicker">最近热门</div>
            <div class="decision-title">✨ 大家常会先看这些</div>
          </div>
          <a class="soft-link" href="favorites.html">我的收藏</a>
        </div>
        <div class="hot-list">
          ${hot.map(renderHotRow).join('')}
        </div>
      </section>
    </div>
    ${renderDisclaimer()}`;
}

function renderTodayChoice(href, title, desc, meta) {
  return `
    <a class="today-choice" href="${href}">
      <span class="choice-title">${title}</span>
      <span class="choice-desc">${desc}</span>
      <span class="choice-meta">${meta}</span>
    </a>`;
}

function renderWeekendPick(item, index) {
  const title = item.name || item.label || '';
  const note = item.tip || item.tag || item.note || '';
  const map = item.mapQ ? `<a class="soft-link" href="https://maps.google.com/?q=${item.mapQ}" target="_blank">地图</a>` : '';
  return `
    <div class="weekend-card">
      <div class="rank-mark">${index + 1}</div>
      <div class="weekend-name">${title}</div>
      <div class="weekend-note">${note}</div>
      ${map}
    </div>`;
}

function renderFitnessMini(item) {
  const flags = [item.site, item.room, item.instructor].filter(Boolean).join(' · ');
  return `
    <a class="fitness-mini-row" href="fitness.html">
      <span class="fitness-mini-time">${startTimeLabel(item.time)}</span>
      <span class="fitness-mini-main">${item.class}</span>
      <span class="fitness-mini-place">${flags}</span>
    </a>`;
}

function renderQuickEntry(href, title, desc) {
  return `
    <a class="quick-entry" href="${href}">
      <span>${title}</span>
      <small>${desc}</small>
    </a>`;
}

function renderHotRow(item) {
  const title = item.name || item.label || item.title || '';
  const note = item.tip || item.tag || item.subtitle || item.note || '';
  const href = item.href || 'play.html';
  return `
    <a class="hot-row" href="${href}">
      <span>${title}</span>
      <small>${note}</small>
    </a>`;
}

function getWeekendPicks(play, seasonal) {
  const top = (play.top3 || []).map(i => ({ ...i, href: 'play.html' }));
  if (top.length >= 3) return top;
  return top.concat((seasonal?.farms?.others || []).map(i => ({ ...i, href: 'events.html' })));
}

function getFirstActiveEvent(seasonal) {
  return (seasonal?.events?.events || []).find(e => e.status === 'now') || (seasonal?.events?.events || [])[0];
}

function getRecentHot(play, seasonal) {
  const favs = Object.values(getFavorites())
    .sort((a, b) => (b.movedAt || b.savedAt || 0) - (a.movedAt || a.savedAt || 0))
    .map(item => ({ ...item, href: 'favorites.html' }));
  if (favs.length) return favs;
  const event = getFirstActiveEvent(seasonal);
  return [
    ...(play.top3 || []).map(i => ({ ...i, href: 'play.html' })),
    ...(event ? [{ ...event, href: 'events.html' }] : []),
  ];
}

function getTodayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
}

function pickTodayFitness(data, dayName, options = {}) {
  const sites = [
    data?.edison && { key: 'edison', site: data.edison.meta.short || data.edison.meta.name, data: data.edison },
    data?.piscataway && { key: 'piscataway', site: data.piscataway.meta.short || data.piscataway.meta.name, data: data.piscataway },
    data?.metuchen && { key: 'metuchen', site: data.metuchen.meta.short || data.metuchen.meta.name, data: data.metuchen },
  ].filter(Boolean);
  const now = new Date();
  const nowScore = now.getHours() * 60 + now.getMinutes();
  return sites.flatMap(site => (site.data.schedule?.[dayName] || []).map(item => ({
    ...item,
    site: site.site,
    siteKey: site.key,
  })))
    .filter(item => !options.futureOnly || timeScore(item.time) >= nowScore)
    .sort((a, b) => timeScore(a.time) - timeScore(b.time));
}

function timeScore(value = '') {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(am|pm)?(?:\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm))?/i);
  if (!match) return 9999;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const endHour = Number(match[4] || 0);
  const endMeridiem = match[6]?.toLowerCase();
  let meridiem = match[3]?.toLowerCase();
  if (!meridiem) {
    if (endMeridiem === 'am') meridiem = 'am';
    else if (endMeridiem === 'pm' && endHour === 12 && hour !== 12) meridiem = 'am';
    else meridiem = endMeridiem || 'am';
  }
  if (meridiem === 'pm' && hour !== 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function startTimeLabel(value = '') {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(am|pm)?(?:\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm))?/i);
  if (!match) return value;
  let meridiem = match[3]?.toLowerCase();
  const startHour = Number(match[1]);
  const endHour = Number(match[4] || 0);
  const endMeridiem = match[6]?.toLowerCase();
  if (!meridiem) {
    if (endMeridiem === 'am') meridiem = 'am';
    else if (endMeridiem === 'pm' && endHour === 12 && startHour !== 12) meridiem = 'am';
    else meridiem = endMeridiem || '';
  }
  return `${match[1]}:${match[2]}${meridiem}`;
}

// ════════════════════════════════════════
// SECTION ROUTERS
// ════════════════════════════════════════

export function renderSection(id, data) {
  switch (id) {
    case 'play':     return renderPlay(data);
    case 'events':
    case 'seasonal': return renderSeasonal(data);
    case 'study':    return renderStudy(data);
    case 'life':     return renderLife(data);
    case 'fitness':  return renderFitness(data);
    case 'food':     return renderFood(data);
    case 'doctor':   return renderCategorySection(data, 'doc');
    case 'daycare':  return renderCategorySection(data, 'daycare');
    case 'house':    return renderCategorySection(data, 'house');
    case 'classes':  return renderClasses(data);
    default:         return '<p>未知 section</p>';
  }
}

// ════════════════════════════════════════
// PLAY SECTION
// ════════════════════════════════════════

const BLOCK_MAIN_HEADER = {
  general:    '',
  beach:      '🏖️ 海滩（按距离/类型）',
  playground: '🛝 Playground（按场景）',
  water:      '💦 免费玩水（夏天必备）',
  hiking:     '🥾 Hiking（带娃友好分级）',
  indoor:     '🏠 室内活动',
  theme:      '🎢 游乐场 / 主题乐园',
};

function renderPlay(data) {
  const filterRow = renderFilterRow(data.filters, 'filterPlay');
  const top3 = renderTop3(data.top3);
  const blocks = Object.keys(data.blocks).map(blockId => {
    const blockData = data.blocks[blockId];
    const blockMeta = data.block_meta[blockId] || {};
    return `
      <div class="play-block" data-block="${blockId}">
        ${renderPlaySubsections(blockId, blockData, blockMeta.subsections || {})}
      </div>`;
  }).join('\n');
  return `${filterRow}${top3}${blocks}${renderDisclaimer()}`;
}

function renderPlaySubsections(blockId, subs, subMeta) {
  const mainHeader = BLOCK_MAIN_HEADER[blockId]
    ? `<div class="list-header">${BLOCK_MAIN_HEADER[blockId]}</div>` : '';

  const subsHtml = Object.entries(subs).map(([subId, items]) => {
    if (!items || !items.length) return '';
    const sm = subMeta[subId] || {};
    let header = '';

    if (subId === 'indoor_discharge') {
      header = renderSubLabel('⚡ 放电型', '蹦跳·攀爬·跑跑跳');
    } else if (subId === 'indoor_light') {
      header = renderSubLabel('🎨 轻活动型', '画画·手工·早教课');
    } else if (subId === 'outdoor') {
      header = `<div class="list-header">室外公园</div>`;
    } else if (subId === 'sakura') {
      header = `<div class="list-header">赏花 · 春季限定</div>`;
    } else if (sm.label) {
      header = renderBadge(sm.label, sm.style || 'green');
    }

    const cards = items.map(item => item.type === 'redirect' ? renderRedirectCard(item) : renderCard(item, 'play-card')).join('');
    return `${header}<div class="card-grid">${cards}</div>`;
  }).join('\n');

  return mainHeader + subsHtml;
}

// ════════════════════════════════════════
// SEASONAL SECTION
// ════════════════════════════════════════

function renderSeasonal({ events, farms, activities }) {
  const filterRow = `
    <div class="filter-row">
      <button class="filter-chip on" onclick="window._filterSeasonal('all', this)">全部</button>
      <button class="filter-chip" onclick="window._filterSeasonal('events', this)">🎡 近期活动</button>
      <button class="filter-chip" onclick="window._filterSeasonal('farms', this)">🌾 推荐农场</button>
      <button class="filter-chip" onclick="window._filterSeasonal('activities', this)">🍓 按活动找</button>
    </div>`;

  return `
    ${filterRow}
    <div class="seasonal-block" data-block="events">${renderSeasonalEvents(events.events)}</div>
    <div class="seasonal-block" data-block="farms">${renderSeasonalFarms(farms)}</div>
    <div class="seasonal-block" data-block="activities">${renderSeasonalActivities(activities.activities)}</div>
    ${renderDisclaimer()}`;
}

function renderSeasonalEvents(events) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const isExpired = e => {
    if (!e.dateEnd) return false;
    const [m, d] = e.dateEnd.split('-').map(Number);
    return today > new Date(currentYear, m - 1, d);
  };
  const active = events.filter(e => !isExpired(e));
  const now = active.filter(e => e.status === 'now');
  const soon = active.filter(e => e.status === 'soon');

  let html = '<div class="list-header">🎡 近期活动</div>';
  if (now.length) {
    html += '<div style="font-size:13px;font-weight:700;color:var(--sage-dark);margin:16px 0 10px;">📍 正在进行</div>';
    html += '<div class="card-grid">' + now.map(e => renderEventCard(e)).join('') + '</div>';
  }
  if (soon.length) {
    html += '<div style="font-size:13px;font-weight:700;color:var(--warm);margin:20px 0 10px;">📅 即将到来</div>';
    html += '<div class="card-grid">' + soon.map(e => renderEventCard(e)).join('') + '</div>';
  }
  if (!now.length && !soon.length) {
    html += '<div style="padding:24px 0;color:var(--ink-muted);font-size:13px;text-align:center;">暂无近期活动，敬请期待 🌱</div>';
  }
  return html;
}

function renderEventCard(event) {
  const tags = (event.tags || []).map(renderTag).join('');
  const warn = event.warn ? `<div style="font-size:11px;color:#E65100;margin-top:8px;">⚠️ ${event.warn}</div>` : '';
  const map = event.mapQ ? `<a class="map-btn" href="https://maps.google.com/?q=${event.mapQ}" target="_blank">地图 →</a>` : '';
  const web = event.website ? `<a class="web-btn" href="${event.website}" target="_blank">官网 →</a>` : '';

  const itemId = makeItemId(event, 'event');
  const likeData = {
    _itemId: itemId, name: event.title, note: event.note || '',
    tags: event.tags || [], addr: event.addr || '', mapQ: event.mapQ || '',
    phone: '', website: event.website || '', checklist: event.checklist || null,
    dateLabel: event.dateLabel || '', highlight: event.highlight || '', subtitle: event.subtitle || ''
  };
  const likeBtn = renderLikeBtn(itemId, likeData);

  let checklistHtml = '';
  if (event.checklist) {
    const cardId = 'event-cl-' + event.id;
    checklistHtml = `
      <div onclick="window._toggleCard('${cardId}')"
           style="padding:8px 16px 10px;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid var(--border);">
        <span style="font-size:11px;color:var(--sage-dark);font-weight:600;letter-spacing:0.03em;">🧾 出发 Checklist</span>
        <span id="${cardId}-arrow" style="font-size:12px;color:var(--ink-muted);transition:transform 0.2s;display:inline-block;flex-shrink:0;">▼</span>
      </div>
      ${renderChecklist(event, cardId)}`;
  }

  return `
    <div class="card" style="padding:0;overflow:hidden;position:relative;">
      ${likeBtn}
      <div onclick="window._toggleEventCard('${event.id}')"
           style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;padding-right:44px;cursor:pointer;user-select:none;">
        <span class="card-name" style="margin:0;">${event.title}</span>
        <span id="event-arrow-${event.id}"
              style="font-size:12px;color:var(--ink-muted);transition:transform 0.2s;display:inline-block;margin-left:8px;flex-shrink:0;">▼</span>
      </div>
      <div id="event-body-${event.id}" style="display:none;padding:0 16px 14px;border-top:1px solid var(--border);">
        <div style="font-size:12px;color:var(--ink-muted);margin:8px 0 6px;">${event.subtitle || ''}</div>
        ${tags ? `<div class="card-tags">${tags}</div>` : ''}
        <div style="font-size:12px;color:var(--ink-light);margin:8px 0;">
          <div>📅 ${event.dateLabel}</div>
          ${event.timeLabel ? `<div>🕐 ${event.timeLabel}</div>` : ''}
          ${event.ageLabel ? `<div>👶 ${event.ageLabel}</div>` : ''}
          ${event.highlight ? `<div>✨ ${event.highlight}</div>` : ''}
        </div>
        ${event.note ? `<div class="card-note">${event.note}</div>` : ''}
        ${warn}
        ${(event.addr || map || web) ? `<div class="card-footer"><span class="card-addr">${event.addr || ''}</span>${map}${web}</div>` : ''}
      </div>
      ${checklistHtml}
    </div>`;
}

function renderSeasonalFarms(farms) {
  return `
    <div class="list-header">🌾 推荐农场 · 全年日历</div>
    ${renderFarmsFeatured(farms.featured)}
    <div class="list-header" style="margin-top:32px;">其他推荐农场</div>
    ${renderFarmsOthers(farms.others)}`;
}

function renderFarmsFeatured(featured) {
  const tags = (featured.tags || []).map(renderTag).join('');
  const locations = featured.locations.map(loc =>
    `<a href="https://maps.google.com/?q=${loc.mapQ}" target="_blank" style="color:var(--sage-dark);text-decoration:none;font-size:12px;display:block;margin-top:4px;">📍 ${loc.label}</a>`
  ).join('');

  const seasons = ['spring', 'summer', 'fall'];
  const seasonsHtml = seasons.map(s => {
    const season = featured.seasons[s];
    if (!season) return '';
    const items = season.items.map(item => {
      const locs = item.locations ? ` (${item.locations.join(', ')})` : '';
      const statusIcon = item.status === 'now' ? '📍' : item.status === 'soon' ? '📅' : '🗓️';
      return `<div style="font-size:12px;margin:6px 0;">
        ${statusIcon} <strong>${item.name}</strong>${locs} · ${item.dateLabel}
        ${item.note ? `<div style="color:var(--ink-muted);margin-left:16px;font-size:11px;">${item.note}</div>` : ''}
      </div>`;
    }).join('');
    return `
      <div style="margin-top:14px;">
        <div style="font-size:13px;font-weight:700;color:var(--sage-dark);margin-bottom:8px;">${season.label}</div>
        ${items}
      </div>`;
  }).join('');

  const itemId = makeItemId(featured, 'farm_featured');
  const cardId = 'farm-featured';
  const likeData = { _itemId: itemId, name: featured.name, note: featured.desc || '', tags: featured.tags || [], addr: '', mapQ: featured.locations?.[0]?.mapQ || '', phone: '', website: '', checklist: featured.checklist || null };
  const likeBtn = renderLikeBtn(itemId, likeData);

  let checklistHtml = '';
  if (featured.checklist) {
    const clId = cardId + '-cl';
    checklistHtml = `
      <div onclick="window._toggleCard('${clId}')"
           style="padding:8px 16px 10px;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid var(--border);">
        <span style="font-size:11px;color:var(--sage-dark);font-weight:600;letter-spacing:0.03em;">🧾 出发 Checklist</span>
        <span id="${clId}-arrow" style="font-size:12px;color:var(--ink-muted);transition:transform 0.2s;display:inline-block;flex-shrink:0;">▼</span>
      </div>
      ${renderChecklist(featured, clId)}`;
  }

  return `
    <div class="card" style="background:linear-gradient(135deg, #F0F7F4 0%, #FDFCFA 100%);border:2px solid var(--sage);position:relative;padding:0;overflow:hidden;">
      ${likeBtn}
      <div onclick="window._toggleFarmFeatured()" style="padding:14px 16px 12px;padding-right:44px;cursor:pointer;user-select:none;">
        <div class="card-name" style="margin:0;">${featured.name}</div>
        <div style="font-size:13px;color:var(--sage-dark);margin:4px 0 6px;font-weight:600;">${featured.tagline}</div>
        ${tags ? `<div class="card-tags">${tags}</div>` : ''}
        <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
          <span style="font-size:11px;color:var(--sage-dark);font-weight:600;">查看季节活动 & 详情</span>
          <span id="farm-featured-arrow" style="font-size:11px;color:var(--ink-muted);transition:transform 0.25s;display:inline-block;">▼</span>
        </div>
      </div>
      <div id="farm-featured-body" style="max-height:0;overflow:hidden;transition:max-height 0.4s ease;">
        <div style="padding:0 16px 14px;border-top:1px solid var(--border);">
          <div class="card-note" style="margin-top:10px;">${featured.desc}</div>
          ${locations}
          ${seasonsHtml}
        </div>
      </div>
      ${checklistHtml}
    </div>`;
}

function renderFarmsOthers(others) {
  return '<div class="card-grid">' + others.map((farm, i) => {
    const tags = (farm.tags || []).map(renderTag).join('');
    const seasons = farm.seasons ? `<div style="font-size:11px;color:var(--ink-muted);margin-top:6px;">${farm.seasons.join(' · ')}</div>` : '';
    const map = farm.mapQ ? `<a class="map-btn" href="https://maps.google.com/?q=${farm.mapQ}" target="_blank">地图 →</a>` : '';
    const itemId = makeItemId(farm, 'farm');
    const cardId = 'farm-other-' + i;
    const likeData = { _itemId: itemId, name: farm.name, note: farm.note || '', tags: farm.tags || [], addr: farm.addr || '', mapQ: farm.mapQ || '', phone: '', website: '', checklist: farm.checklist || null };
    const likeBtn = renderLikeBtn(itemId, likeData);

    let checklistHtml = '';
    if (farm.checklist) {
      const clId = cardId + '-cl';
      checklistHtml = `
        <div onclick="window._toggleCard('${clId}')"
             style="padding:8px 16px 10px;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid var(--border);">
          <span style="font-size:11px;color:var(--sage-dark);font-weight:600;letter-spacing:0.03em;">🧾 出发 Checklist</span>
          <span id="${clId}-arrow" style="font-size:12px;color:var(--ink-muted);transition:transform 0.2s;display:inline-block;flex-shrink:0;">▼</span>
        </div>
        ${renderChecklist(farm, clId)}`;
    }

    return `
      <div class="card" style="position:relative;padding:0;overflow:hidden;">
        ${likeBtn}
        <div style="padding:14px 16px 12px;padding-right:44px;">
          <div class="card-name">${farm.name}</div>
          ${tags ? `<div class="card-tags">${tags}</div>` : ''}
          ${farm.note ? `<div class="card-note">${farm.note}</div>` : ''}
          ${seasons}
          ${(farm.addr || map) ? `<div class="card-footer"><span class="card-addr">${farm.addr || ''}</span>${map}</div>` : ''}
        </div>
        ${checklistHtml}
      </div>`;
  }).join('') + '</div>';
}

function renderSeasonalActivities(activities) {
  return `
    <div class="list-header">🍓 按活动类型查找</div>
    <div class="card-grid">
      ${activities.map(act => renderActivityCard(act)).join('')}
    </div>`;
}

function renderActivityCard(activity) {
  const statusBadge = activity.status === 'now'
    ? '<span style="background:#E8F5E9;color:#2E7D32;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;margin-left:6px;">进行中</span>'
    : activity.status === 'soon'
    ? '<span style="background:#FFF3E0;color:#E65100;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;margin-left:6px;">即将开始</span>'
    : '';

  const picks = activity.picks.map(p => {
    const tags = (p.tags || []).map(renderTag).join('');
    const map = p.mapQ ? `<a href="https://maps.google.com/?q=${p.mapQ}" target="_blank" style="color:var(--sage-dark);font-size:11px;margin-left:8px;">地图 →</a>` : '';
    return `
      <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:12px;margin-top:10px;">
        <div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:4px;">${p.label} ${p.name}</div>
        ${tags ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin:6px 0;">${tags}</div>` : ''}
        ${p.note ? `<div style="font-size:11px;color:var(--ink-light);line-height:1.5;margin-top:6px;">${p.note}</div>` : ''}
        ${map}
      </div>`;
  }).join('');

  const itemId = makeItemId(activity, 'activity');
  const likeData = {
    _itemId: itemId, name: activity.icon + ' ' + activity.title,
    note: activity.desc || '', tags: [], addr: '',
    mapQ: activity.picks?.[0]?.mapQ || '', phone: '', website: '',
    checklist: activity.checklist || null, dateLabel: activity.dateLabel || ''
  };
  const likeBtn = renderLikeBtn(itemId, likeData);

  const clId = 'activity-cl-' + activity.id;
  const checklistHtml = activity.checklist ? `
    <div onclick="window._toggleCard('${clId}')"
         style="padding:8px 16px 10px;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid var(--border);">
      <span style="font-size:11px;color:var(--sage-dark);font-weight:600;letter-spacing:0.03em;">🧾 出发 Checklist</span>
      <span id="${clId}-arrow" style="font-size:12px;color:var(--ink-muted);transition:transform 0.2s;display:inline-block;flex-shrink:0;">▼</span>
    </div>
    ${renderChecklist(activity, clId)}` : '';

  return `
    <div class="card" style="padding:0;overflow:hidden;position:relative;">
      ${likeBtn}
      <div onclick="window._toggleActivityCard('${activity.id}')"
           style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;padding-right:44px;cursor:pointer;user-select:none;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:20px;">${activity.icon}</span>
          <span class="card-name" style="margin:0;">${activity.title}</span>
          ${statusBadge}
        </div>
        <span id="activity-arrow-${activity.id}"
              style="font-size:12px;color:var(--ink-muted);transition:transform 0.2s;display:inline-block;margin-left:8px;flex-shrink:0;">▼</span>
      </div>
      <div id="activity-body-${activity.id}" style="display:none;padding:0 16px 14px;border-top:1px solid var(--border);">
        <div style="font-size:11px;color:var(--ink-muted);padding:8px 0 4px;">${activity.dateLabel}</div>
        <div class="card-note" style="margin-top:0;">${activity.desc}</div>
        ${picks}
      </div>
      ${checklistHtml}
    </div>`;
}

// ════════════════════════════════════════
// FOOD SECTION
// ════════════════════════════════════════

function renderFood(data) {
  const filters = data.filters || [];
  const filterRow = filters.length > 0 ? renderFilterRow(filters, 'filter_food') : '';
  const top3 = renderTop3(data.top3, '群友强推');
  const cards = (data.restaurants || []).map(item => {
    const filterClasses = (item.filter_tags || []).map(tag => `food-${tag}`).join(' ');
    return renderCard(item, `food-card ${filterClasses}`);
  }).join('');
  return `
    ${filterRow}
    ${top3}
    <div class="list-header">🍜 餐厅推荐</div>
    <div class="card-grid">${cards}</div>
    ${renderDisclaimer()}`;
}

// ════════════════════════════════════════
// CATEGORY SECTIONS (doctor / daycare / house)
// ════════════════════════════════════════

function renderCategorySection(data, prefix) {
  const filtersRaw = data.filters || [];
  const filterLabelMap = {};
  (data.categories || []).forEach(c => {
    if (c.id) filterLabelMap[c.id] = c.label;
  });
  const filters = filtersRaw.map(f => {
    if (typeof f === 'string') {
      return { id: f, label: f === 'all' ? '全部' : (filterLabelMap[f] || f) };
    }
    return f;
  });
  const filterRow = filters.length > 0 ? renderFilterRow(filters, `filter_${prefix}`) : '';
  const top3 = renderTop3(data.top3);
  const categories = (data.categories || []).map(cat => renderCategory(cat, prefix)).join('\n');
  const avoid = renderAvoid(data.avoid);
  return `${filterRow}${top3}${categories}${avoid}${renderDisclaimer()}`;
}

function renderCategory(cat, prefix) {
  const catId = cat.id || '';
  const cards = (cat.cards || []).map(item => renderCard(item, `${prefix}-card ${prefix}-${catId}`)).join('');
  return `
    <div class="category-block" data-cat="${catId}">
      <div class="list-header">${cat.label}</div>
      <div class="card-grid">${cards}</div>
    </div>`;
}

// ════════════════════════════════════════
// CLASSES SECTION（游泳 + 兴趣班）
// ════════════════════════════════════════

function renderClasses({ swim, classes }) {
  const filterRow = `
    <div class="filter-row">
      <button class="filter-chip on" onclick="window._filterClasses('all', this)">全部</button>
      <button class="filter-chip" onclick="window._filterClasses('swim', this)">🏊 游泳</button>
      <button class="filter-chip" onclick="window._filterClasses('classes', this)">📚 兴趣班</button>
    </div>`;
  return `
    ${filterRow}
    <div class="classes-block" data-block="swim">${renderSwimBlock(swim)}</div>
    <div class="classes-block" data-block="classes">${renderClassesBlock(classes)}</div>
    ${renderDisclaimer()}`;
}

function renderSwimBlock(data) {
  const top3 = renderTop3(data.top3, '性价比推荐');
  const cards = (data.cards || []).map(item => renderCard(item, 'swim-card')).join('');
  const avoid = renderAvoid(data.avoid);
  return `
    <div class="list-header">🏊 游泳课推荐</div>
    ${top3}
    <div class="card-grid">${cards}</div>
    ${avoid}`;
}

function renderClassesBlock(data) {
  const TYPE_LABEL = { energy: '🏃 运动放电', interest: '🎨 兴趣启蒙', learning: '📖 学习类' };
  const TYPE_STYLE = { energy: 'green', interest: 'blue', learning: 'purple' };
  const TYPE_ICON  = { energy: '🏃', interest: '🎨', learning: '📖' };

  const html = (data.ageGroups || []).map((group) => {
    const panelId = 'age-panel-' + group.age.replace(/[^\w]/g, '_');
    const byType = {};
    (group.items || []).forEach(item => {
      const t = item.type || 'other';
      if (!byType[t]) byType[t] = [];
      byType[t].push(item);
    });
    const typeSummary = Object.keys(byType).map(type =>
      `<span style="font-size:10px;background:rgba(255,255,255,0.25);padding:2px 7px;border-radius:10px;margin-left:4px;">${TYPE_ICON[type] || ''}${byType[type].length}项</span>`
    ).join('');
    const typeBlocks = Object.entries(byType).map(([type, items]) => {
      const cards = items.map(item => {
        const itemId = makeItemId(item, 'class_' + group.age);
        const likeData = {
          _itemId: itemId, name: item.name,
          note: `${item.ageRange ? item.ageRange + ' | ' : ''}${item.notes || ''}`,
          tags: (item.tags || []).map(t => ({ type: 'gray', text: t })),
          addr: item.locationHint || '', mapQ: '', phone: '', website: ''
        };
        const likeBtn = renderLikeBtn(itemId, likeData);
        const notesHtml = item.notes ? `<div class="card-note">${item.notes}</div>` : '';
        const ageHtml = item.ageRange ? `<span class="tag tag-warm">${item.ageRange}</span>` : '';
        const tagsHtml = (item.tags || []).map(t => `<span class="tag tag-gray">${t}</span>`).join('');
        const locationHtml = item.locationHint
          ? `<div class="card-footer"><span class="card-addr">📍 ${item.locationHint}</span></div>` : '';
        return `
          <div class="card" style="position:relative;">
            ${likeBtn}
            <div class="card-name" style="padding-right:28px;">${item.name}</div>
            <div class="card-tags">${ageHtml}${tagsHtml}</div>
            ${notesHtml}
            ${locationHtml}
          </div>`;
      }).join('');
      return `
        ${renderBadge(TYPE_LABEL[type] || type, TYPE_STYLE[type] || 'green')}
        <div class="card-grid">${cards}</div>`;
    }).join('');

    return `
      <div style="margin-bottom:10px;border-radius:14px;overflow:hidden;border:1px solid var(--border);">
        <div onclick="window._toggleAgePanel('${panelId}')"
             style="display:flex;align-items:center;justify-content:space-between;
                    padding:14px 16px;cursor:pointer;user-select:none;
                    background:linear-gradient(135deg,var(--sage-light,#f0f7f4),#fdfcfa);">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-size:15px;font-weight:700;color:var(--ink);">👶 ${group.age} 岁</span>
            ${typeSummary}
          </div>
          <span id="${panelId}-arrow"
                style="font-size:12px;color:var(--ink-muted);transition:transform 0.25s;flex-shrink:0;margin-left:8px;">▼</span>
        </div>
        <div id="${panelId}"
             style="max-height:0;overflow:hidden;transition:max-height 0.35s ease;">
          <div style="padding:14px 16px 16px;background:var(--white,#fff);">
            ${typeBlocks}
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="list-header">📚 兴趣班推荐（按年龄）</div>
    ${html}`;
}

// ════════════════════════════════════════
// STUDY / LIFE / FITNESS PAGES
// ════════════════════════════════════════

function renderStudy({ classes, daycare, swim }) {
  const filterRow = `
    <div class="filter-row">
      <button class="filter-chip on" onclick="window._filterPanel('.study-block','classes', this)">🎓 兴趣班</button>
      <button class="filter-chip" onclick="window._filterPanel('.study-block','daycare', this)">🏫 Daycare</button>
      <button class="filter-chip" onclick="window._filterPanel('.study-block','swim', this)">🏊 游泳</button>
      <button class="filter-chip" onclick="window._filterPanel('.study-block','all', this)">全部</button>
    </div>`;
  return `
    ${filterRow}
    <div class="study-block" data-block="classes">${renderClassesBlock(classes)}</div>
    <div class="study-block" data-block="daycare" style="display:none;">${withoutDisclaimer(renderCategorySection(daycare, 'daycare'))}</div>
    <div class="study-block" data-block="swim" style="display:none;">${renderSwimBlock(swim)}</div>
    ${renderDisclaimer()}`;
}

function renderLife({ doctor, food, house }) {
  const filterRow = `
    <div class="filter-row">
      <button class="filter-chip on" onclick="window._filterPanel('.life-block','doctor', this)">👨‍⚕️ 医生</button>
      <button class="filter-chip" onclick="window._filterPanel('.life-block','food', this)">🍜 餐厅</button>
      <button class="filter-chip" onclick="window._filterPanel('.life-block','house', this)">🔧 维修</button>
      <button class="filter-chip" onclick="window._filterPanel('.life-block','all', this)">全部</button>
    </div>`;
  return `
    <div class="low-frequency-note">生活里的大小事，这里都有准备。遇到需要的，顺手收藏起来。</div>
    ${filterRow}
    <div class="life-block" data-block="doctor">${withoutDisclaimer(renderCategorySection(doctor, 'doc'))}</div>
    <div class="life-block" data-block="food" style="display:none;">${withoutDisclaimer(renderFood(food))}</div>
    <div class="life-block" data-block="house" style="display:none;">${withoutDisclaimer(renderCategorySection(house, 'house'))}</div>
    ${renderDisclaimer()}`;
}

function renderFitness(data) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = getTodayName();
  const labels = {
    Monday: '周一',
    Tuesday: '周二',
    Wednesday: '周三',
    Thursday: '周四',
    Friday: '周五',
    Saturday: '周六',
    Sunday: '周日',
  };
  const filters = days.map(day =>
    `<button class="filter-chip${day === today ? ' on' : ''}" onclick="window._filterFitnessDay('${day}', this)">${labels[day]}</button>`
  ).join('');
  const sites = [
    { key: 'edison', data: data.edison },
    { key: 'piscataway', data: data.piscataway },
    { key: 'metuchen', data: data.metuchen },
  ].filter(s => s.data);

  const siteFilters = [
    '<button class="filter-chip on" onclick="window._filterFitnessSite(\'all\', this)">全部地点</button>',
    ...sites.map(site => `<button class="filter-chip" onclick="window._filterFitnessSite('${site.key}', this)">${site.data.meta.short || site.data.meta.name}</button>`),
  ].join('');

  const dayBlocks = days.map(day => {
    const rows = sites.flatMap(site => (site.data.schedule?.[day] || []).map(item => ({
      ...item,
      siteKey: site.key,
      site: site.data.meta.short || site.data.meta.name,
      address: site.data.meta.address || '',
    }))).sort((a, b) => timeScore(a.time) - timeScore(b.time));
    const groups = groupFitnessByStart(rows);
    return `
      <div class="fitness-day" data-block="${day}" style="${day === today ? '' : 'display:none;'}">
        <div class="list-header">${labels[day]}健身课</div>
        <div class="timetable">
          ${groups.map(renderFitnessGroup).join('') || '<div class="empty-mini">这一天暂无课表。</div>'}
        </div>
      </div>`;
  }).join('');
  const siteNotes = sites.map(site => `
    <div class="fitness-site-note">
      <strong>${site.data.meta.name}</strong>
      <span>${site.data.meta.address || ''}</span>
      ${(site.data.meta.notes || []).slice(0, 2).map(n => `<small>${n}</small>`).join('')}
    </div>`).join('');

  return `
    <div class="fitness-today-callout">
      <div class="decision-kicker">今天是 ${labels[today]}</div>
      <div class="decision-title">按时间表快速选一节课</div>
    </div>
    <div class="filter-label">地点</div>
    <div class="filter-row">${siteFilters}</div>
    <div class="filter-label">日期</div>
    <div class="filter-row">${filters}</div>
    ${dayBlocks}
    <div class="list-header">场馆提示</div>
    <div class="fitness-notes">${siteNotes}</div>
    ${renderDisclaimer()}`;
}

function groupFitnessByStart(rows) {
  const groups = new Map();
  rows.forEach(item => {
    const label = startTimeLabel(item.time);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(item);
  });
  return [...groups.entries()].map(([time, items]) => ({ time, items }));
}

function renderFitnessGroup(group) {
  return `
    <div class="timetable-group">
      <div class="time-cell">${group.time}</div>
      <div class="class-cell fitness-session-list">
        ${group.items.map(renderFitnessSession).join('')}
      </div>
    </div>`;
}

function renderFitnessSession(item) {
  const tags = [
    item.paid ? '<span class="tag tag-paid">付费</span>' : '',
    item.numbered ? '<span class="tag tag-warm">取号</span>' : '',
    item.water ? '<span class="tag tag-blue">水中</span>' : '',
    item.senior_friendly ? '<span class="tag tag-green">初学友好</span>' : '',
    item.age ? `<span class="tag tag-gray">${item.age}</span>` : '',
  ].filter(Boolean).join('');
  return `
    <div class="fitness-session" data-site="${item.siteKey}">
      <div class="class-name">${item.class}</div>
      <div class="class-meta">${item.site}${item.room ? ` · ${item.room}` : ''}${item.instructor ? ` · ${item.instructor}` : ''}</div>
      ${tags ? `<div class="card-tags">${tags}</div>` : ''}
    </div>`;
}
