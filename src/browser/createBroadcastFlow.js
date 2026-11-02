import {isPlayableCountry} from './countrySelection.js';
// This owner gates the story, combat and once-only reward/save transitions.
export function createBroadcastFlow(game,{save=()=>{},initialScreen='opening'}={}){
 let screen=initialScreen;game.phase=screen==='map'?'map':'opening';
 return {get screen(){return screen;},selectCountry(code){
  if(screen!=='map'||!isPlayableCountry(code))return false;
  screen='peace';game.phase='prologue';return true;
 },skipPrologue(){
  if(screen!=='peace')return false;
  screen='opening';game.phase='opening';return true;
 },continue(){
  if(screen==='peace'){screen='opening';game.phase='opening';return true;}
  if(screen==='opening'){screen='active';game.phase='active';return true;}
  if(screen==='ending'){screen='result';return true;}return false;
 },finish(){
  if(screen!=='active'||!['won','lost'].includes(game.phase))return false;
  screen='ending';if(game.phase==='won')save(game.fear);return true;
 }};
}
