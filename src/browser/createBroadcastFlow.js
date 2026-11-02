import {isPlayableCountry} from './countrySelection.js';
// This owner gates the story, combat and once-only reward/save transitions.
export function createBroadcastFlow(game,{save=()=>{},initialScreen='opening'}={}){
 let screen=initialScreen,angered=false;game.phase=screen==='map'?'map':'opening';
 return {get screen(){return screen;},get angered(){return angered;},noticeDamage(previousHp){
  if(screen!=='active'||game.phase!=='active'||angered||game.player.hp>=previousHp||game.player.hp<=0)return false;
  angered=true;return true;
 },selectCountry(code){
  if(screen!=='map'||!isPlayableCountry(code))return false;
  screen='waking';game.phase='prologue';return true;
 },skipPrologue(){
  if(!['waking','peace'].includes(screen))return false;
  screen='opening';game.phase='opening';return true;
 },continue(){
  if(screen==='waking'){screen='peace';return true;}
  if(screen==='peace'){screen='opening';game.phase='opening';return true;}
  if(screen==='opening'){screen='active';game.phase='active';return true;}
  if(screen==='ending'){screen='result';return true;}return false;
 },finish(){
  if(screen!=='active'||!['won','lost'].includes(game.phase))return false;
  screen='ending';if(game.phase==='won')save(game.fear);return true;
 }};
}
