#!/usr/bin/env python3
"""Varre os exports dos dois KVs, converte para WebP (miniatura e grande) e escreve manifest.json.

Roda de novo sem trabalho manual: só reconverte o que mudou e apaga o que sumiu.
Uso: python3 gerar.py            (lê ../jc e ../aa, escreve ./img e ./manifest.json)
Ajustes manuais opcionais em ajustes.json: {"jc-tela-05": {"titulo": "...", "cap": "sistema", "fora": true}}
"""
import json, os, re, struct, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

AQUI = Path(__file__).resolve().parent
V4 = AQUI.parent
JC, AA = V4 / 'jc', V4 / 'aa'
IMG = AQUI / 'img'
MINI, GRANDE = 640, 2000          # lado maior, em px
PRANCHA = 3400                    # pranchas de exploração: lado maior da versão grande

CAPS = ['abertura', 'repertorio', 'exploracao', 'sistema', 'kv', 'aplicacoes']

# Fora da ferramenta, com o motivo. Arquivos que começam com "_" e os "rev-" são rascunho e também ficam fora.
FORA = {
    'fotos2.jpg': 'mostra as fotos 289 e 308 diretas, em scan e em duotom; elas só entram em limiar',
    'fotos-novas-diretas-e-limiar.jpg': 'mostra as fotos 289 e 308 diretas',
    'fotos-novas-scan-e-outros.jpg': 'mostra as fotos 289 e 308 em scan e duotom',
    'kv-com-foto-E84-E88.jpg': 'repete as peças kvfoto-E84 a E88',
    'tela-07b.jpg': 'tela de exploração com as fotos 289 e 308 diretas',
    'tela-07c.jpg': 'tela de exploração com as fotos 289 e 308 em scan e duotom',
    'capa-geral.jpg': 'capa do PDF único, não é tela de nenhum dos dois livros',
}
SO_LIMIAR = {'289', '308'}        # seleção feminina do Afeganistão: nunca direta

ACENTO = {'divisoria': 'divisória', 'repertorio': 'repertório', 'exploracao': 'exploração', 'titulo': 'título',
          'reticula': 'retícula', 'fusao': 'fusão', 'creditos': 'créditos', 'tres': 'três', 'aa2': 'AA2', 'aa3': 'AA3',
          'kv': 'KV', 'are': 'Are', 'na': 'na', 'metro': 'metrô', 'poster': 'pôster', 'voz': 'voz', 'onibus': 'ônibus', 'serie': 'série', 'sumula': 'súmula', 'ep1': 'ep. 1', 'ep2': 'ep. 2', 'ep3': 'ep. 3', 'ep4': 'ep. 4'}
FOTO_NOME = {'533': 'trave à noite', '186': 'neblina', '153': 'clarão', '155': 'campo aceso', '119': 'chão de luz',
             '110': 'pelada na praça', '289': 'campo de terra', '308': 'comemoração', '391': 'horizonte', '499': 'futsal'}
FMT_NOME = {'poster': 'Pôster 3:4', 'abrigo': 'Abrigo de ônibus 2:3', 'metro': 'Painel de metrô 2:1', 'story': 'Story 9:16',
            'feed': 'Feed 4:5', 'carrossel': 'Carrossel'}


def tamanho_jpg(p):
    with open(p, 'rb') as f:
        f.read(2)
        while True:
            b = f.read(4)
            if len(b) < 4:
                raise ValueError('jpg sem dimensão: %s' % p)
            m, n = struct.unpack('>HH', b)
            if 0xFFC0 <= m <= 0xFFCF and m not in (0xFFC4, 0xFFC8, 0xFFCC):
                f.read(1)
                h, w = struct.unpack('>HH', f.read(4))
                return w, h
            f.seek(n - 2, 1)


def frase(slug):
    ws = [ACENTO.get(w, w) for w in slug.split('-') if w]
    s = ' '.join(ws).replace('Are na', 'Are.na')
    return s[:1].upper() + s[1:]


def dump_nomes(p):
    """Nomes dos quadros do Figma: {'05': 'Exploração', 'E84': 'KV com foto · ...', 'KV': 'pôster · key visual'}"""
    out = {}
    if not p.exists():
        return out

    def anda(o):
        if isinstance(o, dict):
            n = o.get('name') or o.get('nome')
            if isinstance(n, str) and ' · ' in n:
                k, resto = n.split(' · ', 1)
                if re.fullmatch(r'\d\d[a-z]?|E\d+|[A-Z]{2}\d?(-[A-Z])?', k):
                    out.setdefault(k, resto.split(' · lint-ok')[0])
            for v in o.values():
                anda(v)
        elif isinstance(o, list):
            for v in o:
                anda(v)
    try:
        anda(json.load(open(p)))
    except Exception as e:
        print('aviso: dump ilegível', p.name, e)
    return out


