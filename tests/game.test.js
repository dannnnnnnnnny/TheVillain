import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/game/createGame.js';
import {updateGame} from '../src/game/updateGame.js';
import {damageEntity, hitPlayer, performAttack, tryGrab} from '../src/game/combat.js';
const idle={moveX:0,moveY:0,aimX:1,aimY:0};
test('two actual landmark deaths win even with living hero and incoming hit; reward only once',()=>{
 const g=createGame({fear:39}); const hero=g.enemies.find(e=>e.kind==='hero');hero.active=true;
 for(const b of g.buildings.filter(b=>b.landmark))damageEntity(g,b,99999);
 g.projectiles.push({x:g.player.x,y:g.player.y,vx:0,vy:0,damage:99999,life:2});
 updateGame(g,idle,.016);assert.equal(g.phase,'won');assert.ok(hero.hp>0);assert.equal(g.reward,40);assert.equal(g.fear,79);
 for(let i=0;i<10;i++)updateGame(g,idle,.1);assert.equal(g.fear,79);assert.equal(g.events.filter(e=>e.type==='landmark-destroyed').length,2);
});
test('destroyed entities never repeat damage or events',()=>{
 const g=createGame({});const b=g.buildings.find(b=>b.landmark);damageEntity(g,b,99999);const count=g.events.length;damageEntity(g,b,99999);assert.equal(b.hp,0);assert.equal(g.events.length,count);
});
test('melee cannot hit outside range or behind aim',()=>{
 for(const [distance,aim,shouldHit] of [[300,1,false],[40,-1,false],[40,1,true]]){
 const g=createGame();g.buildings=g.buildings.filter(b=>b.landmark);g.enemies=[];const b=g.buildings[0];g.player.x=b.x-distance;g.player.y=b.y;
 performAttack(g,{aimX:g.player.x+aim*300,aimY:b.y});assert.equal(b.hp,b.maxHp);
 for(let i=0;i<3;i++)updateGame(g,{},.05);assert.equal(b.hp<b.maxHp,shouldHit);
 }
});
test('zero hp loses without awarding or changing saved fear',()=>{
 const g=createGame({fear:40});hitPlayer(g,99999);updateGame(g,idle,.016);assert.equal(g.phase,'lost');assert.equal(g.reward,0);assert.equal(g.fear,40);
});
test('block reduces damage; dodge prevents damage; grab bypasses block but not dodge',()=>{
 const g=createGame({});g.player.blocking=true;hitPlayer(g,100);assert.equal(g.player.hp,572);
 g.player.invulnerable=.5;hitPlayer(g,100);assert.equal(g.player.hp,572);assert.equal(tryGrab(g),false);
 g.player.invulnerable=0;assert.equal(tryGrab(g),true);assert.ok(g.player.grabbed>0);
});
test('six discrete escape presses break grab; skill command alone is not an escape press',()=>{
 const g=createGame({});tryGrab(g);for(let i=0;i<10;i++)updateGame(g,{...idle,commands:[{type:'skill',skill:'e',x:900,y:500}]},.016);assert.ok(g.player.grabbed>0);
 for(let i=0;i<6;i++)updateGame(g,{...idle,escapePressed:true},.016);assert.equal(g.player.grabbed,0);assert.ok(g.player.invulnerable>0);
});
test('pause freezes all state and elapsed; dt is clamped',()=>{
 const g=createGame({});g.phase='paused';const snapshot=JSON.stringify(g);updateGame(g,{attack:true},3);assert.equal(JSON.stringify(g),snapshot);
 g.phase='active';updateGame(g,idle,40);assert.ok(g.elapsed<=.05);
});
test('rank changes size and attacks; fresh retry uses only persistent fear',()=>{
 const first=createGame({fear:0});const grown=createGame({fear:100});assert.ok(grown.player.radius>first.player.radius);assert.ok(grown.player.attackDamage>first.player.attackDamage);assert.equal(grown.player.hp,1100);assert.equal(grown.elapsed,0);assert.equal(grown.reward,0);
});
test('same-frame event snapshots keep the exact scene at each separate collapse',()=>{
 const g=createGame({});const [tower,hall]=g.buildings.filter(b=>b.landmark);
 damageEntity(g,tower,99999);damageEntity(g,hall,99999);
 const [a,b]=g.events;assert.notEqual(a.id,b.id);assert.equal(a.snapshot.buildings.find(e=>e.id===hall.id).hp,2200);assert.equal(b.snapshot.buildings.find(e=>e.id===hall.id).hp,0);
 g.player.x=999;assert.notEqual(a.snapshot.player.x,999);assert.equal(a.targetId,tower.id);assert.equal(b.targetId,hall.id);
});
