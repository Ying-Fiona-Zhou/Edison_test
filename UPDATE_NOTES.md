# 🎉 app.js 拆分

state.js 9 全局状态 state 对象
api.js 91 fetch JSON + 缓存 + 预加载
favorites.js 140 localStorage 收藏增删、列表选择弹窗filters.j 78 所有 filter 函数（play/food/seasonal 等）weather.js 135 天气加载 + 穿衣建议面板events.js97所有 toggle/click 事件处理
render.js 840 所有 HTML 渲染（cards/sections/tabs）
app.js 116 入口：初始化、tab 切换、DOMContentLoaded


index.html 的 <script> 加载顺序改成这样：
html<script src="js/config.js"></script>
<script src="js/state.js"></script>
<script src="js/favorites.js"></script>
<script src="js/filters.js"></script>
<script src="js/weather.js"></script>
<script src="js/api.js"></script>
<script src="js/events.js"></script>
<script src="js/render.js"></script>
<script src="js/app.js"></script>
顺序重要：render.js 依赖 favorites.js 里的 renderLikeBtn，app.js 是最后加载的入口。

index.html — 只保留一行 <script type="module" src="js/app.js"></script>，天气按钮改成 window._toggleOutfitPanel()
每个 JS 文件加了 import / export
所有 HTML onclick 里的函数名都加了 window._ 前缀（比如 window._showTab、window._filterPlay）
app.js 顶部统一把所有函数绑到 window._xxx，这是唯一需要维护的地方