#!/bin/sh
# Instala las skills de applyOS para Claude Code (macOS, Linux, Git Bash).
#
# Uso
#   ./instalar.sh                         instala en ~/.claude/skills
#   ./instalar.sh proyecto /ruta/proyecto instala en <proyecto>/.claude/skills
#   FORZAR=1 ./instalar.sh                reemplaza las que existan (se respaldan antes)
#   CON_COMANDO=1 ./instalar.sh           instala además el comando /empleos
#
# No sobrescribe nada sin avisar.

set -e
RAIZ=$(cd "$(dirname "$0")" && pwd)
ORIGEN="$RAIZ/.claude/skills"
[ -d "$ORIGEN" ] || { echo "No encuentro $ORIGEN. Corre el script desde la carpeta del repo."; exit 1; }

if [ "$1" = "proyecto" ]; then
  [ -n "$2" ] && [ -d "$2" ] || { echo "Indica una carpeta de proyecto que exista."; exit 1; }
  BASE="$2/.claude"
else
  BASE="$HOME/.claude"
fi
DEST="$BASE/skills"
mkdir -p "$DEST"
SELLO=$(date +%Y%m%d-%H%M%S)

for dir in "$ORIGEN"/*/; do
  nombre=$(basename "$dir")
  destino="$DEST/$nombre"
  if [ -e "$destino" ]; then
    if [ -z "$FORZAR" ]; then
      echo "SALTADA  $nombre ya existe en $DEST. Usa FORZAR=1 para reemplazarla (se respalda antes)."
      continue
    fi
    mv "$destino" "$destino.respaldo-$SELLO"
    echo "RESPALDO $nombre -> $destino.respaldo-$SELLO"
  fi
  cp -R "$dir" "$destino"
  echo "OK       $nombre -> $destino"
done

if [ -n "$CON_COMANDO" ]; then
  mkdir -p "$BASE/commands"
  if [ -e "$BASE/commands/empleos.md" ] && [ -z "$FORZAR" ]; then
    echo "SALTADO  el comando empleos.md ya existe. Usa FORZAR=1 para reemplazarlo."
  else
    cp "$RAIZ/skill/empleos.md" "$BASE/commands/empleos.md"
    echo "OK       comando /empleos -> $BASE/commands/empleos.md"
  fi
fi

if [ ! -f "$HOME/.applyos/config.json" ]; then
  mkdir -p "$HOME/.applyos"
  cp "$RAIZ/config.ejemplo.json" "$HOME/.applyos/config.json"
  echo "OK       config de ejemplo en ~/.applyos/config.json. Edítala con tus rutas."
else
  echo "SALTADO  ~/.applyos/config.json ya existe, no se toca."
fi

echo
echo "Listo. Abre Claude Code y di, por ejemplo: 'haz un barrido de empleos'."
echo "Para diarizar entrevistas define ASSEMBLYAI_API_KEY como variable de entorno (docs/DIARIZAR-ENTREVISTAS.md)."
