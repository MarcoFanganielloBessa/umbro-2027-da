# Umbro 2027 · Direção de Arte (ferramenta)

Ferramenta de Direção de Arte dos dois key visuals da Umbro Brasil 2027, O Jogo Continua e Arquivo Aberto. Trabalho acadêmico (ESPM, Plano de Marketing).

- **Referências** (tela principal): canvas infinito com os dois KVs no centro e, em volta, referência → o que ensinou → experimento ou tela → KV, ligados por linhas. Clicar destaca o caminho e abre a ficha com imagem, crédito e link da fonte.
- **Grade** (`#grade`): peças por KV e capítulo, com filtros, busca e ficha ao lado.
- **Livros** (`#canvas`): canvas das telas dos dois livros por capítulo, com o contrato comum no meio.
- **Monte a placa** (`#placa`): numeral de 7 plaquetas em SVG, com download em PNG. **Créditos** (`#creditos`).

No ar: https://marcofanganiellobessa.github.io/umbro-2027-da/

## Atualizar

```bash
./atualizar.sh
```

Roda `gerar.py` (varre `../jc/export`, `../aa/export` e `../jc/img/fx2`, converte para WebP em dois tamanhos, escreve `manifest.json`), faz commit, envia e espera o GitHub Pages servir a versão nova. Só reconverte o que mudou e apaga o que sumiu.

- Título, capítulo e código saem do nome do arquivo e do dump do Figma. Para corrigir um item à mão, crie `ajustes.json`: `{"jc-tela-05": {"titulo": "…", "cap": "sistema"}}` ou `{"…": {"fora": true}}`.
- O que fica fora, e por quê, está na lista `FORA` do `gerar.py`. As fotos 289 e 308 só entram em limiar.
- Precisa de `python3`, `cwebp`, `node`, `git` e `gh` autenticado.

## Rede de referências (`rede.json`)

Cada cadeia tem `refs` (imagem própria com `img`, `credito` e `link`; texto com `texto`; ou um item do manifest com `item`), `licao` (uma linha) e `exp` (item do manifest e rótulo). Edite à mão e rode `./atualizar.sh`.

**A revisar pelo Marco:** os textos de `licao` vêm de `v4/jc/sistema.js` (telas de repertório), `v3/repertorio/REPERTORIO.md` e dos `decisoes.md`; já a ligação de cada referência com um experimento ou tela foi inferida na montagem (por exemplo LaLiga → "A placa", FIFA Go Epic → "Voz", Are.na de numeral → "Grade e hierarquia", código de produto → "S5 tipografia"). Os dois links do Commons de Samson Ssemakadde (placa manual e gesto) foram atribuídos pelo título do arquivo.

Direito de imagem: bloco do Are.na e imagem sem licença aberta entram em miniatura de 360 px, com crédito e link; foto CC entra com crédito e link.

## Arquivos

`index.html`, `style.css`, `app.js` (canvas, filtros, tela cheia), `placa.js` (geometria portada de `v4/jc/lib.js` e montador), `gerar.py`, `atualizar.sh`, `rede.json`, `manifest.json`, `img/`.

Tipos na web (licença aberta, SIL OFL): Roboto Condensed Black, Inter Tight e JetBrains Mono, no lugar de Helvetica Neue Condensed Black, Neue Haas Grotesk e TX-02.
