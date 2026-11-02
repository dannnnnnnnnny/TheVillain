export function createInput(canvas,renderer,{onPause,onClear,isActive=()=>true}={}) {
 const held=new Set();let commands=[],pointer={x:420,y:370},client={x:0,y:0},pointerActive=false,escapePressed=false,dodge=false,cancelOrders=false,currentGame;
 const managed=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyA','KeyQ','KeyW','KeyE','KeyR','Escape']);
 const isUI=target=>target?.closest?.('button,input,dialog,a,[data-menu]');
 function clear(){held.clear();commands=[];escapePressed=false;dodge=false;pointerActive=false;cancelOrders=true;renderer.setHover?.(null);onClear?.();}
 const target=()=>pointerActive?renderer.pickTarget(client.x,client.y,currentGame):null;
 function updatePointer(e){client={x:e.clientX,y:e.clientY};pointer=renderer.screenToWorld(client.x,client.y);pointerActive=true;}
 window.addEventListener('keydown',e=>{
  if(!managed.has(e.code)||document.querySelector('dialog[open]'))return;
  if(e.code==='Escape'){e.preventDefault();if(!e.repeat)onPause?.();return;}
  if(!isActive()||isUI(e.target))return;e.preventDefault();if(e.repeat)return;held.add(e.code);
  if(e.code==='Space')dodge=true;
  if(e.code==='KeyA'){const selected=target();if(selected)commands.push({type:'attack',targetId:selected.id});}
  if(['KeyQ','KeyE','KeyR'].includes(e.code)){pointer=pointerActive?renderer.screenToWorld(client.x,client.y):pointer;commands.push({type:'skill',skill:e.code==='KeyQ'?'q':e.code==='KeyR'?'r':'e',...pointer});}
  if(e.code==='KeyE')escapePressed=true;
 });
 window.addEventListener('keyup',e=>held.delete(e.code));window.addEventListener('blur',clear);
 window.addEventListener('focusin',e=>{if(isUI(e.target))clear();});
 canvas.addEventListener('pointermove',updatePointer);
 canvas.addEventListener('pointerdown',e=>{
  if(!isActive())return;
  updatePointer(e);canvas.focus({preventScroll:true});if(e.button!==2)return;e.preventDefault();
  const selected=target();if(selected)commands.push({type:'attack',targetId:selected.id});
  else{const ground=renderer.clientToGround(client.x,client.y,currentGame);if(ground)commands.push({type:'move',...ground});else renderer.rejectPointer?.(client.x,client.y);}
 });
 window.addEventListener('pointerdown',e=>{if(isUI(e.target))clear();});
 canvas.addEventListener('pointerleave',()=>{pointerActive=false;renderer.setHover?.(null);});canvas.addEventListener('contextmenu',e=>e.preventDefault());
 return {clear,read(player,game){
  currentGame=game;const horizontal=(held.has('ArrowRight')?1:0)-(held.has('ArrowLeft')?1:0),vertical=(held.has('ArrowDown')?1:0)-(held.has('ArrowUp')?1:0);
  if(pointerActive)pointer=renderer.screenToWorld(client.x,client.y);
  renderer.setHover?.(target()?.id??null);
  const frame={moveX:horizontal+vertical,moveY:vertical-horizontal,aimX:pointer.x,aimY:pointer.y,block:held.has('KeyW'),fireHeld:held.has('KeyQ'),dodge,escapePressed,cancelOrders,commands};
  commands=[];dodge=false;escapePressed=false;cancelOrders=false;return frame;
 }};
}
