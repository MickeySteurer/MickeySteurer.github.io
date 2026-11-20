import {chromium,firefox,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const base='http://127.0.0.1:8765/';
const shots='browser-shots';
mkdirSync(shots,{recursive:true});
const results=[],failures=[];
for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 try{
  for(const width of (name==='chromium'?[320,390,768,1024,1440]:[390,1440])){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   try{
    await page.goto(base,{waitUntil:'load'});
    await page.locator('.portrait img').evaluate(img=>img.decode());
    const check=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,cases:document.querySelectorAll('.portfolio-case').length,workTop:Math.round(document.querySelector('#work').getBoundingClientRect().top),portrait:document.querySelector('.portrait img').naturalWidth>0}));
    assert(check.overflow<=2,'overflow: '+check.overflow);assert.equal(check.cases,6);assert(check.portrait);
    assert(await page.locator('a[href="Michael_Steurer_Resume.pdf"]').count()>=2);
    await page.addScriptTag({path:require.resolve('axe-core')});
    const scan=async()=>await page.evaluate(async()=> (await window.axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
    const collapsed=await scan();
    if(name==='chromium'&&(width===390||width===1440)){
      await page.screenshot({path:shots+'/clarity-'+width+'-full.png',fullPage:true});
      await page.screenshot({path:shots+'/clarity-'+width+'-hero.png'});
      await page.locator('#ai-reply-workflow').screenshot({path:shots+'/clarity-'+width+'-reply.png'});
    }
    for(const d of await page.locator('details.work-example').all()){await d.locator('summary').click();assert(await d.evaluate(x=>x.open),'disclosure failed');}
    for(const [value,label] of [['interested','Positive interest'],['negative','Negative interest'],['optout','Do not contact'],['deferred','Deferred interest']]){
      await page.locator('input[value="'+value+'"]').check();assert.equal(await page.locator('#demo-class').innerText(),label);
    }
    const expanded=await scan();
    const expandedOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(expandedOverflow<=2,'expanded overflow: '+expandedOverflow);
    await page.goto(base+'#follow-up-example');await page.waitForFunction(()=>document.getElementById('follow-up-example').open);
    if([...collapsed,...expanded].length)failures.push({name,width,type:'axe',collapsed,expanded});
    results.push({name,width,...check,expandedOverflow,collapsed,expanded});
   }catch(e){failures.push({name,width,error:String(e)});}finally{await page.close();}
  }
  if(name==='chromium'){
   const p=await browser.newPage({viewport:{width:390,height:844},javaScriptEnabled:false});
   try{await p.goto(base);assert(await p.locator('h1').isVisible());assert(await p.locator('#salesforce-campaigns .case-copy').isVisible());assert(await p.locator('.reply-options').isDisabled());await p.locator('#follow-up-example summary').click();assert(await p.locator('#follow-up-example').evaluate(e=>e.open));results.push({name,mode:'no-js',pass:true});}catch(e){failures.push({name,mode:'no-js',error:String(e)});}finally{await p.close();}
   const k=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
   try{await k.goto(base);await k.keyboard.press('Tab');assert.equal(await k.evaluate(()=>document.activeElement?.textContent.trim()),'Skip to main content');await k.keyboard.press('Enter');await k.locator('#follow-up-example summary').focus();await k.keyboard.press('Enter');assert(await k.locator('#follow-up-example').evaluate(e=>e.open));results.push({name,mode:'keyboard/ordinary-motion',pass:true});}catch(e){failures.push({name,mode:'keyboard',error:String(e)});}finally{await k.close();}
  }
 }finally{await browser.close();}
}
// Compare identical viewports from exact checked-out reference branches. Any missing baseline
// produces a visible warning, not a fabricated comparative result.
const comparisons=[];
const review=await chromium.launch({headless:true});
try{
 for(const [label,url] of [['published-main','http://127.0.0.1:8766/'],['draft8','http://127.0.0.1:8767/']]){
  for(const width of [390,1440]){
   const p=await review.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   try{
    await p.goto(url,{waitUntil:'load',timeout:15000});
    await p.screenshot({path:shots+'/'+label+'-'+width+'-full.png',fullPage:true});
    await p.screenshot({path:shots+'/'+label+'-'+width+'-hero.png'});
    comparisons.push({label,width,workTop:await p.locator('#work').evaluate(e=>Math.round(e.getBoundingClientRect().top))});
   }catch(e){comparisons.push({label,width,error:String(e)});}
   finally{await p.close();}
  }
 }
}finally{await review.close();}
writeFileSync(shots+'/comparison-results.json',JSON.stringify(comparisons,null,2));
writeFileSync(shots+'/qa-results.json',JSON.stringify({results,failures},null,2));
console.log('CLARITY_QA '+JSON.stringify({results,failures}));
if(failures.length)process.exitCode=1;