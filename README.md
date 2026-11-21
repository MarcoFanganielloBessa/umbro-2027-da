# Umbro 2027 · Direção de Arte (ferramenta)

Canvas infinito dos dois key visuals da Umbro Brasil 2027, O Jogo Continua e Arquivo Aberto, com o contrato que os une, tela cheia, filtros, créditos e o módulo "Monte a placa" (numeral de 7 plaquetas em SVG, com download em PNG). Trabalho acadêmico (ESPM, Plano de Marketing).

No ar: https://marcofanganiellobessa.github.io/umbro-2027-da/

## Atualizar

```bash
./atualizar.sh
```

Roda `gerar.py` (varre `../jc/export`, `../aa/export` e `../jc/img/fx2`, converte para WebP em dois tamanhos, escreve `manifest.json`), faz commit, envia e espera o GitHub Pages servir a versão nova. Só reconverte o que mudou e apaga o que sumiu.

- Título, capítulo e código saem do nome do arquivo e do dump do Figma. Para corrigir um item à mão, crie `ajustes.json`: `{"jc-tela-05": {"titulo": "…", "cap": "sistema"}}` ou `{"…": {"fora": true}}`.
- O que fica fora, e por quê, está na lista `FORA` do `gerar.py`. As fotos 289 e 308 só entram em limiar.
- Precisa de `python3`, `cwebp`, `node`, `git` e `gh` autenticado.

## Arquivos

`index.html`, `style.css`, `app.js` (canvas, filtros, tela cheia), `placa.js` (geometria portada de `v4/jc/lib.js` e montador), `gerar.py`, `atualizar.sh`, `manifest.json`, `img/`.

Tipos na web (licença aberta, SIL OFL): Roboto Condensed Black, Inter Tight e JetBrains Mono, no lugar de Helvetica Neue Condensed Black, Neue Haas Grotesk e TX-02.
