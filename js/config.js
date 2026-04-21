// ══════════════════════════════════════════
// Edison 华人家庭生活指南 · 全局配置 (重构版)
// ══════════════════════════════════════════

export const CONFIG = {
  site: {
    title: "Edison 华人家庭生活指南",
    shortTitle: "Edison 生活指南",
    logoIcon: "🏡",
    location: "Edison, NJ",
    description: "Edison 华人家庭社区整理 · 持续更新",
    disclaimer: "⚠️ 免责声明：本网站内容整理自社区分享，仅供参考，不构成专业建议。具体选择请结合个人实际情况自行判断，本站不对信息准确性或完整性承担任何责任。",
  },

  analytics: {
    plausible: {
      enabled: true,
      domain: "edisonmom.com",
    },
    gtag: {
      enabled: true,
      id: "G-FSHFK9SQL9",
    },
  },

  weather: {
    lat: 40.5187,
    lon: -74.4121,
    apiUrl: "https://api.open-meteo.com/v1/forecast",
    unit: "celsius",
    timezone: "America/New_York",
    fallbackText: "📍 Edison NJ",
  },

  fonts: {
    googleFonts: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap",
  },

  tabs: [
    { id: "home",     icon: "🧭", label: "今日安排", href: "index.html", default: true },
    { id: "play",     icon: "📍", label: "遛娃地点", href: "play.html" },
    { id: "events",   icon: "🌸", label: "季节活动", href: "events.html" },
    { id: "study",    icon: "🎓", label: "学习资源", href: "study.html" },
    { id: "life",     icon: "🧰", label: "生活刚需", href: "life.html" },
    { id: "fitness",  icon: "🧘", label: "健身课表", href: "fitness.html" },
  ],

  scenes: [
    { icon: "💦", label: "天热玩水",    hint: "免费 splash pad",    filter: "water"  },
    { icon: "🏖️", label: "去海滩",      hint: "沙滩、Boardwalk",    filter: "beach"  },
    { icon: "🎢", label: "主题乐园",    hint: "按年龄选",           filter: "theme"  },
    { icon: "🌧️", label: "下雨天/室内", hint: "放电·轻活动·全年龄", filter: "indoor" },
    { icon: "🥾", label: "去徒步",      hint: "山路野趣·亲近自然",  filter: "hiking" },
    { icon: "🌳", label: "公园遛娃",    hint: "免费·全年龄·随时去", filter: "general"},
  ],
};
