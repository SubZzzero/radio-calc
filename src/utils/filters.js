export function rcCutoff(resistance, capacitanceUf) {
  if (!Number.isFinite(resistance) || !Number.isFinite(capacitanceUf) || resistance <= 0 || capacitanceUf <= 0) return null;
  return 1 / (2 * Math.PI * resistance * capacitanceUf * 1e-6);
}

export function lcCutoff(inductanceUh, capacitanceNf) {
  if (!Number.isFinite(inductanceUh) || !Number.isFinite(capacitanceNf) || inductanceUh <= 0 || capacitanceNf <= 0) return null;
  return 1 / (2 * Math.PI * Math.sqrt(inductanceUh * 1e-6 * capacitanceNf * 1e-9));
}

export function voltageDivider({ vin, r1, r2, rLoad = null }) {
  if (!Number.isFinite(vin) || !Number.isFinite(r1) || !Number.isFinite(r2) || r1 <= 0 || r2 <= 0) return null;
  if (rLoad !== null && rLoad !== undefined && (!Number.isFinite(rLoad) || rLoad <= 0)) return null;

  const hasLoad = Number.isFinite(rLoad);
  const lowerResistance = hasLoad ? 1 / (1 / r2 + 1 / rLoad) : r2;
  const current = vin / (r1 + lowerResistance);
  const vout = current * lowerResistance;

  return {
    vout,
    current,
    lowerResistance,
    r1Power: current * current * r1,
    r2Power: (vout * vout) / r2,
    loadCurrent: hasLoad ? vout / rLoad : null,
    loadPower: hasLoad ? (vout * vout) / rLoad : null,
  };
}

export function currentDivider({ totalCurrent, r1, r2 }) {
  if (!Number.isFinite(totalCurrent) || !Number.isFinite(r1) || !Number.isFinite(r2) || totalCurrent <= 0 || r1 <= 0 || r2 <= 0) return null;
  const conductance1 = 1 / r1;
  const conductance2 = 1 / r2;
  const totalConductance = conductance1 + conductance2;
  const equivalentResistance = 1 / totalConductance;
  const branchVoltage = totalCurrent * equivalentResistance;

  return {
    i1: totalCurrent * (conductance1 / totalConductance),
    i2: totalCurrent * (conductance2 / totalConductance),
    branchVoltage,
    equivalentResistance,
    r1Power: (branchVoltage * branchVoltage) / r1,
    r2Power: (branchVoltage * branchVoltage) / r2,
  };
}
