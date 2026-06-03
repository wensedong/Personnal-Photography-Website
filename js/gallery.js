// ============================================================
// gallery.js — 画廊数据、渲染与 Lightbox 灯箱
// ============================================================

// ---------- Gallery Data ----------
// 照片格式说明：
//   thumb  — 画廊缩略图（建议 600px 宽，~80KB）
//   full   — 灯箱大图（建议 1920px 宽，~400KB）
//   titleZh / titleEn — 中英文标题
//
// 添加新照片：复制一个 { ... } 块，修改文件路径和标题即可

const galleryImages = {
  landscape: [
    { thumb: 'images/gallery/landscape/three-boats-lake.webp', full: 'images/gallery/landscape/three-boats-lake.webp', titleZh: '雁栖湖', titleEn: 'Yan Qi Lake' },
    { thumb: 'images/gallery/landscape/Green-Fence.webp', full: 'images/gallery/landscape/Green-Fence.webp', titleZh: '绿篱', titleEn: 'Green Fence' },
    { thumb: 'images/gallery/landscape/Trees in the Lake.webp', full: 'images/gallery/landscape/Trees in the Lake.webp', titleZh: '湖心树影', titleEn: 'Trees in the Lake' },
  ],
  portrait: [
    { thumb: 'https://picsum.photos/seed/pt1/600/400', full: 'https://picsum.photos/seed/pt1/1920/1280', titleZh: '待替换', titleEn: 'Replace me' },
  ],
  street: [
    { thumb: 'https://picsum.photos/seed/st1/600/400', full: 'https://picsum.photos/seed/st1/1920/1280', titleZh: '待替换', titleEn: 'Replace me' },
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
