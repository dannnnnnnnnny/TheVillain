import {heroGrabVolume} from '../game/heroGrabVolume.js';
import {particleAppearance} from '../vendor/littleJSParticles.js';
import {actorBounds,demonMouthPoint} from './actorGeometry.js';
import {drawCell} from './drawActors.js';
import {polygon} from './pixelArt.js';
const TAU=Math.PI*2;
function ray(c,points,color,width){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
function pixel(c,x,y,size,color){c.fillStyle=color;c.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,Math.ceil(size/2)*2,Math.ceil(size/2)*2);}
export function drawInfernalEffect(c,project,e,sheets){
 const t=Math.min(1,Math.max(0,1-e.life/e.maxLife)),height=e.height??43,reference=project(e.x,e.y,height),atlas=(e.rank>1?sheets.evolved:sheets.base)?.atlas;
 const actor={x:e.x,y:e.y,rank:e.rank??1,facing:e.facing??1,...(e.kind==='fire'?{fireBreath:{phase:'breath',elapsed:0}}:{beam:{phase:'fire',elapsed:0}})};
 const [x,y]=e.kind==='fire'||e.kind==='beam'?demonMouthPoint(actor,project,e.seed??0,atlas):reference;
 const effectPoint=(distance,angle,z=0)=>{const point=project(e.x+Math.cos(angle)*distance,e.y+Math.sin(angle)*distance,height+z),weight=1-distance/(e.kind==='beam'?760:240);return [point[0]+(x-reference[0])*weight,point[1]+(y-reference[1])*weight];};
 c.save();c.globalCompositeOperation='source-over';
 if(e.kind==='fire'){
  const direction=Math.atan2(e.dy,e.dx),core=effectPoint(38,direction);
  c.globalAlpha=(1-t)*.7;ray(c,[[x,y],core],'#d94412',15);ray(c,[[x,y],core],'#ff9b26',9);
  c.globalAlpha=(1-t)*.3;ray(c,[[x,y],core],'#ffe58a',3);
  // Colored, pointed flame tongues stay readable when several emitted groups overlap.
  for(let i=0;i<14;i++){
   const phase=(i*.137+(e.seed??0)*1.7)%1,progress=Math.min(.999,(phase+t*.7)%1),distance=12+progress*210,angle=direction+Math.sin(i*12.3)*.4;
   const [px,py]=effectPoint(distance,angle,(1-progress)*6),[fx,fy]=effectPoint(distance+10,angle,(1-progress)*6),length=Math.hypot(fx-px,fy-py)||1,ux=(fx-px)/length,uy=(fy-py)/length;
   const appearance=particleAppearance(progress,7,17,.85,.15,.12,230,.07),width=appearance.size*.68,reach=appearance.length*1.4;
   const tongue=(scale,color)=>polygon(c,[[-.55,-.35],[-.12,-.65],[.42,-.3],[1,0],[.38,.3],[-.12,.6],[-.55,.3]].map(([along,side])=>[Math.round((px+ux*reach*along*scale-uy*width*side*scale)/2)*2,Math.round((py+uy*reach*along*scale+ux*width*side*scale)/2)*2]),color);
   c.globalAlpha=appearance.alpha*(1-t)*.78;tongue(1.2,i%3?'#d94b18':'#b93416');tongue(.86,i%2?'#ff8b24':'#f6aa2d');
   if(i%3===0){c.globalAlpha*=.7;tongue(.48,'#ffdc70');}
   if(i%7===0){c.globalAlpha=appearance.alpha*(1-t)*.45;pixel(c,px-uy*width,py+ux*width,3,'#9850cd');}
   if(i%5===0){c.globalCompositeOperation='lighter';c.globalAlpha=appearance.alpha*(1-t)*.15;pixel(c,px,py,3,'#ffe8aa');c.globalCompositeOperation='source-over';}
  }
 }else if(e.kind==='beam'){
  c.globalCompositeOperation='lighter';const end=effectPoint(760,Math.atan2(e.dy,e.dx));c.globalAlpha=Math.sin(Math.PI*Math.max(.15,1-t));
  ray(c,[[x,y],end],'#842bdb',64*(1-t*.5));ray(c,[[x,y],end],'#ff5cc8',39*(1-t*.4));ray(c,[[x,y],end],'#ffb65e',21);ray(c,[[x,y],end],'#fffce4',11);
  for(let side of [-1,1]){const points=[];for(let i=0;i<=20;i++){const d=i/20*760,z=side*(18+(i%2)*15);points.push(effectPoint(d,Math.atan2(e.dy,e.dx)+Math.sin(i*4+t*15)*.015,z));}ray(c,points,'#dfb5ff',2);}
  for(let i=0;i<30;i++){const d=i/30*760,[px,py]=effectPoint(d,Math.atan2(e.dy,e.dx));pixel(c,px+Math.sin(i*7)*13,py+Math.cos(i*9)*23,3+i%3*2,i%2?'#fff4bf':'#ff88da');}
 }else if(e.kind==='afterimage'||e.kind==='hero-trail'){
  const hero=e.kind==='hero-trail',sheet=hero?sheets.hero:e.rank>1?sheets.evolved:sheets.base,size=hero?88:100+((e.rank??1)-1)*25;
  c.globalAlpha=(1-t)*.32;c.translate(...project(e.x,e.y));c.scale(e.facing??1,1);
  if(sheet?.complete&&sheet.naturalWidth)drawCell(c,sheet,5,size);
  c.globalCompositeOperation='lighter';
  for(let i=0;i<10;i++){const appearance=particleAppearance(t,6,1,1,0,.08,210,.05);c.globalAlpha=appearance.alpha*.35;pixel(c,-e.dx*i*4+(i%3)*4, -15+i%5*5,appearance.size,hero?(e.awakened?'#ffe68a':'#79f9ed'):(i%2?'#ffb53d':'#d16aff'));}
 }else if(e.kind==='hero-hit'){
  c.globalCompositeOperation='lighter';const end=project(e.x+e.dx*42,e.y+e.dy*42,30);c.globalAlpha=1-t;
  ray(c,[[x-8,y-10],end],'#21b6bd',20*(1-t)+2);ray(c,[[x,y],end],'#d4fff5',7*(1-t)+1);
  for(let i=0;i<10;i++)pixel(c,x+Math.cos(i*2.4)*t*35,y+Math.sin(i*2.4)*t*25,5*(1-t),'#adfff3');
 }
 c.restore();
}
export function drawSkillAura(c,project,g,sheets={}){
 const p=g.player,time=g.elapsed,atlas=(p.rank>1?sheets.evolved:sheets.base)?.atlas,pose=actorBounds(p,project,time,atlas),[x,y]=p.blocking?[pose.x,pose.y-pose.size*.35]:demonMouthPoint(p,project,time,atlas);
 c.save();c.globalCompositeOperation='lighter';
 if(p.blocking){
  c.globalCompositeOperation='source-over';
  for(let i=0;i<16;i++){const angle=i/16*TAU+time*2,px=x+Math.cos(angle)*pose.size*.4,py=y+Math.sin(angle)*pose.size*.3,height=12+(Math.sin(i*7+time*12)+1)*10;
   c.globalAlpha=.7;polygon(c,[[px-7,py+8],[px-9,py-4],[px-3,py-height],[px+1,py-9],[px+7,py-2],[px+6,py+8]],i%7===0?'#9c4dc3':i%2?'#ef671f':'#cf4217');c.globalAlpha=.55;pixel(c,px-2,py-5,5,'#ffc95e');
  }
  c.globalCompositeOperation='lighter';
 }
 if(p.beam?.phase==='charge'){
  const k=p.beam.elapsed/.55;
  for(let i=0;i<24;i++){const phase=(time*2+i*.173)%1,angle=i*2.4+time,dist=(1-phase)*(30+k*55),[cx,cy]=[x+Math.cos(angle)*dist,y+Math.sin(angle)*dist*.65];c.globalAlpha=phase;pixel(c,cx,cy,3+phase*5,i%3?'#ffb3e3':'#fff5be');ray(c,[[cx,cy],[x+Math.cos(angle)*dist*.6,y+Math.sin(angle)*dist*.4]],'#9b62ff',2);}
  c.globalAlpha=.75;pixel(c,x-7,y-5,14+k*8,'#d557f4');pixel(c,x-3,y-2,7+k*4,'#fff6d0');
 }
 if(p.fireBreath?.phase==='prepare'){c.globalAlpha=.7;for(let i=0;i<8;i++){const a=time*9+i*TAU/8,d=34*(1-p.fireBreath.elapsed/.16);pixel(c,x+Math.cos(a)*d,y+Math.sin(a)*d*.6,4,i%2?'#ff8a36':'#d96dff');}}
 for(const e of g.enemies){
  if(e.kind!=='hero'||!e.active||e.hp<=0)continue;
  const a=e.heroAction,[hx,hy]=project(e.x,e.y,38);
  if(e.awakened)for(let i=0;i<12;i++){const angle=i*TAU/12+time*2;pixel(c,hx+Math.cos(angle)*35,hy+Math.sin(angle)*40,3,i%2?'#ffe397':'#8bfff2');}
  if(a?.phase==='grab'&&p.grabbed>0){const [px,py]=project(p.x,p.y,40);for(let side of [-1,1]){ray(c,[[hx,hy+side*9],[hx+(px-hx)*.5,hy+(py-hy)*.5+side*16],[px,py+side*9]],'#e6b963',5);ray(c,[[hx,hy+side*9],[px,py+side*9]],'#b9fff4',2);}pixel(c,px+Math.sin(time*35)*7,py-9,9,'#fff1ba');}
 }
 c.restore();
}
export function drawHeroTelegraph(c,project,e){
 const a=e.heroAction;if(!a||a.phase!=='prepare'||e.hp<=0)return;
 const dx=a.dx,dy=a.dy,k=Math.min(1,a.elapsed/a.duration),[x,y]=project(e.x,e.y,2);c.save();c.lineWidth=2;
 if(e.mode==='charge'){
  const points=[project(e.x-dy*28,e.y+dx*28,2),project(e.x+dx*190-dy*28,e.y+dy*190+dx*28,2),project(e.x+dx*190+dy*28,e.y+dy*190-dx*28,2),project(e.x+dy*28,e.y-dx*28,2)];polygon(c,points,`rgba(55,230,220,${.12+k*.15})`,'#a7fff1');
  ray(c,[[x,y],project(e.x+dx*190,e.y+dy*190,2)],'#b9fff7',2+k*3);
 }else if(e.mode==='grab'){
  const volume=heroGrabVolume(e,a);polygon(c,volume.corners.map(([wx,wy])=>project(wx,wy,2)),`rgba(255,197,91,${.1+k*.15})`,'#ffd98b');
  c.strokeStyle='#ffd98b';for(const index of [1,2]){const [wx,wy]=volume.corners[index],end=project(wx,wy,5);ray(c,[[x,y],end],'#ffd98b',3);c.strokeRect(end[0]-6,end[1]-8,12,16);}
 }else{
  const points=[[x,y]];for(let i=0;i<=10;i++){const angle=Math.atan2(dy,dx)-.7+i*.14;points.push(project(e.x+Math.cos(angle)*105,e.y+Math.sin(angle)*105,2));}polygon(c,points,'#ef956b2f','#ffb79b');
 }
 c.font='bold 11px system-ui';c.textAlign='center';c.fillStyle='#fff4d1';c.fillText(e.mode==='grab'?'붙잡기 · E 연타':e.mode==='charge'?'비행 돌진':'주먹 타격',x,y-99);c.restore();
}
