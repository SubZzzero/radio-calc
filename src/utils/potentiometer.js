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
  const maxCurrent = voltageOnResistors / fixedResistance;
  const minCurrentExceedsMax = minCurrent > maxCurrent;
  const exactPotentiometer = Math.max(voltageOnResistors / minCurrent - fixedResistance, 0);
  const maxCatalogPotentiometer = potentiometerValues.at(-1);
  const recommendedPotentiometer = potentiometerValues.find((value) => value >= exactPotentiometer) ?? maxCatalogPotentiometer;
  const exceedsCatalog = exactPotentiometer > maxCatalogPotentiometer;
  const minCurrentWithSelectedPot = voltageOnResistors / (fixedResistance + recommendedPotentiometer);
  const fixedResistorMaxPower = maxCurrent * maxCurrent * fixedResistance;
  const potPowerAt = (potResistance) => (voltageOnResistors * voltageOnResistors * potResistance) / ((fixedResistance + potResistance) ** 2);
  const potPowerPoints = [recommendedPotentiometer];
  if (fixedResistance <= recommendedPotentiometer) potPowerPoints.push(fixedResistance);
  const potMaxPowerResistance = potPowerPoints.reduce((best, resistance) => (potPowerAt(resistance) > potPowerAt(best) ? resistance : best));
  const potMaxPower = potPowerAt(potMaxPowerResistance);

  return {
    voltageOnResistors,
    exactPotentiometer,
    recommendedPotentiometer,
    exceedsCatalog,
    minCurrentExceedsMax,
    minCurrent: minCurrentWithSelectedPot,
    maxCurrent,
    fixedResistorMaxPower,
    potMaxPower,
    potMaxPowerResistance,
  };
}
