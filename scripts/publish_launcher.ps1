# Build SharpBuy Launcher -> build/launcher and update public download
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root 'build\launcher'
$csproj = Join-Path $root 'src\launcher\SharpBuy_Launcher\SharpBuy_Launcher.csproj'

dotnet publish $csproj -c Release -o $out
Copy-Item (Join-Path $out 'SharpBuy_NFA.exe') (Join-Path $root 'public\SharpBuy_Launcher.exe') -Force
Write-Host "Done: build/launcher/SharpBuy_NFA.exe + public/SharpBuy_Launcher.exe"
