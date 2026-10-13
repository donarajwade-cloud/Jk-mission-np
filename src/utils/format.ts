/**
 * Format currency in Nepalese Rupees (NPR).
 * Adheres to South Asian / Nepalese numbering standards where appropriate.
 */
export function formatNPR(amount: number | undefined | null, prefix = 'NPR'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${prefix} 0`;
  }
  const rounded = Math.round(amount);
  return `${prefix} ${rounded.toLocaleString('en-IN')}`;
}

/**
 * Format date in Asia/Kathmandu local format
 */
export function formatNepaliDate(isoDate: string | undefined): string {
  if (!isoDate) return 'N/A';
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kathmandu',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return isoDate;
  }
}

/**
 * Formats Nepal mobile number (+977 98XXXXXXXX)
 */
export function formatNepalMobile(mobile: string | undefined): string {
  if (!mobile) return 'N/A';
  if (mobile.startsWith('+977') && mobile.length === 14) {
    return `${mobile.slice(0, 4)} ${mobile.slice(4, 9)} ${mobile.slice(9)}`;
  }
  return mobile;
}
