/*
 * Adapted from tweenjs/tween.js src/Easing.ts, commit:
 * 84a27a74febbda783eebb7ee3e7d7c7abfd25009
 * https://github.com/tweenjs/tween.js/blob/84a27a74febbda783eebb7ee3e7d7c7abfd25009/src/Easing.ts
 * MIT License: see tweenjs-LICENSE.txt in this directory.
 * Changes: selected four functions, removed TypeScript annotations/group wrappers,
 * and exported named functions for the dependency-free Canvas renderer.
 * Copyright (c) 2010-2012 Tween.js authors.
 * Easing equations Copyright (c) 2001 Robert Penner.
 */

export function quadraticIn(amount) {
  return amount * amount;
}

export function cubicOut(amount) {
  return --amount * amount * amount + 1;
}

export function backOut(amount) {
  const s = 1.70158;
  return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1;
}

export function elasticOut(amount) {
  if (amount === 0) return 0;
  if (amount === 1) return 1;
  return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
}