def cap_jc(titulo):
    t = titulo.lower()
    if t.startswith(('capa', 'ideia')): return 'abertura'
    if t.startswith('repert'): return 'repertorio'
    if t.startswith('explora'): return 'exploracao'
    if t.startswith('key visual'): return 'kv'
    if t.startswith(('formatos', 'série', 'serie', 'fecho', 'aplica')): return 'aplicacoes'
    return 'sistema'


def itens_jc():
    ex = JC / 'export'
    nomes = dump_nomes(ex / 'dump-v4-O-Jogo-Continua.json')
    out = []
    telas = sorted(ex.glob('tela-*.jpg'))
    if (ex / 'ordem-pdf.txt').exists():   # ordem de apresentação, quando a sessão do KV a escreve
        ordem = [l.strip() for l in open(ex / 'ordem-pdf.txt') if l.strip()]
        telas.sort(key=lambda p: (ordem.index(p.name) if p.name in ordem else 999, p.name))
    for p in telas:
        n = p.stem.split('-')[1]
        tit = nomes.get(n, 'Exploração')
        out.append(dict(id='jc-tela-' + n, kv='jc', cap=cap_jc(tit), tipo='tela', codigo='JC ' + n, titulo=tit, src=p))
    p = ex / 'exploracao.jpg'
    if p.exists():
        out.append(dict(id='jc-exploracao', kv='jc', cap='exploracao', tipo='prancha', codigo='E01–E43',
                        titulo='Prancha de exploração: forma, fato, cor, composição, foto, textura', src=p))
    for p in sorted(ex.glob('kvfoto-*.jpg')):
        c = p.stem.split('-')[1]
        out.append(dict(id='jc-' + p.stem, kv='jc', cap='exploracao', tipo='peca', codigo=c, titulo=nomes.get(c, 'KV com foto'), src=p))
    cred = {}
    try:
        for c in json.load(open(JC / 'foto2' / 'creditos.json')):
            cred[Path(c['local']).stem] = c
    except Exception:
        pass
    fundos = []
    for p in sorted((JC / 'img' / 'fx2').glob('[0-9][0-9][0-9]-limiar*.jpg')):
        num, trat = p.stem.split('-', 1)
        c = cred.get(num, {})
        credito = '%s · %s · CC %s' % (c.get('autor', '?'), c.get('fonte', ''), c.get('licenca', '')) if c else ''
        credito = credito.replace('CC CC', 'CC')
        it = dict(id='jc-limiar-' + num, kv='jc', cap='exploracao', tipo='foto', codigo='F' + num,
                  titulo='Limiar em duas tintas · ' + FOTO_NOME.get(num, num), src=p, credito=credito, link=c.get('pagina', ''))
        out.append(it)
        fundos.append(dict(id=num, nome=FOTO_NOME.get(num, num), noite=trat.endswith('luz'), item=it['id'], credito=credito))
    ordem = {'kv': 0, 'kv-b': 1, 'ab': 2, 'mt': 3, 'st': 4, 'fd': 5}
    for p in sorted(ex.glob('peca-*.jpg'), key=lambda p: (ordem.get(p.stem[5:], 9), p.stem)):
        c = p.stem[5:].upper()
        tit = nomes.get(c, 'peça')
        out.append(dict(id='jc-' + p.stem, kv='jc', cap='kv' if c.startswith('KV') else 'aplicacoes', tipo='peca', codigo=c,
                        titulo=tit[:1].upper() + tit[1:], src=p))
    return out, fundos


