import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/game/createGame.js';
import {updateGame} from '../src/game/updateGame.js';
const scene=()=>{const g=createGame();g.buildings=g.buildings.filter(b=>b.landmark);g.enemies=[];g.player.x=150;g.player.y=500;return g;};
const tick=(g,n=1,input={})=>{for(let i=0;i<n;i++)updateGame(g,i?{}:input,.05);};
const entity=(id,x,y)=>({id,x,y,hp:1000,maxHp:1000,radius:20,active:true,flash:0,cooldown:999,kind:'tank'});
test('movement faces screen left against a right cursor and retains facing while idle',()=>{const g=scene();updateGame(g,{moveX:-1,moveY:1,aimX:999,aimY:0},.05);assert.equal(g.player.facing,-1);updateGame(g,{aimX:999,aimY:0},.05);assert.equal(g.player.facing,-1);});
test('ground order arrives and stops; invalid ground preserves valid order',()=>{const g=scene();tick(g,1,{commands:[{type:'move',x:280,y:500}]});assert.equal(g.order?.type,'move');tick(g,1,{commands:[{type:'move',x:-80,y:500}]});assert.equal(g.order?.x,280);tick(g,70);assert.ok(Math.hypot(g.player.x-280,g.player.y-500)<3);assert.equal(g.order,null);const x=g.player.x;tick(g,5);assert.equal(g.player.x,x);});
test('move order routes around solid building without entering its footprint',()=>{const g=scene();g.buildings.push({...entity('wall',300,500),radius:65});tick(g,1,{commands:[{type:'move',x:470,y:500}]});for(let i=0;i<160;i++){tick(g);assert.ok(Math.hypot(g.player.x-300,g.player.y-500)>=76);}assert.ok(Math.hypot(g.player.x-470,g.player.y-500)<3);});
test('attack order approaches only selected target, follows it, stops in range and cancels on death',()=>{const g=scene(),a=entity('a',500,500),b=entity('b',500,520);g.enemies=[a,b];tick(g,1,{commands:[{type:'attack',targetId:'a'}]});tick(g,70);assert.ok(a.hp<1000);assert.equal(b.hp,1000);assert.ok(Math.hypot(g.player.x-a.x,g.player.y-a.y)<=g.player.attackRange+a.radius);a.x=700;tick(g,50);assert.ok(g.player.x>500);a.hp=0;tick(g);assert.equal(g.order,null);});
test('manual move, guard and cancellation clear persistent orders',()=>{for(const cancel of [{moveX:-1,moveY:1},{block:true},{cancelOrders:true}]){const g=scene();tick(g,1,{commands:[{type:'move',x:700,y:500}]});tick(g,1,cancel);assert.equal(g.order,null);}});
test('Q breath follows live cursor and damages only front after preparation',()=>{const g=scene(),front=entity('front',250,500),back=entity('back',80,500);g.enemies=[front,back];tick(g,1,{commands:[{type:'skill',skill:'q',x:500,y:500}]});assert.equal(front.hp,1000);assert.equal(g.player.fireCooldown,4);tick(g,5,{aimX:500,aimY:500,fireHeld:true});assert.ok(front.hp<1000);assert.equal(back.hp,1000);assert.ok(g.player.fireCooldown>3);});
test('E damages each crossed target once and never damages behind or off path',()=>{const g=scene(),front=entity('front',255,500),back=entity('back',80,500),side=entity('side',170,610);g.enemies=[front,back,side];tick(g,1,{commands:[{type:'skill',skill:'e',x:900,y:500}]});tick(g,10,{aimX:0,aimY:900});assert.equal(front.hp,1000-g.player.attackDamage*1.7);assert.equal(back.hp,1000);assert.equal(side.hp,1000);assert.ok(g.player.x>280);});
test('R directional beam needs no hovered target and hits multiple in-path entities once',()=>{const g=scene(),a=entity('a',220,500),b=entity('b',600,520),off=entity('off',600,620);g.enemies=[a,b,off];tick(g,1,{commands:[{type:'skill',skill:'r',x:900,y:500}]});assert.equal(a.hp,1000);assert.equal(g.player.beamCooldown,12);tick(g,12);assert.equal(a.hp,1000-g.player.attackDamage*9);assert.equal(b.hp,a.hp);assert.equal(off.hp,1000);tick(g,15);assert.equal(a.hp,b.hp);});
test('attack order stops at the selected building range until it dies and preserves landmark events',()=>{const g=scene(),target=g.buildings[0];target.hp=104;g.player.x=target.x-230;g.player.y=target.y;tick(g,1,{commands:[{type:'attack',targetId:target.id}]});tick(g,70);assert.equal(target.hp,0);assert.equal(g.order,null);assert.equal(g.events.filter(e=>e.type==='landmark-destroyed').length,1);assert.equal(g.buildings[1].hp,g.buildings[1].maxHp);});
test('unreachable move leaves previous reachable order intact',()=>{const g=scene();for(let y=70;y<=970;y+=100)g.buildings.push({...entity(`wall-${y}`,350,y),radius:65});tick(g,1,{commands:[{type:'move',x:220,y:600}]});tick(g,1,{commands:[{type:'move',x:650,y:500}]});assert.equal(g.order.x,220);assert.equal(g.order.y,600);assert.ok(g.feedback);});
for(const dt of [1/120,1/60,1/30,1/20])test(`E reaches actual solid building contact and hits once at dt=${dt}`,()=>{
 for(const startX of [70,83,110]){
 const g=createGame();g.enemies=[];g.player.x=startX;g.player.y=760;const b=g.buildings.find(e=>e.id==='house-7');
 // Behind and off-path bodies must survive the real dash into the solid house.
 const behind=entity('behind',30,760),offPath=entity('off-path',155,835),beyond=entity('beyond',260,760);g.enemies=[behind,offPath,beyond];
 updateGame(g,{commands:[{type:'skill',skill:'e',x:390,y:760}]},dt);
 for(let i=0;i<Math.ceil(.6/dt);i++){updateGame(g,{},dt);assert.ok(Math.hypot(g.player.x-b.x,g.player.y-b.y)>=b.radius+g.player.radius*.6+1-1e-5);}
 assert.equal(b.hp,180-g.player.attackDamage*1.7);assert.ok(Math.abs(g.player.x-(b.x-b.radius-g.player.radius*.6-1))<.01);assert.equal(behind.hp,1000);assert.equal(offPath.hp,1000);assert.equal(beyond.hp,1000);
 }
});
test('E contact collapse opens the remaining dash path without repeating damage',()=>{
 const g=createGame();g.enemies=[];g.player.x=110;g.player.y=760;const b=g.buildings.find(e=>e.id==='house-7');b.hp=50;
 updateGame(g,{commands:[{type:'skill',skill:'e',x:390,y:760}]},1/60);for(let i=0;i<35;i++)updateGame(g,{},1/60);
 assert.equal(b.hp,0);assert.ok(g.player.x>b.x+b.radius);assert.equal(g.effects.filter(e=>e.kind==='explosion').length,1);
});
