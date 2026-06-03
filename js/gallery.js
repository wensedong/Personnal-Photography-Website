// ============================================================
// gallery.js — 画廊数据、渲染与 Lightbox 灯箱
// ============================================================

// ---------- Gallery Data ----------
// Replace these placeholder URLs with your own images.
// thumbnail: small/fast-loading version shown in the grid
// full: high-resolution version shown in the lightbox

const galleryImages = {
  landscape: [
    { thumb: 'https://picsum.photos/seed/ls1/600/400', full: 'https://picsum.photos/seed/ls1/1920/1280', titleZh: '山间晨雾', titleEn: 'Morning Mist in Mountains' },
    { thumb: 'https://picsum.photos/seed/ls2/600/400', full: 'https://picsum.photos/seed/ls2/1920/1280', titleZh: '落日海岸', titleEn: 'Sunset Coast' },
    { thumb: 'https://picsum.photos/seed/ls3/600/400', full: 'https://picsum.photos/seed/ls3/1920/1280', titleZh: '秋日森林', titleEn: 'Autumn Forest' },
    { thumb: 'https://picsum.photos/seed/ls4/600/400', full: 'https://picsum.photos/seed/ls4/1920/1280', titleZh: '星空之下', titleEn: 'Under the Stars' },
    { thumb: 'https://picsum.photos/seed/ls5/600/400', full: 'https://picsum.photos/seed/ls5/1920/1280', titleZh: '云海翻涌', titleEn: 'Sea of Clouds' },
    { thumb: 'https://picsum.photos/seed/ls6/600/400', full: 'https://picsum.photos/seed/ls6/1920/1280', titleZh: '沙漠之舟', titleEn: 'Desert Ship' },
    { thumb: 'https://picsum.photos/seed/ls7/600/900', full: 'https://picsum.photos/seed/ls7/1280/1920', titleZh: '雪域高原', titleEn: 'Snow Plateau' },
    { thumb: 'https://picsum.photos/seed/ls8/600/400', full: 'https://picsum.photos/seed/ls8/1920/1280', titleZh: '湖光山色', titleEn: 'Lake & Mountain' },
  ],
  portrait: [
    { thumb: 'https://picsum.photos/seed/pt1/600/400', full: 'https://picsum.photos/seed/pt1/1920/1280', titleZh: '回眸一笑', titleEn: 'A Glance Back' },
    { thumb: 'https://picsum.photos/seed/pt2/600/400', full: 'https://picsum.photos/seed/pt2/1920/1280', titleZh: '午后光影', titleEn: 'Afternoon Light' },
    { thumb: 'https://picsum.photos/seed/pt3/600/400', full: 'https://picsum.photos/seed/pt3/1920/1280', titleZh: '城市剪影', titleEn: 'City Silhouette' },
    { thumb: 'https://picsum.photos/seed/pt4/600/900', full: 'https://picsum.photos/seed/pt4/1280/1920', titleZh: '静谧时分', titleEn: 'Quiet Moments' },
    { thumb: 'https://picsum.photos/seed/pt5/600/400', full: 'https://picsum.photos/seed/pt5/1920/1280', titleZh: '青春飞扬', titleEn: 'Youthful Spirit' },
    { thumb: 'https://picsum.photos/seed/pt6/600/400', full: 'https://picsum.photos/seed/pt6/1920/1280', titleZh: '温暖笑容', titleEn: 'Warm Smile' },
  ],
  street: [
    { thumb: 'https://picsum.photos/seed/st1/600/400', full: 'https://picsum.photos/seed/st1/1920/1280', titleZh: '雨夜霓虹', titleEn: 'Rainy Night Neon' },
    { thumb: 'https://picsum.photos/seed/st2/600/400', full: 'https://picsum.photos/seed/st2/1920/1280', titleZh: '匆匆行人', titleEn: 'Hurrying Passersby' },
    { thumb: 'https://picsum.photos/seed/st3/600/400', full: 'https://picsum.photos/seed/st3/1920/1280', titleZh: '老街故事', titleEn: 'Old Street Story' },
    { thumb: 'https://picsum.photos/seed/st4/600/400', full: 'https://picsum.photos/seed/st4/1920/1280', titleZh: '光影交错', titleEn: 'Light & Shadow' },
    { thumb: 'https://picsum.photos/seed/st5/600/400', full: 'https://picsum.photos/seed/st5/1920/1280', titleZh: '市井烟火', titleEn: 'Market Life' },
    { thumb: 'https://picsum.photos/seed/st6/600/900', full: 'https://picsum.photos/seed/st6/1280/1920', titleZh: '城市脉搏', titleEn: 'City Pulse' },
    { thumb: 'https://picsum.photos/seed/st7/600/400', full: 'https://picsum.photos/seed/st7/1920/1280', titleZh: '巷弄深处', titleEn: 'Deep in the Alley' },
  ],
};

