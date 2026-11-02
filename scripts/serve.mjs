import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const port=Number(process.env.PORT||5173);
const types=new Map([['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.png','image/png'],['.svg','image/svg+xml'],['.json','application/json']]);
http.createServer(async(req,res)=>{
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const filename=path.resolve(root,`.${pathname==='/'?'/index.html':pathname}`);if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}const info=await stat(filename);if(!info.isFile()){res.writeHead(404);res.end('Not found');return;}const body=await readFile(filename);res.writeHead(200,{'Content-Type':types.get(path.extname(filename))||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);}catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Villain is playable at http://127.0.0.1:${port}`));
