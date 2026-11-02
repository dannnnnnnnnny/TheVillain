import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/game/createGame.js';
import {updateGame} from '../src/game/updateGame.js';
import {createOpeningBroadcast,createEndingBroadcast} from '../src/game/broadcast.js';
import {createBroadcastFlow} from '../src/browser/createBroadcastFlow.js';
test('opening uses the current stage, freezes battle and skip starts exactly once',()=>{const g=createGame(),flow=createBroadcastFlow(g);assert.equal(createOpeningBroadcast(g).headline,'포르투 상공, 정체불명의 괴생명체 접근');const snapshot=JSON.stringify(g);updateGame(g,{moveX:1},.05);assert.equal(JSON.stringify(g),snapshot);assert.equal(flow.continue(),true);assert.equal(g.phase,'active');assert.equal(flow.continue(),false);});
test('ending derives genuine ruins and surviving hero from actual victory facts',()=>{const g=createGame();g.buildings.filter(b=>b.landmark).forEach(b=>{b.hp=0;});g.phase='won';const story=createEndingBroadcast(g);assert.equal(story.kind,'report');assert.equal(story.destroyed,2);assert.ok(story.body.includes(`전체 ${g.buildings.length}개 건물 중 2개`));assert.ok(story.body.includes('루멘 생존'));assert.ok(!story.headline.includes('소멸'));});
test('critical uses actual building deaths at >=80%, not damage, threat or victory',()=>{const g=createGame();g.buildings=Array.from({length:10},(_,i)=>({id:i,hp:i<7?0:1,landmark:false}));g.phase='lost';g.threat=99999;assert.equal(createEndingBroadcast(g).kind,'report');g.buildings[7].hp=0;const story=createEndingBroadcast(g);assert.equal(story.kind,'off-air');assert.equal(story.outcome,'lost');assert.equal(story.ratio,.8);assert.equal(story.reconstructionLabel,'현장 재구성');g.buildings=[];assert.equal(createEndingBroadcast(g).kind,'report');});
test('loss never claims victory; ending/save/result happen once and fresh retry opens anew',()=>{let saves=[];const g=createGame({fear:40}),flow=createBroadcastFlow(g,{save:value=>saves.push(value)});flow.continue();g.phase='lost';assert.equal(flow.finish(),true);assert.ok(createEndingBroadcast(g).body.includes('활동이 중단'));assert.equal(flow.screen,'ending');flow.finish();flow.continue();flow.continue();assert.equal(flow.screen,'result');assert.deepEqual(saves,[]);const retry=createGame({fear:40}),next=createBroadcastFlow(retry,{save:v=>saves.push(v)});next.continue();retry.phase='won';retry.fear=80;next.finish();next.finish();next.continue();assert.deepEqual(saves,[80]);assert.equal(next.screen,'result');});

test('Portugal-only first invasion follows map, peace, evacuation, battle with combat frozen',()=>{
 const g=createGame(),flow=createBroadcastFlow(g,{initialScreen:'map'});
 assert.equal(flow.screen,'map');
 for(const country of ['FRA','BRA','USA',null,''])assert.equal(flow.selectCountry(country),false);
 assert.equal(flow.selectCountry('PT'),true);assert.equal(flow.screen,'peace');
 assert.equal(flow.selectCountry('PRT'),false);
 for(const expected of ['opening','active']){const snapshot=JSON.stringify(g);updateGame(g,{commands:[{type:'skill',skill:'r',x:500,y:500}]},.05);assert.equal(JSON.stringify(g),snapshot);assert.equal(flow.continue(),true);assert.equal(flow.screen,expected);}
 assert.equal(flow.continue(),false);assert.equal(g.phase,'active');
});
test('prologue skip stops at evacuation news and cannot skip directly into battle twice',()=>{
 const g=createGame(),flow=createBroadcastFlow(g,{initialScreen:'map'});flow.selectCountry('PRT');assert.equal(flow.skipPrologue(),true);assert.equal(flow.screen,'opening');assert.equal(flow.skipPrologue(),false);assert.equal(g.elapsed,0);assert.equal(g.phase,'opening');flow.continue();assert.equal(flow.skipPrologue(),false);
});
test('first invasion opening orders evacuation without claiming damage',()=>{const news=createOpeningBroadcast(createGame());assert.ok(news.body.includes('즉시 안전한 곳으로 대피'));assert.ok(news.body.includes('날아오고'));assert.ok(!news.body.includes('붕괴'));assert.ok(news.caption.includes('프롤로그'));});
