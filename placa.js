// Umbro 2027 · O Jogo Continua · a placa no navegador.
// Geometria do numeral de 7 plaquetas portada de v4/jc/lib.js (J.hex, J.segs, J.seg, J.segW), com o mesmo desalinho por plaqueta.
(function () {
  const P = window.Placa = {};
  P.C = { tinta: '#111111', papel: '#EFEBE1', branco: '#FFFFFF', placa: '#FF4A1C', v1795: '#D22630', a122: '#FED141', g2257: '#00A651', royal: '#0033A0', apagado: '#222222', apagadoClaro: '#DDD8CC' };
  P.FMT = { poster: [1200, 1600, 'Pôster 3:4'], abrigo: [1200, 1800, 'Abrigo 2:3'], metro: [2400, 1200, 'Metrô 2:1'], story: [1080, 1920, 'Story 9:16'], feed: [1080, 1350, 'Feed 4:5'] };
  P.CORES = [['placa', 'Laranja de placa'], ['v1795', 'Vermelho 1795'], ['a122', 'Amarelo 122'], ['g2257', 'Verde 2257']];
  P.MODOS = [['placa', 'Plaqueta'], ['reta', 'Plaqueta alinhada'], ['led', 'Ponto de luz']];
  const FONTE = { tit: '"Roboto Condensed"', txt: '"Inter Tight"', dad: '"JetBrains Mono"' };

  // ── numeral ────────────────────────────────────────────────────────────────
  P.MAP = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', ' ': '', '-': 'g' };
  P.hex = (cx, cy, L, t, vert) => { const a = L / 2, b = t / 2; const p = [[-a, 0], [-a + b, -b], [a - b, -b], [a, 0], [a - b, b], [-a + b, b]]; return p.map(([x, y]) => vert ? [cx + y, cy + x] : [cx + x, cy + y]); };
  P.segs = (w, h, t, g) => { const xL = t / 2, xR = w - t / 2, yT = t / 2, yM = h / 2, yB = h - t / 2, lh = (xR - xL) - 2 * g, lv = (yM - yT) - 2 * g; return { a: P.hex(w / 2, yT, lh, t), g: P.hex(w / 2, yM, lh, t), d: P.hex(w / 2, yB, lh, t), f: P.hex(xL, (yT + yM) / 2, lv, t, 1), b: P.hex(xR, (yT + yM) / 2, lv, t, 1), e: P.hex(xL, (yM + yB) / 2, lv, t, 1), c: P.hex(xR, (yM + yB) / 2, lv, t, 1) }; };
  P.inPoly = (p, x, y) => { let n = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; if ((a[1] > y) !== (b[1] > y)) { const xi = a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]); if (xi > x) n++; } } return n % 2 === 1; };
  // o: {mode:'placa'|'led', ghost, jit, wr (largura/altura), tr (espessura/largura), sp (espaço/altura), plus}
  P.seg = (str, H, o = {}) => {
    const wr = o.wr ?? 0.56, w = H * wr, t = w * (o.tr ?? 0.26), g = w * (o.gr ?? 0.022), sp = H * (o.sp ?? 0.09), mode = o.mode || 'placa';
    const S = P.segs(w, H, t, g); const on = [], off = []; let ox = 0;
    let seed = 7; for (const ch of String(str)) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296 - 0.5; }; const jit = o.jit || 0;
    const put = (poly, lit) => { let Q = poly.map(([px, py]) => [px + ox, py]); if (jit) { const mx = Q.reduce((a, p) => a + p[0], 0) / Q.length, my = Q.reduce((a, p) => a + p[1], 0) / Q.length, an = rnd() * 0.07 * jit, dx = rnd() * H * 0.012 * jit, dy = rnd() * H * 0.012 * jit, c = Math.cos(an), sn = Math.sin(an); Q = Q.map(([px, py]) => [mx + (px - mx) * c - (py - my) * sn + dx, my + (px - mx) * sn + (py - my) * c + dy]); } (lit ? on : off).push(Q); };
    for (const ch of String(str)) {
      if (ch === '+') { const a = w * (o.plus ?? 0.40), b = t / 2, cx = w / 2, cy = H / 2; put([[-a, 0], [-a + b, -b], [-b, -b], [-b, -a + b], [0, -a], [b, -a + b], [b, -b], [a - b, -b], [a, 0], [a - b, b], [b, b], [b, a - b], [0, a], [-b, a - b], [-b, b], [-a + b, b]].map(([px, py]) => [cx + px, cy + py]), true); }
      else { const m = P.MAP[ch] ?? ''; for (const k of 'abcdefg') { if (m.includes(k)) put(S[k], true); else if (o.ghost !== false) put(S[k], false); } }
      ox += w + sp;
    }
    const W = ox - sp; const path = polys => polys.map(Q => 'M' + Q.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z').join('');
    const dots = polys => { const pitch = t / 3, r = pitch * 0.36; let s = ''; for (const Q of polys) { const xs = Q.map(p => p[0]), ys = Q.map(p => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); const nx = Math.max(1, Math.round((x1 - x0) / pitch)), ny = Math.max(1, Math.round((y1 - y0) / pitch)); for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const cx = x0 + (i + .5) * (x1 - x0) / nx, cy = y0 + (j + .5) * (y1 - y0) / ny; if (P.inPoly(Q, cx, cy)) s += 'M' + (cx - r).toFixed(2) + ' ' + cy.toFixed(2) + 'a' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 1 0 ' + (2 * r).toFixed(2) + ' 0a' + r.toFixed(2) + ' ' + r.toFixed(2) + ' 0 1 0 ' + (-2 * r).toFixed(2) + ' 0Z'; } } return s; };
    const d = mode === 'led' ? dots : path;
    return { W, H, on: d(on), off: d(off) };
  };
  // largura em unidades de altura, e a folga óptica do "+" (o braço não encosta na borda da célula)
  P.medida = (str, o = {}) => { const wr = o.wr ?? 0.56, sp = o.sp ?? 0.09, plus = o.plus ?? 0.40, n = String(str).length; const folga = (0.5 - plus) * wr; return { u: n * wr + (n - 1) * sp, ini: str[0] === '+' ? folga : 0, fim: n > 1 && str[n - 1] === '+' ? folga : 0 }; };

  // ── peça: grade do contrato ────────────────────────────────────────────────
  const medidor = document.createElement('canvas').getContext('2d');
  const largura = (s, fonte) => { medidor.font = fonte; return medidor.measureText(s).width; };

  P.compor = s => {
    const [W, H] = P.FMT[s.fmt]; const m = 0.05 * Math.min(W, H), fh = 0.09 * H;
    const foto = s.foto || null, claro = !foto && s.fundo === 'papel', metro = s.fmt === 'metro';
    const bg = claro ? P.C.papel : P.C.tinta, fg = claro ? P.C.tinta : P.C.branco, ac = P.C[s.cor] || P.C.placa;
    const L = { W, H, m, fh, bg, txt: [] };
    // título: uma vez, embaixo, à esquerda
    let ts, linhas, tx, tTop;
    if (foto) { ts = (metro ? 0.05 : 0.098) * W; linhas = ['O JOGO CONTINUA.']; tx = m; }
    else if (metro) { ts = 0.066 * W; linhas = ['O JOGO', 'CONTINUA.']; tx = 0.655 * W; }
    else { ts = (s.fmt === 'story' ? 0.13 : 0.118) * W; linhas = ['O JOGO', 'CONTINUA.']; tx = m; }
    const lh = 0.86 * ts, cap = 0.711 * ts;
    tTop = (!foto && metro) ? 0.52 * H : H - fh - m * 0.35 - lh * linhas.length;
    linhas.forEach((str, i) => L.txt.push({ s: str, x: tx, y: tTop + lh * i + lh / 2 + cap / 2, size: ts, fam: FONTE.tit, wt: 900, fill: fg, ls: -0.01 }));
    // foto em limiar: ocupa o alto; a faixa de tinta segura o título
    if (foto) { L.yb = tTop - m * 0.45; L.foto = foto; }
    // dado: campanha à esquerda, data ou lugar à direita
    const ds = Math.max(11, 0.0175 * W);
    if (!foto) {
      if (s.dl) L.txt.push({ s: s.dl.toUpperCase(), x: m, y: m + ds * 0.78, size: ds, fam: FONTE.dad, wt: 400, fill: fg, ls: 0.04 });
      if (s.dr) L.txt.push({ s: s.dr.toUpperCase(), x: W - m, y: m + ds * 0.78, size: ds, fam: FONTE.dad, wt: 400, fill: fg, ls: 0.04, anchor: 'end' });
    }
    // número: de margem a margem, limitado pela altura livre
    const num = s.num || '0', md = P.medida(num), tinta = md.u - md.ini - md.fim;
    let ny, aw, ah;
    if (foto) { ny = (s.fmt === 'story' ? 0.1 : 0.07) * H; aw = W - 2 * m; ah = L.yb - ny - m * 0.8; }
    else if (metro) { ny = 0.155 * H; aw = 0.655 * W - 2.2 * m; ah = Math.min(0.6 * H, H - fh - m * 0.6 - ny); }
    else { ny = ({ poster: 0.15, abrigo: 0.17, story: 0.2, feed: 0.15 })[s.fmt] * H; aw = W - 2 * m; ah = tTop - ny - m * 0.8; }
    const nh = Math.min(aw / tinta, ah), nw = nh * tinta;
    let nx = m - md.ini * nh;
    if (s.fmt === 'story' && nw < aw * 0.98) nx = (W - nw) / 2 - md.ini * nh;
    const g = P.seg(num, nh, { jit: s.modo === 'placa' ? 1 : 0, mode: s.modo === 'led' ? 'led' : 'placa', ghost: !foto });
    L.num = { x: nx, y: ny, h: nh, w: nw, on: g.on, off: g.off, cOn: foto ? (foto.noite ? P.C.branco : ac) : ac, cOff: claro ? P.C.apagadoClaro : P.C.apagado };
    // rodapé: fio, a linha que diz o fato, logo à direita
    L.fio = { x: m, y: H - fh, w: W - 2 * m, h: Math.max(1.5, W / 800), fill: fg };
    const lgH = fh * 0.52, lgW = lgH * 511 / 332;
    L.logo = { x: W - m - lgW, y: H - fh / 2 - lgH / 2 + L.fio.h, w: lgW, h: lgH, fill: fg };
    if (s.cap) { let cs = Math.max(0.024 * W, 12); const max = W - 2 * m - lgW - m, lw = largura(s.cap, '500 ' + cs + 'px ' + FONTE.txt); if (lw > max) cs *= max / lw; L.txt.push({ s: s.cap, x: m, y: H - fh / 2 + cs * 0.36 + L.fio.h, size: cs, fam: FONTE.txt, wt: 500, fill: fg, ls: 0 }); }
    L.tex = !claro && s.tex !== false;
    return L;
  };

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f2 = n => (+n).toFixed(2);
  P.svg = L => {
    const { W, H } = L; let o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Peça montada">';
    o += '<rect width="' + W + '" height="' + H + '" fill="' + L.bg + '"/>';
    if (L.foto) o += '<svg x="0" y="0" width="' + W + '" height="' + f2(L.yb) + '" viewBox="0 0 ' + L.foto.w + ' ' + L.foto.h + '" preserveAspectRatio="xMidYMax slice"><image href="' + L.foto.url + '" width="' + L.foto.w + '" height="' + L.foto.h + '"/></svg>';
    o += '<g transform="translate(' + f2(L.num.x) + ' ' + f2(L.num.y) + ')">' + (L.num.off ? '<path d="' + L.num.off + '" fill="' + L.num.cOff + '"/>' : '') + '<path d="' + L.num.on + '" fill="' + L.num.cOn + '"/></g>';
    for (const t of L.txt) o += '<text x="' + f2(t.x) + '" y="' + f2(t.y) + '" font-family=\'' + t.fam + ', sans-serif\' font-weight="' + t.wt + '" font-size="' + f2(t.size) + '" letter-spacing="' + f2(t.ls * t.size) + '" fill="' + t.fill + '"' + (t.anchor ? ' text-anchor="' + t.anchor + '"' : '') + '>' + esc(t.s) + '</text>';
    if (L.tex && P.tx) o += '<image href="img/tx-a.webp" width="' + W + '" height="' + H + '" preserveAspectRatio="xMidYMid slice" opacity="0.29" style="mix-blend-mode:screen"/>';
    o += '<rect x="' + f2(L.fio.x) + '" y="' + f2(L.fio.y) + '" width="' + f2(L.fio.w) + '" height="' + f2(L.fio.h) + '" fill="' + L.fio.fill + '"/>';
    if (P.logo) o += '<svg x="' + f2(L.logo.x) + '" y="' + f2(L.logo.y) + '" width="' + f2(L.logo.w) + '" height="' + f2(L.logo.h) + '" viewBox="366 489 511 332" fill="' + L.logo.fill + '">' + P.logo.map(d => '<path d="' + d + '"/>').join('') + '</svg>';
    return o + '</svg>';
  };
  const cobre = (iw, ih, w, h, base) => { const k = Math.max(w / iw, h / ih), sw = w / k, sh = h / k; return [(iw - sw) / 2, base ? ih - sh : (ih - sh) / 2, sw, sh]; };
  P.canvas = L => {
    const { W, H } = L, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = L.bg; x.fillRect(0, 0, W, H);
    if (L.foto) { const [sx, sy, sw, sh] = cobre(L.foto.w, L.foto.h, W, L.yb, true); x.drawImage(L.foto.img, sx, sy, sw, sh, 0, 0, W, L.yb); }
    x.save(); x.translate(L.num.x, L.num.y); if (L.num.off) { x.fillStyle = L.num.cOff; x.fill(new Path2D(L.num.off)); } x.fillStyle = L.num.cOn; x.fill(new Path2D(L.num.on)); x.restore();
    for (const t of L.txt) { x.font = t.wt + ' ' + t.size + 'px ' + t.fam + ', sans-serif'; if ('letterSpacing' in x) x.letterSpacing = (t.ls * t.size) + 'px'; x.textAlign = t.anchor === 'end' ? 'right' : 'left'; x.textBaseline = 'alphabetic'; x.fillStyle = t.fill; x.fillText(t.s, t.x, t.y); }
    if (L.tex && P.tx) { const [sx, sy, sw, sh] = cobre(P.tx.naturalWidth, P.tx.naturalHeight, W, H); x.save(); x.globalAlpha = 0.29; x.globalCompositeOperation = 'screen'; x.drawImage(P.tx, sx, sy, sw, sh, 0, 0, W, H); x.restore(); }
    x.fillStyle = L.fio.fill; x.fillRect(L.fio.x, L.fio.y, L.fio.w, L.fio.h);
    if (P.logo) { x.save(); x.translate(L.logo.x, L.logo.y); x.scale(L.logo.w / 511, L.logo.h / 332); x.translate(-366, -489); x.fillStyle = L.logo.fill; for (const d of P.logo) x.fill(new Path2D(d)); x.restore(); }
    return c;
  };

  // limiar em duas tintas: o escuro vira tinta; o aceso vira a cor da placa (noite) ou papel (dia)
  const tintos = {};
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  P.tingir = (img, luz) => {
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height), p = d.data, a = rgb(P.C.tinta), b = rgb(luz);
    for (let i = 0; i < p.length; i += 4) { let t = (Math.max(p[i], p[i + 1], p[i + 2]) / 255 - 0.07) / 0.86; t = t < 0 ? 0 : t > 1 ? 1 : t; p[i] = a[0] + (b[0] - a[0]) * t; p[i + 1] = a[1] + (b[1] - a[1]) * t; p[i + 2] = a[2] + (b[2] - a[2]) * t; }
    x.putImageData(d, 0, 0); return c;
  };
  const carrega = src => new Promise((ok, erro) => { const i = new Image(); i.onload = () => ok(i); i.onerror = erro; i.src = src; });

  // ── interface ──────────────────────────────────────────────────────────────
  P.iniciar = async M => {
    const $ = id => document.getElementById(id);
    const st = P.estado = { num: '+27', cap: $('pl-cap').value, dl: $('pl-dl').value, dr: $('pl-dr').value, fmt: 'poster', cor: 'placa', modo: 'placa', fundo: 'tinta' };
    const fundos = [{ id: 'tinta', nome: 'Tinta', cor: P.C.tinta }, { id: 'papel', nome: 'Papel', cor: P.C.papel }].concat(M.fundos || []);
    const ops = (el, lista, chave, pinta) => { el.innerHTML = lista.map(([v, nome]) => '<button type="button" class="op" data-v="' + v + '">' + (pinta ? '<i style="background:' + P.C[v] + '"></i>' : '') + nome + '</button>').join(''); el.addEventListener('click', e => { const b = e.target.closest('.op'); if (!b) return; st[chave] = b.dataset.v; marca(); desenha(); }); };
    ops($('pl-fmt'), Object.entries(P.FMT).map(([k, v]) => [k, v[2]]), 'fmt');
    ops($('pl-cor'), P.CORES, 'cor', true);
    ops($('pl-modo'), P.MODOS, 'modo');
    $('pl-fundo').innerHTML = fundos.map(f => '<button type="button" class="fd" data-v="' + f.id + '" title="' + f.nome + (f.credito ? ' · ' + f.credito : '') + '" style="' + (f.cor ? 'background:' + f.cor : 'background-image:url(img/t/jc-limiar-' + f.id + '.webp)') + '"><span>' + f.nome + '</span></button>').join('');
    $('pl-fundo').addEventListener('click', e => { const b = e.target.closest('.fd'); if (!b) return; st.fundo = b.dataset.v; marca(); desenha(); });
    const marca = () => { for (const [el, k] of [['pl-fmt', 'fmt'], ['pl-cor', 'cor'], ['pl-modo', 'modo'], ['pl-fundo', 'fundo']]) for (const b of $(el).children) { b.classList.toggle('on', b.dataset.v === st[k]); b.setAttribute('aria-pressed', b.dataset.v === st[k]); } const f = fundos.find(f => f.id === st.fundo); $('pl-dl').disabled = $('pl-dr').disabled = !!(f && f.src); };
    const limpa = v => { v = v.replace(/[^0-9+]/g, ''); const ini = v[0] === '+', d = v.replace(/\+/g, '').slice(0, 3), fim = !ini && d && v[v.length - 1] === '+'; return (ini ? '+' : '') + d + (fim ? '+' : ''); };
    $('pl-num').addEventListener('input', e => { const v = limpa(e.target.value); if (v !== e.target.value) e.target.value = v; st.num = v; desenha(); });
    for (const [id, k] of [['pl-cap', 'cap'], ['pl-dl', 'dl'], ['pl-dr', 'dr']]) $(id).addEventListener('input', e => { st[k] = e.target.value; desenha(); });
    $('pl-form').addEventListener('submit', e => e.preventDefault());

    let vez = 0;
    const foto = async () => {
      const f = fundos.find(f => f.id === st.fundo); if (!f || !f.src) return null;
      const luz = f.noite ? P.C[st.cor] : P.C.papel, k = f.id + luz;
      if (!tintos[k]) { f.img = f.img || await carrega(f.src); const c = P.tingir(f.img, luz); tintos[k] = { img: c, url: c.toDataURL('image/jpeg', 0.9), w: c.width, h: c.height, noite: f.noite, credito: f.credito }; }
      return tintos[k];
    };
    const desenha = P.desenha = async () => {
      const n = ++vez, ft = await foto(); if (n !== vez) return;
      const L = P.ultimo = P.compor(Object.assign({}, st, { num: st.num || '0', foto: ft }));
      $('pl-peca').innerHTML = P.svg(L);
      $('pl-nota').textContent = L.W + ' × ' + L.H + ' px · margem ' + Math.round(L.m) + ' px (5% do lado menor) · rodapé ' + Math.round(L.fh) + ' px (9% da altura)' + (ft ? ' · com foto, o dado sai e as apagadas somem · foto: ' + ft.credito : '') + '.';
    };
    $('pl-baixar').addEventListener('click', async () => {
      const b = $('pl-baixar'); b.disabled = true; b.textContent = 'Gerando…';
      try {
        await Promise.all(['900 80px ' + FONTE.tit, '500 30px ' + FONTE.txt, '400 20px ' + FONTE.dad].map(f => document.fonts.load(f)));
        await desenha(); const c = P.canvas(P.ultimo);
        const blob = await new Promise(ok => c.toBlob(ok, 'image/png'));
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'umbro-o-jogo-continua-' + (st.num || '0').replace('+', 'mais') + '-' + st.fmt + '.png';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        P.baixou = { w: c.width, h: c.height, bytes: blob.size, nome: a.download };
      } finally { b.disabled = false; b.textContent = 'Baixar PNG'; }
    });
    marca();
    try { P.logo = [...(await (await fetch('img/logo-performance.svg')).text()).matchAll(/ d="([^"]+)"/g)].map(m => m[1]); } catch (e) { P.logo = null; }
    try { P.tx = await carrega('img/tx-a.webp'); } catch (e) { P.tx = null; }
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await desenha();
  };
})();
