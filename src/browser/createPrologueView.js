import {createFirstInvasionStory} from '../game/firstInvasion.js';
export function createPrologueView(root,{onNext,onSkip}){
 const story=createFirstInvasionStory();
 const image=root.querySelector('#prologue-image'),title=root.querySelector('#prologue-title'),body=root.querySelector('#prologue-body'),next=root.querySelector('#prologue-next');
 let phase=null;
 function proceed(action){if(root.hidden)return;action();}
 next.addEventListener('click',()=>proceed(onNext));root.querySelector('#prologue-skip').addEventListener('click',()=>proceed(onSkip));
 root.addEventListener('keydown',event=>{
  if(event.code==='Enter'){event.preventDefault();event.stopPropagation();if(!event.repeat&&!document.querySelector('dialog[open]'))proceed(onNext);}
  if(event.code==='Tab'){const last=root.querySelector('#prologue-skip');if(event.shiftKey&&document.activeElement===next){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();next.focus();}}
 });
 image.addEventListener('error',()=>{root.dataset.artState='error';image.hidden=true;});
 return {hide(){root.hidden=true;phase=null;},show(screen){
  if(phase===screen&&!root.hidden)return;phase=screen;root.hidden=false;root.dataset.phase=screen;root.dataset.artState='loading';image.hidden=false;
  image.onload=()=>{root.dataset.artState='ready';};
  image.src='/public/assets/porto-peace.png';
  image.alt='평화로운 포르투, 랜드마크에서 사진을 찍는 시민과 관광객';
  title.textContent=story.title;
  body.textContent=story.body;
  root.querySelector('#prologue-thought').textContent=story.thought;
  root.querySelector('#prologue-signal').textContent=story.signal;
  root.querySelector('#prologue-step').textContent='A DAY IN PORTO · 첫 침공 프롤로그';
  next.textContent='이야기 계속 →';root.querySelector('#prologue-skip').textContent='이야기 건너뛰기';next.focus({preventScroll:true});
 }};
}
