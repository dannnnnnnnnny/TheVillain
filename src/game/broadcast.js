export function createOpeningBroadcast(game){
 const {city,location,channel}=game.stage;
 return {kind:'opening',headline:`${city} 상공, 정체불명의 괴생명체 접근`,eyebrow:`${channel} · 긴급 속보`,body:`${city} 상공에서 정체불명의 괴생명체가 날아오고 있습니다. 시민 여러분은 즉시 안전한 곳으로 대피해 주십시오.`,perspective:'괴생명체…? 화면 속 저 모습이… 나라고?',caption:'첫 침공 프롤로그 · 실제 시작 전장',button:'현장으로 →',location};
}
export function createEndingBroadcast(game){
 const {city,location,channel}=game.stage,buildings=game.buildings;
 const destroyed=buildings.filter(b=>b.hp<=0).length,ratio=buildings.length?destroyed/buildings.length:0;
 const landmarks=buildings.filter(b=>b.landmark&&b.hp<=0).map(b=>b.name);
 const hero=game.enemies.find(e=>e.kind==='hero'),won=game.phase==='won';
 const facts=`전체 ${buildings.length}개 건물 중 ${destroyed}개 붕괴 (${Math.round(ratio*100)}%). ${landmarks.length?`붕괴 확인: ${landmarks.join(', ')}.`:'랜드마크 붕괴는 확인되지 않았습니다.'} ${hero?.hp>0?'수호자 루멘 생존.':hero?'수호자 루멘 전투 불능.':''}`;
 return {kind:ratio>=.8?'off-air':'report',outcome:won?'won':'lost',destroyed,ratio,headline:ratio>=.8?`${city} 현장 통신 두절`:won?`${city} 도심 주요 지구, 폐허로`:`${city} 괴생명체 활동 중단`,eyebrow:`${channel} · ${won?'피해 현장 보도':'전투 종료 보도'}`,body:`${won?'주요 파괴 목표 두 곳의 붕괴가 확인됐습니다.':'방위군의 대응 속에 괴생명체의 활동이 중단됐습니다.'} ${facts}`,caption:'실제 종료 전장 · 현장 카메라',button:'작전 결과 보기 →',location,reconstructionLabel:'현장 재구성'};
}
