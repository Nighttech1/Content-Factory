/** Local-only HTTPS fixture for Secure-cookie browser QA of the real production bundle.
 * No application auth bypass, production hosts, Git calls or reusable secrets.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import {execFileSync} from 'node:child_process';

export async function startWorkspaceFixture(){
 const origin=new URL(process.env.QA_WORKSPACE_ORIGIN||'https://localhost:3443');
 const upstream=new URL(process.env.QA_WORKSPACE_UPSTREAM||'http://127.0.0.1:3000');
 if(origin.protocol!=='https:'||origin.hostname!=='localhost'||origin.pathname!=='/'||origin.username||origin.password||origin.search||origin.hash)throw Error('QA requires exact local HTTPS origin');
 if(upstream.protocol!=='http:'||!['127.0.0.1','localhost'].includes(upstream.hostname)||upstream.pathname!=='/'||upstream.username||upstream.password||upstream.search||upstream.hash)throw Error('QA requires local HTTP upstream');
 if((process.env.GROWTH_ADMIN_SECRET||'').length<32||process.env.GROWTH_ALLOWED_ORIGIN!==origin.origin)throw Error('QA owner/origin fixture configuration missing');
 if(process.env.GROWTH_GITHUB_TOKEN)throw Error('Real Git configuration must be absent from browser QA');
 const dataDirectory=process.env.GROWTH_WORKSPACE_DATA_DIR;
 if(!dataDirectory||!path.isAbsolute(dataDirectory))throw Error('QA requires explicit temporary workspace storage');
 const physical=candidate=>{const suffix=[];let parent=path.resolve(candidate);for(;;){try{return path.resolve(fs.realpathSync(parent),...suffix)}catch(error){if(error.code!=='ENOENT')throw Error('QA storage path cannot be resolved safely');try{fs.lstatSync(parent);throw Error('QA storage contains a dangling symlink')}catch(e){if(e.code!=='ENOENT')throw e}const next=path.dirname(parent);if(next===parent)throw Error('QA storage has no safe existing parent');suffix.unshift(path.basename(parent));parent=next}}};
 const storage=physical(dataDirectory);
 const roots=[os.tmpdir(),process.env.RUNNER_TEMP].filter(Boolean).map(physical);
 if(!roots.some(root=>storage.startsWith(root+path.sep)))throw Error('QA storage must be inside a temporary root');
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'growth-https-qa-'));fs.chmodSync(folder,0o700);
 const key=path.join(folder,'key.pem'),cert=path.join(folder,'cert.pem');
 try{execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-days','1','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1'],{stdio:'ignore'});fs.chmodSync(key,0o600)}
 catch{fs.rmSync(folder,{recursive:true,force:true});throw Error('Unable to create ephemeral QA TLS fixture')}
 const server=https.createServer({key:fs.readFileSync(key),cert:fs.readFileSync(cert)},(request,response)=>{
  const forwarded=http.request({hostname:upstream.hostname,port:upstream.port||80,path:request.url,method:request.method,headers:{...request.headers,host:origin.host,'x-forwarded-proto':'https'}},reply=>{response.writeHead(reply.statusCode||502,reply.headers);reply.pipe(response)});
  forwarded.on('error',()=>{if(!response.headersSent)response.writeHead(502,{'content-type':'application/json'});response.end('{"error":"qa_upstream_unavailable"}')});
  request.on('aborted',()=>forwarded.destroy());request.pipe(forwarded);
 });
 const sockets=new Set();server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket))});
 try{await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(Number(origin.port)||443,'localhost',resolve)})}
 catch{fs.rmSync(folder,{recursive:true,force:true});throw Error('Unable to start local QA HTTPS fixture')}
 return {origin:origin.origin,async close(){for(const socket of sockets)socket.destroy();await new Promise(resolve=>server.close(resolve));fs.rmSync(folder,{recursive:true,force:true})}};
}
