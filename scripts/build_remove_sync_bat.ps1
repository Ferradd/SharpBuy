# Build single-file REMOVE_STEAM_SYNC.bat on Desktop
$ps1Path = Join-Path $PSScriptRoot 'remove_steam_sync.ps1'
if (-not (Test-Path $ps1Path)) { throw "Missing $ps1Path" }

$ps1 = Get-Content -Raw -Path $ps1Path -Encoding UTF8
$ps1 = ($ps1 -replace '(?m)^\s*#.*$', '' -replace '(?m)^\s*$', '').Trim()

$psExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'

$stub = @"
@echo off
setlocal
set "BAT=%~f0"
set "PS1=%TEMP%\RemoveSteamSync_run.ps1"
set "SHARPBUY_ROOT=%~dp0.."
set "LOG=%SHARPBUY_ROOT%\logs\REMOVE_SYNC_LAST.txt"

> "%LOG%" echo [%date% %time%] STARTED...
"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -WindowStyle Hidden -Command "`$b=`$env:BAT;`$dst=`$env:PS1;`$raw=[IO.File]::ReadAllText(`$b);`$m='::SB_REMOVE_PAYLOAD::';`$i=`$raw.LastIndexOf(`$m);if(`$i -lt 0){exit 1};[IO.File]::WriteAllText(`$dst,`$raw.Substring(`$i+`$m.Length).Trim(),(New-Object Text.UTF8Encoding `$false))"
if errorlevel 1 (
  >> "%LOG%" echo FAIL: could not read remove script from bat
  start "" notepad "%LOG%"
  exit /b 1
)

"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "%PS1%"
del "%PS1%" 2>nul
start "" notepad "%LOG%"
exit /b
::SB_REMOVE_PAYLOAD::
"@

$content = $stub + $ps1 + "`r`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$outPaths = @(
    (Join-Path (Split-Path $PSScriptRoot -Parent) 'desktop-tools\REMOVE_STEAM_SYNC.bat')
    (Join-Path $PSScriptRoot 'REMOVE_STEAM_SYNC.bat')
)

foreach ($out in $outPaths) {
    [IO.File]::WriteAllText($out, $content, $utf8NoBom)
    Write-Host ("OK: {0} ({1} bytes)" -f $out, (Get-Item $out).Length)
}
