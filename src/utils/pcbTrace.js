const COPPER_THICKNESS_TO_OZ = {
  18: 0.5,
  35: 1,
  70: 2,
};

const MIL_TO_MM = 0.0254;

export function calculateTraceWidth({ current, copperMicrons, temperatureRise, layer }) {
  if (
    !Number.isFinite(current) ||
    !Number.isFinite(copperMicrons) ||
    !Number.isFinite(temperatureRise) ||
    current <= 0 ||
    temperatureRise <= 0
  ) {
    return null;
  }

  const thicknessOz = COPPER_THICKNESS_TO_OZ[copperMicrons] ?? copperMicrons / 35;
  const thicknessMil = 1.378 * thicknessOz;
  const k = layer === 'internal' ? 0.024 : 0.048;
  const areaMils = (current / (k * temperatureRise ** 0.44)) ** (1 / 0.725);
  const widthMils = areaMils / thicknessMil;
  const widthMm = widthMils * MIL_TO_MM;
  const roundedSafeMm = Math.ceil(widthMm * 10) / 10;

  return {
    widthMm,
    roundedSafeMm,
    widthMils,
    areaMils,
    thicknessOz,
    model: 'IPC-2221',
  };
}
