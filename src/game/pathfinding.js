// Navigation uses the same solid footprint and playable quay bounds as movement.
export function isWalkable(game,x,y) {
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<70||x>1030||y<70||y>920)return false;
 return game.buildings.every(b=>b.hp<=0||Math.hypot(x-b.x,y-b.y)>=b.radius+game.player.radius*.6+1);
}
export function segmentClear(game,a,b) {
 const distance=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(distance/7));
 for(let i=1;i<=steps;i++)if(!isWalkable(game,a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;
 return true;
}
export function findPath(game,destination,range=0) {
 const start=game.player;
 if(range===0&&!isWalkable(game,destination.x,destination.y))return null;
 if(Math.hypot(start.x-destination.x,start.y-destination.y)<=range)return [];
 if(range===0&&segmentClear(game,start,destination))return [{x:destination.x,y:destination.y}];
 const size=25,cols=39,rows=35,point=id=>({x:70+(id%cols)*size,y:70+Math.floor(id/cols)*size});
 const heuristic=p=>Math.max(0,Math.hypot(p.x-destination.x,p.y-destination.y)-range);
 const open=[],cost=new Map(),parent=new Map(),closed=new Set();
 // Connect the exact player position to nearby grid nodes without cutting through walls.
 for(let y=Math.max(0,Math.floor((start.y-70)/size)-1);y<=Math.min(rows-1,Math.ceil((start.y-70)/size)+1);y++)for(let x=Math.max(0,Math.floor((start.x-70)/size)-1);x<=Math.min(cols-1,Math.ceil((start.x-70)/size)+1);x++){
  const id=y*cols+x,p=point(id);if(!segmentClear(game,start,p))continue;
  const g=Math.hypot(p.x-start.x,p.y-start.y);cost.set(id,g);parent.set(id,null);open.push({id,f:g+heuristic(p)});
 }
 while(open.length){
  open.sort((a,b)=>b.f-a.f);const {id}=open.pop();if(closed.has(id))continue;closed.add(id);const p=point(id);
  if(heuristic(p)<=0||(range===0&&Math.hypot(p.x-destination.x,p.y-destination.y)<size*1.5&&segmentClear(game,p,destination))){
   const path=range===0?[{x:destination.x,y:destination.y}]:[];let node=id;
   while(node!==null){path.unshift(point(node));node=parent.get(node);}return path;
  }
  const x=id%cols,y=Math.floor(id/cols);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   if((!dx&&!dy)||x+dx<0||x+dx>=cols||y+dy<0||y+dy>=rows)continue;
   const next=(y+dy)*cols+x+dx;if(closed.has(next))continue;const q=point(next);if(!segmentClear(game,p,q))continue;
   const g=cost.get(id)+size*Math.hypot(dx,dy);if(g>=(cost.get(next)??Infinity))continue;
   cost.set(next,g);parent.set(next,id);open.push({id:next,f:g+heuristic(q)});
  }
 }return null;
}
