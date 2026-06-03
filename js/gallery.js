// ============================================================
// gallery.js — 画廊数据、渲染与 Lightbox 灯箱
// 此文件由 scan-photos.py 自动生成，请勿手动编辑
// 生成时间：2026-06-03 19:25:56
// ============================================================

// 修改标题：编辑本文件中的 titleZh / titleEn 字段即可
// 添加照片：丢入对应文件夹 → 运行 scan-photos.py → 完成

// ---------- Gallery Data ----------
const galleryImages = {
  landscape: [
    {
      thumb: 'images/gallery/landscape/_DSC4580.webp',
      full:  'images/gallery/landscape/_DSC4580.webp',
      titleZh: 'Dsc4580',
      titleEn: ' Dsc4580',
    },
    {
      thumb: 'images/gallery/landscape/_DSC5146.webp',
      full:  'images/gallery/landscape/_DSC5146.webp',
      titleZh: 'Dsc5146',
      titleEn: ' Dsc5146',
    },
    {
      thumb: 'images/gallery/landscape/green-fence.webp',
      full:  'images/gallery/landscape/green-fence.webp',
      titleZh: '绿篱',
      titleEn: 'Green Fence',
    },
    {
      thumb: 'images/gallery/landscape/three-boats-lake.webp',
      full:  'images/gallery/landscape/three-boats-lake.webp',
      titleZh: '雁栖湖',
      titleEn: 'Yanqi Lake',
    },
    {
      thumb: 'images/gallery/landscape/trees-in-the-lake.webp',
      full:  'images/gallery/landscape/trees-in-the-lake.webp',
      titleZh: '湖心树影',
      titleEn: 'Trees in the Lake',
    },
  ],
  portrait: [
    { thumb: "", full: "", titleZh: "暂无照片", titleEn: "No photos yet" },
  ],
  street: [
    { thumb: "", full: "", titleZh: "暂无照片", titleEn: "No photos yet" },
  ],
};

// ---------- State ----------
let currentCategory = 'landscape';
let lightboxOpen = false;
let lightboxIndex = 0;
let lightboxImages = [];

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

// ---------- Touch Swipe ----------
let touchStartX = 0, touchEndX = 0;
function initLightboxSwipe() {
  const lb = document.getElementById('lightbox');
  lb.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) diff > 0 ? lightboxNext() : lightboxPrev();
  });
}

// ---------- Initialize ----------
function initGallery() {
  renderGallery();
  initGalleryTabs();
  initLightboxSwipe();
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', lightboxPrev);
  document.getElementById('lightboxNext').addEventListener('click', lightboxNext);
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': lightboxPrev(); break;
      case 'ArrowRight': lightboxNext(); break;
    }
  });
}
