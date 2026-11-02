export function createAudio(){
 let context,enabled=false;
 function unlock(){if(!context){const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext)context=new AudioContext();}if(context?.state==='suspended')context.resume().catch(()=>{});}
 function play(kind){if(!enabled||!context||context.state!=='running')return;const oscillator=context.createOscillator(),gain=context.createGain();oscillator.connect(gain);gain.connect(context.destination);oscillator.type=['collapse','fire','beam'].includes(kind)?'sawtooth':'triangle';const now=context.currentTime,freq=kind==='punch'?110:kind==='collapse'?65:kind==='hit'?170:kind==='fire'?72:kind==='beam'?260:440;oscillator.frequency.setValueAtTime(freq,now);oscillator.frequency.exponentialRampToValueAtTime(freq*.35,now+.16);gain.gain.setValueAtTime(kind==='collapse'?.055:.035,now);gain.gain.exponentialRampToValueAtTime(.001,now+.2);oscillator.start(now);oscillator.stop(now+.22);}
 return {unlock,play,toggle(){unlock();enabled=!enabled;return enabled;},get enabled(){return enabled;}};
}
