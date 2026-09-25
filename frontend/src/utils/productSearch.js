export function productMatchesSearch(product, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;

  return Boolean(
    (product.name && product.name.toLowerCase().includes(q)) ||
    (product.description && product.description.toLowerCase().includes(q)) ||
    (product.category_name && product.category_name.toLowerCase().includes(q))
  );
}

export function filterSearchProducts(products, query, limit = 0) {
  const seen = new Set();
  const matches = [];

  for (const product of products || []) {
    if (!product?.id || !productMatchesSearch(product, query)) continue;

    const id = Number(product.id);
    if (seen.has(id)) continue;
    seen.add(id);
    matches.push(product);

    if (limit > 0 && matches.length >= limit) break;
  }

  return matches;
}
