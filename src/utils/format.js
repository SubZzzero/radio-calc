export function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

export function round(value, digits = 3) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatNumber(value, unit = '', digits = 3) {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  let shown = value;
  let suffix = unit;

  if (unit === 'Ω') {
    if (abs >= 1_000_000) {
      shown = value / 1_000_000;
      suffix = 'MΩ';
    } else if (abs >= 1_000) {
      shown = value / 1_000;
      suffix = 'kΩ';
    }
  }

  return `${round(shown, digits).toLocaleString('ru-RU')} ${suffix}`.trim();
}
