import {loadActionSheet} from './loadActionSheet.js';
import {drawInfernalEffect,drawSkillAura,drawHeroTelegraph} from './infernalEffects.js';
import {drawEffect} from './effects.js';
import {pickScreenTarget,targetPolygons} from './targetSelection.js';
import {isWalkable} from '../game/pathfinding.js';
import {polygon,tile,prism,tree} from './pixelArt.js';
import {drawBuilding} from './drawBuilding.js';
import {drawPlayer,drawEnemy} from './drawActors.js';
export function createRenderer(canvas) {
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 const sprite=new Image();sprite.src='/public/assets/demon-sheet.png';
 const evolved=new Image();evolved.src='/public/assets/demon-evolved-sheet.png';
 const sheets={base:loadActionSheet('/public/assets/demon-skills.png'),evolved:loadActionSheet('/public/assets/demon-skills-evolved.png'),hero:loadActionSheet('/public/assets/hero-actions.png')};
 let camera={x:220,y:610};let lastProject,lastGame,hoverId=null,shakeX=0,shakeY=0,rejectedUntil=0;
 const projectFor=(center,width,height,zoom=1)=>{
  const cx=(center.x-center.y)*.78,cy=(center.x+center.y)*.4;
  return (x,y,z=0)=>[(x-y)*.78*zoom-cx*zoom+width*.5,(x+y)*.4*zoom-cy*zoom+height*.60-z*zoom];
 };
 function drawScene(target,g,center,width,height,zoom=1) {
  target.imageSmoothingEnabled=false;const p=projectFor(center,width,height,zoom);target.fillStyle='#244d61';target.fillRect(0,0,width,height);
  // Animated estuary is drawn as discrete pixels, with a stable seeded pattern.
  for(let i=0;i<240;i++){const x=(i*89+Math.floor(g.elapsed*5)*(i%3?1:-1))%(width+80)-40,y=(i*47)%(height+20);target.fillStyle=i%4?'#39738a55':'#78a6a24d';target.fillRect(x,y,6+i%4*4,2);}
  tile(target,p,555,530,1180,1070,'#203d4e','#1a3445');tile(target,p,550,500,1120,1020,'#658879','#819f85');
  // Raised granite quay, sandy sidewalks, and two broad crossing boulevards.
  polygon(target,[p(-10,1010),p(1110,1010),p(1110,1010,-22),p(-10,1010,-22)],'#526d70','#314e5b');
  polygon(target,[p(1110,-10),p(1110,1010),p(1110,1010,-22),p(1110,-10,-22)],'#3c5b65','#294753');
  tile(target,p,550,500,1080,980,'#b9b69b');
  for(const x of [90,540,975])tile(target,p,x,500,76,980,'#6f7d7a');
  for(const y of [95,500,920])tile(target,p,550,y,1080,76,'#6f7d7a');
  for(const x of [90,540,975])for(let y=130;y<920;y+=55)tile(target,p,x,y,3,22,'#c6c6a265');
  for(const y of [95,500,920])for(let x=125;x<970;x+=55)tile(target,p,x,y,22,3,'#c6c6a265');
  for(const x of [90,540,975])for(const y of [95,500,920])for(let i=-2;i<=2;i++){tile(target,p,x+i*11,y+46,6,16,'#d7d3b0');tile(target,p,x+46,y+i*11,16,6,'#d7d3b0');}
  // Thin paving grid and small plazas add texture without interfering with moving actors.
  for(let i=0;i<90;i++){const x=140+(i*83)%800,y=150+(i*147)%710;tile(target,p,x,y,3,2,i%3?'#a4a58b55':'#ece1bd66');}
  for(const b of g.buildings)tile(target,p,b.x,b.y,b.width+24,b.depth+24,'#d6ccb0','#adb39a');
  tile(target,p,360,620,170,90,'#759471','#aab190');tile(target,p,700,630,110,170,'#718e70','#aeb696');
  // Fountain beside the central square.
  prism(target,p,375,620,42,42,8,['#b9c5b2','#899b92','#738a8a']);prism(target,p,375,620,32,32,5,['#79b2b4','#5d929c','#4e838e'],7);prism(target,p,375,620,8,8,25,['#d6d3b5','#a7b8a7','#8da3a1'],10);
  const objects=[];
  for(const b of g.buildings)objects.push({depth:b.x+b.y,draw:()=>drawBuilding(target,p,b,g.elapsed)});
  for(let i=0;i<30;i++){const x=[143,490,603,1028][i%4],y=145+Math.floor(i/4)*110;objects.push({depth:x+y,draw:()=>tree(target,p,x,y,i)});}
  for(const [x,y] of [[320,630],[431,630],[665,575],[735,680],[200,870],[820,100],[620,100]])objects.push({depth:x+y,draw:()=>tree(target,p,x,y,x)});
  for(const e of g.enemies)if(e.active&&e.kind==='hero')drawHeroTelegraph(target,p,e);
  for(const e of g.effects)if(e.layer==='back'){if(e.kind==='dash')drawEffect(target,p,e);else drawInfernalEffect(target,p,e,sheets);}
  for(const e of g.enemies)objects.push({depth:e.x+e.y+(e.kind==='helicopter'?1000:0),draw:()=>drawEnemy(target,p,e,g.elapsed,sheets.hero)});
  objects.push({depth:g.player.x+g.player.y,draw:()=>drawPlayer(target,p,g.player,g.elapsed,sprite,evolved,sheets)});
  objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
  for(const bullet of g.projectiles){const [x,y]=p(bullet.x,bullet.y,bullet.kind==='helicopter'?18:10);target.fillStyle='#623e34';target.fillRect(x-5,y-4,10,8);target.fillStyle='#ffda8d';target.fillRect(x-3,y-2,6,4);target.fillStyle='#ffae5c99';target.fillRect(x-9,y-1,5,3);}
  drawSkillAura(target,p,g,sheets);
  for(const e of g.effects)if(e.layer!=='back'){if(['fire','beam','afterimage','hero-trail','hero-hit'].includes(e.kind))drawInfernalEffect(target,p,e,sheets);else drawEffect(target,p,e);}
  // Ground-facing attack direction is always visible and uses the same projection as pointer input.
  const pl=g.player,dist=Math.hypot(pl.aimX-pl.x,pl.aimY-pl.y)||1,range=pl.attackRange;
  const [ax,ay]=p(pl.x+(pl.aimX-pl.x)/dist*range,pl.y+(pl.aimY-pl.y)/dist*range,3);
  target.strokeStyle='#f6e8bb88';target.lineWidth=1;target.beginPath();target.moveTo(ax-5,ay);target.lineTo(ax+5,ay);target.moveTo(ax,ay-4);target.lineTo(ax,ay+4);target.stroke();
  // Gentle edge vignette anchors the scene without obscuring its pixel detail.
  const shade=target.createRadialGradient(width*.5,height*.5,height*.2,width*.5,height*.5,width*.7);shade.addColorStop(0,'#142d3700');shade.addColorStop(1,'#142d3745');target.fillStyle=shade;target.fillRect(0,0,width,height);
  return p;
 }
 function render(g){
  lastGame=g;camera={x:g.player.x,y:g.player.y};ctx.save();
  shakeX=g.shake>0&&g.phase==='active'?Math.sin(performance.now()*.075)*g.shake*17:0;shakeY=g.shake>0&&g.phase==='active'?Math.cos(performance.now()*.083)*g.shake*11:0;ctx.translate(shakeX,shakeY);
  lastProject=drawScene(ctx,g,camera,canvas.width,canvas.height);
  if(g.order?.type==='move'){const [x,y]=lastProject(g.order.x,g.order.y,2);ctx.strokeStyle='#b5f59a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,13,7,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-18,y);ctx.lineTo(x+18,y);ctx.moveTo(x,y-10);ctx.lineTo(x,y+10);ctx.stroke();}
  const selected=[...g.buildings,...g.enemies].find(e=>e.id===hoverId&&e.hp>0&&e.active!==false);
  if(selected){ctx.strokeStyle='#ffe396';ctx.lineWidth=1.5;for(const polygon of targetPolygons(selected,lastProject,g.elapsed,sheets.hero.atlas)){ctx.beginPath();ctx.moveTo(...polygon[0]);for(const point of polygon.slice(1))ctx.lineTo(...point);ctx.closePath();ctx.stroke();}const [x,y]=lastProject(selected.x,selected.y,selected.height??90);ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffe6a8';ctx.fillText('우클릭 / A 자동 공격',x,y-14);}
  ctx.restore();
  if(g.feedback||performance.now()<rejectedUntil){ctx.fillStyle='#203b41ee';ctx.fillRect(canvas.width/2-160,canvas.height-49,320,29);ctx.fillStyle='#ffe0a5';ctx.font='12px system-ui';ctx.textAlign='center';ctx.fillText(g.feedback?.text??'땅이나 살아 있는 대상을 선택하세요.',canvas.width/2,canvas.height-30);}
  drawMinimap(ctx,g,canvas.width,canvas.height);
  drawObjectiveDirection(ctx,g,lastProject,canvas.width,canvas.height);
 }
 function screenToWorld(clientX,clientY){const rect=canvas.getBoundingClientRect();const sx=(clientX-rect.left)*canvas.width/rect.width-shakeX,sy=(clientY-rect.top)*canvas.height/rect.height-shakeY;
  const a=(sx-canvas.width*.5)/.78+(camera.x-camera.y),b=(sy-canvas.height*.60)/.4+(camera.x+camera.y);return {x:(a+b)/2,y:(b-a)/2};}
 function captureEvent(event,game){const shot=document.createElement('canvas');shot.width=480;shot.height=288;const shotctx=shot.getContext('2d');const state=event.snapshot||game;
  // Frame the actual event site; snapshots are immutable and never reuse the live frame.
  drawScene(shotctx,state,{x:event.x,y:event.y},480,288,.85);shotctx.fillStyle='#122734cc';shotctx.fillRect(10,10,104,22);shotctx.fillStyle='#f2dfb7';shotctx.font='bold 10px monospace';shotctx.fillText(`CAM 04 · ${formatTime(event.time)}`,18,25);return shot.toDataURL('image/png');}
 function pickTarget(clientX,clientY,game=lastGame){
  if(!game)return null;const rect=canvas.getBoundingClientRect();if(clientX<rect.left||clientY<rect.top||clientX>rect.left+rect.width||clientY>rect.top+rect.height)return null;
  const p=projectFor(camera,canvas.width,canvas.height);return pickScreenTarget(game,p,(clientX-rect.left)*canvas.width/rect.width-shakeX,(clientY-rect.top)*canvas.height/rect.height-shakeY,sheets.hero.atlas);
 }
 function clientToGround(clientX,clientY,game=lastGame){
  if(!game)return null;const rect=canvas.getBoundingClientRect();if(clientX<rect.left||clientY<rect.top||clientX>rect.left+rect.width||clientY>rect.top+rect.height||pickTarget(clientX,clientY,game))return null;
  const point=screenToWorld(clientX,clientY);return isWalkable(game,point.x,point.y)?point:null;
 }
 function captureScene(game){const shot=document.createElement('canvas');shot.width=800;shot.height=460;drawScene(shot.getContext('2d'),game,{x:550,y:500},800,460,.59);return shot.toDataURL('image/png');}
 return {ready:Promise.all(Object.values(sheets).map(image=>image.ready)),captureScene,render,screenToWorld,clientToGround,pickTarget,captureEvent,setHover:id=>{hoverId=id},rejectPointer:()=>{rejectedUntil=performance.now()+1400}};
}
function drawMinimap(c,g,w,h){const x=w-164,y=h-125;c.fillStyle='#152f35ed';c.fillRect(x,y,146,106);c.strokeStyle='#899d8266';c.strokeRect(x+.5,y+.5,146,106);c.font='9px monospace';c.textAlign='left';c.fillStyle='#b6c5ac';c.fillText('PORTO / 작전 지도',x+10,y+14);
 const point=(wx,wy)=>[x+12+wx/1100*120,y+23+wy/1000*71];
 c.strokeStyle='#647c6a';c.lineWidth=1;for(const yy of [95,500,920]){const a=point(50,yy),b=point(1050,yy);c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();}
 for(const b of g.buildings){const [px,py]=point(b.x,b.y);c.fillStyle=b.hp<=0?'#54685e':b.landmark?'#f0c57f':'#8c9b7e';c.fillRect(px-2,py-2,b.landmark?5:3,b.landmark?5:3);}
 const hero=g.enemies.find(e=>e.kind==='hero');if(hero.active&&hero.hp>0){const [hx,hy]=point(hero.x,hero.y);c.fillStyle='#8edee4';c.fillRect(hx-2,hy-2,4,4);}
 const [px,py]=point(g.player.x,g.player.y);c.fillStyle='#cf91e8';c.fillRect(px-3,py-3,6,6);c.strokeStyle='#f8dfa7';c.strokeRect(px-4,py-4,8,8);
}
function drawObjectiveDirection(c,g,p,w,h){const alive=g.buildings.filter(b=>b.landmark&&b.hp>0).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y));const target=alive[0];if(!target)return;const [tx,ty]=p(target.x,target.y,target.height+35);if(tx>80&&tx<w-80&&ty>50&&ty<h-120)return;
 const dx=tx-w/2,dy=ty-h/2,scale=Math.min((w/2-90)/Math.abs(dx||1),(h/2-70)/Math.abs(dy||1)),x=w/2+dx*scale,y=h/2+dy*scale;
 c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));polygon(c,[[10,0],[-6,-6],[-6,6]],'#f3d196','#253e42');c.restore();c.font='bold 11px system-ui';c.textAlign='center';c.fillStyle='#ffe5b1';c.fillText(target.name,x,y+24);
}
function formatTime(t){return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
