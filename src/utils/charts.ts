/**
 * Generate N visually distinct colors for pie charts.
 *
 * @param n        number of slices
 * @param sat      saturation in % (default 65)
 * @param light    lightness  in % (default 55)
 * @param seed     optional [0-1) seed for repeatable palettes
 * @returns string[] of HSL colors → ["hsl(34,65%,55%)", …]
 */
export const getRandomColors = (
  n: number,
  sat = 65,
  light = 55,
  seed = Math.random(),
): string[] => {
  const goldenRatio = 0.61803398875;
  let hue = seed;

  const colors: string[] = [];
  for (let i = 0; i < n; i++) {
    hue = (hue + goldenRatio) % 1;
    colors.push(`hsl(${Math.round(hue * 360)}, ${sat}%, ${light}%)`);
  }
  return colors;
};
