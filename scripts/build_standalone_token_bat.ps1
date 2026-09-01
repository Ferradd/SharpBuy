# Build single-file EXTRACT_STEAM_TOKEN.bat (payload appended after marker)
$ps1Path = Join-Path $PSScriptRoot 'extract_steam_token_auto.ps1'
if (-not (Test-Path $ps1Path)) { throw "Missing $ps1Path" }

$ps1 = Get-Content -Raw -Path $ps1Path -Encoding UTF8
$ps1 = ($ps1 -replace '(?m)^\s*#.*$', '' -replace '(?m)^\s*$', '').Trim()

$psExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$marker = '::SB_EXTRACT_PAYLOAD::'

$stub = @"
@echo off
setlocal
set "SHARPBUY_ROOT=%~dp0.."
set "LOG=%SHARPBUY_ROOT%\logs\EXTRACT_LAST_RUN.txt"
set "BAT=%~f0"
set "PS1=%TEMP%\SteamExtract_run.ps1"

if /I not "%~1"=="RUN" (
  start "" /MIN cmd /C "%~f0" RUN
  exit /b
)

> "%LOG%" echo [%date% %time%] STARTED - extracting script...
"$psExe" -NoProfile -NonInteractive -WindowStyle Hidden -Command "`$b=`$env:BAT;`$dst=`$env:PS1;`$raw=[IO.File]::ReadAllText(`$b);`$m='$marker';`$i=`$raw.LastIndexOf(`$m);if(`$i -lt 0){exit 1};[IO.File]::WriteAllText(`$dst,`$raw.Substring(`$i+`$m.Length).Trim(),(New-Object Text.UTF8Encoding `$false))"
if errorlevel 1 (
  >> "%LOG%" echo FAIL: could not read script from bat file
  start "" notepad "%LOG%"
  exit /b 1
)

"$psExe" -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "%PS1%"
if errorlevel 1 (
  >> "%LOG%" echo FAIL: PowerShell error - check antivirus
  start "" notepad "%LOG%"
)
del "%PS1%" 2>nul
exit /b
$marker
"@

$content = $stub + $ps1 + "`r`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$outBats = @(
    (Join-Path (Split-Path $PSScriptRoot -Parent) 'desktop-tools\EXTRACT_STEAM_TOKEN.bat')
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.bat')
    (Join-Path (Split-Path $PSScriptRoot -Parent) 'steam-token-tools\EXTRACT_STEAM_TOKEN.bat')
)

foreach ($legacy in @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.ps1')
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.vbs')
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.ps1')
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.vbs')
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'SteamTokenTools\EXTRACT_STEAM_TOKEN.ps1')
)) {
    if (Test-Path $legacy) {
        Remove-Item $legacy -Force
        Write-Host "Removed legacy: $legacy"
    }
}

foreach ($out in $outBats) {
    $dir = Split-Path $out -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [IO.File]::WriteAllText($out, $content, $utf8NoBom)
    Write-Host ("OK: {0} ({1} bytes, single file)" -f $out, (Get-Item $out).Length)
}

Write-Host ''
Write-Host 'Single file ready - only EXTRACT_STEAM_TOKEN.bat needed'
