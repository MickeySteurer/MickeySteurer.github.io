import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const req=createRequire(import.meta.url);
const folder='prototype-previews';
mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
for(const theme of ['editorial','swiss','personal']){
 for(const width of [320,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:width===1440?1000:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:8765/prototypes/'+theme+'.html',{waitUntil:'networkidle'});
  const info=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-innerWidth,
    cases:document.querySelectorAll('.case-study').length,
    details:document.querySelectorAll('details').length,
    portraitLoaded:document.querySelector('.hero-photo img').naturalWidth>0,
    brokenAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.getAttribute('href'))
  }));
  assert(info.overflow<=1,theme+' '+width+' overflow '+info.overflow);
  assert.equal(info.cases,4);
  assert.equal(info.details,9);
  assert(info.portraitLoaded,'Portrait did not load');
  assert.equal(info.brokenAnchors.length,0);
  await page.addScriptTag({path:req.resolve('axe-core')});
  const a=await page.evaluate(()=>window.axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
  const violations=a.violations.map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.length}));
  results.push({theme,width,...info,violations});
  if(width===390||width===1440){
   const prefix=folder+'/'+theme+'-'+width;
   await page.screenshot({path:prefix+'-full.png',fullPage:true});
   const shot=await page.screenshot({path:prefix+'-hero.jpg',type:'jpeg',quality:50});
   console.log('PREVIEW_'+theme+'_'+width+'_BEGIN'+shot.toString('base64')+'PREVIEW_'+theme+'_'+width+'_END');
   const el=page.locator('.case-study').first();
   const p=await el.screenshot({path:prefix+'-case.jpg',type:'jpeg',quality:52});
   if(width===1440)console.log('CASE_'+theme+'_BEGIN'+p.toString('base64')+'CASE_'+theme+'_END');
   const d=page.locator('#follow-up-example');
   await d.locator('summary').click();
   assert(await d.evaluate(e=>e.open));
   if(width===390)await page.locator('#ai-reply-workflow').screenshot({path:prefix+'-expanded.png'});
  }
  await page.close();
 }
}
await browser.close();
writeFileSync(folder+'/results.json',JSON.stringify(results,null,2));
console.log('QA_RESULTS_BEGIN'+JSON.stringify(results)+'QA_RESULTS_END');
