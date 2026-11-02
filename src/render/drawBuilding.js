import {prism,tile,polygon,windowPixel} from './pixelArt.js';
export function drawBuilding(ctx,project,b,time) {
 const hp=b.hp/b.maxHp;
 tile(ctx,project,b.x+14,b.y+16,b.width+25,b.depth+20,'#243b4540');
 if(b.hp<=0){
  tile(ctx,project,b.x,b.y,b.width+20,b.depth+16,'#8d8976','#6c7065');
  for(let i=0;i<16;i++){const x=b.x+Math.sin(i*34)*b.width*.45,y=b.y+Math.cos(i*13)*b.depth*.45;prism(ctx,project,x,y,9+i%3*4,8+i%4*3,7+i%4*4,['#d9c6a4','#9c927e','#77776e']);}
  const [x,y]=project(b.x,b.y,20);ctx.fillStyle='#eeb15f';ctx.fillRect(x-4,y-8-Math.sin(time*13)*3,6,16);ctx.fillStyle='#a5978455';ctx.fillRect(x+6,y-35,13,17);ctx.fillRect(x+10,y-50,20,16);return;
 }
 const colors=b.flash>0?['#fff1cc','#f9d7af','#dfbd9c','#6b6a68']:b.style===2?['#dfbfa6','#e4bea1','#b68c78','#6c6259']:['#e8dcc1','#dac9a8','#afa995','#6b7774'];
 if(b.style===4)drawTower(ctx,project,b,colors);
 else if(b.style===5)drawHall(ctx,project,b,colors);
 else{
  prism(ctx,project,b.x,b.y,b.width,b.depth,b.height,colors);
  for(let z=16;z<b.height-10;z+=23){for(let x=-22;x<=22;x+=21)windowPixel(ctx,project,b.x+x,b.y+b.depth/2+.5,z,'front',b.style===1?'#39586c':'#56636a');for(let y=-19;y<=19;y+=19)windowPixel(ctx,project,b.x+b.width/2+.5,b.y+y,z,'side','#455a61');}
  const roof=b.style===1?['#789299','#597681','#3f5d6a']:b.style===3?['#caa36e','#aa7b58','#866047']:['#d78a6c','#bd6e55','#8d5648'];
  prism(ctx,project,b.x,b.y,b.width+6,b.depth+6,7,[...roof,'#625a54'],b.height);
  // Tile ridges keep the roof readable at the game's pixel scale.
  for(let r=-20;r<=20;r+=12){const a=project(b.x+r,b.y-b.depth/2,b.height+8),c=project(b.x+r,b.y+b.depth/2,b.height+8);ctx.strokeStyle='#fff0ca26';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...c);ctx.stroke();}
  prism(ctx,project,b.x-12,b.y-11,14,12,10,['#b5b1a0','#928c7c','#777c76'],b.height+7);
  windowPixel(ctx,project,b.x,b.y+b.depth/2+1,0,'front','#344c52',13,22);
 }
 if(hp<.7){const [x,y]=project(b.x,b.y+b.depth/2,b.height*.6);ctx.strokeStyle='#5d5d57';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+8,y-15);ctx.lineTo(x-2,y);ctx.lineTo(x+8,y+8);ctx.lineTo(x-4,y+23);ctx.stroke();}
 if(hp<.35){const [x,y]=project(b.x-15,b.y+b.depth/2,b.height*.3);ctx.fillStyle='#f09a48';ctx.fillRect(x-7,y-5+Math.sin(time*11)*3,13,22);ctx.fillStyle='#ffe29c';ctx.fillRect(x-3,y+2,6,14);ctx.fillStyle='#46515499';ctx.fillRect(x+3,y-22,13,18);}
 if(b.landmark){const [x,y]=project(b.x,b.y,b.height+(b.style===5?65:15));ctx.font='bold 12px system-ui';ctx.textAlign='center';const label=b.name;const width=ctx.measureText(label).width+22;ctx.fillStyle='#162c35ed';ctx.fillRect(x-width/2,y-28,width,23);ctx.strokeStyle='#edc982';ctx.strokeRect(x-width/2,y-28,width,23);ctx.fillStyle='#ffe3a5';ctx.fillText(label,x,y-12);ctx.fillStyle='#182830';ctx.fillRect(x-36,y-1,72,5);ctx.fillStyle='#edbb78';ctx.fillRect(x-35,y,70*hp,3);}
}
function drawTower(ctx,p,b,c){
 for(let tier=0;tier<4;tier++){
  const w=74-tier*13,z=tier*43;prism(ctx,p,b.x,b.y,w,w,39,c,z);prism(ctx,p,b.x,b.y,w+7,w+7,5,['#eee1c5','#d5c4a4','#a7a18c','#727b73'],z+39);
  for(const off of tier===0?[-19,2,22]:[-10,11]){windowPixel(ctx,p,b.x+off,b.y+w/2+.5,z+8,'front','#4c5657',7,22);windowPixel(ctx,p,b.x+w/2+.5,b.y+off,z+8,'side','#3e5055',7,22);}
 }
 prism(ctx,p,b.x,b.y,19,19,20,c,176);prism(ctx,p,b.x,b.y,6,6,19,['#d49d54','#bd8b48','#916638'],196);
 const [x,y]=p(b.x,b.y,220);ctx.fillStyle='#e4bc70';ctx.fillRect(x-1,y,3,12);ctx.fillRect(x-5,y+3,11,3);
}
function drawHall(ctx,p,b,c){
 prism(ctx,p,b.x,b.y,132,84,76,c);
 for(let z=17;z<70;z+=25)for(let x=-52;x<=52;x+=23)windowPixel(ctx,p,b.x+x,b.y+43,z,'front','#50686f',9,17);
 for(let y=-29;y<39;y+=22)windowPixel(ctx,p,b.x+67,b.y+y,29,'side','#445b64',10,21);
 prism(ctx,p,b.x,b.y,140,92,9,['#91a4a0','#6d8587','#526e78','#66776f'],76);
 for(let x=-54;x<=54;x+=24)prism(ctx,p,b.x+x,b.y+42,8,8,80,['#eee3cc','#ddd2b8','#b0ae9c'],0);
 prism(ctx,p,b.x,b.y-8,38,38,75,c,85);prism(ctx,p,b.x,b.y-8,47,47,7,['#c2c8ae','#939e94','#6a8586'],160);
 const [x,y]=p(b.x,b.y+12,139);ctx.fillStyle='#f4e5c5';ctx.fillRect(x-9,y-7,18,18);ctx.strokeStyle='#58646a';ctx.lineWidth=2;ctx.strokeRect(x-9,y-7,18,18);ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x,y+2);ctx.lineTo(x+5,y+4);ctx.stroke();
 prism(ctx,p,b.x,b.y-8,7,7,24,['#e0ba75','#b89155','#917343'],167);const flag=p(b.x,b.y-8,192);ctx.fillStyle='#ca6b63';ctx.fillRect(flag[0]+1,flag[1],15,8);ctx.fillStyle='#57856b';ctx.fillRect(flag[0]+1,flag[1],5,8);
}
