import { potentiometerValues } from '../data/standards';

export function calculateLedPotentiometer({
  supplyVoltage,
  forwardVoltage,
  fixedResistance,
  minCurrentMa = 1,
}) {
  if (
    !Number.isFinite(supplyVoltage) ||
    !Number.isFinite(forwardVoltage) ||
    !Number.isFinite(fixedResistance) ||
    !Number.isFinite(minCurrentMa) ||
    supplyVoltage <= forwardVoltage ||
    forwardVoltage <= 0 ||
    fixedResistance <= 0 ||
    minCurrentMa <= 0
  ) {
    return null;
  }

  const voltageOnResistors = supplyVoltage - forwardVoltage;
  const minCurrent = minCurrentMa / 1_000;
  const exactPotentiometer = Math.max(voltageOnResistors / minCurrent - fixedResistance, 0);
  const recommendedPotentiometer = potentiometerValues.find((value) => value >= exactPotentiometer) ?? potentiometerValues.at(-1);
  const maxCurrent = voltageOnResistors / fixedResistance;
  const minCurrentWithSelectedPot = voltageOnResistors / (fixedResistance + recommendedPotentiometer);
  const fixedResistorMaxPower = maxCurrent * maxCurrent * fixedResistance;
  const potMaxPower = minCurrentWithSelectedPot * minCurrentWithSelectedPot * recommendedPotentiometer;

  return {
    voltageOnResistors,
    exactPotentiometer,
    recommendedPotentiometer,
    minCurrent: minCurrentWithSelectedPot,
    maxCurrent,
    fixedResistorMaxPower,
    potMaxPower,
  };
}
