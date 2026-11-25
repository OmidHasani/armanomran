(()=>{
  const beat=()=>{if(!document.hidden&&!document.querySelector('#shell')?.hidden)fetch('/api/presence',{method:'POST',credentials:'same-origin'}).catch(()=>{})};
  setInterval(beat,30000);document.addEventListener('visibilitychange',beat);
})();
