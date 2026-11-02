import {createFirstInvasionStory} from './game/firstInvasion.js';
import {createWorldMapView} from './browser/createWorldMapView.js';
import {createPrologueView} from './browser/createPrologueView.js';
import {createOpeningBroadcast,createEndingBroadcast} from './game/broadcast.js';
import {createBroadcastFlow} from './browser/createBroadcastFlow.js';
import {createBroadcastView,renderNewsFeed} from './browser/broadcastView.js';
import {createGame} from './game/createGame.js';
import {updateGame,clearOrders} from './game/updateGame.js';
import {growthForFear} from './game/progression.js';
import {createNewsItem} from './game/news.js';
import {createRenderer} from './render/createRenderer.js';
import {createInput} from './browser/input.js';
import {createStorage} from './browser/storage.js';
import {createAudio} from './browser/audio.js';
const $=id=>document.getElementById(id);
const firstInvasionStory=createFirstInvasionStory();
let storageTarget;try{storageTarget=window.localStorage;}catch{/* private mode: use session memory */}
const storage=createStorage(storageTarget),audio=createAudio(),renderer=createRenderer($('game'));
let game=createGame({fear:storage.load()}),started=false,news=[],processed=new Set(),lastTime=0,heroBannerUntil=0,angerUntil=0,flow=null;
const input=createInput($('game'),renderer,{onPause:togglePause,onClear:()=>clearOrders(game),isActive:()=>started&&game.phase==='active'});
const broadcast=createBroadcastView($('broadcast'),{onContinue(){if(!flow?.continue())return;input.clear();lastTime=performance.now();presentFlow();if(flow.screen==='result')showResult();updateUI();}});
const prologue=createPrologueView($('prologue'),{onNext(){if(!flow?.continue())return;input.clear();presentFlow();updateUI();},onSkip(){if(!flow?.skipPrologue())return;input.clear();presentFlow();updateUI();}});
const worldMap=createWorldMapView($('world-home'),{onSelect(code){if(!flow?.selectCountry(code))return;started=true;input.clear();audio.unlock();presentFlow();updateUI();}});
function presentFlow(){
 const screen=flow?.screen??'map';document.querySelector('main').dataset.view=screen==='map'?'map':['waking','peace','opening'].includes(screen)?'story':'battle';
 $('world-home').hidden=screen!=='map';broadcast.hide();prologue.hide();
 $('battle-objectives').hidden=screen!=='active';$('pause').disabled=screen!=='active';
 if(screen==='map')worldMap.refresh();
 else if(['waking','peace'].includes(screen))prologue.show(screen);
 else if(screen==='opening')broadcast.show(createOpeningBroadcast(game),renderer.captureScene(game));
 else if(screen==='active'){lastTime=performance.now();renderer.render(game);$('game').focus({preventScroll:true});}
}
$('mission-motivation').textContent=firstInvasionStory.mission;
const segments=Array.from({length:16},()=>{const element=document.createElement('i');$('fear-segments').append(element);return element;});
function formatTime(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
function start(){
 game=createGame({fear:storage.load()});flow=createBroadcastFlow(game,{save:value=>storage.save(value)});news=[];processed.clear();started=true;heroBannerUntil=0;angerUntil=0;
 input.clear();audio.unlock();$('paused').hidden=true;$('result').hidden=true;$('hero-banner').hidden=true;
 renderNews();presentFlow();updateUI();
}
function home(){broadcast.hide();prologue.hide();started=false;angerUntil=0;game=createGame({fear:storage.load()});flow=createBroadcastFlow(game,{save:value=>storage.save(value),initialScreen:'map'});input.clear();$('paused').hidden=true;$('result').hidden=true;$('pause').disabled=true;$('grab-warning').hidden=true;$('hero-banner').hidden=true;news=[];renderNews();presentFlow();updateUI();}
function togglePause(){if(!started||!['active','paused'].includes(game.phase))return;input.clear();if(game.phase==='active'){game.phase='paused';$('paused').hidden=false;$('resume').focus({preventScroll:true});}else{game.phase='active';$('paused').hidden=true;lastTime=performance.now();$('game').focus({preventScroll:true});}updateUI();}
function pauseOnBlur(){if(started&&game.phase==='active')togglePause();else input.clear();}
window.addEventListener('blur',pauseOnBlur);document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseOnBlur();});
$('brand-home').addEventListener('click',event=>{event.preventDefault();home();});$('retry').addEventListener('click',start);$('pause').addEventListener('click',togglePause);$('resume').addEventListener('click',togglePause);$('pause-home').addEventListener('click',home);$('result-home').addEventListener('click',home);
$('sound').addEventListener('click',()=>{const enabled=audio.toggle();$('sound').setAttribute('aria-pressed',String(enabled));$('sound').title=enabled?'음향 끄기':'음향 켜기';$('sound').querySelector('span').textContent=enabled?'음향 켜짐':'음향 꺼짐';if(enabled)audio.play('punch');});
$('reset').addEventListener('click',()=>{pauseOnBlur();$('reset-dialog').showModal();});
$('reset-dialog').addEventListener('close',()=>{if($('reset-dialog').returnValue==='reset'){storage.reset();home();}});
function renderNews(){renderNewsFeed({feed:$('news-feed'),count:$('news-count'),news,stage:game.stage,formatTime});}
function updateUI(){const p=game.player,growth=growthForFear(game.fear);$('health-number').textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;$('health-fill').style.width=`${p.hp/p.maxHp*100}%`;$('stamina-number').textContent=Math.floor(p.stamina);$('stamina-fill').style.width=`${p.stamina}%`;$('fear-number').innerHTML=`${game.fear} <small>/ 160</small>`;segments.forEach((el,i)=>el.classList.toggle('on',game.fear>i*10));$('rank-label').textContent=`0${p.rank} · ${['잠든 악의','커지는 재앙','도시의 악몽'][p.rank-1]}`;$('growth-hint').textContent=game.fear<40?'공포 40에서 다음 진화':game.fear<100?'공포 100에서 다음 진화':'최종 진화 · 도시의 악몽';
 $('portrait-art').style.backgroundImage=`url('/public/assets/${p.rank>1?'demon-evolved-sheet':'demon-sheet'}.png')`;$('portrait-art').style.backgroundPosition=p.rank===3?'0 100%':'0 0';
 $('elapsed').textContent=formatTime(game.elapsed);$('phase-label').textContent=!started?'출격 대기':({prologue:'첫 침공 프롤로그',opening:'긴급 뉴스 수신 중',active:'작전 진행 중',paused:'일시정지',won:'작전 성공',lost:'전투 불능'})[game.phase];
 $('objectives').replaceChildren(...game.buildings.filter(b=>b.landmark).map(b=>{const row=document.createElement('div');row.className=`objective${b.hp===0?' destroyed':''}`;const mark=document.createElement('span');mark.className='objective-mark';mark.textContent=b.hp===0?'✓':'⌖';const name=document.createElement('div');name.textContent=b.name;const label=document.createElement('small');label.textContent=b.hp===0?'붕괴 확인':'주요 파괴 목표';name.append(label);const value=document.createElement('span');value.className='target-number';value.textContent=b.hp===0?'완료':`${Math.ceil(b.hp/b.maxHp*100)}%`;row.append(mark,name,value);return row;}));
 $('battle-objectives').querySelector('.objective-heading span').textContent=`${game.buildings.filter(b=>b.landmark&&b.hp===0).length} / 2 파괴`;
 const hero=game.enemies.find(e=>e.kind==='hero');$('threat-fill').style.width=`${Math.min(100,game.threat/130*100)}%`;$('threat-status').textContent=hero.hp<=0?'수호자 격퇴':hero.active?hero.awakened?'각성 수호자 개입':'수호자 개입':'방위군 대응 중';$('tactical-note').textContent=p.grabbed>0?'E를 실제로 여섯 번 눌러 붙잡기에서 탈출하세요. 길게 누르기는 횟수에 포함되지 않습니다.':hero.active&&hero.hp>0?'공격 예고는 Space로 회피, W로 방어하세요. Q 길게 불뿜기 · R 방향 광선. 붙잡기는 E 여섯 번으로 탈출합니다.':'노란 랜드마크에 우클릭 또는 커서를 올리고 A: 접근 후 자동 공격. Q 길게 불뿜기 · W 화염 장막 · E 폭발 돌진 · R 방향 광선.';
 for(const [id,key] of [['fire','fireCooldown'],['dash','dashCooldown'],['dodge','dodgeCooldown'],['beam','beamCooldown']]){$(`${id}-cooldown`).textContent=p[key]>0?`${p[key].toFixed(1)}s`:'';$(`ability-${id}`).classList.toggle('cooling',p[key]>0);}
 $('ability-fire').classList.toggle('casting',!!p.fireBreath);$('ability-block').classList.toggle('casting',p.blocking);$('ability-beam').classList.toggle('casting',!!p.beam);
 $('mission-motivation').textContent=flow?.angered?firstInvasionStory.angerMission:firstInvasionStory.mission;
 $('mission-title').textContent=flow?.angered?'이제, 참지 않겠다.':'산책이 이렇게 끝날 줄이야.';
 $('objective-reason').textContent=flow?.angered?'먼저 쏜 건 저쪽이다. 이제 참지 않겠다.':'산책길에 나타난 방위군. 두 랜드마크가 목표다.';
 $('anger-thought').hidden=!started||game.phase!=='active'||game.elapsed>=angerUntil;
 $('grab-warning').hidden=!started||game.phase!=='active'||p.grabbed<=0;$('escape-count').textContent=`${p.escapeCount} / 6`;$('hero-banner').hidden=!started||game.phase!=='active'||game.elapsed>=heroBannerUntil;
}
function showResult(){input.clear();$('pause').disabled=true;$('grab-warning').hidden=true;$('hero-banner').hidden=true;const won=game.phase==='won';$('result').hidden=false;$('result-eyebrow').textContent=won?'OPERATION COMPLETE · 포르투 작전 성공':'OPERATION FAILED · 다시 일어설 시간';$('result-title').textContent=won?'포르투는 당신을 기억한다.':'아직, 끝이 아니다.';$('result-description').textContent=won?'두 랜드마크의 붕괴가 확인됐습니다. 당신이 남긴 공포가 다음 출격의 힘이 됩니다.':'방위군의 저항에 쓰러졌습니다. 저장된 공포는 유지됩니다. 공격 예고를 읽고 다시 도전하세요.';$('result-targets').textContent=`${game.buildings.filter(b=>b.landmark&&b.hp===0).length} / 2`;$('result-time').textContent=formatTime(game.elapsed);$('result-reward').textContent=`+${game.reward}`;$('result-images').replaceChildren(...news.filter(item=>item.targetId!=='hero').map(item=>{const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=item.image;img.alt=item.headline;caption.textContent=item.headline;figure.append(img,caption);return figure;}));const next=growthForFear(storage.load());$('result-growth').textContent=won?`저장된 공포 ${game.fear} / 160 · 다음 출격: ${['잠든 악의','커지는 재앙','도시의 악몽'][next.rank-1]} · HP ${next.maxHp} · 방어 ${Math.round(next.armor*100)}%`:`저장된 공포 ${storage.load()} / 160 · 실패 시 공포 보상은 지급되지 않습니다.`;audio.play(won?'collapse':'hit');$('retry').focus({preventScroll:true});}
function frame(time){const delta=lastTime?(time-lastTime)/1000:0;lastTime=time;if(started&&game.phase==='active'){const oldResolved=game.player.attackAction?.resolved,oldFire=game.player.fireBreath?.phase,oldBeam=game.player.beam?.phase,oldHp=game.player.hp;updateGame(game,input.read(game.player,game),delta);
  // Capture each event's own scene before the next event is consumed or UI updates.
  for(const event of game.events){if(processed.has(event.id))continue;const capture=renderer.captureEvent(event,game);const item=createNewsItem(event,capture);processed.add(event.id);if(item){news.push(item);renderNews();}if(event.type==='hero-arrived'){heroBannerUntil=game.elapsed+4;$('hero-banner').textContent=game.player.rank===3?'각성한 수호자 루멘이 도시로 진입했습니다.':'도시의 수호자 루멘이 나타났습니다.';}audio.play(event.type==='landmark-destroyed'?'collapse':'hit');}
  if(!oldResolved&&game.player.attackAction?.resolved)audio.play('punch');if(oldFire!=='breath'&&game.player.fireBreath?.phase==='breath')audio.play('fire');if(oldBeam!=='fire'&&game.player.beam?.phase==='fire')audio.play('beam');if(game.player.hp<oldHp)audio.play('hit');if(flow?.noticeDamage(oldHp)){angerUntil=game.elapsed+6;$('anger-copy').textContent=firstInvasionStory.anger;}if(flow?.finish()){input.clear();$('pause').disabled=true;$('hero-banner').hidden=true;$('grab-warning').hidden=true;broadcast.show(createEndingBroadcast(game),renderer.captureScene(game));}updateUI();}
 if(started&&flow?.screen==='active'&&game.phase==='active')renderer.render(game);requestAnimationFrame(frame);}
home();requestAnimationFrame(frame);
