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
  const filtro = { kv: 'todos', cap: 'todos', pecas: false, q: '' }; let vista = 'refs', sigGrade = null;
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TIPO = { tela: 'Tela do livro', peca: 'Peça em tamanho real', prancha: 'Prancha de exploração', foto: 'Foto em limiar de duas tintas' };
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
    porId[it.id] = it; it.busca = norm([it.codigo, it.titulo, CAPN[it.cap], KVN[it.kv], it.credito || ''].join(' '));
    it.H = it.tipo === 'tela' ? 331 : it.tipo === 'prancha' ? 760 : 460; it.W = Math.round(it.H * it.w / it.h);
    const b = document.createElement('button'); b.className = 'item'; b.style.width = it.W + 'px'; b.dataset.id = it.id; b.setAttribute('aria-label', it.codigo + ' ' + it.titulo);
    const im = document.createElement('img'); im.src = it.t + '?v=' + it.v; im.alt = ''; im.decoding = 'async'; im.draggable = false; im.style.height = it.H + 'px';
    const l = document.createElement('span'); l.className = 'leg'; l.innerHTML = '<b></b>'; l.firstChild.textContent = it.codigo; l.append(it.titulo);
    b.append(im, l); chapa[it.kv].appendChild(b); it.el = b; it.img = im;
  }

  // ── leiaute: reorganiza conforme os filtros ────────────────────────────────
  function leiaute() {
    const ve = it => (filtro.cap === 'todos' || it.cap === filtro.cap) && (!filtro.pecas || it.tipo !== 'tela') && (!filtro.q || it.busca.includes(filtro.q));
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
    const sig = JSON.stringify(filtro); if (sig !== sigGrade) { sigGrade = sig; grade(); }
    if (vista === 'refs') { Wm = R.W; Hm = R.H; mundo.style.width = Wm + 'px'; mundo.style.height = Hm + 'px'; const mm2 = $('#mini-mundo'); mm2.style.height = Math.min(150, mm2.clientWidth * Hm / Wm) + 'px'; mm2.innerHTML = '<i class="jc" style="left:0;width:50%;height:100%"></i><i class="aa" style="left:50%;width:50%;height:100%"></i>'; return aplica(); }
    // minimapa
    const mm = $('#mini-mundo'); mm.style.height = Math.min(150, mm.clientWidth * Hm / Wm) + 'px';
    mm.innerHTML = ordem.filter(k => pos[k]).map(k => '<i class="' + k + '" style="left:' + (pos[k].x / Wm * 100) + '%;width:' + (pos[k].w / Wm * 100) + '%;height:100%"></i>').join('') +
      linhas.map(l => '<u class="' + l.kv + '" style="left:' + (l.x / Wm * 100) + '%;width:' + (l.w / Wm * 100) + '%;top:' + (l.y / Hm * 100) + '%"></u>').join('');
    aplica();
  }

  // ── rede de referências: referência → o que ensinou → experimento ou tela → key visual
  const R = { W: 4620, H: 1, cad: {}, kvs: null };
  function montaRede() {
    const rd = M.rede, el = $('#rede'); if (!rd) return;
    const X = { jc: { ref: 120, lic: 550, exp: 1040, kv: 1570 }, aa: { kv: 2350, exp: 3180, lic: 3690, ref: 4180 } }, WD = { ref: 320, lic: 380, exp: 400, kv: 700 }, y0 = 340, KH = 933;
    const lados = {}; let maxH = KH + 120;
    for (const kv of ['jc', 'aa']) { let y = 0; const cs = rd.lados[kv].cadeias.map((c, n) => {
      const rs = c.refs.map((r, i) => { const it = r.item && porId[r.item], w = c.trio ? 96 : WD.ref; let h, ih = 0; if (it || r.src) { const iw = it ? it.w : r.w, hh = it ? it.h : r.h; ih = Math.min(c.trio ? 96 : 170, w * hh / iw); h = ih + (c.trio ? 0 : 66); } else h = 128; return { r, it, i, w: it || r.src ? (c.trio ? 96 : Math.min(w, ih * (it ? it.w / it.h : r.w / r.h))) : w, h, ih }; });
      const hR = c.trio ? Math.max(...rs.map(r => r.h)) : rs.reduce((s, r) => s + r.h, 0) + 28 * (rs.length - 1);
      const ex = porId[c.exp.item], eh = Math.min(220, WD.exp * ex.h / ex.w), ew = eh * ex.w / ex.h, bh = Math.max(hR, eh + 50, 140), o = { c, n, key: kv + n, rs, hR, ex, eh, ew, y, bh }; y += bh + 40; return o; });
      lados[kv] = { cs, H: y - 40 }; maxH = Math.max(maxH, y - 40); }
    R.H = y0 + maxH + 140; el.style.width = R.W + 'px'; el.style.height = R.H + 'px';
    let h = '<h2 class="rd-tit jc">De onde vêm</h2><h2 class="rd-tit aa">os dois KVs.</h2>', lg = '';
    const col = (kv, x, w, t) => '<div class="rd-col ' + kv + '" style="left:' + x + 'px;width:' + w + 'px">' + t + '</div>';
    const curva = (x1, y1, x2, y2, cl) => { const d = (x2 - x1) / 2; return '<path class="lig ' + cl + '" d="M' + x1 + ' ' + y1 + 'C' + (x1 + d) + ' ' + y1 + ' ' + (x2 - d) + ' ' + y2 + ' ' + x2 + ' ' + y2 + '"/>'; };
    R.kvs = {};
    for (const kv of ['jc', 'aa']) { const L = lados[kv], x = X[kv], off = y0 + (maxH - L.H) / 2, kvTop = y0 + (maxH - KH) / 2, esq = kv === 'jc', K = porId[rd.lados[kv].kv];
      h += col(kv, x.ref, WD.ref, 'Referência') + col(kv, x.lic, WD.lic, 'O que ensinou') + col(kv, x.exp, WD.exp, 'Experimento ou tela') + col(kv, x.kv, WD.kv, 'Key visual');
      h += '<button class="no kv ' + kv + '" data-id="' + K.id + '" style="left:' + x.kv + 'px;top:' + kvTop + 'px;width:' + WD.kv + 'px"><img src="' + K.g + '?v=' + K.v + '" alt="" draggable="false"><b>' + KVN[kv] + '</b><small>' + esc(K.codigo + ' · ' + K.titulo) + '</small></button>';
      R.kvs[kv] = { x: x.kv, y: kvTop, w: WD.kv, h: KH };
      L.cs.forEach((o, n) => { const cy = off + o.y + o.bh / 2, cl = kv + ' c-' + o.key, c = o.c; R.cad[o.key] = { kv, c };
        let ry = cy - o.hR / 2, borda = esq ? x.ref + WD.ref : x.ref;
        if (c.trio) { o.rs.forEach((q, i) => { h += '<button class="no ref ' + cl + '" data-c="' + o.key + '" data-id="' + q.it.id + '" title="' + esc(q.it.titulo) + '" style="left:' + (x.ref + i * 112) + 'px;top:' + ry + 'px;width:96px"><img src="' + q.it.t + '?v=' + q.it.v + '" alt="" draggable="false" style="height:96px;object-fit:cover"></button>'; });
          h += '<div class="no ' + cl + '" style="left:' + x.ref + 'px;top:' + (ry + 100) + 'px;width:' + WD.ref + 'px"><b>Fotos de noite</b><small>trave, neblina, clarão · Flickr · CC BY e BY-SA · crédito em cada foto</small></div>'; lg += curva(borda, cy, esq ? x.lic : x.lic + WD.lic, cy, cl); }
        else for (const q of o.rs) { const r = q.r, it = q.it, attr = 'data-c="' + o.key + '" ' + (it ? 'data-id="' + it.id + '"' : 'data-r="' + q.i + '"') + ' style="left:' + x.ref + 'px;top:' + ry + 'px;width:' + (it || r.src ? q.w : WD.ref) + 'px"';
          if (it) h += '<button class="no ref ' + cl + '" ' + attr + '><img src="' + it.t + '?v=' + it.v + '" alt="" draggable="false"><b>' + esc(it.titulo) + '</b><small>' + esc(it.codigo + ' · ' + CAPN[it.cap]) + '</small></button>';
          else if (r.src) h += '<button class="no ref ' + cl + '" ' + attr + '><img src="' + r.src + '" alt="" draggable="false" width="' + r.w + '" height="' + r.h + '"><b>' + esc(r.titulo) + '</b><small>' + esc(r.credito) + '</small></button>';
          else h += '<button class="no ref txt ' + cl + '" ' + attr + '><b>' + esc(r.titulo) + '</b><span>' + esc(r.texto) + '</span><small>' + esc(r.credito) + '</small></button>';
          lg += curva(esq ? x.ref + (it || r.src ? q.w : WD.ref) : x.ref, ry + (it || r.src ? q.ih / 2 : q.h / 2), esq ? x.lic : x.lic + WD.lic, cy, cl); ry += q.h + 28; }
        h += '<div class="no lic ' + cl + '" data-c="' + o.key + '" style="left:' + x.lic + 'px;top:' + cy + 'px;width:' + WD.lic + 'px">' + esc(c.licao) + '</div>';
        h += '<button class="no exp ' + cl + '" data-c="' + o.key + '" data-id="' + o.ex.id + '" style="left:' + x.exp + 'px;top:' + (cy - (o.eh + 40) / 2) + 'px;width:' + o.ew + 'px"><img src="' + o.ex.t + '?v=' + o.ex.v + '" alt="" draggable="false"><b>' + esc(c.exp.rotulo) + '</b></button>';
        const ey = cy - 20, ky = kvTop + KH * (n + 1) / (L.cs.length + 1);
        lg += esq ? curva(x.lic + WD.lic, cy, x.exp, ey, cl) + curva(x.exp + o.ew, ey, x.kv, ky, cl) : curva(x.lic, cy, x.exp + o.ew, ey, cl) + curva(x.exp, ey, x.kv + WD.kv, ky, cl); });
    }
    el.innerHTML = '<svg width="' + R.W + '" height="' + R.H + '" viewBox="0 0 ' + R.W + ' ' + R.H + '">' + lg + '</svg>' + h;
  }
  function foca(key) { const el = $('#rede'); for (const n of $$('#rede .on')) n.classList.remove('on'); if (!key) return el.classList.remove('foco'); el.classList.add('foco'); for (const n of $$('#rede .c-' + key)) n.classList.add('on'); const kv = $('#rede .no.kv.' + R.cad[key].kv); if (kv) kv.classList.add('on'); }
  function fichaRef(key, ri) {
    const { kv, c } = R.cad[key], r = c.refs[ri], ex = porId[c.exp.item], K = porId[M.rede.lados[kv].kv]; fichaAberta = false; fichaEl.hidden = false; fichaEl.className = 'ficha ' + kv;
    fichaEl.innerHTML = '<header><span class="cod">Referência</span><span class="dado">' + KVN[kv] + '</span><button data-ficha-x aria-label="Fechar a ficha">✕</button></header><div class="fi-corpo fi-ref">' +
      (r.src ? '<div class="fi-img"><img src="' + r.src + '" alt="' + esc(r.titulo) + '"></div>' : '') + '<h3>' + esc(r.titulo) + '</h3>' + (r.texto ? '<p>' + esc(r.texto) + '</p>' : '') +
      '<dl><dt>Crédito</dt><dd>' + esc(r.credito) + '</dd></dl>' + (r.link ? '<a class="fonte" href="' + esc(r.link) + '" target="_blank" rel="noopener">Abrir a fonte ↗</a>' : '') +
      '<h4>O que ensinou</h4><p class="lic">' + esc(c.licao) + '</p><h4>Levou a</h4><div class="levou"><button data-id="' + ex.id + '"><img src="' + ex.t + '?v=' + ex.v + '" alt=""><span>' + esc(c.exp.rotulo) + '</span></button><button data-id="' + K.id + '"><img src="' + K.t + '?v=' + K.v + '" alt=""><span>Key visual · ' + KVN[kv] + '</span></button></div></div>';
  }

  // ── grade: a entrada. Curadoria por KV e capítulo; a peça abre numa ficha ao lado
  const cartao = it => '<button class="cartao" data-id="' + it.id + '"><img src="' + it.t + '?v=' + it.v + '" alt="" loading="lazy" width="' + it.w + '" height="' + it.h + '"><span class="leg"><b>' + esc(it.codigo) + '</b>' + esc(it.titulo) + '</span></button>';
  function grade() {
    const livre = filtro.kv === 'todos' && filtro.cap === 'todos' && !filtro.pecas && !filtro.q; let h = '';
    const en = (kv, id, dado, tit, txt) => porId[id] ? '<button class="en ' + kv + '" data-id="' + id + '"><img src="' + porId[id].g + '?v=' + porId[id].v + '" alt="" width="' + porId[id].w + '" height="' + porId[id].h + '"><span><small class="dado">' + dado + '</small><b>' + tit + '</b><em>' + txt + '</em><u>Abrir o key visual →</u></span></button>' : '';
    if (livre) h += '<div class="entrada">' + en('jc', 'jc-peca-kv', 'Conceito do ano · 2027', 'O jogo<br>continua.', 'A placa do quarto árbitro: sete plaquetas, as apagadas à vista. O número é sempre um fato.') + en('aa', 'aa-kv-poster', 'Campanha 1 · jan–abr 2027', 'Arquivo<br>aberto', 'O arquivo guardou a camisa. Não guardou quem vestiu.') + '</div>';
    for (const kv of ['jc', 'aa']) {
      const its = visiveis.filter(i => i.kv === kv);
      if (its.length) {
        h += '<section class="terr ' + kv + '"><header class="terr-cab"><h2>' + KVN[kv] + '</h2><span class="dado">' + its.length + (its.length > 1 ? ' itens' : ' item') + '</span></header>';
        M.caps.forEach((cap, n) => { const g = its.filter(i => i.cap === cap); if (g.length) h += '<div class="cap-cab"><b><i>' + String(n).padStart(2, '0') + '</i>' + CAPN[cap] + '</b><span>' + g.length + '</span></div><div class="cartoes">' + g.map(cartao).join('') + '</div>'; });
        h += '</section>';
      }
      if (kv === 'jc' && livre) h += '<button class="une" data-canvas="comum"><span class="dado">O que une</span><b>Dois KVs, um contrato.</b><span>Grade, tipo, assinatura, logo, formatos e base de cor · ver no canvas →</span></button>';
    }
    if (!visiveis.length) h = '<p class="nada">Nada aqui com esse filtro. <button data-limpa>Limpar filtros</button></p>';
    const L = $('#lista'); L.innerHTML = h; L.scrollTop = 0;
  }
  const fichaEl = $('#ficha'); let fichaAberta = false;
  function desenhaFicha() {
    const it = visiveis[idx]; if (!it) return fechaFicha(); fichaAberta = true; fichaEl.hidden = false; fichaEl.className = 'ficha ' + it.kv;
    const viz = visiveis.filter(x => x.kv === it.kv && x.cap === it.cap && x !== it); const i0 = Math.max(0, Math.min(viz.length - 9, viz.findIndex(x => visiveis.indexOf(x) > idx) - 4));
    fichaEl.innerHTML = '<header><span class="cod">' + esc(it.codigo) + '</span><span class="dado">' + (idx + 1) + ' / ' + visiveis.length + '</span><button data-ficha-x aria-label="Fechar a ficha">✕</button></header><div class="fi-corpo">' +
      '<button class="fi-img" data-amplia aria-label="Ampliar"><img src="' + it.g + '?v=' + it.v + '" alt="' + esc(it.codigo + ' · ' + it.titulo) + '"></button><h3>' + esc(it.titulo) + '</h3>' +
      '<dl><dt>Key visual</dt><dd>' + KVN[it.kv] + '</dd><dt>Capítulo</dt><dd>' + CAPN[it.cap] + '</dd><dt>Tipo</dt><dd>' + TIPO[it.tipo] + '</dd><dt>Tamanho</dt><dd>' + it.w + ' × ' + it.h + ' px</dd>' + (it.credito ? '<dt>Foto</dt><dd>' + (it.link ? '<a href="' + esc(it.link) + '" target="_blank" rel="noopener">' + esc(it.credito) + '</a>' : esc(it.credito)) + '</dd>' : '') + '</dl>' +
      '<div class="navega"><button data-passo="-1"' + (idx === 0 ? ' disabled' : '') + '>← Anterior</button><button class="amp" data-amplia>Ampliar</button><button data-passo="1"' + (idx === visiveis.length - 1 ? ' disabled' : '') + '>Próxima →</button></div>' +
      (viz.length ? '<h4>No mesmo capítulo · ' + (viz.length + 1) + '</h4><div class="vizinhas">' + viz.slice(i0, i0 + 9).map(x => '<button data-id="' + x.id + '" title="' + esc(x.codigo + ' · ' + x.titulo) + '"><img src="' + x.t + '?v=' + x.v + '" alt="" loading="lazy"></button>').join('') + '</div>' : '') + '</div>';
    for (const c of $$('.cartao.sel')) c.classList.remove('sel'); const c = $('#lista [data-id="' + it.id + '"].cartao'); if (c) c.classList.add('sel');
  }
  function ficha(id) { let i = visiveis.findIndex(x => x.id === id); if (i < 0 && porId[id]) { limpa(); i = visiveis.findIndex(x => x.id === id); } if (i < 0) return; idx = i; desenhaFicha(); }
  function fechaFicha() { fichaAberta = false; fichaEl.hidden = true; if (vista === 'refs') foca(null); for (const c of $$('.cartao.sel')) c.classList.remove('sel'); }
  fichaEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if ('fichaX' in b.dataset) fechaFicha(); else if ('amplia' in b.dataset) abre(visiveis[idx].id); else if (b.dataset.passo) passo(+b.dataset.passo); else if (b.dataset.id) ficha(b.dataset.id); });
  function setVista(v2, alvo) {
    vista = v2; document.body.classList.toggle('grade', v2 === 'grade'); document.body.classList.toggle('refs', v2 === 'refs'); fechaFicha(); for (const o of $('[data-filtro=vista]').children) { o.classList.toggle('on', o.dataset.v === v2); o.setAttribute('aria-pressed', o.dataset.v === v2); }
    larg = 0; alt = 0; if (v2 !== 'grade') requestAnimationFrame(() => { tocou = false; ajusta(); if (alvo && pos[alvo]) enquadra(pos[alvo], 'largura', false); });
  }
  $('#lista').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.id) ficha(b.dataset.id); else if (b.dataset.canvas) setVista('canvas', b.dataset.canvas); else if ('limpa' in b.dataset) limpa(); });
  function limpa() { filtro.kv = 'todos'; filtro.cap = 'todos'; filtro.pecas = false; filtro.q = ''; $('#busca').value = ''; for (const g of $$('.filtros .grupo')) { const f = g.dataset.filtro; if (f === 'vista') continue; for (const o of g.children) o.classList.toggle('on', f !== 'pecas' && o.dataset.v === 'todos'); } fechaFicha(); leiaute(); }
  $('#busca').addEventListener('input', e => { filtro.q = norm(e.target.value.trim()); fechaFicha(); leiaute(); if (vista === 'canvas') inicio(); });

  // ── vista: arrastar, zoom, enquadrar ───────────────────────────────────────
  const v = { x: 0, y: 0, k: 0.2 }; let anim = 0, lodT = 0, idx = 0, rt = 0, tocou = false, larg = 0, alt = 0;
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
    if (vista === 'grade') return;
    const pw = palco.clientWidth, ph = palco.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const it of visiveis) { if (it.alta) continue; const sx = it.x * v.k + v.x, sy = it.y * v.k + v.y, sw = it.W * v.k; if (sw * dpr > 800 && sx < pw && sx + sw > 0 && sy < ph && sy + it.H * v.k > 0) { it.alta = 1; const g = new Image(); g.onload = () => { it.img.src = g.src; }; g.src = it.g + '?v=' + it.v; } }
  }
  function zoomEm(px, py, f) { const k = lim(v.k * f, 0.03, 4); f = k / v.k; v.x = px - (px - v.x) * f; v.y = py - (py - v.y) * f; v.k = k; aplica(); }
  function vai(alvo, suave) {
    cancelAnimationFrame(anim); const de = { ...v }, t0 = performance.now(), dur = suave === false || matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
    const passo = t => { const p = dur ? lim((t - t0) / dur, 0, 1) : 1, e = 1 - Math.pow(1 - p, 3); v.x = de.x + (alvo.x - de.x) * e; v.y = de.y + (alvo.y - de.y) * e; v.k = de.k + (alvo.k - de.k) * e; aplica(); if (p < 1) anim = requestAnimationFrame(passo); }; passo(t0);
  }
  function enquadra(r, modo, suave) { // modo 'tudo' = cabe inteiro; 'largura' = cabe na largura, alinhado ao alto
    const pw = palco.clientWidth, ph = palco.clientHeight, mg = pw < 760 ? 12 : 36; if (!pw || !ph) return;
    const k = modo === 'tudo' ? Math.min((pw - 2 * mg) / r.w, (ph - 2 * mg) / r.h) : (pw - 2 * mg) / r.w;
    vai({ k, x: (pw - r.w * k) / 2 - r.x * k, y: modo === 'tudo' ? (ph - r.h * k) / 2 - (r.y || 0) * k : mg - (r.y || 0) * k }, suave);
  }
  const tudo = () => ({ x: 0, y: 0, w: Wm, h: Hm });
  function inicio(suave) { const estreito = palco.clientWidth < 760; if (vista === 'refs') { const a2 = R.kvs && R.kvs.jc, b2 = R.kvs && R.kvs.aa; if (!a2) return enquadra(tudo(), 'tudo', suave); const pw = palco.clientWidth, ph = palco.clientHeight; if (estreito) return enquadra({ x: a2.x - 40, y: a2.y - 60, w: b2.x + b2.w - a2.x + 80, h: a2.h + 240 }, 'tudo', suave); if (pw / ph < 1.25) return enquadra({ x: 1000, y: a2.y - 260, w: R.W - 2000, h: a2.h + 560 }, 'tudo', suave); return enquadra(tudo(), 'tudo', suave); } if (filtro.kv !== 'todos' && pos[filtro.kv]) enquadra(pos[filtro.kv], 'largura', suave); else if (pos.jc && filtro.cap === 'todos' && !filtro.pecas) enquadra(pos.jc, 'largura', suave); else enquadra(tudo(), estreito ? 'largura' : 'tudo', suave); }

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
  palco.addEventListener('click', e => { if (mexeu) return; const b = e.target.closest('.item'); if (b) return ficha(b.dataset.id); if (vista !== 'refs') return; const n = e.target.closest('.no'); if (!n) { fechaFicha(); return foca(null); } if (n.dataset.id) ficha(n.dataset.id); else if (n.dataset.r) fichaRef(n.dataset.c, +n.dataset.r); if (n.dataset.c) foca(n.dataset.c); else foca(null); });
  palco.addEventListener('dragstart', e => e.preventDefault());

  $('.zoom').addEventListener('click', e => { const z = e.target.dataset.z; if (!z) return; const pw = palco.clientWidth / 2, ph = palco.clientHeight / 2; if (z === '+') zoomEm(pw, ph, 1.4); else if (z === '-') zoomEm(pw, ph, 1 / 1.4); else if (z === '1') zoomEm(pw, ph, 1 / v.k); else enquadra(tudo(), 'tudo'); });
  const pula = k => { if (vista !== 'canvas') return setVista('canvas', k); if (pos[k]) enquadra(pos[k], 'largura'); };
  $('.atalhos').addEventListener('click', e => { const b = e.target.closest('button'); if (b) pula(b.dataset.vai); });
  { const mini = $('#mini'), mm = $('#mini-mundo'); let pega = false; const leva = e => { const r = mm.getBoundingClientRect(), wx = lim((e.clientX - r.left) / r.width, 0, 1) * Wm, wy = lim((e.clientY - r.top) / r.height, 0, 1) * Hm; v.x = palco.clientWidth / 2 - wx * v.k; v.y = palco.clientHeight / 2 - wy * v.k; aplica(); };
    mini.addEventListener('pointerdown', e => { pega = true; mini.setPointerCapture(e.pointerId); cancelAnimationFrame(anim); leva(e); }); mini.addEventListener('pointermove', e => { if (pega) leva(e); }); mini.addEventListener('pointerup', () => { pega = false; }); mini.addEventListener('pointercancel', () => { pega = false; }); }

  // filtros
  $('.filtros').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return; const g = c.parentElement, f = g.dataset.filtro;
    if (f === 'vista') { setVista(c.dataset.v); return; }
    if (vista === 'refs') setVista('grade');
    if (f === 'pecas') { filtro.pecas = !filtro.pecas; c.classList.toggle('on', filtro.pecas); }
    else { filtro[f] = c.dataset.v; for (const o of g.children) o.classList.toggle('on', o === c); }
    for (const o of $$('.chip')) o.setAttribute('aria-pressed', o.classList.contains('on'));
    fechaFicha(); leiaute(); if (vista === 'canvas') inicio();
  });

  // ── tela cheia ─────────────────────────────────────────────────────────────
  const cheia = $('#cheia');
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
  function fechaCheia() { cheia.hidden = true; history.replaceState(null, '', location.pathname + location.search); if (fichaAberta) desenhaFicha(); }
  function passo(d) { const n = idx + d; if (n >= 0 && n < visiveis.length) { idx = n; if (!cheia.hidden) mostra(); else if (fichaAberta) desenhaFicha(); } }
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
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { if (e.key === 'Escape') document.activeElement.blur(); return; }
    if (e.key === '/') { e.preventDefault(); $('#busca').focus(); return; }
    if (fichaAberta) { if (e.key === 'Escape') return fechaFicha(); if (e.key === 'ArrowRight') return passo(1); if (e.key === 'ArrowLeft') return passo(-1); if (e.key === 'Enter') return abre(visiveis[idx].id); }
    if (vista !== 'canvas') return;
    const pw = palco.clientWidth / 2, ph = palco.clientHeight / 2, d = 120;
    if (e.key === 'ArrowLeft') { v.x += d; aplica(); } else if (e.key === 'ArrowRight') { v.x -= d; aplica(); } else if (e.key === 'ArrowUp') { v.y += d; aplica(); } else if (e.key === 'ArrowDown') { v.y -= d; aplica(); }
    else if (e.key === '+' || e.key === '=') zoomEm(pw, ph, 1.4); else if (e.key === '-') zoomEm(pw, ph, 1 / 1.4); else if (e.key === '0') enquadra(tudo(), 'tudo'); else if (e.key === '1') pula('jc'); else if (e.key === '2') pula('comum'); else if (e.key === '3') pula('aa');
  });
  larg = palco.clientWidth;
  palco.addEventListener('pointerdown', () => { tocou = true; }); palco.addEventListener('wheel', () => { tocou = true; }, { passive: true });
  alt = palco.clientHeight;
  const ajusta = () => { const w = palco.clientWidth, h = palco.clientHeight; if (!w || !h || (w === larg && h === alt)) return; const era = larg; larg = w; alt = h; leiaute(); if (!era || !tocou) inicio(false); };
  new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(ajusta, 60); }).observe(palco);
  window.addEventListener('resize', ajusta); document.addEventListener('visibilitychange', ajusta); window.addEventListener('pageshow', ajusta);
  { let n = 0; const t = setInterval(() => { ajusta(); if (++n > 60) clearInterval(t); }, 250); }

  // partida
  montaRede(); larg = 0; alt = 0; leiaute(); inicio(false); ajusta(); setTimeout(() => mundo.classList.add('vivo'), 900);
  setTimeout(() => $('#dica').classList.add('some'), 7000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { leiaute(); if (!tocou) inicio(false); });
  Placa.iniciar(M);
  const rota = () => { const h = location.hash.slice(1); if (h === 'placa' || h === 'creditos') folha(h); else if (h === 'canvas' || h === 'grade' || h === 'refs') setVista(h); else if (h.startsWith('i=')) { const id = decodeURIComponent(h.slice(2)); ficha(id); abre(id); } };
  rota(); window.addEventListener('hashchange', rota);
  window.DA = { M, v, filtro, leiaute, visiveis: () => visiveis, pos };
})();
