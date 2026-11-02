export const MAX_EFFECTS=128;
export function addEffect(game,effect){
 if(!Number.isFinite(effect.x)||!Number.isFinite(effect.y)||!Number.isFinite(effect.life)||effect.life<=0)return;
 game.effects.push(effect);if(game.effects.length>MAX_EFFECTS)game.effects.splice(0,game.effects.length-MAX_EFFECTS);
}
export function updateEffects(game,dt){for(const effect of game.effects)effect.life-=dt;game.effects=game.effects.filter(e=>e.life>0);}
