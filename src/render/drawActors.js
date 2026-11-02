import {actorBounds,spriteLayout} from './actorGeometry.js';
import {prism,tile,polygon,fallbackDemon} from './pixelArt.js';
export function drawPlayer(ctx,project,p,time,sprite,evolved,sheets={}) {
 const skill=p.rank>1?sheets.evolved:sheets.base,[x,y]=project(p.x,p.y),bounds=actorBounds(p,project,time,skill?.atlas),{size,pose}=bounds;
 ctx.save();ctx.globalAlpha=p.invulnerable>0?.7+Math.sin(time*45)*.25:1;
 ctx.strokeStyle=p.grabbed>0?'#ff767b':p.rank===3?'#edbd66':'#bf86e8';ctx.lineWidth=2;
 ctx.beginPath();ctx.ellipse(x,y+1,size*.34,size*.125,0,0,Math.PI*2);ctx.stroke();
 ctx.translate(bounds.x,bounds.y);ctx.rotate(pose.tilt);ctx.scale(p.facing*pose.scaleX,pose.scaleY);
 if(pose.frame!==null&&skill?.complete&&skill.naturalWidth){drawCell(ctx,skill,pose.frame,size);}
 else if(p.rank>1&&evolved.complete&&evolved.naturalWidth){const sw=evolved.naturalWidth/2,sh=evolved.naturalHeight/2,frame=(p.rank-2)*2+(p.attackAnimation>0?1:0);ctx.drawImage(evolved,frame%2*sw,Math.floor(frame/2)*sh,sw,sh,-size*.5,-size*.89,size,size);}
 else if(sprite.complete&&sprite.naturalWidth){const frame=p.hitFlash>0||p.grabbed>0?3:p.attackAnimation>0?2:p.moving&&Math.sin(time*13)>0?1:0,sw=sprite.naturalWidth/2,sh=sprite.naturalHeight/2;ctx.drawImage(sprite,frame%2*sw,Math.floor(frame/2)*sh,sw,sh,-size*.5,-size*.89,size,size);}
 else fallbackDemon(ctx,0,0,size*.9,1,time);
 ctx.restore();
 polygon(ctx,[[x,y-size-11],[x-4,y-size-18],[x+4,y-size-18]],'#daf6a2');
}
export function drawCell(ctx,image,frame,size){const {sx,sy,sw,sh,dx,dy,dw,dh}=spriteLayout(image,frame,size);ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);}
export function drawEnemy(ctx,project,e,time,heroSheet) {
 if(!e.active||e.hp<=0)return;
 const [x,y]=project(e.x,e.y);const flash=e.flash>0;
 if(e.kind==='tank'){
  tile(ctx,project,e.x,e.y,62,40,'#20373565');prism(ctx,project,e.x,e.y,57,35,10,['#293e35','#293931','#162c2c']);
  prism(ctx,project,e.x,e.y,49,30,15,flash?['#ffebc3','#ecd0ac','#c2ad86']:['#849263','#626f4e','#3c5745'],7);prism(ctx,project,e.x,e.y,26,24,12,['#a4ab71','#7f8f5d','#526b4e'],22);
  ctx.strokeStyle='#243a32';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x+3,y-31);ctx.lineTo(x+30,y-37);ctx.stroke();ctx.strokeStyle='#8e9b6f';ctx.lineWidth=3;ctx.stroke();
  for(let i=-21;i<25;i+=10){ctx.fillStyle='#aab384';ctx.fillRect(x+i,y+1,5,4);}
 }else if(e.kind==='helicopter'){
  tile(ctx,project,e.x,e.y,65,30,'#1b42423f');const yy=y-84+Math.sin(time*4)*3;
  ctx.fillStyle='#263e3c';ctx.fillRect(x-28,yy-13,45,25);ctx.fillStyle=flash?'#f8dca9':'#809271';ctx.fillRect(x-24,yy-14,35,19);ctx.fillStyle='#9fc3bd';ctx.fillRect(x+1,yy-11,12,10);ctx.fillStyle='#586d52';ctx.fillRect(x-50,yy-8,26,6);ctx.fillRect(x-50,yy-17,7,17);ctx.fillStyle='#c7cba1';ctx.fillRect(x-47,yy-15,3,7);
  ctx.strokeStyle='#263a36';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-21,yy+14);ctx.lineTo(x+23,yy+14);ctx.moveTo(x-14,yy+6);ctx.lineTo(x-15,yy+14);ctx.moveTo(x+15,yy+6);ctx.lineTo(x+17,yy+14);ctx.stroke();ctx.strokeStyle='#d4dcba';ctx.lineWidth=2;ctx.beginPath();const rotor=Math.sin(time*45)*45;ctx.moveTo(x-rotor,yy-21);ctx.lineTo(x+rotor,yy-21);ctx.stroke();
 }else{
  const bounds=actorBounds(e,project,time,heroSheet?.atlas),{pose,size}=bounds;
  ctx.fillStyle='#183c483f';ctx.beginPath();ctx.ellipse(x,y+2,22,8,0,0,7);ctx.fill();
  ctx.save();ctx.translate(bounds.x,bounds.y);ctx.rotate(pose.tilt);ctx.scale(pose.facing*pose.scaleX,pose.scaleY);
  if(heroSheet?.complete&&heroSheet.naturalWidth)drawCell(ctx,heroSheet,pose.frame,size);
  else{
   const reach=pose.frame===3?31:pose.frame===6?21:12,cy=-30;
   polygon(ctx,[[-7,cy-25],[-31,cy+12],[-7,cy+1],[4,cy+20],[7,cy-22]],e.awakened?'#eac575':'#e78b71','#253d4c');
   ctx.fillStyle='#183648';ctx.fillRect(-8,cy-27,17,13);ctx.fillRect(-10,cy-13,20,22);ctx.fillRect(-8,cy+9,6,16);ctx.fillRect(5,cy+9,6,16);ctx.fillRect(-18,cy-8,10,20);ctx.fillRect(8,cy-11,reach,9);
   ctx.fillStyle=flash?'#fff1bf':'#65d6df';ctx.fillRect(-6,cy-11,12,19);ctx.fillRect(9,cy-10,reach,6);ctx.fillStyle='#f3d5ac';ctx.fillRect(-4,cy-25,10,9);ctx.fillStyle='#f2ce6f';ctx.fillRect(-1,cy-5,5,6);
  }
  ctx.restore();ctx.textAlign='center';ctx.font='bold 10px system-ui';ctx.fillStyle=e.awakened?'#ffe2a1':'#c9f0ed';ctx.fillText(e.awakened?'각성 · 루멘':'수호자 · 루멘',x,bounds.top-6);
 }

 if(e.hp<e.maxHp){const yy=y-(e.kind==='helicopter'?115:e.kind==='hero'?90:50);ctx.fillStyle='#172c33';ctx.fillRect(x-22,yy,44,4);ctx.fillStyle=e.kind==='hero'?'#79d2d7':'#d8ae77';ctx.fillRect(x-21,yy+1,42*e.hp/e.maxHp,2);}
}
