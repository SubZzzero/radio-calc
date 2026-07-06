export function rcCutoff(resistance, capacitanceUf) {
  if (!Number.isFinite(resistance) || !Number.isFinite(capacitanceUf) || resistance <= 0 || capacitanceUf <= 0) return null;
  return 1 / (2 * Math.PI * resistance * capacitanceUf * 1e-6);
}

export function lcCutoff(inductanceUh, capacitanceNf) {
  if (!Number.isFinite(inductanceUh) || !Number.isFinite(capacitanceNf) || inductanceUh <= 0 || capacitanceNf <= 0) return null;
  return 1 / (2 * Math.PI * Math.sqrt(inductanceUh * 1e-6 * capacitanceNf * 1e-9));
}

export function voltageDivider({ vin, r1, r2 }) {
  if (!Number.isFinite(vin) || !Number.isFinite(r1) || !Number.isFinite(r2) || r1 <= 0 || r2 <= 0) return null;
  const current = vin / (r1 + r2);
  return {
    vout: vin * (r2 / (r1 + r2)),
    current,
    r1Power: current * current * r1,
    r2Power: current * current * r2,
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
