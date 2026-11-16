// Run after starting: python3 -m http.server 8765
// Requires npm install --no-save playwright axe-core
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const axePath=require.resolve('axe-core');
const base=process.env.PORTFOLIO_URL||'http://127.0.0.1:8765/';
const widths=[320,390,768,1024,1440];
const shots='browser-shots';
mkdirSync(shots,{recursive:true});
const browser=await chromium.launch({headless:true});
let failures=[],results=[],baselineResults=[],baselineWarnings=[];
try {
  for(const width of widths){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    try {
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await page.waitForTimeout(350);
      const checks=await page.evaluate(()=>{
        const scrollWidth=document.documentElement.scrollWidth;
        const viewport=window.innerWidth;
        const sections=[...document.querySelectorAll('main section')].map(s=>s.id).filter(Boolean);
        const headings=[...document.querySelectorAll('.portfolio-case h3')].map(el=>el.textContent.trim());
        const download=document.querySelector('a[href="Michael_Steurer_Resume.pdf"]');
        const focusables=[...document.querySelectorAll('.site-header nav a')];
        return {
          scrollWidth,viewport,overflow:Math.max(0,scrollWidth-viewport),
          h1:document.querySelector('h1')?.innerText,
          caseCount:document.querySelectorAll('.portfolio-case').length,
          detailsCount:document.querySelectorAll('details.work-example').length,
          sections,headings,download:!!download,
          headerRight:Math.max(...focusables.map(el=>el.getBoundingClientRect().right),0)
        };
      });
      assert(checks.overflow<=2,width+'px: horizontal overflow '+checks.overflow+'px');
      assert(checks.headerRight<=width+2,width+'px: header nav overflows');
      assert.equal(checks.caseCount,4);
      assert(checks.download);
      assert(checks.h1.includes('Michael Steurer'));
      await page.screenshot({path:shots+'/portfolio-'+width+'.png',fullPage:true});
      if(width===390 || width===1440){
        const jpeg=await page.screenshot({type:'jpeg',quality:40,fullPage:false});
        console.log('DRAFT_PREVIEW_'+width+'_BEGIN'+jpeg.toString('base64')+'DRAFT_PREVIEW_'+width+'_END');
      }
      if(width===1440){
        const jpeg=await page.locator('#salesforce-campaigns').screenshot({type:'jpeg',quality:40});
        console.log('DRAFT_CASE_1440_BEGIN'+jpeg.toString('base64')+'DRAFT_CASE_1440_END');
      }
      await page.addScriptTag({path:axePath});
      const axe=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
      const serious=axe.violations.filter(v=>['critical','serious'].includes(v.impact));
      if(serious.length)failures.push({width,type:'accessibility',violations:serious.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.length}))});
      if(width===390){
        const details=page.locator('#follow-up-example');
        await details.locator('summary').click();
        assert(await details.evaluate(x=>x.open),'Disclosure failed to open');
        await page.screenshot({path:shots+'/portfolio-390-expanded.png',fullPage:true});
      }
      results.push({width,...checks,axeViolations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}))});
    }catch(error){failures.push({width,type:'browser',error:String(error)});}
    finally{await page.close();}
  }
  // Capture current published main as a visual comparison; failures here should not
  // obscure whether the proposed branch itself passes checks.
  for (const width of widths) {
    const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    try {
      await page.goto('https://mickeysteurer.github.io/',{waitUntil:'domcontentloaded',timeout:18000});
      await page.waitForTimeout(300);
      await page.screenshot({path:shots+'/published-main-'+width+'.png',fullPage:true});
      if(width===390 || width===1440){
        const jpeg=await page.screenshot({type:'jpeg',quality:40,fullPage:false});
        console.log('MAIN_PREVIEW_'+width+'_BEGIN'+jpeg.toString('base64')+'MAIN_PREVIEW_'+width+'_END');
      }
      if(width===1440){
        const jpeg=await page.locator('.case-study').first().screenshot({type:'jpeg',quality:40});
        console.log('MAIN_CASE_1440_BEGIN'+jpeg.toString('base64')+'MAIN_CASE_1440_END');
      }
      const baseline=await page.evaluate(()=>({
        scrollWidth:document.documentElement.scrollWidth,
        viewport:window.innerWidth,
        pageHeight:document.documentElement.scrollHeight,
        caseCount:document.querySelectorAll('.case-study').length,
        detailsCount:document.querySelectorAll('details.work-example').length,
        title:document.title
      }));
      baselineResults.push({width,...baseline});
    }catch(error){baselineWarnings.push({width,error:String(error)});}
    finally{await page.close();}
  }
}finally{await browser.close();}
writeFileSync(shots+'/qa-results.json',JSON.stringify({results,failures,baselineResults,baselineWarnings},null,2));
console.log(JSON.stringify({results,failures},null,2));
if(failures.length)process.exitCode=1;
