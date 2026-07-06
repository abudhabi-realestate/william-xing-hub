param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputDir,
  [int]$Width = 1600,
  [int]$Height = 900
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $InputPath)) {
  throw "PPT file not found: $InputPath"
}

$InputPath = (Resolve-Path $InputPath).Path
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Get-ChildItem $OutputDir -Filter 'slide-*.png' -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem $OutputDir -Filter 'Slide*.PNG' -ErrorAction SilentlyContinue | Remove-Item -Force

$ppt = $null
$pres = $null

try {
  $ppt = New-Object -ComObject PowerPoint.Application
  $ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse
  $pres = $ppt.Presentations.Open($InputPath, $true, $true, $false)
  $pres.Export($OutputDir, 'PNG', $Width, $Height)
}
finally {
  if ($pres) { $pres.Close() | Out-Null }
  if ($ppt) {
    $ppt.Quit() | Out-Null
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

$exported = @(
  Get-ChildItem $OutputDir -Filter 'Slide*.PNG' |
    Sort-Object { [int]($_.BaseName -replace 'Slide', '') }
)

if ($exported.Count -eq 0) {
  throw "No slides exported from $InputPath"
}

$i = 1
foreach ($file in $exported) {
  $dest = Join-Path $OutputDir ('slide-{0:D2}.png' -f $i)
  Move-Item $file.FullName $dest -Force
  $i++
}

Write-Output $exported.Count
