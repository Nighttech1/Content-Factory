/** Independent Client acceptance, against the actual running build. No app writes or production fixture edits. */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../веб/package.json',import.meta.url));
const {chromium}=require('playwright');
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:3000';
const output=path.resolve('qa-evidence');fs.mkdirSync(output,{recursive:true});
const report={role:'independent project Client',sourceSha:process.env.SOURCE_SHA,origin,passed:false,checks:[],errors:[],blockedPaidRequests:[]};
const expect=(condition,message)=>{if(!condition)throw Error(message)};
const navItems=[['/studio','Студия'],['/schedule','Расписание'],['/settings','Настройки'],['/marketing','Директор'],['/growth','Ситуационный центр']];
const browser=await chromium.launch({headless:true});
let currentPage;let currentWidth;
async function selected(page,id){
 await page.waitForFunction(id=>document.querySelector(`[data-testid="growth-stage-${id}"]`)?.getAttribute('aria-pressed')==='true'&&document.querySelector('[data-testid="growth-stage-detail"]')?.getAttribute('data-stage-id')===id,id);
 expect(await page.getByRole('tab',{name:'Путь участника',exact:true}).getAttribute('aria-selected')==='true',`Selecting ${id} did not reveal its details`);
 await page.getByTestId('growth-content-mechanics').waitFor({state:'visible'});
 expect(await page.getByTestId('growth-content-mechanics').getAttribute('data-stage-id')===id,`Selected ${id} shows another stage's content ideas`);
}
async function noOverflow(page,where){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Document horizontal overflow: ${where}`)}
try{
 for(const width of [1440,412,390,360]){
  currentWidth=width;
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce',hasTouch:width<768,isMobile:width<768});currentPage=page;
  page.on('pageerror',error=>report.errors.push(`${width}: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error')report.errors.push(`${width}: ${message.text()}`)});
  await page.route(/https?:\/\/(?:[^/]*\.)?(?:openai\.com|anthropic\.com|openrouter\.ai|fal\.ai|replicate\.com)(?:\/|$)/,route=>{report.blockedPaidRequests.push(route.request().url());return route.abort()});
  const response=await page.goto(`${origin}/growth`,{waitUntil:'networkidle'});expect(response?.status()===200,'Situation center does not load');
  await page.getByTestId('growth-center').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  expect((await page.title()).includes('Ситуационный центр'),'Browser title is not Situation Center');
  const navigation=width<768?page.getByRole('navigation',{name:'Разделы фабрики',exact:true}):page.locator('aside[aria-label="Главная навигация"] nav');
  await navigation.waitFor({state:'visible'});
  const actualNav=await navigation.getByRole('link').evaluateAll(links=>links.map(link=>[link.getAttribute('href'),link.textContent.trim()]));
  expect(JSON.stringify(actualNav)===JSON.stringify(navItems),'Five sections or their preserved order/routes differ from the agreed navigation');
  await noOverflow(page,`${width} hero`);
  await page.screenshot({path:`${output}/client-hero-${width}.png`});
  const datasetResponse=await page.request.get(`${origin}/api/growth-center`);expect(datasetResponse.ok(),'Shared dataset unavailable');
  expect((datasetResponse.headers()['cache-control']||'').includes('no-store'),'Dataset API cache policy can conceal updates');
  const data=await datasetResponse.json();report.revision=data.revision;
  expect(data.content.length===24&&new Set(data.content.map(item=>item.id)).size===24,'Ideas changed the existing 24 production jobs');
  expect(data.meetings.length===0,'Canonical meeting history was filled with synthetic results');
  expect(data.metrics.filter(metric=>metric.stageId).every(metric=>metric.value===null&&metric.provenance.kind==='unknown'),'Unmeasured stage counts became invented facts');

  // User story: leave the sources tab and choose a funnel step with the keyboard.
  await page.getByRole('tab',{name:'Источники',exact:true}).click();
  const membership=page.getByTestId('growth-stage-membership');await membership.focus();await membership.press('Enter');await selected(page,'membership');
  expect((await membership.innerText()).includes('06')&&!(await membership.innerText()).includes('Ветка'),'Subscription is not the sixth main step');
  await page.getByRole('tab',{name:'Контент-план',exact:true}).click();
  const awareness=page.getByTestId('growth-stage-awareness');await awareness.focus();await awareness.press('Space');await selected(page,'awareness');
  const mechanics=page.getByTestId('growth-content-mechanics');const cards=mechanics.getByTestId('growth-mechanic-card');
  for(const name of ['Юмор','Полезное','Мини-сериал'])expect(await mechanics.getByRole('button',{name,exact:true}).isVisible(),`Cold audience has no ${name} direction`);

  // User story: find something worth saving, understand the purpose and expand its usable scenario.
  await mechanics.getByRole('button',{name:'Полезное',exact:true}).click();
  expect(await cards.count()>0,'Useful content filter is empty');
  expect((await cards.evaluateAll(items=>items.map(item=>item.dataset.kind))).every(kind=>kind==='useful'),'Useful filter contains unrelated ideas');
  const useful=cards.first();
  const usefulText=await useful.innerText();
  for(const label of ['Потребность','Какой барьер снимаем','Следующее действие зрителя','Что измеряем после теста','не в производстве'])expect(usefulText.includes(label),`Useful idea does not explain ${label}`);
  await useful.getByText('Пример и сценарий',{exact:true}).click();
  expect((await useful.locator('details p').innerText()).trim().length>50,'Expanded useful example is not actionable');
  await useful.scrollIntoViewIfNeeded();await noOverflow(page,`${width} useful idea expanded`);
  await useful.screenshot({path:`${output}/client-useful-${width}.png`});

  // User story: inspect the proposed continuing series, rather than mistake a title for a series.
  await mechanics.getByRole('button',{name:'Мини-сериал',exact:true}).click();
  expect(await cards.count()>0,'Series filter has no ideas');
  const series=cards.first();await series.getByText('Пример и сценарий',{exact:true}).click();
  const story=await series.locator('details p').innerText();
  expect(story.length>180,'Series has no developed story premise');
  expect((story.match(/(?:эпизод|серия|серии)\s*\d|(?:^|[\s;])\d[).:]/gi)||[]).length>=3,'Series does not describe at least three concrete episodes');
  expect((await series.innerText()).includes('не в производстве'),'Proposed series appears to be commissioned content');
  expect(await series.locator('a').count()>0,'Series idea has no reviewable source');
  await series.scrollIntoViewIfNeeded();await noOverflow(page,`${width} series expanded`);
  await series.screenshot({path:`${output}/client-series-${width}.png`});

  // User story: switch to registration; a previous series choice must not hide the new stage's work.
  const registration=page.getByTestId('growth-stage-registration');if(width<768)await registration.tap();else await registration.click();await selected(page,'registration');
  expect(await mechanics.getByRole('button',{name:'Все идеи',exact:true}).getAttribute('aria-pressed')==='true','Stage switch kept stale series filter');
  expect(await cards.count()>0,'Registration is blank after switching stage');
  const registrationText=await page.getByTestId('growth-stage-detail').innerText();expect(registrationText.includes('записаться')||registrationText.includes('Записаться'),'Registration detail does not explain recording/joining');
  const actualIdeas=await cards.evaluateAll(items=>items.map(item=>item.dataset.mechanicId));
  expect(actualIdeas.every(id=>data.contentMechanics.find(idea=>idea.id===id)?.stageIds.includes('registration')),'Registration contains unrelated proposals');

  // A fact switch is a truth boundary, including after a later stage change.
  await page.getByTestId('growth-mode-fact').click();await page.getByTestId('growth-mechanics-fact-empty').waitFor({state:'visible'});
  expect(await cards.count()===0,'Ideas are shown as executed content in fact mode');
  expect((await mechanics.innerText()).includes('не подтверждена'),'No explicit explanation of missing fact evidence');
  await page.getByTestId('growth-stage-awareness').click();await selected(page,'awareness');
  expect(await page.getByTestId('growth-mode-fact').getAttribute('aria-pressed')==='true','Stage selection reset fact mode');
  expect(await cards.count()===0,'Stage selection leaked unexecuted ideas into fact');
  expect((await page.getByTestId('growth-stage-awareness').innerText()).includes('Нет замера'),'Unknown people count was displayed as zero');
  await mechanics.scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/client-fact-${width}.png`});
  await page.getByTestId('growth-mode-plan').click();expect(await cards.count()>=3,'Returning to plan lost cold-stage ideas');
  expect(await page.getByTestId('growth-center-global-planned').locator('strong').innerText()==='24','Ideas inflate the production plan');
  await page.getByRole('tab',{name:'Контент-план',exact:true}).click();
  const jobs=page.getByTestId('growth-center-content').getByTestId('growth-content-card');
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid="growth-center-content"] [data-testid="growth-content-card"]').length===24);
  expect(await jobs.count()===24,'Full production plan is no longer accessible');
  const visibleIds=await jobs.evaluateAll(items=>items.map(item=>item.dataset.contentId).sort());
  expect(JSON.stringify(visibleIds)===JSON.stringify(data.content.map(item=>item.id).sort()),'Full content plan differs from the original V-ID list');
  await noOverflow(page,`${width} production plan`);
  fs.writeFileSync(`${output}/client-dom-${width}.txt`,await page.locator('body').ariaSnapshot());
  report.checks.push({width,keyboard:true,stageFromTabs:true,usefulScenario:true,seriesEpisodes:true,stageFilterReset:true,truthBoundary:true,fiveSections:true,jobs:24,unknownPreserved:true,overflow:false});
  await page.close();currentPage=null;
 }
 expect(report.errors.length===0,'Browser console/page errors: '+report.errors.join('; '));
 expect(report.blockedPaidRequests.length===0,'Unexpected paid service calls were blocked');
 report.passed=true;
}catch(error){
 report.failure={width:currentWidth,message:error.message};
 if(currentPage){await currentPage.screenshot({path:`${output}/client-failure-${currentWidth}.png`,fullPage:true}).catch(()=>{});fs.writeFileSync(`${output}/client-failure-${currentWidth}.txt`,await currentPage.locator('body').ariaSnapshot().catch(()=>''));}
 throw error;
}finally{fs.writeFileSync(`${output}/client-report.json`,JSON.stringify(report,null,2));await browser.close()}
