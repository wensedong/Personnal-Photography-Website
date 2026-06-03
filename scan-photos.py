"""
scan-photos.py — 一键扫描照片，自动生成 gallery.js

用法：
  1. 把照片丢进 images/gallery/landscape/、portrait/、street/
  2. 双击运行此脚本（或 python scan-photos.py）
  3. 脚本自动扫描所有照片，生成 js/gallery.js

标题规则：
  - 文件名 sunset-beach.webp → 英文 "Sunset Beach"，中文留空待填
  - 也可在同目录下放一个 titles.json 手动指定中英文标题
"""

import json
import os
from pathlib import Path

BASE = Path(__file__).parent
GALLERY_DIR = BASE / "images" / "gallery"
OUTPUT = BASE / "js" / "gallery.js"

# 分类对应的文件夹
CATEGORIES = {
    "landscape": "风光",
    "portrait": "人像",
    "street": "街拍",
}

# 支持的图片格式
EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png", ".avif"}


def filename_to_title(filename: str) -> str:
    """sunset-beach → Sunset Beach"""
    name = Path(filename).stem
    # 把连字符和下划线替换成空格，去除首尾空格，再首字母大写
    clean = name.replace("-", " ").replace("_", " ").strip()
    return clean.title() if clean else "Untitled"


def load_custom_titles(category_dir: Path) -> dict:
    """读取 titles.json（如果存在），格式：
    {
      "sunset-beach.webp": {"zh": "海边落日", "en": "Sunset Beach"}
    }
    """
    titles_file = category_dir / "titles.json"
    if titles_file.exists():
        with open(titles_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def scan_category(category: str) -> tuple[list[dict], dict, bool]:
    """扫描一个分类下的所有照片，返回 (照片列表, 更新后的titles字典, 是否有新照片)"""
    cat_dir = GALLERY_DIR / category
    if not cat_dir.exists():
        return [], {}, False

    custom = load_custom_titles(cat_dir)
    photos = []
    has_new = False

    for f in sorted(cat_dir.iterdir()):
        if f.suffix.lower() not in EXTENSIONS:
            continue
        if f.name == "titles.json":
            continue

        rel_path = str(f.relative_to(BASE)).replace("\\", "/")
        auto_en = filename_to_title(f.name)

        if f.name in custom:
            zh = custom[f.name].get("zh", "")
            en = custom[f.name].get("en", auto_en)
        else:
            # 新照片：自动加入 titles.json，中文用占位符
            zh = "[待填写]"
            en = auto_en
            custom[f.name] = {"zh": zh, "en": en}
            has_new = True

        photos.append({
            "file": rel_path,
            "zh": zh if zh != "[待填写]" else auto_en,  # gallery 中用英文暂代
            "en": en,
        })

    return photos, custom, has_new


def save_titles_json(category_dir: Path, titles: dict):
    """保存 titles.json（保持中文可读性）"""
    titles_file = category_dir / "titles.json"
    with open(titles_file, "w", encoding="utf-8") as f:
        json.dump(titles, f, ensure_ascii=False, indent=2)
        f.write("\n")


def generate_gallery_js(all_photos: dict) -> str:
    """生成 gallery.js 文件内容"""
    lines = []
    lines.append("// ============================================================")
    lines.append("// gallery.js — 画廊数据、渲染与 Lightbox 灯箱")
    lines.append("// 此文件由 scan-photos.py 自动生成，请勿手动编辑")
    lines.append(f"// 生成时间：{__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("// ============================================================")
    lines.append("")
    lines.append("// 修改标题：编辑本文件中的 titleZh / titleEn 字段即可")
    lines.append("// 添加照片：丢入对应文件夹 → 运行 scan-photos.py → 完成")
    lines.append("")
    lines.append("// ---------- Gallery Data ----------")
    lines.append("const galleryImages = {")

    for cat, zh_name in CATEGORIES.items():
        photos = all_photos.get(cat, [])
        lines.append(f"  {cat}: [")
        if not photos:
            lines.append(f'    {{ thumb: "", full: "", titleZh: "暂无照片", titleEn: "No photos yet" }},')
        else:
            for p in photos:
                zh = p["zh"] if p["zh"] else p["en"]
                lines.append(f"    {{")
                lines.append(f"      thumb: '{p['file']}',")
                lines.append(f"      full:  '{p['file']}',")
                lines.append(f"      titleZh: '{zh}',")
                lines.append(f"      titleEn: '{p['en']}',")
                lines.append(f"    }},")
        lines.append(f"  ],")

    lines.append("};")
    lines.append("")
    lines.append("// ---------- State ----------")
    lines.append("let currentCategory = 'landscape';")
    lines.append("let lightboxOpen = false;")
    lines.append("let lightboxIndex = 0;")
    lines.append("let lightboxImages = [];")
    lines.append("")
    lines.append("// ---------- Render Gallery Grid ----------")
    lines.append("function renderGallery() {")
    lines.append("  const grid = document.getElementById('galleryGrid');")
    lines.append("  if (!grid) return;")
    lines.append("")
    lines.append("  const images = galleryImages[currentCategory] || [];")
    lines.append("  const lang = currentLang || 'zh';")
    lines.append("")
    lines.append("  grid.innerHTML = images")
    lines.append("    .map(")
    lines.append('      (img, idx) => `')
    lines.append('    <div class="gallery-item" data-index="${idx}" data-category="${currentCategory}">')
    lines.append('      <img')
    lines.append('        src="${img.thumb}"')
    lines.append('        alt="${lang === \'zh\' ? img.titleZh : img.titleEn}"')
    lines.append('        loading="lazy"')
    lines.append('        class="gallery-thumb"')
    lines.append('      />')
    lines.append('      <div class="gallery-item-overlay">')
    lines.append('        <h3>${lang === \'zh\' ? img.titleZh : img.titleEn}</h3>')
    lines.append('      </div>')
    lines.append('    </div>`')
    lines.append("    )")
    lines.append("    .join('');")
    lines.append("")
    lines.append("  grid.querySelectorAll('.gallery-item').forEach((item) => {")
    lines.append("    item.addEventListener('click', () => {")
    lines.append("      const cat = item.dataset.category;")
    lines.append("      const idx = parseInt(item.dataset.index, 10);")
    lines.append("      openLightbox(cat, idx);")
    lines.append("    });")
    lines.append("  });")
    lines.append("}")
    lines.append("")
    lines.append("// ---------- Category Tabs ----------")
    lines.append("function initGalleryTabs() {")
    lines.append("  const tabs = document.querySelectorAll('.gallery-tab');")
    lines.append("  tabs.forEach((tab) => {")
    lines.append("    tab.addEventListener('click', () => {")
    lines.append("      tabs.forEach((t) => t.classList.remove('active'));")
    lines.append("      tab.classList.add('active');")
    lines.append("      currentCategory = tab.dataset.category;")
    lines.append("      renderGallery();")
    lines.append("    });")
    lines.append("  });")
    lines.append("}")
    lines.append("")
    lines.append("// ---------- Lightbox ----------")
    lines.append("function openLightbox(category, index) {")
    lines.append("  lightboxImages = galleryImages[category] || [];")
    lines.append("  lightboxIndex = index;")
    lines.append("  lightboxOpen = true;")
    lines.append("  const lb = document.getElementById('lightbox');")
    lines.append("  lb.classList.add('active');")
    lines.append("  document.body.style.overflow = 'hidden';")
    lines.append("  updateLightboxImage();")
    lines.append("}")
    lines.append("")
    lines.append("function closeLightbox() {")
    lines.append("  lightboxOpen = false;")
    lines.append("  const lb = document.getElementById('lightbox');")
    lines.append("  lb.classList.remove('active');")
    lines.append("  document.body.style.overflow = '';")
    lines.append("}")
    lines.append("")
    lines.append("function updateLightboxImage() {")
    lines.append("  const img = lightboxImages[lightboxIndex];")
    lines.append("  if (!img) return;")
    lines.append("  const lang = currentLang || 'zh';")
    lines.append("  const lbImage = document.getElementById('lightboxImage');")
    lines.append("  const lbCaption = document.getElementById('lightboxCaption');")
    lines.append("  const lbCounter = document.getElementById('lightboxCounter');")
    lines.append("  lbImage.style.opacity = '0';")
    lines.append("  setTimeout(() => {")
    lines.append("    lbImage.src = img.full;")
    lines.append("    lbImage.alt = lang === 'zh' ? img.titleZh : img.titleEn;")
    lines.append("    lbImage.style.opacity = '1';")
    lines.append("  }, 200);")
    lines.append("  lbCaption.textContent = lang === 'zh' ? img.titleZh : img.titleEn;")
    lines.append("  lbCounter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;")
    lines.append("}")
    lines.append("")
    lines.append("function lightboxPrev() {")
    lines.append("  if (!lightboxOpen || lightboxImages.length === 0) return;")
    lines.append("  lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;")
    lines.append("  updateLightboxImage();")
    lines.append("}")
    lines.append("")
    lines.append("function lightboxNext() {")
    lines.append("  if (!lightboxOpen || lightboxImages.length === 0) return;")
    lines.append("  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;")
    lines.append("  updateLightboxImage();")
    lines.append("}")
    lines.append("")
    lines.append("// ---------- Touch Swipe ----------")
    lines.append("let touchStartX = 0, touchEndX = 0;")
    lines.append("function initLightboxSwipe() {")
    lines.append("  const lb = document.getElementById('lightbox');")
    lines.append("  lb.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });")
    lines.append("  lb.addEventListener('touchend', (e) => {")
    lines.append("    touchEndX = e.changedTouches[0].screenX;")
    lines.append("    const diff = touchStartX - touchEndX;")
    lines.append("    if (Math.abs(diff) > 50) diff > 0 ? lightboxNext() : lightboxPrev();")
    lines.append("  });")
    lines.append("}")
    lines.append("")
    lines.append("// ---------- Initialize ----------")
    lines.append("function initGallery() {")
    lines.append("  renderGallery();")
    lines.append("  initGalleryTabs();")
    lines.append("  initLightboxSwipe();")
    lines.append("  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);")
    lines.append("  document.getElementById('lightboxPrev').addEventListener('click', lightboxPrev);")
    lines.append("  document.getElementById('lightboxNext').addEventListener('click', lightboxNext);")
    lines.append("  document.getElementById('lightbox').addEventListener('click', (e) => {")
    lines.append("    if (e.target === e.currentTarget) closeLightbox();")
    lines.append("  });")
    lines.append("  document.addEventListener('keydown', (e) => {")
    lines.append("    if (!lightboxOpen) return;")
    lines.append("    switch (e.key) {")
    lines.append("      case 'Escape': closeLightbox(); break;")
    lines.append("      case 'ArrowLeft': lightboxPrev(); break;")
    lines.append("      case 'ArrowRight': lightboxNext(); break;")
    lines.append("    }")
    lines.append("  });")
    lines.append("}")

    return "\n".join(lines) + "\n"


def main():
    print("Scanning photos...\n")

    all_photos = {}
    total = 0
    new_count = 0

    for cat, zh_name in CATEGORIES.items():
        photos, titles, has_new = scan_category(cat)
        all_photos[cat] = photos

        # 有新照片时自动写入 titles.json
        if has_new:
            cat_dir = GALLERY_DIR / cat
            save_titles_json(cat_dir, titles)
            placeholder_count = sum(
                1 for info in titles.values()
                if isinstance(info, dict) and info.get('zh') == '[待填写]'
            )
            new_count += placeholder_count

        if photos:
            count = len(photos)
            total += count
            print(f"  [{zh_name}] {cat}: {count} photos")
            for p in photos:
                print(f"      └─ {Path(p['file']).name}  →  {p['en']}")
        else:
            print(f"  [{zh_name}] {cat}: 0 photos (empty)")

    # 生成 gallery.js
    content = generate_gallery_js(all_photos)
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"\n[Done] Generated {OUTPUT.relative_to(BASE)} ({total} photos)")

    if new_count > 0:
        print(f"\n[New] {new_count} photo(s) added to titles.json.")
        print("      Open images/gallery/<category>/titles.json")
        print('      and replace "[待填写]" with your Chinese title.')


if __name__ == "__main__":
    main()
