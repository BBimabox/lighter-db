// Lighter DB v10 — Supabase cloud backup / sync layer.
// Public project URL + publishable key are safe in a browser when RLS is configured correctly.
(() => {
  const CONFIG_KEY='lighterCloudConfig';
  const LAST_SYNC_KEY='lighterCloudLastSync';
  const MANIFEST_KEY='lighterCloudPhotoManifest';
  const DIRTY_KEY='lighterCloudDirtyPhotos';
  const INITIALIZED_KEY='lighterCloudInitialized';
  const SYNC_KEYS=[
    'lighterSaved','lighterModels','lighterLinks','lighterBrandNotes','lighterBrandAliases',
    'lighterAIEndpoint','lighterAICostLog','lighterAIHistory'
  ];
  const PHOTO_DB='lighterDBPhotos', PHOTO_STORE='photos', BUCKET='lighter-photos';
  let sb=null,sbSig='',timer=null,applying=false,syncing=false,authUnsub=null;

  function jsonGet(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}}
  function cfg(){return {...{url:'',key:'',autoSync:true},...jsonGet(CONFIG_KEY,{})}}
  function saveCfg(v){localStorage.setItem(CONFIG_KEY,JSON.stringify(v));sb=null;sbSig=''}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function cloudReady(){const c=cfg();return /^https:\/\/.+\.supabase\.co\/?$/i.test(c.url||'') && !!c.key}
  async function client(){
    const c=cfg(); if(!cloudReady()) return null;
    const sig=c.url+'|'+c.key; if(sb&&sbSig===sig)return sb;
    const mod=await import('https://esm.sh/@supabase/supabase-js@2');
    sb=mod.createClient(c.url.replace(/\/+$/,''),c.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});sbSig=sig;
    if(authUnsub){try{authUnsub()}catch{}}
    const {data}=sb.auth.onAuthStateChange((event,session)=>{
      document.dispatchEvent(new CustomEvent('lighter-cloud-auth',{detail:{event,session}}));
      if(session&&cfg().autoSync&&event==='SIGNED_IN')scheduleSync(800);
    });
    authUnsub=data?.subscription?.unsubscribe?.bind(data.subscription)||null;
    return sb;
  }
  async function session(){const c=await client();if(!c)return null;const {data}=await c.auth.getSession();return data?.session||null}
  async function accessToken(){return (await session())?.access_token||''}
  async function openPhotoDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(PHOTO_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(PHOTO_STORE))r.result.createObjectStore(PHOTO_STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  async function readPhotos(id){const db=await openPhotoDB();return new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_STORE,'readonly'),r=tx.objectStore(PHOTO_STORE).get(id);r.onsuccess=()=>resolve(r.result?.photos||[]);r.onerror=()=>reject(r.error)})}
  async function writePhotos(id,photos){const db=await openPhotoDB();return new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_STORE,'readwrite');tx.objectStore(PHOTO_STORE).put({id,photos});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
  function manifest(){return jsonGet(MANIFEST_KEY,{})}
  function dirty(){return new Set(jsonGet(DIRTY_KEY,[]))}
  function setDirty(s){localStorage.setItem(DIRTY_KEY,JSON.stringify([...s]))}
  function markPhotoDirty(id){if(!id||String(id).startsWith('aihist-')||applying)return;const d=dirty();d.add(id);setDirty(d);scheduleSync()}
  function statePayload(photoManifest){const data={};for(const k of SYNC_KEYS)data[k]=localStorage.getItem(k);return {schema:10,data,photo_manifest:photoManifest||manifest(),saved_at:new Date().toISOString()}}
  function modelPhotoIds(){const out=[];try{const db=JSON.parse(localStorage.getItem('lighterModels')||'{}');for(const arr of Object.values(db))for(const m of arr||[])if(m?.id)out.push(m.id)}catch{}return [...new Set(out)]}
  async function syncPhotoId(c,user,id,mf){
    const old=Array.isArray(mf[id])?mf[id]:[];if(old.length)await c.storage.from(BUCKET).remove(old).catch(()=>{});
    const blobs=await readPhotos(id).catch(()=>[]);const paths=[];
    for(let i=0;i<blobs.length;i++){
      const b=blobs[i],ext=(b.type||'image/jpeg').includes('png')?'png':'jpg',path=`${user.id}/${id}/${Date.now()}-${i}.${ext}`;
      const {error}=await c.storage.from(BUCKET).upload(path,b,{contentType:b.type||'image/jpeg',cacheControl:'3600',upsert:false});
      if(error)throw error;paths.push(path);
    }
    if(paths.length)mf[id]=paths;else delete mf[id];
  }
  async function push({allPhotos=false,quiet=false}={}){
    if(syncing)return;const c=await client();const s=await session();if(!c||!s)throw new Error('請先登入雲端帳號。');syncing=true;
    try{
      const mf=manifest();let ids=allPhotos?modelPhotoIds():[...dirty()];
      for(const id of ids)await syncPhotoId(c,s.user,id,mf);
      localStorage.setItem(MANIFEST_KEY,JSON.stringify(mf));setDirty(new Set());
      const payload=statePayload(mf);
      const {error}=await c.from('lighter_user_state').upsert({user_id:s.user.id,payload,updated_at:new Date().toISOString()},{onConflict:'user_id'});
      if(error)throw error;localStorage.setItem(LAST_SYNC_KEY,new Date().toISOString());localStorage.setItem(INITIALIZED_KEY,'1');
      document.dispatchEvent(new CustomEvent('lighter-cloud-synced'));if(!quiet)toast('✓ 已同步到雲端');
    } finally {syncing=false}
  }
  async function pull({confirmReplace=true}={}){
    const c=await client();const s=await session();if(!c||!s)throw new Error('請先登入雲端帳號。');
    const {data,error}=await c.from('lighter_user_state').select('payload,updated_at').eq('user_id',s.user.id).maybeSingle();if(error)throw error;if(!data?.payload)throw new Error('雲端目前沒有備份資料。');
    if(confirmReplace&&!confirm('從雲端還原會以雲端資料覆蓋這台裝置目前的收藏資料。確定繼續？'))return false;
    applying=true;
    try{
      for(const [k,v] of Object.entries(data.payload.data||{})){if(v===null||v===undefined)localStorage.removeItem(k);else localStorage.setItem(k,v)}
      const mf=data.payload.photo_manifest||{};localStorage.setItem(MANIFEST_KEY,JSON.stringify(mf));
      for(const [id,paths] of Object.entries(mf)){
        const blobs=[];for(const path of paths||[]){const {data:blob,error:e}=await c.storage.from(BUCKET).download(path);if(e)throw e;blobs.push(blob)}
        await writePhotos(id,blobs);
      }
      localStorage.setItem(LAST_SYNC_KEY,new Date().toISOString());localStorage.setItem(INITIALIZED_KEY,'1');setDirty(new Set());
    } finally {applying=false}
    toast('✓ 已從雲端還原');setTimeout(()=>location.reload(),500);return true;
  }
  function scheduleSync(ms=1400){if(applying||!cfg().autoSync||!cloudReady())return;clearTimeout(timer);timer=setTimeout(async()=>{try{if(await session())await push({allPhotos:false,quiet:true})}catch(e){console.warn('Cloud auto sync:',e)}},ms)}
  function toast(msg){let el=document.querySelector('#cloudToast');if(!el){el=document.createElement('div');el.id='cloudToast';el.className='cloud-toast';document.body.appendChild(el)}el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
  async function signInGoogle(){const c=await client();if(!c)throw new Error('請先儲存 Supabase 設定。');const redirectTo=location.origin+location.pathname;const {error}=await c.auth.signInWithOAuth({provider:'google',options:{redirectTo}});if(error)throw error}
  async function signInEmail(email){const c=await client();if(!c)throw new Error('請先儲存 Supabase 設定。');const {error}=await c.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error}
  async function signOut(){const c=await client();if(c)await c.auth.signOut()}
  function formatTime(v){if(!v)return'尚未同步';try{return new Date(v).toLocaleString()}catch{return v}}
  async function render(container){
    const c=cfg();container.innerHTML=`<section class="cloud-page"><div class="cloud-hero"><small>CLOUD LIGHTER DB</small><h2>☁ 雲端備份與同步</h2><p>登入後可把收藏、最愛、維修紀錄、AI 歷史與收藏照片同步到自己的 Supabase。未設定時 App 仍可完全離線使用。</p></div><div class="cloud-card"><h3>① Supabase 設定</h3><div class="field"><label>Project URL</label><input id="cloudUrl" type="url" value="${esc(c.url)}" placeholder="https://xxxx.supabase.co"></div><div class="field"><label>Publishable key</label><input id="cloudKey" type="password" value="${esc(c.key)}" placeholder="sb_publishable_..."><small>Publishable key 是設計給瀏覽器使用的公開金鑰；真正的資料安全由登入與 RLS 控制。</small></div><label class="cloud-toggle"><input id="cloudAuto" type="checkbox" ${c.autoSync?'checked':''}><span>登入後自動同步變更</span></label><button id="cloudSave">儲存設定</button></div><div class="cloud-card"><h3>② 登入</h3><div id="cloudUser" class="cloud-user">讀取登入狀態…</div><div class="cloud-login-grid"><button id="cloudGoogle">G　使用 Google 登入</button><div class="cloud-email"><input id="cloudEmail" type="email" placeholder="Email"><button id="cloudEmailBtn" class="secondary">寄登入連結</button></div><button id="cloudLogout" class="secondary">登出</button></div><p class="fineprint">Google 登入需要先在 Supabase 開啟 Google Provider；不想設定 Google Cloud 時，可以直接用 Email 登入連結。</p></div><div class="cloud-card"><h3>③ 同步</h3><div class="cloud-sync-status"><span>上次同步</span><b id="cloudLast">${esc(formatTime(localStorage.getItem(LAST_SYNC_KEY)))}</b></div><div class="cloud-actions"><button id="cloudPush">↑ 立即備份到雲端</button><button id="cloudPull" class="secondary">↓ 從雲端還原</button></div><p class="fineprint">第一次「備份到雲端」會上傳所有收藏照片；之後只同步有變更的照片。AI 歷史不再重複上傳完整原圖。</p></div><div class="cloud-card security"><h3>🔒 AI 額度保護</h3><p>完成 Supabase 設定後，再把同一個 Supabase URL 與 Publishable key 設到 Cloudflare Worker。Worker 就會要求登入 JWT，其他人即使下載你的 GitHub 程式碼，也不能直接消耗你的 OpenAI API 額度。</p></div></section>`;
    const updateUser=async()=>{const s=await session().catch(()=>null),el=container.querySelector('#cloudUser');if(!el)return;if(s){el.innerHTML=`<b>✓ 已登入</b><span>${esc(s.user.email||s.user.id)}</span>`;container.querySelector('#cloudLogout').style.display='block'}else{el.innerHTML='<b>尚未登入</b><span>本機資料仍可正常使用</span>';container.querySelector('#cloudLogout').style.display='none'}};
    container.querySelector('#cloudSave').onclick=()=>{saveCfg({url:container.querySelector('#cloudUrl').value.trim().replace(/\/+$/,''),key:container.querySelector('#cloudKey').value.trim(),autoSync:container.querySelector('#cloudAuto').checked});toast('已儲存雲端設定');render(container)};
    container.querySelector('#cloudGoogle').onclick=async()=>{try{await signInGoogle()}catch(e){alert(e.message||e)}};
    container.querySelector('#cloudEmailBtn').onclick=async()=>{const email=container.querySelector('#cloudEmail').value.trim();if(!email)return alert('請先輸入 Email。');try{await signInEmail(email);alert('登入連結已寄出，請到信箱點開。')}catch(e){alert(e.message||e)}};
    container.querySelector('#cloudLogout').onclick=async()=>{await signOut();await updateUser()};
    container.querySelector('#cloudPush').onclick=async e=>{const b=e.currentTarget,old=b.textContent;b.disabled=true;b.textContent='同步中…';try{await push({allPhotos:localStorage.getItem(INITIALIZED_KEY)!=='1'});container.querySelector('#cloudLast').textContent=formatTime(localStorage.getItem(LAST_SYNC_KEY))}catch(err){alert('雲端同步失敗：'+(err.message||err))}finally{b.disabled=false;b.textContent=old}};
    container.querySelector('#cloudPull').onclick=async e=>{const b=e.currentTarget,old=b.textContent;b.disabled=true;b.textContent='下載中…';try{await pull()}catch(err){alert('雲端還原失敗：'+(err.message||err))}finally{b.disabled=false;b.textContent=old}};
    await updateUser();document.addEventListener('lighter-cloud-auth',updateUser,{once:true});
  }
  async function init(){if(!cloudReady())return;try{await client();if((await session())&&cfg().autoSync)scheduleSync(1800)}catch(e){console.warn('Cloud init:',e)}}
  window.LighterCloud={cfg,saveCfg,render,scheduleSync,markPhotoDirty,accessToken,push,pull,init,cloudReady};
  setTimeout(init,0);
})();
