// Read-only connectivity diagnostics. No credentials, authentication, bodies or raw errors logged.
import dns from 'node:dns/promises';
import net from 'node:net';
import https from 'node:https';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

export const KNOWN_SELECTEL_ADDRESS_SHA256='35a4617158930d844322efd609613cdec804b70f3f2b72ecbd8b2e76f37243d7';
export const isKnownSelectelAddress=ip=>createHash('sha256').update(ip).digest('hex')===KNOWN_SELECTEL_ADDRESS_SHA256;

const CONTENT_HOST='content.vernatunspeakclub.com';
const PROBE_MS=15_000;
const SAFE_CODES=new Set(['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENETUNREACH','EHOSTUNREACH','EACCES','EPERM','ENOTFOUND','EAI_AGAIN','ENODATA','ESERVFAIL','EFORMERR','ECANCELLED']);
const safeCode=error=>SAFE_CODES.has(error?.code)?error.code:'OTHER_ERROR';
export function configuration(env){
 const rawHost=env.VPS_HOST??'';
 const rawPort=env.VPS_PORT??'';
 const host=rawHost.trim();
 const port=rawPort===''?22:Number(rawPort);
 const hostValid=Boolean(net.isIP(host))||host.length<=253&&host.length>0&&host.replace(/\.$/,'').split('.').every(label=>/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label));
 const portValid=(rawPort===''||/^\d+$/.test(rawPort))&&Number.isInteger(port)&&port>=1&&port<=65535;
 return {host,port,hostValid,portValid,flags:{HOST_empty:host.length===0,HOST_whitespace:/\s/.test(rawHost),HOST_valid:hostValid,PORT_present:rawPort.length>0,PORT_valid:portValid,PORT_uses_default:rawPort===''}};
}
async function addresses(host){
 if(net.isIP(host))return [host];
 const resolver=new dns.Resolver({timeout:3000,tries:1});
 const timeout=setTimeout(()=>resolver.cancel(),PROBE_MS);
 try{
  const answers=await Promise.allSettled([resolver.resolve4(host),resolver.resolve6(host)]);
  return [...new Set(answers.flatMap(r=>r.status==='fulfilled'?r.value:[]))];
 }catch{return []}finally{clearTimeout(timeout)}
}
function tcp(address,port){
 return new Promise(resolve=>{
  let socket,done=false;
  const finish=result=>{if(done)return;done=true;clearTimeout(timer);socket?.destroy();resolve(result)};
  const timer=setTimeout(()=>finish('timeout'),PROBE_MS);
  try{
   socket=net.createConnection({host:address,port});
   socket.once('connect',()=>finish('ok'));
   socket.once('error',error=>finish(error.code==='ETIMEDOUT'?'timeout':safeCode(error)));
  }catch(error){finish(safeCode(error))}
 });
}
async function tcpAny(ips,port,valid=true){
 if(!valid)return 'skipped_invalid_configuration';
 if(!ips.length)return 'skipped_unresolved';
 // Multiple DNS answers are alternate routes to this same configured target, not a port scan.
 const results=await Promise.all(ips.map(ip=>tcp(ip,port)));
 return results.includes('ok')?'ok':results.includes('timeout')?'timeout':results[0];
}
function contentHTTPS(){
 return new Promise(resolve=>{
  let request,done=false;
  const finish=result=>{if(done)return;done=true;clearTimeout(timer);request?.destroy();resolve(result)};
  const timer=setTimeout(()=>finish('timeout'),PROBE_MS);
  try{
   request=https.get(`https://${CONTENT_HOST}/`,{headers:{'User-Agent':'Vernatun-readonly-connectivity/1'}},response=>{
    const status=response.statusCode;response.resume();finish(Number.isInteger(status)?status:'OTHER_ERROR');
   });
   request.once('error',error=>finish(safeCode(error)));
  }catch(error){finish(safeCode(error))}
 });
}
export async function diagnose(env){
 const c=configuration(env);
 const httpsResult=contentHTTPS();
 const [hostIPs,contentIPs,referenceIPs]=await Promise.all([c.hostValid?addresses(c.host):[],addresses(CONTENT_HOST),addresses('github.com')]);
 const [ssh,http,httpsPort,reference,httpsStatus,contentSSH]=await Promise.all([
  tcpAny(hostIPs,c.port,c.hostValid&&c.portValid),tcpAny(hostIPs,80,c.hostValid),tcpAny(hostIPs,443,c.hostValid),tcpAny(referenceIPs,22),httpsResult,tcpAny(contentIPs,c.port,c.portValid),
 ]);
 return {...c.flags,HOST_resolves:hostIPs.length>0,CONTENT_resolves:contentIPs.length>0,
  knownSelectelDNSmatch:contentIPs.some(isKnownSelectelAddress),
  HOST_matches_content_DNS:hostIPs.length&&contentIPs.length?hostIPs.some(ip=>contentIPs.includes(ip)):null,
  TCP_configured_SSH:ssh,content_domain_TCP_SSH:contentSSH,TCP_target80:http,TCP_target443:httpsPort,TCP_reference_GitHub22:reference,contentHTTPS_status:httpsStatus};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const deadline=setTimeout(()=>{console.log('DIAGNOSTIC_deadline_reached=true');process.exit(0)},55_000);
 try{for(const [key,value]of Object.entries(await diagnose(process.env)))console.log(`${key}=${value}`)}
 catch{console.log('DIAGNOSTIC_internal_failure=true');process.exitCode=1}
 finally{clearTimeout(deadline)}
}
