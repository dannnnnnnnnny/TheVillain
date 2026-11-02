import {heroGrabVolume} from './heroGrabVolume.js';
import {hitPlayer,tryGrab} from './combat.js';
import {addEffect} from './effectState.js';
export function cancelHeroActions(game){for(const e of game.enemies)if(e.kind==='hero'&&!(e.heroAction?.phase==='grab'&&game.player.grabbed>0)){e.heroAction=null;e.telegraph=0;e.mode='approach';}}
export function escapeHeroGrab(game){for(const e of game.enemies)if(e.kind==='hero'&&e.hp>0){const dx=e.x-game.player.x,dy=e.y-game.player.y,len=Math.hypot(dx,dy)||1;e.x+=dx/len*28;e.y+=dy/len*28;e.heroAction={phase:'hurt',elapsed:0,duration:.35};e.telegraph=0;e.mode='approach';}}
export function updateHero(game,e,dt){
 const p=game.player;if(e.hp<=0){e.heroAction=null;e.telegraph=0;return;}
 const dx=p.x-e.x,dy=p.y-e.y,dist=Math.hypot(dx,dy)||1;
 const direction=e.heroAction;const facingX=direction?.dx??dx,facingY=direction?.dy??dy;e.facing=facingX-facingY>=0?1:-1;e.moving=false;
 let a=e.heroAction;
 if(a&&a.phase!=='prepare'){
  a.elapsed+=dt;
  if(a.phase==='charge'){
   const remaining=Math.max(0,.22-(a.elapsed-dt)),travel=Math.min(dt,remaining)*190/.22,old={x:e.x,y:e.y};
   e.x=Math.max(70,Math.min(1030,e.x+a.dx*travel));e.y=Math.max(70,Math.min(920,e.y+a.dy*travel));e.moving=true;
   addEffect(game,{kind:'hero-trail',x:old.x,y:old.y,dx:a.dx,dy:a.dy,facing:e.facing,awakened:e.awakened,life:.25,maxLife:.25,layer:'back'});
   const sx=e.x-old.x,sy=e.y-old.y,len2=sx*sx+sy*sy,t=len2?Math.max(0,Math.min(1,((p.x-old.x)*sx+(p.y-old.y)*sy)/len2)):0;
   if(!a.contacted&&Math.hypot(p.x-old.x-sx*t,p.y-old.y-sy*t)<=p.radius+e.radius){a.contacted=true;hitPlayer(game,e.awakened?62:45);addEffect(game,{kind:'hero-hit',x:p.x,y:p.y,dx:a.dx,dy:a.dy,life:.25,maxLife:.25});}
  }
  if(a.phase==='grab'&&p.grabbed<=0){e.heroAction={phase:'recovery',elapsed:0,duration:.2};return;}
  if(a.elapsed>=a.duration){e.heroAction=a.phase==='recovery'?null:{phase:'recovery',elapsed:0,duration:.2};e.mode='approach';}
  return;
 }
 if(e.telegraph>0){
  if(!a){a=e.heroAction={phase:'prepare',kind:e.mode,elapsed:0,duration:e.telegraph,dx:dx/dist,dy:dy/dist};}
  a.elapsed+=dt;e.telegraph=Math.max(0,e.telegraph-dt);
  if(e.telegraph<=1e-9){
   e.cooldown=e.awakened?.9:1.35;
   if(e.mode==='charge')e.heroAction={phase:'charge',elapsed:0,duration:.22,dx:a.dx,dy:a.dy,contacted:false};
   else if(e.mode==='grab'){const held=heroGrabVolume(e,a).contains(p.x,p.y)&&tryGrab(game);e.heroAction={phase:held?'grab':'recovery',elapsed:0,duration:held?2.8:.3};}
   else{const forward=dx*a.dx+dy*a.dy;if(dist<105&&forward/dist>=Math.cos(.7))hitPlayer(game,e.awakened?48:34);e.heroAction={phase:'punch',elapsed:0,duration:.16,dx:a.dx,dy:a.dy};addEffect(game,{kind:'hero-hit',x:e.x+a.dx*65,y:e.y+a.dy*65,dx:a.dx,dy:a.dy,life:.22,maxLife:.22});}
  }
  return;
 }
 if(e.cooldown<=0&&dist<(e.attackIndex%3===1?240:90)){
  e.mode=['strike','charge','grab'][e.attackIndex++%3];e.telegraph=e.awakened?.68:.95;
  e.heroAction={phase:'prepare',kind:e.mode,elapsed:0,duration:e.telegraph,dx:dx/dist,dy:dy/dist};
 }else if(dist>65){e.x+=dx/dist*(e.awakened?86:72)*dt;e.y+=dy/dist*(e.awakened?86:72)*dt;e.moving=true;}
}
