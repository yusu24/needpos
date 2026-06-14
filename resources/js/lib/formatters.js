// resources/js/lib/formatters.js

/**
 * Format angka ke format Rupiah Indonesia
 * @param {number} amount
 * @returns {string} — e.g. "Rp 35.000"
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date
 * @param {boolean} withTime — include jam
 * @returns {string}
 */
export function formatDate(date, withTime = false) {
  if (!date) return '-';
  const opts = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  };
  return new Intl.DateTimeFormat('id-ID', opts).format(new Date(date));
}

/**
 * Format tanggal singkat
 */
export function formatDateShort(date) {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format angka dengan pemisah ribuan
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num ?? 0);
}

/**
 * Hitung persentase
 */
export function calcPercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}
