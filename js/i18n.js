// ============================================================
// i18n — 中英双语翻译数据与切换逻辑
// ============================================================

const translations = {
  zh: {
    'nav.logo': 'My Photography',
    'nav.home': '首页',
    'nav.gallery': '作品',
    'nav.about': '关于',
    'nav.contact': '联系',

    'hero.tagline': '用镜头捕捉光影瞬间',
    'hero.subtitle': '风光 · 人像 · 街头摄影',

    'gallery.title': '作品集',
    'gallery.desc': '每一张照片，都是一个故事',
    'gallery.landscape': '风光',
    'gallery.portrait': '人像',
    'gallery.street': '街拍',

    'about.title': '关于我',
    'about.name': '你好，我是 Alex',
    'about.intro1': '一名热爱摄影的自由摄影师，专注于风光、人像和街头摄影。对我来说，摄影不仅仅是按下快门，更是一种观察世界的方式。',
    'about.intro2': '从 2018 年开始拿起相机，我走过了许多城市和山野，用镜头记录下每一个打动我的瞬间。我相信，最好的照片不是最完美的构图，而是最能传递情感的那一张。',
    'about.gear': '常用器材',

    'contact.title': '联系方式',
    'contact.desc': '期待与你的交流与合作',

    'footer.copyright': '© 2024 Alex Chen. All rights reserved.',

    'lightbox.close': '关闭',
    'lightbox.prev': '上一张',
    'lightbox.next': '下一张',
  },

  en: {
    'nav.logo': 'My Photography',
    'nav.home': 'Home',
    'nav.gallery': 'Gallery',
    'nav.about': 'About',
    'nav.contact': 'Contact',

    'hero.tagline': 'Capturing Light & Moments',
    'hero.subtitle': 'Landscape · Portrait · Street',

    'gallery.title': 'Gallery',
    'gallery.desc': 'Every photo tells a story',
    'gallery.landscape': 'Landscape',
    'gallery.portrait': 'Portrait',
    'gallery.street': 'Street',

    'about.title': 'About Me',
    'about.name': 'Hi, I\'m Alex',
    'about.intro1': 'A passionate freelance photographer focusing on landscape, portrait, and street photography. For me, photography is not just pressing the shutter — it\'s a way of seeing the world.',
    'about.intro2': 'I picked up my first camera in 2018 and have since traveled through many cities and landscapes, capturing every moment that moves me. I believe the best photo is not the one with perfect composition, but the one that conveys the deepest emotion.',
    'about.gear': 'My Gear',

    'contact.title': 'Contact',
    'contact.desc': 'Looking forward to connecting with you',

    'footer.copyright': '© 2024 Alex Chen. All rights reserved.',

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
