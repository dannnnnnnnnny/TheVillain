import {createWorldMapGeometry} from './createWorldMapGeometry.js';
import {isPlayableCountry} from './countrySelection.js';
export function createWorldMapView(root,{onSelect}){
 const canvas=root.querySelector('#world-map'),marker=root.querySelector('#select-portugal'),status=root.querySelector('#map-status'),retry=root.querySelector('#map-retry');
 let map=null,loading=false;
 const project=(lon,lat,width,height)=>{const scale=Math.min((width-24)/360,(height-24)/144);return {x:(width-360*scale)/2+(lon+180)*scale,y:(height-144*scale)/2+(84-lat)*scale};};
 function select(code){if(root.hidden||!isPlayableCountry(code))return false;onSelect(code);return true;}
 marker.addEventListener('click',()=>select('PRT'));
 root.querySelector('#start-porto').addEventListener('click',()=>select('PRT'));
 canvas.addEventListener('click',event=>{
  if(root.hidden||!map||event.button!==0)return;
  const rect=canvas.getBoundingClientRect(),point=map.unproject(event.clientX-rect.left,event.clientY-rect.top,rect.width,rect.height),code=map.countryAt(point.lon,point.lat);
  if(!select(code)&&code)status.textContent='이 지역은 잠겨 있습니다. 첫 침공은 포르투갈 · 포르투에서 시작합니다.';
 });
 function draw(){
  const {width,height}=canvas.getBoundingClientRect();if(!width||!height)return;
  canvas.width=Math.round(width);canvas.height=Math.round(height);
  const ctx=canvas.getContext('2d');ctx.fillStyle='#102c42';ctx.fillRect(0,0,width,height);
  ctx.strokeStyle='#34536755';ctx.lineWidth=1;ctx.setLineDash([2,8]);
  for(let lon=-180;lon<=180;lon+=30){const p=project(lon,84,width,height),q=project(lon,-60,width,height);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
  for(let lat=-60;lat<=84;lat+=24){const p=project(-180,lat,width,height),q=project(180,lat,width,height);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}ctx.setLineDash([]);
  if(map){
   // Draw geography once per load/resize at coarse resolution, then nearest-neighbor scale.
   const pixels=document.createElement('canvas');pixels.width=Math.ceil(width/3);pixels.height=Math.ceil(height/3);const land=pixels.getContext('2d'),sx=pixels.width/width,sy=pixels.height/height;
   for(const feature of map.countries){
    const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
    land.beginPath();for(const rings of polygons)for(const ring of rings){ring.forEach(([lon,lat],i)=>{const p=project(lon,lat,width,height);if(i===0)land.moveTo(p.x*sx,p.y*sy);else land.lineTo(p.x*sx,p.y*sy);});land.closePath();}
    land.fillStyle=feature.properties.ADM0_A3==='PRT'?'#f5c979':feature.properties.CONTINENT==='Africa'?'#b3ac79':feature.properties.CONTINENT==='Asia'?'#8e9b73':'#84a586';
    land.fill('evenodd');land.strokeStyle='#395c5666';land.lineWidth=.4;land.stroke();
   }
   land.globalCompositeOperation='source-atop';
   for(let y=0;y<pixels.height;y+=2)for(let x=0;x<pixels.width;x+=2){const noise=(x*19+y*31)%71;if(noise<12){land.fillStyle=noise<4?'#e3d1a32a':'#294d4424';land.fillRect(x,y,noise<4?2:1,1);}}
   land.globalCompositeOperation='source-over';ctx.imageSmoothingEnabled=false;ctx.drawImage(pixels,0,0,width,height);
  }
  for(const pin of root.querySelectorAll('[data-lon]')){const p=project(Number(pin.dataset.lon),Number(pin.dataset.lat),width,height);pin.style.left=`${p.x/width*100}%`;pin.style.top=`${p.y/height*100}%`;}
 }
 async function load(){
  if(loading)return;loading=true;root.dataset.mapState='loading';status.textContent='지구의 국가 지도를 불러오는 중…';retry.hidden=true;
  try{const response=await fetch('/public/assets/world-countries.geojson');if(!response.ok)throw new Error('Map request failed');map=createWorldMapGeometry(await response.json());root.dataset.mapState='ready';status.textContent='첫 작전만 열려 있습니다. 포르투갈을 선택하세요.';}
  catch{root.dataset.mapState='error';status.textContent='지도를 불러오지 못했습니다. 포르투갈 표식으로 첫 침공을 시작하거나 다시 불러올 수 있습니다.';retry.hidden=false;}
  finally{loading=false;draw();}
 }
 retry.addEventListener('click',load);new ResizeObserver(draw).observe(canvas);draw();load();
 return {refresh:draw};
}
