import {quadraticIn,cubicOut,backOut,elasticOut} from '../vendor/tweenEasing.js';
// Only the sprite moves: its ground marker, collision body and selection stay fixed.
export function attackPose(action){
 const rest={phase:'recovery',offsetX:0,offsetY:0,tilt:0,scaleX:1,scaleY:1};
 if(!action||action.elapsed>=action.duration)return rest;
 const {elapsed:t,impactAt:hit,duration}=action,heavy=1;
 const vx=(action.dx-action.dy)*.78,vy=(action.dx+action.dy)*.4;
 let travel=0,tilt=0,sx=1,sy=1,phase;
 if(t<hit*.68){const k=quadraticIn(t/(hit*.68));phase='anticipation';travel=-9*k;tilt=-.13*k;sx=1-.15*k;sy=1+.1*k;}
 else if(t<hit){const k=cubicOut((t-hit*.68)/(hit*.32));phase='swing';travel=-9+31*k;tilt=-.13+.37*k;sx=.85+.4*k;sy=1.1-.22*k;}
 else if(t<hit+.065){const k=backOut((t-hit)/.065);phase='impact';travel=22+5*k;tilt=.24-.1*k;sx=1.25-.09*k;sy=.88+.08*k;}
 else{const k=Math.min(1,(t-hit-.065)/(duration-hit-.065));phase='recovery';const settle=1-elasticOut(k);travel=27*settle;tilt=.14*settle;sx=1+.16*settle;sy=1-.04*settle;}
 return {phase,offsetX:vx*travel*heavy,offsetY:vy*travel*heavy,tilt:tilt*heavy,scaleX:sx,scaleY:sy};
}
