import {isPlayableCountry} from './countrySelection.js';
export function createWorldMapGeometry(data){
 const countries=data?.features?.filter(feature=>['Polygon','MultiPolygon'].includes(feature.geometry?.type));
 if(!countries?.length||!countries.some(feature=>feature.properties?.ADM0_A3==='PRT'))throw new Error('World map data is unavailable');
 function viewport(width,height){const scale=Math.min((width-24)/360,(height-24)/144);return {scale,left:(width-360*scale)/2,top:(height-144*scale)/2};}
 function project(lon,lat,width,height){const {scale,left,top}=viewport(width,height);return {x:left+(lon+180)*scale,y:top+(84-lat)*scale};}
 function unproject(x,y,width,height){const {scale,left,top}=viewport(width,height);return {lon:(x-left)/scale-180,lat:84-(y-top)/scale};}
 function inRing(lon,lat,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const [x,y]=ring[i],[oldX,oldY]=ring[j];
  if((y>lat)!==(oldY>lat)&&lon<(oldX-x)*(lat-y)/(oldY-y)+x)inside=!inside;
 }return inside;}
 function countryAt(lon,lat){for(const feature of countries){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
  if(polygons.some(rings=>inRing(lon,lat,rings[0])&&!rings.slice(1).some(ring=>inRing(lon,lat,ring))))return feature.properties.ADM0_A3;
 }return null;}
 return {countries,project,unproject,countryAt,isEnabled:isPlayableCountry};
}
