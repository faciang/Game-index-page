(async()=>{
  const parts=window.__AH_GAME_PARTS||[];
  const coverSources=[
    'data/covers-v2/sixlaws.js',
    'data/covers-v2/group-1.js',
    'data/covers-v2/group-2.js',
    'data/covers-v2/group-3.js',
    'data/covers-v2/group-4.js',
    'data/covers-v2/group-5.js',
    'data/cover-crimproc-red.js',
    'data/cover-crimproc-white.js',
    'data/cover-civproc-cream.js',
    'data/cover-new-crim-blue.js'
  ];
  const loadScript=src=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src+'?v=covers-v2-20260909f';
    s.onload=resolve;
    s.onerror=()=>reject(new Error('書封資源載入失敗：'+src));
    document.head.appendChild(s);
  });
  try{
    if(parts.length!==12)throw new Error(`遊戲程式載入不完整：${parts.length}/12`);
    for(const src of coverSources){
      try{await loadScript(src)}catch(e){console.warn(e.message)}
    }
    let code=parts.join('');
    const start=code.indexOf('async function loadBooks()');
    const end=code.indexOf('const gun=new T.Group()',start);
    if(start<0||end<0)throw new Error('找不到書封貼圖程式');
    const restored=`function coverMime(b64,key=''){if(b64.startsWith('UklG'))return'image/webp';if(b64.startsWith('/9j/'))return'image/jpeg';if(b64.startsWith('iVBOR'))return'image/png';if(b64.startsWith('R0lGOD'))return'image/gif';throw new Error('未知書封格式：'+key)}\nfunction loadCoverImage(b64,key){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('書封解碼失敗：'+key));img.src=\`data:\${coverMime(b64,key)};base64,\${b64}\`})}\nfunction makeFallbackCover(key){return new Promise(resolve=>{const meta=(typeof BOOKS!=='undefined'&&BOOKS[key])?BOOKS[key]:{title:key,color:'#5a6268',accent:'#e8dfc7'};const c=document.createElement('canvas');c.width=512;c.height=768;const x=c.getContext('2d');x.fillStyle=meta.color||'#5a6268';x.fillRect(0,0,512,768);x.fillStyle=meta.accent||'#e8dfc7';x.fillRect(28,28,456,92);x.fillStyle='#171717';x.font='700 34px sans-serif';x.textAlign='center';x.fillText('備援書封',256,86);x.fillStyle='#f5f2e9';x.font='700 52px sans-serif';const text=meta.title||key;const chars=[...text];let lines=[''];for(const ch of chars){const i=lines.length-1,test=lines[i]+ch;if(x.measureText(test).width>410&&lines[i])lines.push(ch);else lines[i]=test}let y=250;for(const line of lines){x.fillText(line,256,y);y+=76}x.font='24px sans-serif';x.fillStyle='rgba(255,255,255,.72)';x.fillText(key,256,700);const img=new Image();img.onload=()=>resolve(img);img.src=c.toDataURL('image/png')})}\nasync function safeLoadCover(key){const b64=window.BOOK_COVERS&&window.BOOK_COVERS[key];if(b64){try{return await loadCoverImage(b64,key)}catch(e){console.warn('書封失敗，改用備援：',key,e.message)}}else console.warn('缺少書封，改用備援：',key);return await makeFallbackCover(key)}\nasync function loadBooks(){let count=0;for(const [key,a] of Object.entries(BOOKS)){const img=await safeLoadCover(key);const tex=new T.Texture(img);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());tex.needsUpdate=true;bookMats[key]=new T.MeshStandardMaterial({map:tex,roughness:.63,metalness:0,side:T.FrontSide});count++;$('loading').textContent=\`書封 \${count} / \${Object.keys(BOOKS).length}\`}}\nfunction book(key,w=1.05,h=1.5,d=.24){const g=new T.Group(),front=new T.PlaneGeometry(w,h);const q=faceUV[key]||[.11,.035,.97,.05,.97,.96,.11,.98];front.setAttribute('uv',new T.Float32BufferAttribute([q[0],1-q[1],q[2],1-q[3],q[6],1-q[7],q[4],1-q[5]],2));const fm=new T.Mesh(front,bookMats[key]);fm.position.z=d/2+.014;g.add(fm);const backMat=shelfMats[Object.keys(BOOKS).indexOf(key)%shelfMats.length];box(0,0,0,w*.965,h*.966,d,m.paper,false,g);box(0,0,-d/2,w,h,.035,backMat,false,g);box(-w/2+.02,0,0,.05,h,d,backMat,false,g);const spine=new T.Mesh(new T.PlaneGeometry(d,h),bookMats[key]);const uv=spine.geometry.attributes.uv;uv.setXY(0,.005,.96);uv.setXY(1,.10,.965);uv.setXY(2,.005,.035);uv.setXY(3,.10,.03);uv.needsUpdate=true;spine.position.x=-w/2-.009;spine.rotation.y=-Math.PI/2;g.add(spine);return g}\n`;
    code=code.slice(0,start)+restored+code.slice(end);

    const answerOld=`$('qAction').textContent=exam.index===9?'查看成績':'下一題';$('qAction').onclick=nextExamQuestion;sound(correct?'pickup':'empty');releaseCursor();return correct`;
    const answerNew=`$('qAction').textContent=correct&&exam.correct>=3?'累積答對3題・通過':exam.index===9?'查看成績':'下一題';$('qAction').onclick=correct&&exam.correct>=3?finishExam:nextExamQuestion;sound(correct?'pickup':'empty');releaseCursor();if(correct&&exam.correct>=3)setTimeout(()=>{if(state==='examFeedback')finishExam()},650);return correct`;
    if(!code.includes(answerOld))throw new Error('找不到第二關作答流程');
    code=code.replace(answerOld,answerNew);

    const nextOld=`function nextExamQuestion(){if(state!=='examFeedback')return;if(exam.index===9){finishExam();return}exam.index++;exam.locked=false;showQuestion()}`;
    const nextNew=`function nextExamQuestion(){if(state!=='examFeedback')return;if(exam.correct>=3||exam.index===9){finishExam();return}exam.index++;exam.locked=false;showQuestion()}`;
    if(!code.includes(nextOld))throw new Error('找不到第二關換題流程');
    code=code.replace(nextOld,nextNew);

    const finishOld=`progress.best=Math.max(progress.best,exam.correct);const pass=exam.correct>=5;$('examScore').textContent=exam.correct+' / 10';$('examVerdict').textContent=pass?'國考通過':'未達5題，請重考本關';$('examSummary').textContent=\`第 \${exam.attempt} 次應試 · 本機最佳 \${progress.best} / 10 · 通過門檻是遊戲規則，並非實際國考錄取標準。\`;$('examReview').innerHTML=exam.deck.map((q,i)=>{const a=exam.answers[i];`;
    const finishNew=`progress.best=Math.max(progress.best,exam.correct);const pass=exam.correct>=3;$('examScore').textContent=pass?exam.correct+' 題達標':exam.correct+' / '+exam.answers.length;$('examVerdict').textContent=pass?'國考通過':'未達3題，請重考本關';$('examSummary').textContent=\`第 \${exam.attempt} 次應試 · 累積答對3題即通過 · 通過門檻是遊戲規則，並非實際國考錄取標準。\`;$('examReview').innerHTML=exam.deck.slice(0,exam.answers.length).map((q,i)=>{const a=exam.answers[i];`;
    if(!code.includes(finishOld))throw new Error('找不到第二關成績流程');
    code=code.replace(finishOld,finishNew);
    code=code.replace(`三關完成 · 國考最佳 \${progress.best} / 10 · 所有戰鬥均發生於內心世界。`,`三關完成 · 國考通過門檻 3 題 · 所有戰鬥均發生於內心世界。`);

    window.__AH_GAME_PARTS=[];
    (0,eval)(code);
  }catch(e){
    console.error(e);
    const el=document.getElementById('error');
    if(el){el.classList.remove('hidden');el.textContent='遊戲程式載入失敗：'+e.message;}
    const loading=document.getElementById('loading');
    if(loading)loading.textContent='載入失敗，請重新整理頁面。';
  }
})();
