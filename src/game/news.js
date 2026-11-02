export function createNewsItem(event, image) {
  let headline,body,label;
  if(event.type==='landmark-destroyed'){label='긴급 속보';headline=`${event.targetName}, 끝내 붕괴`;body='현장 카메라에 포착된 보라색 악마. 방위군은 작전 구역의 통제를 강화했다.';}
  else if(event.type==='hero-defeated'){label='전황 속보';headline=`수호자 ${event.targetName}, 전투 불능`;body='현장 영상에서 수호자의 전투 불능이 확인됐다. 주요 목표의 붕괴 여부는 별도 확인 중이다.';}
  else if(event.type==='hero-arrived'){label='현장 연결';headline=`수호자 ${event.targetName}, 작전 구역 진입`;body='도시 수호자의 현장 진입이 카메라에 기록됐다. 방위군의 대응이 이어지고 있다.';}
  else return null;
  return {eventId:event.id,targetId:event.targetId,time:event.time,label,headline,body,image,interview:{mood:event.type==='hero-arrived'?'fear':'grief',label:'극중 시민 인터뷰 · 재구성',image:`/public/assets/citizen-interview-${event.type==='hero-arrived'?'fear':'grief'}.png`,person:event.type==='hero-arrived'?'현장을 지켜보는 시민':'현장 소식을 듣고 있는 시민',quote:event.type==='hero-arrived'?'저 불꽃이 이쪽으로 오고 있어요. 수호자가 막아 줬으면 좋겠어요.':event.type==='hero-defeated'?'루멘마저 쓰러졌다는 소식에… 무슨 말을 해야 할지 모르겠어요.':'늘 보던 건물이 무너지는 걸 보니, 아직도 믿기지 않아요.'}};
}
