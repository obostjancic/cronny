export function formatPrice(price: number | string | undefined): string {
  if (price === undefined || price === null || price === '') {
    return '-';
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '-';
  }

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

export function formatNumber(num: number | string | undefined): string {
  if (num === undefined || num === null || num === '') {
    return '-';
  }

  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(parsed)) {
    return '-';
  }

  return new Intl.NumberFormat('de-DE').format(parsed);
}