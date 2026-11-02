import {attackPose} from './attackPose.js';
import {cubicOut,quadraticIn} from '../vendor/tweenEasing.js';
export function spriteCell(image,frame){
 const r=image.atlas?.frames[frame];if(r)return {sx:r.x,sy:r.y,sw:r.w,sh:r.h};
 const sw=image.naturalWidth/4,sh=image.naturalHeight/2;return {sx:(frame%4)*sw,sy:Math.floor(frame/4)*sh,sw,sh};
}
export function spriteLayout(image,frame,size){
 const source=spriteCell(image,frame),atlas=image.atlas;
 if(!atlas)return {...source,dx:-size*.5,dy:-size*.89,dw:size,dh:size};
 const unitW=atlas.width/atlas.columns,unitH=atlas.height/atlas.rows,scaleX=size/unitW,scaleY=size/unitH;
 return {...source,dx:(source.sx-(frame%atlas.columns+.5)*unitW)*scaleX,dy:-source.sh*scaleY,dw:source.sw*scaleX,dh:source.sh*scaleY};
}
export function actorPose(actor,time=0){
 const hero=actor.kind==='hero',a=actor.heroAction,b=actor.beam,q=actor.fireBreath;
 let frame=null,offsetX=0,offsetY=actor.moving?Math.sin(time*14)*2:Math.sin(time*3)*1.3,tilt=0,scaleX=1,scaleY=1,phase='idle';
 const facing=actor.facing??1;
 if(hero){
  frame=actor.moving?1:0;phase=a?.phase??(actor.moving?'fly':'idle');
  if(a?.phase==='prepare'){frame=actor.mode==='strike'?2:actor.mode==='charge'?4:6;const k=quadraticIn(Math.min(1,a.elapsed/a.duration));offsetX=-facing*8*k;offsetY+=3*k;tilt=-facing*.12*k;}
  if(a?.phase==='punch'){frame=3;offsetX=facing*12;tilt=facing*.2;}
  if(a?.phase==='charge'){frame=5;tilt=facing*.12;offsetY-=4;}
  if(a?.phase==='grab')frame=6;
  if(a?.phase==='hurt'||actor.flash>0){frame=7;offsetX=-facing*7;tilt=-facing*.15;}
 }else if(q){phase=`q-${q.phase}`;frame=q.phase==='prepare'?0:q.phase==='breath'?1:2;if(q.phase==='prepare'){const k=quadraticIn(Math.min(1,q.elapsed/.16));offsetX=-facing*9*k;tilt=-facing*.1*k;}else if(q.phase==='breath'){offsetX=facing*8;offsetY+=Math.sin(time*44)*1.5;tilt=facing*.08;}else{offsetY+=3;}}
 else if(actor.blocking){frame=3;phase='guard';offsetY+=5;scaleY=.96;}
 else if(actor.dashTime>0&&actor.dashHits){frame=actor.dashPrepare>0?4:5;phase=actor.dashPrepare>0?'e-prepare':'e-dash';offsetY+=actor.dashPrepare>0?5:0;tilt=facing*.08;}
 else if(b){phase=`r-${b.phase}`;frame=b.phase==='charge'?6:7;if(b.phase==='charge'){const k=quadraticIn(Math.min(1,b.elapsed/.55));offsetX=-facing*10*k;offsetY-=3*k;tilt=-facing*.09*k;}else{const k=b.phase==='fire'?1:1-cubicOut(Math.min(1,b.elapsed/.35));offsetX=-facing*17*k;tilt=-facing*.16*k;}}
 else{const pose=attackPose(actor.attackAction);offsetX+=pose.offsetX;offsetY+=pose.offsetY;tilt=pose.tilt*facing;scaleX=pose.scaleX;scaleY=pose.scaleY;phase=pose.phase;}
 return {frame,phase,offsetX,offsetY,tilt,scaleX,scaleY,facing};
}
export function actorBounds(actor,project,time=0,atlas){
 const pose=actorPose(actor,time),size=actor.kind==='hero'?88:100+((actor.rank??1)-1)*25,[x,y]=project(actor.x,actor.y);
 const layout=atlas&&pose.frame!==null?spriteLayout({naturalWidth:atlas.width,naturalHeight:atlas.height,atlas},pose.frame,size):{dx:-size*.5,dy:-size*.89,dw:size,dh:size};
 const {dx,dy,dw,dh}=layout;
 const corners=[[dx,dy],[dx+dw,dy],[dx+dw,dy+dh],[dx,dy+dh]].map(([cx,cy])=>actorLocalPoint(x,y,pose,cx,cy));
 return {left:Math.min(...corners.map(p=>p[0])),right:Math.max(...corners.map(p=>p[0])),top:Math.min(...corners.map(p=>p[1])),bottom:Math.max(...corners.map(p=>p[1])),size,x:x+pose.offsetX,y:y+pose.offsetY,pose,layout};
}
function actorLocalPoint(x,y,pose,cx,cy){cx*=pose.scaleX*pose.facing;cy*=pose.scaleY;return [x+pose.offsetX+cx*Math.cos(pose.tilt)-cy*Math.sin(pose.tilt),y+pose.offsetY+cx*Math.sin(pose.tilt)+cy*Math.cos(pose.tilt)];}
export function demonMouthPoint(actor,project,time=0,atlas){
 const bounds=actorBounds(actor,project,time,atlas),{layout,pose,size}=bounds,[x,y]=project(actor.x,actor.y);
 if(!atlas)return [x,y-(64+((actor.rank??1)-1)*16)];
 // Fractions were measured inside the final isolated mouth/charge pose rectangles.
 const frame=pose.frame,fx=frame===0?.56:frame===6?.57:frame===7?.9:.87,fy=frame===0?.26:frame===6?.25:frame===7?.47:.44;
 return actorLocalPoint(x,y,pose,layout.dx+layout.dw*fx,layout.dy+layout.dh*fy);
}
