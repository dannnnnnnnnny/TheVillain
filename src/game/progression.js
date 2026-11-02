export function normalizeFear(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return 0;
  const fear = Number(value);
  return Number.isFinite(fear) ? Math.max(0, Math.min(160, Math.floor(fear))) : 0;
}
export function growthForFear(value) {
  const fear = normalizeFear(value);
  const rank = fear >= 100 ? 3 : fear >= 40 ? 2 : 1;
  return { rank, maxHp: [600, 820, 1100][rank - 1], armor: [0, .12, .24][rank - 1], radius: [19, 24, 30][rank - 1], attackDamage: [52, 72, 96][rank - 1], attackRange: [86, 104, 125][rank - 1] };
}