def itens_aa():
    ex = AA / 'export'
    out = []
    for p in sorted(ex.glob('livro-*.jpg')):
        m = re.match(r'livro-(\d+)-([a-z]?\d+[a-z]?)-(.+)', p.stem)
        if not m:
            continue
        n, cod, slug = m.groups()
        letra = cod[0] if cod[0].isalpha() else ''
        if not letra:
            cap = 'abertura' if 'capa' in slug else 'repertorio' if 'repert' in slug else 'exploracao' if 'explora' in slug else 'sistema'
        elif letra == 'k':
            cap = 'kv' if re.fullmatch(r'k[01]b?', cod) else 'aplicacoes'
        else:
            cap = {'r': 'repertorio', 'e': 'exploracao', 's': 'sistema', 'n': 'aplicacoes'}.get(letra, 'sistema')
        divis = 'divisoria' in slug or not letra
        out.append(dict(id='aa-livro-' + n, kv='aa', cap=cap, tipo='tela', codigo='AA ' + n if divis else cod.upper(),
                        titulo=frase(slug), src=p))
    for p in sorted(ex.glob('contraprova-*.jpg')):
        out.append(dict(id='aa-' + p.stem, kv='aa', cap='kv', tipo='peca', codigo='CP', titulo='Contraprova · ' + frase(p.stem[12:]), src=p))
    ordem = ['poster', 'abrigo', 'metro', 'story', 'feed', 'carrossel']
    pecas = [p for pat in ('kv-*.jpg', 'peca-*.jpg') for p in ex.glob(pat)]

    def chave(p):
        nome = p.stem.split('-', 1)[1]
        for i, k in enumerate(ordem):
            if nome.startswith(k):
                return (i, nome)
        return (9, nome)
    for p in sorted(pecas, key=chave):
        nome = re.sub(r'-\d+x\d+$', '', p.stem.split('-', 1)[1])
        base = nome.split('-')[0]
        tit = FMT_NOME.get(base, frase(nome)) + (' ' + nome.split('-')[1] if base == 'carrossel' and '-' in nome else '')
        out.append(dict(id='aa-' + p.stem.split('-')[0] + '-' + nome, kv='aa', cap='kv' if base == 'poster' else 'aplicacoes',
                        tipo='peca', codigo='KV' if base == 'poster' else base[:2].upper() if base in FMT_NOME else nome.replace('-', ' ').upper()[:12], titulo=tit, src=p))
    return out


def converter(src, dst, lado, q):
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        return False
    w, h = tamanho_jpg(src)
    arg = ['cwebp', '-quiet', '-q', str(q), '-m', '5', '-mt']
    if max(w, h) > lado:
        arg += ['-resize', str(lado), '0'] if w >= h else ['-resize', '0', str(lado)]
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(arg + [str(src), '-o', str(dst)], check=True)
    return True


def creditos():
    grupos = []

    def le(p):
        try:
            return json.load(open(p))
        except Exception:
            return []
    usados = set(FOTO_NOME)
    g1 = [dict(titulo=c['titulo'], autor=c['autor'], licenca=c['licenca'], pagina=c['pagina']) for c in le(JC / 'foto' / 'creditos.json')]
    g2 = []
    for c in le(JC / 'foto2' / 'creditos.json'):
        num = Path(c['local']).stem
        if num not in usados:
            continue
        lic = c['licenca'] if c['licenca'].startswith('CC') else 'CC ' + c['licenca']
        nota = 'só em limiar' if num in SO_LIMIAR else ''
        g2.append(dict(titulo=c['titulo'], autor=c['autor'], licenca=lic, pagina=c['pagina'], uso=FOTO_NOME[num], nota=nota))
    g3 = [dict(titulo=c['titulo'], autor=c['autor'], licenca=c['licenca'], pagina=c['pagina']) for c in le(V4.parent / 'v3' / 'arquivo' / 'creditos.json')]
    if g2: grupos.append(dict(nome='O Jogo Continua · fotos em limiar (Flickr via Openverse)', itens=g2))
    if g1: grupos.append(dict(nome='O Jogo Continua · repertório e gesto (Wikimedia Commons)', itens=g1))
    if g3: grupos.append(dict(nome='Arquivo Aberto · acervo (Wikimedia Commons, domínio público e CC0)', itens=g3))
    return grupos