// ---------- State ----------
let currentCategory = 'landscape';
let lightboxOpen = false;
let lightboxIndex = 0;
let lightboxImages = []; // currently displayed images in lightbox

// ---------- Render Gallery Grid ----------
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const images = galleryImages[currentCategory] || [];
  const lang = currentLang || 'zh';

  grid.innerHTML = images
    .map(
      (img, idx) => `
    <div class="gallery-item" data-index="${idx}" data-category="${currentCategory}">
      <img
        src="${img.thumb}"
        alt="${lang === 'zh' ? img.titleZh : img.titleEn}"
        loading="lazy"
        class="gallery-thumb"
      />
      <div class="gallery-item-overlay">
        <h3>${lang === 'zh' ? img.titleZh : img.titleEn}</h3>
      </div>
    </div>`
    )
    .join('');

  // Re-bind click events
  grid.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const cat = item.dataset.category;
      const idx = parseInt(item.dataset.index, 10);
      openLightbox(cat, idx);
    });
  });
}

// ---------- Category Tabs ----------
function initGalleryTabs() {
  const tabs = document.querySelectorAll('.gallery-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderGallery();
    });
  });
}

// ---------- Lightbox ----------
function openLightbox(category, index) {
  lightboxImages = galleryImages[category] || [];
  lightboxIndex = index;
  lightboxOpen = true;

  const lb = document.getElementById('lightbox');
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';

  updateLightboxImage();
}

function closeLightbox() {
  lightboxOpen = false;
  const lb = document.getElementById('lightbox');
  lb.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightboxImage() {
  const img = lightboxImages[lightboxIndex];
  if (!img) return;

  const lang = currentLang || 'zh';
  const lbImage = document.getElementById('lightboxImage');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbCounter = document.getElementById('lightboxCounter');

  // Fade out then in
  lbImage.style.opacity = '0';
  setTimeout(() => {
    lbImage.src = img.full;
    lbImage.alt = lang === 'zh' ? img.titleZh : img.titleEn;
    lbImage.style.opacity = '1';
  }, 200);

  lbCaption.textContent = lang === 'zh' ? img.titleZh : img.titleEn;
  lbCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
}

function lightboxPrev() {
  if (!lightboxOpen || lightboxImages.length === 0) return;
  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
  updateLightboxImage();
}

function lightboxNext() {
  if (!lightboxOpen || lightboxImages.length === 0) return;
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
  updateLightboxImage();
}

// ---------- Touch Swipe Support ----------
let touchStartX = 0;
let touchEndX = 0;

function initLightboxSwipe() {
  const lb = document.getElementById('lightbox');
  lb.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? lightboxNext() : lightboxPrev();
    }
  });
}

// ---------- Initialize ----------
function initGallery() {
  renderGallery();
  initGalleryTabs();
  initLightboxSwipe();

  // Lightbox controls
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', lightboxPrev);
  document.getElementById('lightboxNext').addEventListener('click', lightboxNext);

  // Click overlay background to close
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': lightboxPrev(); break;
      case 'ArrowRight': lightboxNext(); break;
    }
  });
}
