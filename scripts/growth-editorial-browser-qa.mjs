/** Actual production bundle, isolated plan bootstrap; no production or external API calls. */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {startWorkspaceFixture} from './growth-workspace-qa-fixture.mjs';
const require=createRequire(new URL('../веб/package.json',import.meta.url)),{chromium}=require('playwright');
const out=path.resolve('qa-evidence');fs.mkdirSync(out,{recursive:true});
const fixture=await startWorkspaceFixture(),origin=fixture.origin,browser=await chromium.launch({headless:true});
const report={sourceSha:process.env.SOURCE_SHA,fixture:'actual packaged bundle, bundled director plan, temporary state, HTTPS; no Git/production',passed:false,widths:[],errors:[]};
try{
 for(const width of [1440,390,360]){
  const context=await browser.newContext({viewport:{width,height:1000},ignoreHTTPSErrors:true,isMobile:width!==1440,hasTouch:width!==1440,reducedMotion:'reduce'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(origin+'/growth',{waitUntil:'networkidle'});
  await page.getByTestId('growth-editorial-plan').waitFor();
  const response=await context.request.get(origin+'/api/growth-workspace'),view=await response.json();
  assert.equal(view.editorial.plan.units.length,37);assert.equal(view.editorial.status,'bundled');assert.equal(Object.keys(view.preparedDetails).length,0);
  const all=new Set();
  for(const stage of ['awareness','desire','registration','attendance','return','membership']){
   await page.getByTestId('growth-stage-'+stage).click();await page.waitForFunction(s=>document.querySelector('[data-testid="growth-kanban"]')?.dataset.stageId===s,stage);
   const expected=view.editorial.plan.units.filter(u=>['awareness','desire','registration','attendance','return','membership'][u.stage-1]===stage).map(u=>u.id);
   const ids=await page.getByTestId('growth-content-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.cardId));for(const id of expected){assert(ids.includes(id),id+' missing');all.add(id)}
  }
  assert.equal(all.size,37);await page.getByTestId('growth-stage-awareness').click();
  await page.getByTestId('growth-open-V-202611-REL-03').click();await page.getByTestId('growth-editorial-brief').waitFor();assert.match(await page.getByTestId('growth-dialog-shooting').innerText(),/14.11.2026/);assert.match(await page.getByTestId('growth-dialog-plan-meta').innerText(),/16.11.2026/);
  await page.getByTestId('growth-card-dialog').getByRole('button',{name:'Закрыть окно',exact:true}).click();
  await page.getByTestId('growth-editorial-report').locator('summary').click();await page.getByTestId('growth-editorial-report').getByRole('heading',{name:'Что меняем на встречах',exact:true}).waitFor();assert((await page.getByTestId('growth-editorial-report').innerText()).includes('Семейный переводчик'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'body overflow');
  await page.getByTestId('growth-editorial-report').locator('summary').click();await page.screenshot({path:path.join(out,`editorial-${width}.png`),fullPage:true});
  await page.getByTestId('growth-mode-fact').click();assert.equal(await page.getByTestId('growth-content-card').count(),0);assert.equal(await page.getByTestId('growth-editorial-plan').count(),0);
  report.widths.push({width,all37:true,inlineBrief:true,shootingVsPublication:true,report:true,noOverflow:true,noFakeFact:true});await context.close();
 }
 assert.deepEqual(report.errors,[]);report.passed=true;
}finally{fs.writeFileSync(path.join(out,'editorial-browser-report.json'),JSON.stringify(report,null,2));await browser.close();await fixture.close();}
