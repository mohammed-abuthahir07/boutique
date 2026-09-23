export function formatPrice(val) {
  const num = Number(val);
  if (Number.isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatOfferLabel(offer) {
  if (!offer) return '';
  if (offer.discount_type === 'PERCENTAGE') {
    return `${Math.round(Number(offer.discount_value))}% OFF`;
  }
  return `${formatPrice(offer.discount_value)} OFF`;
}

export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}
