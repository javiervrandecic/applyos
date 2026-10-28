# Instalar las skills de applyOS

Las skills son carpetas que Claude Code lee y activa solas. Aquí está cómo instalarlas, configurarlas y probarlas.

## Qué necesitas

- [Claude Code](https://claude.com/claude-code).
- Node.js 22 o superior (18 alcanza para diarizar).
- Opcional: Chrome o Edge para el PDF, y una cuenta de AssemblyAI para diarizar.

## Instalación automática

Desde la carpeta del repo.

```powershell
.\instalar.ps1                                   # te pregunta dónde
.\instalar.ps1 -Destino usuario                  # ~/.claude/skills, valen en todas tus carpetas
.\instalar.ps1 -Destino proyecto -Proyecto C:\ruta\a\mi-busqueda
.\instalar.ps1 -Destino usuario -ConComando      # además instala el comando /empleos
```

```bash
./instalar.sh                                    # ~/.claude/skills
./instalar.sh proyecto /ruta/a/mi-busqueda
FORZAR=1 ./instalar.sh                           # reemplaza, respaldando antes
CON_COMANDO=1 ./instalar.sh
```

Reglas del instalador.

- Si una skill ya existe en el destino, **la salta y te lo dice**. No pisa nada.
- Con `-Forzar` (o `FORZAR=1`) mueve la existente a `<nombre>.respaldo-<fecha>` y copia la nueva. Mueve el respaldo fuera de `skills/` cuando ya no lo necesites, porque Claude podría leerlo como otra skill.
- Si no existe `~/.applyos/config.json`, deja uno de ejemplo. Si existe, no lo toca.

## Instalación manual

Copia las carpetas de `.claude/skills/` a `~/.claude/skills/` (usuario) o a `<proyecto>/.claude/skills/` (proyecto). Copia `config.ejemplo.json` a `~/.applyos/config.json`.

## Configurar tus rutas

`~/.applyos/config.json` le dice a las skills dónde están tus archivos. Vive fuera del repo.

```json
{
  "carpeta_busqueda": "~/busqueda-empleo",
  "perfil": "perfil.md",
  "tracker": "tracker.md",
  "cv_maestro": "cv/cv-maestro.html",
  "carpeta_entrevistas": "entrevistas",
  "carpeta_grabaciones": "~/grabaciones-entrevistas"
}
```

Las rutas relativas se entienden desde `carpeta_busqueda`. Si no hay config, las skills usan la carpeta actual y te preguntan dónde están tus archivos. Las plantillas para crearlos están en `.claude/skills/applyos-busqueda/assets/` (perfil, portales, tracker) y `applyos-postulacion/assets/` (CV maestro).

La clave de AssemblyAI **no va en este archivo**. Va en la variable de entorno `ASSEMBLYAI_API_KEY` (ver [`DIARIZAR-ENTREVISTAS.md`](DIARIZAR-ENTREVISTAS.md)).

## Probar que funciona

1. Abre Claude Code en tu carpeta de búsqueda y escribe `/skills` o pregunta "¿qué skills de applyos tienes?". Deben aparecer las cuatro.
2. Prueba los scripts sin cuenta ni red. Esto calcula métricas sobre una entrevista sintética incluida.
   ```bash
   node .claude/skills/applyos-entrevista/scripts/metricas.js .claude/skills/applyos-entrevista/scripts/ejemplo/entrevista-sintetica.diarizado.json --candidato B
   ```
3. Dile a Claude: "haz un barrido de empleos con mi perfil".

## Comando o skill

`skill/empleos.md` es el comando de barra original. Las skills hacen lo mismo y más, y se activan por su descripción. Detalle en la sección correspondiente del [README](../README.md).

## Actualizar

Haz `git pull` en el repo y vuelve a correr el instalador con `-Forzar`. Si editaste una skill instalada, tus cambios quedan en el respaldo.

## Para quien modifica el repo

Los scripts y documentos originales viven en la raíz y las skills llevan copias. Después de editar un original, corre `node herramientas/sincronizar-skills.js`. `--verificar` falla si hay diferencias.

## Problemas comunes

| Síntoma | Causa y arreglo |
|---|---|
| Claude no activa la skill | Revisa que la carpeta tenga `SKILL.md` directo (`skills/applyos-busqueda/SKILL.md`). Reinicia Claude Code |
| "no se puede ejecutar scripts" en PowerShell | `powershell -ExecutionPolicy Bypass -File instalar.ps1` |
| El instalador salta todo | Ya estaban instaladas. Usa `-Forzar` si quieres reemplazarlas |
| `diarizar.js` dice que falta la clave | Define `ASSEMBLYAI_API_KEY` y abre una terminal nueva |
