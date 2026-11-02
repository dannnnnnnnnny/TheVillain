import {startDemonSkill,updateDemonSkills,skillBusy} from './demonSkills.js';
import {updateHero,cancelHeroActions,escapeHeroGrab} from './heroActions.js';
import {damageEntity,hitPlayer,liveTarget,faceDirection,attackTarget,resolveAttack} from './combat.js';
import {advanceAttack,cancelAttack} from './attackTimeline.js';
import {addEffect,updateEffects} from './effectState.js';
import {emitEvent} from './events.js';
import {findPath,segmentClear} from './pathfinding.js';
export function clearOrders(game){
 cancelAttack(game.player);cancelHeroActions(game);game.effects=[];game.bufferedInput=null;game.order=null;game.player.dashTime=0;game.player.dashPrepare=0;game.player.dashHits=null;game.player.blocking=false;game.player.moving=false;
}
export function updateGame(game,input={},delta=0) {
  if(game.phase!=='active')return;
  if(finish(game))return;
  const dt=Math.max(0,Math.min(.05,Number(delta)||0)),p=game.player;
  if(game.order?.type==='attack'&&!liveTarget(game,game.order.targetId)){game.order=null;cancelAttack(p);}
  if(input.cancelOrders||input.moveX||input.moveY||input.block||input.dodge){game.order=null;cancelAttack(p);game.bufferedInput=null;}
  if(game.hitStop>0){
   const buffered=game.bufferedInput??{commands:[],dodge:false,escapePressed:false};
   buffered.commands.push(...(input.commands??[]));buffered.commands=buffered.commands.slice(-16);
   buffered.dodge||=!!input.dodge;buffered.escapePressed||=!!input.escapePressed;
   game.bufferedInput=buffered;game.hitStop=Math.max(0,game.hitStop-dt);return;
  }
  if(game.bufferedInput){input={...input,commands:[...game.bufferedInput.commands,...(input.commands??[])],dodge:input.dodge||game.bufferedInput.dodge,escapePressed:input.escapePressed||game.bufferedInput.escapePressed};game.bufferedInput=null;}
  game.elapsed+=dt;
  for(const key of ['attackCooldown','dodgeCooldown','fireCooldown','dashCooldown','beamCooldown','attackAnimation','invulnerable','hitFlash'])p[key]=Math.max(0,p[key]-dt);
  game.shake=Math.max(0,game.shake-dt);
  if(game.feedback){game.feedback.life-=dt;if(game.feedback.life<=0)game.feedback=null;}
  for(const e of [...game.buildings,...game.enemies])e.flash=Math.max(0,e.flash-dt);
  p.aimX=Number.isFinite(input.aimX)?input.aimX:p.aimX;p.aimY=Number.isFinite(input.aimY)?input.aimY:p.aimY;
  p.blocking=!!input.block&&p.stamina>0&&p.grabbed<=0;p.moving=false;
  const mx=Number(input.moveX)||0,my=Number(input.moveY)||0;
  if(input.cancelOrders||mx||my||p.blocking){game.order=null;cancelAttack(p);}
  if(p.grabbed>0) {
    game.order=null;cancelAttack(p);p.dashTime=0;p.grabbed=Math.max(0,p.grabbed-dt);
    if(input.escapePressed)p.escapeCount++;
    if(p.escapeCount>=6){p.grabbed=0;escapeHeroGrab(game);p.invulnerable=1;addEffect(game,{kind:'escape',x:p.x,y:p.y,radius:90,life:.4,maxLife:.4});}
    else if(p.grabbed===0)hitPlayer(game,85,{unblockable:true});
  }else{
    for(const command of input.commands??[]){
      // Frozen inputs can outlive the freeze: E may still be moving, or another hit may be winding up.
      if(skillCanWait(game,command)){
        const buffered=game.bufferedInput??{commands:[],dodge:false,escapePressed:false};
        buffered.commands.push(command);buffered.commands=buffered.commands.slice(-16);game.bufferedInput=buffered;continue;
      }
      if(command.type==='move'&&!p.blocking){
        const path=findPath(game,command);if(path){cancelAttack(p);game.bufferedInput=null;game.order={type:'move',x:command.x,y:command.y,path};p.dashTime=0;}else reject(game,'이동할 수 없는 곳입니다.');
      }else if(command.type==='attack'&&!p.blocking){
        const target=liveTarget(game,command.targetId);if(!target)continue;
        const path=findPath(game,target,p.attackRange+target.radius-4);
        if(path){cancelAttack(p);game.bufferedInput=null;game.order={type:'attack',targetId:target.id,path,repath:game.elapsed+.4,targetX:target.x,targetY:target.y};p.dashTime=0;}else reject(game,'대상에게 접근할 수 없습니다.');
      }else if(command.type==='skill'&&!p.blocking){
        if(command.skill==='q'||command.skill==='r')startDemonSkill(game,command.skill,command);
        if(command.skill==='e'&&p.dashCooldown===0&&p.stamina>=25&&Number.isFinite(command.x)&&Number.isFinite(command.y)){
          const len=Math.hypot(command.x-p.x,command.y-p.y);if(len){cancelAttack(p);game.bufferedInput=null;p.stamina-=25;p.dashCooldown=5;p.dashTime=.42;p.dashPrepare=.07;p.invulnerable=.4;p.dashX=(command.x-p.x)/len;p.dashY=(command.y-p.y)/len;p.dashHits=[];game.order=null;faceDirection(p,p.dashX,p.dashY);addEffect(game,{kind:'dash',x:p.x,y:p.y,dx:p.dashX,dy:p.dashY,life:.4,maxLife:.4});}
        }

      }
    }
    if(mx||my)game.order=null;
    if(p.blocking){game.order=null;p.dashTime=0;faceDirection(p,p.aimX-p.x,p.aimY-p.y);}
    if(input.dodge&&!p.blocking&&p.dodgeCooldown===0&&p.stamina>=18){
      const dx=mx||my?mx:p.aimX-p.x,dy=mx||my?my:p.aimY-p.y,len=Math.hypot(dx,dy)||1;
      cancelAttack(p);game.bufferedInput=null;p.stamina-=18;p.invulnerable=.58;p.dodgeCooldown=1.35;p.dashTime=.24;p.dashX=dx/len;p.dashY=dy/len;p.dashHits=null;game.order=null;
    }
    const old={x:p.x,y:p.y};let dashContact=null;
    if(!p.blocking){
      if(p.dashTime>0){
       const step=Math.min(dt,p.dashTime),preparation=Math.min(step,p.dashHits?p.dashPrepare:0),travel=step-preparation;
       p.dashPrepare=Math.max(0,p.dashPrepare-preparation);p.dashTime=Math.max(0,p.dashTime-step);
       if(travel>0){if(p.dashHits)dashContact=moveDash(game,p.dashX*440*travel,p.dashY*440*travel);else{move(game,p.dashX*440*travel,p.dashY*440*travel);if(old.x===p.x&&old.y===p.y)p.dashTime=0;}}
      }
      else if((mx||my)&&!p.fireBreath&&!p.beam){const len=Math.hypot(mx,my);move(game,mx/len*145*dt,my/len*145*dt);}
      else if(!p.attackAction&&!p.fireBreath&&!p.beam)followOrder(game,dt);
    }
    if(p.x!==old.x||p.y!==old.y){p.moving=true;faceDirection(p,p.x-old.x,p.y-old.y);}
    if(p.dashHits){
      if(p.moving){addEffect(game,{kind:'afterimage',x:old.x,y:old.y,dx:p.dashX,dy:p.dashY,rank:p.rank,facing:p.facing,life:.22,maxLife:.22,layer:'back'});
      addEffect(game,{kind:'dash',x:old.x,y:old.y,dx:p.dashX,dy:p.dashY,life:.3,maxLife:.3,layer:'back'});}
      const dx=p.x-old.x,dy=p.y-old.y,squared=dx*dx+dy*dy;
      for(const e of [...game.buildings,...game.enemies]){
        if(e.hp<=0||e.active===false||p.dashHits.includes(e.id))continue;
        const t=squared?Math.max(0,Math.min(1,((e.x-old.x)*dx+(e.y-old.y)*dy)/squared)):0;
        const forward=(e.x-old.x)*p.dashX+(e.y-old.y)*p.dashY>=0;
        if(e===dashContact?.entity||(squared&&forward&&Math.hypot(e.x-old.x-dx*t,e.y-old.y-dy*t)<=e.radius+p.radius*.7)){damageEntity(game,e,p.attackDamage*1.7);p.dashHits.push(e.id);}
      }
      if(dashContact?.blocked&&(!dashContact.entity||dashContact.entity.hp>0))p.dashTime=0;
      if(p.dashTime===0)p.dashHits=null;
    }
  }
  const activeSkill=!!(p.fireBreath||p.beam);
  if(p.grabbed<=0)updateDemonSkills(game,input,dt);
  const impact=advanceAttack(p,dt);if(impact)resolveAttack(game,impact);
  if(!activeSkill)p.stamina=Math.min(100,p.stamina+dt*(p.blocking?4:13));
  if(finish(game))return;
  updateEnemies(game,dt);
  for(const bullet of game.projectiles){bullet.x+=bullet.vx*dt;bullet.y+=bullet.vy*dt;bullet.life-=dt;if(Math.hypot(bullet.x-p.x,bullet.y-p.y)<p.radius+8){hitPlayer(game,bullet.damage);bullet.life=0;addEffect(game,{kind:'hit',x:bullet.x,y:bullet.y,life:.25,maxLife:.25,color:'#ffb467'});}}
  game.projectiles=game.projectiles.filter(b=>b.life>0);
  updateEffects(game,dt);
  finish(game);
}
function skillCanWait(game,command){
 const p=game.player;
 if(command.type!=='skill'||p.blocking||p.grabbed>0||!skillBusy(p))return false;
 if(command.skill==='q')return p.fireCooldown===0&&p.stamina>=8;
 if(command.skill==='r')return p.beamCooldown===0&&p.stamina>=45;
 return false;
}
function reject(game,text){game.feedback={text,life:1.4};}
function move(game,dx,dy){const p=game.player,dest={x:p.x+dx,y:p.y+dy};if(segmentClear(game,p,dest)){p.x=dest.x;p.y=dest.y;}}
// E alone advances to the first solid contact. Ordinary walking keeps its existing routing.
function moveDash(game,dx,dy){
 const p=game.player,squared=dx*dx+dy*dy;let fraction=1,entity=null;
 if(!squared)return {blocked:false,entity};
 // Clip to the playable quay before considering the first building on the swept segment.
 for(const [position,delta,min,max] of [[p.x,dx,70,1030],[p.y,dy,70,920]]){
  const limit=delta>0?(max-position)/delta:delta<0?(min-position)/delta:1;
  fraction=Math.min(fraction,Math.max(0,limit));
 }
 for(const b of game.buildings){
  if(b.hp<=0)continue;
  const ox=p.x-b.x,oy=p.y-b.y,radius=b.radius+p.radius*.6+1;
  const along=ox*dx+oy*dy,offset=ox*ox+oy*oy-radius*radius,discriminant=along*along-squared*offset;
  if(discriminant<0)continue;
  const entry=(-along-Math.sqrt(discriminant))/squared;
  if(entry>=-1e-8&&entry<=fraction){fraction=Math.max(0,entry);entity=b;}
 }
 // Stay just outside the solid footprint; its actual contact still participates in this hit sweep.
 const travel=fraction<1?Math.max(0,fraction-1e-7):1;
 p.x+=dx*travel;p.y+=dy*travel;
 return {blocked:fraction<1,entity};
}
function followOrder(game,dt){
 const order=game.order,p=game.player;if(!order)return;
 if(order.type==='attack'){
  const target=liveTarget(game,order.targetId);if(!target){game.order=null;return;}
  if(Math.hypot(target.x-p.x,target.y-p.y)<=p.attackRange+target.radius){
   order.path=[];if(p.attackCooldown===0&&attackTarget(game,target)){p.attackCooldown=.43;if(target.hp<=0)game.order=null;}return;
  }
  if(game.elapsed>=order.repath||!order.path.length){
   order.path=findPath(game,target,p.attackRange+target.radius-4);order.repath=game.elapsed+.4;
   if(!order.path){game.order=null;reject(game,'대상에게 접근할 수 없습니다.');return;}
  }
 }
 let travel=145*dt;
 while(order.path.length&&travel>0){const next=order.path[0],dx=next.x-p.x,dy=next.y-p.y,len=Math.hypot(dx,dy);if(len<.01){order.path.shift();continue;}const distance=Math.min(len,travel);const before={x:p.x,y:p.y};move(game,dx/len*distance,dy/len*distance);if(before.x===p.x&&before.y===p.y){game.order=null;return;}travel-=distance;if(distance===len)order.path.shift();}
 if(order.type==='move'&&!order.path.length)game.order=null;
}
function finish(g) {
  if(g.buildings.filter(b=>b.landmark).every(b=>b.hp===0)){g.phase='won';clearOrders(g);g.reward=Math.min(40,160-g.fear);g.fear=Math.min(160,g.fear+40);return true;}
  if(g.player.hp<=0){g.phase='lost';clearOrders(g);return true;}return false;
}
function updateEnemies(g,dt){
 const p=g.player;
 for(const e of g.enemies){
  if(e.hp<=0){if(e.kind==='hero'){e.heroAction=null;e.telegraph=0;}continue;}
  if(!e.active){if(g.elapsed>=18||g.threat>=130){e.active=true;emitEvent(g,'hero-arrived',e);}else continue;}
  e.cooldown-=dt;const dx=p.x-e.x,dy=p.y-e.y,dist=Math.hypot(dx,dy)||1;
  if(e.kind==='hero'){updateHero(g,e,dt);
  }else{
   if(e.kind==='helicopter'){e.x+=Math.sin(g.elapsed*.5)*17*dt;e.y+=Math.cos(g.elapsed*.5)*17*dt;}
   if(e.cooldown<=0&&dist<600){e.cooldown=e.kind==='tank'?3.6:4.8;const speed=e.kind==='tank'?190:225;g.projectiles.push({x:e.x,y:e.y,vx:dx/dist*speed,vy:dy/dist*speed,damage:e.kind==='tank'?18:12,life:4,kind:e.kind});}
  }
 }
}
