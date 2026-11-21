// Umbro 2027 · Direção de Arte · canvas infinito dos dois KVs
(async function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const M = await fetch('manifest.json?t=' + Date.now()).then(r => r.json());
  const CAPN = { abertura: 'Abertura', repertorio: 'Repertório', exploracao: 'Exploração', sistema: 'Sistema', kv: 'Key visual', aplicacoes: 'Aplicações' };
  const KVN = { jc: 'O Jogo Continua', aa: 'Arquivo Aberto' };
  const G = { pad: 100, cw: 2240, gap: 40, leg: 56, comum: 1240 };
  const palco = $('#palco'), mundo = $('#mundo');
  const chapa = { jc: $('#chapa-jc'), comum: $('#chapa-comum'), aa: $('#chapa-aa') };
  chapa.jc.style.width = chapa.aa.style.width = (G.cw + 2 * G.pad) + 'px'; chapa.comum.style.width = G.comum + 'px';
  const filtro = { kv: 'todos', cap: 'todos', pecas: false };
  const porId = {}; let visiveis = [], Wm = 1, Hm = 1; const pos = {};

  // numeral do cabeçalho e colunas da grade
  { const g = Placa.seg('+27', 340, { jit: 1 }); const s = $('#num-jc'); s.setAttribute('viewBox', '0 0 ' + g.W.toFixed(0) + ' 340'); s.style.width = g.W.toFixed(0) + 'px'; s.innerHTML = '<path d="' + g.off + '" fill="#222"/><path d="' + g.on + '" fill="#FF4A1C"/>'; }
  { let c = ''; const cw = 270 / 12; for (let i = 0; i < 12; i++) c += '<rect x="' + (15 + i * cw + 3) + '" y="15" width="' + (cw - 6) + '" height="349" fill="#FF4A1C" opacity=".28"/>'; $('#colunas').innerHTML = c; }

  // elementos
  const cabs = {};
  for (const kv of ['jc', 'aa']) {
    M.caps.forEach((cap, n) => { const h = document.createElement('div'); h.className = 'capitulo'; h.style.width = G.cw + 'px'; h.innerHTML = '<b><i>' + String(n).padStart(2, '0') + '</i>' + CAPN[cap] + '</b><span></span>'; chapa[kv].appendChild(h); cabs[kv + cap] = h; });
  }
  for (const it of M.itens) {
    porId[it.id] = it;
    it.H = it.tipo === 'tela' ? 331 : it.tipo === 'prancha' ? 760 : 460; it.W = Math.round(it.H * it.w / it.h);
    const b = document.createElement('button'); b.className = 'item'; b.style.width = it.W + 'px'; b.dataset.id = it.id; b.setAttribute('aria-label', it.codigo + ' ' + it.titulo);
    const im = document.createElement('img'); im.src = it.t + '?v=' + it.v; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.draggable = false; im.style.height = it.H + 'px';
    const l = document.createElement('span'); l.className = 'leg'; l.innerHTML = '<b></b>'; l.firstChild.textContent = it.codigo; l.append(it.titulo);
    b.append(im, l); chapa[it.kv].appendChild(b); it.el = b; it.img = im;
  }

  // ── leiaute: reorganiza conforme os filtros ────────────────────────────────
  function leiaute() {
    const ve = it => (filtro.cap === 'todos' || it.cap === filtro.cap) && (!filtro.pecas || it.tipo !== 'tela');
    visiveis = []; let x = 0, alt = 0; const linhas = [];
    const ordem = ['jc', 'comum', 'aa'];
    for (const kv of ordem) {
      const ch = chapa[kv];
      const some = kv === 'comum' ? (filtro.kv !== 'todos' || filtro.cap !== 'todos' || filtro.pecas) : (filtro.kv !== 'todos' && filtro.kv !== kv);
      ch.classList.toggle('fora', some); ch.style.height = '';
      if (some) { pos[kv] = null; if (kv !== 'comum') for (const it of M.itens) if (it.kv === kv) it.el.classList.add('fora'); continue; }
      ch.style.left = x + 'px';
      let y;
      if (kv === 'comum') { y = ch.scrollHeight; }
      else {
        y = G.pad + ch.querySelector('.cabeca').offsetHeight + 90;
        for (const cap of M.caps) {
          const lista = M.itens.filter(i => i.kv === kv && i.cap === cap), dentro = lista.filter(ve), h = cabs[kv + cap];
          for (const it of lista) if (!ve(it)) it.el.classList.add('fora');
          h.classList.toggle('fora', !dentro.length); if (!dentro.length) continue;
          h.style.transform = 'translate(' + G.pad + 'px,' + y + 'px)'; h.lastChild.textContent = dentro.length + (dentro.length > 1 ? ' itens' : ' item');
          linhas.push({ kv, x: x + G.pad, y, w: G.cw });
          y += 84; let cx = 0, rh = 0, classe = null;
          for (const it of dentro) {
            const c = it.tipo === 'tela' ? 't' : 'o';
            if ((classe && c !== classe) || (cx && cx + it.W > G.cw)) { cx = 0; y += rh + G.leg + G.gap; rh = 0; }
            it.x = x + G.pad + cx; it.y = y; it.el.classList.remove('fora'); it.el.style.transform = 'translate(' + (G.pad + cx) + 'px,' + y + 'px)';
            cx += it.W + G.gap; rh = Math.max(rh, it.H); classe = c; visiveis.push(it);
          }
          y += rh + G.leg + 110;
        }
        y += G.pad - 60;
      }
      const w = ch.offsetWidth; pos[kv] = { x, w, h: y }; x += w; alt = Math.max(alt, y);
    }
    for (const kv of ordem) if (pos[kv]) { chapa[kv].style.height = alt + 'px'; pos[kv].h = alt; }
    Wm = Math.max(x, 1); Hm = Math.max(alt, 1); mundo.style.width = Wm + 'px'; mundo.style.height = Hm + 'px';
    $('#conta').textContent = visiveis.length + ' de ' + M.itens.length + ' itens';
    // minimapa
    const mm = $('#mini-mundo'); mm.style.height = Math.min(150, mm.clientWidth * Hm / Wm) + 'px';
    mm.innerHTML = ordem.filter(k => pos[k]).map(k => '<i class="' + k + '" style="left:' + (pos[k].x / Wm * 100) + '%;width:' + (pos[k].w / Wm * 100) + '%;height:100%"></i>').join('') +
      linhas.map(l => '<u class="' + l.kv + '" style="left:' + (l.x / Wm * 100) + '%;width:' + (l.w / Wm * 100) + '%;top:' + (l.y / Hm * 100) + '%"></u>').join('');
    aplica();
  }

  // ── vista: arrastar, zoom, enquadrar ───────────────────────────────────────
  const v = { x: 0, y: 0, k: 0.2 }; let anim = 0, lodT = 0;
  const lim = (n, a, b) => Math.min(b, Math.max(a, n));
  function aplica() {
    const pw = palco.clientWidth, ph = palco.clientHeight;
    v.k = lim(v.k, 0.03, 4); v.x = lim(v.x, 80 - Wm * v.k, pw - 80); v.y = lim(v.y, 80 - Hm * v.k, ph - 80);
    mundo.style.transform = 'translate(' + v.x + 'px,' + v.y + 'px) scale(' + v.k + ')';
    $('#pct').textContent = Math.round(v.k * 100) + '%';
    const mv = $('#mini-vista'), mm = $('#mini-mundo'), mw = mm.clientWidth, mh = mm.clientHeight, pd = mm.offsetLeft;
    const l = lim(-v.x / v.k / Wm, 0, 1), t = lim(-v.y / v.k / Hm, 0, 1), r = lim((pw - v.x) / v.k / Wm, 0, 1), b = lim((ph - v.y) / v.k / Hm, 0, 1);
    mv.style.left = (pd + l * mw) + 'px'; mv.style.top = (mm.offsetTop + t * mh) + 'px'; mv.style.width = Math.max(4, (r - l) * mw) + 'px'; mv.style.height = Math.max(4, (b - t) * mh) + 'px';
    clearTimeout(lodT); lodT = setTimeout(detalhe, 160);
  }
  function detalhe() { // troca a miniatura pela grande quando a tela cresce na vista
    const pw = palco.clientWidth, ph = palco.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const it of visiveis) { if (it.alta) continue; const sx = it.x * v.k + v.x, sy = it.y * v.k + v.y, sw = it.W * v.k; if (sw * dpr > 800 && sx < pw && sx + sw > 0 && sy < ph && sy + it.H * v.k > 0) { it.alta = 1; const g = new Image(); g.onload = () => { it.img.src = g.src; }; g.src = it.g + '?v=' + it.v; } }
  }
  function zoomEm(px, py, f) { const k = lim(v.k * f, 0.03, 4); f = k / v.k; v.x = px - (px - v.x) * f; v.y = py - (py - v.y) * f; v.k = k; aplica(); }
  function vai(alvo, suave) {
    cancelAnimationFrame(anim); const de = { ...v }, t0 = performance.now(), dur = suave === false || matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    const passo = t => { const p = dur ? lim((t - t0) / dur, 0, 1) : 1, e = 1 - Math.pow(1 - p, 3); v.x = de.x + (alvo.x - de.x) * e; v.y = de.y + (alvo.y - de.y) * e; v.k = de.k + (alvo.k - de.k) * e; aplica(); if (p < 1) anim = requestAnimationFrame(passo); }; passo(t0);
  }
  function enquadra(r, modo, suave) { // modo 'tudo' = cabe inteiro; 'largura' = cabe na largura, alinhado ao alto
    const pw = palco.clientWidth, ph = palco.clientHeight, mg = pw < 760 ? 12 : 36;
    const k = modo === 'tudo' ? Math.min((pw - 2 * mg) / r.w, (ph - 2 * mg) / r.h) : (pw - 2 * mg) / r.w;
    vai({ k, x: (pw - r.w * k) / 2 - r.x * k, y: modo === 'tudo' ? (ph - r.h * k) / 2 - (r.y || 0) * k : mg - (r.y || 0) * k }, suave);
  }
  const tudo = () => ({ x: 0, y: 0, w: Wm, h: Hm });
  function inicio(suave) { const estreito = palco.clientWidth < 760; if (filtro.kv !== 'todos' && pos[filtro.kv]) enquadra(pos[filtro.kv], 'largura', suave); else if (estreito && pos.jc) enquadra(pos.jc, 'largura', suave); else enquadra(tudo(), 'largura', suave); }

  const pts = new Map(); let mexeu = false, soma = 0, ant = null;
  const rel = e => { const r = palco.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  palco.addEventListener('pointerdown', e => { if (e.button > 0) return; cancelAnimationFrame(anim); pts.set(e.pointerId, rel(e)); if (pts.size === 1) { mexeu = false; soma = 0; } ant = null; $('#dica').classList.add('some'); });
  window.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId), n = rel(e), dx = n.x - p.x, dy = n.y - p.y; pts.set(e.pointerId, n);
    if (pts.size === 1) { soma += Math.abs(dx) + Math.abs(dy); if (soma > 6) { mexeu = true; palco.classList.add('arrasta'); } if (mexeu) { v.x += dx; v.y += dy; aplica(); } }
    else if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; if (ant) { v.x += c.x - ant.c.x; v.y += c.y - ant.c.y; zoomEm(c.x, c.y, d / ant.d); } ant = { d, c }; mexeu = true; }
  });
  const solta = e => { pts.delete(e.pointerId); ant = null; if (!pts.size) palco.classList.remove('arrasta'); };
  window.addEventListener('pointerup', solta); window.addEventListener('pointercancel', solta);
  palco.addEventListener('wheel', e => { e.preventDefault(); $('#dica').classList.add('some'); const p = rel(e), d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; zoomEm(p.x, p.y, Math.exp(-d * (e.ctrlKey ? 0.012 : 0.0016))); }, { passive: false });
  palco.addEventListener('click', e => { const b = e.target.closest('.item'); if (b && !mexeu) abre(b.dataset.id); });
  palco.addEventListener('dragstart', e => e.preventDefault());

  $('.zoom').addEventListener('click', e => { const z = e.target.dataset.z; if (!z) return; const pw = palco.clientWidth / 2, ph = palco.clientHeight / 2; if (z === '+') zoomEm(pw, ph, 1.4); else if (z === '-') zoomEm(pw, ph, 1 / 1.4); else if (z === '1') zoomEm(pw, ph, 1 / v.k); else enquadra(tudo(), 'tudo'); });
  const pula = k => { if (pos[k]) enquadra(pos[k], 'largura'); };
  $('.atalhos').addEventListener('click', e => { const b = e.target.closest('button'); if (b) pula(b.dataset.vai); });
  { const mini = $('#mini'), mm = $('#mini-mundo'); let pega = false; const leva = e => { const r = mm.getBoundingClientRect(), wx = lim((e.clientX - r.left) / r.width, 0, 1) * Wm, wy = lim((e.clientY - r.top) / r.height, 0, 1) * Hm; v.x = palco.clientWidth / 2 - wx * v.k; v.y = palco.clientHeight / 2 - wy * v.k; aplica(); };
    mini.addEventListener('pointerdown', e => { pega = true; mini.setPointerCapture(e.pointerId); cancelAnimationFrame(anim); leva(e); }); mini.addEventListener('pointermove', e => { if (pega) leva(e); }); mini.addEventListener('pointerup', () => { pega = false; }); mini.addEventListener('pointercancel', () => { pega = false; }); }

  // filtros
  $('.filtros').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return; const g = c.parentElement, f = g.dataset.filtro;
    if (f === 'pecas') { filtro.pecas = !filtro.pecas; c.classList.toggle('on', filtro.pecas); }
    else { filtro[f] = c.dataset.v; for (const o of g.children) o.classList.toggle('on', o === c); }
    for (const o of $$('.chip')) o.setAttribute('aria-pressed', o.classList.contains('on'));
    leiaute(); inicio();
  });

  // ── tela cheia ─────────────────────────────────────────────────────────────
  const cheia = $('#cheia'); let idx = 0;
  function mostra() {
    const it = visiveis[idx]; if (!it) return;
    cheia.style.setProperty('--ac', it.kv === 'jc' ? '#FF4A1C' : '#0033A0'); cheia.style.setProperty('--acf', it.kv === 'jc' ? '#111111' : '#FFFFFF');
    $('#ch-cod').textContent = it.codigo; $('#ch-tit').textContent = it.titulo; $('#ch-meta').textContent = KVN[it.kv] + ' · ' + CAPN[it.cap];
    $('#ch-n').textContent = (idx + 1) + ' / ' + visiveis.length;
    const im = new Image(); im.alt = it.codigo + ' · ' + it.titulo; im.src = it.g + '?v=' + it.v; im.draggable = false; $('#ch-img').replaceChildren(im);
    const cr = $('#ch-cred'); cr.textContent = ''; if (it.credito) { cr.append('Foto: '); if (it.link) { const a = document.createElement('a'); a.href = it.link; a.target = '_blank'; a.rel = 'noopener'; a.textContent = it.credito; cr.append(a); } else cr.append(it.credito); }
    $('#ch-ant').disabled = idx === 0; $('#ch-prox').disabled = idx === visiveis.length - 1;
    const px = visiveis[idx + 1]; if (px) new Image().src = px.g + '?v=' + px.v;
    history.replaceState(null, '', '#i=' + it.id);
  }
  function abre(id) { const i = visiveis.findIndex(x => x.id === id); if (i < 0) return; idx = i; cheia.hidden = false; mostra(); $('#ch-x').focus(); }
  function fechaCheia() { cheia.hidden = true; history.replaceState(null, '', location.pathname + location.search); }
  const passo = d => { const n = idx + d; if (n >= 0 && n < visiveis.length) { idx = n; mostra(); } };
  $('#ch-x').addEventListener('click', fechaCheia); $('#ch-ant').addEventListener('click', () => passo(-1)); $('#ch-prox').addEventListener('click', () => passo(1));
  { let x0 = null; const a = $('#ch-img'); a.addEventListener('pointerdown', e => { x0 = e.clientX; }); a.addEventListener('pointerup', e => { if (x0 == null) return; const d = e.clientX - x0; x0 = null; if (d > 50) passo(-1); else if (d < -50) passo(1); }); a.addEventListener('pointercancel', () => { x0 = null; }); }

  // folhas: monte a placa, créditos
  function folha(id) { for (const f of $$('.folha')) f.hidden = f.id !== id; if (id) { history.replaceState(null, '', '#' + id); if (id === 'placa' && Placa.desenha) Placa.desenha(); } else history.replaceState(null, '', location.pathname + location.search); }
  document.addEventListener('click', e => { const a = e.target.closest('[data-abre]'); if (a) { if (a.closest('#palco') && mexeu) return; folha(a.dataset.abre); } else if (e.target.closest('[data-fecha]')) folha(null); });
  $('#cr-lista').innerHTML = M.creditos.map(g => '<h3></h3><ul>' + g.itens.map(() => '<li><span><a target="_blank" rel="noopener"></a></span><span></span><span></span></li>').join('') + '</ul>').join('');
  M.creditos.forEach((g, i) => { $$('#cr-lista h3')[i].textContent = g.nome; const lis = $$('#cr-lista ul')[i].children; g.itens.forEach((c, j) => { const [a, b, d] = lis[j].children; a.firstChild.href = c.pagina; a.firstChild.textContent = c.titulo; b.textContent = c.autor; if (c.uso) { const em = document.createElement('em'); em.textContent = ' · ' + c.uso + (c.nota ? ' (' + c.nota + ')' : ''); b.append(em); } d.textContent = c.licenca; }); });
  $('#cr-gerado').textContent = 'Atualizado em ' + M.gerado + ' · ' + M.itens.length + ' itens';

  // teclado
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!cheia.hidden) { if (e.key === 'Escape') fechaCheia(); else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); passo(1); } else if (e.key === 'ArrowLeft') passo(-1); return; }
    const aberta = $$('.folha').find(f => !f.hidden); if (aberta) { if (e.key === 'Escape') folha(null); return; }
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const pw = palco.clientWidth / 2, ph = palco.clientHeight / 2, d = 120;
    if (e.key === 'ArrowLeft') { v.x += d; aplica(); } else if (e.key === 'ArrowRight') { v.x -= d; aplica(); } else if (e.key === 'ArrowUp') { v.y += d; aplica(); } else if (e.key === 'ArrowDown') { v.y -= d; aplica(); }
    else if (e.key === '+' || e.key === '=') zoomEm(pw, ph, 1.4); else if (e.key === '-') zoomEm(pw, ph, 1 / 1.4); else if (e.key === '0') enquadra(tudo(), 'tudo'); else if (e.key === '1') pula('jc'); else if (e.key === '2') pula('comum'); else if (e.key === '3') pula('aa');
  });
  let rt = 0, tocou = false, larg = palco.clientWidth;
  palco.addEventListener('pointerdown', () => { tocou = true; }); palco.addEventListener('wheel', () => { tocou = true; }, { passive: true });
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { const era = larg; larg = palco.clientWidth; if (!larg) return; leiaute(); if (!era || !tocou) inicio(false); }, 80); }).observe(palco);

  // partida
  leiaute(); inicio(false); setTimeout(() => mundo.classList.add('vivo'), 900);
  setTimeout(() => $('#dica').classList.add('some'), 7000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { leiaute(); if (!tocou) inicio(false); });
  Placa.iniciar(M);
  const h = location.hash.slice(1); if (h === 'placa' || h === 'creditos') folha(h); else if (h.startsWith('i=')) abre(decodeURIComponent(h.slice(2)));
  window.DA = { M, v, filtro, leiaute, visiveis: () => visiveis, pos };
})();
