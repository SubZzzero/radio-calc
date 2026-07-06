import { nextSeriesValue, recommendedResistorPower } from './standards';

export function calculateLedResistor({
  supplyVoltage,
  forwardVoltage,
  forwardCurrentMa,
  series,
  powerMarginPercent = 0,
  resistanceMarginPercent = 0,
}) {
  if (
    !Number.isFinite(supplyVoltage) ||
    !Number.isFinite(forwardVoltage) ||
    !Number.isFinite(forwardCurrentMa) ||
    supplyVoltage <= forwardVoltage ||
    forwardCurrentMa <= 0 ||
    !Number.isFinite(powerMarginPercent) ||
    powerMarginPercent < 0 ||
    !Number.isFinite(resistanceMarginPercent) ||
    resistanceMarginPercent < 0
  ) {
    return null;
  }

  const current = forwardCurrentMa / 1_000;
  const voltageOnResistor = supplyVoltage - forwardVoltage;
  const exactResistance = voltageOnResistor / current;
  const standardResistanceNoMargin = nextSeriesValue(exactResistance, series);
  const resistanceWithMargin = exactResistance * (1 + resistanceMarginPercent / 100);
  const standardResistance = nextSeriesValue(resistanceWithMargin, series);
  const exactPower = current * current * exactResistance;
  const selectedCurrentNoMargin = voltageOnResistor / standardResistanceNoMargin;
  const selectedPowerNoMargin = selectedCurrentNoMargin * selectedCurrentNoMargin * standardResistanceNoMargin;
  const selectedCurrent = voltageOnResistor / standardResistance;
  const selectedPower = selectedCurrent * selectedCurrent * standardResistance;

  return {
    voltageOnResistor,
    exactResistance,
    standardResistanceNoMargin,
    resistanceWithMargin,
    standardResistance,
    exactPower,
    selectedCurrentNoMargin,
    selectedPowerNoMargin,
    powerRecommendationNoMargin: recommendedResistorPower(selectedPowerNoMargin, 0),
    selectedCurrent,
    selectedPower,
    powerRecommendation: recommendedResistorPower(selectedPower, powerMarginPercent / 100),
  };
}

export function calculateLedWithSelectedResistor({
  supplyVoltage,
  forwardVoltage,
  forwardCurrentMa,
  resistance,
  powerMarginPercent = 0,
}) {
  if (
    !Number.isFinite(supplyVoltage) ||
    !Number.isFinite(forwardVoltage) ||
    !Number.isFinite(forwardCurrentMa) ||
    !Number.isFinite(resistance) ||
    supplyVoltage <= 0 ||
    forwardVoltage <= 0 ||
    forwardCurrentMa <= 0 ||
    resistance <= 0 ||
    !Number.isFinite(powerMarginPercent) ||
    powerMarginPercent < 0
  ) {
    return null;
  }

  const referenceCurrent = forwardCurrentMa / 1_000;
  const diodeSlope = 0.052;
  const maxCurrent = supplyVoltage / resistance;
  let low = Math.max(referenceCurrent * 1e-9, Number.EPSILON);
  let high = maxCurrent;

  for (let index = 0; index < 80; index += 1) {
    const current = (low + high) / 2;
    const ledVoltage = forwardVoltage + diodeSlope * Math.log(current / referenceCurrent);
    const totalVoltage = current * resistance + ledVoltage;
    if (totalVoltage > supplyVoltage) high = current;
    else low = current;
  }

  const current = (low + high) / 2;
  const ledVoltage = forwardVoltage + diodeSlope * Math.log(current / referenceCurrent);
  const voltageOnResistor = supplyVoltage - ledVoltage;
  const power = current * current * resistance;

  return {
    ledVoltage,
    voltageOnResistor,
    resistance,
    current,
    power,
    powerRecommendation: recommendedResistorPower(power, powerMarginPercent / 100),
  };
}
