import {checkSituationJourney} from './situation-center-browser-guards.mjs';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../веб/package.json',import.meta.url));
const {chromium}=require('playwright');
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:3000';
const out='qa-evidence';fs.mkdirSync(out,{recursive:true});
const assert=(v,m)=>{if(!v)throw Error(m)};
const browser=await chromium.launch({headless:true});
const evidence={sourceSha:process.env.SOURCE_SHA,checks:[],errors:[]};
let activePage;
try{
 for(const width of [1440,390,412,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});activePage=page;
  await page.addInitScript(()=>{const key='cf.marketing.projects';if(!localStorage.getItem(key)){const ts='2026-11-09T00:00:00.000Z';localStorage.setItem(key,JSON.stringify({version:1,activeProjectId:'qa-preserved-project',activeChatId:'qa-preserved-chat',projects:[{id:'qa-preserved-project',name:'QA сохранённый проект',createdAt:ts,updatedAt:ts,chats:[{id:'qa-preserved-chat',title:'QA сохранённый чат',createdAt:ts,updatedAt:ts,messages:[{id:'qa-preserved-message',role:'user',content:'QA история должна сохраниться',createdAt:ts}]}]}]}))}});
  page.on('pageerror',e=>evidence.errors.push(`${width}: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')evidence.errors.push(`${width}: ${m.text()}`)});
  const paid=[];page.on('request',r=>{if(/openrouter.ai|api.openai.com|api.anthropic.com|fal.ai|replicate.com/.test(r.url()))paid.push(r.url())});
  const response=await page.goto(`${origin}/growth`,{waitUntil:'networkidle'});assert(response.status()===200,'Growth HTTP failure');
  await page.getByTestId('growth-center').waitFor();
  const api=await page.request.get(`${origin}/api/growth-center`);assert(api.ok(),'Dataset API failure');
  const data=await api.json();
  assert((await page.title()).includes('Ситуационный центр'),'Page title not renamed');
  const situationChecks=await checkSituationJourney(page,data,{width,output:out});
  const stages=['awareness','desire','registration','attendance','return','membership','advocacy','reactivation'];
  for(const id of stages){const b=page.getByTestId(`growth-stage-${id}`);await b.click();assert(await b.getAttribute('aria-pressed')==='true',`Stage ${id} not selected`);assert(await page.getByTestId('growth-stage-detail').isVisible(),`Stage ${id} detail hidden`);assert((await page.getByTestId('growth-stage-detail').innerText()).includes(data.stages.find(s=>s.id===id).label),`Stage ${id} detail not updated`)}
  await page.getByTestId('growth-stage-awareness').click();
  for(const mode of ['fact','plan']){await page.getByTestId(`growth-mode-${mode}`).click();}
  for(const name of ['Метрика этапа','Период графика этапа','Метрика встреч','Период графика встреч']){
   const select=page.getByLabel(name,{exact:true});const values=await select.locator('option').evaluateAll(opts=>opts.map(o=>o.value));for(const value of values)await select.selectOption(value);
  }
  for(const label of ['Контент-план','Источники','Путь участника'])await page.getByRole('tab',{name:label,exact:true}).click();
  evidence.revision=data.revision;assert(data.version===2,'Wrong dataset version');assert(data.content.length===24&&new Set(data.content.map(c=>c.id)).size===24,'Canonical content must contain 24 unique IDs');
  assert(data.stages.findIndex(s=>s.id==='awareness')<data.stages.findIndex(s=>s.id==='desire'),'Awareness must precede desire');
  assert(data.content.every(c=>c.status!=='published'||c.publication?.url&&c.publication?.publishedAt),'Missing published proof');
  const published=data.content.filter(c=>c.status==='published'&&c.publication?.url&&c.publication?.publishedAt);
  assert((await page.getByTestId('growth-center-global-planned').locator('strong').innerText())==='24','Visible global plan count');
  assert((await page.getByTestId('growth-center-global-published').locator('strong').innerText())===String(published.length),'Visible global published count');
  if(data.series.every(series=>series.points.every(p=>p.value===null||p.evidenceKind==='scenario'))){assert(await page.getByTestId('growth-center-chart-stage').getByTestId('growth-chart-empty').isVisible(),'Unknown stage history must show empty state');}
  if(data.meetings.length===0){assert(await page.getByTestId('growth-meetings-chart').getByTestId('growth-chart-empty').isVisible(),'Unknown meetings must show empty state');}
  await page.getByRole('tab',{name:'Контент-план',exact:true}).click();
  const cards=page.getByTestId('growth-center-content').getByTestId('growth-content-card');
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid="growth-center-content"] [data-testid="growth-content-card"]').length===24);
  const ids=await cards.evaluateAll(rows=>rows.map(r=>r.getAttribute('data-content-id')).sort());
  assert(JSON.stringify(ids)===JSON.stringify(data.content.map(c=>c.id).sort()),'Visible plan IDs differ from canonical 24');
  await page.getByTestId('growth-mode-fact').click();
  await page.waitForFunction(n=>document.querySelectorAll('[data-testid="growth-center-content"] [data-testid="growth-content-card"]').length===n,published.length);
  const factIds=await cards.evaluateAll(rows=>rows.map(r=>r.getAttribute('data-content-id')).sort());
  assert(JSON.stringify(factIds)===JSON.stringify(published.map(c=>c.id).sort()),'Fact contains unpublished content');
  await page.screenshot({path:`${out}/growth-fact-${width}.png`,fullPage:true});
  await page.getByTestId('growth-mode-plan').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid="growth-center-content"] [data-testid="growth-content-card"]').length===24);
  await page.screenshot({path:`${out}/growth-content-${width}.png`,fullPage:true});
  await page.getByRole('tab',{name:'Источники',exact:true}).click();
  assert((await page.locator('#growth-center-panel-sources').innerText()).includes('SAM'),'Market uncertainty missing');
  await page.getByRole('tab',{name:'Путь участника',exact:true}).click();

  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Horizontal overflow ${width}`);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:`${out}/growth-hero-${width}.png`,fullPage:false});
  await page.screenshot({path:`${out}/growth-${width}.png`,fullPage:true});
  if(width===1440){await page.locator('a[href="/marketing"]').first().click();}else{await page.goto(`${origin}/marketing`,{waitUntil:'networkidle'});}
  await page.waitForURL('**/marketing');assert(await page.locator('main').isVisible(),'Marketing shell missing');
  await page.getByRole('tab',{name:'Чат директора',exact:true}).click();
  await page.getByTestId('marketing-director-root').waitFor();
  if(!await page.getByTestId('marketing-projects-rail').isVisible())await page.getByRole('button',{name:'Показать проекты',exact:true}).click();
  await page.getByTestId('marketing-projects-rail').waitFor({state:'visible'});
  await page.getByText('QA история должна сохраниться',{exact:true}).waitFor({state:'visible'});
  assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('cf.marketing.projects')).projects[0].chats[0].messages[0].content))==='QA история должна сохраниться','Stored chat overwritten');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Marketing overflow ${width}`);
  await page.screenshot({path:`${out}/marketing-${width}.png`,fullPage:true});
  if(width===1440){await page.getByTestId('nav-growth').click();}else{await page.getByRole('navigation',{name:'Разделы фабрики',exact:true}).getByRole('link',{name:'Ситуационный центр',exact:true}).click();}
  await page.waitForURL('**/growth');await page.getByTestId('growth-center').waitFor();
  assert(paid.length===0,'Unexpected paid network requests');
  evidence.checks.push({width,...situationChecks,stages:8,filters:true,planFact:true,marketing:true,overflow:false});await page.close();
 }
 assert(evidence.errors.length===0,'Browser errors: '+evidence.errors.join('; '));
 evidence.status='passed';
}catch(error){
 evidence.status='failed';evidence.failure=String(error);
 if(activePage&&!activePage.isClosed())await activePage.screenshot({path:`${out}/browser-failure.png`,fullPage:true}).catch(()=>{});
 throw error;
}finally{fs.writeFileSync(`${out}/browser-report.json`,JSON.stringify(evidence,null,2));await browser.close()}
