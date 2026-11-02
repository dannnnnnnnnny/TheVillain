export function createBroadcastView(root,{onContinue}){
 const $=id=>root.querySelector(`#${id}`);let reconstructionTimer=null;
 function hide(){clearTimeout(reconstructionTimer);reconstructionTimer=null;root.hidden=true;}
 function proceed(){if(root.hidden)return;hide();onContinue();}
 $('broadcast-continue').addEventListener('click',proceed);
 $('broadcast-skip').addEventListener('click',proceed);
 root.addEventListener('keydown',event=>{
  if(event.code==='Enter'){event.preventDefault();event.stopPropagation();if(!event.repeat&&!document.querySelector('dialog[open]'))proceed();}
  if(event.code==='Tab'){const first=$('broadcast-continue'),last=$('broadcast-skip');if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 });
 return {hide,show(model,image){
  hide();root.hidden=false;root.dataset.kind=model.kind;root.classList.remove('is-reconstruction');
  $('broadcast-eyebrow').textContent=model.eyebrow;$('broadcast-title').textContent=model.headline;
  $('broadcast-body').textContent=model.body;$('broadcast-location').textContent=model.location;
  $('broadcast-perspective').textContent=model.perspective??'';$('broadcast-perspective').hidden=!model.perspective;
  $('broadcast-skip').textContent='이야기 건너뛰기';
  $('broadcast-caption').textContent=model.caption;$('broadcast-continue').textContent=model.button;
  $('broadcast-scene').src=image;$('broadcast-scene').alt=model.caption;
  $('broadcast-actual').src=image;$('broadcast-actual').alt='통신 두절 직전 실제 종료 전장 캡처';
  $('broadcast-live').textContent=model.kind==='off-air'?'SIGNAL LOST':'LIVE';
  $('broadcast-actual-wrap').hidden=true;$('broadcast-anchor').hidden=false;
  if(model.kind==='off-air')reconstructionTimer=setTimeout(()=>{
   if(root.hidden)return;root.classList.add('is-reconstruction');
   $('broadcast-scene').src='/public/assets/aftermath.png';$('broadcast-scene').alt='현장 재구성 — 피해자를 안은 성인 생존자와 구조 인력';
   $('broadcast-caption').textContent=`${model.reconstructionLabel} · 픽셀 일러스트`;
   $('broadcast-live').textContent='현장 재구성';$('broadcast-anchor').hidden=true;$('broadcast-actual-wrap').hidden=false;
  },1400);
  $('broadcast-continue').focus({preventScroll:true});
 }};
}
export function renderNewsFeed({feed,count,news,stage,formatTime}){
 count.textContent=String(news.length).padStart(2,'0');
 if(!news.length){feed.innerHTML='<div class="news-empty"><div class="camera-outline"><span>◉</span></div><span>현장 카메라 연결됨</span><p>당신의 첫 번째 사건이<br>뉴스가 되는 순간을 기다립니다.</p><small>실제 플레이 장면으로 기록됩니다.</small></div>';return;}
 feed.replaceChildren(...[...news].reverse().map(item=>{
  const article=document.createElement('article');article.className='news-card';article.dataset.eventId=item.eventId;
  const photo=document.createElement('div');photo.className='news-photo';const image=document.createElement('img');image.src=item.image;image.alt=`${item.headline} — 사건 당시 실제 전장 캡처`;const label=document.createElement('span');label.textContent=item.label;photo.append(image,label);
  const copy=document.createElement('div');copy.className='news-copy';
  const byline=document.createElement('div');byline.className='news-byline';const anchor=document.createElement('img');anchor.src='/public/assets/news-anchor.png';anchor.alt='뉴스 앵커';const station=document.createElement('span');station.textContent=`${stage.channel} · 현장 보도`;byline.append(anchor,station);
  const time=document.createElement('div');time.className='time';const source=document.createElement('span');source.textContent=`${stage.location} · 실제 현장 기록`;const stamp=document.createElement('span');stamp.textContent=formatTime(item.time);time.append(source,stamp);
  const title=document.createElement('h3');title.textContent=item.headline;const body=document.createElement('p');body.textContent=item.body;copy.append(byline,time,title,body);article.append(photo,copy);
  if(item.interview){const interview=document.createElement('figure');interview.className='citizen-interview';interview.dataset.mood=item.interview.mood;
   const portrait=document.createElement('img');portrait.src=item.interview.image;portrait.alt=`${item.interview.person} — ${item.interview.label}`;portrait.loading='lazy';
   const caption=document.createElement('figcaption'),tag=document.createElement('small'),quote=document.createElement('blockquote'),person=document.createElement('span');tag.textContent=item.interview.label;quote.textContent=`“${item.interview.quote}”`;person.textContent=item.interview.person;caption.append(tag,quote,person);interview.append(portrait,caption);article.append(interview);
  }return article;
 }));
}
