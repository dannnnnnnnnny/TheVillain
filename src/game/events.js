export function emitEvent(game, type, target) {
  const event = {id:game.nextEventId++,type,targetId:target.id,targetName:target.name,x:target.x,y:target.y,time:game.elapsed};
  // Capture a simulation-owned immutable moment; later events in this same frame cannot alter it.
  event.snapshot = structuredClone({player:game.player,buildings:game.buildings,enemies:game.enemies,projectiles:game.projectiles,effects:game.effects,elapsed:game.elapsed,world:game.world,shake:0,phase:game.phase});
  game.events.push(event);
  return event;
}
