import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorldMapGeometry} from '../src/browser/createWorldMapGeometry.js';
const data=JSON.parse(readFileSync(new URL('../public/assets/world-countries.geojson',import.meta.url)));
test('real Natural Earth Portugal is selectable at Porto while France, ocean and Brazil are disabled',()=>{
 const map=createWorldMapGeometry(data);
 assert.equal(map.countryAt(-8.61,41.15),'PRT');
 assert.equal(map.countryAt(2.35,48.85),'FRA');
 assert.equal(map.countryAt(-47.9,-15.8),'BRA');
 assert.equal(map.countryAt(-30,30),null);
 assert.equal(map.isEnabled('PRT'),true);assert.equal(map.isEnabled('PT'),true);
 for(const country of data.features.filter(f=>f.properties.ADM0_A3!=='PRT'))assert.equal(map.isEnabled(country.properties.ADM0_A3),false);
});
test('Portugal marker and geographic picking stay aligned through wide and tall resize',()=>{
 const map=createWorldMapGeometry(data);
 for(const [width,height]of [[1400,620],[800,580],[360,540]]){
  const pixel=map.project(-8.61,41.15,width,height),geo=map.unproject(pixel.x,pixel.y,width,height);
  assert.ok(pixel.x>width*.4&&pixel.x<width*.6);assert.ok(pixel.y>0&&pixel.y<height*.6);
  assert.ok(Math.abs(geo.lon+8.61)<1e-8);assert.ok(Math.abs(geo.lat-41.15)<1e-8);
  assert.equal(map.countryAt(geo.lon,geo.lat),'PRT');
 }
});
test('invalid map data fails explicitly instead of presenting a ready blank map',()=>{
 for(const data of [null,{}, {features:[]},{features:[{geometry:null,properties:{}}]}])assert.throws(()=>createWorldMapGeometry(data),/map/i);
});
