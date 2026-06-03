// ============================================================
// i18n — 中英双语翻译数据与切换逻辑
// ============================================================

const translations = {
  zh: {
    'nav.logo': 'Wense Dong',
    'nav.home': '首页',
    'nav.gallery': '作品',
    'nav.about': '关于',
    'nav.contact': '联系',

    'hero.tagline': '业余摄影爱好者，捕捉瞬间，分享我的所见所思',
    'hero.subtitle': '风光 · 人像 · 街头摄影',

    'gallery.title': '作品集',
    'gallery.desc': '每一张照片，都是一个故事',
    'gallery.landscape': '风光',
    'gallery.portrait': '人像',
    'gallery.street': '街拍',

    'about.title': '关于我',
    'about.name': '你好，我是 Wense',
    'about.intro1': '一名业余摄影爱好者，喜欢在旅行和日常生活中捕捉打动我的瞬间。摄影对我来说，是记录世界、表达观点的一种方式。',
    'about.intro2': '这个网站是我分享摄影作品和个人观察的地方。每一张照片背后，都有一个值得讲述的故事。',
    'about.gear': '常用器材',
    'about.gear3': '真我 GT7 Pro（手机摄影）',

    'contact.title': '联系方式',
    'contact.desc': '期待与你的交流与合作',

    'footer.copyright': '© 2024 Wense Dong. All rights reserved.',

    'lightbox.close': '关闭',
    'lightbox.prev': '上一张',
    'lightbox.next': '下一张',
  },

  en: {
    'nav.logo': 'Wense Dong',
    'nav.home': 'Home',
    'nav.gallery': 'Gallery',
    'nav.about': 'About',
    'nav.contact': 'Contact',

    'hero.tagline': 'Amateur photography enthusiast. Capturing moments and sharing my insights and observations.',
    'hero.subtitle': 'Landscape · Portrait · Street',

    'gallery.title': 'Gallery',
    'gallery.desc': 'Every photo tells a story',
    'gallery.landscape': 'Landscape',
    'gallery.portrait': 'Portrait',
    'gallery.street': 'Street',

    'about.title': 'About Me',
    'about.name': 'Hi, I\'m Wense',
    'about.intro1': 'An amateur photography enthusiast who loves capturing moments during travels and daily life. For me, photography is a way to record the world and express my perspective.',
    'about.intro2': 'This website is where I share my photography work and personal observations. Behind every photo, there is a story worth telling.',
    'about.gear': 'My Gear',
    'about.gear3': 'Realme GT7 Pro (Phone Photography)',

    'contact.title': 'Contact',
    'contact.desc': 'Looking forward to connecting with you',

    'footer.copyright': '© 2024 Wense Dong. All rights reserved.',

    'lightbox.close': 'Close',
    'lightbox.prev': 'Previous',
    'lightbox.next': 'Next',
  },
};

/** Current language */
let currentLang = 'zh';

/**
 * Get translated text for a given key.
 */
function t(key) {
  return translations[currentLang]?.[key] ?? translations['zh'][key] ?? key;
}

/**
 * Update all [data-i18n] elements on the page to the current language.
 */
function updateI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  // Also update gallery images (titles/descriptions)
  if (typeof renderGallery === 'function') {
    renderGallery();
  }

  // Update document lang attribute
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
}

/**
 * Toggle language between zh and en.
 */
function toggleLanguage() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('lang', currentLang);
  updateI18n();
  updateLangButton();
}

/**
 * Update the language toggle button text.
 */
function updateLangButton() {
  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.textContent = currentLang === 'zh' ? 'EN' : '中文';
  }
}

/**
 * Detect or restore language preference.
 */
function initI18n() {
  // 1. Check localStorage first
  const saved = localStorage.getItem('lang');
  if (saved === 'zh' || saved === 'en') {
    currentLang = saved;
  } else {
    // 2. Fall back to browser language
    const browserLang = navigator.language || navigator.userLanguage || '';
    currentLang = browserLang.startsWith('zh') ? 'zh' : 'en';
  }
  updateI18n();
  updateLangButton();
}