def main():
    t0 = time.time()
    jc, fundos = itens_jc()
    itens = jc + itens_aa()
    ajustes = {}
    if (AQUI / 'ajustes.json').exists():
        ajustes = json.load(open(AQUI / 'ajustes.json'))
    itens = [dict(i, **{k: v for k, v in ajustes.get(i['id'], {}).items() if k != 'fora'}) for i in itens
             if not ajustes.get(i['id'], {}).get('fora') and i['src'].name not in FORA and not i['src'].name.startswith('_')]
    for i in itens:
        num = i['src'].stem.split('-')[0]
        assert not (num in SO_LIMIAR and 'limiar' not in i['src'].stem), 'foto %s fora de limiar: %s' % (num, i['src'])
    tarefas, vivos = [], set()
    for i in itens:
        src = i.pop('src')
        w, h = tamanho_jpg(src)
        grande = PRANCHA if i['tipo'] == 'prancha' else GRANDE
        mini = 1100 if i['tipo'] == 'prancha' else MINI
        i.update(w=w, h=h, t='img/t/%s.webp' % i['id'], g='img/g/%s.webp' % i['id'], v=int(src.stat().st_mtime))
        tarefas += [(src, AQUI / i['t'], mini, 70), (src, AQUI / i['g'], grande, 80 if i['tipo'] != 'prancha' else 74)]
        vivos |= {i['t'], i['g']}
    # texturas e fundos do "Monte a placa"
    for f in fundos:
        f['src'] = 'img/g/jc-limiar-%s.webp' % f['id']
    tx = JC / 'img' / 'tx-a.jpg'
    if tx.exists():
        tarefas.append((tx, IMG / 'tx-a.webp', 1400, 60))
        vivos.add('img/tx-a.webp')
    with ThreadPoolExecutor(6) as ex:
        feitos = sum(ex.map(lambda a: converter(*a), tarefas))
    apagados = 0
    for p in IMG.rglob('*.webp'):
        if p.parent.name == 'r':
            continue
        if str(p.relative_to(AQUI)) not in vivos:
            p.unlink(); apagados += 1
    # rede de referências (rede.json): converte as imagens próprias e confere os itens citados
    rede = None
    if (AQUI / 'rede.json').exists():
        rede = json.load(open(AQUI / 'rede.json'))
        ids = {i['id'] for i in itens}
        for lado in rede['lados'].values():
            assert lado['kv'] in ids, 'rede: KV fora do manifest: ' + lado['kv']
            lado['cadeias'] = [c for c in lado['cadeias'] if c['exp']['item'] in ids and all(r.get('item', None) in ids or 'id' in r for r in c['refs'])]
            for c in lado['cadeias']:
                for r in c['refs']:
                    if r.get('img'):
                        src = V4 / r['img']
                        assert src.stem.split('-')[0] not in SO_LIMIAR
                        dst = 'img/r/%s.webp' % r['id']
                        converter(src, AQUI / dst, 900 if 'CC' in r.get('credito', '') else 360, 76)
                        w, h = tamanho_jpg(src)
                        r.update(src=dst, w=w, h=h); del r['img']; vivos.add(dst)
        for p in (IMG / 'r').glob('*.webp') if (IMG / 'r').exists() else []:
            if str(p.relative_to(AQUI)) not in vivos: p.unlink()
    cred = creditos()
    if rede:
        vistos, extra = set(), []
        for lado in rede['lados'].values():
            for c in lado['cadeias']:
                for r in c['refs']:
                    if r.get('id') and r['id'] not in vistos:
                        vistos.add(r['id']); p = r['credito'].split(' · ')
                        extra.append(dict(titulo=r['titulo'], autor=p[0], licenca=p[-1] if 'CC' in p[-1] or 'domínio' in p[-1] else 'referência, com link', pagina=r.get('link', '')))
        cred.insert(0, dict(nome='Canvas de referências · fontes de cada referência', itens=extra))
    man = dict(gerado=time.strftime('%d/%m/%Y %H:%M'), caps=CAPS, itens=itens, fundos=fundos, creditos=cred, rede=rede,
               fora=[dict(arquivo=k, motivo=v) for k, v in FORA.items()])
    json.dump(man, open(AQUI / 'manifest.json', 'w'), ensure_ascii=False, indent=1)
    total = sum(p.stat().st_size for p in IMG.rglob('*.webp')) / 1e6
    por = {}
    for i in itens:
        por[(i['kv'], i['cap'])] = por.get((i['kv'], i['cap']), 0) + 1
    print('%d itens · %d imagens convertidas · %d apagadas · %.1f MB em img/ · %.0fs' % (len(itens), feitos, apagados, total, time.time() - t0))
    for kv in ('jc', 'aa'):
        print(' ', kv, ' '.join('%s=%d' % (c, por.get((kv, c), 0)) for c in CAPS))
    if total > 25:
        print('AVISO: passou de 25 MB'); sys.exit(1)


if __name__ == '__main__':
    main()
