/** Independent Client user stories; actual bundle/TLS, synthetic temporary prepared state only. */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {startWorkspaceFixture} from './growth-workspace-qa-fixture.mjs';
const require=createRequire(new URL('../веб/package.json',import.meta.url));
const {chromium}=require('playwright');
const out=path.resolve('qa-evidence');fs.mkdirSync(out,{recursive:true});
const secret=process.env.GROWTH_ADMIN_SECRET;
const redact=s=>secret?String(s).split(secret).join('[redacted QA secret]'):String(s);
const report={role:'independent Client',sourceSha:process.env.SOURCE_SHA,fixture:'actual bundle, temporary synthetic prepared catalog, real HTTPS/session; no production/research/Git',passed:false,checks:[],errors:[],external:[]};
const assert=(v,m)=>{if(!v)throw Error(m)};
const fixture=await startWorkspaceFixture(),origin=fixture.origin;
const browser=await chromium.launch({headless:true});
const stages=['awareness','desire','registration','attendance','return','membership'];
const columns=['task','shooting','development','approval','release'];
let page,action,width;
async function context(options={}){
 const c=await browser.newContext({ignoreHTTPSErrors:true,reducedMotion:'reduce',...options});
 await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push({host:u.hostname,method:r.request().method()});return r.abort()});return c;
}
async function read(c){const r=await c.request.get(origin+'/api/growth-workspace');assert(r.ok(),'Shared workspace GET failed');return r.json()}
async function load(p){await p.goto(origin+'/growth',{waitUntil:'networkidle'});await p.getByTestId('growth-kanban').waitFor();await p.getByTestId('growth-content-card').first().waitFor()}
async function selectStage(id){await page.getByTestId('growth-stage-'+id).click();await page.waitForFunction(id=>document.querySelector('[data-testid="growth-kanban"]')?.dataset.stageId===id&&document.querySelector('[data-testid="growth-weekly-chart"]')?.dataset.stageId===id,id)}
async function idle(id){await page.waitForFunction(id=>{const n=document.querySelector(`[data-testid="growth-move-${id}"]`);return n&&!n.disabled},id)}
async function waitColumn(id,column){await page.waitForFunction(({id,column})=>document.querySelector(`[data-card-id="${id}"]`)?.dataset.column===column,{id,column});await idle(id)}
async function move(id,column){await idle(id);await page.getByTestId('growth-move-'+id).selectOption(column);await waitColumn(id,column)}
async function close(){await page.getByTestId('growth-card-dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();await page.getByTestId('growth-card-dialog').waitFor({state:'hidden'})}
async function save(){await page.getByTestId('growth-card-save').click();await page.getByTestId('growth-card-edit').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('[data-testid="growth-card-edit"]')?.disabled)}
async function noOverflow(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal document overflow')}
try{
 const reader=await context({viewport:{width:1440,height:1000}});page=await reader.newPage();await load(page);
 const anon=await read(reader);assert(!anon.capabilities.authenticated&&!anon.capabilities.writeEnabled,'Anonymous inherited owner permission');
 assert(anon.cards.length===24&&anon.activeCardIds.length===6&&anon.archivedCardCount===18,'Legacy archive or isolated active fixture changed');
 const ids=new Set(anon.activeCardIds);assert(ids.size===6&&anon.activeCardIds.every(id=>anon.preparedDetails[id]?.provenance.director.decision==='approved'),'Unapproved active material');
 assert(await page.getByTestId('growth-drag-'+anon.activeCardIds[0]).isDisabled(),'Anonymous drag enabled');
 assert(await page.getByTestId('growth-move-'+anon.activeCardIds[0]).isDisabled(),'Anonymous move enabled');
 // API session is the fixture only; removed public owner controls are not reintroduced.
 const owner=await context({viewport:{width:1440,height:1000}});
 const login=await owner.request.post(origin+'/api/growth-workspace/session',{headers:{Origin:origin,'Content-Type':'application/json'},data:{secret}});assert(login.ok(),'Real fixture session login failed');
 const cookie=(await owner.cookies()).find(c=>c.name==='growth_workspace_session');assert(cookie?.secure&&cookie.httpOnly&&cookie.sameSite==='Strict','Session protection changed');
 const state=await owner.storageState();
 const second=await context({storageState:state});
 for(width of [1440,412,390,360]){
  const c=await context({viewport:{width,height:1000},hasTouch:true,isMobile:width!==1440,storageState:state});page=await c.newPage();
  page.on('pageerror',e=>report.errors.push(redact(`${width}: ${e.message}`)));page.on('console',m=>{if(m.type()==='error')report.errors.push(redact(`${width}: ${m.text()}`))});await load(page);
  action='clean board and actual stage catalog';let view=await read(c);
  assert(view.cards.length===24&&view.archivedCardCount===18,'24 legacy IDs not preserved');
  assert(!view.capabilities.gitConfigured&&view.git.commitSha===null,'Fixture falsely claims runtime Git');
  for(const id of ['growth-update-data','growth-owner-dialog','growth-fact-editor'])assert(await page.getByTestId(id).count()===0,'Removed service entry remains: '+id);
  assert(await page.getByRole('button',{name:/Обновить/}).count()===0,'Update action remains');
  const text=await page.getByTestId('growth-center').innerText();assert(!/GitHub|Сервер:|Редактирование не настроено|очередь|AI|ИИ/.test(text),'Service runtime copy remains');
  assert(await page.locator('button[data-testid^="growth-stage-"]').count()===6&&await page.getByRole('tab').count()===0,'Compact six-stage UI regressed');
  const nav=width===1440?page.locator('aside[aria-label="Главная навигация"] nav'):page.getByRole('navigation',{name:'Разделы фабрики',exact:true});
  assert(JSON.stringify(await nav.getByRole('link').evaluateAll(ns=>ns.map(n=>n.getAttribute('href'))))===JSON.stringify(['/studio','/schedule','/settings','/growth']),'Four navigation routes changed');
  for(const s of stages){await selectStage(s);const rendered=await page.getByTestId('growth-content-card').evaluateAll(ns=>ns.map(n=>n.dataset.cardId).sort());const expected=view.cards.filter(card=>ids.has(card.id)&&card.stageIds.includes(s)).map(card=>card.id).sort();assert(JSON.stringify(rendered)===JSON.stringify(expected),'Stage leaked archive or lost prepared material: '+s);assert(await page.getByTestId('growth-weekly-chart').count()===1,'More than one graph');if(!expected.length)assert((await page.getByTestId('growth-catalog-empty').innerText()).includes('Утверждённых материалов'),'Unprepared empty stage invents content')}
  await selectStage('awareness');
  const colors=await page.locator('section[data-testid^="growth-column-"]>h3').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).color));assert(colors.length===5&&colors.every(color=>{const [r,g,b]=color.match(/[\d.]+/g).map(Number);return b>r&&b>g}),'Not five blue headers');
  const layout=await page.getByTestId('growth-kanban').evaluate(n=>({height:n.getBoundingClientRect().height,columns:[...n.querySelectorAll('section')].map(s=>s.getBoundingClientRect().height),graphGap:document.querySelector('[data-testid="growth-weekly-chart"]').getBoundingClientRect().top-n.getBoundingClientRect().bottom,viewport:innerHeight}));
  assert(layout.height<=layout.viewport&&Math.max(...layout.columns)-Math.min(...layout.columns)<=2&&layout.graphGap<100,'Bounded board/graph layout regressed');await noOverflow();await page.screenshot({path:`${out}/prepared-client-hero-${width}.png`});
  const weekly=page.getByTestId('growth-weekly-chart');await weekly.locator('.recharts-dot').first().waitFor();if(width===1440)await weekly.locator('.recharts-dot').first().hover();else await weekly.locator('.recharts-dot').first().tap();await weekly.getByText(/Исправленный снимок · версия 2/).waitFor();assert((await weekly.innerText()).includes('QA'),'Weekly correction loses explicit fixture source');await weekly.screenshot({path:`${out}/prepared-client-weekly-${width}.png`});
  const selected=view.cards.find(card=>ids.has(card.id)),id=selected.id,details=view.preparedDetails[id];
  action='inline task/provenance instead of Git brief';await page.getByTestId('growth-open-'+id).click();const dialog=page.getByTestId('growth-card-dialog');await dialog.waitFor();
  const briefText=await page.getByTestId('growth-card-brief').innerText();for(const field of ['goal','audience','barrier','keyMessage','cta','deliverable'])assert(briefText.includes(details.brief[field]),'Brief missing '+field);for(const value of details.brief.requirements)assert(briefText.includes(value),'Brief requirements omitted');
  assert((await page.getByTestId('growth-card-script').innerText()).includes(selected.script),'Prepared script not inline');assert((await page.getByTestId('growth-card-shots').innerText()).includes(selected.shots[0].visual),'Prepared production plan missing');
  const sources=await dialog.getByTestId('growth-card-source-link').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')));assert(JSON.stringify(sources)===JSON.stringify(details.provenance.sources.map(s=>s.url)),'Concrete source links differ from approval');assert(sources.every(s=>s.startsWith('https://example.org/qa-only/')),'Synthetic source is not explicitly isolated fixture');
  const trail=await page.getByTestId('growth-card-department-provenance').innerText();assert(trail.includes(details.provenance.scout.reportId)&&trail.includes(details.provenance.department.note)&&trail.includes(details.provenance.director.reviewedAt),'Scout→department→director trail missing');
  assert((await dialog.locator('a').evaluateAll(ns=>ns.map(n=>n.href))).every(h=>!h.includes('github.com')),'User redirected to Git brief');await noOverflow();await page.screenshot({path:`${out}/prepared-client-modal-${width}.png`});
  // Signed research remains intact after an owner's local adaptation; a publication requires explicit proof.
  action='owner adaptation preserves signed provenance';const signed=JSON.stringify(details.provenance);await page.getByTestId('growth-card-edit').click();await page.getByTestId('growth-edit-script').fill(`Independent Client prepared QA ${width}: hook / value / CTA.`);await save();await page.getByTestId('growth-card-local-adaptation').waitFor();
  let changed=await read(second);assert(changed.cards.find(card=>card.id===id).script.includes(`prepared QA ${width}`),'Script not shared with other browser');assert(JSON.stringify(changed.preparedDetails[id].provenance)===signed,'Owner edit rewrote signed approval');
  await page.getByTestId('growth-card-edit').click();const today=new Date(Date.now()+3*3600000).toISOString().slice(0,10);await page.getByTestId('growth-edit-publication-url').fill('https://example.org/qa-only/publication/'+id);await page.getByTestId('growth-edit-publication-date').fill(today);await save();await close();
  await page.getByTestId('growth-mode-fact').click();await page.getByTestId('growth-open-'+id).waitFor();assert((await page.getByTestId('growth-stage-awareness').innerText()).includes('Нет данных'),'Unknown fact changed into zero');
  await page.getByTestId('growth-open-'+id).click();await page.getByTestId('growth-card-edit').click();await page.getByTestId('growth-edit-publication-url').fill('');await page.getByTestId('growth-edit-publication-date').fill('');await save();await close();assert(await page.getByTestId('growth-content-card').count()===0,'Unpublished material remains in Fact');await page.getByTestId('growth-mode-plan').click();
  action='all formats arbitrary backward controls';for(const format of new Set(view.cards.filter(card=>ids.has(card.id)).map(card=>card.format))){const candidate=view.cards.find(card=>ids.has(card.id)&&card.format===format);for(const col of [...columns].reverse())await move(candidate.id,col);assert((await read(c)).cards.find(card=>card.id===candidate.id).publication===null,'Move manufactured a publication')}
  // Physical keyboard drag/cancel is deferred by the current scope; do not claim keyboard acceptance.
  await page.reload({waitUntil:'networkidle'});await page.getByTestId('growth-content-card').first().waitFor();changed=await read(c);assert(changed.cards.length===24&&changed.archivedCardCount===18&&changed.scoutRequests.length===view.scoutRequests.length,'Owner operations changed legacy archive or triggered research');
  await page.getByTestId('growth-open-'+id).click();await page.getByTestId('growth-card-local-adaptation').waitFor();await close();await noOverflow();await page.screenshot({path:`${out}/prepared-client-board-${width}.png`,fullPage:true});fs.writeFileSync(`${out}/prepared-client-dom-${width}.txt`,redact(await page.locator('body').ariaSnapshot()));
  report.checks.push({width,layout,blueHeaders:colors,activeOnly:true,archive24Retained:true,emptyStagesHonest:true,fullBriefSourcesTrail:true,ownerAdaptationImmutableTrail:true,publicationOnlyFact:true,allFormatBackwardMoves:true,physicalKeyboardDrag:"deferred; not tested or accepted",sharedReload:true,weeklyCorrectionSource:true,overflow:false});await c.close();
 }
 action='legacy routes';page=await owner.newPage();for(const route of ['/marketing','/studio']){await page.goto(origin+route,{waitUntil:'networkidle'});if(route==='/marketing'){await page.getByRole('tab',{name:'Чат директора',exact:true}).click();await page.getByTestId('marketing-director-root').waitFor()}else await page.getByRole('heading',{name:'Студия',exact:true}).first().waitFor()}
 assert(!report.errors.length&&!report.external.length,'Application error or external request');report.legacyChat=true;report.studio=true;report.passed=true;
}catch(error){report.failure={width,action,message:redact(error.message)};if(page&&!page.isClosed()){fs.writeFileSync(`${out}/prepared-client-failure-dom.txt`,redact(await page.locator('body').ariaSnapshot().catch(()=>'')));await page.screenshot({path:`${out}/prepared-client-failure.png`,fullPage:true}).catch(()=>{})}throw error}
finally{fs.writeFileSync(`${out}/prepared-client-report.json`,redact(JSON.stringify(report,null,2)));await browser.close();await fixture.close()}
