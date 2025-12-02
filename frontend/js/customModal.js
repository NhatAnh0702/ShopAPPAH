/* frontend/js/customModal.js
   Custom modal notification module
   - Injects CSS + DOM markup when first used
   - Exposes: CustomModal.alert(message, options) -> Promise
              CustomModal.confirm(message, options) -> Promise<boolean>
   Usage:
     CustomModal.alert('Hello');
     CustomModal.confirm('Are you sure?').then(ok => { if (ok) ... });
*/
(function(window){
  if (window.CustomModal) return;

  const CSS_ID = 'custom-modal-styles';
  const CONTAINER_ID = 'custom-modal-container';

  const css = `
  /* Custom Modal CSS - injected by customModal.js */
  #${CONTAINER_ID} .cm-overlay{
    position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(2px); display:flex; align-items:center; justify-content:center; z-index:2000;
  }
  #${CONTAINER_ID} .cm-modal{
    width:100%; max-width:520px; background:#fff; border-radius:8px; box-shadow:0 12px 40px rgba(0,0,0,0.28); overflow:hidden; font-family:Arial, sans-serif;
    transform:translateY(6px); animation:cm-pop .16s ease-out forwards;
  }
  @keyframes cm-pop{ from { opacity:0; transform:translateY(12px) scale(0.995);} to { opacity:1; transform:translateY(0) scale(1);} }
  #${CONTAINER_ID} .cm-header{ padding:14px 18px; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; justify-content:space-between; }
  #${CONTAINER_ID} .cm-title{ margin:0; font-weight:700; font-size:16px; color:#222; }
  #${CONTAINER_ID} .cm-close{ background:transparent; border:0; font-size:20px; cursor:pointer; color:#666 }
  #${CONTAINER_ID} .cm-body{ padding:18px; color:#333; font-size:14px; line-height:1.4; }
  #${CONTAINER_ID} .cm-footer{ padding:12px 16px; border-top:1px solid #f6f6f6; display:flex; justify-content:flex-end; gap:10px; }
  #${CONTAINER_ID} .cm-btn{ padding:8px 14px; border-radius:6px; border:0; cursor:pointer; font-weight:600; font-size:14px; }
  #${CONTAINER_ID} .cm-btn.secondary{ background:#eef0f2; color:#111 }
  #${CONTAINER_ID} .cm-btn.primary{ background:#2d8cff; color:#fff }
  #${CONTAINER_ID} .cm-btn.danger{ background:#e74c3c; color:#fff }
  #${CONTAINER_ID} .cm-body .cm-message{ white-space:pre-wrap }
  @media (max-width:520px){ #${CONTAINER_ID} .cm-modal{ margin:12px; width:calc(100% - 24px); } }
  `;

  // Inject styles if not present
  function ensureStyles(){
    if (!document.getElementById(CSS_ID)){
      const s = document.createElement('style');
      s.id = CSS_ID;
      s.textContent = css;
      document.head.appendChild(s);
    }
  }

  // Ensure container
  function ensureContainer(){
    let c = document.getElementById(CONTAINER_ID);
    if (!c){
      c = document.createElement('div');
      c.id = CONTAINER_ID;
      c.style.display = 'none';
      document.body.appendChild(c);
    }
    return c;
  }

  // Queue to handle multiple calls
  const queue = [];
  let busy = false;

  function nextInQueue(){
    if (busy) return;
    const job = queue.shift();
    if (!job) return;
    busy = true;
    runJob(job).finally(()=>{ busy = false; nextInQueue(); });
  }

  function runJob(job){
    return new Promise((resolve)=>{
      ensureStyles();
      const container = ensureContainer();
      container.innerHTML = `
        <div class="cm-overlay" role="dialog" aria-modal="true">
          <div class="cm-modal" role="document">
            <div class="cm-header">
              <h3 class="cm-title">${escapeHtml(job.title || '')}</h3>
              <button class="cm-close" aria-label="Đóng">&times;</button>
            </div>
            <div class="cm-body"><div class="cm-message">${escapeHtml(job.message || '')}</div></div>
            <div class="cm-footer"></div>
          </div>
        </div>
      `;

      container.style.display = 'block';

      const overlay = container.querySelector('.cm-overlay');
      const footer = container.querySelector('.cm-footer');
      const closeBtn = container.querySelector('.cm-close');

      // Build buttons
      function makeButton(text, cls){
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'cm-btn ' + (cls||''); b.textContent = text; return b;
      }

      let primaryBtn, secondaryBtn;

      if (job.type === 'alert'){
        primaryBtn = makeButton(job.okText || 'OK', 'primary');
        footer.appendChild(primaryBtn);
        primaryBtn.addEventListener('click', ()=>{ close('ok'); });
        closeBtn.addEventListener('click', ()=> close('ok'));
      } else if (job.type === 'confirm'){
        secondaryBtn = makeButton(job.cancelText || 'Hủy', 'secondary');
        primaryBtn = makeButton(job.okText || 'Đồng ý', 'primary');
        footer.appendChild(secondaryBtn);
        footer.appendChild(primaryBtn);
        secondaryBtn.addEventListener('click', ()=> close('cancel'));
        primaryBtn.addEventListener('click', ()=> close('ok'));
        closeBtn.addEventListener('click', ()=> close('cancel'));
      }

      // keyboard handling
      function onKey(e){
        if (e.key === 'Escape') { e.preventDefault(); close(job.type === 'confirm' ? 'cancel' : 'ok'); }
        if (e.key === 'Enter') { e.preventDefault(); close('ok'); }
      }
      document.addEventListener('keydown', onKey);

      // prevent focus leaving modal -> simple trap: focus first btn and keep
      setTimeout(()=>{ if (primaryBtn) primaryBtn.focus(); else if (secondaryBtn) secondaryBtn.focus(); }, 10);

      function close(action){
        // cleanup
        document.removeEventListener('keydown', onKey);
        if (container){ container.style.display = 'none'; container.innerHTML = ''; }
        // resolve according to type
        if (job.type === 'alert'){
          try{ job.resolve && job.resolve(); }catch(e){}
          resolve();
        } else if (job.type === 'confirm'){
          const ok = (action === 'ok');
          try{ job.resolve && job.resolve(ok); }catch(e){}
          resolve(ok);
        }
      }

    });
  }

  function escapeHtml(s){
    if (s == null) return '';
    return String(s).replace(/[&<>"]+/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]||ch); });
  }

  const api = {
    alert(message, options){
      options = options || {};
      return new Promise((resolve)=>{
        queue.push({ type: 'alert', title: options.title || '', message: message || '', okText: options.okText || 'OK', resolve });
        nextInQueue();
      });
    },
    confirm(message, options){
      options = options || {};
      return new Promise((resolve)=>{
        queue.push({ type: 'confirm', title: options.title || '', message: message || '', okText: options.okText || 'Đồng ý', cancelText: options.cancelText || 'Hủy', resolve });
        nextInQueue();
      });
    }
  };

  window.CustomModal = api;

})(window);
