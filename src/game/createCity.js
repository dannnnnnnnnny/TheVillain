export function createCity(seed = 7) {
  const buildings = [];
  let randomState = Number(seed) || 7;
  const random = () => { randomState = (randomState * 1664525 + 1013904223) >>> 0; return randomState / 4294967296; };
  const spots = [[190,200],[350,200],[690,200],[860,200],[190,390],[690,390],[860,390],[190,760],[380,760],[690,810],[860,810],[380,550]];
  spots.forEach(([x,y],i)=>buildings.push({id:`house-${i}`,name:'리베이라 주택',x,y,radius:42,width:70,depth:65,height:55+Math.floor(random()*45),style:i%4,hp:180,maxHp:180,landmark:false,flash:0}));
  buildings.push({id:'tower',name:'클레리구스 탑',x:420,y:370,radius:48,width:72,depth:70,height:190,style:4,hp:1600,maxHp:1600,landmark:true,flash:0});
  buildings.push({id:'cityhall',name:'포르투 시청사',x:820,y:610,radius:66,width:130,depth:82,height:126,style:5,hp:2200,maxHp:2200,landmark:true,flash:0});
  return buildings;
}
