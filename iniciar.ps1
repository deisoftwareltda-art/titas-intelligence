$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeFolder = Join-Path $projectPath ".tools\node-v24.18.1-win-x64"
$npmPath = Join-Path $nodeFolder "npm.cmd"

if (-not (Test-Path -LiteralPath $npmPath)) {
  Write-Error "Node.js portátil não encontrado. Instale Node.js 20+ e execute npm install."
  exit 1
}

$env:Path = "$nodeFolder;$env:Path"
Set-Location -LiteralPath $projectPath

# O cache de desenvolvimento é descartável. Limpá-lo antes da inicialização
# evita manifestos apontando para arquivos CSS antigos ou inexistentes.
$devCache = Join-Path $projectPath ".next-dev"
if (Test-Path -LiteralPath $devCache -PathType Container) {
  $resolvedCache = (Resolve-Path -LiteralPath $devCache).Path
  if ($resolvedCache -eq (Join-Path $projectPath ".next-dev")) {
    Remove-Item -LiteralPath $resolvedCache -Recurse -Force
  }
}

& $npmPath run dev -- --hostname 0.0.0.0
