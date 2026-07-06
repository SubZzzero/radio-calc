export function calculateOhmsLaw(inputs) {
  const known = Object.entries(inputs).filter(([, value]) => Number.isFinite(value) && value > 0);
  if (known.length < 2) return null;

  const { voltage: u, current: i, resistance: r, power: p } = inputs;

  if (Number.isFinite(u) && Number.isFinite(i)) return fromVoltageCurrent(u, i);
  if (Number.isFinite(u) && Number.isFinite(r)) return fromVoltageResistance(u, r);
  if (Number.isFinite(u) && Number.isFinite(p)) return fromVoltagePower(u, p);
  if (Number.isFinite(i) && Number.isFinite(r)) return fromCurrentResistance(i, r);
  if (Number.isFinite(i) && Number.isFinite(p)) return fromCurrentPower(i, p);
  if (Number.isFinite(r) && Number.isFinite(p)) return fromResistancePower(r, p);

  return null;
}

function fromVoltageCurrent(voltage, current) {
  return { voltage, current, resistance: voltage / current, power: voltage * current };
}

function fromVoltageResistance(voltage, resistance) {
  const current = voltage / resistance;
  return { voltage, current, resistance, power: voltage * current };
}

function fromVoltagePower(voltage, power) {
  const current = power / voltage;
  return { voltage, current, resistance: voltage / current, power };
}

function fromCurrentResistance(current, resistance) {
  const voltage = current * resistance;
  return { voltage, current, resistance, power: current * current * resistance };
}

function fromCurrentPower(current, power) {
  const voltage = power / current;
  return { voltage, current, resistance: voltage / current, power };
}

function fromResistancePower(resistance, power) {
  const current = Math.sqrt(power / resistance);
  return { voltage: current * resistance, current, resistance, power };
}
