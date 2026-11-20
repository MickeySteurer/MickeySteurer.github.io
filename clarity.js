(() => {
  const demo = document.getElementById('reply-demo');
  if (demo) {
    const choices = {
      deferred: ['Deferred interest','Record the requested timing and context, then enroll the eligible contact in the appropriate follow-up workflow.','Capture timing and context','Schedule eligible follow-up'],
      interested: ['Positive interest','Notify Sales so a salesperson can respond.','Identify positive interest','Notify Sales'],
      negative: ['Negative interest','Stop further emails in the current campaign.','Identify negative interest','Stop current campaign'],
      optout: ['Do not contact','Apply the opt-out and stop marketing outreach.','Identify opt-out request','Suppress marketing outreach'],
      unclear: ['Unclear intent','Ambiguous replies could receive additional processing or manual review rather than being forced into a category.','Flag ambiguity','Additional processing or review']
    };
    const renderChoice = () => {
      const choice = choices[demo.querySelector('input[name="reply-path"]:checked')?.value];
      if (!choice) return;
      ['demo-class','demo-action','demo-step-2','demo-step-3'].forEach((id,i)=>document.getElementById(id).textContent=choice[i]);
    };
    demo.addEventListener('change', renderChoice);
    demo.querySelector('fieldset').disabled=false;
    renderChoice();
    window.addEventListener('pageshow',renderChoice);
  }
  const openAnchor=()=>{
    let id;
    try {id=decodeURIComponent(location.hash.slice(1))} catch (_) {return}
    const el=document.getElementById(id);
    if(el?.matches('details.work-example')&&!el.open)el.open=true;
  };
  window.addEventListener('hashchange',openAnchor);
  openAnchor();
})();