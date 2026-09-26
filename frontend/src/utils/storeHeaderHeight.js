export function measureStoreHeaderHeight() {
  const header = document.querySelector('.header');
  if (!header) return 148;

  const announcement = header.querySelector('.announcement-bar');
  const nav = header.querySelector('.navbar-wrapper');
  const strip = header.querySelector('.category-strip');

  let height = (announcement?.offsetHeight || 0) + (nav?.offsetHeight || 0);
  if (strip && window.getComputedStyle(strip).display !== 'none') {
    height += strip.offsetHeight;
  }

  return height || 148;
}

export function syncStoreHeaderHeight() {
  document.documentElement.style.setProperty('--store-header-h', `${measureStoreHeaderHeight()}px`);
}
