import {growthForFear, normalizeFear} from './progression.js';
import {stage} from './stage.js';
import {createCity} from './createCity.js';
export function createGame({fear = 0, seed = 7} = {}) {
  const growth = growthForFear(fear);
  return {
    phase:'active', stage, hitStop:0,bufferedInput:null, order:null, feedback:null, seed, elapsed:0, fear:normalizeFear(fear), reward:0, threat:0, nextEventId:1,
    world:{width:1100,height:1000},
    player:{x:220,y:610,...growth,hp:growth.maxHp,stamina:100,blocking:false,invulnerable:0,attackCooldown:0,dodgeCooldown:0,fireCooldown:0,fireBreath:null,beamCooldown:0,beam:null,dashCooldown:0,attackAnimation:0,attackAction:null,hitFlash:0,grabbed:0,escapeCount:0,aimX:420,aimY:370,facing:1,moving:false,dashTime:0,dashPrepare:0,dashX:0,dashY:0,dashHits:null},
    buildings:createCity(seed),
    enemies:[
      {id:'tank-a',kind:'tank',name:'방위군 전차',x:530,y:520,hp:260,maxHp:260,radius:23,cooldown:3,active:true,flash:0},
      {id:'tank-b',kind:'tank',name:'방위군 전차',x:810,y:285,hp:260,maxHp:260,radius:23,cooldown:5,active:true,flash:0},
      {id:'heli',kind:'helicopter',name:'방위군 헬리콥터',x:700,y:700,hp:200,maxHp:200,radius:24,cooldown:6,active:true,flash:0},
      {id:'hero',kind:'hero',name:'루멘',x:1000,y:540,hp:1150+growth.rank*170,maxHp:1150+growth.rank*170,radius:18,cooldown:2,active:false,flash:0,mode:'approach',heroAction:null,moving:false,facing:-1,telegraph:0,attackIndex:0,awakened:growth.rank===3},
    ],projectiles:[],effects:[],events:[],shake:0,
  };
}
