/* ══════════════════════════════════════════
   weather.js · 天气 + 穿衣建议
   依赖：config.js
   ══════════════════════════════════════════ */

import { CONFIG } from './config.js?v=20260421c';

const weatherState = { temp: null, code: null };

export async function loadWeather() {
  try {
    const { lat, lon, unit, timezone, fallbackText } = CONFIG.weather;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,precipitation&temperature_unit=${unit}&wind_speed_unit=mph&timezone=${encodeURIComponent(timezone)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    weatherState.temp = temp;
    weatherState.code = code;
    const el = document.getElementById('weather-inline');
    el.textContent = weatherEmoji(code) + ' ' + temp + '°C · ' + weatherDesc(code);
    el.title = '点击查看今日穿衣建议 👕';
    const hint = document.getElementById('weather-outfit-hint');
    if (hint) hint.style.display = 'inline';
  } catch (e) {
    document.getElementById('weather-inline').textContent = CONFIG.weather.fallbackText;
  }
}

export function toggleOutfitPanel() {
  if (weatherState.temp === null) return;
  const panel = document.getElementById('outfit-panel');
  const inner = document.getElementById('outfit-panel-inner');
  if (!panel || !inner) return;
  const isOpen = panel.style.maxHeight !== '0px' && panel.style.maxHeight !== '';
  if (isOpen) {
    panel.style.maxHeight = '0';
  } else {
    inner.innerHTML = buildOutfitAdvice(weatherState.temp, weatherState.code);
    panel.style.maxHeight = '600px';
  }
}

function buildOutfitAdvice(temp, code) {
  const isRainy = code >= 50 && code <= 99;
  const isSnowy = code >= 70 && code <= 79;
  const isFoggy = code >= 40 && code <= 49;

  let coat = '';
  if (temp >= 27)      coat = '短袖即可，超热天气';
  else if (temp >= 21) coat = '短袖 / 薄长袖，很舒适';
  else if (temp >= 16) coat = '薄外套或卫衣，早晚偏凉';
  else if (temp >= 10) coat = '外套必备，注意保暖';
  else if (temp >= 4)  coat = '厚外套 + 内搭保暖层';
  else if (temp >= 0)  coat = '冬装全套：厚外套 + 围巾 + 帽子';
  else                 coat = '严寒，羽绒服 + 手套 + 帽子全上';

  let baby = '';
  if (temp >= 24)      baby = '透气棉短袖 + 防晒帽';
  else if (temp >= 16) baby = '薄长袖 + 薄外套，多备一件';
  else if (temp >= 7)  baby = '比大人多穿一层，小手小脚注意保暖';
  else                 baby = '厚实连体服或叠穿，出门必戴帽子';

  let shoes = '';
  if (isSnowy)         shoes = '防滑厚底靴，避免皮鞋';
  else if (isRainy)    shoes = '防水鞋 / 雨靴，备换袜子';
  else if (temp >= 21) shoes = '运动鞋 / 凉鞋均可';
  else                 shoes = '包脚运动鞋，避免开口鞋';

  let sunscreen = '';
  if (!isRainy && !isSnowy && temp >= 13) {
    sunscreen = code <= 3
      ? '晴天紫外线强，防晒霜必涂 + 帽子'
      : '建议涂防晒，云层不挡UV';
  }

  let rain = '';
  if (isRainy) rain = code >= 80 ? '大雨/雷雨，雨伞 + 雨衣 + 防水包' : '带伞或雨衣，路面湿滑注意安全';
  else if (isFoggy) rain = '有雾，建议随手备一把伞';

  const extras = [];
  if (temp >= 24 && !isRainy) extras.push('💧 多备饮用水，天热易脱水');
  if (isSnowy) extras.push('🧤 手套 + 防冻唇膏');
  if (temp <= 4) extras.push('🚗 出发前提前开车暖车');

  const row = (icon, label, text) => !text ? '' : `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.15);">
      <span style="font-size:16px;flex-shrink:0;">${icon}</span>
      <div>
        <div style="font-size:11px;opacity:0.65;font-weight:600;letter-spacing:0.04em;margin-bottom:1px;">${label}</div>
        <div style="font-size:13px;">${text}</div>
      </div>
    </div>`;

  return `
    <div style="font-weight:700;margin-bottom:8px;font-size:12px;letter-spacing:0.07em;opacity:0.75;text-transform:uppercase;">
      今日穿衣建议 · ${temp}°C
    </div>
    ${row('🧥', '外套', coat)}
    ${row('👶', '宝宝', baby)}
    ${row('👟', '鞋子', shoes)}
    ${sunscreen ? row('🧴', '防晒', sunscreen) : ''}
    ${rain ? row('☔', '雨具', rain) : ''}
    ${extras.map(e => `<div style="padding:5px 0;font-size:12px;opacity:0.85;">${e}</div>`).join('')}
    <div style="margin-top:8px;font-size:11px;opacity:0.5;text-align:right;">点击天气文字可收起 ↑</div>
  `;
}

function weatherEmoji(code) {
  if (code === 0)  return '☀️';
  if (code <= 2)   return '⛅';
  if (code <= 3)   return '☁️';
  if (code <= 49)  return '🌫️';
  if (code <= 59)  return '🌦️';
  if (code <= 69)  return '🌧️';
  if (code <= 79)  return '❄️';
  if (code <= 84)  return '🌨️';
  if (code <= 99)  return '⛈️';
  return '🌤️';
}

function weatherDesc(code) {
  if (code === 0)  return '晴天';
  if (code <= 2)   return '少云';
  if (code <= 3)   return '多云';
  if (code <= 49)  return '有雾';
  if (code <= 59)  return '小雨';
  if (code <= 69)  return '下雨';
  if (code <= 79)  return '下雪';
  if (code <= 84)  return '雪天';
  if (code <= 99)  return '雷雨';
  return '天气未知';
}
