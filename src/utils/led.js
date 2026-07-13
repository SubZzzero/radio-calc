import { nextSeriesValue, recommendedResistorPower } from './standards';

export function calculateLedResistor({
  supplyVoltage,
  forwardVoltage,
  forwardCurrentMa,
  series,
  powerMarginPercent = 30,
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
  resistance,
  powerMarginPercent = 30,
}) {
  if (
    !Number.isFinite(supplyVoltage) ||
    !Number.isFinite(forwardVoltage) ||
    !Number.isFinite(resistance) ||
    supplyVoltage <= forwardVoltage ||
    forwardVoltage < 0 ||
    resistance <= 0 ||
    !Number.isFinite(powerMarginPercent) ||
    powerMarginPercent < 0
  ) {
    return null;
  }

  const ledVoltage = forwardVoltage;
  const voltageOnResistor = supplyVoltage - ledVoltage;
  const current = voltageOnResistor / resistance;
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
