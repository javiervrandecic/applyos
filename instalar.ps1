<#
.SYNOPSIS
  Instala las skills de applyOS para Claude Code.

.DESCRIPTION
  Copia las carpetas de .claude/skills a tu carpeta de usuario (~/.claude/skills)
  o a la de un proyecto (<proyecto>/.claude/skills). No sobrescribe nada sin avisar:
  si una skill ya existe, la salta, salvo que uses -Forzar, que la respalda antes.

.EXAMPLE
  .\instalar.ps1                          # pregunta dónde instalar
  .\instalar.ps1 -Destino usuario
  .\instalar.ps1 -Destino proyecto -Proyecto C:\ruta\a\mi-busqueda
  .\instalar.ps1 -Destino usuario -ConComando   # además instala el comando /empleos
#>
param(
  [ValidateSet('usuario', 'proyecto', '')][string]$Destino = '',
  [string]$Proyecto = '',
  [switch]$Forzar,
  [switch]$ConComando
)

$ErrorActionPreference = 'Stop'
$raiz = $PSScriptRoot
$origen = Join-Path $raiz '.claude\skills'
if (-not (Test-Path $origen)) { throw "No encuentro $origen. Corre el script desde la carpeta del repo." }

if (-not $Destino) {
  $r = Read-Host 'Dónde instalo? [1] mi usuario (todas mis carpetas)  [2] un proyecto'
  $Destino = if ($r -eq '2') { 'proyecto' } else { 'usuario' }
}

if ($Destino -eq 'usuario') {
  $base = Join-Path $HOME '.claude'
} else {
  if (-not $Proyecto) { $Proyecto = Read-Host 'Ruta de la carpeta del proyecto' }
  if (-not (Test-Path $Proyecto)) { throw "No existe la carpeta $Proyecto" }
  $base = Join-Path (Resolve-Path $Proyecto) '.claude'
}
$destSkills = Join-Path $base 'skills'
New-Item -ItemType Directory -Force $destSkills | Out-Null

$sello = Get-Date -Format 'yyyyMMdd-HHmmss'
foreach ($skill in Get-ChildItem $origen -Directory) {
  $dest = Join-Path $destSkills $skill.Name
  if (Test-Path $dest) {
    if (-not $Forzar) {
      Write-Host "SALTADA  $($skill.Name) ya existe en $destSkills. Usa -Forzar para reemplazarla (se respalda antes)."
      continue
    }
    $resp = "$dest.respaldo-$sello"
    Move-Item $dest $resp
    Write-Host "RESPALDO $($skill.Name) -> $resp"
  }
  Copy-Item $skill.FullName $dest -Recurse
  Write-Host "OK       $($skill.Name) -> $dest"
}

if ($ConComando) {
  $cmdDir = Join-Path $base 'commands'
  New-Item -ItemType Directory -Force $cmdDir | Out-Null
  $cmd = Join-Path $cmdDir 'empleos.md'
  if ((Test-Path $cmd) -and -not $Forzar) {
    Write-Host 'SALTADO  el comando empleos.md ya existe. Usa -Forzar para reemplazarlo.'
  } else {
    Copy-Item (Join-Path $raiz 'skill\empleos.md') $cmd -Force
    Write-Host "OK       comando /empleos -> $cmd"
  }
}

# Config local, fuera del repo. No se pisa si existe.
$cfgDir = Join-Path $HOME '.applyos'
$cfg = Join-Path $cfgDir 'config.json'
if (-not (Test-Path $cfg)) {
  New-Item -ItemType Directory -Force $cfgDir | Out-Null
  Copy-Item (Join-Path $raiz 'config.ejemplo.json') $cfg
  Write-Host "OK       config de ejemplo en $cfg. Edítala con tus rutas."
} else {
  Write-Host "SALTADO  $cfg ya existe, no se toca."
}

Write-Host "`nListo. Abre Claude Code y di, por ejemplo: 'haz un barrido de empleos'."
Write-Host 'Para diarizar entrevistas define ASSEMBLYAI_API_KEY como variable de entorno (docs\DIARIZAR-ENTREVISTAS.md).'
