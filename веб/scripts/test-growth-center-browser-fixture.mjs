/** Isolated real-browser QA of the production component, never a production data source.
 * Execute in GitHub Actions, where Chromium is supported. BUILD_ONLY validates fixture/bundle locally.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {build}=require('esbuild');
const {validateGrowthCenterDataset}=require('../lib/growth-center/model.ts');
const fixture=JSON.parse(fs.readFileSync(new URL('../data/growth/vernatun.json',import.meta.url),'utf8'));
fixture.revision='qa-isolated-not-production';
fixture.sources.push({id:'qa-only',title:'QA fixture — NOT real club measurements',location:'https://example.org/qa-only',date:'2026-10-01',geography:'isolated browser test',limitation:'Synthetic aggregates only; never written into canonical data.'});
const point=(date,value,kind='measured',cohort='qa-cohort-a',start='2026-10-01',end='2026-10-05')=>({date,value,periodStart:start,periodEnd:end,cohortId:cohort,evidenceKind:kind,sourceId:'qa-only',observedAt:date});
for(const series of fixture.series){
 if(series.stageId==='awareness')series.points=[point('2026-10-10',100,'measured','qa-cohort-old','2026-09-01','2026-09-30'),point('2026-11-01',80),point('2026-11-02',null,'unknown'),point('2026-11-03',90,'owner_estimate')];
 if(series.stageId==='desire')series.points=[point('2026-10-10',25,'measured','qa-cohort-old','2026-09-01','2026-09-30'),point('2026-11-01',20),point('2026-11-02',null,'unknown'),point('2026-11-03',30)];
}
fixture.meetings=[
 {id:'qa-old',confirmedDate:'2026-10-10',status:'completed',registrations:12,attendees:10,newcomers:6,returning:4,capacity:15,revenue:null,sourceId:'qa-only',observedAt:'2026-10-10',evidenceKind:'measured'},
 {id:'qa-cancelled',confirmedDate:'2026-11-01',status:'cancelled',registrations:5,attendees:null,newcomers:null,returning:null,capacity:15,revenue:null,sourceId:'qa-only',observedAt:'2026-11-01',evidenceKind:'measured'},
 {id:'qa-recent',confirmedDate:'2026-11-03',status:'completed',registrations:8,attendees:8,newcomers:3,returning:5,capacity:15,revenue:null,sourceId:'qa-only',observedAt:'2026-11-03',evidenceKind:'owner_estimate'}
];
fixture.content[0].status='published';fixture.content[0].publication={url:'https://example.org/qa-only-publication',publishedAt:'2026-11-09',sourceId:'qa-only'};
const parsed=validateGrowthCenterDataset(fixture);if(!parsed.ok)throw Error(parsed.errors.join('\n'));
const root=path.resolve('.');
const result=await build({stdin:{contents:`import React from 'react';import{createRoot}from'react-dom/client';import{GrowthCenter}from'./components/growth-center/GrowthCenter';createRoot(document.getElementById('root')).render(<GrowthCenter dataset={${JSON.stringify(parsed.data)}}/>);`,resolveDir:root,sourcefile:'qa-isolated-entry.tsx',loader:'tsx'},absWorkingDir:root,bundle:true,write:false,outdir:'qa-fixture',format:'iife',platform:'browser',jsx:'automatic',tsconfig:path.join(root,'tsconfig.json'),define:{'process.env':'{}','process.env.NODE_ENV':'"production"'},logLevel:'silent'});
const js=result.outputFiles.find(f=>f.path.endsWith('.js'))?.text;
const css=result.outputFiles.find(f=>f.path.endsWith('.css'))?.text;
if(!js||!css)throw Error('Actual component JS/CSS bundle missing');
if(process.env.QA_FIXTURE_BUILD_ONLY==='1'){console.log('PASS isolated fixture validation and actual-component esbuild bundle; browser NOT executed');process.exit(0)}
const {chromium}=require('playwright');
const output=path.resolve('../qa-evidence');fs.mkdirSync(output,{recursive:true});
const report={kind:'isolated actual-component browser fixture',productionActual:false,sourceSha:process.env.SOURCE_SHA,checks:[],errors:[]};
const assert=(value,message)=>{if(!value)throw Error(message)};
const browser=await chromium.launch({headless:true});
try{
 for(const width of [1440,390,360]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',error=>report.errors.push(`${width}: ${error.message}`));
  await page.route('**/*',route=>route.abort()); // fixture has no reason to perform network requests
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#08090a"><div id="root" style="padding:16px"></div></body></html>');
  await page.addStyleTag({content:css});await page.addScriptTag({content:js});
  await page.getByTestId('growth-center').waitFor();
  await page.getByRole('tab',{name:'Контент-план',exact:true}).click();
  const cards=page.getByTestId('growth-center-content').getByTestId('growth-content-card');
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid="growth-center-content"] [data-testid="growth-content-card"]').length===24);
  assert(await cards.count()===24,'Plan must contain exact 24 cards');
  const ids=await cards.evaluateAll(nodes=>nodes.map(n=>n.dataset.contentId));
  assert(JSON.stringify(ids.slice().sort())===JSON.stringify(fixture.content.map(c=>c.id).sort()),'Visible plan IDs differ from canonical projection');
  await page.getByTestId('growth-mode-fact').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid="growth-center-content"] [data-testid="growth-content-card"]').length===1);
  assert(await cards.count()===1,'Fact must show exactly one proven synthetic publication');
  assert(await cards.first().getAttribute('data-content-id')===fixture.content[0].id,'Fact wrong V-ID');
  await page.getByTestId('growth-mode-plan').click();
  await page.waitForFunction(()=>document.querySelectorAll('[data-testid="growth-center-content"] [data-testid="growth-content-card"]').length===24);assert(await cards.count()===24,'Plan toggle must restore all 24');
  await page.getByRole('tab',{name:'Путь участника',exact:true}).click();
  const chart=page.getByTestId('growth-center-chart-stage');
  await chart.locator('svg.recharts-surface').first().waitFor({state:'visible'});
  await chart.locator('.recharts-bar-rectangle').first().waitFor({state:'visible'});
  assert(await chart.locator('svg.recharts-surface').count()>0,'Nonempty history must render real chart');
  assert(await chart.locator('.recharts-bar-rectangle').count()>0,'Different cohorts must render discrete bars');
  assert(await chart.locator('[stroke-dasharray]').count()>0,'Estimated series must use visible dashed styling');
  assert(await chart.getByText('Оценка · пунктир / полый',{exact:true}).isVisible(),'Estimate visual legend missing');
  const allSurfaces=await chart.locator('svg.recharts-surface').count();
  await page.getByLabel('Период графика этапа',{exact:true}).selectOption('14');
  await page.waitForFunction(()=>document.querySelector('[data-testid="growth-center-chart-stage"] .recharts-line')&&!document.querySelector('[data-testid="growth-center-chart-stage"] .recharts-bar-rectangle'));
  assert(await chart.locator('.recharts-bar-rectangle').count()===0,'14-day filter must remove old cohort and restore single-cohort line');
  assert(await chart.locator('.recharts-line').count()>0,'Recent single cohort must retain line/gap representation');
  assert(await chart.locator('svg.recharts-surface').count()>0,'Recent history must remain');
  assert(await chart.locator('svg.recharts-surface').count()<=allSurfaces,'Period filter inflated chart groups');
  await page.getByTestId('growth-stage-desire').click();
  await page.getByLabel('Метрика этапа',{exact:true}).selectOption('conversion');
  await chart.locator('svg.recharts-surface').first().waitFor({state:'visible'});
  assert(await chart.locator('svg.recharts-surface').count()>0,'Compatible historical pairs must produce chart even when current metric unknown');
  await page.getByLabel('Метрика этапа',{exact:true}).selectOption('people');
  await page.getByTestId('growth-stage-awareness').click();
  await page.getByLabel('Период графика этапа',{exact:true}).selectOption('all');
  await chart.locator('.recharts-bar-rectangle').first().waitFor({state:'visible'});
  await chart.scrollIntoViewIfNeeded();
  const targets=chart.locator('.recharts-dot, .recharts-rectangle');
  let tooltip=false;
  for(let i=0;i<await targets.count();i++){
   const box=await targets.nth(i).boundingBox();if(!box)continue;
   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
   const tip=chart.locator('.recharts-tooltip-wrapper');
   if(await tip.isVisible()&&(await tip.innerText()).includes('QA fixture')){tooltip=true;break;}
  }
  assert(tooltip,'Real chart tooltip must expose source provenance');
  const meetings=page.getByTestId('growth-meetings-chart');
  await meetings.locator('svg.recharts-surface').first().waitFor({state:'visible'});
  assert(await meetings.locator('svg.recharts-surface').count()>0,'Nonempty meetings must render chart');
  for(const value of ['registrations','newcomers','returning','attendees'])await page.getByLabel('Метрика встреч',{exact:true}).selectOption(value);
  await page.getByLabel('Период графика встреч',{exact:true}).selectOption('14');
  await meetings.locator('svg.recharts-surface').first().waitFor({state:'visible'});
  assert(await meetings.locator('svg.recharts-surface').count()>0,'Filtered recent meeting remains');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Fixture horizontal overflow ${width}`);
  await page.screenshot({path:path.join(output,`nonempty-${width}.png`),fullPage:true});
  report.checks.push({width,exact24:true,fact1:true,nonemptyHistory:true,conversionHistory:true,periodFiltering:true,tooltipSource:true,meetings:true,overflow:false});
  await page.close();
 }
 assert(report.errors.length===0,'Browser errors: '+report.errors.join('; '));
 report.status='passed';
} catch(error){report.status='failed';report.failure=String(error);throw error}
finally{fs.writeFileSync(path.join(output,'nonempty-browser-report.json'),JSON.stringify(report,null,2));await browser.close()}
