import { e12Base, e24Base, resistorPowerSteps } from '../data/standards';

export function nextSeriesValue(value, series = 'E24') {
  if (!Number.isFinite(value) || value <= 0) return null;
  const base = series === 'E12' ? e12Base : e24Base;
  const decade = 10 ** Math.floor(Math.log10(value / 10));
  const tolerance = Math.abs(value) * 1e-12;
  for (let scale = decade; scale <= decade * 1_000_000; scale *= 10) {
    const candidate = base.map((item) => item * scale).find((item) => item + tolerance >= value);
    if (candidate) return candidate;
  }
  return base.at(-1) * decade;
}

export function recommendedResistorPower(dissipatedPower, margin = 0.5) {
  if (!Number.isFinite(dissipatedPower) || dissipatedPower <= 0) return null;
  const required = dissipatedPower * (1 + margin);
  const step = resistorPowerSteps.find((power) => power >= required);
  return {
    dissipatedPower,
    requiredWithMargin: required,
    recommended: step ?? resistorPowerSteps.at(-1),
    exceedsCatalog: !step,
    margin,
  };
}

export function nextResistorPowerStep(power) {
  if (!Number.isFinite(power) || power <= 0) return null;
  const index = resistorPowerSteps.findIndex((item) => item >= power);
  if (index < 0) return resistorPowerSteps.at(-1);
  return resistorPowerSteps[Math.min(index + 1, resistorPowerSteps.length - 1)];
}
