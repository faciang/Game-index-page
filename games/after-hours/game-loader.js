(()=>{
  const parts=window.__AH_GAME_PARTS||[];
  const expected=['sixlaws','crimproc_green','crimproc_red','crimproc_white','civproc_red','civproc_blue','civproc_cream','const_2026','const_newtheory','const_2021','minfa_yishu','minfa_general','new_crim_blue','criminal_yellow','criminal_red'];
  try{
    if(parts.length!==12)throw new Error(`遊戲程式載入不完整：${parts.length}/12`);
    const missing=expected.filter(k=>!window.BOOK_COVERS?.[k]);
    if(missing.length)throw new Error('缺少書封：'+missing.join('、'));
    let code=parts.join('');
    const start=code.indexOf('async function loadBooks()');
    const end=code.indexOf('const gun=new T.Group()',start);
    if(start<0||end<0)throw new Error('找不到書封貼圖程式');
    const restored=`function coverMime(b64,key=''){if(b64.startsWith('UklG'))return'image/webp';if(b64.startsWith('/9j/'))return'image/jpeg';if(b64.startsWith('iVBOR'))return'image/png';if(b64.startsWith('R0lGOD'))return'image/gif';throw new Error('未知書封格式：'+key)}\nfunction loadCoverImage(b64,key){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('書封解碼失敗：'+key));img.src=\`data:\${coverMime(b64,key)};base64,\${b64}\`})}\nasync function loadBooks(){let count=0;for(const [key,a] of Object.entries(BOOKS)){const b64=window.BOOK_COVERS&&window.BOOK_COVERS[key];if(!b64)throw new Error(\`缺少書封：\${key}\`);let img;try{img=await loadCoverImage(b64,key)}catch(e){throw new Error(\`書封解碼失敗：\${key}\`)}const tex=new T.Texture(img);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());tex.needsUpdate=true;bookMats[key]=new T.MeshStandardMaterial({map:tex,roughness:.63,metalness:0,side:T.FrontSide});count++;$('loading').textContent=\`原始書封 \${count} / \${Object.keys(BOOKS).length}\`}}\nfunction book(key,w=1.05,h=1.5,d=.24){const g=new T.Group(),front=new T.PlaneGeometry(w,h);const q=faceUV[key]||[.11,.035,.97,.05,.97,.96,.11,.98];front.setAttribute('uv',new T.Float32BufferAttribute([q[0],1-q[1],q[2],1-q[3],q[6],1-q[7],q[4],1-q[5]],2));const fm=new T.Mesh(front,bookMats[key]);fm.position.z=d/2+.014;g.add(fm);const backMat=shelfMats[Object.keys(BOOKS).indexOf(key)%shelfMats.length];box(0,0,0,w*.965,h*.966,d,m.paper,false,g);box(0,0,-d/2,w,h,.035,backMat,false,g);box(-w/2+.02,0,0,.05,h,d,backMat,false,g);const spine=new T.Mesh(new T.PlaneGeometry(d,h),bookMats[key]);const uv=spine.geometry.attributes.uv;uv.setXY(0,.005,.96);uv.setXY(1,.10,.965);uv.setXY(2,.005,.035);uv.setXY(3,.10,.03);uv.needsUpdate=true;spine.position.x=-w/2-.009;spine.rotation.y=-Math.PI/2;g.add(spine);return g}\n`;
    code=code.slice(0,start)+restored+code.slice(end);
    window.__AH_GAME_PARTS=[];
    (0,eval)(code);
  }catch(e){
    console.error(e);
    const el=document.getElementById('error');
    if(el){el.classList.remove('hidden');el.textContent='遊戲程式載入失敗：'+e.message;}
    const loading=document.getElementById('loading');if(loading)loading.textContent='載入失敗，請重新整理頁面。';
  }
})();
