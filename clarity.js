(() => {
  const demo = document.getElementById('reply-demo');
  if (!demo) return;
  const choices = {
    deferred: ['Deferred interest','Record the requested timing and context, then enroll the eligible contact in the appropriate follow-up workflow.'],
    interested: ['Positive interest','Notify Sales so a salesperson can respond.'],
    negative: ['Negative interest','Stop inappropriate further outreach in the current campaign.'],
    optout: ['Do not contact','Apply the opt-out and stop marketing outreach.']
  };
  demo.addEventListener('change', event => {
    const choice=choices[event.target.value];
    if (!choice) return;
    document.getElementById('demo-class').textContent=choice[0];
    document.getElementById('demo-action').textContent=choice[1];
  });
  const openAnchor=()=>{
    let id;
    try {id=decodeURIComponent(location.hash.slice(1))} catch (_) {return}
    const el=document.getElementById(id);
    if(el?.matches('details.work-example')&&!el.open)el.open=true;
  };
  window.addEventListener('hashchange',openAnchor);
  openAnchor();
})();