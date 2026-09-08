(()=>{
  const parts=window.__AH_GAME_PARTS||[];
  try{
    if(parts.length!==12) throw new Error(`遊戲程式載入不完整：${parts.length}/12`);
    const code=parts.join('');
    window.__AH_GAME_PARTS=[];
    (0,eval)(code);
  }catch(e){
    console.error(e);
    const el=document.getElementById('error');
    if(el){el.classList.remove('hidden');el.textContent='遊戲程式載入失敗：'+e.message;}
  }
})();
