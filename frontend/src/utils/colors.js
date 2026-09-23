const COLOR_MAP = {
  black: '#111111',
  white: '#f4f4f4',
  red: '#c62828',
  maroon: '#7b1e1e',
  pink: '#d81b60',
  rose: '#c2185b',
  orange: '#ef6c00',
  yellow: '#f9a825',
  gold: '#c5a059',
  green: '#2e7d32',
  mint: '#26a69a',
  teal: '#00897b',
  blue: '#1565c0',
  navy: '#1a237e',
  purple: '#6a1b9a',
  lavender: '#9575cd',
  brown: '#6d4c41',
  beige: '#d7ccc8',
  cream: '#f5e6c8',
  grey: '#757575',
  gray: '#757575',
  silver: '#b0b0b0',
  peach: '#ffab91',
  wine: '#6a1a2a',
  rust: '#bf360c',
  ivory: '#fffff0',
  olive: '#558b2f',
  magenta: '#ad1457',
};

export function colorToHex(name) {
  if (!name) return '#cfcfcf';
  const key = String(name).toLowerCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  const match = Object.keys(COLOR_MAP).find((k) => key.includes(k));
  return match ? COLOR_MAP[match] : '#8d6e63';
}

export function extractProductColors(product) {
  const set = new Set();
  (product?.variants || []).forEach((v) => {
    if (v.color) set.add(v.color.trim());
  });
  (product?.color_images || product?.colors || []).forEach((item) => {
    const value = typeof item === 'string' ? item : item?.color;
    if (value) set.add(String(value).trim());
  });
  return Array.from(set);
}
