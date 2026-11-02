import test from 'node:test';
import assert from 'node:assert/strict';
import {createFirstInvasionStory} from '../src/game/firstInvasion.js';
import {createOpeningBroadcast} from '../src/game/broadcast.js';
import {createGame} from '../src/game/createGame.js';
import {createBroadcastFlow} from '../src/browser/createBroadcastFlow.js';
import {hitPlayer} from '../src/game/combat.js';
test('ordinary wakeup and upstairs noise lead to a peaceful first-person walk without revealing identity',()=>{
 const story=createFirstInvasionStory();
 assert.match(story.waking.title,/아침/);assert.match(story.waking.body,/위층/);assert.match(story.waking.thought,/아… 또 시끄럽네.*산책/);
 assert.match(story.peace.body,/시민/);assert.match(story.peace.body,/사진/);assert.match(story.peace.thought,/산책/);
 const beforeNews=JSON.stringify([story.waking,story.peace]);
 assert.doesNotMatch(beforeNews,/악마|빌런|악당|괴생명체|봉인|균열|귀환|파괴/);
});
test('waking then city walk precede news identity reveal and player-controlled destruction rationale',()=>{
 const game=createGame(),flow=createBroadcastFlow(game,{initialScreen:'map'});flow.selectCountry('PRT');
 assert.equal(flow.screen,'waking');flow.continue();assert.equal(flow.screen,'peace');assert.equal(game.elapsed,0);flow.continue();assert.equal(flow.screen,'opening');
 const news=createOpeningBroadcast(game);assert.match(news.body,/보라색 괴생명체/);assert.match(news.perspective,/나/);
 const story=createFirstInvasionStory();assert.match(story.mission,/두 랜드마크/);assert.match(story.mission,/방위군/);assert.doesNotMatch(story.mission,/봉인|균열|귀환/);
 flow.continue();assert.equal(game.phase,'active');assert.equal(game.elapsed,0);
});
test('first genuine combat damage provokes anger once without damaging any buildings or changing control',()=>{
 const game=createGame(),flow=createBroadcastFlow(game);const before=game.player.hp;assert.equal(flow.noticeDamage(before),false);flow.continue();assert.equal(flow.noticeDamage(before),false);
 const buildings=JSON.stringify(game.buildings);hitPlayer(game,30);assert.ok(game.player.hp<before);assert.equal(flow.noticeDamage(before),true);assert.equal(flow.angered,true);assert.equal(JSON.stringify(game.buildings),buildings);assert.equal(game.phase,'active');assert.equal(flow.noticeDamage(before),false);
 const retry=createGame(),next=createBroadcastFlow(retry);next.continue();const hp=retry.player.hp;hitPlayer(retry,30);assert.equal(next.noticeDamage(hp),true);
});
