import {cubicOut,quadraticIn} from '../vendor/tweenEasing.js';
export function drawEffect(c,p,e){
 const t=Math.max(0,Math.min(1,1-e.life/e.maxLife)),spread=cubicOut(t),[x,y]=p(e.x,e.y);
 c.save();c.globalAlpha=1-t;
 if(e.kind==='escape'){
  const radius=e.radius??90;c.strokeStyle='#ffdda4';c.lineWidth=7*(1-t)+1;c.beginPath();c.ellipse(x,y,radius*spread*.78,radius*spread*.4,0,0,7);c.stroke();
 }else if(e.kind==='slash'){
  const [ex,ey]=p(e.x+e.dx*e.radius,e.y+e.dy*e.radius,22);c.strokeStyle='#f8d8ff';c.lineWidth=11*(1-t)+2;c.beginPath();c.moveTo(x,y-35);c.quadraticCurveTo(ex+15,ey-40,ex,ey);c.stroke();c.strokeStyle='#fff2bf';c.lineWidth=2;c.stroke();
 }else if(e.kind==='explosion'||e.kind==='impact'||e.kind==='hit'){
  const count=e.kind==='explosion'?20:e.kind==='impact'?12:5,scale=(e.intensity??1)*(e.kind==='explosion'?2:1);
  for(let i=0;i<count;i++){const angle=i*2.4,dist=spread*(18+i*2)*scale,px=x+Math.cos(angle)*dist,py=y+Math.sin(angle)*dist*.5-t*30+quadraticIn(t)*26,size=Math.max(1,(1-t)*(3+i%4*2));c.fillStyle=i%3===0?'#fff0b9':i%3===1?'#c2a58a':'#b5b9aa';c.fillRect(px,py-12,size,size);}
 }else if(e.kind==='number'){
  c.font='bold 17px ui-monospace,monospace';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#252331';c.fillStyle='#fff0b8';const yy=y-45-spread*34;c.strokeText(String(e.amount),x,yy);c.fillText(String(e.amount),x,yy);
 }else if(e.kind==='guard'){
  c.globalCompositeOperation='lighter';c.strokeStyle='#fff2b3';c.lineWidth=5*(1-t)+1;c.beginPath();c.ellipse(x,y-32,27+spread*20,40+spread*15,0,0,7);c.stroke();for(let i=0;i<6;i++){c.fillStyle=i%2?'#ff8d3b':'#e38bff';c.fillRect(x+Math.cos(i)*30*spread,y-30+Math.sin(i)*38*spread,4,4);}
 }else if(e.kind==='dash'){
  c.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const px=x+(i-6)*5-t*(e.dx-e.dy)*20,py=y-14+i%3*6+t*10,size=(1-t)*(3+i%3);c.fillStyle=i%3?'#ff9e48':'#d573f2';c.fillRect(px,py,size,size);}
  c.globalCompositeOperation='source-over';c.fillStyle='#c8b68a';for(let i=0;i<5;i++)c.fillRect(x+(i-2)*8*spread,y+spread*8,5,3);

 }
 c.restore();
}
