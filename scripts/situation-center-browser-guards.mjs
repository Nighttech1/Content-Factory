/** User-scenario regression guards shared by production QA and the isolated component fixture. */
import fs from 'node:fs';

const assert=(value,message)=>{if(!value)throw Error(message)};
const expectedNavigation=[['/studio','Студия'],['/schedule','Расписание'],['/settings','Настройки'],['/marketing','Директор'],['/growth','Ситуационный центр']];

export async function checkSituationNavigation(page,width,{fixture=false}={}) {
  const nav=width<768||fixture?page.getByRole('navigation',{name:'Разделы фабрики',exact:true}):page.locator('aside[aria-label="Главная навигация"] nav');
  // The isolated component's mobile nav is CSS-hidden on desktop; inspect main app there.
  if(fixture&&width>=768)return;
  await nav.waitFor({state:'visible'});
  const actual=await nav.getByRole('link').evaluateAll(links=>links.map(link=>[link.getAttribute('href'),link.textContent.trim()]));
  assert(JSON.stringify(actual)===JSON.stringify(expectedNavigation),`Five ordered factory sections missing at ${width}: ${JSON.stringify(actual)}`);
  const current=nav.getByRole('link',{name:'Ситуационный центр',exact:true});
  assert(await current.getAttribute('href')==='/growth','Situation center has wrong route');
  assert(await current.getAttribute('aria-current')==='page','Current factory section is not announced');
}

