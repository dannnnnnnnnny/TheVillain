import test from 'node:test';
import assert from 'node:assert/strict';
import {createFirstInvasionStory} from '../src/game/firstInvasion.js';
import {createOpeningBroadcast} from '../src/game/broadcast.js';
import {createGame} from '../src/game/createGame.js';
import {createBroadcastFlow} from '../src/browser/createBroadcastFlow.js';
test('first-person mystery preserves peaceful tourists and explains a way home without naming the protagonist evil',()=>{
 const story=createFirstInvasionStory();
 assert.match(story.thought,/나는|내가|돌아가/);assert.match(story.body,/시민/);assert.match(story.body,/사진/);
 const beforeNews=[story.title,story.body,story.thought,story.signal].join(' ');
 assert.doesNotMatch(beforeNews,/악마|빌런|악당|괴생명체|공포를|흉터|파괴/);
 assert.match(story.signal,/클레리구스 탑/);assert.match(story.signal,/포르투 시청사/);assert.match(story.signal,/두 봉인/);assert.match(story.signal,/귀환 균열/);
});
test('news reveals the player perspective before gameplay and goals explain the two real destruction targets',()=>{
 const game=createGame(),flow=createBroadcastFlow(game,{initialScreen:'map'});flow.selectCountry('PRT');
 assert.equal(flow.screen,'peace');assert.equal(game.elapsed,0);flow.continue();assert.equal(flow.screen,'opening');
 const news=createOpeningBroadcast(game);assert.match(news.body,/괴생명체/);assert.match(news.perspective,/화면.*나/);
 const story=createFirstInvasionStory();assert.match(story.mission,/두 랜드마크/);assert.match(story.mission,/봉인/);assert.match(story.mission,/돌아/);
 flow.continue();assert.equal(game.phase,'active');assert.equal(game.elapsed,0);
});
