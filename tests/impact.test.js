import {startDemonSkill} from '../src/game/demonSkills.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/game/createGame.js';
import {updateGame,clearOrders} from '../src/game/updateGame.js';
import {attackTarget,tryGrab} from '../src/game/combat.js';
const scene=()=>{const g=createGame();g.enemies=[];g.player.x=150;g.player.y=500;const target={id:'a',x:220,y:500,hp:1000,maxHp:1000,radius:20,active:true,flash:0,cooldown:999,kind:'tank'};g.enemies=[target];return [g,target];};
const tick=(g,n=1,input={})=>{for(let i=0;i<n;i++)updateGame(g,i?{}:input,.05);};
test('basic attack resolves once at the visible impact, never during anticipation',()=>{const [g,t]=scene();assert.equal(attackTarget(g,t),true);assert.equal(t.hp,1000);tick(g,2);assert.equal(t.hp,1000);tick(g);assert.equal(t.hp,1000-g.player.attackDamage);tick(g,20);assert.equal(t.hp,1000-g.player.attackDamage);});
test('cancel, dead target, range escape and grab prevent ghost impacts',()=>{for(const change of [(g)=>clearOrders(g),(_g,t)=>{t.hp=0;},(_g,t)=>{t.x=900;},g=>tryGrab(g)]){const [g,t]=scene();attackTarget(g,t);change(g,t);const hp=t.hp;tick(g,12);assert.equal(t.hp,hp);}});
test('Q spends once at start and tracks current aim before its first damage tick',()=>{const [g,t]=scene();assert.equal(startDemonSkill(g,'q',{x:900,y:500}),true);assert.equal(t.hp,1000);assert.equal(g.player.stamina,92);tick(g,3);assert.equal(t.hp,1000);tick(g,4,{aimX:0,aimY:500});assert.equal(t.hp,1000);assert.ok(g.player.stamina<92);});
test('pause and hit-stop freeze an unresolved attack; resuming does not duplicate damage',()=>{const [g,t]=scene();attackTarget(g,t);g.phase='paused';tick(g,10);assert.equal(t.hp,1000);g.phase='active';g.hitStop=.1;tick(g,2);assert.equal(g.player.attackAction.elapsed,0);tick(g,3);assert.equal(t.hp,1000-g.player.attackDamage);tick(g,20);assert.equal(t.hp,1000-g.player.attackDamage);});
test('orders and movement cancel anticipation; a queued R cannot replace a pending basic impact',()=>{for(const input of [{moveX:1},{block:true},{cancelOrders:true},{commands:[{type:'move',x:280,y:500}]}]){const [g,t]=scene();attackTarget(g,t);tick(g,1,input);tick(g,10);assert.equal(t.hp,1000);}const [g,t]=scene();attackTarget(g,t);tick(g,1,{commands:[{type:'skill',skill:'r',x:900,y:500}]});assert.equal(g.player.beamCooldown,0);assert.equal(g.player.stamina,100);});
test('a discrete Q queued during actual impact hit-stop survives once into recovery',()=>{const [g,t]=scene();attackTarget(g,t);tick(g,3);assert.ok(g.hitStop>0);const afterBasic=t.hp;tick(g,1,{commands:[{type:'skill',skill:'q',x:900,y:500}]});assert.equal(g.player.fireCooldown,0);tick(g,1);assert.equal(g.player.fireCooldown,4);tick(g,10);assert.equal(t.hp,afterBasic-g.player.attackDamage*.6);assert.ok(g.player.stamina>60);});
test('clearOrders discards frozen commands and cancels unresolved impact on pause/home',()=>{const [g,t]=scene();g.hitStop=.1;tick(g,1,{commands:[{type:'skill',skill:'r',x:900,y:500}]});clearOrders(g);tick(g,20);assert.equal(t.hp,1000);assert.equal(g.player.beamCooldown,0);attackTarget(g,t);clearOrders(g);g.phase='paused';tick(g,10);g.phase='active';tick(g,20);assert.equal(t.hp,1000);});
function dashImpact(){
 const [g,t]=scene();t.x=240;
 const front={...t,id:'front',x:430,hp:1000};g.enemies.push(front);
 tick(g,1,{commands:[{type:'skill',skill:'e',x:900,y:500}]});
 for(let i=0;i<8&&!g.hitStop;i++)tick(g);
 assert.ok(g.hitStop>0);assert.ok(g.player.dashTime>0);return [g,t,front];
}
test('Q buffered during real E contact hit-stop waits for dash completion and casts once',()=>{
 const [g,t,front]=dashImpact(),contactHp=t.hp;
 tick(g,1,{commands:[{type:'skill',skill:'q',x:900,y:500}]});
 tick(g);assert.ok(g.player.dashTime>0);assert.equal(g.player.fireCooldown,0);
 assert.equal(g.bufferedInput?.commands.length,1);
 let casts=0;for(let i=0;i<200;i++){const before=g.player.fireCooldown;tick(g);if(before===0&&g.player.fireCooldown>0)casts++;}
 assert.equal(casts,1);assert.equal(front.hp,1000-g.player.attackDamage*.6);assert.equal(t.hp,contactHp);assert.equal(g.bufferedInput,null);
});
test('a deferred E-contact skill is discarded by cancellation, another order, dodge or grab',()=>{
 for(const cancel of [g=>clearOrders(g),g=>tick(g,1,{cancelOrders:true}),g=>tick(g,1,{moveX:-1}),g=>tick(g,1,{block:true}),g=>tick(g,1,{commands:[{type:'move',x:280,y:500}]}),g=>tick(g,1,{dodge:true}),g=>{g.player.invulnerable=0;assert.equal(tryGrab(g),true);}]){
  const [g,,front]=dashImpact();tick(g,1,{commands:[{type:'skill',skill:'q',x:900,y:500}]});tick(g);
  assert.equal(g.bufferedInput?.commands.length,1);cancel(g);tick(g,80);
  assert.equal(g.player.fireCooldown,0);assert.equal(front.hp,1000);assert.equal(g.bufferedInput,null);
 }
});
test('deferred directional R survives loss of the old hovered target and fires once toward ground',()=>{
 const [g,t,,]=dashImpact();tick(g,1,{commands:[{type:'skill',skill:'r',x:900,y:500}]});tick(g);
 assert.equal(g.bufferedInput?.commands.length,1);t.hp=0;tick(g,60);assert.ok(g.player.beamCooldown>0);assert.equal(g.bufferedInput,null);assert.equal(g.player.beam,null);
});
test('E-contact freeze keeps at most16 queued commands and never repeats a cooldown-blocked E',()=>{
 const [g,,front]=dashImpact();
 tick(g,1,{commands:Array.from({length:40},()=>({type:'skill',skill:'q',x:900,y:500}))});
 assert.equal(g.bufferedInput.commands.length,16);tick(g);assert.equal(g.bufferedInput.commands.length,16);
 tick(g,200);assert.equal(front.hp,1000-g.player.attackDamage*.6);assert.equal(g.bufferedInput,null);
 const [again]=dashImpact();const before=again.player.stamina;
 tick(again,1,{commands:[{type:'skill',skill:'e',x:900,y:500}]});tick(again);assert.equal(again.bufferedInput,null);
 assert.ok(again.player.stamina>=before);tick(again,150);assert.ok(again.player.x<350);
});
