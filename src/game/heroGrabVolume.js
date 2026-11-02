// The locked forward grip footprint is shared by resolution and the ground warning.
export function heroGrabVolume(hero,action){
 const {dx,dy}=action,range=90,halfWidth=24;
 return {
  corners:[
   [hero.x-dy*halfWidth,hero.y+dx*halfWidth],
   [hero.x+dx*range-dy*halfWidth,hero.y+dy*range+dx*halfWidth],
   [hero.x+dx*range+dy*halfWidth,hero.y+dy*range-dx*halfWidth],
   [hero.x+dy*halfWidth,hero.y-dx*halfWidth],
  ],
  contains(x,y){const ox=x-hero.x,oy=y-hero.y,forward=ox*dx+oy*dy,side=ox*dy-oy*dx;return forward>=0&&forward<=range&&Math.abs(side)<=halfWidth;},
 };
}
