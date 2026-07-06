import { eia96Multipliers, eia96Values, resistorColors } from '../data/standards';

export function decodeColorBands(bands) {
  const active = bands.filter(Boolean);
  if (![4, 5].includes(active.length)) return null;

  const digitsCount = active.length === 5 ? 3 : 2;
  const digitBands = active.slice(0, digitsCount).map((color) => resistorColors[color]?.digit);
  const multiplier = resistorColors[active[digitsCount]]?.multiplier;
  const tolerance = resistorColors[active[digitsCount + 1]]?.tolerance;

  if (digitBands.some((digit) => digit === null || digit === undefined) || !Number.isFinite(multiplier)) {
    return null;
  }

  const significant = Number(digitBands.join(''));
  return { resistance: significant * multiplier, tolerance: tolerance ?? null };
}

export function decodeSmdCode(rawCode) {
  const code = String(rawCode).trim().toUpperCase();
  if (/^\d{3}$/.test(code)) {
    return { resistance: Number(code.slice(0, 2)) * 10 ** Number(code[2]), system: '3 digit' };
  }
  if (/^\d{4}$/.test(code)) {
    return { resistance: Number(code.slice(0, 3)) * 10 ** Number(code[3]), system: '4 digit' };
  }
  if (/^\d{2}[A-Z]$/.test(code)) {
    const index = Number(code.slice(0, 2));
    const multiplier = eia96Multipliers[code[2]];
    if (index >= 1 && index <= 96 && Number.isFinite(multiplier)) {
      return { resistance: eia96Values[index - 1] * multiplier, system: 'EIA-96' };
    }
  }
  return null;
}
