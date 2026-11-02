export function polygon(ctx, points, fill, stroke) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.closePath();
  ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
}
export function tile(ctx,project,x,y,w,d,color,stroke){polygon(ctx,[project(x-w/2,y-d/2),project(x+w/2,y-d/2),project(x+w/2,y+d/2),project(x-w/2,y+d/2)],color,stroke);}
export function prism(ctx,project,x,y,w,d,h,colors,z=0) {
 const a=project(x-w/2,y-d/2,z+h),b=project(x+w/2,y-d/2,z+h),c=project(x+w/2,y+d/2,z+h),f=project(x-w/2,y+d/2,z+h);
 polygon(ctx,[f,c,project(x+w/2,y+d/2,z),project(x-w/2,y+d/2,z)],colors[1],colors[3]);
 polygon(ctx,[b,c,project(x+w/2,y+d/2,z),project(x+w/2,y-d/2,z)],colors[2],colors[3]);polygon(ctx,[a,b,c,f],colors[0],colors[3]);
}
export function windowPixel(ctx,project,x,y,z,face,color='#3d5266',w=9,h=13) {
 if(face==='front')polygon(ctx,[project(x-w/2,y,z+h),project(x+w/2,y,z+h),project(x+w/2,y,z),project(x-w/2,y,z)],color);
 else polygon(ctx,[project(x,y-w/2,z+h),project(x,y+w/2,z+h),project(x,y+w/2,z),project(x,y-w/2,z)],color);
}
export function tree(ctx,project,x,y,variant=0) {
 const [sx,sy]=project(x,y);ctx.fillStyle='#1e493d55';ctx.fillRect(sx-13,sy-2,27,8);ctx.fillStyle='#76523f';ctx.fillRect(sx-3,sy-22,6,23);
 const c=variant%3===0?['#315c43','#568351','#88a85a']:['#1d6659','#298573','#57a37e'];
 ctx.fillStyle='#193c3c';ctx.fillRect(sx-14,sy-44,28,23);ctx.fillRect(sx-8,sy-51,17,9);ctx.fillRect(sx-19,sy-36,34,13);
 ctx.fillStyle=c[0];ctx.fillRect(sx-12,sy-43,24,23);ctx.fillStyle=c[1];ctx.fillRect(sx-13,sy-43,19,16);ctx.fillRect(sx-6,sy-49,13,18);ctx.fillStyle=c[2];ctx.fillRect(sx-6,sy-47,9,7);ctx.fillRect(sx-12,sy-38,7,8);
}
export function fallbackDemon(ctx,x,y,size,facing,time) {
 ctx.save();ctx.translate(x,y);ctx.scale(size/64*facing,size/64);const bob=Math.sin(time*7)*1.5;
 ctx.translate(0,bob);ctx.fillStyle='#201b36';ctx.fillRect(-24,-44,48,35);ctx.fillRect(-20,-55,40,48);ctx.fillRect(-31,-33,62,22);ctx.fillRect(-20,-16,15,16);ctx.fillRect(7,-16,15,16);
 ctx.fillStyle='#703bbb';ctx.fillRect(-22,-43,44,33);ctx.fillRect(-17,-53,34,37);ctx.fillRect(-29,-31,15,17);ctx.fillRect(16,-31,15,17);ctx.fillRect(-18,-14,12,12);ctx.fillRect(8,-14,12,12);
 ctx.fillStyle='#a35be0';ctx.fillRect(-16,-48,27,21);ctx.fillRect(-12,-27,25,15);ctx.fillStyle='#e6d1a7';ctx.fillRect(-17,-59,7,13);ctx.fillRect(11,-59,7,13);ctx.fillStyle='#d9fc59';ctx.fillRect(-11,-40,8,5);ctx.fillRect(7,-40,8,5);ctx.fillStyle='#211832';ctx.fillRect(-8,-31,20,4);ctx.restore();
}
