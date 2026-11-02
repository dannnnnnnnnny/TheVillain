import {emitEvent} from './events.js';
import {beginAttack,cancelAttack} from './attackTimeline.js';
import {addEffect} from './effectState.js';
export function damageEntity(game, entity, amount, {freeze=true}={}) {
  if(game.phase!=='active'||entity.hp<=0||!Number.isFinite(amount)||amount<=0)return;
  const actual=Math.min(entity.hp,amount);entity.hp=Math.max(0,entity.hp-amount);entity.flash=.13;game.threat+=actual*.06;
  const strong=amount>=game.player.attackDamage*2;
  if(entity.kind==='hero'){entity.heroAction={phase:'hurt',elapsed:0,duration:.22};entity.telegraph=0;entity.mode='approach';}
  addEffect(game,{kind:'hit',x:entity.x,y:entity.y,life:.3,maxLife:.3,color:'#ffd785'});
  addEffect(game,{kind:'impact',x:entity.x,y:entity.y,life:strong?.48:.32,maxLife:strong?.48:.32,intensity:strong?2:1});
  addEffect(game,{kind:'number',x:entity.x,y:entity.y,amount:Math.round(actual),life:.7,maxLife:.7});
  if(freeze)game.hitStop=Math.max(game.hitStop,strong?.065:.035);game.shake=Math.max(game.shake,strong?.65:.28);
  if(entity.hp===0){
    addEffect(game,{kind:'explosion',x:entity.x,y:entity.y,life:1.15,maxLife:1.15,color:'#ffb65b'});game.shake=.65;
    if(entity.landmark)emitEvent(game,'landmark-destroyed',entity);
    if(entity.kind==='hero')emitEvent(game,'hero-defeated',entity);
  }
}
export function hitPlayer(game,amount,{unblockable=false}={}){
 const p=game.player;if(game.phase!=='active'||p.hp<=0||p.invulnerable>0)return false;
 const reduction=p.blocking&&!unblockable&&p.stamina>0?.28:1;
 p.hp=Math.max(0,p.hp-amount*(1-p.armor)*reduction);
 if(reduction<1){p.stamina=Math.max(0,p.stamina-amount*.4);addEffect(game,{kind:'guard',x:p.x,y:p.y,life:.32,maxLife:.32});}
 p.hitFlash=.22;game.shake=.28;return true;
}
export function tryGrab(game){const p=game.player;if(game.phase!=='active'||p.invulnerable>0||p.grabbed>0||p.hp<=0)return false;cancelAttack(p);game.bufferedInput=null;p.grabbed=2.8;p.escapeCount=0;p.blocking=false;return true;}
export function liveTarget(game,id){return [...game.buildings,...game.enemies].find(e=>e.id===id&&e.hp>0&&e.active!==false);}
export function faceDirection(player,dx,dy){if(Math.abs(dx-dy)>.001)player.facing=dx-dy>0?1:-1;}
function canAttack(game){const p=game.player;return game.phase==='active'&&p.hp>0&&p.grabbed<=0&&!p.blocking&&(!p.attackAction||p.attackAction.resolved)&&!p.dashTime&&!p.fireBreath&&!p.beam;}
export function performAttack(game,input){
 const p=game.player;if(!canAttack(game)||p.attackCooldown>0)return false;
 const ax=(input.aimX??p.aimX)-p.x,ay=(input.aimY??p.aimY)-p.y,len=Math.hypot(ax,ay)||1;
 faceDirection(p,ax,ay);if(p.attackAction?.resolved)cancelAttack(p);beginAttack(p,{kind:'melee',dx:ax/len,dy:ay/len});p.attackCooldown=.43;return true;
}
export function attackTarget(game,target){
 const p=game.player;if(!canAttack(game)||!target||target.hp<=0||target.active===false||Math.hypot(target.x-p.x,target.y-p.y)>p.attackRange+target.radius)return false;
 const dx=target.x-p.x,dy=target.y-p.y,len=Math.hypot(dx,dy)||1;faceDirection(p,dx,dy);
 if(p.attackAction?.resolved)cancelAttack(p);return beginAttack(p,{kind:'melee',targetId:target.id,dx:dx/len,dy:dy/len});
}
export function resolveAttack(game,action){
 const p=game.player;if(game.phase!=='active'||p.hp<=0||p.grabbed>0)return;
 addEffect(game,{kind:'slash',x:p.x,y:p.y,dx:action.dx,dy:action.dy,radius:action.radius,life:.3,maxLife:.3});
 if(action.targetId){const target=liveTarget(game,action.targetId);if(target&&Math.hypot(target.x-p.x,target.y-p.y)<=p.attackRange+target.radius)damageEntity(game,target,p.attackDamage*action.multiplier);return;}
 for(const entity of [...game.buildings,...game.enemies]){
  if(entity.hp<=0||entity.active===false)continue;
  const dx=entity.x-p.x,dy=entity.y-p.y,distance=Math.hypot(dx,dy);
  if(entity.kind==='helicopter'&&distance>p.attackRange*.75)continue;
  if(distance<=action.radius+entity.radius&&(dx*action.dx+dy*action.dy)/(distance||1)>=-.12)damageEntity(game,entity,p.attackDamage*action.multiplier);
 }
}
