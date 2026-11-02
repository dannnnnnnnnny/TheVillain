import test from 'node:test';
import assert from 'node:assert/strict';
import {createNewsItem} from '../src/game/news.js';
test('news uses the actual event target and preserves distinct captured images',()=>{
 const a={id:1,type:'landmark-destroyed',targetId:'tower',targetName:'클레리구스 탑',time:12};
 const b={id:2,type:'hero-defeated',targetId:'hero',targetName:'루멘',time:12};
 const first=createNewsItem(a,'image-of-tower');const second=createNewsItem(b,'image-of-hero');
 assert.match(first.headline,/클레리구스 탑/);assert.doesNotMatch(first.headline,/루멘/);assert.equal(first.image,'image-of-tower');assert.equal(first.eventId,1);
 assert.match(second.headline,/루멘/);assert.equal(second.image,'image-of-hero');assert.equal(second.eventId,2);assert.equal(createNewsItem({type:'invented'},'x'),null);
});
