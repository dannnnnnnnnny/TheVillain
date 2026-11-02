// Wait for the source atlas before exposing the new art, so an intermediate load
// never falls back to clipping these intentionally uneven pose rectangles.
export function loadActionSheet(path){
 const image=new Image();
 image.ready=fetch(path.replace(/\.png$/,'.atlas.json')).then(response=>{
  if(!response.ok)throw new Error('Action atlas unavailable');return response.json();
 }).then(atlas=>new Promise(resolve=>{image.onload=()=>{image.atlas=atlas;resolve();};image.onerror=resolve;image.src=path;})).catch(()=>{});
 return image;
}