export async function checkSituationJourney(page,data,{width,output,fixture=false}={}) {
  await checkSituationNavigation(page,width,{fixture});
  await page.getByTestId('growth-mode-plan').click();
  await page.getByRole('tab',{name:'Путь участника',exact:true}).click();
  const mechanics=page.getByTestId('growth-content-mechanics');
  const ideaCards=mechanics.getByTestId('growth-mechanic-card');
  const stageDetail=page.getByTestId('growth-stage-detail');
  const plannedCounter=page.getByTestId('growth-center-global-planned').locator('strong');
  const stages=['awareness','desire','registration','attendance','return','membership','advocacy','reactivation'];
  assert(data.contentMechanics?.length>0,'Canonical mechanics missing');
  for(const id of stages){
    const button=page.getByTestId(`growth-stage-${id}`);
    await button.click();
    await page.waitForFunction(id=>document.querySelector('[data-testid="growth-content-mechanics"]')?.getAttribute('data-stage-id')===id,id);
    const stage=data.stages.find(stage=>stage.id===id);
    assert(await button.getAttribute('aria-pressed')==='true',`Stage ${id} state missing`);
    const text=await stageDetail.innerText();
    for(const required of [stage.label,stage.job,stage.barrier])assert(text.includes(required),`Stage ${id} did not update its audience need/barrier: ${required}`);
    assert(await page.getByTestId('growth-mechanic-filter-all').getAttribute('aria-pressed')==='true',`Stage ${id} inherited previous mechanic filter`);
    const expected=data.contentMechanics.filter(idea=>idea.stageIds.includes(id));
    assert(expected.length>0,`Stage ${id} has no proposed strategy mechanic`);
    assert(await ideaCards.count()===expected.length,`Stage ${id} has wrong mechanic count`);
    const actualIds=await ideaCards.evaluateAll(cards=>cards.map(card=>card.dataset.mechanicId).sort());
    assert(JSON.stringify(actualIds)===JSON.stringify(expected.map(idea=>idea.id).sort()),`Stage ${id} leaked mechanics from another stage`);
    for(const idea of expected){
      const card=mechanics.locator(`[data-testid="growth-mechanic-card"][data-mechanic-id="${idea.id}"]`);
      const visible=await card.innerText();
      for(const key of ['title','need','barrier','purpose','hook','format','cta','successMetric'])assert(visible.includes(idea[key]),`${idea.id} missing visible ${key}`);
      for(const channel of idea.channels)assert(visible.includes(channel),`${idea.id} missing channel ${channel}`);
      assert(visible.includes(data.sources.find(source=>source.id===idea.sourceId).title),`${idea.id} missing source`);
      assert(visible.includes('Идея')&&visible.includes('не в производстве'),`${idea.id} is not labelled as a proposal`);
      assert(await card.getAttribute('data-content-id')===null,`${idea.id} pretends to be a production V-ID`);
      const detail=card.locator('details');
      await detail.locator('summary').click();
      assert((await detail.innerText()).includes(idea.example),`${idea.id} has no concrete expanded example`);
      await detail.locator('summary').click();
    }
    const stageJobs=page.locator('#growth-center-panel-journey').getByTestId('growth-content-card');
    for(const jobId of await stageJobs.evaluateAll(cards=>cards.map(card=>card.dataset.contentId)))assert(data.content.some(job=>job.id===jobId&&job.stageIds.includes(id)),`Stage ${id} contains an unrelated production task ${jobId}`);
  }
  await page.getByTestId('growth-stage-awareness').click();
  const awarenessIdeas=data.contentMechanics.filter(idea=>idea.stageIds.includes('awareness'));
  for(const kind of ['humor','useful','series'])assert(awarenessIdeas.some(idea=>idea.kind===kind),`Cold stage lacks ${kind}`);
  const stageJobs=page.locator('#growth-center-panel-journey').getByTestId('growth-content-card');
  const beforeJobs=await stageJobs.evaluateAll(cards=>cards.map(card=>card.dataset.contentId));
  for(const kind of ['humor','useful','series','other']){
    const filter=page.getByTestId(`growth-mechanic-filter-${kind}`);
    if(await filter.count()===0){assert(kind==='other','Required cold-stage filter missing');continue;}
    await filter.click();
    await page.waitForFunction(kind=>document.querySelector(`[data-testid="growth-mechanic-filter-${kind}"]`)?.getAttribute('aria-pressed')==='true',kind);
    const expected=awarenessIdeas.filter(idea=>kind==='other'?!['humor','useful','series'].includes(idea.kind):idea.kind===kind);
    assert(await ideaCards.count()===expected.length,`Filter ${kind} has wrong count`);
    for(const actualKind of await ideaCards.evaluateAll(cards=>cards.map(card=>card.dataset.kind)))assert(kind==='other'?!['humor','useful','series'].includes(actualKind):actualKind===kind,`Filter ${kind} leaked ${actualKind}`);
    assert(JSON.stringify(await stageJobs.evaluateAll(cards=>cards.map(card=>card.dataset.contentId)))===JSON.stringify(beforeJobs),`Mechanic filter ${kind} changed production tasks`);
    assert(await plannedCounter.innerText()==='24',`Mechanic filter ${kind} inflated 24 jobs`);
  }
  await page.getByTestId('growth-mechanic-filter-series').click();
  await mechanics.scrollIntoViewIfNeeded();
  if(output){fs.mkdirSync(output,{recursive:true});await mechanics.screenshot({path:`${output}/${fixture?'fixture-':''}mechanics-series-${width}.png`});}
  await page.getByTestId('growth-stage-registration').click();
  assert(await page.getByTestId('growth-mechanic-filter-all').getAttribute('aria-pressed')==='true','Changing stage did not reset series filter');
  assert(await ideaCards.count()===data.contentMechanics.filter(idea=>idea.stageIds.includes('registration')).length,'Registration blank due to stale series filter');
  for(const tab of ['Контент-план','Источники']){
    await page.getByRole('tab',{name:tab,exact:true}).click();
    await page.getByTestId('growth-stage-desire').click();
    assert(await page.getByRole('tab',{name:'Путь участника',exact:true}).getAttribute('aria-selected')==='true',`Stage selection from ${tab} did not reveal its details`);
    assert(await stageDetail.isVisible()&&await mechanics.isVisible(),`Stage selection from ${tab} left details hidden`);
    await page.getByTestId('growth-stage-awareness').click();
  }
  const awarenessIds=await ideaCards.evaluateAll(cards=>cards.map(card=>card.dataset.mechanicId).sort());
  await page.getByTestId('growth-mode-fact').click();
  await page.getByTestId('growth-mechanics-fact-empty').waitFor({state:'visible'});
  assert(await ideaCards.count()===0,'Proposed mechanics presented as fact');
  assert(await plannedCounter.innerText()==='24','Plan/fact changed existing production count');
  await page.getByTestId('growth-stage-return').click();
  assert(await page.getByTestId('growth-mode-fact').getAttribute('aria-pressed')==='true','Stage selection lost fact mode');
  assert(await ideaCards.count()===0,'Stage switch leaked proposals into fact');
  await page.getByTestId('growth-stage-awareness').click();
  await page.getByTestId('growth-mode-plan').click();
  assert(JSON.stringify(await ideaCards.evaluateAll(cards=>cards.map(card=>card.dataset.mechanicId).sort()))===JSON.stringify(awarenessIds),'Plan did not restore original awareness mechanics');
  assert(!(await page.getByTestId('growth-stage-membership').innerText()).includes('Ветка'),'Membership is still a side branch');
  assert((await page.getByTestId('growth-stage-membership').innerText()).includes('06'),'Membership is not the sixth main stage');
  await page.getByTestId('growth-stage-membership').click();
  await page.getByTestId('growth-stage-awareness').focus();
  await page.keyboard.press('Enter');
  assert(await page.getByTestId('growth-stage-awareness').getAttribute('aria-pressed')==='true','Keyboard stage activation failed');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Mechanics horizontal overflow ${width}`);
  return {mechanicsStageSwitching:8,mechanicsFilters:true,mechanicsFactIsolation:true,mechanicsExamples:true,navFive:true,tabRecovery:true,keyboard:true};
}
