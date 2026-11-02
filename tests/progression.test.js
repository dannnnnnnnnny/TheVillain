import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFear, growthForFear} from '../src/game/progression.js';
import {createStorage} from '../src/browser/storage.js';
test('fear boundaries select exact growth stats',()=>{
 for(const [fear,rank,hp,armor] of [[0,1,600,0],[39,1,600,0],[40,2,820,.12],[99,2,820,.12],[100,3,1100,.24]]){
  const g=growthForFear(fear); assert.equal(g.rank,rank);assert.equal(g.maxHp,hp);assert.equal(g.armor,armor);
 }
});
test('invalid and excessive fear normalize to a finite bounded number',()=>{
 for(const v of [undefined,null,'abc',{},NaN,Infinity,-4]) assert.equal(normalizeFear(v),0);
 assert.equal(normalizeFear(999),160);assert.equal(normalizeFear('40'),40);assert.equal(normalizeFear(40.9),40);
});
test('corrupt and denied local storage remains playable in memory',()=>{
 const denied=createStorage({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}});
 assert.equal(denied.load(),0);assert.equal(denied.save(40),40);assert.equal(denied.load(),40);denied.reset();assert.equal(denied.load(),0);
 const values=new Map([['villain.fear.v1','{"bad":true}'],['unrelated','keep']]);
 const stored=createStorage({getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)});
 assert.equal(stored.load(),0);stored.save(100);assert.equal(stored.load(),100);stored.reset();assert.equal(values.get('unrelated'),'keep');assert.equal(stored.load(),0);
});
