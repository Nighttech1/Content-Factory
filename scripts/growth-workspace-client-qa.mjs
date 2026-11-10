/** Independent Client scenarios against the real bundle over local HTTPS. No production host or Git token. */
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {startWorkspaceFixture} from './growth-workspace-qa-fixture.mjs';
const require=createRequire(new URL('../веб/package.json',import.meta.url));
const {chromium}=require('playwright');
const stages=['awareness','desire','registration','attendance','return','membership'];
const columns=['task','shooting','development','approval','release'];
const navigation=[['/studio','Студия'],['/schedule','Расписание'],['/settings','Настройки'],['/growth','Ситуационный центр']];
const out=path.resolve('qa-evidence');fs.mkdirSync(out,{recursive:true});
const report={role:'independent project Client',sourceSha:process.env.SOURCE_SHA,fixture:'actual bundle, isolated runtime, real HTTPS/session/CSRF; Git disabled',passed:false,checks:[],errors:[],expectedHttpErrors:[],blockedExternal:[]};
const assert=(value,message)=>{if(!value)throw Error(message)};
const fixture=await startWorkspaceFixture();
const origin=fixture.origin;
const secret=process.env.GROWTH_ADMIN_SECRET;
const redact=value=>secret?String(value).split(secret).join('[redacted QA secret]'):String(value);
const browser=await chromium.launch({headless:true});
let activePage,activeWidth;
const contexts=[];
async function context(options={}){
 const value=await browser.newContext({ignoreHTTPSErrors:true,reducedMotion:'reduce',...options});contexts.push(value);
 await value.route('**/*',route=>{const url=new URL(route.request().url());if(['data:','blob:'].includes(url.protocol)||url.origin===origin)return route.continue();report.blockedExternal.push({host:url.hostname,method:route.request().method()});return route.abort()});
 return value;
}
async function read(owner){const response=await owner.request.get(origin+'/api/growth-workspace');assert(response.ok(),'Workspace GET unavailable');assert((response.headers()['cache-control']||'').includes('no-store'),'Workspace must not cache shared state');return response.json()}
async function command(owner,input){const view=await read(owner);const response=await owner.request.post(origin+'/api/growth-workspace',{headers:{Origin:origin,'Content-Type':'application/json','X-Growth-CSRF':view.capabilities.csrfToken||''},data:{...input,expectedRevision:view.revision,requestId:randomUUID()}});return {response,body:await response.json()}}
async function ready(page){await page.getByTestId('growth-center').waitFor();await page.getByTestId('growth-update-data').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('[data-testid="growth-update-data"]')?.disabled)}
async function load(page){await page.goto(origin+'/growth',{waitUntil:'networkidle'});await ready(page)}
async function noOverflow(page,label){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal document overflow: '+label)}
async function stage(page,id){await page.getByTestId('growth-stage-'+id).click();await page.waitForFunction(id=>document.querySelector('[data-testid="growth-kanban"]')?.getAttribute('data-stage-id')===id&&document.querySelector('[data-testid="growth-weekly-chart"]')?.getAttribute('data-stage-id')===id,id)}
const card=(page,id)=>page.getByTestId('growth-content-card').filter({has:page.getByTestId('growth-open-'+id)});
async function waitColumn(page,id,column){await page.waitForFunction(({id,column})=>document.querySelector(`[data-card-id="${id}"]`)?.getAttribute('data-column')===column,{id,column})}
async function openFact(page){await page.getByTestId('growth-update-data').click();await page.getByTestId('growth-fact-editor').waitFor({state:'visible'})}
async function closeCard(page){await page.getByTestId('growth-card-dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();await page.getByTestId('growth-card-dialog').waitFor({state:'hidden'})}
async function edit(page){await page.getByTestId('growth-card-edit').click();await page.getByTestId('growth-card-save').waitFor({state:'visible'})}
async function saveCard(page){await page.getByTestId('growth-card-save').click();await page.getByTestId('growth-card-edit').waitFor({state:'visible'})}
try{
 const owner=await context({viewport:{width:1440,height:1000}});
 const page=await owner.newPage();activePage=page;activeWidth=1440;await load(page);
 const beforeLogin=await read(owner);assert(!beforeLogin.capabilities.authenticated&&!beforeLogin.capabilities.writeEnabled,'Fresh browser must not inherit OWNER authorization');
 const forbidden=await owner.request.post(origin+'/api/growth-workspace',{headers:{Origin:origin,'Content-Type':'application/json','X-Actor-Role':'OWNER'},data:{type:'save_counts',counts:Object.fromEntries(stages.map(id=>[id,null])),source:'QA forged OWNER',expectedRevision:beforeLogin.revision,requestId:randomUUID()}});
 assert([401,403].includes(forbidden.status()),'Forged client OWNER allowed a server write');
 const lockedSelect=page.locator('select[data-testid^="growth-move-"]').first();assert(await lockedSelect.isDisabled(),'Unauthenticated board is writable');
 await page.getByTestId('growth-update-data').click();await page.getByTestId('growth-owner-secret').fill(secret);await page.getByTestId('growth-owner-unlock').click();await page.getByTestId('growth-fact-editor').waitFor({state:'visible'});await page.getByTestId('growth-fact-cancel').click();
 const sessionCookie=(await owner.cookies()).find(item=>item.name==='growth_workspace_session');assert(sessionCookie?.secure&&sessionCookie.httpOnly&&sessionCookie.sameSite==='Strict','Real protected session cookie missing');
 assert(await page.evaluate(value=>!JSON.stringify({...localStorage}).includes(value)&&!JSON.stringify({...sessionStorage}).includes(value),secret),'Owner secret leaked into browser storage');
 const secondary=await context({viewport:{width:1280,height:900}});
 const login=await secondary.request.post(origin+'/api/growth-workspace/session',{headers:{Origin:origin,'Content-Type':'application/json'},data:{secret}});assert(login.ok(),'Second real HTTPS owner session could not open');
 const otherPage=await secondary.newPage();
 const ownerState=await owner.storageState();
 for(const width of [1440,412,390,360]){
  activeWidth=width;
  const current=width===1440?owner:await context({viewport:{width,height:1000},hasTouch:true,isMobile:true,storageState:ownerState});
  const currentPage=width===1440?page:await current.newPage();activePage=currentPage;
  currentPage.on('pageerror',error=>report.errors.push(`${width}: ${error.message}`));
  currentPage.on('console',message=>{if(message.type()!=='error')return;const text=message.text();if(message.location().url===origin+'/api/growth-workspace'&&/Failed to load resource.*\b(?:400|409)\b/.test(text)){report.expectedHttpErrors.push({width,message:text});return}report.errors.push(`${width}: ${text}`)});
  await load(currentPage);let view=await read(current);
  assert(view.cards.length===24&&new Set(view.cards.map(item=>item.id)).size===24,'Workspace lost original 24 V-IDs');
  assert(view.capabilities.writeEnabled&&!view.capabilities.gitConfigured&&view.git.state==='not_configured'&&view.git.commitSha===null,'Fixture must show honest server-only persistence, never fake Git success');
  const nav=width<768?currentPage.getByRole('navigation',{name:'Разделы фабрики',exact:true}):currentPage.locator('aside[aria-label="Главная навигация"] nav');
  assert(JSON.stringify(await nav.getByRole('link').evaluateAll(items=>items.map(item=>[item.getAttribute('href'),item.textContent.trim()])))===JSON.stringify(navigation),'Navigation must have four sections without Director');
  assert(await currentPage.locator('button[data-testid^="growth-stage-"]').count()===6,'Workspace has more than six stage buttons');
  assert(await currentPage.getByRole('tab').count()===0,'Old dashboard subtabs remain');
  for(const oldId of ['growth-content-mechanics','growth-center-global-planned','growth-meetings-chart'])assert(await currentPage.getByTestId(oldId).count()===0,'Old dashboard block remains: '+oldId);
  assert(await currentPage.getByTestId('growth-weekly-chart').count()===1,'Workspace must have exactly one weekly graph');
  for(const id of stages){
   await stage(currentPage,id);
   const actual=await currentPage.getByTestId('growth-content-card').evaluateAll(items=>items.map(item=>item.dataset.cardId));
   const expected=view.cards.filter(item=>item.stageIds.includes(id)).map(item=>item.id).sort();
   assert(JSON.stringify(actual.sort())===JSON.stringify(expected),'Stage filter leaked or lost cards: '+id);
   assert((await currentPage.getByTestId('growth-weekly-chart').innerText()).includes('разрыв, а не ноль'),'Weekly unknown-vs-zero explanation missing');
   const latest=new Map();for(const point of view.snapshots)if(!latest.has(point.weekKey)||latest.get(point.weekKey).version<point.version)latest.set(point.weekKey,point);
   if(![...latest.values()].some(point=>point.counts[id]!==null)){assert((await currentPage.getByTestId('growth-weekly-chart').innerText()).includes('Недельных замеров пока нет'),'Unknown weekly series was shown as observed growth');assert(await currentPage.getByTestId('growth-weekly-chart').locator('svg.recharts-surface').count()===0,'Unknown weekly series has an invented plotted value')}
  }
  await stage(currentPage,'awareness');await noOverflow(currentPage,`${width} compact header`);await currentPage.screenshot({path:`${out}/workspace-client-hero-${width}.png`});
  const weekly=currentPage.getByTestId('growth-weekly-chart');await weekly.locator('.recharts-dot').first().waitFor({state:'visible'});
  if(width===1440)await weekly.locator('.recharts-dot').first().hover();else await weekly.locator('.recharts-dot').first().tap();
  await weekly.getByText(/Исправленный снимок · версия/).waitFor({state:'visible'});assert((await weekly.innerText()).includes('QA'),'Correction tooltip lacks the isolated measurement source');await weekly.screenshot({path:`${out}/workspace-client-weekly-${width}.png`});

  // User story: edit all six current-week counts; blanks stay unknown and an actual zero stays zero.
  const beforeCounts=view.counts;
  await openFact(currentPage);await currentPage.getByTestId('growth-fact-awareness').fill('999');await currentPage.getByTestId('growth-fact-cancel').click();
  assert(JSON.stringify((await read(current)).counts)===JSON.stringify(beforeCounts),'Cancel changed shared facts');
  await openFact(currentPage);
  const counts={awareness:width===1440?27:width===412?28:width===390?29:30,desire:null,registration:0,attendance:null,return:null,membership:null};
  for(const id of stages)await currentPage.getByTestId('growth-fact-'+id).fill(counts[id]===null?'':String(counts[id]));
  await currentPage.getByTestId('growth-fact-source').fill(`Independent Client QA ${width}: synthetic fixture only`);await currentPage.getByTestId('growth-fact-save').click();await currentPage.getByTestId('growth-fact-editor').waitFor({state:'hidden'});
  view=await read(current);assert(JSON.stringify(view.counts)===JSON.stringify(counts),'Fact save changed null into zero or lost values');
  await stage(currentPage,'desire');assert((await currentPage.getByTestId('growth-stage-desire').locator('strong').innerText()).trim()==='Нет данных','Unknown fact is not visibly distinct from zero');
  await stage(currentPage,'registration');assert((await currentPage.getByTestId('growth-stage-registration').locator('strong').innerText()).trim()==='0','An actual measured zero is not displayed as zero');
  await stage(currentPage,'awareness');
  assert(view.git.state==='not_configured'&&view.git.commitSha===null,'Server save is falsely labelled Git commit');
  assert((await currentPage.getByTestId('growth-workspace-status').innerText()).includes('GitHub не настроен'),'UI hides missing Git delivery');
  await currentPage.reload({waitUntil:'networkidle'});await ready(currentPage);assert(JSON.stringify((await read(current)).counts)===JSON.stringify(counts),'Facts disappeared after reload');
  await load(otherPage);assert(JSON.stringify((await read(secondary)).counts)===JSON.stringify(counts),'Another browser context sees different shared facts');
  await otherPage.getByTestId('growth-mode-fact').click();await stage(otherPage,'awareness');assert((await otherPage.getByTestId('growth-stage-awareness').innerText()).includes(String(counts.awareness)),'Another browser does not display saved facts');
  if(width===1440){
   await openFact(currentPage);await currentPage.getByTestId('growth-fact-awareness').fill('777');
   const concurrentCounts={...counts,awareness:31};const concurrent=await command(secondary,{type:'save_counts',counts:concurrentCounts,source:'Independent Client second-context synthetic concurrent save'});assert(concurrent.response.ok(),'Concurrent fixture edit failed');
   await currentPage.getByTestId('growth-fact-save').click();await currentPage.getByText(/другом устройстве/).first().waitFor({state:'visible'});
   assert((await read(current)).counts.awareness===31,'Stale owner form overwrote a concurrent save');await currentPage.getByTestId('growth-fact-cancel').click();
  }

  // Every format can move arbitrarily, including backwards; release-column placement alone is not publication.
  await currentPage.getByTestId('growth-mode-plan').click();view=await read(current);
  const examples=[view.cards.find(item=>/карусел/i.test(item.format)&&!item.publication),view.cards.find(item=>/статья|текст/i.test(item.format)&&!item.publication)];
  assert(examples.every(Boolean),'Fixture must retain original carousel and article cards');
  for(const example of examples){
   await stage(currentPage,example.stageIds[0]);
   for(const column of ['release','shooting','approval','development','task']){await currentPage.getByTestId('growth-move-'+example.id).selectOption(column);await waitColumn(currentPage,example.id,column);assert((await read(current)).cards.find(item=>item.id===example.id).publication===null,'Moving into a workflow column invented publication proof')}
   const labels=await currentPage.getByTestId('growth-move-'+example.id).locator('option').allTextContents();assert(labels[2]==='Монтаж/Разработка','Shared third column does not support article development');
  }
  const example=examples[0];await stage(currentPage,example.stageIds[0]);
  if(width===1440){await card(currentPage,example.id).dragTo(currentPage.getByTestId('growth-column-shooting'));await waitColumn(currentPage,example.id,'shooting')}
  await currentPage.getByTestId('growth-mode-fact').click();assert(await currentPage.getByTestId('growth-open-'+example.id).count()===0,'An unproven card appears in Fact');await currentPage.getByTestId('growth-mode-plan').click();

  // User story: replace an unknown script without rebuilding; source/proof have their own validation.
  await currentPage.getByTestId('growth-open-'+example.id).click();await currentPage.getByTestId('growth-card-dialog').waitFor();
  for(const id of ['script','shots','origin','department','publication'])assert(await currentPage.getByTestId('growth-card-'+id).isVisible(),'Card dialog missing '+id);
  await edit(currentPage);await currentPage.getByTestId('growth-edit-script').fill(`Independent Client ${width} fixture script: hook → useful moment → invitation.`);await saveCard(currentPage);
  assert((await currentPage.getByTestId('growth-card-script').innerText()).includes(`Independent Client ${width}`),'Saved script not shown');
  const updated=(await read(secondary)).cards.find(item=>item.id===example.id);assert(updated.script.includes(`Independent Client ${width}`),'Second context cannot read edited script');
  const priorRevision=(await read(current)).revision;
  const unsafe=await command(current,{type:'update_card',cardId:example.id,patch:{publication:{url:'javascript:alert(1)',publishedAt:'2026-01-01'}}});assert(!unsafe.response.ok()&&(await read(current)).revision===priorRevision,'Unsafe publication URL was accepted');
  await edit(currentPage);
  const today=new Date(Date.now()+3*3600000).toISOString().slice(0,10),future=new Date(Date.now()+10*86400000).toISOString().slice(0,10);
  await currentPage.getByTestId('growth-edit-publication-url').fill('https://example.org/qa-only/'+example.id);await currentPage.getByTestId('growth-edit-publication-date').fill(future);await currentPage.getByTestId('growth-card-save').click();await currentPage.getByRole('alert').first().waitFor({state:'visible'});
  assert((await read(current)).cards.find(item=>item.id===example.id).publication===null,'Future publication proof was accepted');await currentPage.getByTestId('growth-card-cancel').click();
  await edit(currentPage);await currentPage.getByTestId('growth-edit-publication-url').fill('https://example.org/qa-only/'+example.id);await currentPage.getByTestId('growth-edit-publication-date').fill(today);await saveCard(currentPage);await closeCard(currentPage);
  await currentPage.getByTestId('growth-mode-fact').click();await currentPage.getByTestId('growth-open-'+example.id).waitFor({state:'visible'});assert(await card(currentPage,example.id).getByRole('link',{name:'Опубликовано ↗',exact:true}).isVisible(),'Valid owner-entered proof is not available in Fact');
  await currentPage.getByTestId('growth-open-'+example.id).click();await edit(currentPage);await currentPage.getByTestId('growth-edit-publication-url').fill('');await currentPage.getByTestId('growth-edit-publication-date').fill('');await saveCard(currentPage);await closeCard(currentPage);assert(await currentPage.getByTestId('growth-open-'+example.id).count()===0,'Removing proof did not remove card from Fact');await currentPage.getByTestId('growth-mode-plan').click();

  // Update is an explicit manual queue action, not a trend search or an already-sent Git commit.
  const requestsBefore=(await read(current)).scoutRequests.length;
  await currentPage.reload({waitUntil:'networkidle'});await ready(currentPage);await stage(currentPage,example.stageIds[0]);assert((await read(current)).scoutRequests.length===requestsBefore,'Mount/reload automatically queued Scout');
  await currentPage.getByTestId('growth-open-'+example.id).click();
  const queuedResponse=currentPage.waitForResponse(response=>response.url()===origin+'/api/growth-workspace'&&response.request().method()==='POST');
  await currentPage.getByTestId('growth-request-scout').click();const queued=await queuedResponse;assert(queued.ok(),'Manual Scout queue action was not confirmed');const queuedView=await queued.json();
  await currentPage.getByTestId('growth-scout-request-status').filter({hasText:queuedView.commandReceipt.scoutRequestId}).waitFor({state:'visible'});
  const requestText=await currentPage.getByTestId('growth-scout-request-status').innerText();assert(requestText.includes('не отправлен в GitHub')&&requestText.includes('Разведка не запускалась'),'Manual queue falsely claims Git delivery or running Scout');
  const afterRequest=await read(current);assert(afterRequest.scoutRequests.length===requestsBefore+1,'One manual action did not create exactly one request');const request=afterRequest.scoutRequests.at(-1);assert(request.cardId===example.id&&request.status==='queued'&&request.commitSha===null,'Unconfigured Git request is falsely marked sent');
  await noOverflow(currentPage,`${width} owner modal`);await currentPage.screenshot({path:`${out}/workspace-client-card-${width}.png`});await closeCard(currentPage);
  assert(await currentPage.getByTestId('growth-weekly-chart').count()===1,'Extra chart appeared after edits');await noOverflow(currentPage,`${width} board`);await currentPage.screenshot({path:`${out}/workspace-client-board-${width}.png`,fullPage:true});
  fs.writeFileSync(`${out}/workspace-client-dom-${width}.txt`,redact(await currentPage.locator('body').ariaSnapshot()));
  report.checks.push({width,navFour:true,sixStages:true,oneWeeklyChart:true,visibleCorrectionSource:true,unknownWeeklySeriesNotPlotted:true,factsCancelSaveReloadAndSecondContext:true,unknownDistinctFromZero:true,arbitraryBackwardCarouselAndArticleMoves:true,desktopDrag:width===1440,scriptEditPersisted:true,unsafeAndFutureProofDenied:true,factRequiresProof:true,manualScoutOnly:true,honestNoGit:true,overflow:false});
  if(width!==1440)await currentPage.close();
 }
 // The old direct route remains reachable, with its chat, despite removal from navigation.
 await page.goto(origin+'/marketing',{waitUntil:'networkidle'});await page.getByRole('tab',{name:'Чат директора',exact:true}).click();await page.getByTestId('marketing-director-root').waitFor();assert(await page.getByLabel('Сообщение директору').isVisible(),'Legacy director chat unavailable');
 await page.goto(origin+'/studio',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Студия',exact:true}).waitFor();
 report.legacyChat=true;report.studio=true;assert(report.errors.length===0,'Browser application errors: '+report.errors.join('; '));assert(report.blockedExternal.length===0,'Unexpected external service calls were blocked');report.passed=true;
}catch(error){report.failure={width:activeWidth,message:redact(error.message)};if(activePage&&!activePage.isClosed()){await activePage.screenshot({path:`${out}/workspace-client-failure-${activeWidth}.png`,fullPage:true}).catch(()=>{});fs.writeFileSync(`${out}/workspace-client-failure-${activeWidth}.txt`,redact(await activePage.locator('body').ariaSnapshot().catch(()=>'')))}throw Error(redact(error.message))}
finally{fs.writeFileSync(`${out}/workspace-client-report.json`,redact(JSON.stringify(report,null,2)));await browser.close();await fixture.close()}
