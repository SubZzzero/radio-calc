export const e12Base = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];

export const e24Base = [
  10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51,
  56, 62, 68, 75, 82, 91,
];

export const resistorPowerSteps = [0.125, 0.25, 0.5, 1, 2, 5];

export const potentiometerValues = [1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

export const resistorColors = {
  black: { label: 'Черный', digit: 0, multiplier: 1, tolerance: null },
  brown: { label: 'Коричневый', digit: 1, multiplier: 10, tolerance: 1 },
  red: { label: 'Красный', digit: 2, multiplier: 100, tolerance: 2 },
  orange: { label: 'Оранжевый', digit: 3, multiplier: 1_000, tolerance: null },
  yellow: { label: 'Желтый', digit: 4, multiplier: 10_000, tolerance: null },
  green: { label: 'Зеленый', digit: 5, multiplier: 100_000, tolerance: 0.5 },
  blue: { label: 'Синий', digit: 6, multiplier: 1_000_000, tolerance: 0.25 },
  violet: { label: 'Фиолетовый', digit: 7, multiplier: 10_000_000, tolerance: 0.1 },
  gray: { label: 'Серый', digit: 8, multiplier: 100_000_000, tolerance: 0.05 },
  white: { label: 'Белый', digit: 9, multiplier: 1_000_000_000, tolerance: null },
  gold: { label: 'Золото', digit: null, multiplier: 0.1, tolerance: 5 },
  silver: { label: 'Серебро', digit: null, multiplier: 0.01, tolerance: 10 },
};

export const eia96Values = [
  100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140,
  143, 147, 150, 154, 158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200,
  205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274, 280, 287,
  294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412,
  422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590,
  604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845,
  866, 887, 909, 931, 953, 976,
];

export const eia96Multipliers = {
  Z: 0.001,
  Y: 0.01,
  R: 0.01,
  X: 0.1,
  S: 0.1,
  A: 1,
  B: 10,
  H: 10,
  C: 100,
  D: 1_000,
  E: 10_000,
  F: 100_000,
};
