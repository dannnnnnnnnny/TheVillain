import test from 'node:test';import assert from 'node:assert/strict';
import {createGame} from '../src/game/createGame.js';
import {addEffect,updateEffects,MAX_EFFECTS} from '../src/game/effectState.js';
import {attackPose} from '../src/render/attackPose.js';
test('effects have finite coordinates, a fixed cap and expire completely',()=>{const g=createGame();for(let i=0;i<1000;i++)addEffect(g,{kind:'hit',x:i,y:10,life:.3,maxLife:.3});assert.equal(g.effects.length,MAX_EFFECTS);addEffect(g,{x:NaN,y:2,life:1});assert.equal(g.effects.length,MAX_EFFECTS);updateEffects(g,2);assert.deepEqual(g.effects,[]);});
test('anticipation, swing, impact and recovery have distinct bounded sprite poses',()=>{const action={kind:'melee',dx:1,dy:0,impactAt:.26,duration:.68};const poses=[0,.12,.23,.27,.5,.68].map(elapsed=>attackPose({...action,elapsed}));assert.equal(new Set(poses.map(p=>p.phase)).size,4);assert.ok(poses[1].scaleX<1);assert.ok(poses[3].offsetX>0);for(const pose of poses)for(const key of ['offsetX','offsetY','tilt','scaleX','scaleY']){assert.ok(Number.isFinite(pose[key]));assert.ok(Math.abs(pose[key])<60);}assert.deepEqual(attackPose(null),attackPose({...action,elapsed:.68}));});
