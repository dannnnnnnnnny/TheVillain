import {cancelAttack} from './attackTimeline.js';
import {damageEntity,faceDirection} from './combat.js';
import {addEffect} from './effectState.js';

export function skillBusy(p){return !!(p.fireBreath||p.beam||p.dashTime>0||p.attackAction&&!p.attackAction.resolved);}
export function startDemonSkill(game,key,aim){
 const p=game.player;
 if(game.phase!=='active'||p.hp<=0||p.grabbed>0||p.blocking||skillBusy(p))return false;
 const ax=(aim.x??p.aimX)-p.x,ay=(aim.y??p.aimY)-p.y,len=Math.hypot(ax,ay);
 if(!Number.isFinite(len)||!len)return false;
 if(key==='q'&&(p.fireCooldown>0||p.stamina<8)||key==='r'&&(p.beamCooldown>0||p.stamina<45))return false;
 if(key!=='q'&&key!=='r')return false;
 cancelAttack(p);game.order=null;faceDirection(p,ax,ay);p.aimX=aim.x??p.aimX;p.aimY=aim.y??p.aimY;
 if(key==='q'){p.stamina-=8;p.fireCooldown=4;p.fireBreath={phase:'prepare',elapsed:0,channelTime:0,tickTime:0,dx:ax/len,dy:ay/len,emission:0};}
 else{p.stamina-=45;p.beamCooldown=12;p.beam={phase:'charge',elapsed:0,dx:ax/len,dy:ay/len};}
 return true;
}
function track(p,s){const dx=p.aimX-p.x,dy=p.aimY-p.y,len=Math.hypot(dx,dy);if(len>0&&Number.isFinite(len)){s.dx=dx/len;s.dy=dy/len;faceDirection(p,dx,dy);}}
export function inFireCone(p,s,e){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy),along=dx*s.dx+dy*s.dy;return along>=0&&d<=240+e.radius&&along/(d||1)>=Math.cos(.48);}
export function inBeam(p,s,e){const dx=e.x-p.x,dy=e.y-p.y,along=dx*s.dx+dy*s.dy,side=Math.abs(dx*s.dy-dy*s.dx);return along>=0&&along<=760&&side<=28+e.radius;}
export function updateDemonSkills(game,input,dt){
 const p=game.player,s=p.fireBreath;
 if(s){
  if(p.stamina<=0){p.fireBreath=null;return;}
  track(p,s);let remaining=dt;
  while(remaining>1e-9&&p.fireBreath){
   if(s.phase==='prepare'){const step=Math.min(remaining,.16-s.elapsed);s.elapsed+=step;remaining-=step;if(s.elapsed>=.16-1e-9){s.phase='breath';s.elapsed=0;}else break;}
   else if(s.phase==='breath'){
    const stop=input.fireHeld===true?2:Math.max(.25,s.channelTime);
    const step=Math.max(0,Math.min(remaining,stop-s.channelTime,p.stamina/14));
    s.channelTime+=step;s.tickTime+=step;p.stamina=Math.max(0,p.stamina-step*14);remaining-=step;
    while(s.tickTime>=.1-1e-9){s.tickTime-=.1;for(const e of [...game.buildings,...game.enemies])if(e.hp>0&&e.active!==false&&inFireCone(p,s,e))damageEntity(game,e,p.attackDamage*.3,{freeze:false});}
    s.emission+=step;
    if(s.emission>=.025){s.emission%=.025;addEffect(game,{kind:'fire',x:p.x,y:p.y,dx:s.dx,dy:s.dy,radius:240,height:64+(p.rank-1)*16,rank:p.rank,facing:p.facing,seed:game.elapsed,life:.22,maxLife:.22,layer:'front'});}
    if(p.stamina<=1e-9){p.fireBreath=null;break;}
    if(s.channelTime>=stop-1e-9){s.phase='recovery';s.elapsed=0;}else break;
   }else{const step=Math.min(remaining,.2-s.elapsed);s.elapsed+=step;remaining-=step;if(s.elapsed>=.2-1e-9)p.fireBreath=null;else break;}
  }
 }
 const b=p.beam;
 if(b){
  let remaining=dt;
  while(remaining>1e-9&&p.beam){
   if(b.phase==='charge'){
    track(p,b);const step=Math.min(remaining,.55-b.elapsed);b.elapsed+=step;remaining-=step;
    if(b.elapsed>=.55-1e-9){b.phase='fire';b.elapsed=0;addEffect(game,{kind:'beam',x:p.x,y:p.y,dx:b.dx,dy:b.dy,radius:760,height:64+(p.rank-1)*16,rank:p.rank,facing:p.facing,seed:game.elapsed,life:.12,maxLife:.12,layer:'front'});for(const e of [...game.buildings,...game.enemies])if(e.hp>0&&e.active!==false&&inBeam(p,b,e))damageEntity(game,e,p.attackDamage*9,{freeze:false});game.shake=.8;}
    else break;
   }else{const duration=b.phase==='fire'?.12:.35,step=Math.min(remaining,duration-b.elapsed);b.elapsed+=step;remaining-=step;if(b.elapsed>=duration-1e-9){if(b.phase==='fire'){b.phase='recovery';b.elapsed=0;}else p.beam=null;}else break;}
  }
 }
}
