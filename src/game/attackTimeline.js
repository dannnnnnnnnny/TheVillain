export function beginAttack(player,{kind,targetId=null,dx,dy,multiplier=1,radius=player.attackRange}){
 if(player.attackAction)return false;
 const impactAt=.12,duration=.43;
 player.attackAction={kind,targetId,dx,dy,multiplier,radius,impactAt,duration,elapsed:0,resolved:false};
 player.attackAnimation=duration;return true;
}
export function advanceAttack(player,dt){
 const action=player.attackAction;if(!action)return null;
 action.elapsed=Math.min(action.duration,action.elapsed+dt);
 let impact=null;
 if(!action.resolved&&action.elapsed+1e-9>=action.impactAt){action.resolved=true;impact=action;}
 if(action.elapsed+1e-9>=action.duration)player.attackAction=null;
 return impact;
}
export function cancelAttack(player){player.attackAction=null;player.attackAnimation=0;player.fireBreath=null;player.beam=null;}
