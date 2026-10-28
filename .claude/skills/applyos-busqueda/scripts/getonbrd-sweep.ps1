# Barrido de la API publica de Get on Board (PowerShell 5.1+)
# Equivalente a getonbrd-sweep.js, para Windows sin Node.
# Uso:  .\scripts\getonbrd-sweep.ps1
#       .\scripts\getonbrd-sweep.ps1 -Terminos @('n8n','AI engineer')

param(
  [string[]]$Terminos = @(
    'inteligencia artificial','automatizacion','automatizador','agentes IA','n8n',
    'AI engineer','AI automation','AI agent','automation engineer','LLM engineer',
    'AI Specialist','Forward Deployed Engineer','transformacion digital','AI Solutions Lead'
  ),
  [int]$PerPage = 30,
  [int]$MaxPaginas = 5
)

$vistos = @{}
$avisos = @()

foreach ($t in $Terminos) {
  Write-Host "buscando `"$t`"..." -ForegroundColor DarkGray
  for ($pagina = 1; $pagina -le $MaxPaginas; $pagina++) {
    $url = 'https://www.getonbrd.com/api/v0/search/jobs?query=' +
           [uri]::EscapeDataString($t) + "&per_page=$PerPage&page=$pagina"
    try {
      $r = Invoke-RestMethod -Uri $url -Headers @{'User-Agent'='embudo/1.0'} -TimeoutSec 20
    } catch {
      Write-Host "  fallo pagina $pagina : $($_.Exception.Message)" -ForegroundColor DarkYellow
      break
    }

    $lote = @($r.data)
    foreach ($j in $lote) {
      if (-not $vistos.ContainsKey($j.id)) {
        $vistos[$j.id] = $true
        $a = $j.attributes
        $fecha = if ($a.published_at) {
          ([datetimeoffset]::FromUnixTimeSeconds($a.published_at)).ToString('yyyy-MM-dd')
        } else { '' }
        $avisos += [pscustomobject]@{
          Fecha    = $fecha
          Titulo   = $a.title
          Categoria= $a.category_name
          Remoto   = $a.remote
          Min      = $a.min_salary
          Max      = $a.max_salary
          Url      = $j.links.public_url
        }
      }
    }

    # Si vino menos que el tope, era la ultima pagina.
    if ($lote.Count -lt $PerPage) { break }
  }
}

Write-Host ""
Write-Host "$($avisos.Count) avisos unicos, $($Terminos.Count) terminos" -ForegroundColor Cyan
Write-Host ""
$avisos | Sort-Object Fecha -Descending | ForEach-Object {
  $salario = if ($_.Min) { "USD $($_.Min)-$($_.Max)" } else { 'sin publicar' }
  $donde   = if ($_.Remoto) { 'remoto' } else { 'presencial' }
  Write-Host "$($_.Fecha)  $($_.Titulo)"
  Write-Host "            $($_.Categoria) - $donde - $salario" -ForegroundColor DarkGray
  Write-Host "            $($_.Url)" -ForegroundColor DarkGray
  Write-Host ""
}
