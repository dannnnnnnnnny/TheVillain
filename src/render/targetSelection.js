import {actorBounds} from './actorGeometry.js';
// Project the actual stacked building prisms, including elevated roofs and spires.
function buildingBoxes(b){
 if(b.style===4){const boxes=[];for(let i=0;i<4;i++){const w=74-i*13;boxes.push([b.x,b.y,w,w,i*43,39],[b.x,b.y,w+7,w+7,i*43+39,5]);}return [...boxes,[b.x,b.y,19,19,176,20],[b.x,b.y,6,6,196,19]];}
 if(b.style===5)return [[b.x,b.y,132,84,0,76],[b.x,b.y,140,92,76,9],[b.x,b.y-8,38,38,85,75],[b.x,b.y-8,47,47,160,7],[b.x,b.y-8,7,7,167,24]];
 return [[b.x,b.y,b.width,b.depth,0,b.height],[b.x,b.y,b.width+6,b.depth+6,b.height,7],[b.x-12,b.y-11,14,12,b.height+7,10]];
}
function contains(points,x,y){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [a,b]=points[i],[c,d]=points[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;}
function boxFaces(project,[x,y,w,d,z,h]){
 const a=project(x-w/2,y-d/2,z+h),b=project(x+w/2,y-d/2,z+h),c=project(x+w/2,y+d/2,z+h),e=project(x-w/2,y+d/2,z+h);
 return [[a,b,c,e],[b,c,project(x+w/2,y+d/2,z),project(x+w/2,y-d/2,z)],[e,c,project(x+w/2,y+d/2,z),project(x-w/2,y+d/2,z)]];
}
export function targetPolygons(entity,project,time=0,atlas){
 if(entity.width)return buildingBoxes(entity).flatMap(box=>boxFaces(project,box));
 const [x,y]=project(entity.x,entity.y);
 if(entity.kind==='helicopter'){const yy=y-84+Math.sin(time*4)*3;return [[[x-52,yy-23],[x+48,yy-23],[x+48,yy+18],[x-52,yy+18]]];}
 if(entity.kind==='tank')return [[ [x-38,y-43],[x+39,y-43],[x+39,y+10],[x-38,y+10] ]];
 const b=actorBounds(entity,project,time,atlas);return [[[b.left,b.top],[b.right,b.top],[b.right,b.bottom],[b.left,b.bottom]]];
}
export function pickScreenTarget(game,project,x,y,atlas){
 const entities=[...game.buildings,...game.enemies].filter(e=>e.hp>0&&e.active!==false).sort((a,b)=>(b.x+b.y+(b.kind==='helicopter'?1000:0))-(a.x+a.y+(a.kind==='helicopter'?1000:0)));
 return entities.find(e=>targetPolygons(e,project,game.elapsed,atlas).some(p=>contains(p,x,y)))??null;
}
