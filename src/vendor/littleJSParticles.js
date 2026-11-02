/*
 * Particle appearance calculations adapted from KilledByAPixel/LittleJS,
 * src/engineParticles.js Particle.render(), commit:
 * 9712ac4cd76e8d5eb77da21004687b63f7856fc1
 * https://github.com/KilledByAPixel/LittleJS/blob/9712ac4cd76e8d5eb77da21004687b63f7856fc1/src/engineParticles.js
 * Copyright (c) 2021 Frank Force. MIT; see littlejs-LICENSE.txt.
 * Changes: extracted size/alpha/trail calculations into a scalar ES-module
 * function, with caller-supplied lifetime progress; no engine objects/WebGL.
 */
export function particleAppearance(progress, sizeStart, sizeEnd, alphaStart = 1, alphaEnd = 0, fadeRate = .2, speed = 0, trailScale = 0) {
  const p1 = Math.max(0, Math.min(1, progress));
  const p2 = 1 - p1;
  const fade = fadeRate / 2;
  const size = p2 * sizeStart + p1 * sizeEnd;
  const alphaFade = p1 < fade ? p1 / fade : p1 > 1 - fade ? (1 - p1) / fade : 1;
  const alpha = (p2 * alphaStart + p1 * alphaEnd) * alphaFade;
  const length = trailScale ? Math.max(size, speed * trailScale) : size;
  return {size, alpha, length};
}
