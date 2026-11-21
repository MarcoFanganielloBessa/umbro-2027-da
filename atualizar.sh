#!/bin/bash
# Regenera manifest e imagens a partir de ../jc e ../aa e publica no GitHub Pages.
set -euo pipefail
cd "$(dirname "$0")"
URL=https://marcofanganiellobessa.github.io/umbro-2027-da
python3 gerar.py
node --check app.js && node --check placa.js
git add -A
if git diff --cached --quiet; then echo "nada mudou"; exit 0; fi
git commit -qm "Atualiza telas e peças ($(date '+%d/%m %H:%M'))"
git push -q origin main
alvo=$(python3 -c "import json;print(json.load(open('manifest.json'))['gerado'])")
echo "enviado; esperando o Pages servir a versão de $alvo"
for i in $(seq 1 40); do
  if curl -fsS "$URL/manifest.json?t=$RANDOM$i" 2>/dev/null | grep -q "$alvo"; then echo "no ar: $URL/"; exit 0; fi
  sleep 6
done
echo "publicado, mas o Pages ainda não serviu a versão nova: $URL/"; exit 1
