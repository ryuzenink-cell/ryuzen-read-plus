(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const labels = { draft:'Rascunho', scheduled:'Agendado', published:'Publicado', hidden:'Oculto', archived:'Arquivado', ongoing:'Em andamento', completed:'Concluída', development:'Em desenvolvimento', paused:'Em hiato', prologue:'Prólogo', chapter:'Capítulo', interlude:'Interlúdio', epilogue:'Epílogo', extra:'Extra' };
  const actionLabels = { work_created:'Obra criada',work_updated:'Obra editada',work_published:'Obra publicada',work_unpublished:'Publicação alterada',chapter_created:'Capítulo criado',chapter_updated:'Capítulo editado',chapter_published:'Capítulo publicado',banner_created:'Banner criado',banner_updated:'Banner atualizado',banner_activated:'Banner ativado',banner_deactivated:'Banner desativado',event_created:'Evento criado',event_updated:'Evento atualizado',settings_updated:'Configurações atualizadas' };
  const fmt = (d, time = false) => d ? new Intl.DateTimeFormat('pt-BR', time ? { dateStyle:'medium', timeStyle:'short' } : { dateStyle:'medium' }).format(new Date(d)) : '—';
  const localInput = (d) => { if (!d) return ''; const p = new Date(d); if (Number.isNaN(p.getTime())) return String(d).slice(0,16); return new Date(p.getTime()-p.getTimezoneOffset()*60000).toISOString().slice(0,16); };
  const iso = (v) => v ? new Date(v).toISOString() : null;
  const value = (form, n) => form.elements[n]?.value?.trim?.() || '';
  const checked = (form, n) => Boolean(form.elements[n]?.checked);
  const slugify = (v) => String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,90);
  function note(el, text, kind='success') { if (!el) return; el.textContent=text; el.className=`notice ${kind}`; el.classList.remove('hidden'); }
  async function json(url, options={}) { const res=await fetch(url,{credentials:'include',...options}); const data=await res.json().catch(()=>({})); if(!res.ok||!data.ok) throw new Error(data.message||'Não foi possível concluir a ação.'); return data; }
  const send = (url, method, payload) => json(url,{method,headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  function markdown(text) {
    let out = esc(text || '');
    out = out.replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>');
    out = out.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
    return out.split(/\n{2,}/).map(p => /^<h[1-3]>/.test(p) ? p : `<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
  }
  function activityMarkup(item) { return `<article class="timeline-item"><div><strong>${esc(actionLabels[item.action] || item.action)}</strong><p>${esc(item.entity_title || 'Conteúdo editorial')}</p></div><time>${esc(fmt(item.created_at, true))}</time></article>`; }

  async function initOverview() {
    const root = $('[data-admin-overview]'); if (!root) return;
    const msg = $('[data-admin-overview-message]', root);
    try {
      const data = await json('/api/admin/overview');
      const map = { works:'[data-stat-works]', published:'[data-stat-published]', drafts:'[data-stat-drafts]', chapters:'[data-stat-chapters]', scheduledChapters:'[data-stat-scheduled]', activeBanners:'[data-stat-banners]', futureEvents:'[data-stat-events]', worksWithoutChapters:'[data-stat-uncovered]' };
      Object.entries(map).forEach(([key, sel]) => { const el=$(sel, root); if(el) el.textContent=String(data.stats[key] ?? 0); });
      $('[data-pendencies]', root).innerHTML = data.pendencies.length ? data.pendencies.map(p => `<a class="task-item ${esc(p.level)}" href="${esc(p.href)}"><span>${esc(p.label)}</span><strong>Corrigir →</strong></a>`).join('') : '<div class="empty-state"><p>Nenhuma pendência detectada neste momento.</p></div>';
      $('[data-upcoming-events]', root).innerHTML = data.upcoming.length ? data.upcoming.map(e => `<article class="chapter-item"><div><strong>${esc(e.title)}</strong><small>${esc(fmt(e.scheduled_at, true))}${e.work_title ? ` · ${esc(e.work_title)}`:''}</small></div><span class="status-pill ${esc(e.status)}">${esc(e.status)}</span></article>`).join('') : '<p class="muted">Nenhum evento editorial futuro.</p>';
      $('[data-overview-activity]', root).innerHTML = data.activity.length ? data.activity.map(activityMarkup).join('') : '<p class="muted">Nenhuma atividade registrada ainda.</p>';
      $('[data-recent-works]', root).innerHTML = data.recentWorks.length ? data.recentWorks.map(w => `<article class="chapter-item"><div><strong>${esc(w.title)}</strong><small>${esc(fmt(w.updated_at, true))}</small></div><a class="btn ghost" href="/admin/obras/nova/?id=${esc(w.id)}">Editar</a></article>`).join('') : '<p class="muted">Nenhuma obra cadastrada ainda.</p>';
      $('[data-recent-chapters]', root).innerHTML = data.recentChapters.length ? data.recentChapters.map(c => `<article class="chapter-item"><div><strong>${esc(c.title)}</strong><small>${esc(c.work_title)} · ${esc(fmt(c.updated_at, true))}</small></div><a class="btn ghost" href="/admin/capitulos/?id=${esc(c.id)}">Editar</a></article>`).join('') : '<p class="muted">Nenhum capítulo cadastrado.</p>';
    } catch (e) { note(msg, e.message, 'error'); }
  }

  async function initWorks() {
    const root = $('[data-admin-works-list]'); if (!root) return;
    const body = $('[data-works-body]', root), msg = $('[data-works-message]', root);
    const filters = $$('[data-work-filter]', root);
    let debounce;
    async function load() {
      const params = new URLSearchParams(); filters.forEach(f => { if(f.value) params.set(f.dataset.workFilter, f.value); });
      try {
        const data = await json(`/api/admin/works?${params}`);
        body.innerHTML = data.items.length ? data.items.map(w => `<article class="surface admin-work-card">
          <div class="work-cover-mini">${w.cover_url ? `<img src="${esc(w.cover_url)}" alt="">` : '<span>Sem capa</span>'}</div>
          <div class="work-card-main"><div class="card-meta"><span class="status-pill ${esc(w.publication_status)}">${esc(labels[w.publication_status]||w.publication_status)}</span><span class="chip">${w.type==='light_novel'?'Light novel':'Webnovel'}</span>${w.is_featured ? '<span class="chip primary">Destaque</span>' : ''}${w.has_active_banner ? '<span class="chip">Banner ativo</span>' : ''}</div>
          <h2>${esc(w.title)}</h2><p class="muted">${esc(w.author_name || 'Ryuzen')} · ${esc(labels[w.status] || w.status)} · ${esc(w.chapter_count || 0)} capítulo(s)</p><small class="muted">Atualizada em ${esc(fmt(w.updated_at, true))}</small></div>
          <div class="work-card-actions"><a class="btn soft" href="/admin/obras/nova/?id=${esc(w.id)}">Editar</a>${w.publication_status==='published'?`<a class="btn ghost" href="/obra/${esc(w.slug)}/" target="_blank">Ver</a>`:''}<a class="btn ghost" href="/admin/capitulos/?work_id=${esc(w.id)}#novo">Criar capítulo</a><a class="btn ghost" href="/admin/banners/">Banner</a><button class="btn ghost" data-publish-work="${esc(w.id)}" data-publication="${w.publication_status==='published'?'hidden':'published'}">${w.publication_status==='published'?'Despublicar':'Publicar'}</button><button class="btn ghost" data-feature-work="${esc(w.id)}" data-next="${w.is_featured?0:1}">${w.is_featured?'Remover destaque':'Destacar'}</button><button class="btn ghost danger-link" data-archive-work="${esc(w.id)}">Arquivar</button></div>
        </article>`).join('') : '<div class="surface empty-state"><h2>Nenhuma obra encontrada.</h2><p class="muted">Ajuste os filtros ou cadastre a primeira obra.</p></div>';
      } catch(e) { note(msg,e.message,'error'); }
    }
    filters.forEach(f => f.addEventListener('input', () => { clearTimeout(debounce); debounce=setTimeout(load,250); }));
    root.addEventListener('click', async e => {
      const publish=e.target.closest('[data-publish-work]'), feature=e.target.closest('[data-feature-work]'), archive=e.target.closest('[data-archive-work]');
      try {
        if (publish && confirm(`${publish.dataset.publication==='published' ? 'Publicar' : 'Despublicar'} esta obra?`)) { await send(`/api/admin/works/${publish.dataset.publishWork}`,'PATCH',{publication_status:publish.dataset.publication}); note(msg,'Status de publicação atualizado.'); await load(); }
        if (feature) { await send(`/api/admin/works/${feature.dataset.featureWork}`,'PATCH',{is_featured:feature.dataset.next==='1'}); note(msg,'Destaque atualizado.'); await load(); }
        if (archive && confirm('Arquivar esta obra? Ela deixará de ficar publicada, mas os dados serão preservados.')) { await send(`/api/admin/works/${archive.dataset.archiveWork}`,'PATCH',{publication_status:'archived'}); note(msg,'Obra arquivada sem exclusão de dados.'); await load(); }
      } catch(err) { note(msg,err.message,'error'); }
    });
    load();
  }

  function setImg(input, target, emptyText) {
    const url = input?.value?.trim(); if(!target) return;
    target.innerHTML = url ? `<img src="${esc(url)}" alt="Pré-visualização" loading="lazy">` : `<p class="muted">${emptyText}</p>`;
  }
  function workPayload(form, status) {
    const fields = ['title','alternate_title','subtitle','slug','author_name','illustrator_name','type','status','publication_status','language','age_rating','description','short_description','content_warnings','cover_url','cover_alt','cover_credit','banner_url','mobile_banner_url','social_image_url','banner_alt','banner_credit','genres','tags','access_model','external_url','external_label','published_at','scheduled_at','seo_title','seo_description','featured_priority','featured_label','editorial_notes'];
    const out = Object.fromEntries(fields.map(k => [k, value(form,k)]));
    out.publication_status=status || out.publication_status; out.is_free=checked(form,'is_free'); out.is_featured=checked(form,'is_featured');
    ['published_at','scheduled_at'].forEach(k => out[k]=iso(out[k]));
    return out;
  }
  async function initWorkForm() {
    const root = $('[data-admin-work-editor]'); if(!root) return;
    const form=$('[data-admin-work-form]',root), msg=$('[data-work-form-message]',root), params=new URLSearchParams(location.search), id=params.get('id');
    const promo=form.elements.short_description, count=$('[data-promo-count]',root), warn=$('[data-promo-warning]',root);
    function promoCheck(){ const n=promo.value.length; count.textContent=`${n} caracteres`; warn.classList.toggle('hidden', n<=160); }
    function refreshMedia(){ setImg(form.elements.cover_url,$('[data-cover-preview]',root),'Sem capa configurada.'); setImg(form.elements.banner_url,$('[data-banner-preview]',root),'Sem banner desktop.'); setImg(form.elements.mobile_banner_url,$('[data-mobile-banner-preview]',root),'Sem banner mobile.'); $('[data-mobile-banner-status]',root).textContent=form.elements.mobile_banner_url.value.trim()?'Versão mobile configurada.':'Versão mobile ainda não configurada.'; }
    promo.addEventListener('input',promoCheck); ['cover_url','banner_url','mobile_banner_url'].forEach(n => form.elements[n].addEventListener('input',refreshMedia));
    form.elements.title.addEventListener('input',()=>{ if(!id&&!form.elements.slug.value) form.elements.slug.value=slugify(form.elements.title.value); });
    if(id) {
      try { const {item:w}=await json(`/api/admin/works/${id}`); $('[data-work-form-title]',root).textContent='Editar obra'; const fields=['title','alternate_title','subtitle','slug','author_name','illustrator_name','type','status','publication_status','language','age_rating','description','short_description','content_warnings','cover_url','cover_alt','cover_credit','banner_url','mobile_banner_url','social_image_url','banner_alt','banner_credit','access_model','external_url','external_label','seo_title','seo_description','featured_priority','featured_label','editorial_notes']; fields.forEach(k=>{if(form.elements[k])form.elements[k].value=w[k]||''}); form.elements.genres.value=(w.genres||[]).map(g=>g.name).join(', '); form.elements.tags.value=(w.tags||[]).map(t=>t.name).join(', '); form.elements.is_free.checked=Boolean(w.is_free); form.elements.is_featured.checked=Boolean(w.is_featured); form.elements.published_at.value=localInput(w.published_at); form.elements.scheduled_at.value=localInput(w.scheduled_at); const link=$('[data-public-preview]',root); if(w.publication_status==='published'){link.href=`/obra/${w.slug}/`;link.hidden=false;} promoCheck();refreshMedia(); }
      catch(e){note(msg,e.message,'error');}
    } else { promoCheck(); refreshMedia(); }
    $('[data-work-preview]',root).addEventListener('click',()=>{
      const d=workPayload(form); const dialog=$('[data-work-preview-dialog]',root); $('[data-work-preview-render]',dialog).innerHTML=`<article class="work-page-preview">${d.banner_url?`<img class="preview-hero" src="${esc(d.banner_url)}" alt="">`:''}<div class="preview-work-content">${d.cover_url?`<img class="preview-cover" src="${esc(d.cover_url)}" alt="">`:''}<div><p class="eyebrow">${esc(d.type==='light_novel'?'Light novel':'Webnovel')}</p><h1>${esc(d.title||'Título da obra')}</h1><p class="muted">por ${esc(d.author_name||'Autor')}</p><p>${esc(d.description||'A sinopse completa aparecerá aqui.')}</p><div class="card-meta">${value(form,'genres').split(',').filter(Boolean).map(g=>`<span class="chip">${esc(g.trim())}</span>`).join('')}</div><button class="btn primary" type="button">Começar leitura</button></div></div></article>`; dialog.showModal();
    });
    $('[data-close-preview]',root).addEventListener('click',()=> $('[data-work-preview-dialog]',root).close());
    form.addEventListener('submit', async e => { e.preventDefault(); const b=e.submitter; b.disabled=true; try { const data=await send(id?`/api/admin/works/${id}`:'/api/admin/works', id?'PATCH':'POST', workPayload(form,b.dataset.publicationStatus)); note(msg,data.message); if(!id&&data.id) location.href=`/admin/obras/nova/?id=${encodeURIComponent(data.id)}`; } catch(err){note(msg,err.message,'error');} finally {b.disabled=false;} });
  }

  function chapterPayload(form, status) {
    const out={ work_id:value(form,'work_id'),volume_number:value(form,'volume_number'),chapter_type:value(form,'chapter_type'),number:value(form,'number'),order_index:value(form,'order_index'),title:value(form,'title'),slug:value(form,'slug'),excerpt:value(form,'excerpt'),content:value(form,'content'),content_format:'markdown',publication_status:status||value(form,'publication_status'),scheduled_at:iso(value(form,'scheduled_at')),is_free:checked(form,'is_free'),seo_title:value(form,'seo_title'),seo_description:value(form,'seo_description') };
    return out;
  }
  async function initChapters() {
    const root=$('[data-admin-chapters]'); if(!root)return;
    const form=$('[data-chapter-form]',root), msg=$('[data-chapter-message]',root), body=$('[data-chapters-body]',root), filters=$$('[data-chapter-filter]',root); let editId=new URLSearchParams(location.search).get('id')||''; let items=[];
    const content=form.elements.content, preview=$('[data-chapter-preview]',root);
    function updatePreview(){ preview.innerHTML=content.value ? markdown(content.value) : '<p class="muted">Preview vazio.</p>'; const words=(content.value.trim().match(/\S+/g)||[]).length; $('[data-word-count]',root).textContent=`${words} palavras`; $('[data-reading-time]',root).textContent=`${words?Math.max(1,Math.ceil(words/220)):0} min de leitura`; }
    async function works(){ const data=await json('/api/admin/works'); const opts=(data.items||[]).map(w=>`<option value="${esc(w.id)}">${esc(w.title)}</option>`).join(''); form.elements.work_id.innerHTML='<option value="">Selecione uma obra</option>'+opts; $('[data-chapter-filter="work_id"]',root).innerHTML='<option value="">Todas as obras</option>'+opts; }
    async function load(){ const q=new URLSearchParams(); filters.forEach(f=>{if(f.value)q.set(f.dataset.chapterFilter,f.value)}); const data=await json(`/api/admin/chapters?${q}`); items=data.items||[]; body.innerHTML=items.length?items.map(c=>`<tr><td>Vol. ${esc(c.volume_number||1)} · ${esc(c.order_index||c.number)}</td><td><strong>${esc(labels[c.chapter_type]||'Capítulo')} — ${esc(c.title)}</strong><br><small>${esc(c.slug)}</small></td><td>${esc(c.work_title)}</td><td><span class="status-pill ${esc(c.publication_status)}">${esc(labels[c.publication_status]||c.publication_status)}</span></td><td>${esc(fmt(c.scheduled_at||c.published_at,true))}</td><td>${esc(fmt(c.updated_at,true))}</td><td><div class="table-actions"><button class="btn soft" type="button" data-edit-chapter="${esc(c.id)}">Editar</button>${c.publication_status==='published'?`<a class="btn ghost" target="_blank" href="/obra/${esc(c.work_slug)}/${esc(c.slug)}/">Ver</a>`:''}</div></td></tr>`).join(''):'<tr><td colspan="7">Nenhum capítulo encontrado.</td></tr>'; }
    function fill(c){ editId=c.id; ['work_id','volume_number','chapter_type','number','order_index','title','slug','excerpt','content','publication_status','seo_title','seo_description'].forEach(k=>{if(form.elements[k])form.elements[k].value=c[k]||''}); form.elements.scheduled_at.value=localInput(c.scheduled_at); form.elements.is_free.checked=Boolean(c.is_free); $('[data-chapter-form-title]',root).textContent='Editar capítulo'; updatePreview(); form.scrollIntoView({behavior:'smooth'}); }
    await works(); const preferredWork=new URLSearchParams(location.search).get('work_id'); if(preferredWork){form.elements.work_id.value=preferredWork; $('[data-chapter-filter="work_id"]',root).value=preferredWork;} await load(); if(editId){ try { fill((await json(`/api/admin/chapters/${editId}`)).item); } catch(e){note(msg,e.message,'error');} }
    filters.forEach(f=>f.addEventListener('input',load)); content.addEventListener('input',updatePreview); form.elements.title.addEventListener('input',()=>{if(!editId&&!form.elements.slug.value)form.elements.slug.value=slugify(form.elements.title.value)});
    $('[data-md-upload]',root).addEventListener('change', async e=>{ const file=e.target.files?.[0]; if(file){ content.value=await file.text(); updatePreview(); }});
    $('[data-new-chapter]',root).addEventListener('click',()=>{editId='';form.reset();form.elements.volume_number.value='1';form.elements.number.value='1';form.elements.order_index.value='1';form.elements.chapter_type.value='chapter';form.elements.is_free.checked=true;$('[data-chapter-form-title]',root).textContent='Novo capítulo';updatePreview();form.scrollIntoView({behavior:'smooth'});});
    root.addEventListener('click',async e=>{const btn=e.target.closest('[data-edit-chapter]'); if(btn) fill((await json(`/api/admin/chapters/${btn.dataset.editChapter}`)).item);});
    $('[data-reader-preview]',root).addEventListener('click',()=>{const d=$('[data-reader-preview-dialog]',root); $('[data-reader-preview-render]',d).innerHTML=`<p class="eyebrow">${esc(labels[value(form,'chapter_type')]||'Capítulo')}</p><h1>${esc(value(form,'title')||'Título do capítulo')}</h1>${markdown(content.value||'O conteúdo aparecerá aqui.')}`; d.showModal();});
    $('[data-close-reader-preview]',root).addEventListener('click',()=> $('[data-reader-preview-dialog]',root).close());
    form.addEventListener('submit',async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{const data=await send(editId?`/api/admin/chapters/${editId}`:'/api/admin/chapters',editId?'PATCH':'POST',chapterPayload(form,b.dataset.publicationStatus));note(msg,data.message);editId=data.id||editId;await load();}catch(err){note(msg,err.message,'error');}finally{b.disabled=false;}});
    updatePreview();
  }
  initOverview(); initWorks(); initWorkForm(); initChapters();
})();